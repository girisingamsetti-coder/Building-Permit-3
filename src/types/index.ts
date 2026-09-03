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
  | "ADMIN"
  | "PROJECT_MANAGER";

export interface Role {
  key: RoleKey;
  title: string;
  fullName: string;
  description: string;
  level: number;
  permissions: Permission[];
  color: string;
}

export type Permission =
  | "application:create"
  | "application:view_own"
  | "application:view_all"
  | "drawing:upload"
  | "drawing:view"
  | "drawing:scrutinize"
  | "document:upload"
  | "document:view"
  | "document:verify"
  | "document:reject"
  | "fee:calculate"
  | "fee:manage"
  | "payment:initiate"
  | "payment:verify"
  | "workflow:approve"
  | "workflow:forward"
  | "workflow:return"
  | "workflow:reject"
  | "shortfall:raise"
  | "shortfall:view"
  | "shortfall:resolve"
  | "remarks:add"
  | "user:manage"
  | "role:manage"
  | "config:manage"
  | "audit:view"
  | "notifications:manage"
  // ---- Project Manager monitoring permissions (read-only) ----
  | "reports:view"
  | "officer_progress:view"
  | "sla:view";

// ---------- Users ----------
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  role: RoleKey;
  email: string;
  phone: string;
  employeeId?: string;
  licenseNo?: string;
  designation?: string;
  zone?: string;
  avatarColor: string;
  department?: string;
  active: boolean;
  status: UserStatus;
  lastLogin?: string;
  createdAt?: string;
  permissionOverrides?: { allowed?: Permission[]; denied?: Permission[] };
}

// ---------- Applications ----------
export type ApplicationStatus =
  | "DRAFT"
  | "DRAWING_UPLOADED"
  | "SCRUTINY_IN_PROGRESS"
  | "SCRUTINY_FAILED"
  | "DRAWING_REUPLOAD_REQUIRED"
  | "SCRUTINY_PASSED"
  | "DOCUMENT_UPLOAD_PENDING"
  | "DOCUMENT_VERIFICATION"
  | "FEE_GENERATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_SUCCESS"
  | "TPS_TECHNICAL_SCRUTINY"
  | "TPA_REVIEW"
  | "ZAD_ZDD_REVIEW"
  | "ZJD_REVIEW"
  | "DIRECTOR_DP_REVIEW"
  | "ADDITIONAL_COMMISSIONER_REVIEW"
  | "COMMISSIONER_REVIEW"
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
  plotArea: number;
  builtUpArea: number;
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
  assignedAt?: string;
  submissionDate: string;
  lastUpdated: string;
  expectedSLA?: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  progress: number;
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
  status: "PENDING_SCRUTINY" | "SCRUTINY_IN_PROGRESS" | "SCRUTINY_PASSED" | "SCRUTINY_FAILED" | "SUPERSEDED";
  notes?: string;
}

// ---------- Scrutiny ----------
// Severity describes the importance of a rule (not the outcome).
// Result (status field) describes the outcome: PASS / FAIL / WARNING.
export type ScrutinySeverity = "CRITICAL" | "MAJOR" | "MINOR";

export interface ScrutinyCheck {
  id: string;
  rule: string;
  category: string;
  severity: ScrutinySeverity;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  recommendation?: string;
  expectedValue?: string;
  observedValue?: string;
}

export interface ScrutinyReport {
  reportNo: string;
  drawingVersion: number;
  generatedAt: string;
  status: "PASSED" | "FAILED" | "PASSED_WITH_WARNINGS";
  summary: string;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  checks: ScrutinyCheck[];
}

// ---------- Documents ----------
// Document lifecycle:
//   REQUIRED → PENDING_VERIFICATION → VERIFIED | REJECTED | SHORTFALL
//   On re-upload after REJECTED/SHORTFALL: old version → SUPERSEDED, new version → PENDING_VERIFICATION
export type DocumentStatus =
  | "REQUIRED"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "SHORTFALL"
  | "SUPERSEDED";

export interface DocumentRecord {
  id: string;
  name: string;
  code: string;             // documentTypeId (e.g. DOC_712)
  required: boolean;
  status: DocumentStatus;
  // Upload metadata
  uploadedBy?: string;
  uploadedAt?: string;
  version?: number;         // current version number (1, 2, 3…)
  fileName?: string;        // actual uploaded file name
  fileSize?: string;
  fileType?: string;        // MIME/extension: pdf, jpg, png, dwg…
  fileReference?: string;   // storage/blob reference (demo: data URL or filename)
  // Review metadata
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;   // optional verify remarks
  rejectionReason?: string;
  shortfallReason?: string;
  shortfallId?: string;     // link to Shortfall record when status === SHORTFALL
  // Version history — older versions of this document type
  history?: DocumentVersion[];
  // Legacy compat
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

// Historical version of a document (kept when a new version is uploaded)
export interface DocumentVersion {
  version: number;
  fileName: string;
  fileSize: string;
  fileType?: string;
  fileReference?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;   // REJECTED | SHORTFALL | SUPERSEDED
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  shortfallReason?: string;
  reviewRemarks?: string;
}

// ---------- Fees ----------
// Configurable tax model — NOT hardcoded. Admin can configure per fee structure.
export type TaxType = "CGST_SGST" | "IGST" | "ZERO_TAX";

export interface TaxConfig {
  taxApplicable: boolean;
  taxType: TaxType;
  cgstRate?: number; // percentage, e.g. 9 for 9%
  sgstRate?: number; // percentage
  igstRate?: number; // percentage (used when taxType === "IGST")
  label?: string;    // human-readable, e.g. "CGST 9% + AP SGST 9%"
}

export interface FeeStructure {
  id: string;
  name: string;
  applicationType: ApplicationType;
  propertyType?: PropertyType; // when set, structure applies only to this property type
  description: string;
  active: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  version?: string; // e.g. "2026 v1"
  taxConfig?: TaxConfig; // configurable tax treatment
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
  base?: number;   // for percentage-based items (e.g. labour cess base = development fee)
  ratePercent?: number; // for percentage-based items (e.g. 1 for 1%)
}

// ApplicationFee — the immutable, persisted fee record.
// Tax config is snapshotted at generation time (historical immutability).
export interface ApplicationFee {
  feeStructureId: string;
  feeStructureName: string;
  feeStructureVersion?: string;
  generatedAt: string;
  lineItems: FeeLineItem[];
  subtotal: number;
  taxableAmount: number;  // base on which tax is computed (typically = subtotal)
  // Tax breakdown — configurable
  taxApplicable: boolean;
  taxType: TaxType; // "CGST_SGST" | "IGST" | "ZERO_TAX"
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;     // labour cess (already in line items, duplicated here for summary)
  totalGST: number; // cgst + sgst + igst
  // Legacy single gst field (kept for backward compat — equals totalGST)
  gst: number;
  total: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
  // Snapshot of the tax config at generation time
  taxConfig?: TaxConfig;
}

// ---------- Payments ----------
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
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
  isMock: boolean;
}

// ---------- Workflow ----------
export type WorkflowStageKey =
  | "APPLICATION_CREATED"
  | "DRAWING_SCRUTINY"
  | "DOCUMENTS"
  | "FEE_GENERATED"
  | "PAYMENT"
  | "TPS_TECHNICAL_SCRUTINY"
  | "TPA_REVIEW"
  | "ZAD_ZDD_REVIEW"
  | "ZJD_REVIEW"
  | "DIRECTOR_DP_REVIEW"
  | "ADDITIONAL_COMMISSIONER_REVIEW"
  | "COMMISSIONER_REVIEW"
  | "FINAL_DECISION";

export interface WorkflowStage {
  key: WorkflowStageKey;
  label: string;
  shortLabel: string;
  role: RoleKey;
  order: number;
  allowedActions: WorkflowAction[];
  nextStage?: WorkflowStageKey;
  canRaiseShortfall: boolean;
  canApprove: boolean;
  canReturn: boolean;
  canReject: boolean;
}

export type WorkflowAction =
  | "APPROVE"
  | "FORWARD"
  | "RETURN"
  | "REJECT"
  | "RAISE_SHORTFALL"
  | "ADD_REMARKS"
  | "SUBMIT_TECHNICAL_SCRUTINY"
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
export type ShortfallType = "DOCUMENT" | "FEE" | "TECHNICAL" | "GENERAL";
export type ShortfallStatus = "OPEN" | "RESPONDED" | "UNDER_REVIEW" | "RESOLVED" | "REOPENED" | "OVERDUE";

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
  stageRaisedAt: WorkflowStageKey;
  response?: {
    text: string;
    respondedAt: string;
    supportingDocument?: string;
  };
  reviewedBy?: { name: string; role: RoleKey };
  reviewedAt?: string;
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
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_VERIFIED"
  | "DOCUMENT_REJECTED"
  | "DOCUMENT_SHORTFALL"
  | "FEE_GENERATED"
  | "PAYMENT_SUCCESSFUL"
  | "SHORTFALL_RAISED"
  | "SHORTFALL_RESPONDED"
  | "SHORTFALL_RESOLVED"
  | "APPLICATION_FORWARDED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
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
  applicationNo?: string;
  smsSent: boolean;
  smsStatus?: "SENT" | "DELIVERED" | "FAILED" | "PENDING";
  channel: "IN_APP" | "SMS" | "EMAIL";
  recipientRole?: RoleKey;
}

// ---------- SMS Log ----------
export interface SmsLog {
  id: string;
  notificationId: string;
  recipient: string;
  recipientName: string;
  message: string;
  templateCode: string;
  status: "SENT" | "DELIVERED" | "FAILED" | "PENDING";
  sentAt: string;
  deliveredAt?: string;
  applicationNo?: string;
  isMock: boolean;
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

// ---------- Admin Audit ----------
export interface AdminAuditEntry extends AuditEntry {
  targetType: string;
  targetId: string;
  oldValue?: string;
  newValue?: string;
}

// ---------- Application Type Configuration ----------
export interface ApplicationTypeConfig {
  key: ApplicationType;
  name: string;
  description: string;
  active: boolean;
  typicalDuration: string;
}

// ---------- System Settings ----------
export interface SystemSettings {
  portalName: string;
  portalSubtitle: string;
  dateFormat: string;
  currency: string;
  maxFileSizeMB: number;
  allowedDrawingFormats: string[];
  allowedDocumentFormats: string[];
  sessionTimeoutMinutes: number;
  demoMode: boolean;
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
  | "login"
  | "forgot-password"
  | "otp"
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
  | "officer-dashboard"
  | "officer-review"
  | "officer-applications"
  | "officer-documents"
  | "admin-dashboard"
  | "admin-users"
  | "admin-roles"
  | "admin-application-types"
  | "admin-fee-structures"
  | "admin-workflow"
  | "admin-templates"
  | "admin-audit"
  | "admin-settings"
  // Project Manager views (read-only monitoring)
  | "pm-dashboard"
  | "pm-applications"
  | "pm-application-details"
  | "pm-workflow"
  | "pm-officers"
  | "pm-officer-details"
  | "pm-sla"
  | "pm-reports"
  | "pm-shortfalls"
  | "pm-help";

export type Portal = "LTP" | "OFFICER" | "ADMIN" | "PROJECT_MANAGER";
