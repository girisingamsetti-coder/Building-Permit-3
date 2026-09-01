Stage Summary:
- Complete stateful workflow engine: single source of truth in Zustand store
- All 22 workflow stages implemented with configurable routing
- TPS and TPA are separate roles with distinct actions
- Payment logic is consistent (paid=total, outstanding=0 on success)
- Every action creates audit entries + notifications + mock SMS logs
- 14 demo applications cover all 13 required scenarios
- All dates are 2026
- Role-based access enforced: officers see only assigned apps, LTP sees only own apps
- Shortfall lifecycle: OPEN→RESPONDED→UNDER_REVIEW→RESOLVED/REOPENED
- Officer review workspace has role-aware action bar driven by getAllowedActions()

---
Task ID: 11
Agent: main
Task: Redesign ONLY the login page with new branding (LTP Approval / Building Permit Management System)

Work Log:
- Replaced all "Municipal Authority" / "Directorate of Town & Country Planning" branding on the login page with "LTP Approval" / "Building Permit Management System"
- Updated browser/page title in layout.tsx metadata to "LTP Approval — Building Permit Management System"
- Redesigned LoginForm component:
  - LEFT panel (desktop): restrained government-style branding with deep emerald sidebar bg, subtle grid pattern, "Digital Government Service" label, "Online Building Permit Application & Approval Portal" heading, minimal supporting text, small footer "LTP Approval · Building Permit Management System · © 2026"
  - RIGHT panel: clean centered login card (max-w-400px) with "Welcome back" / "Sign in to your account to continue." header
  - Form: Email/Mobile Number input, Password input with show/hide toggle, Remember me checkbox, Forgot password? link, Sign In button with loading state
  - Inline validation: "Please enter your registered email address." / "Please enter your password." / "Incorrect email or password."
  - Security messaging: "Secure access to the Building Permit Management System" (no false SSL/PCI claims)
  - Demo / Development Access: compact Select dropdown with all 10 roles (LTP, TPS, TPA, ZAD, ZDD, ZJD, Director–DP, Addl. Commissioner, Commissioner, Admin). Selecting a role populates credentials + shows "Sign in as [Role]" button. Clearly labelled as demo, not primary login.
  - Footer: "LTP Approval · Building Permit Management System · © 2026"
- Mobile: removed split-screen, compact branding header at top (deep emerald bar with logo), login card immediately below, full-width buttons, demo access collapsed
- Preserved: authentication logic, login validation, forgot password flow, OTP flow, demo role functionality, role switching, routing, existing internal portal pages, design system (colors, typography, components)
- Did NOT modify: sidebar, app-shell footer, topbar, any internal dashboard/application UI

Self-Verification (Agent Browser):
- Browser title: "LTP Approval — Building Permit Management System" ✓
- Login page: "Welcome back" / "Sign in to your account to continue." ✓
- Left panel: "LTP Approval" / "Building Permit Management System" / "Digital Government Service" / "Online Building Permit Application & Approval Portal" ✓
- Form: Email/Mobile Number, Password (with eye toggle), Remember me, Forgot password?, Sign In button ✓
- Demo role dropdown: all 10 roles available, selecting populates credentials, "Sign in as [Role]" button works ✓
- Regular Sign In: loads LTP dashboard with toast "Welcome back — You have signed in to LTP Approval." ✓
- Forgot password: opens reset flow with OTP ✓
- Mobile (390x844): compact branding header, login card, full-width form, no split-screen ✓
- No console/runtime errors ✓
- Lint: 0 errors, 0 warnings ✓

Stage Summary:
- Only the login page (auth-screen.tsx) and browser title (layout.tsx metadata) were modified
- New branding: "LTP Approval" / "Building Permit Management System" throughout login
- Clean, minimal, government digital-service design (deep green + subtle saffron accent, no excessive gradients/graphics)
- Compact demo role dropdown replaces the previous 6 large role cards
- All existing functionality preserved: auth, demo roles, forgot password, OTP, routing

---
Task ID: 24
Agent: main
Task: Fix the development server permanently (re-application after container restart reverted the previous supervisor fix).

DIAGNOSIS:
- The supervising .zscripts/dev.sh written in Task 16 was reverted to the old unsupervised version by a container restart (the platform's /start.sh restores project files from a build archive at boot).
- The old dev.sh has no crash-restart, no flock single-instance, and a `trap cleanup EXIT` that kills the server on script exit.
- Current state: supervisor DEAD, next dev alive but hung (HTTP 000 — listening on 3000 but not serving). Root cause: supervisor was OOM-killed during a heavy task, leaving an orphaned/hung dev server with nothing to restart it.

FIX (re-applied):
1. .zscripts/dev.sh — rewrote as supervising dev script (flock single-instance, restart-on-crash loop, idempotent bun install + db:push, mini-services, no trap-kills-server, logs to dev.log).
2. next.config.ts — re-added `allowedDevOrigins: ["localhost", "127.0.0.1"]` (also lost in the restart).
3. DEVELOPMENT.md — re-created with authoritative server configuration.
4. Launched the supervisor via `setsid --fork` (re-parents to PID 1, survives command/task end — proven in Task 16).

VERIFICATION:
- Server starts: HTTP 200 on 0.0.0.0:3000 ✓
- Cross-command persistence: supervisor + server ALIVE in subsequent Bash commands ✓
- Crash recovery: SIGKILL'd the server → supervisor auto-restarted it in ~9s → HTTP 200 ✓
- App renders: browser shows login/dashboard ✓
- Post-config-change: HMR picks up next.config.ts change, server stays alive ✓
- Lint: 0 errors/0 warnings ✓

Root cause of previous issue: supervisor script reverted by container restart → no supervision → hung server with no recovery.
Files changed: .zscripts/dev.sh, next.config.ts, DEVELOPMENT.md.
