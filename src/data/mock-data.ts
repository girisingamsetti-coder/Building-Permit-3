import type {
  Application,
  ApplicationFee,
  ApplicationStatus,
  ApplicationTypeConfig,
  AuditEntry,
  DocumentRecord,
  Drawing,
  FeeStructure,
  FeeComponent,
  NotificationRecord,
  Payment,
  Role,
  RoleKey,
  ScrutinyReport,
  Shortfall,
  ShowCause,
  SmsLog,
  SystemSettings,
  User,
  WorkflowHistoryEntry,
  WorkflowStageKey,
} from "@/types";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";
import { FEE_STRUCTURES, FEE_COMPONENTS } from "@/data/fee-config";
import { feeService } from "@/services/fee-service";

// ============================================================
// ROLES (RBAC)
// ============================================================
export const ROLES: Record<RoleKey, Role> = {
  LTP: {
    key: "LTP",
    title: "LTP",
    fullName: "Licensed Technical Person",
    description: "Creates and submits building approval applications.",
    level: 0,
    color: "emerald",
    permissions: ["application:create", "application:view_own", "drawing:upload", "document:upload", "payment:initiate", "remarks:add"],
  },
  TPA: {
    key: "TPA",
    title: "TPA",
    fullName: "Town Planning Assistant",
    description: "Assists in scrutiny of drawings, field inspections, and shortfall notices at zonal level.",
    level: 1,
    color: "teal",
    permissions: ["application:view_all", "drawing:view", "drawing:scrutinize", "document:view", "document:verify", "document:reject", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  ZDD: {
    key: "ZDD",
    title: "ZDD",
    fullName: "Zonal Deputy Director",
    description: "Reviews and forwards applications at zonal level, oversees TPA scrutiny.",
    level: 2,
    color: "blue",
    permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage", "fee:manage", "application:view_all", "workflow:approve", "workflow:forward", "workflow:return", "shortfall:raise", "shortfall:resolve", "shortfall:view", "document:verify", "document:reject", "document:view", "drawing:view", "drawing:scrutinize", "remarks:add", "reports:view", "officer_progress:view", "sla:view"],
  },
  ZJD: {
    key: "ZJD",
    title: "ZJD",
    fullName: "Zonal Joint Director",
    description: "Senior zonal authority that reviews, approves and forwards files to Director level.",
    level: 3,
    color: "indigo",
    permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage", "fee:manage", "application:view_all", "workflow:approve", "workflow:forward", "workflow:return", "shortfall:raise", "shortfall:resolve", "shortfall:view", "document:verify", "document:reject", "document:view", "drawing:view", "drawing:scrutinize", "remarks:add", "reports:view", "officer_progress:view", "sla:view"],
  },
  ZONAL_HEAD: {
    key: "ZONAL_HEAD",
    title: "Zonal Head",
    fullName: "Zonal Head",
    description: "Reviews applications at zonal level, raises shortfalls, approves/forwards.",
    level: 2,
    color: "cyan",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "workflow:return", "shortfall:raise", "shortfall:resolve", "remarks:add", "document:verify", "document:reject", "document:view"],
  },
  DIRECTOR: {
    key: "DIRECTOR",
    title: "Director",
    fullName: "Director",
    description: "Director-level review, shortfall reporting and forwarding.",
    level: 4,
    color: "amber",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  ADDITIONAL_COMMISSIONER: {
    key: "ADDITIONAL_COMMISSIONER",
    title: "Addl. Commissioner",
    fullName: "Additional Commissioner",
    description: "Senior review and forwarding to Commissioner.",
    level: 5,
    color: "rose",
    permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage", "fee:manage", "application:view_all", "document:view", "drawing:view", "shortfall:view", "reports:view", "officer_progress:view", "sla:view", "workflow:approve", "workflow:forward", "remarks:add"],
  },
  COMMISSIONER: {
    key: "COMMISSIONER",
    title: "Commissioner",
    fullName: "Commissioner of the Authority",
    description: "Final authority — issues final approval or rejection.",
    level: 6,
    color: "rose",
    permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage", "fee:manage", "application:view_all", "document:view", "drawing:view", "shortfall:view", "reports:view", "officer_progress:view", "sla:view", "workflow:approve", "workflow:reject", "workflow:return", "remarks:add"],
  },
  ADMIN: {
    key: "ADMIN",
    title: "Admin",
    fullName: "Administrator",
    description: "Has administrative access to LTP, TPA, ZDD, ZJD modules and data.",
    level: 90,
    color: "purple",
    permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage", "fee:manage", "application:view_all", "document:view", "drawing:view", "shortfall:view", "remarks:add", "reports:view", "officer_progress:view", "sla:view"],
  },

};

// ============================================================
// USERS — demo officers for every role (2026)
// Hierarchy: LTP → TPA → Zone (ZDD/ZJD) → Addl. Commissioner → Commissioner
// ============================================================
export const USERS: User[] = [
  // System Admin
  { id: "u-sysadmin-01", name: "System Admin", role: "ADMIN", email: "admin2@demo.gov.in", password: "demo1234", phone: "+91 99000 11000", employeeId: "ADM-0001", designation: "Administrator", zone: "Head Office", avatarColor: "purple", department: "IT", active: true, status: "ACTIVE", lastLogin: "2026-01-20T09:00:00" },

  // Commissioner & Addl. Commissioner (All 3 Zones)
  { id: "u-comm-01", name: "A Jyotheeswar Reddy", role: "COMMISSIONER", email: "comm@demo.gov.in", password: "demo1234", phone: "+91 90000 22222", employeeId: "COM-0001", designation: "Commissioner", zone: "Head Office", avatarColor: "rose", department: "Commissioner Office", active: true, status: "ACTIVE", lastLogin: "2026-01-22T11:00:00" },
  { id: "u-addl-comm-01", name: "Hemanthsai", role: "ADDITIONAL_COMMISSIONER", email: "addl@demo.gov.in", password: "demo1234", phone: "+91 90000 11111", employeeId: "ADC-0001", designation: "Additional Commissioner", zone: "Head Office", avatarColor: "rose", department: "Commissioner Office", active: true, status: "ACTIVE", lastLogin: "2026-01-22T11:00:00" },

  // Zone 1 Officers
  { id: "u-zdd-01", name: "Sri Harsha", role: "ZDD", email: "zdd@demo.gov.in", password: "demo1234", phone: "+91 94411 66230", employeeId: "ZDD-0001", designation: "Zonal Deputy Director - Zone 1", zone: "Zone 1", avatarColor: "blue", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T10:00:00" },
  { id: "u-zjd-01", name: "Sateesh M", role: "ZJD", email: "zjd@demo.gov.in", password: "demo1234", phone: "+91 94422 77340", employeeId: "ZJD-0001", designation: "Zonal Joint Director - Zone 1", zone: "Zone 1", avatarColor: "indigo", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T11:00:00" },
  { id: "u-tpa-01", name: "Soumith", role: "TPA", email: "tpa@demo.gov.in", password: "demo1234", phone: "+91 94400 55120", employeeId: "TPA-0001", designation: "Town Planning Assistant - TPA-01", zone: "Zone 1", avatarColor: "teal", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T09:00:00" },
  { id: "u-tpa-02", name: "N. Satish", role: "TPA", email: "tpa2@demo.gov.in", password: "demo1234", phone: "+91 94400 55121", employeeId: "TPA-0002", designation: "Town Planning Assistant - TPA-02", zone: "Zone 1", avatarColor: "teal", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T09:00:00" },

  // Zone 2 Officers
  { id: "u-zdd-02", name: "P. Ravinder", role: "ZDD", email: "zdd2@demo.gov.in", password: "demo1234", phone: "+91 94411 66231", employeeId: "ZDD-0002", designation: "Zonal Deputy Director - Zone 2", zone: "Zone 2", avatarColor: "blue", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T10:00:00" },
  { id: "u-zjd-02", name: "K. Uma Devi", role: "ZJD", email: "zjd2@demo.gov.in", password: "demo1234", phone: "+91 94422 77341", employeeId: "ZJD-0002", designation: "Zonal Joint Director - Zone 2", zone: "Zone 2", avatarColor: "indigo", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T11:00:00" },
  { id: "u-tpa-03", name: "R. Prasad", role: "TPA", email: "tpa3@demo.gov.in", password: "demo1234", phone: "+91 94400 55122", employeeId: "TPA-0003", designation: "Town Planning Assistant - TPA-03", zone: "Zone 2", avatarColor: "teal", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T09:00:00" },
  { id: "u-tpa-04", name: "K. Narayana", role: "TPA", email: "tpa4@demo.gov.in", password: "demo1234", phone: "+91 94400 55123", employeeId: "TPA-0004", designation: "Town Planning Assistant - TPA-04", zone: "Zone 2", avatarColor: "teal", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T09:00:00" },

  // Zone 3 Officers
  { id: "u-zdd-03", name: "Ch. Bhaskar", role: "ZDD", email: "zdd3@demo.gov.in", password: "demo1234", phone: "+91 94411 66232", employeeId: "ZDD-0003", designation: "Zonal Deputy Director - Zone 3", zone: "Zone 3", avatarColor: "blue", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T10:00:00" },
  { id: "u-zjd-03", name: "M. Padmavathi", role: "ZJD", email: "zjd3@demo.gov.in", password: "demo1234", phone: "+91 94422 77342", employeeId: "ZJD-0003", designation: "Zonal Joint Director - Zone 3", zone: "Zone 3", avatarColor: "indigo", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T11:00:00" },
  { id: "u-tpa-05", name: "V. Chandra", role: "TPA", email: "tpa5@demo.gov.in", password: "demo1234", phone: "+91 94400 55124", employeeId: "TPA-0005", designation: "Town Planning Assistant - TPA-05", zone: "Zone 3", avatarColor: "teal", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T09:00:00" },
  { id: "u-tpa-06", name: "L. Mahesh", role: "TPA", email: "tpa6@demo.gov.in", password: "demo1234", phone: "+91 94400 55125", employeeId: "TPA-0006", designation: "Town Planning Assistant - TPA-06", zone: "Zone 3", avatarColor: "teal", department: "Town Planning Wing", active: true, status: "ACTIVE", lastLogin: "2026-01-22T09:00:00" },

  // Zone 1 LTPs (mapped to TPA-01 & TPA-02)
  { id: "u-ltp-01", name: "Venu Kotte", role: "LTP", email: "ltp@demo.gov.in", password: "demo1234", phone: "+91 98220 14501", employeeId: "LTP-0001", designation: "Licensed Architect - LTP-01", zone: "Zone 1", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-02", name: "K. Ramesh", role: "LTP", email: "ltp2@demo.gov.in", password: "demo1234", phone: "+91 98220 14502", employeeId: "LTP-0002", designation: "Licensed Engineer - LTP-02", zone: "Zone 1", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-03", name: "P. Suresh", role: "LTP", email: "ltp3@demo.gov.in", password: "demo1234", phone: "+91 98220 14503", employeeId: "LTP-0003", designation: "Licensed Architect - LTP-03", zone: "Zone 1", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-04", name: "M. Srinivas", role: "LTP", email: "ltp4@demo.gov.in", password: "demo1234", phone: "+91 98220 14504", employeeId: "LTP-0004", designation: "Licensed Engineer - LTP-04", zone: "Zone 1", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-05", name: "G. Anitha", role: "LTP", email: "ltp5@demo.gov.in", password: "demo1234", phone: "+91 98220 14505", employeeId: "LTP-0005", designation: "Licensed Architect - LTP-05", zone: "Zone 1", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-06", name: "T. Rajesh", role: "LTP", email: "ltp6@demo.gov.in", password: "demo1234", phone: "+91 98220 14506", employeeId: "LTP-0006", designation: "Licensed Engineer - LTP-06", zone: "Zone 1", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },

  // Zone 2 LTPs (mapped to TPA-03 & TPA-04)
  { id: "u-ltp-07", name: "B. Venkatesh", role: "LTP", email: "ltp7@demo.gov.in", password: "demo1234", phone: "+91 98220 14507", employeeId: "LTP-0007", designation: "Licensed Architect - LTP-07", zone: "Zone 2", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-08", name: "S. Madhavi", role: "LTP", email: "ltp8@demo.gov.in", password: "demo1234", phone: "+91 98220 14508", employeeId: "LTP-0008", designation: "Licensed Engineer - LTP-08", zone: "Zone 2", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-09", name: "C. Praveen", role: "LTP", email: "ltp9@demo.gov.in", password: "demo1234", phone: "+91 98220 14509", employeeId: "LTP-0009", designation: "Licensed Architect - LTP-09", zone: "Zone 2", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-10", name: "D. Harish", role: "LTP", email: "ltp10@demo.gov.in", password: "demo1234", phone: "+91 98220 14510", employeeId: "LTP-0010", designation: "Licensed Engineer - LTP-10", zone: "Zone 2", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-11", name: "A. Swapna", role: "LTP", email: "ltp11@demo.gov.in", password: "demo1234", phone: "+91 98220 14511", employeeId: "LTP-0011", designation: "Licensed Architect - LTP-11", zone: "Zone 2", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-12", name: "V. Kalyan", role: "LTP", email: "ltp12@demo.gov.in", password: "demo1234", phone: "+91 98220 14512", employeeId: "LTP-0012", designation: "Licensed Engineer - LTP-12", zone: "Zone 2", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },

  // Zone 3 LTPs (mapped to TPA-05 & TPA-06)
  { id: "u-ltp-13", name: "N. Bhanu", role: "LTP", email: "ltp13@demo.gov.in", password: "demo1234", phone: "+91 98220 14513", employeeId: "LTP-0013", designation: "Licensed Architect - LTP-13", zone: "Zone 3", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-14", name: "R. Divya", role: "LTP", email: "ltp14@demo.gov.in", password: "demo1234", phone: "+91 98220 14514", employeeId: "LTP-0014", designation: "Licensed Engineer - LTP-14", zone: "Zone 3", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-15", name: "P. Naresh", role: "LTP", email: "ltp15@demo.gov.in", password: "demo1234", phone: "+91 98220 14515", employeeId: "LTP-0015", designation: "Licensed Architect - LTP-15", zone: "Zone 3", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-16", name: "K. Sravani", role: "LTP", email: "ltp16@demo.gov.in", password: "demo1234", phone: "+91 98220 14516", employeeId: "LTP-0016", designation: "Licensed Architect - LTP-16", zone: "Zone 3", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-17", name: "M. Kishore", role: "LTP", email: "ltp17@demo.gov.in", password: "demo1234", phone: "+91 98220 14517", employeeId: "LTP-0017", designation: "Licensed Engineer - LTP-17", zone: "Zone 3", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
  { id: "u-ltp-18", name: "L. Sandhya", role: "LTP", email: "ltp18@demo.gov.in", password: "demo1234", phone: "+91 98220 14518", employeeId: "LTP-0018", designation: "Licensed Architect - LTP-18", zone: "Zone 3", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-21T09:00:00" },
];

export function getUserByRole(role: RoleKey): User {
  return USERS.find((u) => u.role === role)!;
}

// ============================================================
// DEMO CREDENTIALS — Primary named users for Quick Login & Switch User
// ============================================================
export const DEMO_CREDENTIALS: { role: RoleKey; email: string; password: string; label: string }[] = [
  { role: "COMMISSIONER", email: "comm@demo.gov.in", password: "demo1234", label: "Commissioner (A Jyotheeswar Reddy)" },
  { role: "ADDITIONAL_COMMISSIONER", email: "addl@demo.gov.in", password: "demo1234", label: "Addl. Commissioner (Hemanthsai)" },
  { role: "ZDD", email: "zdd@demo.gov.in", password: "demo1234", label: "ZDD (Sri Harsha)" },
  { role: "ZJD", email: "zjd@demo.gov.in", password: "demo1234", label: "ZJD (Sateesh M)" },
  { role: "TPA", email: "tpa@demo.gov.in", password: "demo1234", label: "TPA (Soumith)" },
  { role: "LTP", email: "ltp@demo.gov.in", password: "demo1234", label: "LTP (Venu Kotte)" },
  { role: "ADMIN", email: "admin2@demo.gov.in", password: "demo1234", label: "Admin (System Admin)" },
];

// Re-export for compatibility
export { FEE_STRUCTURES, FEE_COMPONENTS };
export { WORKFLOW_STAGES };

// ============================================================
// SMS TEMPLATES
// ============================================================
export const SMS_TEMPLATES = [
  { id: "t1", code: "SMS_APP_SUBMIT", name: "Application Submitted", template: "Dear {name}, your building permission application {appNo} has been submitted successfully. Track at ltp-approval.gov.in/track — LTP Approval.", type: "TRANSACTIONAL", active: true },
  { id: "t2", code: "SMS_SCRUTINY_FAIL", name: "Scrutiny Failed", template: "Dear {name}, scrutiny for {appNo} has FAILED. Please re-upload corrected drawings. Ref: {reportNo}.", type: "TRANSACTIONAL", active: true },
  { id: "t3", code: "SMS_SCRUTINY_PASS", name: "Scrutiny Passed", template: "Dear {name}, scrutiny for {appNo} has PASSED. Upload required documents to proceed.", type: "TRANSACTIONAL", active: true },
  { id: "t4", code: "SMS_FEE_GEN", name: "Fee Generated", template: "Dear {name}, fee of ₹{amount} generated for {appNo}. Pay online within 15 days.", type: "TRANSACTIONAL", active: true },
  { id: "t5", code: "SMS_PAY_OK", name: "Payment Successful", template: "Dear {name}, payment of ₹{amount} received for {appNo}. Receipt {receiptNo}. Approval workflow initiated.", type: "TRANSACTIONAL", active: true },
  { id: "t6", code: "SMS_SHORTFALL", name: "Shortfall Raised", template: "Dear {name}, a shortfall has been raised on {appNo}. Respond within {dueDate} to avoid delay.", type: "TRANSACTIONAL", active: true },
  { id: "t7", code: "SMS_FORWARD", name: "Application Forwarded", template: "Dear {name}, {appNo} forwarded to {stage}. Current status: under review.", type: "TRANSACTIONAL", active: true },
  { id: "t8", code: "SMS_APPROVED", name: "Application Approved", template: "Dear {name}, your application {appNo} has been APPROVED. Permit no: {permitNo}.", type: "TRANSACTIONAL", active: true },
  { id: "t9", code: "SMS_REJECTED", name: "Application Rejected", template: "Dear {name}, your application {appNo} has been REJECTED. Reason: {reason}.", type: "TRANSACTIONAL", active: true },
  { id: "t10", code: "SMS_SF_RESPONDED", name: "Shortfall Responded", template: "Dear Officer, LTP has responded to shortfall {shortfallId} on {appNo}. Please review.", type: "TRANSACTIONAL", active: true },
];

// ============================================================
// HELPERS for building seed applications
// ============================================================

function makeDrawings(versions: { v: number; passed: boolean; date: string }[]): Drawing[] {
  return versions.map((d) => ({
    id: `dw-${d.v}-${Math.random().toString(36).slice(2, 6)}`,
    fileName: `Site_Plan_GroundFloor_v${d.v}.dwg`,
    fileType: "DWG" as const,
    fileSize: `${(7 + d.v * 0.3).toFixed(1)} MB`,
    version: d.v,
    uploadedAt: d.date,
    uploadedBy: "Venu Kotte",
    status: (d.passed ? "SCRUTINY_PASSED" : d.v === 1 ? "SCRUTINY_FAILED" : "SUPERSEDED") as Drawing["status"],
    notes: d.v === 1 && !d.passed ? "Failed — front setback non-compliant." : d.v > 1 ? `Revised per scrutiny remarks v${d.v - 1}.` : "Initial submission.",
  }));
}

type ScrutinyScenario = "front_setback" | "ground_coverage" | "far_fsi" | "parking" | "height" | "side_setback" | "passed_warnings" | "passed";

function makeScrutinyReport(version: number, scenario: ScrutinyScenario, date: string, reportNo?: string) {
  const checks: import("@/types").ScrutinyCheck[] = [
    {
      id: "sc-1", rule: "Front Setback Compliance", category: "Setbacks", severity: "CRITICAL",
      status: scenario === "front_setback" ? "FAIL" : "PASS",
      message: scenario === "front_setback" ? "Front setback 4.8 m is below minimum 6.0 m." : "Front setback 6.2 m compliant.",
      expectedValue: "6.0 m", observedValue: scenario === "front_setback" ? "4.8 m" : "6.2 m"
    },
    { id: "sc-2", rule: "Rear Setback Compliance", category: "Setbacks", severity: "MAJOR", status: "PASS", message: "Rear setback 4.1 m compliant.", expectedValue: "3.0 m", observedValue: "4.1 m" },
    {
      id: "sc-3", rule: "Ground Coverage", category: "Bulk & Density", severity: "MAJOR",
      status: scenario === "ground_coverage" ? "FAIL" : "PASS",
      message: scenario === "ground_coverage" ? "Coverage 68% exceeds permissible 60%." : "Coverage 58% compliant.",
      expectedValue: "60%", observedValue: scenario === "ground_coverage" ? "68%" : "58%"
    },
    {
      id: "sc-4", rule: "FAR / FSI Compliance", category: "Bulk & Density", severity: "CRITICAL",
      status: scenario === "far_fsi" ? "FAIL" : "PASS",
      message: scenario === "far_fsi" ? "Achieved FAR 1.82 exceeds permissible 1.50." : "Achieved FAR 1.42 compliant.",
      expectedValue: "1.50", observedValue: scenario === "far_fsi" ? "1.82" : "1.42"
    },
    {
      id: "sc-5", rule: "Height Restriction", category: "Bulk & Density", severity: "MAJOR",
      status: scenario === "height" ? "FAIL" : "PASS",
      message: scenario === "height" ? "Building height 18.4 m exceeds permissible 15 m." : "Building height 14.8 m compliant.",
      expectedValue: "15 m", observedValue: scenario === "height" ? "18.4 m" : "14.8 m"
    },
  ];
  const failed = checks.filter((c) => c.status === "FAIL").length;
  const warnings = checks.filter((c) => c.status === "WARNING").length;
  const passedCount = checks.filter((c) => c.status === "PASS").length;
  const totalChecks = checks.length;
  const overallStatus: import("@/types").ScrutinyReport["status"] = failed > 0 ? "FAILED" : warnings > 0 ? "PASSED_WITH_WARNINGS" : "PASSED";
  const summary = `${totalChecks} compliance checks were evaluated. ${passedCount} passed, ${failed} failed.`;
  const report: import("@/types").ScrutinyReport = {
    reportNo: reportNo ?? `SCR/2026/${String(Math.floor(1000 + Math.random() * 9000))}`,
    drawingVersion: version,
    generatedAt: date,
    status: overallStatus,
    summary,
    totalChecks,
    passed: passedCount,
    failed,
    warnings,
    checks,
  };
  return report;
}

function makeDocuments(stage: "early" | "partial" | "verified" | "shortfall"): DocumentRecord[] {
  return [
    { id: "d-1", name: "7/12 Land Extract", code: "DOC_712", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", fileName: "7_12_Extract.pdf", fileType: "pdf" },
    { id: "d-2", name: "Property Card / Mutation", code: "DOC_PROP_CARD", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", fileName: "Property_Card.pdf", fileType: "pdf" },
    { id: "d-3", name: "Architectural Drawings", code: "DOC_ARCH", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", fileName: "Architectural_Plan.pdf", fileType: "pdf" },
    { id: "d-4", name: "Structural Drawings & Stability", code: "DOC_STRUCT", required: true, status: stage === "shortfall" ? "SHORTFALL" : stage === "early" ? "REQUIRED" : "VERIFIED", fileName: "Structural_Stability.pdf", fileType: "pdf", shortfallReason: stage === "shortfall" ? "Structural stability certificate missing licensed SE stamp." : undefined },
    { id: "d-5", name: "Fire Safety NOC", code: "DOC_FIRE_NOC", required: true, status: stage === "early" || stage === "partial" ? "REQUIRED" : stage === "shortfall" ? "PENDING_VERIFICATION" : "VERIFIED", fileName: "Fire_NOC.pdf", fileType: "pdf" },
  ];
}

function makeFee(builtUpArea: number, docCount: number, paid: boolean, _totalOverride?: number) {
  const result = feeService.calculate({
    applicationType: "BUILDING_PERMISSION",
    propertyType: "RESIDENTIAL",
    builtUpArea,
    plotArea: Math.round(builtUpArea * 0.7),
    documentCount: docCount,
  });
  if (!result) return undefined;
  const appFee = feeService.toApplicationFee(result, paid ? result.total : 0);
  appFee.generatedAt = "2026-01-14T18:00:00";
  return appFee;
}

function makePayment(amount: number, success: boolean, date: string): Payment {
  return {
    id: `pay-${Math.random().toString(36).slice(2, 8)}`,
    transactionId: success ? `TXN${Date.now().toString().slice(-12)}` : "",
    referenceNo: `APCRDA/2026/${Math.floor(Math.random() * 900000) + 100000}`,
    status: success ? "SUCCESS" : "PENDING",
    amount,
    method: "NETBANKING",
    gateway: "APCRDA Payment Gateway",
    initiatedAt: success ? `${date}T12:05:00` : undefined,
    completedAt: success ? `${date}T12:09:00` : undefined,
    receiptNo: success ? `RCP/2026/${Math.floor(Math.random() * 90000) + 10000}` : undefined,
    verified: success,
    isMock: true,
  };
}

function makeWorkflowHistory(
  appNo: string,
  currentStage: WorkflowStageKey,
  status: ApplicationStatus,
  dates: string[]
): WorkflowHistoryEntry[] {
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const entries: WorkflowHistoryEntry[] = [
    {
      id: `wf-${appNo}-0`,
      stage: "APPLICATION_CREATED",
      stageLabel: "Application Created",
      actor: { name: "Applicant / LTP", role: "LTP" },
      action: "Application created",
      timestamp: dates[0] ?? "",
      status: "COMPLETED",
    },
    {
      id: `wf-${appNo}-1`,
      stage: "DRAWING_SCRUTINY",
      stageLabel: "Drawing Scrutiny",
      actor: { name: "Auto-Scrutiny Engine", role: "ADMIN" },
      action: status === "SCRUTINY_FAILED" ? "Scrutiny failed" : "Scrutiny passed",
      timestamp: dates[0] ?? "",
      status: status === "SCRUTINY_FAILED" ? "SHORTFALL" : "COMPLETED",
    },
  ];

  if (currentStage !== "APPLICATION_CREATED" && currentStage !== "DRAWING_SCRUTINY") {
    entries.push({
      id: `wf-${appNo}-2`,
      stage: currentStage,
      stageLabel: getStage(currentStage)?.label ?? currentStage,
      actor: isApproved || isRejected ? { name: "A Jyotheeswar Reddy", role: "COMMISSIONER" } : { name: "Review Officer", role: "TPA" },
      action: isApproved ? "Application approved" : isRejected ? "Application rejected" : "Review in progress",
      timestamp: dates[1] ?? dates[0] ?? "",
      status: isApproved || isRejected ? "COMPLETED" : "CURRENT",
    });
  }

  return entries;
}

function makeAuditLog(appNo: string, stage: WorkflowStageKey, dates: string[]): AuditEntry[] {
  return [
    { id: `a-${appNo}-1`, user: "LTP", role: "LTP", action: "Application created", entity: "Application", entityId: appNo, timestamp: dates[0] ?? "" },
    { id: `a-${appNo}-2`, user: "System", role: "ADMIN", action: "Drawing & PreDCR scrutinized", entity: "Drawing", entityId: appNo, timestamp: dates[0] ?? "" },
  ];
}

// ============================================================
// HIERARCHICAL APPLICATION GENERATOR
// Exactly 410 Applications across 3 Zones, 6 TPAs, and 18 LTPs
// Every LTP has between 20 and 28 applications.
// One source of truth — sums reconcile mathematically at every level.
// ============================================================

export interface LtpConfig {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  tpaId: string;
  tpaName: string;
  zone: "Zone 1" | "Zone 2" | "Zone 3";
  count: number;
}

export const LTP_CONFIGS: LtpConfig[] = [
  // Zone 1 — TPA-01 (71 apps: 23 + 27 + 21)
  { id: "u-ltp-01", name: "Venu Kotte", employeeId: "LTP-0001", email: "ltp@demo.gov.in", phone: "+91 98220 14501", tpaId: "u-tpa-01", tpaName: "Soumith", zone: "Zone 1", count: 23 },
  { id: "u-ltp-02", name: "K. Ramesh", employeeId: "LTP-0002", email: "ltp2@demo.gov.in", phone: "+91 98220 14502", tpaId: "u-tpa-01", tpaName: "Soumith", zone: "Zone 1", count: 27 },
  { id: "u-ltp-03", name: "P. Suresh", employeeId: "LTP-0003", email: "ltp3@demo.gov.in", phone: "+91 98220 14503", tpaId: "u-tpa-01", tpaName: "Soumith", zone: "Zone 1", count: 21 },
  // Zone 1 — TPA-02 (64 apps: 21 + 22 + 21)
  { id: "u-ltp-04", name: "M. Srinivas", employeeId: "LTP-0004", email: "ltp4@demo.gov.in", phone: "+91 98220 14504", tpaId: "u-tpa-02", tpaName: "N. Satish", zone: "Zone 1", count: 21 },
  { id: "u-ltp-05", name: "G. Anitha", employeeId: "LTP-0005", email: "ltp5@demo.gov.in", phone: "+91 98220 14505", tpaId: "u-tpa-02", tpaName: "N. Satish", zone: "Zone 1", count: 22 },
  { id: "u-ltp-06", name: "T. Rajesh", employeeId: "LTP-0006", email: "ltp6@demo.gov.in", phone: "+91 98220 14506", tpaId: "u-tpa-02", tpaName: "N. Satish", zone: "Zone 1", count: 21 },

  // Zone 2 — TPA-03 (74 apps: 24 + 26 + 24)
  { id: "u-ltp-07", name: "B. Venkatesh", employeeId: "LTP-0007", email: "ltp7@demo.gov.in", phone: "+91 98220 14507", tpaId: "u-tpa-03", tpaName: "R. Prasad", zone: "Zone 2", count: 24 },
  { id: "u-ltp-08", name: "S. Madhavi", employeeId: "LTP-0008", email: "ltp8@demo.gov.in", phone: "+91 98220 14508", tpaId: "u-tpa-03", tpaName: "R. Prasad", zone: "Zone 2", count: 26 },
  { id: "u-ltp-09", name: "C. Praveen", employeeId: "LTP-0009", email: "ltp9@demo.gov.in", phone: "+91 98220 14509", tpaId: "u-tpa-03", tpaName: "R. Prasad", zone: "Zone 2", count: 24 },
  // Zone 2 — TPA-04 (74 apps: 25 + 23 + 26)
  { id: "u-ltp-10", name: "D. Harish", employeeId: "LTP-0010", email: "ltp10@demo.gov.in", phone: "+91 98220 14510", tpaId: "u-tpa-04", tpaName: "K. Narayana", zone: "Zone 2", count: 25 },
  { id: "u-ltp-11", name: "A. Swapna", employeeId: "LTP-0011", email: "ltp11@demo.gov.in", phone: "+91 98220 14511", tpaId: "u-tpa-04", tpaName: "K. Narayana", zone: "Zone 2", count: 23 },
  { id: "u-ltp-12", name: "V. Kalyan", employeeId: "LTP-0012", email: "ltp12@demo.gov.in", phone: "+91 98220 14512", tpaId: "u-tpa-04", tpaName: "K. Narayana", zone: "Zone 2", count: 26 },

  // Zone 3 — TPA-05 (65 apps: 21 + 22 + 22)
  { id: "u-ltp-13", name: "N. Bhanu", employeeId: "LTP-0013", email: "ltp13@demo.gov.in", phone: "+91 98220 14513", tpaId: "u-tpa-05", tpaName: "V. Chandra", zone: "Zone 3", count: 21 },
  { id: "u-ltp-14", name: "R. Divya", employeeId: "LTP-0014", email: "ltp14@demo.gov.in", phone: "+91 98220 14514", tpaId: "u-tpa-05", tpaName: "V. Chandra", zone: "Zone 3", count: 22 },
  { id: "u-ltp-15", name: "P. Naresh", employeeId: "LTP-0015", email: "ltp15@demo.gov.in", phone: "+91 98220 14515", tpaId: "u-tpa-05", tpaName: "V. Chandra", zone: "Zone 3", count: 22 },
  // Zone 3 — TPA-06 (62 apps: 20 + 21 + 21)
  { id: "u-ltp-16", name: "K. Sravani", employeeId: "LTP-0016", email: "ltp16@demo.gov.in", phone: "+91 98220 14516", tpaId: "u-tpa-06", tpaName: "L. Mahesh", zone: "Zone 3", count: 20 },
  { id: "u-ltp-17", name: "M. Kishore", employeeId: "LTP-0017", email: "ltp17@demo.gov.in", phone: "+91 98220 14517", tpaId: "u-tpa-06", tpaName: "L. Mahesh", zone: "Zone 3", count: 21 },
  { id: "u-ltp-18", name: "L. Sandhya", employeeId: "LTP-0018", email: "ltp18@demo.gov.in", phone: "+91 98220 14518", tpaId: "u-tpa-06", tpaName: "L. Mahesh", zone: "Zone 3", count: 21 },
];

const LOCATIONS_BY_ZONE: Record<string, { area: string; ward: string; dist: string }[]> = {
  "Zone 1": [
    { area: "Baner", ward: "Ward 14 — Baner", dist: "Guntur / Amaravati" },
    { area: "Penumaka", ward: "Ward 03 — Penumaka", dist: "Guntur / Amaravati" },
    { area: "Undavalli", ward: "Ward 07 — Undavalli", dist: "Guntur / Amaravati" },
    { area: "Tadepalli", ward: "Ward 11 — Tadepalli", dist: "Guntur / Amaravati" },
    { area: "Mangalagiri", ward: "Ward 18 — Mangalagiri", dist: "Guntur / Amaravati" },
    { area: "Navuluru", ward: "Ward 09 — Navuluru", dist: "Guntur / Amaravati" },
  ],
  "Zone 2": [
    { area: "Madhurawada", ward: "Ward 05 — Madhurawada", dist: "Visakhapatnam" },
    { area: "Rushikonda", ward: "Ward 08 — Rushikonda", dist: "Visakhapatnam" },
    { area: "Gajuwaka", ward: "Ward 22 — Gajuwaka", dist: "Visakhapatnam" },
    { area: "MVP Colony", ward: "Ward 12 — MVP Colony", dist: "Visakhapatnam" },
    { area: "Kommadi", ward: "Ward 04 — Kommadi", dist: "Visakhapatnam" },
    { area: "Yendada", ward: "Ward 06 — Yendada", dist: "Visakhapatnam" },
  ],
  "Zone 3": [
    { area: "Renigunta", ward: "Ward 02 — Renigunta", dist: "Tirupati" },
    { area: "Chandragiri", ward: "Ward 06 — Chandragiri", dist: "Tirupati" },
    { area: "Karakambadi", ward: "Ward 09 — Karakambadi", dist: "Tirupati" },
    { area: "Alipiri", ward: "Ward 14 — Alipiri", dist: "Tirupati" },
    { area: "Tiruchanur", ward: "Ward 10 — Tiruchanur", dist: "Tirupati" },
    { area: "Settipalli", ward: "Ward 04 — Settipalli", dist: "Tirupati" },
  ],
};

const APPLICANT_FIRST_NAMES = [
  "Ramesh", "Suresh", "Priya", "Anil", "Deepak", "Sunita", "Nikhil", "Meena", "Rakesh", "Kavita",
  "Arjun", "Pooja", "Vivek", "Neha", "Rohit", "Sneha", "Kiran", "Divya", "Santosh", "Harish",
  "Venkatesh", "Madhavi", "Srinivas", "Anitha", "Rajesh", "Praveen", "Swapna", "Kalyan", "Naresh", "Sravani"
];
const APPLICANT_LAST_NAMES = [
  "Reddy", "Rao", "Sharma", "Varma", "Patil", "Deshmukh", "Kulkarni", "Joshi", "Iyer", "Nair",
  "Singh", "Verma", "Chowdary", "Gupta", "Murthy", "Bhat", "Sastry", "Acharya", "Mehta", "Menon"
];

const MONTHS = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"];

export function generateHierarchicalApplications(): Application[] {
  const apps: Application[] = [];
  let seq = 1;

  for (const ltp of LTP_CONFIGS) {
    const locs = LOCATIONS_BY_ZONE[ltp.zone] || LOCATIONS_BY_ZONE["Zone 1"];

    for (let j = 0; j < ltp.count; j++) {
      const appId = `app-${seq}`;
      const appIndex = seq;
      seq++;

      const isDraft = j < 2;
      const zoneNum = ltp.zone.replace("Zone ", "");
      const appNo = isDraft
        ? `D/1168/${String(appIndex).padStart(4, "0")}/BP/2026`
        : `AP/BP/2026/0${zoneNum}/${String(appIndex).padStart(4, "0")}`;

      const fName = APPLICANT_FIRST_NAMES[(appIndex + j) % APPLICANT_FIRST_NAMES.length];
      const lName = APPLICANT_LAST_NAMES[(appIndex * 3 + j) % APPLICANT_LAST_NAMES.length];
      const applicantName = `${fName} ${lName}`;
      const contact = `+91 ${98000 + (appIndex % 1000)} ${String(10000 + (appIndex * 17) % 90000)}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${appIndex}@email.com`;
      const loc = locs[j % locs.length];
      const address = `Plot ${12 + (j * 7) % 180}, Road No. ${(j % 8) + 1}, ${loc.area}, ${loc.dist}`;

      let status: ApplicationStatus = "APPROVED";
      let stage: WorkflowStageKey = "FINAL_DECISION";
      let stageLabel = "Final Approval / Proceeding Issued";
      let assignedOfficer: { name: string; role: RoleKey } | undefined = { name: "A Jyotheeswar Reddy", role: "COMMISSIONER" };
      let progress = 100;

      if (j === 0 || j === 1) {
        status = "DRAFT";
        stage = "APPLICATION_CREATED";
        stageLabel = "Application Created (Draft)";
        assignedOfficer = undefined;
        progress = 10;
      } else if (j === 2) {
        status = "SCRUTINY_FAILED";
        stage = "DRAWING_SCRUTINY";
        stageLabel = "Drawing Auto-Scrutiny (Failed)";
        assignedOfficer = undefined;
        progress = 20;
      } else if (j === 3) {
        status = "DOCUMENT_UPLOAD_PENDING";
        stage = "DOCUMENTS";
        stageLabel = "Document Verification Desk";
        assignedOfficer = { name: ltp.tpaName, role: "TPA" };
        progress = 30;
      } else if (j === 4 || j === 5) {
        status = "PAYMENT_PENDING";
        stage = "PAYMENT";
        stageLabel = "Fee & Betterment Payment";
        assignedOfficer = undefined;
        progress = 40;
      } else if (j === 6) {
        status = "SHORTFALL_RAISED";
        stage = "ZONAL_HEAD_REVIEW";
        stageLabel = "Zonal Technical Scrutiny (Shortfall)";
        assignedOfficer = { name: ltp.tpaName, role: "TPA" };
        progress = 55;
      } else if (j === 7) {
        status = "ZONAL_HEAD_REVIEW";
        stage = "ZONAL_HEAD_REVIEW";
        stageLabel = "Zonal Technical Scrutiny (TPA/ZDD)";
        assignedOfficer = { name: ltp.tpaName, role: "TPA" };
        progress = 60;
      } else if (j === 8) {
        status = "DIRECTOR_REVIEW";
        stage = "DIRECTOR_REVIEW";
        stageLabel = "Directorate Review";
        assignedOfficer = { name: "Shri. Suresh Nair", role: "DIRECTOR" };
        progress = 75;
      } else if (j === 9) {
        status = "ADDITIONAL_COMMISSIONER_REVIEW";
        stage = "ADDITIONAL_COMMISSIONER_REVIEW";
        stageLabel = "Additional Commissioner Review";
        assignedOfficer = { name: "Hemanthsai", role: "ADDITIONAL_COMMISSIONER" };
        progress = 85;
      } else if (j === 10 && ltp.count >= 25) {
        status = "REJECTED";
        stage = "FINAL_DECISION";
        stageLabel = "Application Rejected";
        assignedOfficer = { name: "A Jyotheeswar Reddy", role: "COMMISSIONER" };
        progress = 100;
      }

      // Categories: 6 categories matching UnifiedDashboard
      const catIdx = j % 6;
      let propertyType: "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" = "RESIDENTIAL";
      let projectType: import("@/types").ApplicationType = "BUILDING_PERMISSION";
      let projectName = "";
      let builtUpArea = 320;
      let plotArea = 250;

      if (catIdx === 0) {
        // Individual Residential
        propertyType = "RESIDENTIAL";
        projectType = "BUILDING_PERMISSION";
        builtUpArea = 280 + ((j * 17) % 240); // < 600
        plotArea = Math.round(builtUpArea * 0.75);
        projectName = `${lName} Bungalow Residence`;
      } else if (catIdx === 1) {
        // Apartment
        propertyType = "RESIDENTIAL";
        projectType = "BUILDING_PERMISSION";
        builtUpArea = 1200 + ((j * 35) % 1100); // 600 - 2500
        plotArea = Math.round(builtUpArea * 0.65);
        projectName = `${lName} Greenfield Residency Apartments`;
      } else if (catIdx === 2) {
        // Commercial
        propertyType = "COMMERCIAL";
        projectType = "BUILDING_PERMISSION";
        builtUpArea = 2600 + ((j * 55) % 2000);
        plotArea = Math.round(builtUpArea * 0.6);
        projectName = `${lName} Commercial Plaza`;
      } else if (catIdx === 3) {
        // Multistory Building
        propertyType = "RESIDENTIAL";
        projectType = "BUILDING_PERMISSION";
        builtUpArea = 6500 + ((j * 120) % 4500); // >= 2500
        plotArea = Math.round(builtUpArea * 0.55);
        projectName = `${lName} Royal Towers Multistory`;
      } else if (catIdx === 4) {
        // Group Development
        propertyType = "RESIDENTIAL";
        projectType = "LAYOUT_APPROVAL";
        builtUpArea = 2200 + ((j * 30) % 800);
        plotArea = 15000 + ((j * 500) % 10000);
        projectName = `${lName} Enclave Group Development Layout`;
      } else {
        // Other (Industrial)
        propertyType = "INDUSTRIAL";
        projectType = "DEVELOPMENT_PERMIT";
        builtUpArea = 3500 + ((j * 45) % 1500);
        plotArea = 4500 + ((j * 50) % 2000);
        projectName = `${lName} Industrial Logistics Center`;
      }

      const mStr = MONTHS[j % MONTHS.length];
      const day = String((j % 26) + 1).padStart(2, "0");
      const subDate = `${mStr}-${day}T09:30:00`;
      const lastUpDate = `${mStr}-${day}T16:45:00`;
      const dates = [subDate, lastUpDate];

      const isPaid = status === "APPROVED" || status === "ZONAL_HEAD_REVIEW" || status === "DIRECTOR_REVIEW" || status === "ADDITIONAL_COMMISSIONER_REVIEW" || status === "REJECTED";

      const fee = (status !== "DRAFT" && status !== "SCRUTINY_FAILED")
        ? makeFee(builtUpArea, 8, isPaid)
        : undefined;

      const payment = fee
        ? isPaid
          ? makePayment(fee.total, true, `${mStr}-${day}`)
          : {
              id: `pay-${appId}`,
              transactionId: "",
              referenceNo: "",
              status: "PENDING" as const,
              amount: 0,
              method: "NETBANKING" as const,
              gateway: "Mock Payment Gateway (Demo)",
              verified: false,
              isMock: true,
            }
        : undefined;

      const drawings = status === "DRAFT"
        ? []
        : status === "SCRUTINY_FAILED"
        ? [{
            id: `dw-${appId}-1`,
            fileName: `Site_Plan_GroundFloor_v1.dwg`,
            fileType: "DWG" as const,
            fileSize: "6.8 MB",
            version: 1,
            uploadedAt: subDate,
            uploadedBy: ltp.name,
            status: "SCRUTINY_FAILED" as const,
            notes: "Failed — front setback non-compliant with Zonal DCR.",
          }]
        : makeDrawings([{ v: 1, passed: true, date: subDate }]);

      const scrutinyReport = status === "DRAFT"
        ? undefined
        : status === "SCRUTINY_FAILED"
        ? makeScrutinyReport(1, "front_setback", subDate, `SCR/2026/${String(1000 + appIndex)}`)
        : makeScrutinyReport(1, "passed", subDate, `SCR/2026/${String(1000 + appIndex)}`);

      const documents = status === "DRAFT"
        ? makeDocuments("early")
        : status === "DOCUMENT_UPLOAD_PENDING"
        ? makeDocuments("partial")
        : status === "SHORTFALL_RAISED"
        ? makeDocuments("shortfall")
        : makeDocuments("verified");

      let shortfalls: Shortfall[] = [];
      let showCauses: ShowCause[] = [];
      if (status === "SHORTFALL_RAISED") {
        shortfalls = [
          {
            id: `sf-${appId}-1`,
            shortfallId: `SF/2026/${String(100 + appIndex).padStart(4, "0")}`,
            shortfallNumber: "SF-01",
            type: "DOCUMENT",
            title: "Structural Stability Certificate — missing SE stamp",
            description: "The structural stability certificate does not bear the stamp and signature of a Licensed Structural Engineer.",
            requiredAction: "Upload updated Structural Stability Certificate in PDF format bearing Licensed Structural Engineer (LSE) registration seal and signature.",
            requiredDocuments: ["Structural Stability Certificate (Signed & Sealed)", "LSE Registration License Copy"],
            raisedBy: { name: ltp.tpaName, role: "TPA" },
            department: "Structural Safety & Scrutiny Cell",
            raisedAt: lastUpDate,
            dueDate: "2026-10-25",
            status: "OPEN",
            applicationId: appId,
            applicationNo: appNo,
            stageRaisedAt: "ZONAL_HEAD_REVIEW",
            timeline: [
              {
                id: `sftl-${appId}-1`,
                title: "Shortfall Raised",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: lastUpDate,
                status: "OPEN",
                remarks: "Structural stability certificate missing SE stamp and signature.",
              },
            ],
          },
          {
            id: `sf-${appId}-2`,
            shortfallId: `SF/2026/${String(200 + appIndex).padStart(4, "0")}`,
            shortfallNumber: "SF-02",
            type: "TECHNICAL",
            title: "Setback Clarification & Parking Layout Verification",
            description: "Front setback is shown as 4.2m on sheet A-02 but calculated as 3.8m on schedule table. Additional site photograph and clarification required.",
            requiredAction: "Submit cross-verified site dimension plan and clarify discrepancy between sheet A-02 and drawing schedule.",
            requiredDocuments: ["Revised Ground Level Dimension Plan", "Site Geo-tagged Photographs"],
            raisedBy: { name: ltp.tpaName, role: "TPA" },
            department: "Town Planning Cell",
            raisedAt: "2026-09-10T11:00:00",
            dueDate: "2026-10-20",
            status: "REOPENED",
            applicationId: appId,
            applicationNo: appNo,
            stageRaisedAt: "ZONAL_HEAD_REVIEW",
            response: {
              text: "Initial clarification submitted on 15/09/2026 noting 4.2m setback as per physical peg marking on site.",
              respondedAt: "2026-09-15T14:30:00",
              supportingDocument: "Site_Peg_Marking_Survey.pdf",
            },
            responseVersions: [
              {
                version: 1,
                text: "Initial clarification submitted on 15/09/2026 noting 4.2m setback as per physical peg marking on site.",
                respondedAt: "2026-09-15T14:30:00",
                respondedBy: { name: ltp.name, role: "LTP" },
                supportingDocuments: [
                  { id: `doc-${appId}-v1-1`, name: "Site_Peg_Marking_Survey.pdf", size: "2.4 MB", type: "application/pdf" },
                ],
                supportingDocument: "Site_Peg_Marking_Survey.pdf",
              },
            ],
            timeline: [
              {
                id: `sftl-${appId}-2-1`,
                title: "Shortfall Raised",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-09-10T11:00:00",
                status: "OPEN",
                remarks: "Front setback discrepancy identified between sheet A-02 and schedule table.",
              },
              {
                id: `sftl-${appId}-2-2`,
                title: "Response Submitted (V1)",
                actor: { name: ltp.name, role: "LTP" },
                timestamp: "2026-09-15T14:30:00",
                status: "RESPONDED",
                remarks: "Initial clarification submitted with peg marking survey.",
              },
              {
                id: `sftl-${appId}-2-3`,
                title: "Under Review",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-09-18T10:15:00",
                status: "UNDER_REVIEW",
                description: "Officer reviewing peg marking survey and dimension cross-sections.",
              },
              {
                id: `sftl-${appId}-2-4`,
                title: "Clarification Required",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-09-22T16:00:00",
                status: "REOPENED",
                remarks: "Survey shows site pegs, but revised CAD drawing schedule was not updated. Please upload revised dimension plan.",
              },
            ],
          },
        ];
      } else if (j === 7) {
        shortfalls = [
          {
            id: `sf-${appId}-fnoc`,
            shortfallId: `SF/2026/${String(300 + appIndex).padStart(4, "0")}`,
            shortfallNumber: "SF-01",
            type: "GENERAL",
            title: "Fire Safety NOC Compliance Undertaking",
            description: "Provisional fire safety declaration and consultant registration certificate required for building height > 15m.",
            requiredAction: "Submit Fire Safety Undertaking on notarized stamp paper along with certified fire consultant credentials.",
            requiredDocuments: ["Fire Safety Undertaking", "Consultant Certification"],
            raisedBy: { name: ltp.tpaName, role: "TPA" },
            department: "Fire & Life Safety Desk",
            raisedAt: "2026-09-20T10:00:00",
            dueDate: "2026-10-30",
            status: "RESPONDED",
            applicationId: appId,
            applicationNo: appNo,
            stageRaisedAt: "ZONAL_HEAD_REVIEW",
            response: {
              text: "Uploaded provisional Fire Safety NOC compliance declaration form signed by developer and licensed fire safety consultant.",
              respondedAt: "2026-09-28T16:20:00",
              supportingDocument: "Fire_NOC_Compliance_Declaration.pdf",
            },
            responseVersions: [
              {
                version: 1,
                text: "Uploaded provisional Fire Safety NOC compliance declaration form signed by developer and licensed fire safety consultant.",
                respondedAt: "2026-09-28T16:20:00",
                respondedBy: { name: ltp.name, role: "LTP" },
                supportingDocuments: [
                  { id: `doc-${appId}-fnoc-1`, name: "Fire_NOC_Compliance_Declaration.pdf", size: "3.1 MB", type: "application/pdf" },
                ],
                supportingDocument: "Fire_NOC_Compliance_Declaration.pdf",
              },
            ],
            timeline: [
              {
                id: `sftl-${appId}-fnoc-1`,
                title: "Shortfall Raised",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-09-20T10:00:00",
                status: "OPEN",
                remarks: "Provisional fire safety declaration pending.",
              },
              {
                id: `sftl-${appId}-fnoc-2`,
                title: "Response Submitted (V1)",
                actor: { name: ltp.name, role: "LTP" },
                timestamp: "2026-09-28T16:20:00",
                status: "RESPONDED",
                remarks: "Uploaded provisional Fire Safety NOC compliance declaration form.",
              },
            ],
          },
        ];
      } else if (j === 8) {
        shortfalls = [
          {
            id: `sf-${appId}-rwh`,
            shortfallId: `SF/2026/${String(400 + appIndex).padStart(4, "0")}`,
            shortfallNumber: "SF-01",
            type: "TECHNICAL",
            title: "Rainwater Harvesting & Ground Water Recharging Pit Design",
            description: "Rainwater harvesting recharge pit dimension calculation not attached with landscape drawings.",
            requiredAction: "Attach hydraulic calculation and cross-section details of recharge pit complying with APCRDA standards.",
            requiredDocuments: ["RWH Hydraulic Calculations", "Recharge Pit Section Drawings (DWG/PDF)"],
            raisedBy: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
            department: "Engineering & Environment Section",
            raisedAt: "2026-09-18T14:00:00",
            dueDate: "2026-10-28",
            status: "UNDER_REVIEW",
            applicationId: appId,
            applicationNo: appNo,
            stageRaisedAt: "DIRECTOR_REVIEW",
            response: {
              text: "Revised stormwater drain calculation sheet and cross-sectional drawing of RWH recharge pit submitted.",
              respondedAt: "2026-09-26T11:45:00",
              supportingDocument: "RWH_Cross_Section_v2.pdf",
            },
            responseVersions: [
              {
                version: 1,
                text: "Revised stormwater drain calculation sheet and cross-sectional drawing of RWH recharge pit submitted.",
                respondedAt: "2026-09-26T11:45:00",
                respondedBy: { name: ltp.name, role: "LTP" },
                supportingDocuments: [
                  { id: `doc-${appId}-rwh-1`, name: "RWH_Cross_Section_v2.pdf", size: "4.8 MB", type: "application/pdf" },
                ],
                supportingDocument: "RWH_Cross_Section_v2.pdf",
              },
            ],
            timeline: [
              {
                id: `sftl-${appId}-rwh-1`,
                title: "Shortfall Raised",
                actor: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
                timestamp: "2026-09-18T14:00:00",
                status: "OPEN",
                remarks: "RWH recharge pit dimensions insufficient for plot extent.",
              },
              {
                id: `sftl-${appId}-rwh-2`,
                title: "Response Submitted (V1)",
                actor: { name: ltp.name, role: "LTP" },
                timestamp: "2026-09-26T11:45:00",
                status: "RESPONDED",
                remarks: "Revised stormwater drain calculation sheet submitted.",
              },
              {
                id: `sftl-${appId}-rwh-3`,
                title: "Under Review",
                actor: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
                timestamp: "2026-09-27T09:30:00",
                status: "UNDER_REVIEW",
                description: "Director technical cell reviewing hydraulic design calculation.",
              },
            ],
          },
        ];
      } else if (j === 0) {
        shortfalls = [
          {
            id: `sf-${appId}-soil`,
            shortfallId: `SF/2026/${String(500 + appIndex).padStart(4, "0")}`,
            shortfallNumber: "SF-01",
            type: "DOCUMENT",
            title: "Soil Bearing Capacity Test Report Verification",
            description: "Soil test report missing NABL laboratory accreditation stamp and engineer endorsement.",
            requiredAction: "Provide NABL accredited lab report with geotechnical engineer signature.",
            requiredDocuments: ["NABL Geotechnical Report"],
            raisedBy: { name: ltp.tpaName, role: "TPA" },
            department: "Engineering Division",
            raisedAt: "2026-08-01T10:00:00",
            dueDate: "2026-08-15",
            status: "RESOLVED",
            applicationId: appId,
            applicationNo: appNo,
            stageRaisedAt: "ZONAL_HEAD_REVIEW",
            resolution: "Soil test report verified by APCRDA Engineering Division. SBC value 180 kN/m² accepted for foundation design.",
            resolvedBy: { name: ltp.tpaName, role: "TPA" },
            resolvedAt: "2026-08-12T15:30:00",
            response: {
              text: "Uploaded NABL endorsed Geo-technical Investigation Report with geotechnical engineer signature.",
              respondedAt: "2026-08-08T12:00:00",
              supportingDocument: "NABL_Soil_Investigation_Report.pdf",
            },
            responseVersions: [
              {
                version: 1,
                text: "Uploaded NABL endorsed Geo-technical Investigation Report with geotechnical engineer signature.",
                respondedAt: "2026-08-08T12:00:00",
                respondedBy: { name: ltp.name, role: "LTP" },
                supportingDocuments: [
                  { id: `doc-${appId}-soil-1`, name: "NABL_Soil_Investigation_Report.pdf", size: "5.2 MB", type: "application/pdf" },
                ],
                supportingDocument: "NABL_Soil_Investigation_Report.pdf",
              },
            ],
            timeline: [
              {
                id: `sftl-${appId}-soil-1`,
                title: "Shortfall Raised",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-08-01T10:00:00",
                status: "OPEN",
                remarks: "Soil test report missing NABL laboratory accreditation stamp.",
              },
              {
                id: `sftl-${appId}-soil-2`,
                title: "Response Submitted (V1)",
                actor: { name: ltp.name, role: "LTP" },
                timestamp: "2026-08-08T12:00:00",
                status: "RESPONDED",
                remarks: "Uploaded NABL endorsed Geo-technical Investigation Report.",
              },
              {
                id: `sftl-${appId}-soil-3`,
                title: "Under Review",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-08-10T11:00:00",
                status: "UNDER_REVIEW",
                description: "Verification by Engineering Division",
              },
              {
                id: `sftl-${appId}-soil-4`,
                title: "Response Accepted / Closed",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-08-12T15:30:00",
                status: "RESOLVED",
                remarks: "Soil test report verified by APCRDA Engineering Division. SBC value accepted.",
              },
            ],
          },
        ];
      } else if (j === 3) {
        shortfalls = [
          {
            id: `sf-${appId}-ec`,
            shortfallId: `SF/2026/${String(600 + appIndex).padStart(4, "0")}`,
            shortfallNumber: "SF-01",
            type: "DOCUMENT",
            title: "Registered Encumbrance Certificate (EC) for 30 Years",
            description: "Submitted Encumbrance Certificate is only for 13 years. As per APCRDA Rule 12(b), search period must cover minimum 30 years from Sub-Registrar Office.",
            requiredAction: "Obtain and upload 30-year Registered Encumbrance Certificate (Form 15/16) from Registration Department.",
            requiredDocuments: ["30-Year Encumbrance Certificate (Form 15)"],
            raisedBy: { name: ltp.tpaName, role: "TPA" },
            department: "Revenue & Land Scrutiny Cell",
            raisedAt: "2026-03-01T10:00:00",
            dueDate: "2026-03-15", // In the past -> Overdue!
            status: "OPEN",
            applicationId: appId,
            applicationNo: appNo,
            stageRaisedAt: "DOCUMENTS",
            timeline: [
              {
                id: `sftl-${appId}-ec-1`,
                title: "Shortfall Raised",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-03-01T10:00:00",
                status: "OPEN",
                remarks: "30-year EC required from Sub-Registrar Office.",
              },
            ],
          },
        ];
      }

      // ---- Show Cause Notices ----
      if (j === 9) {
        showCauses = [
          {
            id: `sc-${appId}-hv`,
            showCauseId: `SCN/2026/${String(100 + appIndex).padStart(4, "0")}`,
            showCauseNumber: "SCN-01",
            violationType: "HEIGHT_VIOLATION",
            severity: "CRITICAL",
            title: "Unauthorised Extra Floor Construction Beyond Sanctioned Height",
            description: "Site inspection conducted on 18-Sep-2026 reveals construction of an additional floor (Ground + 4 floors) against sanctioned G+3 in approved plan. This constitutes a serious deviation under APCRDA Building Rules 2017, Rule 27(3).",
            violationDetails: "Sanctioned plan permits G+3 (12.5m). Actual construction measured at G+4 (15.8m). Deviation: 3.3m excess height and one additional floor slab.",
            requiredAction: "Submit sworn affidavit explaining the deviation with supporting survey report, or initiate demolition of the unauthorized floor within 30 days.",
            issuedBy: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
            department: "Enforcement & Compliance Wing",
            issuedAt: "2026-09-20T10:00:00",
            hearingDate: "2026-10-15T11:00:00",
            replyDueDate: "2026-10-10",
            status: "REPLY_PENDING",
            applicationId: appId,
            applicationNo: appNo,
            stageIssuedAt: "ADDITIONAL_COMMISSIONER_REVIEW",
            timeline: [
              {
                id: `sctl-${appId}-hv-1`,
                title: "Show Cause Notice Issued",
                actor: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
                timestamp: "2026-09-20T10:00:00",
                status: "ISSUED",
                remarks: "Site inspection reveals G+4 construction against sanctioned G+3.",
              },
              {
                id: `sctl-${appId}-hv-2`,
                title: "Hearing Scheduled",
                actor: { name: "Hemanthsai", role: "ADDITIONAL_COMMISSIONER" },
                timestamp: "2026-09-22T09:00:00",
                status: "HEARING_SCHEDULED",
                description: "Personal hearing scheduled for 15-Oct-2026 at 11:00 AM.",
              },
            ],
          },
          {
            id: `sc-${appId}-enc`,
            showCauseId: `SCN/2026/${String(200 + appIndex).padStart(4, "0")}`,
            showCauseNumber: "SCN-02",
            violationType: "ENCROACHMENT",
            severity: "HIGH",
            title: "Encroachment on Government Road Margin (ROW Violation)",
            description: "Compound wall constructed extending 0.9m into the 9m wide road margin reserved under Master Plan. Violation of APCRDA Building Rules 2017, Rule 18(b) — Road margin reservation.",
            violationDetails: "Plot boundary as per approved plan ends at 9m from road centre. Compound wall constructed at 8.1m. Encroachment: 0.9m into reserved margin.",
            requiredAction: "Remove encroaching portion of compound wall and restore road margin to original condition within 21 days. Submit compliance photograph and survey report.",
            issuedBy: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
            department: "Town Planning & Survey Section",
            issuedAt: "2026-09-25T14:00:00",
            replyDueDate: "2026-10-16",
            status: "REPLY_SUBMITTED",
            applicationId: appId,
            applicationNo: appNo,
            stageIssuedAt: "ADDITIONAL_COMMISSIONER_REVIEW",
            response: {
              text: "The compound wall was constructed based on physical site peg markings placed by the survey team. A revised survey is being arranged to verify the exact road margin. We request 30 additional days to submit the corrective compliance report.",
              respondedAt: "2026-10-02T16:30:00",
              supportingDocument: "Survey_Recheck_Request_Letter.pdf",
            },
            responseVersions: [
              {
                version: 1,
                text: "The compound wall was constructed based on physical site peg markings placed by the survey team. A revised survey is being arranged to verify the exact road margin.",
                respondedAt: "2026-10-02T16:30:00",
                respondedBy: { name: ltp.name, role: "LTP" },
                supportingDocuments: [
                  { id: `scdoc-${appId}-enc-1`, name: "Survey_Recheck_Request_Letter.pdf", size: "1.2 MB", type: "application/pdf" },
                ],
              },
            ],
            timeline: [
              {
                id: `sctl-${appId}-enc-1`,
                title: "Show Cause Notice Issued",
                actor: { name: "Shri. Suresh Nair", role: "DIRECTOR" },
                timestamp: "2026-09-25T14:00:00",
                status: "ISSUED",
                remarks: "Compound wall encroaching 0.9m into road margin.",
              },
              {
                id: `sctl-${appId}-enc-2`,
                title: "Reply Submitted",
                actor: { name: ltp.name, role: "LTP" },
                timestamp: "2026-10-02T16:30:00",
                status: "REPLY_SUBMITTED",
                remarks: "LTP submitted reply citing survey peg ambiguity.",
              },
            ],
          },
        ];
      } else if (j === 4) {
        showCauses = [
          {
            id: `sc-${appId}-uc`,
            showCauseId: `SCN/2026/${String(300 + appIndex).padStart(4, "0")}`,
            showCauseNumber: "SCN-01",
            violationType: "UNAUTHORIZED_CONSTRUCTION",
            severity: "CRITICAL",
            title: "Construction Commenced Without Valid Building Permission",
            description: "Physical inspection on 05-Aug-2026 confirms construction activity at site (foundation + plinth) prior to issuance of Building Permission Order. Violation of AP Buildings (Regulation of Promotion of Construction and Sale) Rules.",
            violationDetails: "Application is at Payment Pending stage. No permission order exists. Foundation poured and plinth beam cast as of inspection date.",
            requiredAction: "Stop construction immediately. Submit a stop-work compliance photograph within 7 days. Explain deviation via written submission with legal counsel affidavit.",
            issuedBy: { name: ltp.tpaName, role: "TPA" },
            department: "Site Enforcement & Monitoring Cell",
            issuedAt: "2026-08-06T10:00:00",
            replyDueDate: "2026-08-13",
            status: "PENALTY_IMPOSED",
            penaltyAmount: 150000,
            applicationId: appId,
            applicationNo: appNo,
            stageIssuedAt: "PAYMENT",
            orderDetails: "Order dated 22-Aug-2026: Penalty of ₹1,50,000 imposed under APCRDA Act Section 51. Construction stay order in force until payment cleared and regularisation approved.",
            response: {
              text: "Work has been stopped immediately as directed. Compliance photographs attached. We humbly submit that the foundation work was commenced based on verbal assurance from a field engineer, which was a misunderstanding. We seek regularisation and commit to full compliance.",
              respondedAt: "2026-08-12T11:00:00",
              supportingDocument: "Stop_Work_Compliance_Photos.pdf",
            },
            responseVersions: [
              {
                version: 1,
                text: "Work has been stopped immediately as directed. Compliance photographs attached.",
                respondedAt: "2026-08-12T11:00:00",
                respondedBy: { name: ltp.name, role: "LTP" },
                supportingDocuments: [
                  { id: `scdoc-${appId}-uc-1`, name: "Stop_Work_Compliance_Photos.pdf", size: "6.8 MB", type: "application/pdf" },
                ],
              },
            ],
            timeline: [
              {
                id: `sctl-${appId}-uc-1`,
                title: "Show Cause Notice Issued",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-08-06T10:00:00",
                status: "ISSUED",
                remarks: "Construction without permission detected during inspection.",
              },
              {
                id: `sctl-${appId}-uc-2`,
                title: "Reply Submitted",
                actor: { name: ltp.name, role: "LTP" },
                timestamp: "2026-08-12T11:00:00",
                status: "REPLY_SUBMITTED",
                remarks: "LTP confirmed stop-work and submitted compliance report.",
              },
              {
                id: `sctl-${appId}-uc-3`,
                title: "Order Passed",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-08-22T15:00:00",
                status: "ORDER_PASSED",
                description: "Penalty order issued.",
              },
              {
                id: `sctl-${appId}-uc-4`,
                title: "Penalty Imposed",
                actor: { name: ltp.tpaName, role: "TPA" },
                timestamp: "2026-08-22T15:30:00",
                status: "PENALTY_IMPOSED",
                remarks: "₹1,50,000 penalty imposed. Stay order in force.",
              },
            ],
          },
        ];
      }

      const app: Application = {
        id: appId,
        applicationNo: appNo,
        applicant: {
          name: applicantName,
          contact,
          email,
          address,
        },
        ltpId: ltp.id,
        ltpName: ltp.name,
        tpaId: ltp.tpaId,
        tpaName: ltp.tpaName,
        zone: ltp.zone,
        project: {
          name: projectName,
          type: projectType,
          propertyType,
          plotArea,
          builtUpArea,
          landUse: propertyType === "COMMERCIAL" ? "Commercial (C1)" : propertyType === "INDUSTRIAL" ? "Industrial (I1)" : "Residential (R1)",
          ward: loc.ward,
          zone: ltp.zone,
          surveyNo: `Sy. ${100 + (appIndex % 300)}/${(j % 4) + 1}`,
          address,
        },
        status,
        currentStage: stage,
        currentStageLabel: stageLabel,
        assignedOfficer,
        assignedAt: lastUpDate,
        submissionDate: subDate,
        lastUpdated: lastUpDate,
        expectedSLA: "2026-04-15",
        priority: builtUpArea > 5000 ? "HIGH" : "NORMAL",
        progress,
        fee,
        payment,
        drawings,
        scrutinyReport,
        documents,
        shortfalls,
        showCauses,
        workflowHistory: makeWorkflowHistory(appNo, stage, status, dates),
        auditLog: makeAuditLog(appNo, stage, dates),
        remarks: status === "APPROVED"
          ? [{ id: `r-${appId}`, author: { name: "A Jyotheeswar Reddy", role: "COMMISSIONER" }, text: "Sanctioned with standard APCRDA building bye-law conditions.", timestamp: lastUpDate, type: "DECISION" }]
          : status === "SHORTFALL_RAISED"
          ? [{ id: `r-${appId}`, author: { name: ltp.tpaName, role: "TPA" }, text: "Structural stability certificate requires licensed SE stamp. Shortfall raised.", timestamp: lastUpDate, type: "INSTRUCTION" }]
          : [],
      };

      apps.push(app);
    }
  }

  return apps;
}

export const SEED_APPLICATIONS: Application[] = generateHierarchicalApplications();

// ============================================================
// FEE ↔ PAYMENT CONSISTENCY
// Ensure Payment.amount = Fee.total and Fee.paidAmount/outstanding
// are mathematically consistent for all seed applications.
// subtotal + totalGST = total, total - paid = outstanding.
// ============================================================
SEED_APPLICATIONS.forEach((app) => {
  if (!app.fee) return;
  if (app.payment && app.payment.status === "SUCCESS") {
    app.fee.paidAmount = app.fee.total;
    app.fee.outstanding = 0;
    app.payment.amount = app.fee.total;
  } else {
    app.fee.outstanding = Math.max(0, app.fee.total - (app.fee.paidAmount ?? 0));
  }
});

// Seed notifications
export const SEED_NOTIFICATIONS: NotificationRecord[] = [
  { id: "n-1", type: "APPLICATION_FORWARDED", title: "Application forwarded to ZAD/ZDD", message: "AP/BP/2026/04/0007 has been forwarded to Shri. Ramesh Iyer (ZDD) for review.", timestamp: "2026-01-08T10:00:00", read: false, applicationId: "app-7", applicationNo: "AP/BP/2026/04/0007", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-2", type: "SHORTFALL_RAISED", title: "Shortfall raised — action required", message: "Shortfall SF/2026/0042 raised on AP/BP/2026/04/0013. Structural certificate needs SE stamp.", timestamp: "2026-01-14T11:00:00", read: false, applicationId: "app-13", applicationNo: "AP/BP/2026/04/0013", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-3", type: "PAYMENT_SUCCESSFUL", title: "Payment successful", message: "Payment of ₹2,67,850 received for AP/BP/2026/04/0005. Approval workflow initiated.", timestamp: "2026-01-08T12:09:00", read: true, applicationId: "app-5", applicationNo: "AP/BP/2026/04/0005", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-4", type: "SCRUTINY_FAILED", title: "Scrutiny failed — re-upload required", message: "AP/BP/2026/04/0002 failed scrutiny: front setback non-compliant.", timestamp: "2026-01-18T13:22:00", read: false, applicationId: "app-2", applicationNo: "AP/BP/2026/04/0002", smsSent: true, smsStatus: "FAILED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-5", type: "APPLICATION_APPROVED", title: "Application approved", message: "AP/BP/2026/04/0012 has been approved by the Commissioner.", timestamp: "2025-12-29T16:30:00", read: true, applicationId: "app-12", applicationNo: "AP/BP/2026/04/0012", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-6", type: "SHORTFALL_RESOLVED", title: "Shortfall resolved", message: "Shortfall SF/2026/0038 on AP/BP/2026/04/0014 has been resolved.", timestamp: "2026-01-11T14:00:00", read: true, applicationId: "app-14", applicationNo: "AP/BP/2026/04/0014", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
];

// Seed SMS logs
export const SEED_SMS_LOGS: SmsLog[] = SEED_NOTIFICATIONS.filter((n) => n.smsSent).map((n) => ({
  id: `sms-seed-${n.id}`,
  notificationId: n.id,
  recipient: "+91 98900 11223",
  recipientName: "Demo Applicant",
  message: n.message,
  templateCode: "SMS_SYSTEM",
  status: n.smsStatus ?? "PENDING",
  sentAt: n.timestamp,
  deliveredAt: n.smsStatus === "DELIVERED" ? n.timestamp : undefined,
  applicationNo: n.applicationNo,
  isMock: true,
}));

// ============================================================
// APPLICATION TYPE CONFIGURATION (admin-configurable)
// ============================================================
export const SEED_APPLICATION_TYPES: ApplicationTypeConfig[] = [
  { key: "BUILDING_PERMISSION", name: "Building Permission", description: "New building construction permit", active: true, typicalDuration: "30 days" },
  { key: "LAYOUT_APPROVAL", name: "Layout Approval", description: "Land subdivision / layout sanction", active: true, typicalDuration: "45 days" },
  { key: "OCCUPANCY_CERTIFICATE", name: "Occupancy Certificate", description: "Post-construction occupancy approval", active: true, typicalDuration: "15 days" },
  { key: "REVISION_PERMISSION", name: "Revision Permission", description: "Revision to an approved plan", active: true, typicalDuration: "21 days" },
  { key: "DEVELOPMENT_PERMIT", name: "Development Permit", description: "Land development permission", active: true, typicalDuration: "60 days" },
  { key: "DEMOLITION_PERMIT", name: "Demolition Permit", description: "Permission for building demolition", active: false, typicalDuration: "10 days" },
];

// ============================================================
// SYSTEM SETTINGS (admin-configurable, single source of truth)
// ============================================================
export const SEED_SYSTEM_SETTINGS: SystemSettings = {
  portalName: "Building Permission System",
  portalSubtitle: "Building Permit Management System",
  dateFormat: "DD MMM YYYY",
  currency: "INR",
  maxFileSizeMB: 10,
  allowedDrawingFormats: ["DWG", "DXF", "PDF"],
  allowedDocumentFormats: ["PDF", "JPG", "PNG"],
  sessionTimeoutMinutes: 30,
  demoMode: true,
  // All roles have full access to all modules by default.
  // Administrator can restrict these in Settings → Access Control.
  roleAccessConfig: {
    LTP:                  { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "none", outward: "none" },
    TPA:                  { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "none", outward: "full" },
    ZDD:                  { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
    ZJD:                  { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
    ZONAL_HEAD:           { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
    DIRECTOR:             { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
    ADDITIONAL_COMMISSIONER: { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
    COMMISSIONER:         { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
    ADMIN:                { dashboard: "full", "application-submission": "full", applications: "full", "application-status": "full", compliance: "full", "proceeding-status": "full", "compliance-v2": "full", commencement: "full", occupancy: "full", "change-of-ltp": "full", reports: "full", registration: "full", outward: "full" },
  },
  userAccessConfig: {},
  hideRestrictedModules: false,
  approvalSequence: [
    { id: "step-1", role: "ZONAL_HEAD", label: "Zonal Head Review", order: 1, canApprove: false, canReturn: true, canRaiseShortfall: true, nextRoleId: "step-2" },
    { id: "step-2", role: "DIRECTOR", label: "Director Review", order: 2, canApprove: true, canReturn: true, canRaiseShortfall: true, nextRoleId: "step-3" },
    { id: "step-3", role: "ADDITIONAL_COMMISSIONER", label: "Addl. Commissioner Review", order: 3, canApprove: true, canReturn: true, canRaiseShortfall: false, nextRoleId: "step-4" },
    { id: "step-4", role: "COMMISSIONER", label: "Commissioner Review", order: 4, canApprove: true, canReturn: true, canRaiseShortfall: false, nextRoleId: null },
  ],
};

// Backward-compatible exports
export const APPLICATIONS = SEED_APPLICATIONS;
export const NOTIFICATIONS = SEED_NOTIFICATIONS;

// Backward-compatible helper functions (for views that still import them)
export function applicationsForRole(role: RoleKey): Application[] {
  return SEED_APPLICATIONS;
}
export function resolveShortfallList(): Shortfall[] {
  return SEED_APPLICATIONS.flatMap((a) => a.shortfalls);
}

// Re-export the build helpers for any views that use them
export { makeDrawings as buildDrawings, makeScrutinyReport as buildScrutinyReport, makeDocuments as buildDocuments };
