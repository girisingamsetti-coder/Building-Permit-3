#!/bin/bash
# ============================================================
# Stable dev server runner with auto-restart on crash (incl. OOM)
# - Caps Node memory at 1 GB to stay under container limits
# - Restarts automatically if the process dies
# - Logs all restarts to dev.log
# ============================================================
cd /home/z/my-project

MAX_RESTARTS=20
RESTART_COUNT=0
LOG=dev.log

echo "[$(date '+%H:%M:%S')] Starting stable dev server (memory capped at 1GB, auto-restart enabled)..." > "$LOG"

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
  echo "[$(date '+%H:%M:%S')] === Server start attempt $((RESTART_COUNT+1))/$MAX_RESTARTS ===" >> "$LOG"

  # Run next dev with memory cap. We do NOT use --turbopack (memory hungry).
  # tee so output goes to both terminal and log.
  NODE_OPTIONS='--max-old-space-size=1024' exec node node_modules/next/dist/bin/next dev -p 3000 2>&1 | tee -a "$LOG"

  EXIT_CODE=${PIPESTATUS[0]}
  echo "[$(date '+%H:%M:%S')] !!! Server exited with code $EXIT_CODE. Restarting in 3s..." >> "$LOG"
  sleep 3
  RESTART_COUNT=$((RESTART_COUNT+1))
done

echo "[$(date '+%H:%M:%S')] Max restarts ($MAX_RESTARTS) reached. Stopping." >> "$LOG"
