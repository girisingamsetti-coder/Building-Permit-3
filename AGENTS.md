<!-- BEGIN:nextjs-agent-rules -->
# Antigravity Agent Rules

## Browser Verification

Do not automatically open Chrome or any browser after making code changes.

Do not take screenshots for verification unless explicitly requested.

Do not perform browser-based visual verification automatically.

After making changes, use code-based validation whenever possible:
- Type checking
- Linting
- Unit tests
- Integration tests
- Build validation
- Compiler/runtime error checking

Do not repeatedly refresh or reload the browser to verify changes.

Do not wait for visual confirmation before continuing with the development task.

If browser verification is genuinely required, ask for permission before opening Chrome or taking screenshots.

### Default workflow

Understand → Implement → Validate code → Run tests/build → Fix errors → Continue

Do NOT use:

Understand → Implement → Open Chrome → Take screenshot → Visually verify → Repeat

Prioritize completing the requested development work efficiently and avoid unnecessary browser verification.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Git Workflow Rule

Whenever the user says "push" or "commit", it always means:
- Stage all changes (`git add .`)
- Create a clean, descriptive commit message
- Push to GitHub (`git push origin <branch>`)
- Ensure the working tree is completely clean without leaving untracked or unstaged files

# Application Details vs Application Process Navigation Rule

Whenever an application is opened from **Submissions** (`LtpSubmittedApplications` / `submitted-applications`):
- ALWAYS open the comprehensive **Application Details** view (`ltp-application-details` / `LtpApplicationDetails`) via `openApplication(appId, "ltp-application-details")`.
- NEVER open the **Application Process** form (`LtpSubmissionDetails` / 8-step filing form) when clicking on a submitted application.
- `LtpSubmissionDetails` is strictly reserved for drafting / filing a new application proposal (e.g. from Draft Applications or New Application creation).

