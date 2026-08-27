# Task 8 — LTP Views Updater

## Scope
Updated 9 LTP portal view components to consume the rewritten mutable Zustand store (`@/store/app-store`) instead of the static `APPLICATIONS` / `NOTIFICATIONS` / `resolveShortfallList` imports from `@/data/mock-data`. All views now drive off live store state and call store actions to transition application state.

## Files updated
1. `src/components/ltp/ltp-dashboard.tsx` — `LtpDashboard`
2. `src/components/ltp/ltp-applications.tsx` — `LtpApplications`
3. `src/components/ltp/ltp-create-application.tsx` — `LtpCreateApplication`
4. `src/components/ltp/ltp-application-details.tsx` — `LtpApplicationDetails` (+ StatusBanner)
5. `src/components/ltp/ltp-drawings.tsx` — `LtpDrawings` (+ `LtpScrutiny`, `DrawingStatusBanner`)
6. `src/components/ltp/ltp-documents.tsx` — `LtpDocuments`
7. `src/components/ltp/ltp-fees.tsx` — `LtpFees`, `LtpPayment`, `LtpReceipt`
8. `src/components/ltp/ltp-shortfalls.tsx` — `LtpShortfalls`
9. `src/components/ltp/ltp-notifications.tsx` — `LtpNotifications`

## Key changes
- All `APPLICATIONS` / `resolveShortfallList` / `NOTIFICATIONS` imports from `@/data/mock-data` were removed.
- LTP dashboard, applications, drawings, documents, fees now source data via `useVisibleApplications()` (and `useSelectedApplication()` where appropriate).
- Dashboard stat-card filters:
  - "Under Review" → apps with status in `[TPS_TECHNICAL_SCRUTINY, TPA_REVIEW, ZAD_ZDD_REVIEW, ZJD_REVIEW, DIRECTOR_DP_REVIEW, ADDITIONAL_COMMISSIONER_REVIEW, COMMISSIONER_REVIEW]`
  - "Action Required" → apps with status in `[SCRUTINY_FAILED, SHORTFALL_RAISED, PAYMENT_PENDING, DOCUMENT_UPLOAD_PENDING, DRAWING_REUPLOAD_REQUIRED]`
  - Showcase app prefers `TPS_TECHNICAL_SCRUTINY` or `TPA_REVIEW`.
- `LtpApplications` STATUS_FILTERS replaced with new lifecycle statuses (DRAFT, SCRUTINY_FAILED, DOCUMENT_UPLOAD_PENDING, PAYMENT_PENDING, TPS_TECHNICAL_SCRUTINY, TPA_REVIEW, ZAD_ZDD_REVIEW, ZJD_REVIEW, SHORTFALL_RAISED, APPROVED).
- `LtpCreateApplication` now calls `createApplication(data)` from the store, captures the returned `id`, looks up the real generated `applicationNo` (format `MC/BP/2026/04/00XX`) from `useAppStore.getState().applications`, displays it in the success screen, and uses `openApplication(newId, "ltp-drawings")` for the post-submit navigation.
- `LtpApplicationDetails` StatusBanner config extended to handle `DRAWING_REUPLOAD_REQUIRED`, `DOCUMENT_UPLOAD_PENDING`, `PAYMENT_SUCCESS`, `REJECTED`, `RETURNED`; the Quick Stats "Fee Paid" check was corrected from `"SUCCESSFUL"` → `"SUCCESS"` (matching the `PaymentStatus` union).
- `LtpDrawings` now wires:
  - `FileUploader.onUpload` → `uploadDrawing(appId, fileName, fileSize)`
  - "Run Auto-Scrutiny" → `runScrutiny(appId)` with a spinner driven by `processingAppIds.includes(appId)`
  - "Re-upload Drawing" → `reuploadDrawing(appId, fileName, fileSize)` then `runScrutiny(appId)` after a short delay (matches the store's deterministic v1-fails-v2-passes scrutiny behaviour)
  - `DrawingStatusBanner` reflects all drawing states: PENDING_SCRUTINY, SCRUTINY_IN_PROGRESS, SCRUTINY_PASSED, SCRUTINY_FAILED.
- `LtpDocuments` Upload button now calls `uploadDocument(appId, docCode, fileName, fileSize)` (simulating file selection) — works for `REQUIRED`, `SHORTFALL`, and `REJECTED` documents.
- `LtpFees`: when there's no fee yet, renders a context-aware pending state ("Documents under verification", "Upload drawings & documents first", or generic pending) instead of a generic empty state. Existing invoice-style breakdown retained when `app.fee` exists.
- `LtpPayment`:
  - Calls `initiatePayment(appId, method)` (store action) which transitions `PROCESSING → SUCCESS` after ~2.8 s and auto-advances the app to `TPS_TECHNICAL_SCRUTINY`.
  - Local `stage` state is synced to the store via a `useEffect` watching `paymentStatus` and `processingAppIds`, so when the store auto-advances the view flips to the success screen automatically.
  - Added a "Demo mode — no real payment" badge on the PageHeader.
  - The success card now also displays `fee.paidAmount` and `fee.outstanding` (which after SUCCESS read as `total` and `0` respectively).
  - Stage resets on app switch via a `useEffect` keyed on `appId`.
- `LtpReceipt`: only renders when `app.payment?.status === "SUCCESS"` (was `"SUCCESSFUL"`).
- `LtpShortfalls`:
  - Reads from `useAllShortfalls()` selector (each item carries the parent `application`).
  - "Respond" button calls `respondToShortfall(appId, shortfallId, responseText, supportingDoc?)` (passes `files[0]?.name` as supporting doc).
  - Detail drawer shows full status (OPEN, RESPONDED, UNDER_REVIEW, RESOLVED, REOPENED, OVERDUE) and response/resolution blocks.
  - "Respond" CTA is enabled for both `OPEN` and `REOPENED`.
  - Status filter dropdown extended with `UNDER_REVIEW` and `REOPENED`.
- `LtpNotifications`:
  - Reads `notifications` and `smsLogs` from the store.
  - `NOTIF_META` extended with the missing `DOCUMENT_VERIFIED`, `SHORTFALL_RESPONDED`, `SHORTFALL_RESOLVED`, `APPLICATION_REJECTED` types (so `Record<NotificationType, …>` is satisfied).
  - SMS log table now iterates `smsLogs` (template code, recipient, application no, status, sent/delivered timestamps) instead of filtering notifications by `smsSent`.

## Visual design
- No visual design, colours, spacing, layout, or component structure changes — only data sources, status literals, and store-action wiring were touched. All existing design-system primitives (PageHeader, SectionCard, StatCard, InfoGrid, InfoRow, EmptyState, StatusBadge, PriorityBadge, RoleBadge, SeverityBadge, DocumentStatusBadge, PaymentStatusBadge, ShortfallStatusBadge, ShortfallTypeBadge, WorkflowStepper, WorkflowTimeline, AuditTimeline, StageStatusPill, formatINR/formatDate/formatDateTime/timeAgo, DrawingViewer, FileUploader, DocumentFileRow) were reused unchanged.

## Lint / TypeScript verification
- `bun run lint` → exit 0 (0 errors, 0 warnings).
- `npx tsc --noEmit` → 0 errors reported in any `src/components/ltp/*` file. (Pre-existing errors in `admin-fee-structures.tsx`, `admin-roles.tsx`, `admin-workflow.tsx`, `topbar.tsx`, `mock-data.ts`, `fee-service.ts`, `app-store.ts`, and the `examples/` & `skills/` folders are NOT in this task's scope and were left untouched.)

## Issues encountered / notes
- Removed unused `APPLICATIONS`, `ROLES` (where unused), and `resolveShortfallList` imports from the affected files.
- The `React.useEffect` syncing `stage` to store payment status in `LtpPayment` initially tripped the `react-hooks/rules-of-hooks` rule (called after an early return); moved it above the early return.
- `RadioGroup.onValueChange` provides a `string`; cast to `Payment["method"]` before storing to keep the typed state.
- `UploadedFile.size` is a `string` (e.g. `"1.2 MB"`), so we forward it as-is rather than reformatting from bytes.
- All 9 files remain `"use client"` components.

## Outcome
- All 9 LTP portal views now read from the live mutable store and drive state transitions through store actions. The store handles audit entries, notifications, and SMS logs automatically — views just call the action and show a toast.
