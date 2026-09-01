# Development Guide

## Overview

| Item | Value |
|---|---|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Runtime | bun (package manager + script runner) |
| Dev command | `bun run dev` (or `npm run dev`) |
| Dev host | `0.0.0.0` |
| Dev port | `3000` |
| Build command | `bun run build` |
| Production start | `bun run start` (standalone server) |
| Dev log | `dev.log` (project root) |

## Quick Start

```bash
bun install        # install dependencies (idempotent)
bun run dev        # start the dev server on 0.0.0.0:3000
```

Open the preview panel — it connects through the platform gateway to
`0.0.0.0:3000`.

## Server Lifecycle (Sandbox / Z.ai Preview)

The dev server is **supervised** by `.zscripts/dev.sh` — the platform's
supported dev-server hook, executed automatically by `/start.sh` at
container boot.

The supervisor guarantees:

1. **Starts the server** if nothing is listening on port 3000.
2. **Restarts the server** automatically if it exits (crash, OOM, kill).
3. **Single instance** — an `flock` lock prevents duplicate supervisors,
   and a port health-check prevents duplicate dev servers
   (no `EADDRINUSE` races at boot).
4. **Logs** to `dev.log` in the project root.

Manual operations:

```bash
# Start the supervisor now (daemonized; survives shell exit)
setsid --fork bash .zscripts/dev.sh

# Check status
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/

# Stop everything (supervisor + dev server)
pkill -TERM -f "zscripts/dev.sh" && pkill -TERM -f "next dev"
```

## Memory Notes

The sandbox has a 4 GB memory limit. The dev script caps the Node.js
heap at 1 GB:

```
NODE_OPTIONS='--max-old-space-size=1024' next dev -H 0.0.0.0 -p 3000
```

If you need to run memory-heavy tooling (e.g. `tsc`, `next build`),
stop the dev server first, run the heavy command, then relaunch the
supervisor. The supervisor will restart the server automatically.

## Build & Production Preview

```bash
bun run build      # production build (.next/standalone)
bun run start      # serve the standalone build on 0.0.0.0:3000
```

## Lint & Type Check

```bash
bun run lint       # ESLint (currently 0 errors, 0 warnings)
npx tsc --noEmit   # TypeScript check (currently 0 errors)
```
