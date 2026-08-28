"use client";

import { create } from "zustand";
import { useMemo } from "react";
import type {
  Application,
  ApplicationStatus,
  ApplicationType,
  Applicant,
  AuditEntry,
  DocumentStatus,
  Drawing,
  NotificationRecord,
  Payment,
  Portal,
  ProjectInfo,
  Remark,
  RoleKey,
  ScrutinyCheck,
  ScrutinyReport,
  Shortfall,
  ShortfallType,
  SmsLog,
  User,
  ViewKey,
  WorkflowHistoryEntry,
  WorkflowStageKey,
} from "@/types";
import {
  SEED_APPLICATIONS,
  SEED_NOTIFICATIONS,
  SEED_SMS_LOGS,
  USERS,
  DEMO_CREDENTIALS,
  ROLES,
} from "@/data/mock-data";
import { WORKFLOW_STAGES, getStage, stageFromStatus } from "@/data/workflow-config";
import {
  canViewApplication,
  getAllowedActions,
  getAssignedOfficerForStage,
  portalForRole,
  computeProgress,
  rolesForStage,
} from "@/lib/permissions";
import { feeService } from "@/services/fee-service";
import { paymentService } from "@/services/payment-service";
import { NotificationFactory, createNotification } from "@/services/notification-service";

// Re-export for views
export { DEMO_CREDENTIALS, ROLES };
export function defaultViewForPortal(portal: Portal): ViewKey {
  if (portal === "LTP") return "ltp-dashboard";
  if (portal === "OFFICER") return "officer-dashboard";
  return "admin-dashboard";
}

function nowISO(): string {
  return new Date().toISOString();
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ============================================================
// STORE INTERFACE
// ============================================================
interface AppState {
  // auth
  user: User | null;
  isAuthenticated: boolean;
  authStage: "login" | "forgot" | "otp" | "authenticating";
  pendingEmail?: string;
  // routing
  view: ViewKey;
  portal: Portal;
  selectedApplicationId: string | null;
  // data — SINGLE SOURCE OF TRUTH
  applications: Application[];
  notifications: NotificationRecord[];
  smsLogs: SmsLog[];
  // sidebar
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  theme: "light" | "dark";
  // processing flags
  processingAppIds: string[]; // apps currently being processed (scrutiny/payment)
  // navigation history (for smart back button)
  viewHistory: ViewKey[];

  // ---- auth actions ----
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAsRole: (role: RoleKey) => void;
  logout: () => void;
  setAuthStage: (s: AppState["authStage"]) => void;
  setPendingEmail: (e: string) => void;

  // ---- navigation ----
  navigate: (view: ViewKey) => void;
  openApplication: (id: string, view?: ViewKey) => void;
  goBack: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
  toggleTheme: () => void;

  // ---- application lifecycle (LTP) ----
  createApplication: (data: {
    applicationType: ApplicationType;
    propertyType: ProjectInfo["propertyType"];
    projectName: string;
    applicantName: string;
    applicantContact: string;
    applicantEmail: string;
    applicantAddress: string;
    plotArea: number;
    builtUpArea: number;
    landUse: string;
    ward: string;
    zone: string;
    surveyNo: string;
    address: string;
    drawingFileName?: string;
    drawingFileSize?: string;
    uploadedDocCodes?: string[];
  }) => string;

  uploadDrawing: (appId: string, fileName: string, fileSize: string) => void;
  runScrutiny: (appId: string) => void;
  reuploadDrawing: (appId: string, fileName: string, fileSize: string) => void;

  uploadDocument: (appId: string, docCode: string, fileName: string, fileSize: string) => void;

  generateFee: (appId: string) => void;

  initiatePayment: (appId: string, method: Payment["method"]) => void;

  respondToShortfall: (appId: string, shortfallId: string, responseText: string, supportingDoc?: string) => void;

  // ---- officer workflow actions ----
  forwardApplication: (appId: string, remarks: string) => void;
  approveApplication: (appId: string, remarks: string) => void;
  rejectApplication: (appId: string, remarks: string) => void;
  returnApplication: (appId: string, remarks: string) => void;
  submitTechnicalScrutiny: (appId: string, remarks: string) => void;

  raiseShortfall: (appId: string, data: { type: ShortfallType; title: string; description: string; dueDate: string }) => void;
  reviewShortfallResponse: (appId: string, shortfallId: string) => void;
  resolveShortfall: (appId: string, shortfallId: string, resolution: string) => void;
  reopenShortfall: (appId: string, shortfallId: string, reason: string) => void;

  // officer document actions
  verifyDocument: (appId: string, docId: string) => void;
  rejectDocument: (appId: string, docId: string, reason: string) => void;

  addRemark: (appId: string, text: string, type: Remark["type"]) => void;

  // ---- notifications ----
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

// ============================================================
// INTERNAL HELPERS — update application immutably + side effects
// ============================================================
function updateApp(
  apps: Application[],
  appId: string,
  updater: (app: Application) => Application
): Application[] {
  return apps.map((a) => (a.id === appId ? updater(a) : a));
}

function addAudit(app: Application, entry: Omit<AuditEntry, "id" | "timestamp" | "entity" | "entityId">): Application {
  const audit: AuditEntry = {
    ...entry,
    id: genId("audit"),
    entity: "Application",
    entityId: app.applicationNo,
    timestamp: nowISO(),
  };
  return { ...app, auditLog: [...app.auditLog, audit] };
}

function addWorkflowHistory(
  app: Application,
  stage: WorkflowStageKey,
  actor: { name: string; role: RoleKey },
  action: string,
  remarks?: string,
  status: WorkflowHistoryEntry["status"] = "COMPLETED"
): Application {
  const entry: WorkflowHistoryEntry = {
    id: genId("wf"),
    stage,
    stageLabel: getStage(stage)?.label ?? stage,
    actor,
    action,
    remarks,
    timestamp: nowISO(),
    status,
  };
  return { ...app, workflowHistory: [...app.workflowHistory, entry] };
}

function setAppStatus(app: Application, status: ApplicationStatus, stage?: WorkflowStageKey): Application {
  const newStage = stage ?? stageFromStatus(status);
  const stageInfo = getStage(newStage);
  return {
    ...app,
    status,
    currentStage: newStage,
    currentStageLabel: stageInfo?.label ?? app.currentStageLabel,
    lastUpdated: nowISO(),
    progress: computeProgress(status, newStage),
  };
}

// ============================================================
// STORE IMPLEMENTATION
// ============================================================
export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  authStage: "login",
  pendingEmail: undefined,
  view: "login",
  portal: "LTP",
  selectedApplicationId: null,
  applications: SEED_APPLICATIONS,
  notifications: SEED_NOTIFICATIONS,
  smsLogs: SEED_SMS_LOGS,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  theme: "light",
  processingAppIds: [],
  viewHistory: [],

  // ---- AUTH ----
  login: (email, password) => {
    const cred = DEMO_CREDENTIALS.find((c) => c.email === email.trim().toLowerCase());
    if (!cred) return { ok: false, error: "No account found with this email." };
    if (password !== cred.password) return { ok: false, error: "Incorrect password. Please try again." };
    const user = USERS.find((u) => u.role === cred.role)!;
    const portal = portalForRole(cred.role);
    set({ user, isAuthenticated: true, authStage: "login", view: defaultViewForPortal(portal), portal, viewHistory: [] });
    return { ok: true };
  },

  loginAsRole: (role) => {
    const user = USERS.find((u) => u.role === role)!;
    const portal = portalForRole(role);
    set({ user, isAuthenticated: true, authStage: "login", view: defaultViewForPortal(portal), portal, viewHistory: [] });
  },

  logout: () =>
    set({ user: null, isAuthenticated: false, authStage: "login", view: "login", selectedApplicationId: null, mobileNavOpen: false, viewHistory: [] }),

  setAuthStage: (authStage) => set({ authStage }),
  setPendingEmail: (pendingEmail) => set({ pendingEmail }),

  // ---- NAVIGATION ----
  navigate: (view) => set((s) => ({ view, mobileNavOpen: false, viewHistory: [...s.viewHistory, s.view].slice(-20) })),
  openApplication: (id, view) => set((s) => ({
    selectedApplicationId: id,
    view: view ?? "ltp-application-details",
    mobileNavOpen: false,
    viewHistory: [...s.viewHistory, s.view].slice(-20),
  })),
  goBack: () => set((s) => {
    if (s.viewHistory.length === 0) return {};
    const history = [...s.viewHistory];
    const previous = history.pop()!;
    return { view: previous, viewHistory: history, mobileNavOpen: false };
  }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

  // ---- APPLICATION LIFECYCLE ----
  createApplication: (data) => {
    const user = get().user!;
    const id = genId("app");
    const seq = String(get().applications.length + 1).padStart(4, "0");
    const applicationNo = `MC/BP/2026/04/${seq}`;
    const now = nowISO();

    // Build drawings array if a drawing was uploaded in the wizard
    const drawings: Drawing[] = data.drawingFileName
      ? [{
          id: genId("dw"),
          fileName: data.drawingFileName,
          fileType: "DWG" as const,
          fileSize: data.drawingFileSize ?? "0 MB",
          version: 1,
          uploadedAt: now,
          uploadedBy: user.name,
          status: "PENDING_SCRUTINY" as const,
        }]
      : [];

    // Build documents array, marking uploaded docs as UPLOADED
    const baseDocs = [
      { id: genId("doc"), name: "7/12 Land Extract", code: "DOC_712", required: true },
      { id: genId("doc"), name: "Property Card / Mutation", code: "DOC_PROP_CARD", required: true },
      { id: genId("doc"), name: "Architectural Drawings (stamped)", code: "DOC_ARCH", required: true },
      { id: genId("doc"), name: "Structural Drawings & Stability Certificate", code: "DOC_STRUCT", required: true },
      { id: genId("doc"), name: "NOC from Fire Department", code: "DOC_FIRE_NOC", required: true },
      { id: genId("doc"), name: "Environmental Clearance", code: "DOC_ENV", required: false },
      { id: genId("doc"), name: "Society / Landowner Authorization", code: "DOC_AUTH", required: true },
      { id: genId("doc"), name: "Affidavit — Ownership", code: "DOC_AFFIDAVIT", required: true },
    ];
    const uploadedCodes = data.uploadedDocCodes ?? [];
    const documents = baseDocs.map((d) => ({
      ...d,
      status: (uploadedCodes.includes(d.code) ? "UPLOADED" : "REQUIRED") as DocumentStatus,
      ...(uploadedCodes.includes(d.code) ? { uploadedAt: now, version: 1, fileSize: "1.2 MB" } : {}),
    }));

    // Determine initial status: if drawing uploaded → DRAWING_UPLOADED, else DRAFT
    const initialStatus: ApplicationStatus = drawings.length > 0 ? "DRAWING_UPLOADED" : "DRAFT";
    const initialStage: WorkflowStageKey = drawings.length > 0 ? "DRAWING_SCRUTINY" : "APPLICATION_CREATED";

    const app: Application = {
      id,
      applicationNo,
      applicant: { name: data.applicantName, contact: data.applicantContact, email: data.applicantEmail, address: data.applicantAddress },
      ltpId: user.id,
      ltpName: user.name,
      project: {
        name: data.projectName,
        type: data.applicationType,
        propertyType: data.propertyType,
        plotArea: data.plotArea,
        builtUpArea: data.builtUpArea,
        landUse: data.landUse,
        ward: data.ward,
        zone: data.zone,
        surveyNo: data.surveyNo,
        address: data.address,
      },
      status: initialStatus,
      currentStage: initialStage,
      currentStageLabel: drawings.length > 0 ? "Drawing Scrutiny" : "Application Created",
      submissionDate: now,
      lastUpdated: now,
      expectedSLA: new Date(Date.now() + 30 * 86400000).toISOString(),
      priority: data.builtUpArea > 5000 ? "HIGH" : "NORMAL",
      progress: drawings.length > 0 ? 8 : 0,
      drawings,
      documents,
      shortfalls: [],
      workflowHistory: [{
        id: genId("wf"),
        stage: "APPLICATION_CREATED",
        stageLabel: "Application Created",
        actor: { name: user.name, role: user.role },
        action: "Application created",
        timestamp: now,
        status: "COMPLETED",
      }, ...(drawings.length > 0 ? [{
        id: genId("wf"),
        stage: "DRAWING_SCRUTINY" as WorkflowStageKey,
        stageLabel: "Drawing Scrutiny",
        actor: { name: user.name, role: user.role },
        action: "Drawing v1 uploaded — awaiting scrutiny",
        timestamp: now,
        status: "CURRENT" as const,
      }] : [])],
      auditLog: [{
        id: genId("audit"),
        user: user.name,
        role: user.role,
        action: "Application created",
        entity: "Application",
        entityId: applicationNo,
        timestamp: now,
        newStatus: initialStatus,
        ip: "103.21.58.10",
        device: "Chrome / Windows",
      }, ...(drawings.length > 0 ? [{
        id: genId("audit"),
        user: user.name,
        role: user.role,
        action: "Drawing v1 uploaded",
        entity: "Drawing",
        entityId: applicationNo,
        timestamp: now,
        oldStatus: "DRAFT",
        newStatus: "DRAWING_UPLOADED",
        ip: "103.21.58.10",
        device: "Chrome / Windows",
      }] : [])],
      remarks: [],
    };

    // Side effects: notification + SMS
    const { notification, smsLog } = NotificationFactory.applicationSubmitted(app);
    set((s) => ({
      applications: [app, ...s.applications],
      notifications: [notification, ...s.notifications],
      smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs,
    }));
    return id;
  },

  uploadDrawing: (appId, fileName, fileSize) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const version = app.drawings.length + 1;
        const drawing = {
          id: genId("dw"),
          fileName,
          fileType: "DWG" as const,
          fileSize,
          version,
          uploadedAt: nowISO(),
          uploadedBy: user.name,
          status: "PENDING_SCRUTINY" as const,
        };
        let updated: Application = { ...app, drawings: [...app.drawings, drawing] };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Drawing v${version} uploaded`, oldStatus: app.status, newStatus: "DRAWING_UPLOADED" });
        updated = setAppStatus(updated, "DRAWING_UPLOADED");
        return updated;
      }),
    }));
  },

  runScrutiny: (appId) => {
    const user = get().user!;
    // Mark as processing
    set((s) => ({ processingAppIds: [...s.processingAppIds, appId] }));
    // Set SCRUTINY_IN_PROGRESS
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const latest = app.drawings[app.drawings.length - 1];
        let updated: Application = { ...app, drawings: app.drawings.map((d) => d.id === latest.id ? { ...d, status: "SCRUTINY_IN_PROGRESS" as const } : d) };
        updated = addAudit(updated, { user: "System", role: "TPS", action: `Auto-scrutiny started (v${latest.version})`, oldStatus: app.status, newStatus: "SCRUTINY_IN_PROGRESS" });
        updated = setAppStatus(updated, "SCRUTINY_IN_PROGRESS");
        return updated;
      }),
    }));
    // After 2.5s, complete scrutiny
    setTimeout(() => {
      set((s) => ({
        applications: updateApp(s.applications, appId, (app) => {
          const latest = app.drawings[app.drawings.length - 1];
          // Deterministic: v1 fails, v2+ passes (so LTP experiences fail→reupload→pass)
          const passed = latest.version >= 2;
          const report = buildScrutinyResult(latest.version, passed);
          let updated: Application = { ...app, scrutinyReport: report };
          updated = { ...updated, drawings: updated.drawings.map((d) => d.id === latest.id ? { ...d, status: passed ? "SCRUTINY_PASSED" as const : "SCRUTINY_FAILED" as const } : d) };
          const newStatus = passed ? "SCRUTINY_PASSED" : "SCRUTINY_FAILED";
          updated = addAudit(updated, { user: "System", role: "TPS", action: `Auto-scrutiny ${passed ? "passed" : "failed"} (v${latest.version})`, oldStatus: app.status, newStatus });
          if (passed) {
            updated = addWorkflowHistory(updated, "DRAWING_SCRUTINY", { name: "System (Auto-Scrutiny)", role: "TPS" }, "Scrutiny passed", report.summary, "COMPLETED");
          } else {
            updated = addWorkflowHistory(updated, "DRAWING_SCRUTINY", { name: "System (Auto-Scrutiny)", role: "TPS" }, "Scrutiny failed — re-upload required", report.summary, "FAILED");
          }
          updated = setAppStatus(updated, newStatus, passed ? "DOCUMENTS" : "DRAWING_SCRUTINY");
          return updated;
        }),
        processingAppIds: s.processingAppIds.filter((id) => id !== appId),
      }));
      // Side effects: notification + SMS
      const app = get().applications.find((a) => a.id === appId)!;
      const { notification, smsLog } = app.status === "SCRUTINY_PASSED"
        ? NotificationFactory.scrutinyPassed(app)
        : NotificationFactory.scrutinyFailed(app);
      set((s) => ({
        notifications: [notification, ...s.notifications],
        smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs,
      }));
    }, 2500);
  },

  reuploadDrawing: (appId, fileName, fileSize) => {
    get().uploadDrawing(appId, fileName, fileSize);
    // Mark old drawings as superseded
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const newVersion = app.drawings[app.drawings.length - 1];
        let updated: Application = { ...app, drawings: app.drawings.map((d) => d.version < newVersion.version && d.status !== "SUPERSEDED" ? { ...d, status: "SUPERSEDED" as const } : d) };
        const audit = { id: genId("audit"), user: get().user!.name, role: get().user!.role, action: `Drawing re-uploaded (v${newVersion.version})`, entity: "Application", entityId: app.applicationNo, timestamp: nowISO(), oldStatus: app.status, newStatus: "DRAWING_UPLOADED", ip: "103.21.58.10", device: "Chrome / Windows" };
        updated = { ...updated, auditLog: [...updated.auditLog, audit] };
        updated = setAppStatus(updated, "DRAWING_UPLOADED", "DRAWING_SCRUTINY");
        return updated;
      }),
    }));
  },

  uploadDocument: (appId, docCode, fileName, fileSize) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, documents: app.documents.map((d) => d.code === docCode ? { ...d, status: "UPLOADED" as const, uploadedAt: nowISO(), version: (d.version ?? 0) + 1, fileSize } : d) };
        // If all required docs uploaded, move to DOCUMENT_VERIFICATION
        const allUploaded = updated.documents.filter((d) => d.required).every((d) => d.status === "UPLOADED" || d.status === "VERIFIED");
        if (allUploaded && app.status === "DOCUMENT_UPLOAD_PENDING") {
          updated = addAudit(updated, { user: user.name, role: user.role, action: "All required documents uploaded", oldStatus: app.status, newStatus: "DOCUMENT_VERIFICATION" });
          updated = setAppStatus(updated, "DOCUMENT_VERIFICATION", "DOCUMENTS");
          // Assign to TPA for verification
          const tpa = USERS.find((u) => u.role === "TPA")!;
          updated = { ...updated, assignedOfficer: { name: tpa.name, role: tpa.role }, assignedAt: nowISO() };
        } else {
          updated = addAudit(updated, { user: user.name, role: user.role, action: `Document uploaded: ${docCode}` });
        }
        return updated;
      }),
    }));
  },

  generateFee: (appId) => {
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const docCount = app.documents.filter((d) => d.required).length;
        const result = feeService.calculate({
          applicationType: app.project.type,
          propertyType: app.project.propertyType,
          builtUpArea: app.project.builtUpArea,
          plotArea: app.project.plotArea,
          documentCount: docCount,
        });
        if (!result) return app;
        const fee = feeService.toApplicationFee(result, 0);
        let updated: Application = { ...app, fee };
        updated = addAudit(updated, { user: "System (Fee Engine)", role: "TPA", action: "Fee calculated", oldStatus: app.status, newStatus: "FEE_GENERATED" });
        updated = setAppStatus(updated, "FEE_GENERATED", "FEE_GENERATED");
        return updated;
      }),
    }));
    // Notification
    const app = get().applications.find((a) => a.id === appId)!;
    if (app.fee) {
      const { notification, smsLog } = NotificationFactory.feeGenerated(app);
      set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
    }
  },

  initiatePayment: (appId, method) => {
    const user = get().user!;
    // Set PAYMENT_PROCESSING
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        if (!app.fee) return app;
        const payment: Payment = {
          id: genId("pay"),
          transactionId: "",
          referenceNo: "",
          status: "PROCESSING",
          amount: app.fee.total,
          method,
          gateway: "Mock Payment Gateway (Demo)",
          initiatedAt: nowISO(),
          verified: false,
          isMock: true,
        };
        let updated: Application = { ...app, payment };
        updated = addAudit(updated, { user: user.name, role: user.role, action: "Payment initiated", oldStatus: app.status, newStatus: "PAYMENT_PROCESSING" });
        updated = setAppStatus(updated, "PAYMENT_PROCESSING", "PAYMENT");
        return updated;
      }),
      processingAppIds: [...s.processingAppIds, appId],
    }));
    // After 2.5s, verify payment (mock gateway)
    setTimeout(async () => {
      const app = get().applications.find((a) => a.id === appId)!;
      if (!app.payment) return;
      // Use mock payment service for verification
      const result = await paymentService.verifyPayment(app.payment.id);
      set((s) => ({
        applications: updateApp(s.applications, appId, (a) => {
          if (!a.payment || !a.fee) return a;
          if (result.verified) {
            // PAYMENT SUCCESS — paid = total, outstanding = 0 (CONSISTENCY ENFORCED)
            const updatedPayment: Payment = {
              ...a.payment,
              status: "SUCCESS",
              transactionId: result.transactionId,
              receiptNo: result.receiptNo,
              completedAt: result.completedAt,
              verified: true,
            };
            const updatedFee = { ...a.fee, paidAmount: a.fee.total, outstanding: 0 };
            let updated: Application = { ...a, payment: updatedPayment, fee: updatedFee };
            updated = addAudit(updated, { user: "Mock Payment Gateway", role: a.assignedOfficer?.role ?? "TPA", action: "Payment verified", oldStatus: a.status, newStatus: "PAYMENT_SUCCESS", remarks: `Txn: ${result.transactionId}` });
            updated = addWorkflowHistory(updated, "PAYMENT", { name: "Mock Payment Gateway", role: "TPA" }, "Payment received", `₹${a.fee.total.toLocaleString("en-IN")} via ${method}`, "COMPLETED");
            // Auto-advance to TPS_TECHNICAL_SCRUTINY
            const tps = USERS.find((u) => u.role === "TPS")!;
            updated = setAppStatus(updated, "TPS_TECHNICAL_SCRUTINY", "TPS_TECHNICAL_SCRUTINY");
            updated = { ...updated, assignedOfficer: { name: tps.name, role: tps.role }, assignedAt: nowISO() };
            updated = addWorkflowHistory(updated, "TPS_TECHNICAL_SCRUTINY", { name: tps.name, role: tps.role }, "Assigned to TPS for technical scrutiny", undefined, "CURRENT");
            return updated;
          } else {
            // PAYMENT FAILED
            const updatedPayment: Payment = { ...a.payment, status: "FAILED", completedAt: result.completedAt };
            let updated: Application = { ...a, payment: updatedPayment };
            updated = addAudit(updated, { user: "Mock Payment Gateway", role: "TPA", action: "Payment failed", oldStatus: a.status, newStatus: "PAYMENT_PENDING" });
            updated = setAppStatus(updated, "PAYMENT_PENDING", "PAYMENT");
            return updated;
          }
        }),
        processingAppIds: s.processingAppIds.filter((id) => id !== appId),
      }));
      // Notification
      const updatedApp = get().applications.find((a) => a.id === appId)!;
      const { notification, smsLog } = updatedApp.payment?.status === "SUCCESS"
        ? NotificationFactory.paymentSuccessful(updatedApp)
        : createNotification({ type: "SYSTEM", title: "Payment Failed", message: `Payment for ${updatedApp.applicationNo} failed. Please try again.`, applicationId: appId, applicationNo: updatedApp.applicationNo });
      set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
    }, 2800);
  },

  respondToShortfall: (appId, shortfallId, responseText, supportingDoc) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, shortfalls: app.shortfalls.map((sf) => sf.id === shortfallId ? { ...sf, status: "RESPONDED" as const, response: { text: responseText, respondedAt: nowISO(), supportingDocument: supportingDoc } } : sf) };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Shortfall responded: ${shortfallId}`, remarks: responseText });
        return updated;
      }),
    }));
    // Notification to officer
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.shortfallResponded(app, shortfallId);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  // ---- OFFICER WORKFLOW ----
  forwardApplication: (appId, remarks) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const currentStage = getStage(app.currentStage);
        const nextStageKey = currentStage?.nextStage;
        if (!nextStageKey) return app;
        const nextStage = getStage(nextStageKey)!;
        // Mark current as completed
        let updated: Application = { ...app, workflowHistory: app.workflowHistory.map((w) => w.stage === app.currentStage && w.status === "CURRENT" ? { ...w, status: "COMPLETED" as const } : w) };
        // Assign to next officer
        const nextOfficer = getAssignedOfficerForStage(nextStageKey, USERS);
        updated = { ...updated, assignedOfficer: nextOfficer, assignedAt: nowISO() };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Forwarded to ${nextStage.label}`, oldStatus: app.status, newStatus: statusForStage(nextStageKey), remarks });
        updated = addWorkflowHistory(updated, app.currentStage, { name: user.name, role: user.role }, `Forwarded to ${nextStage.label}`, remarks, "COMPLETED");
        // Set new status
        const newStatus = statusForStage(nextStageKey);
        updated = setAppStatus(updated, newStatus, nextStageKey);
        updated = addWorkflowHistory(updated, nextStageKey, nextOfficer ? { name: nextOfficer.name, role: nextOfficer.role } : { name: "System", role: "TPS" }, `Assigned to ${nextStage.label}`, undefined, "CURRENT");
        return updated;
      }),
    }));
    // Notification
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.applicationForwarded(app, app.currentStageLabel);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  approveApplication: (appId, remarks) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const currentStage = getStage(app.currentStage);
        // If at commissioner level → final approval
        if (app.currentStage === "COMMISSIONER_REVIEW") {
          let updated: Application = { ...app, workflowHistory: app.workflowHistory.map((w) => w.status === "CURRENT" ? { ...w, status: "COMPLETED" as const } : w) };
          updated = addAudit(updated, { user: user.name, role: user.role, action: "Application approved", oldStatus: app.status, newStatus: "APPROVED", remarks });
          updated = addWorkflowHistory(updated, "COMMISSIONER_REVIEW", { name: user.name, role: user.role }, "Application approved", remarks, "COMPLETED");
          updated = addWorkflowHistory(updated, "FINAL_DECISION", { name: user.name, role: user.role }, "Final approval granted", remarks, "COMPLETED");
          updated = setAppStatus(updated, "APPROVED", "FINAL_DECISION");
          updated = { ...updated, assignedOfficer: undefined, progress: 100 };
          return updated;
        }
        // Otherwise, forward to next stage
        const nextStageKey = currentStage?.nextStage;
        if (!nextStageKey) return app;
        const nextStage = getStage(nextStageKey)!;
        let updated: Application = { ...app, workflowHistory: app.workflowHistory.map((w) => w.stage === app.currentStage && w.status === "CURRENT" ? { ...w, status: "COMPLETED" as const } : w) };
        const nextOfficer = getAssignedOfficerForStage(nextStageKey, USERS);
        updated = { ...updated, assignedOfficer: nextOfficer, assignedAt: nowISO() };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Approved & forwarded to ${nextStage.label}`, oldStatus: app.status, newStatus: statusForStage(nextStageKey), remarks });
        updated = addWorkflowHistory(updated, app.currentStage, { name: user.name, role: user.role }, `Approved — forwarded to ${nextStage.label}`, remarks, "COMPLETED");
        updated = setAppStatus(updated, statusForStage(nextStageKey), nextStageKey);
        updated = addWorkflowHistory(updated, nextStageKey, nextOfficer ? { name: nextOfficer.name, role: nextOfficer.role } : { name: "System", role: "TPS" }, `Assigned to ${nextStage.label}`, undefined, "CURRENT");
        return updated;
      }),
    }));
    // Notification
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = app.status === "APPROVED"
      ? NotificationFactory.applicationApproved(app)
      : NotificationFactory.applicationForwarded(app, app.currentStageLabel);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  rejectApplication: (appId, remarks) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, workflowHistory: app.workflowHistory.map((w) => w.status === "CURRENT" ? { ...w, status: "FAILED" as const } : w) };
        updated = addAudit(updated, { user: user.name, role: user.role, action: "Application rejected", oldStatus: app.status, newStatus: "REJECTED", remarks });
        updated = addWorkflowHistory(updated, "COMMISSIONER_REVIEW", { name: user.name, role: user.role }, "Application rejected", remarks, "FAILED");
        updated = setAppStatus(updated, "REJECTED", "FINAL_DECISION");
        updated = { ...updated, assignedOfficer: undefined, progress: 100 };
        return updated;
      }),
    }));
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.applicationRejected(app, remarks);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  returnApplication: (appId, remarks) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        // Return to TPA or previous review stage
        const returnStage: WorkflowStageKey = app.currentStage === "COMMISSIONER_REVIEW" ? "ADDITIONAL_COMMISSIONER_REVIEW" : "TPA_REVIEW";
        const returnStageInfo = getStage(returnStage)!;
        let updated: Application = { ...app, workflowHistory: app.workflowHistory.map((w) => w.status === "CURRENT" ? { ...w, status: "RETURNED" as const } : w) };
        const returnOfficer = getAssignedOfficerForStage(returnStage, USERS);
        updated = { ...updated, assignedOfficer: returnOfficer, assignedAt: nowISO() };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Returned to ${returnStageInfo.label}`, oldStatus: app.status, newStatus: "RETURNED", remarks });
        updated = addWorkflowHistory(updated, app.currentStage, { name: user.name, role: user.role }, `Returned to ${returnStageInfo.label}`, remarks, "RETURNED");
        updated = setAppStatus(updated, "RETURNED", returnStage);
        updated = addWorkflowHistory(updated, returnStage, returnOfficer ? { name: returnOfficer.name, role: returnOfficer.role } : { name: "System", role: "TPA" }, `Returned for correction`, remarks, "CURRENT");
        return updated;
      }),
    }));
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.applicationReturned(app, app.currentStageLabel);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  submitTechnicalScrutiny: (appId, remarks) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated = addAudit(app, { user: user.name, role: user.role, action: "Technical scrutiny report submitted", remarks });
        updated = addWorkflowHistory(updated, "TPS_TECHNICAL_SCRUTINY", { name: user.name, role: user.role }, "Technical scrutiny submitted", remarks, "COMPLETED");
        // Forward to TPA
        const nextStage = getStage("TPA_REVIEW")!;
        const tpa = USERS.find((u) => u.role === "TPA")!;
        updated = { ...updated, assignedOfficer: { name: tpa.name, role: tpa.role }, assignedAt: nowISO() };
        updated = setAppStatus(updated, "TPA_REVIEW", "TPA_REVIEW");
        updated = addWorkflowHistory(updated, "TPA_REVIEW", { name: tpa.name, role: tpa.role }, "Assigned to TPA", undefined, "CURRENT");
        return updated;
      }),
    }));
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.applicationForwarded(app, "TPA Review");
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  raiseShortfall: (appId, data) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const shortfall: Shortfall = {
          id: genId("sf"),
          shortfallId: `SF/2026/${String(Math.floor(Math.random() * 9000) + 1000)}`,
          type: data.type,
          title: data.title,
          description: data.description,
          raisedBy: { name: user.name, role: user.role },
          raisedAt: nowISO(),
          dueDate: data.dueDate,
          status: "OPEN",
          applicationId: app.id,
          applicationNo: app.applicationNo,
          stageRaisedAt: app.currentStage,
        };
        let updated: Application = { ...app, shortfalls: [...app.shortfalls, shortfall] };
        const oldStatus = app.status;
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Shortfall raised: ${shortfall.shortfallId}`, oldStatus, newStatus: "SHORTFALL_RAISED", remarks: data.title });
        updated = setAppStatus(updated, "SHORTFALL_RAISED");
        return updated;
      }),
    }));
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.shortfallRaised(app, data.title);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  reviewShortfallResponse: (appId, shortfallId) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => ({
        ...app,
        shortfalls: app.shortfalls.map((sf) => sf.id === shortfallId ? { ...sf, status: "UNDER_REVIEW" as const, reviewedBy: { name: user.name, role: user.role }, reviewedAt: nowISO() } : sf),
        auditLog: [...app.auditLog, { id: genId("audit"), user: user.name, role: user.role, action: `Shortfall under review: ${shortfallId}`, entity: "Application", entityId: app.applicationNo, timestamp: nowISO() }],
      })),
    }));
  },

  resolveShortfall: (appId, shortfallId, resolution) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, shortfalls: app.shortfalls.map((sf) => sf.id === shortfallId ? { ...sf, status: "RESOLVED" as const, resolvedBy: { name: user.name, role: user.role }, resolvedAt: nowISO(), resolution } : sf) };
        // Check if all shortfalls resolved → resume workflow
        const hasOpen = updated.shortfalls.some((sf) => sf.status !== "RESOLVED");
        if (!hasOpen) {
          // Resume to the stage where shortfall was raised
          const raisedAt = app.shortfalls.find((sf) => sf.id === shortfallId)?.stageRaisedAt ?? "TPA_REVIEW";
          const stageInfo = getStage(raisedAt)!;
          const officer = getAssignedOfficerForStage(raisedAt, USERS);
          updated = { ...updated, assignedOfficer: officer, assignedAt: nowISO() };
          updated = addAudit(updated, { user: user.name, role: user.role, action: `Shortfall resolved: ${shortfallId}`, oldStatus: "SHORTFALL_RAISED", newStatus: statusForStage(raisedAt), remarks: resolution });
          updated = setAppStatus(updated, statusForStage(raisedAt), raisedAt);
          updated = addWorkflowHistory(updated, raisedAt, { name: user.name, role: user.role }, "Shortfall resolved — resuming review", resolution, "CURRENT");
        } else {
          updated = addAudit(updated, { user: user.name, role: user.role, action: `Shortfall resolved: ${shortfallId}`, remarks: resolution });
        }
        return updated;
      }),
    }));
    const app = get().applications.find((a) => a.id === appId)!;
    const { notification, smsLog } = NotificationFactory.shortfallResolved(app, shortfallId);
    set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
  },

  reopenShortfall: (appId, shortfallId, reason) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, shortfalls: app.shortfalls.map((sf) => sf.id === shortfallId ? { ...sf, status: "REOPENED" as const } : sf) };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Shortfall reopened: ${shortfallId}`, remarks: reason });
        updated = setAppStatus(updated, "SHORTFALL_RAISED");
        return updated;
      }),
    }));
  },

  verifyDocument: (appId, docId) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, documents: app.documents.map((d) => d.id === docId ? { ...d, status: "VERIFIED" as const, verifiedBy: user.name, verifiedAt: nowISO() } : d) };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Document verified: ${updated.documents.find((d) => d.id === docId)?.name}` });
        // Check if all required docs verified → generate fee
        const allVerified = updated.documents.filter((d) => d.required).every((d) => d.status === "VERIFIED");
        if (allVerified && updated.status === "DOCUMENT_VERIFICATION") {
          const docCount = updated.documents.filter((d) => d.required).length;
          const result = feeService.calculate({
            applicationType: updated.project.type,
            propertyType: updated.project.propertyType,
            builtUpArea: updated.project.builtUpArea,
            plotArea: updated.project.plotArea,
            documentCount: docCount,
          });
          if (result) {
            const fee = feeService.toApplicationFee(result, 0);
            updated = { ...updated, fee };
            updated = addAudit(updated, { user: "System (Fee Engine)", role: "TPA", action: "All documents verified — fee auto-generated", oldStatus: "DOCUMENT_VERIFICATION", newStatus: "FEE_GENERATED" });
            updated = setAppStatus(updated, "FEE_GENERATED", "FEE_GENERATED");
            updated = addWorkflowHistory(updated, "DOCUMENTS", { name: user.name, role: user.role }, "Documents verified", undefined, "COMPLETED");
          }
        }
        return updated;
      }),
    }));
    // Notification if fee generated
    const app = get().applications.find((a) => a.id === appId)!;
    if (app.status === "FEE_GENERATED" && app.fee) {
      const { notification, smsLog } = NotificationFactory.feeGenerated(app);
      set((s) => ({ notifications: [notification, ...s.notifications], smsLogs: smsLog ? [smsLog, ...s.smsLogs] : s.smsLogs }));
    }
  },

  rejectDocument: (appId, docId, reason) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        let updated: Application = { ...app, documents: app.documents.map((d) => d.id === docId ? { ...d, status: "REJECTED" as const, verifiedBy: user.name, verifiedAt: nowISO(), remarks: reason } : d) };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Document rejected: ${updated.documents.find((d) => d.id === docId)?.name}`, remarks: reason });
        return updated;
      }),
    }));
  },

  addRemark: (appId, text, type) => {
    const user = get().user!;
    set((s) => ({
      applications: updateApp(s.applications, appId, (app) => {
        const remark: Remark = { id: genId("rem"), author: { name: user.name, role: user.role }, text, timestamp: nowISO(), type };
        let updated: Application = { ...app, remarks: [...app.remarks, remark] };
        updated = addAudit(updated, { user: user.name, role: user.role, action: `Remark added (${type})`, remarks: text });
        return updated;
      }),
    }));
  },

  // ---- NOTIFICATIONS ----
  markNotificationRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));

// ============================================================
// SELECTORS
// ============================================================
export function useSelectedApplication() {
  return useAppStore((s) => s.applications.find((a) => a.id === s.selectedApplicationId) ?? null);
}

export function useVisibleApplications() {
  const applications = useAppStore((s) => s.applications);
  const user = useAppStore((s) => s.user);
  return useMemo(() => {
    if (!user) return [];
    if (user.role === "ADMIN") return applications;
    if (user.role === "LTP") return applications.filter((a) => a.ltpId === user.id);
    return applications.filter((a) => {
      const roles = rolesForStage(a.currentStage);
      if (roles.includes(user.role) && !["APPROVED", "REJECTED"].includes(a.status)) return true;
      return a.workflowHistory.some((w) => w.actor.role === user.role);
    });
  }, [applications, user]);
}

export function useAssignedApplications() {
  const applications = useAppStore((s) => s.applications);
  const user = useAppStore((s) => s.user);
  return useMemo(() => {
    if (!user || user.role === "LTP" || user.role === "ADMIN") return [];
    return applications.filter((a) => {
      if (["APPROVED", "REJECTED"].includes(a.status)) return false;
      return rolesForStage(a.currentStage).includes(user.role);
    });
  }, [applications, user]);
}

export function useAllShortfalls() {
  const applications = useAppStore((s) => s.applications);
  return useMemo(
    () => applications.flatMap((a) => a.shortfalls.map((sf) => ({ ...sf, application: a }))),
    [applications]
  );
}

export function useAllAuditLogs() {
  const applications = useAppStore((s) => s.applications);
  return useMemo(
    () =>
      applications
        .flatMap((a) => a.auditLog.map((log) => ({ ...log, applicationNo: a.applicationNo })))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [applications]
  );
}

// ============================================================
// HELPERS
// ============================================================
function statusForStage(stage: WorkflowStageKey): ApplicationStatus {
  const map: Record<WorkflowStageKey, ApplicationStatus> = {
    APPLICATION_CREATED: "DRAFT",
    DRAWING_SCRUTINY: "SCRUTINY_IN_PROGRESS",
    DOCUMENTS: "DOCUMENT_VERIFICATION",
    FEE_GENERATED: "FEE_GENERATED",
    PAYMENT: "PAYMENT_PENDING",
    TPS_TECHNICAL_SCRUTINY: "TPS_TECHNICAL_SCRUTINY",
    TPA_REVIEW: "TPA_REVIEW",
    ZAD_ZDD_REVIEW: "ZAD_ZDD_REVIEW",
    ZJD_REVIEW: "ZJD_REVIEW",
    DIRECTOR_DP_REVIEW: "DIRECTOR_DP_REVIEW",
    ADDITIONAL_COMMISSIONER_REVIEW: "ADDITIONAL_COMMISSIONER_REVIEW",
    COMMISSIONER_REVIEW: "COMMISSIONER_REVIEW",
    FINAL_DECISION: "APPROVED",
  };
  return map[stage] ?? "DRAFT";
}

function buildScrutinyResult(version: number, passed: boolean): ScrutinyReport {
  const checks: ScrutinyCheck[] = [
    { id: "sc-1", rule: "Front Setback Compliance", category: "Setbacks", severity: "CRITICAL", status: passed ? "PASS" : "FAIL", message: passed ? "Front setback 6.2 m exceeds minimum 6.0 m." : "Front setback 5.4 m is below minimum 6.0 m.", recommendation: passed ? undefined : "Increase front setback to a minimum of 6.0 m." },
    { id: "sc-2", rule: "Rear Setback Compliance", category: "Setbacks", severity: "MAJOR", status: "PASS", message: "Rear setback 4.1 m compliant." },
    { id: "sc-3", rule: "Side Setback (East)", category: "Setbacks", severity: "MAJOR", status: "PASS", message: "3.2 m compliant." },
    { id: "sc-4", rule: "Side Setback (West)", category: "Setbacks", severity: "MAJOR", status: "PASS", message: "3.0 m compliant." },
    { id: "sc-5", rule: "Ground Coverage", category: "Bulk & Density", severity: "MAJOR", status: "PASS", message: "Coverage 58% within 60% limit." },
    { id: "sc-6", rule: "FAR / FSI Compliance", category: "Bulk & Density", severity: "CRITICAL", status: "PASS", message: "Achieved FAR 1.42 against permissible 1.50." },
    { id: "sc-7", rule: "Height Restriction", category: "Bulk & Density", severity: "MAJOR", status: "PASS", message: "Building height 14.8 m within 15 m limit." },
    { id: "sc-8", rule: "Parking Provision", category: "Amenities", severity: "MAJOR", status: "PASS", message: "24 ECS provided, 22 required." },
    { id: "sc-9", rule: "Rain Water Harvesting", category: "Sustainability", severity: "MINOR", status: "PASS", message: "RWH pit shown at NE corner." },
    { id: "sc-10", rule: "Sewage Treatment Plant", category: "Sustainability", severity: "MINOR", status: passed ? "PASS" : "WARNING", message: passed ? "STP of 30 KLD provided." : "STP capacity calculation sheet not attached.", recommendation: passed ? undefined : "Attach STP capacity calculation." },
    { id: "sc-11", rule: "Fire Safety — Exit Width", category: "Fire & Safety", severity: "CRITICAL", status: "PASS", message: "Stair width 1.8 m compliant." },
    { id: "sc-12", rule: "Fire Safety — Refuge Area", category: "Fire & Safety", severity: "MAJOR", status: "PASS", message: "Refuge area provided at 7th floor." },
    { id: "sc-13", rule: "Tree Plantation", category: "Environment", severity: "MINOR", status: "WARNING", message: "Indicate tree species on landscape plan." },
    { id: "sc-14", rule: "Accessibility — Ramp", category: "Accessibility", severity: "MAJOR", status: "PASS", message: "1:12 ramp at main entrance." },
    { id: "sc-15", rule: "Title & North Arrow", category: "Drawing Standards", severity: "WARNING", status: "PASS", message: "Title block and north arrow present." },
  ];
  const failed = checks.filter((c) => c.status === "FAIL").length;
  const warnings = checks.filter((c) => c.status === "WARNING").length;
  return {
    reportNo: `SCR/2026/${String(Math.floor(1000 + Math.random() * 9000))}`,
    drawingVersion: version,
    generatedAt: nowISO(),
    status: failed === 0 ? "PASSED" : "FAILED",
    summary: passed
      ? "Drawing scrutiny completed successfully. All critical and major checks passed. Minor advisories noted for compliance during construction."
      : "Scrutiny identified 1 critical non-compliance. Drawing must be corrected and re-uploaded before proceeding.",
    totalChecks: checks.length,
    passed: checks.length - failed - warnings,
    failed,
    warnings,
    checks,
  };
}
