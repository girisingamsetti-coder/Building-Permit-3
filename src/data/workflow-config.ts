import type { RoleKey, WorkflowStage, WorkflowStageKey, WorkflowAction } from "@/types";

// ============================================================
// CONFIGURABLE WORKFLOW ENGINE
// Stages, roles, allowed actions, next stages, permissions.
// This is the single source of truth for workflow routing.
// To change the workflow (e.g. merge TPS+TPA), edit this file only.
// ============================================================

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    key: "APPLICATION_CREATED",
    label: "Application Created",
    shortLabel: "Created",
    role: "LTP",
    order: 0,
    allowedActions: [],
    nextStage: "DRAWING_SCRUTINY",
    canRaiseShortfall: false,
    canApprove: false,
    canReturn: false,
    canReject: false,
  },
  {
    key: "DRAWING_SCRUTINY",
    label: "Drawing Scrutiny",
    shortLabel: "Scrutiny",
    role: "LTP",
    order: 1,
    allowedActions: [],
    nextStage: "DOCUMENTS",
    canRaiseShortfall: false,
    canApprove: false,
    canReturn: false,
    canReject: false,
  },
  {
    key: "DOCUMENTS",
    label: "Document Upload & Verification",
    shortLabel: "Documents",
    role: "TPA",
    order: 2,
    allowedActions: ["ADD_REMARKS"],
    nextStage: "FEE_GENERATED",
    canRaiseShortfall: true,
    canApprove: false,
    canReturn: false,
    canReject: false,
  },
  {
    key: "FEE_GENERATED",
    label: "Fee Generated",
    shortLabel: "Fee",
    role: "LTP",
    order: 3,
    allowedActions: [],
    nextStage: "PAYMENT",
    canRaiseShortfall: false,
    canApprove: false,
    canReturn: false,
    canReject: false,
  },
  {
    key: "PAYMENT",
    label: "Payment",
    shortLabel: "Payment",
    role: "LTP",
    order: 4,
    allowedActions: [],
    nextStage: "TPS_TECHNICAL_SCRUTINY",
    canRaiseShortfall: false,
    canApprove: false,
    canReturn: false,
    canReject: false,
  },
  {
    key: "TPS_TECHNICAL_SCRUTINY",
    label: "TPS Technical Scrutiny",
    shortLabel: "TPS",
    role: "TPS",
    order: 5,
    allowedActions: ["SUBMIT_TECHNICAL_SCRUTINY", "RAISE_SHORTFALL", "FORWARD", "ADD_REMARKS"],
    nextStage: "TPA_REVIEW",
    canRaiseShortfall: true,
    canApprove: false,
    canReturn: true,
    canReject: false,
  },
  {
    key: "TPA_REVIEW",
    label: "TPA Review",
    shortLabel: "TPA",
    role: "TPA",
    order: 6,
    allowedActions: ["RAISE_SHORTFALL", "FORWARD", "RETURN", "ADD_REMARKS"],
    nextStage: "ZAD_ZDD_REVIEW",
    canRaiseShortfall: true,
    canApprove: false,
    canReturn: true,
    canReject: false,
  },
  {
    key: "ZAD_ZDD_REVIEW",
    label: "ZAD / ZDD Review",
    shortLabel: "ZAD/ZDD",
    role: "ZDD",
    order: 7,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "RETURN", "ADD_REMARKS"],
    nextStage: "ZJD_REVIEW",
    canRaiseShortfall: true,
    canApprove: true,
    canReturn: true,
    canReject: false,
  },
  {
    key: "ZJD_REVIEW",
    label: "ZJD Review",
    shortLabel: "ZJD",
    role: "ZJD",
    order: 8,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS"],
    nextStage: "DIRECTOR_DP_REVIEW",
    canRaiseShortfall: true,
    canApprove: true,
    canReturn: false,
    canReject: false,
  },
  {
    key: "DIRECTOR_DP_REVIEW",
    label: "Director – DP Review",
    shortLabel: "Director",
    role: "DIRECTOR_DP",
    order: 9,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS"],
    nextStage: "ADDITIONAL_COMMISSIONER_REVIEW",
    canRaiseShortfall: true,
    canApprove: true,
    canReturn: false,
    canReject: false,
  },
  {
    key: "ADDITIONAL_COMMISSIONER_REVIEW",
    label: "Addl. Commissioner Review",
    shortLabel: "Addl. Comm.",
    role: "ADDL_COMMISSIONER",
    order: 10,
    allowedActions: ["APPROVE", "FORWARD", "ADD_REMARKS"],
    nextStage: "COMMISSIONER_REVIEW",
    canRaiseShortfall: false,
    canApprove: true,
    canReturn: false,
    canReject: false,
  },
  {
    key: "COMMISSIONER_REVIEW",
    label: "Commissioner Review",
    shortLabel: "Commissioner",
    role: "COMMISSIONER",
    order: 11,
    allowedActions: ["APPROVE", "REJECT", "RETURN", "ADD_REMARKS"],
    nextStage: "FINAL_DECISION",
    canRaiseShortfall: false,
    canApprove: true,
    canReturn: true,
    canReject: true,
  },
  {
    key: "FINAL_DECISION",
    label: "Final Decision",
    shortLabel: "Decision",
    role: "COMMISSIONER",
    order: 12,
    allowedActions: [],
    canRaiseShortfall: false,
    canApprove: false,
    canReturn: false,
    canReject: false,
  },
];

export function getStage(key: WorkflowStageKey): WorkflowStage | undefined {
  return WORKFLOW_STAGES.find((s) => s.key === key);
}

export function getStageByOrder(order: number): WorkflowStage | undefined {
  return WORKFLOW_STAGES.find((s) => s.order === order);
}

// Map application status to the workflow stage for the stepper
export function stageFromStatus(status: import("@/types").ApplicationStatus): WorkflowStageKey {
  const map: Record<string, WorkflowStageKey> = {
    DRAFT: "APPLICATION_CREATED",
    DRAWING_UPLOADED: "DRAWING_SCRUTINY",
    SCRUTINY_IN_PROGRESS: "DRAWING_SCRUTINY",
    SCRUTINY_FAILED: "DRAWING_SCRUTINY",
    DRAWING_REUPLOAD_REQUIRED: "DRAWING_SCRUTINY",
    SCRUTINY_PASSED: "DOCUMENTS",
    DOCUMENT_UPLOAD_PENDING: "DOCUMENTS",
    DOCUMENT_VERIFICATION: "DOCUMENTS",
    FEE_GENERATED: "FEE_GENERATED",
    PAYMENT_PENDING: "PAYMENT",
    PAYMENT_PROCESSING: "PAYMENT",
    PAYMENT_SUCCESS: "TPS_TECHNICAL_SCRUTINY",
    TPS_TECHNICAL_SCRUTINY: "TPS_TECHNICAL_SCRUTINY",
    TPA_REVIEW: "TPA_REVIEW",
    ZAD_ZDD_REVIEW: "ZAD_ZDD_REVIEW",
    ZJD_REVIEW: "ZJD_REVIEW",
    DIRECTOR_DP_REVIEW: "DIRECTOR_DP_REVIEW",
    ADDITIONAL_COMMISSIONER_REVIEW: "ADDITIONAL_COMMISSIONER_REVIEW",
    COMMISSIONER_REVIEW: "COMMISSIONER_REVIEW",
    SHORTFALL_RAISED: "TPS_TECHNICAL_SCRUTINY", // default; overridden by app's currentStage
    APPROVED: "FINAL_DECISION",
    REJECTED: "FINAL_DECISION",
    RETURNED: "TPA_REVIEW", // default; overridden by app's currentStage
  };
  return map[status] ?? "APPLICATION_CREATED";
}

// Map status to the display status of a workflow history entry
export function historyEntryStatus(
  stageOrder: number,
  currentStageOrder: number,
  appStatus: import("@/types").ApplicationStatus
): "COMPLETED" | "CURRENT" | "PENDING" | "FAILED" | "RETURNED" | "SHORTFALL" {
  if (appStatus === "APPROVED") return stageOrder < 12 ? "COMPLETED" : "COMPLETED";
  if (stageOrder < currentStageOrder) return "COMPLETED";
  if (stageOrder === currentStageOrder) {
    if (appStatus === "SHORTFALL_RAISED") return "SHORTFALL";
    if (appStatus === "REJECTED") return "FAILED";
    if (appStatus === "RETURNED") return "RETURNED";
    return "CURRENT";
  }
  return "PENDING";
}

// Labels for display
export const STAGE_LABELS: Record<WorkflowStageKey, string> = Object.fromEntries(
  WORKFLOW_STAGES.map((s) => [s.key, s.label])
) as Record<WorkflowStageKey, string>;

export const ACTION_LABELS: Record<WorkflowAction, string> = {
  APPROVE: "Approve",
  FORWARD: "Forward",
  RETURN: "Return",
  REJECT: "Reject",
  RAISE_SHORTFALL: "Raise Shortfall",
  ADD_REMARKS: "Add Remarks",
  SUBMIT_TECHNICAL_SCRUTINY: "Submit Technical Scrutiny",
  FINAL_DECISION: "Final Decision",
};
