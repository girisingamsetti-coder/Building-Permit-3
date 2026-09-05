import type {
  Application,
  ApplicationStatus,
  Permission,
  Portal,
  Role,
  RoleKey,
  User,
  ViewKey,
  WorkflowAction,
  WorkflowStageKey,
} from "@/types";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";

// ============================================================
// RBAC — Role-Based Access Control
// ============================================================

export function portalForRole(role: RoleKey): "LTP" | "OFFICER" | "SUPER_ADMIN" {
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "LTP") return "LTP";
  return "OFFICER";
}

// Centralized permission check — reads from the store's mutable roles record.
export function getEffectivePermissions(user: User, roles: Record<RoleKey, Role>): Set<Permission> {
  const rolePerms = new Set<Permission>(roles[user.role]?.permissions ?? []);
  const overrides = user.permissionOverrides ?? {};
  (overrides.allowed ?? []).forEach((p) => rolePerms.add(p));
  (overrides.denied ?? []).forEach((p) => rolePerms.delete(p));
  return rolePerms;
}

export function hasPermission(user: User, permission: Permission, roles: Record<RoleKey, Role>): boolean {
  return getEffectivePermissions(user, roles).has(permission);
}

export function canAccessView(user: User, view: string, roles: Record<RoleKey, Role>): boolean {
  const adminViews = ["admin-dashboard", "admin-users", "admin-roles", "admin-application-types", "admin-fee-structures", "admin-workflow", "admin-templates", "admin-audit", "admin-settings"];
  if (adminViews.includes(view)) {
    return user.role === "SUPER_ADMIN" || hasPermission(user, "config:manage" as Permission, roles);
  }
  return true;
}

// Which roles can act on a given stage (some stages accept multiple roles)
export function rolesForStage(stage: WorkflowStageKey): RoleKey[] {
  const map: Record<WorkflowStageKey, RoleKey[]> = {
    APPLICATION_CREATED: ["LTP"],
    DRAWING_SCRUTINY: ["LTP"],
    DOCUMENTS: ["ZONAL_HEAD"],
    FEE_GENERATED: ["LTP"],
    PAYMENT: ["LTP"],
    ZONAL_HEAD_REVIEW: ["ZONAL_HEAD"],
    DIRECTOR_REVIEW: ["DIRECTOR"],
    ADDITIONAL_COMMISSIONER_REVIEW: ["ADDITIONAL_COMMISSIONER"],
    COMMISSIONER_REVIEW: ["COMMISSIONER"],
    FINAL_DECISION: ["COMMISSIONER"],
  };
  return map[stage] ?? [];
}

// Can this user view this application?
export function canViewApplication(user: User, app: Application): boolean {
  if (user.role === "SUPER_ADMIN" || user.role === "DIRECTOR") return true;
  if (user.role === "ZONAL_HEAD" && app.project.zone !== user.zone) return false;
  if (user.role === "LTP") return app.ltpId === user.id;
  // Officers can view all applications assigned to their stage/role
  const stageRoles = rolesForStage(app.currentStage);
  if (stageRoles.includes(user.role)) return true;
  // Officers can also view apps they've previously acted on
  return app.workflowHistory.some((w) => w.actor.role === user.role);
}

// Which applications are visible to this user?
export function getVisibleApplications(user: User, apps: Application[]): Application[] {
  if (user.role === "SUPER_ADMIN" || user.role === "DIRECTOR") return apps;
  
  if (user.role === "ZONAL_HEAD") {
    return apps.filter((a) => {
      if (a.project.zone !== user.zone) return false;
      const stageRoles = rolesForStage(a.currentStage);
      if (stageRoles.includes(user.role) && !["APPROVED", "REJECTED"].includes(a.status)) return true;
      return a.workflowHistory.some((w) => w.actor.role === user.role);
    });
  }

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
  if (user.role === "LTP" || user.role === "SUPER_ADMIN") return [];
  const stageRoles = rolesForStage;
  return apps.filter((a) => {
    if (["APPROVED", "REJECTED"].includes(a.status)) return false;
    if (user.role === "ZONAL_HEAD" && a.project.zone !== user.zone) return false;
    const roles = stageRoles(a.currentStage);
    return roles.includes(user.role);
  });
}

// Get allowed actions for this user on this application
export function getAllowedActions(user: User, app: Application): WorkflowAction[] {
  if (user.role === "SUPER_ADMIN") return ["ADD_REMARKS"];
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

// ============================================================
// DYNAMIC NAV — permission-driven sidebar
// ============================================================
//
// Each of the 8 modules declares:
//   - `view`        : the ViewKey to navigate to for each portal
//   - `requiredAny` : user must have AT LEAST ONE of these permissions
//                     (empty = always visible for that portal)
//
// When Super Admin changes a role's permissions via the Roles panel,
// getDynamicNav() re-evaluates and the sidebar immediately reflects
// the updated access for every user of that role.
// ============================================================

export interface DynamicNavItem {
  view: ViewKey;
  label: string;
  permKey: string; // stable key for React list rendering
}

type ModuleDef = {
  label: string;
  permKey: string;
  requiredAny: Permission[];        // show if user has ANY of these
  views: Record<Portal, ViewKey>;   // which view to open per portal
};

const MODULE_DEFS: ModuleDef[] = [
  {
    label: "Dashboard",
    permKey: "dashboard",
    requiredAny: [],   // always visible
    views: {
      LTP:        "ltp-dashboard",
      OFFICER:    "officer-dashboard",
      SUPER_ADMIN: "admin-dashboard",
    },
  },
  {
    label: "Applications",
    permKey: "applications",
    requiredAny: ["application:view_own", "application:view_all"],
    views: {
      LTP:        "ltp-applications",
      OFFICER:    "officer-applications",
      SUPER_ADMIN: "admin-applications",
    },
  },
  {
    label: "Tasks",
    permKey: "tasks",
    requiredAny: [
      "drawing:upload", "drawing:scrutinize",
      "workflow:approve", "workflow:forward", "workflow:return", "workflow:reject",
      "document:verify", "document:reject",
    ],
    views: {
      LTP:        "ltp-drawings",
      OFFICER:    "officer-tasks",
      SUPER_ADMIN: "admin-workflow",
    },
  },
  {
    label: "Shortfalls",
    permKey: "shortfalls",
    requiredAny: ["shortfall:raise", "shortfall:view", "shortfall:resolve"],
    views: {
      LTP:        "ltp-shortfalls",
      OFFICER:    "officer-shortfalls",
      SUPER_ADMIN: "admin-shortfalls",
    },
  },
  {
    label: "Payments",
    permKey: "payments",
    requiredAny: ["payment:initiate", "payment:verify", "fee:manage", "fee:calculate"],
    views: {
      LTP:        "ltp-payment",
      OFFICER:    "officer-payments",
      SUPER_ADMIN: "admin-payments",
    },
  },
  {
    label: "Documents",
    permKey: "documents",
    requiredAny: ["document:upload", "document:view", "document:verify", "document:reject"],
    views: {
      LTP:        "ltp-documents",
      OFFICER:    "officer-documents",
      SUPER_ADMIN: "admin-documents",
    },
  },
  {
    label: "Reports",
    permKey: "reports",
    requiredAny: ["reports:view", "application:view_all", "sla:view", "officer_progress:view"],
    views: {
      LTP:        "ltp-fees",
      OFFICER:    "officer-reports",
      SUPER_ADMIN: "admin-reports",
    },
  },
  {
    label: "Settings",
    permKey: "settings",
    requiredAny: [],   // always visible — scope differs per portal
    views: {
      LTP:        "ltp-profile",
      OFFICER:    "officer-settings",
      SUPER_ADMIN: "admin-settings",
    },
  },
];

/**
 * Returns the ordered list of nav items that this user is allowed to see,
 * based on their effective permissions from the (mutable) roles store.
 *
 * Call this inside the Sidebar component with live store state so it
 * re-evaluates whenever Super Admin changes any role permission.
 */
export function getDynamicNav(
  user: User,
  portal: Portal,
  roles: Record<RoleKey, Role>
): DynamicNavItem[] {
  const effectivePerms = getEffectivePermissions(user, roles);

  return MODULE_DEFS
    .filter((mod) => {
      // No permission requirement → always show
      if (mod.requiredAny.length === 0) return true;
      // SUPER_ADMIN always sees everything
      if (user.role === "SUPER_ADMIN") return true;
      // Otherwise check if user has at least one required permission
      return mod.requiredAny.some((p) => effectivePerms.has(p));
    })
    .map((mod) => ({
      view: mod.views[portal],
      label: mod.label,
      permKey: mod.permKey,
    }));
}
