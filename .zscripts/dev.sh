#!/bin/bash
# ============================================================
# Z.ai platform custom dev script — SUPERVISING EDITION
#
# /start.sh executes this at container boot when it exists.
# It supervises the Next.js dev server on 0.0.0.0:3000:
#   - starts `bun run dev` if nothing is serving
#   - restarts it if it exits (crash / OOM / kill)
#   - never starts a duplicate (flock + port check)
# Manual start (survives shell exit — re-parents to PID 1):
#   setsid --fork bash /home/z/my-project/.zscripts/dev.sh
# ============================================================

set -u  # deliberately no -e: the supervisor must survive step failures

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_DIR/dev.log"
PORT=3000
LOCK_FILE="$SCRIPT_DIR/.dev-supervisor.lock"
PID_FILE="$SCRIPT_DIR/dev-supervisor.pid"

log() { echo "[dev-supervisor $(date -u +%FT%TZ)] $*" >> "$LOG_FILE"; }

# single-instance lock
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "Another dev supervisor is already running. Exiting."
  exit 0
fi
echo $$ > "$PID_FILE"

# graceful shutdown
DEV_PID=""
shutdown() {
  log "supervisor stopping (signal received)"
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  exit 0
}
trap shutdown INT TERM

is_serving() {
  curl -s --connect-timeout 2 --max-time 5 -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null
}

cd "$PROJECT_DIR" || exit 1

log "===================================================="
log "supervisor starting (pid $$)"

# 1. dependencies (idempotent)
if ! command -v bun >/dev/null 2>&1; then
  log "ERROR: bun is not installed or not in PATH"
  exit 1
fi
log "running bun install (idempotent)"
bun install >> "$LOG_FILE" 2>&1 || log "WARNING: bun install failed (continuing)"

# 2. database schema (idempotent, tolerant)
if [ -f "prisma/schema.prisma" ]; then
  log "running bun run db:push (idempotent)"
  bun run db:push >> "$LOG_FILE" 2>&1 || log "WARNING: db:push failed (continuing)"
fi

# 3. mini-services
start_mini_services() {
  local mini_services_dir="$PROJECT_DIR/mini-services"
  [ -d "$mini_services_dir" ] || return 0
  for service_dir in "$mini_services_dir"/*; do
    [ -d "$service_dir" ] || continue
    [ -f "$service_dir/package.json" ] || continue
    grep -q '"dev"' "$service_dir/package.json" || continue
    local service_name
    service_name=$(basename "$service_dir")
    log "starting mini-service: $service_name"
    (
      cd "$service_dir"
      bun install
      exec bun run dev
    ) >> "$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &
  done
}
start_mini_services

# 4. supervision loop
log "entering supervision loop (port $PORT)"
RESTART_BACKOFF=5

while true; do
  if is_serving; then
    sleep 10
    continue
  fi

  log "no server on port $PORT — starting: bun run dev"
  bun run dev >> "$LOG_FILE" 2>&1 &
  DEV_PID=$!
  log "dev server started (pid $DEV_PID), waiting for readiness"

  attempts=0
  while [ $attempts -lt 90 ]; do
    if is_serving; then
      log "dev server is serving on port $PORT (pid $DEV_PID)"
      break
    fi
    if ! kill -0 "$DEV_PID" 2>/dev/null; then
      log "dev server (pid $DEV_PID) exited before becoming ready"
      DEV_PID=""
      break
    fi
    sleep 2
    attempts=$((attempts + 1))
  done

  if [ -z "$DEV_PID" ]; then
    sleep "$RESTART_BACKOFF"
    continue
  fi

  if ! is_serving; then
    log "dev server (pid $DEV_PID) not ready after 180s — killing and retrying"
    kill "$DEV_PID" 2>/dev/null || true
    sleep "$RESTART_BACKOFF"
    continue
  fi

  # Server is healthy — block until it exits
  wait "$DEV_PID" 2>/dev/null
  rc=$?
  log "dev server (pid $DEV_PID) exited (rc=$rc). restarting in ${RESTART_BACKOFF}s"
  DEV_PID=""
  sleep "$RESTART_BACKOFF"
done
