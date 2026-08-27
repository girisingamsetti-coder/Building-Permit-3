import type {
  Application,
  ApplicationStatus,
  RoleKey,
  User,
  WorkflowAction,
  WorkflowStageKey,
} from "@/types";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";

// ============================================================
// RBAC — Role-Based Access Control
// Single source of truth for what each role can see and do.
// ============================================================

export function portalForRole(role: RoleKey): "LTP" | "OFFICER" | "ADMIN" {
  if (role === "ADMIN") return "ADMIN";
  if (role === "LTP") return "LTP";
  return "OFFICER";
}

// Which roles can act on a given stage (some stages accept multiple roles)
export function rolesForStage(stage: WorkflowStageKey): RoleKey[] {
  const map: Record<WorkflowStageKey, RoleKey[]> = {
    APPLICATION_CREATED: ["LTP"],
    DRAWING_SCRUTINY: ["LTP"],
    DOCUMENTS: ["LTP", "TPA"],
    FEE_GENERATED: ["LTP"],
    PAYMENT: ["LTP"],
    TPS_TECHNICAL_SCRUTINY: ["TPS"],
    TPA_REVIEW: ["TPA"],
    ZAD_ZDD_REVIEW: ["ZAD", "ZDD"],
    ZJD_REVIEW: ["ZJD"],
    DIRECTOR_DP_REVIEW: ["DIRECTOR_DP"],
    ADDITIONAL_COMMISSIONER_REVIEW: ["ADDL_COMMISSIONER"],
    COMMISSIONER_REVIEW: ["COMMISSIONER"],
    FINAL_DECISION: ["COMMISSIONER"],
  };
  return map[stage] ?? [];
}

// Can this user view this application?
export function canViewApplication(user: User, app: Application): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "LTP") return app.ltpId === user.id;
  // Officers can view all applications assigned to their stage/role
  const stageRoles = rolesForStage(app.currentStage);
  if (stageRoles.includes(user.role)) return true;
  // Officers can also view apps they've previously acted on
  return app.workflowHistory.some((w) => w.actor.role === user.role);
}

// Which applications are visible to this user?
export function getVisibleApplications(user: User, apps: Application[]): Application[] {
  if (user.role === "ADMIN") return apps;
  if (user.role === "LTP") return apps.filter((a) => a.ltpId === user.id);
  // Officers see apps at their stage + apps they've acted on
  return apps.filter((a) => {
    const stageRoles = rolesForStage(a.currentStage);
    if (stageRoles.includes(user.role) && !["APPROVED", "REJECTED"].includes(a.status)) return true;
    return a.workflowHistory.some((w) => w.actor.role === user.role);
  });
}

// Applications currently assigned to this officer for review
export function getAssignedApplications(user: User, apps: Application[]): Application[] {
  if (user.role === "LTP" || user.role === "ADMIN") return [];
  const stageRoles = rolesForStage;
  return apps.filter((a) => {
    if (["APPROVED", "REJECTED"].includes(a.status)) return false;
    const roles = stageRoles(a.currentStage);
    return roles.includes(user.role);
  });
}

// Get allowed actions for this user on this application
export function getAllowedActions(user: User, app: Application): WorkflowAction[] {
  if (user.role === "ADMIN") return ["ADD_REMARKS"];
  if (user.role === "LTP") return [];

  const stage = getStage(app.currentStage);
  if (!stage) return [];

  const roles = rolesForStage(app.currentStage);
  if (!roles.includes(user.role)) return [];

  // If there's an open shortfall, only allow shortfall-related actions
  const openShortfalls = app.shortfalls.filter(
    (s) => s.status === "OPEN" || s.status === "RESPONDED" || s.status === "UNDER_REVIEW" || s.status === "REOPENED"
  );
  if (openShortfalls.length > 0) {
    // Officer can review/resolve shortfall but can't forward/approve until resolved
    return ["RAISE_SHORTFALL", "ADD_REMARKS"];
  }

  return stage.allowedActions;
}

// Can this user perform this specific action?
export function canPerformAction(user: User, app: Application, action: WorkflowAction): boolean {
  return getAllowedActions(user, app).includes(action);
}

// What's the next stage when forwarding?
export function getNextStage(currentStage: WorkflowStageKey): WorkflowStageKey | undefined {
  return getStage(currentStage)?.nextStage;
}

// Compute progress percentage based on stage
export function computeProgress(status: ApplicationStatus, currentStage: WorkflowStageKey): number {
  if (status === "APPROVED") return 100;
  if (status === "REJECTED") return 100;
  const stage = getStage(currentStage);
  if (!stage) return 0;
  const totalStages = WORKFLOW_STAGES.length - 1; // exclude FINAL_DECISION
  return Math.round((stage.order / totalStages) * 100);
}

// Determine the assigned officer for a stage
export function getAssignedOfficerForStage(
  stage: WorkflowStageKey,
  officers: User[]
): { name: string; role: RoleKey } | undefined {
  const roles = rolesForStage(stage);
  for (const role of roles) {
    const officer = officers.find((o) => o.role === role && o.active);
    if (officer) return { name: officer.name, role: officer.role };
  }
  return undefined;
}

// LTP action availability
export function getLtpActions(app: Application): string[] {
  const actions: string[] = [];
  switch (app.status) {
    case "DRAFT":
      actions.push("upload_drawing");
      break;
    case "DRAWING_UPLOADED":
    case "SCRUTINY_IN_PROGRESS":
      actions.push("wait_scrutiny");
      break;
    case "SCRUTINY_FAILED":
    case "DRAWING_REUPLOAD_REQUIRED":
      actions.push("reupload_drawing");
      break;
    case "SCRUTINY_PASSED":
    case "DOCUMENT_UPLOAD_PENDING":
      actions.push("upload_documents");
      break;
    case "DOCUMENT_VERIFICATION":
      actions.push("wait_verification");
      break;
    case "FEE_GENERATED":
    case "PAYMENT_PENDING":
      actions.push("make_payment");
      break;
    case "PAYMENT_PROCESSING":
      actions.push("wait_payment");
      break;
    case "SHORTFALL_RAISED":
      actions.push("respond_shortfall");
      break;
  }
  return actions;
}
