// ============================================================
// LTP Approval Workflow Management System — Domain Models
// ============================================================

// ---------- Roles & Permissions (RBAC) ----------
export type RoleKey =
  | "LTP"
  | "TPS"
  | "TPA"
  | "ZAD"
  | "ZDD"
  | "ZJD"
  | "DIRECTOR_DP"
  | "ADDL_COMMISSIONER"
  | "COMMISSIONER"
  | "ADMIN";

export interface Role {
  key: RoleKey;
  title: string;
  fullName: string;
  description: string;
  level: number; // workflow level, 0 = applicant
  permissions: Permission[];
  color: string; // tailwind color token name for accents
}

export type Permission =
  | "application:create"
  | "application:view_own"
  | "application:view_all"
  | "drawing:upload"
  | "drawing:scrutinize"
  | "document:upload"
  | "document:verify"
  | "fee:calculate"
  | "fee:manage"
  | "payment:initiate"
  | "payment:verify"
  | "workflow:approve"
  | "workflow:forward"
  | "workflow:return"
  | "shortfall:raise"
  | "shortfall:resolve"
  | "remarks:add"
  | "user:manage"
  | "role:manage"
  | "config:manage"
  | "audit:view"
  | "notifications:manage";

// ---------- Users ----------
export interface User {
  id: string;
  name: string;
  role: RoleKey;
  email: string;
  phone: string;
  employeeId?: string;
  licenseNo?: string; // for LTP
  designation?: string;
  zone?: string;
  avatarColor: string;
  department?: string;
  active: boolean;
  lastLogin?: string;
}

// ---------- Applications ----------
export type ApplicationStatus =
  | "DRAFT"
  | "DRAWING_UPLOADED"
  | "SCRUTINY_FAILED"
  | "SCRUTINY_PASSED"
  | "DOCUMENTS_PENDING"
  | "DOCUMENTS_VERIFIED"
  | "FEE_GENERATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUCCESSFUL"
  | "UNDER_REVIEW"
  | "SHORTFALL_RAISED"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED";

export type ApplicationType =
  | "BUILDING_PERMISSION"
  | "LAYOUT_APPROVAL"
  | "OCCUPANCY_CERTIFICATE"
  | "REVISION_PERMISSION"
  | "DEVELOPMENT_PERMIT"
  | "DEMOLITION_PERMIT";

export type PropertyType =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INDUSTRIAL"
  | "INSTITUTIONAL"
  | "MIXED_USE";

export interface Applicant {
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface ProjectInfo {
  name: string;
  type: ApplicationType;
  propertyType: PropertyType;
  plotArea: number; // sq.m
  builtUpArea: number; // sq.m
  landUse: string;
  ward: string;
  zone: string;
  surveyNo: string;
  address: string;
}

export interface Application {
  id: string;
  applicationNo: string;
  applicant: Applicant;
  ltpId: string;
  ltpName: string;
  project: ProjectInfo;
  status: ApplicationStatus;
  currentStage: WorkflowStageKey;
  currentStageLabel: string;
  assignedOfficer?: { name: string; role: RoleKey };
  submissionDate: string;
  lastUpdated: string;
  expectedSLA?: string; // target date
  priority: "NORMAL" | "HIGH" | "URGENT";
  progress: number; // 0-100
  fee?: ApplicationFee;
  payment?: Payment;
  drawings: Drawing[];
  scrutinyReport?: ScrutinyReport;
  documents: DocumentRecord[];
  shortfalls: Shortfall[];
  workflowHistory: WorkflowHistoryEntry[];
  auditLog: AuditEntry[];
  remarks: Remark[];
}

// ---------- Drawings ----------
export interface Drawing {
  id: string;
  fileName: string;
  fileType: "DWG" | "PDF" | "DXF";
  fileSize: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  status: "PENDING_SCRUTINY" | "SCRUTINY_PASSED" | "SCRUTINY_FAILED" | "SUPERSEDED";
  thumbnail?: string;
  notes?: string;
}

// ---------- Scrutiny ----------
export type ScrutinySeverity = "CRITICAL" | "MAJOR" | "MINOR" | "WARNING" | "PASSED";

export interface ScrutinyCheck {
  id: string;
  rule: string;
  category: string;
  severity: ScrutinySeverity;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  recommendation?: string;
}

export interface ScrutinyReport {
  reportNo: string;
  drawingVersion: number;
  generatedAt: string;
  status: "PASSED" | "FAILED";
  summary: string;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  checks: ScrutinyCheck[];
}

// ---------- Documents ----------
export type DocumentStatus =
  | "REQUIRED"
  | "UPLOADED"
  | "VERIFIED"
  | "REJECTED"
  | "SHORTFALL";

export interface DocumentRecord {
  id: string;
  name: string;
  code: string;
  required: boolean;
  status: DocumentStatus;
  uploadedAt?: string;
  version?: number;
  fileSize?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

// ---------- Fees ----------
export interface FeeStructure {
  id: string;
  name: string;
  applicationType: ApplicationType;
  description: string;
  active: boolean;
  effectiveFrom: string;
}

export interface FeeComponent {
  id: string;
  name: string;
  code: string;
  description: string;
  basis: "FIXED" | "AREA_BASED" | "PERCENTAGE" | "SLAB";
  rate: number;
  unit?: string;
}

export interface FeeLineItem {
  componentCode: string;
  name: string;
  description: string;
  basis: string;
  rate: number;
  quantity: number;
  amount: number;
}

export interface ApplicationFee {
  feeStructureId: string;
  feeStructureName: string;
  generatedAt: string;
  lineItems: FeeLineItem[];
  subtotal: number;
  gst: number;
  total: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
}

// ---------- Payments ----------
export type PaymentStatus =
  | "PENDING"
  | "INITIATED"
  | "PROCESSING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: string;
  transactionId: string;
  referenceNo: string;
  status: PaymentStatus;
  amount: number;
  method: "UPI" | "NETBANKING" | "CARD" | "DEMAND_DRAFT";
  gateway: string;
  initiatedAt?: string;
  completedAt?: string;
  receiptNo?: string;
  verified: boolean;
}

// ---------- Workflow ----------
export type WorkflowStageKey =
  | "APPLICATION_CREATED"
  | "DRAWING_SCRUTINY"
  | "DOCUMENTS"
  | "FEE_GENERATED"
  | "PAYMENT"
  | "TPA_TPS"
  | "ZAD_ZDD"
  | "ZJD"
  | "DIRECTOR_DP"
  | "ADDL_COMMISSIONER"
  | "COMMISSIONER"
  | "FINAL_DECISION";

export interface WorkflowStage {
  key: WorkflowStageKey;
  label: string;
  role: RoleKey;
  order: number;
  allowedActions: WorkflowAction[];
  nextStage?: WorkflowStageKey;
  canRaiseShortfall: boolean;
  canApprove: boolean;
}

export type WorkflowAction =
  | "APPROVE"
  | "FORWARD"
  | "RETURN"
  | "RAISE_SHORTFALL"
  | "ADD_REMARKS"
  | "FINAL_DECISION";

export interface WorkflowHistoryEntry {
  id: string;
  stage: WorkflowStageKey;
  stageLabel: string;
  actor: { name: string; role: RoleKey };
  action: string;
  remarks?: string;
  timestamp: string;
  status: "COMPLETED" | "CURRENT" | "PENDING" | "FAILED" | "RETURNED" | "SHORTFALL";
  duration?: string;
}

// ---------- Shortfalls ----------
export type ShortfallType = "DOCUMENT" | "FEE" | "GENERAL";
export type ShortfallStatus = "OPEN" | "RESPONDED" | "RESOLVED" | "OVERDUE";

export interface Shortfall {
  id: string;
  shortfallId: string;
  type: ShortfallType;
  title: string;
  description: string;
  raisedBy: { name: string; role: RoleKey };
  raisedAt: string;
  dueDate: string;
  status: ShortfallStatus;
  applicationId: string;
  applicationNo: string;
  response?: {
    text: string;
    respondedAt: string;
    supportingDocument?: string;
  };
  resolvedBy?: { name: string; role: RoleKey };
  resolvedAt?: string;
  resolution?: string;
}

// ---------- Notifications ----------
export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "SCRUTINY_FAILED"
  | "SCRUTINY_PASSED"
  | "DOCUMENTS_REQUIRED"
  | "FEE_GENERATED"
  | "PAYMENT_SUCCESSFUL"
  | "SHORTFALL_RAISED"
  | "APPLICATION_FORWARDED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_RETURNED"
  | "FINAL_DECISION"
  | "SYSTEM";

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  applicationId?: string;
  smsSent: boolean;
  smsStatus?: "SENT" | "DELIVERED" | "FAILED" | "PENDING";
  channel: "IN_APP" | "SMS" | "EMAIL";
}

// ---------- Audit ----------
export interface AuditEntry {
  id: string;
  user: string;
  role: RoleKey;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  oldStatus?: string;
  newStatus?: string;
  remarks?: string;
  ip?: string;
  device?: string;
}

export interface Remark {
  id: string;
  author: { name: string; role: RoleKey };
  text: string;
  timestamp: string;
  type: "INFO" | "OBSERVATION" | "INSTRUCTION" | "DECISION";
}

// ---------- Navigation ----------
export type ViewKey =
  // auth
  | "login"
  | "forgot-password"
  | "otp"
  // ltp
  | "ltp-dashboard"
  | "ltp-applications"
  | "ltp-application-details"
  | "ltp-create-application"
  | "ltp-drawings"
  | "ltp-scrutiny"
  | "ltp-documents"
  | "ltp-fees"
  | "ltp-payment"
  | "ltp-receipt"
  | "ltp-shortfalls"
  | "ltp-notifications"
  | "ltp-profile"
  | "ltp-help"
  // officer
  | "officer-dashboard"
  | "officer-review"
  | "officer-applications"
  // admin
  | "admin-dashboard"
  | "admin-users"
  | "admin-roles"
  | "admin-application-types"
  | "admin-fee-structures"
  | "admin-workflow"
  | "admin-templates"
  | "admin-audit"
  | "admin-settings";

export type Portal = "LTP" | "OFFICER" | "ADMIN";
