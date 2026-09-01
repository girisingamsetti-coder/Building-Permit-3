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
    description: "Creates and submits building approval applications on behalf of applicants.",
    level: 0,
    color: "emerald",
    permissions: ["application:create", "application:view_own", "drawing:upload", "document:upload", "payment:initiate", "remarks:add"],
  },
  TPS: {
    key: "TPS",
    title: "TPS",
    fullName: "Town Planning Supervisor",
    description: "Performs technical scrutiny of drawings, submits technical scrutiny report, raises technical shortfalls, forwards to TPA.",
    level: 1,
    color: "teal",
    permissions: ["application:view_all", "drawing:scrutinize", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  TPA: {
    key: "TPA",
    title: "TPA",
    fullName: "Town Planning Assistant",
    description: "Reviews applications and technical scrutiny, raises document/fee shortfalls, verifies documents, forwards to ZAD/ZDD.",
    level: 1,
    color: "teal",
    permissions: ["application:view_all", "document:verify", "workflow:forward", "workflow:return", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  ZAD: {
    key: "ZAD",
    title: "ZAD",
    fullName: "Zonal Assistant Director",
    description: "Reviews applications at zonal level, raises shortfalls, approves/forwards.",
    level: 2,
    color: "cyan",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "workflow:return", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  ZDD: {
    key: "ZDD",
    title: "ZDD",
    fullName: "Zonal Deputy Director",
    description: "Approves/forwards applications within the zone.",
    level: 2,
    color: "cyan",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "workflow:return", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  ZJD: {
    key: "ZJD",
    title: "ZJD",
    fullName: "Zonal Joint Director",
    description: "Reviews, approves, forwards, and may raise/report fee shortfalls.",
    level: 3,
    color: "amber",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  DIRECTOR_DP: {
    key: "DIRECTOR_DP",
    title: "Director – DP",
    fullName: "Director of Town & Country Planning",
    description: "Director-level review, shortfall reporting and forwarding.",
    level: 4,
    color: "amber",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "shortfall:resolve", "remarks:add"],
  },
  ADDL_COMMISSIONER: {
    key: "ADDL_COMMISSIONER",
    title: "Addl. Commissioner",
    fullName: "Additional Commissioner",
    description: "Senior review and forwarding to Commissioner.",
    level: 5,
    color: "rose",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "remarks:add"],
  },
  COMMISSIONER: {
    key: "COMMISSIONER",
    title: "Commissioner",
    fullName: "Commissioner of the Authority",
    description: "Final authority — issues final approval or rejection.",
    level: 6,
    color: "rose",
    permissions: ["application:view_all", "workflow:approve", "workflow:reject", "workflow:return", "remarks:add"],
  },
  ADMIN: {
    key: "ADMIN",
    title: "Administrator",
    fullName: "System Administrator",
    description: "Manages users, roles, configuration, fee structures and audit.",
    level: 99,
    color: "slate",
    permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage", "fee:manage"],
  },
};

// ============================================================
// USERS — demo officers for every role (2026)
// ============================================================
export const USERS: User[] = [
  { id: "u-ltp-01", name: "Ar. Vikram Deshpande", role: "LTP", email: "ltp@demo.gov.in", phone: "+91 98220 14578", licenseNo: "LTP-MC-2019-0457", designation: "Architect & Licensed Technical Person", zone: "Zone IV — West", avatarColor: "emerald", department: "Private Practice", active: true, status: "ACTIVE", lastLogin: "2026-01-20T09:12:00" },
  { id: "u-tps-01", name: "Smt. Meena Kulkarni", role: "TPS", email: "tps@demo.gov.in", phone: "+91 99230 87120", employeeId: "MUN-TPS-1042", designation: "Town Planning Supervisor", zone: "Zone IV — West", avatarColor: "teal", department: "Department of Town Planning", active: true, status: "ACTIVE", lastLogin: "2026-01-20T08:40:00" },
  { id: "u-tpa-01", name: "Shri. Rajesh Patil", role: "TPA", email: "tpa@demo.gov.in", phone: "+91 98700 33214", employeeId: "MUN-TPA-0218", designation: "Town Planning Assistant", zone: "Zone IV — West", avatarColor: "teal", department: "Department of Town Planning", active: true, status: "ACTIVE", lastLogin: "2026-01-20T09:00:00" },
  { id: "u-zad-01", name: "Shri. Suresh Kadam", role: "ZAD", email: "zad@demo.gov.in", phone: "+91 98190 44521", employeeId: "MUN-ZAD-0156", designation: "Zonal Assistant Director", zone: "Zone IV — West", avatarColor: "cyan", department: "Zonal Office — West", active: true, status: "ACTIVE", lastLogin: "2026-01-19T17:25:00" },
  { id: "u-zdd-01", name: "Shri. Ramesh Iyer", role: "ZDD", email: "zdd@demo.gov.in", phone: "+91 98190 33214", employeeId: "MUN-ZDD-0218", designation: "Zonal Deputy Director", zone: "Zone IV — West", avatarColor: "cyan", department: "Zonal Office — West", active: true, status: "ACTIVE", lastLogin: "2026-01-19T17:25:00" },
  { id: "u-zjd-01", name: "Smt. Anjali Rao", role: "ZJD", email: "zjd@demo.gov.in", phone: "+91 99700 51288", employeeId: "MUN-ZJD-0107", designation: "Zonal Joint Director", zone: "Zone IV — West", avatarColor: "amber", department: "Zonal Office — West", active: true, status: "ACTIVE", lastLogin: "2026-01-20T10:05:00" },
  { id: "u-dir-01", name: "Shri. Suresh Nair", role: "DIRECTOR_DP", email: "director@demo.gov.in", phone: "+91 98690 70011", employeeId: "MUN-DIR-0009", designation: "Director, Town & Country Planning", zone: "Head Office", avatarColor: "amber", department: "Directorate of Town Planning", active: true, status: "ACTIVE", lastLogin: "2026-01-20T09:55:00" },
  { id: "u-addl-01", name: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER", email: "addlcomm@demo.gov.in", phone: "+91 98220 55601", employeeId: "MUN-ADDC-0007", designation: "Additional Commissioner", zone: "Head Office", avatarColor: "rose", department: "Office of the Commissioner", active: true, status: "ACTIVE", lastLogin: "2026-01-20T10:30:00" },
  { id: "u-com-01", name: "Dr. Pratap Reddy", role: "COMMISSIONER", email: "commissioner@demo.gov.in", phone: "+91 98220 00001", employeeId: "MUN-COM-0001", designation: "Commissioner", zone: "Head Office", avatarColor: "rose", department: "Office of the Commissioner", active: true, status: "ACTIVE", lastLogin: "2026-01-20T11:20:00" },
  { id: "u-admin-01", name: "Shri. Kailash Patil", role: "ADMIN", email: "admin@demo.gov.in", phone: "+91 99300 44881", employeeId: "MUN-ADM-0003", designation: "System Administrator", zone: "Head Office", avatarColor: "slate", department: "IT & e-Governance Cell", active: true, status: "ACTIVE", lastLogin: "2026-01-20T09:00:00" },
];

export function getUserByRole(role: RoleKey): User {
  return USERS.find((u) => u.role === role)!;
}

// ============================================================
// DEMO CREDENTIALS
// ============================================================
export const DEMO_CREDENTIALS: { role: RoleKey; email: string; password: string; label: string }[] = [
  { role: "LTP", email: "ltp@demo.gov.in", password: "demo1234", label: "LTP — Applicant Portal" },
  { role: "TPS", email: "tps@demo.gov.in", password: "demo1234", label: "TPS — Technical Scrutiny" },
  { role: "TPA", email: "tpa@demo.gov.in", password: "demo1234", label: "TPA — Application Review" },
  { role: "ZAD", email: "zad@demo.gov.in", password: "demo1234", label: "ZAD — Zonal Asst. Director" },
  { role: "ZDD", email: "zdd@demo.gov.in", password: "demo1234", label: "ZDD — Zonal Deputy Director" },
  { role: "ZJD", email: "zjd@demo.gov.in", password: "demo1234", label: "ZJD — Zonal Joint Director" },
  { role: "DIRECTOR_DP", email: "director@demo.gov.in", password: "demo1234", label: "Director — Town & Country Planning" },
  { role: "ADDL_COMMISSIONER", email: "addlcomm@demo.gov.in", password: "demo1234", label: "Additional Commissioner" },
  { role: "COMMISSIONER", email: "commissioner@demo.gov.in", password: "demo1234", label: "Commissioner" },
  { role: "ADMIN", email: "admin@demo.gov.in", password: "demo1234", label: "System Administrator" },
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
    uploadedBy: "Ar. Vikram Deshpande",
    status: (d.passed ? "SCRUTINY_PASSED" : d.v === 1 ? "SCRUTINY_FAILED" : "SUPERSEDED") as Drawing["status"],
    notes: d.v === 1 && !d.passed ? "Failed — front setback non-compliant." : d.v > 1 ? `Revised per scrutiny remarks v${d.v - 1}.` : "Initial submission.",
  }));
}

type ScrutinyScenario = "front_setback" | "ground_coverage" | "far_fsi" | "parking" | "height" | "side_setback" | "passed_warnings" | "passed";

function makeScrutinyReport(version: number, scenario: ScrutinyScenario, date: string, reportNo?: string) {
  const checks: import("@/types").ScrutinyCheck[] = [
    { id: "sc-1", rule: "Front Setback Compliance", category: "Setbacks", severity: "CRITICAL",
      status: scenario === "front_setback" ? "FAIL" : "PASS",
      message: scenario === "front_setback" ? "Front setback 4.8 m is below minimum 6.0 m." : "Front setback 6.2 m exceeds minimum 6.0 m.",
      recommendation: scenario === "front_setback" ? "Increase front setback to a minimum of 6.0 m." : undefined,
      expectedValue: "6.0 m", observedValue: scenario === "front_setback" ? "4.8 m" : "6.2 m" },
    { id: "sc-2", rule: "Rear Setback Compliance", category: "Setbacks", severity: "MAJOR", status: "PASS", message: "Rear setback 4.1 m compliant.", expectedValue: "3.0 m", observedValue: "4.1 m" },
    { id: "sc-3", rule: "Side Setback (East)", category: "Setbacks", severity: "MAJOR",
      status: scenario === "side_setback" ? "FAIL" : "PASS",
      message: scenario === "side_setback" ? "Side setback 1.9 m is below required 3.0 m." : "3.2 m compliant.",
      recommendation: scenario === "side_setback" ? "Revise side setback to minimum 3.0 m." : undefined,
      expectedValue: "3.0 m", observedValue: scenario === "side_setback" ? "1.9 m" : "3.2 m" },
    { id: "sc-4", rule: "Side Setback (West)", category: "Setbacks", severity: "MAJOR", status: "PASS", message: "3.0 m compliant.", expectedValue: "3.0 m", observedValue: "3.0 m" },
    { id: "sc-5", rule: "Ground Coverage", category: "Bulk & Density", severity: "MAJOR",
      status: scenario === "ground_coverage" ? "FAIL" : "PASS",
      message: scenario === "ground_coverage" ? "Coverage 68% exceeds permissible 60%." : "Coverage 58% within 60% limit.",
      recommendation: scenario === "ground_coverage" ? "Reduce ground coverage within permissible limit." : undefined,
      expectedValue: "60%", observedValue: scenario === "ground_coverage" ? "68%" : "58%" },
    { id: "sc-6", rule: "FAR / FSI Compliance", category: "Bulk & Density", severity: "CRITICAL",
      status: scenario === "far_fsi" ? "FAIL" : "PASS",
      message: scenario === "far_fsi" ? "Achieved FAR 1.82 exceeds permissible 1.50." : "Achieved FAR 1.42 against permissible 1.50.",
      recommendation: scenario === "far_fsi" ? "Revise built-up area to reduce FAR within permissible limit." : undefined,
      expectedValue: "1.50", observedValue: scenario === "far_fsi" ? "1.82" : "1.42" },
    { id: "sc-7", rule: "Height Restriction", category: "Bulk & Density", severity: "MAJOR",
      status: scenario === "height" ? "FAIL" : "PASS",
      message: scenario === "height" ? "Building height 18.4 m exceeds permissible 15 m." : "Building height 14.8 m within 15 m limit.",
      recommendation: scenario === "height" ? "Revise building height to within permissible limit." : undefined,
      expectedValue: "15 m", observedValue: scenario === "height" ? "18.4 m" : "14.8 m" },
    { id: "sc-8", rule: "Parking Provision", category: "Amenities", severity: "MAJOR",
      status: scenario === "parking" ? "FAIL" : "PASS",
      message: scenario === "parking" ? "16 ECS provided, 24 required." : "24 ECS provided, 22 required.",
      recommendation: scenario === "parking" ? "Provide required parking spaces (24 ECS)." : undefined,
      expectedValue: "24 ECS", observedValue: scenario === "parking" ? "16 ECS" : "24 ECS" },
    { id: "sc-9", rule: "Rain Water Harvesting", category: "Sustainability", severity: "MINOR", status: "PASS", message: "RWH pit shown at NE corner." },
    { id: "sc-10", rule: "Sewage Treatment Plant", category: "Sustainability", severity: "MINOR",
      status: scenario === "passed_warnings" ? "WARNING" : "PASS",
      message: scenario === "passed_warnings" ? "STP capacity calculation sheet not attached." : "STP of 30 KLD provided.",
      recommendation: scenario === "passed_warnings" ? "Attach STP capacity calculation." : undefined },
    { id: "sc-11", rule: "Fire Safety — Exit Width", category: "Fire & Safety", severity: "CRITICAL", status: "PASS", message: "Stair width 1.8 m compliant." },
    { id: "sc-12", rule: "Fire Safety — Refuge Area", category: "Fire & Safety", severity: "MAJOR", status: "PASS", message: "Refuge area provided at 7th floor." },
    { id: "sc-13", rule: "Tree Plantation", category: "Environment", severity: "MINOR",
      status: scenario === "passed_warnings" ? "WARNING" : "PASS",
      message: scenario === "passed_warnings" ? "Landscape plan missing tree species details." : "Tree species indicated on landscape plan.",
      recommendation: scenario === "passed_warnings" ? "Add tree species details to landscape plan." : undefined },
    { id: "sc-14", rule: "Accessibility — Ramp", category: "Accessibility", severity: "MAJOR", status: "PASS", message: "1:12 ramp at main entrance." },
    { id: "sc-15", rule: "Title & North Arrow", category: "Drawing Standards", severity: "MINOR", status: "PASS", message: "Title block and north arrow present." },
  ];
  const failed = checks.filter((c) => c.status === "FAIL").length;
  const warnings = checks.filter((c) => c.status === "WARNING").length;
  const passedCount = checks.filter((c) => c.status === "PASS").length;
  const totalChecks = checks.length;
  const overallStatus: import("@/types").ScrutinyReport["status"] = failed > 0 ? "FAILED" : warnings > 0 ? "PASSED_WITH_WARNINGS" : "PASSED";
  const summary = `${totalChecks} compliance checks were evaluated. ${passedCount} passed, ${failed} failed, and ${warnings} warning${warnings === 1 ? "" : "s"} require${warnings === 1 ? "s" : ""} attention.`;
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
  const base: DocumentRecord[] = [
    { id: "d-1", name: "7/12 Land Extract", code: "DOC_712", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2026-01-06T10:00:00", version: 1, fileSize: "1.2 MB", verifiedBy: stage === "early" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "early" ? undefined : "2026-01-09T14:20:00" },
    { id: "d-2", name: "Property Card / Mutation", code: "DOC_PROP_CARD", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2026-01-06T10:05:00", version: 1, fileSize: "0.9 MB", verifiedBy: stage === "early" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "early" ? undefined : "2026-01-09T14:22:00" },
    { id: "d-3", name: "Architectural Drawings (stamped)", code: "DOC_ARCH", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2026-01-12T11:25:00", version: 3, fileSize: "8.4 MB", verifiedBy: stage === "early" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "early" ? undefined : "2026-01-13T09:10:00" },
    { id: "d-4", name: "Structural Drawings & Stability Certificate", code: "DOC_STRUCT", required: true, status: stage === "shortfall" ? "SHORTFALL" : stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2026-01-12T11:30:00", version: stage === "early" ? undefined : 1, fileSize: stage === "early" ? undefined : "6.1 MB", verifiedBy: stage === "shortfall" || stage === "early" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "shortfall" || stage === "early" ? undefined : "2026-01-13T09:15:00", remarks: stage === "shortfall" ? "Structural stability certificate missing licensed SE stamp." : undefined },
    { id: "d-5", name: "NOC from Fire Department", code: "DOC_FIRE_NOC", required: true, status: stage === "early" || stage === "partial" ? "REQUIRED" : stage === "shortfall" ? "UPLOADED" : "VERIFIED", uploadedAt: stage === "early" || stage === "partial" ? undefined : "2026-01-13T16:40:00", version: stage === "early" || stage === "partial" ? undefined : 1, fileSize: stage === "early" || stage === "partial" ? undefined : "0.7 MB", verifiedBy: stage === "early" || stage === "partial" || stage === "shortfall" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "early" || stage === "partial" || stage === "shortfall" ? undefined : "2026-01-14T10:00:00" },
    { id: "d-6", name: "Environmental Clearance", code: "DOC_ENV", required: false, status: stage === "early" ? "REQUIRED" : "UPLOADED", uploadedAt: stage === "early" ? undefined : "2026-01-13T16:42:00", version: stage === "early" ? undefined : 1, fileSize: stage === "early" ? undefined : "1.4 MB" },
    { id: "d-7", name: "Society / Landowner Authorization", code: "DOC_AUTH", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2026-01-06T10:08:00", version: 1, fileSize: "0.5 MB", verifiedBy: stage === "early" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "early" ? undefined : "2026-01-09T14:25:00" },
    { id: "d-8", name: "Affidavit — Ownership", code: "DOC_AFFIDAVIT", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2026-01-06T10:10:00", version: 1, fileSize: "0.4 MB", verifiedBy: stage === "early" ? undefined : "Shri. Rajesh Patil", verifiedAt: stage === "early" ? undefined : "2026-01-09T14:30:00" },
  ];
  return base;
}

function makeFee(builtUpArea: number, docCount: number, paid: boolean, totalOverride?: number) {
  if (totalOverride) {
    // Create a fee with a specific total amount
    const appFee: ApplicationFee = {
      feeStructureId: "fs-bp-res-2026",
      feeStructureName: "Building Permission — Residential (2026)",
      generatedAt: "2026-08-20T18:00:00",
      lineItems: [
        { componentCode: "APP_FEE", name: "Application Fee", description: "Base processing fee", basis: "Fixed", rate: 2500, quantity: 1, amount: 2500 },
        { componentCode: "SCRUTINY_FEE", name: "Scrutiny Fee", description: "Built-up area × rate", basis: "Area based", rate: 45, quantity: builtUpArea, amount: builtUpArea * 45 },
        { componentCode: "DEV_FEE", name: "Development Fee", description: "Built-up area × rate", basis: "Area based", rate: 120, quantity: builtUpArea, amount: builtUpArea * 120 },
        { componentCode: "PROC_FEE", name: "Processing Fee", description: "Administrative", basis: "Fixed", rate: 1500, quantity: 1, amount: 1500 },
        { componentCode: "DOC_FEE", name: "Document Verification Fee", description: "Per document", basis: "Fixed", rate: 800, quantity: docCount, amount: 800 * docCount },
      ],
      subtotal: 0,
      gst: 0,
      total: totalOverride,
      paidAmount: paid ? totalOverride : 0,
      outstanding: paid ? 0 : totalOverride,
      currency: "INR",
    };
    appFee.subtotal = appFee.lineItems.reduce((s, li) => s + li.amount, 0);
    return appFee;
  }
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
    referenceNo: `MAHGP/2026/${Math.floor(Math.random() * 900000) + 100000}`,
    status: success ? "SUCCESS" : "PENDING",
    amount,
    method: "NETBANKING",
    gateway: "Mock Payment Gateway (Demo)",
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
  const currentOrder = getStage(currentStage)?.order ?? 0;
  const entries: WorkflowHistoryEntry[] = [];
  const actorMap: Record<string, { name: string; role: RoleKey }> = {
    APPLICATION_CREATED: { name: "Ar. Vikram Deshpande", role: "LTP" },
    DRAWING_SCRUTINY: { name: "System (Auto-Scrutiny)", role: "TPS" },
    DOCUMENTS: { name: "Shri. Rajesh Patil", role: "TPA" },
    FEE_GENERATED: { name: "System (Fee Engine)", role: "TPA" },
    PAYMENT: { name: "Ar. Vikram Deshpande", role: "LTP" },
    TPS_TECHNICAL_SCRUTINY: { name: "Smt. Meena Kulkarni", role: "TPS" },
    TPA_REVIEW: { name: "Shri. Rajesh Patil", role: "TPA" },
    ZAD_ZDD_REVIEW: { name: "Shri. Ramesh Iyer", role: "ZDD" },
    ZJD_REVIEW: { name: "Smt. Anjali Rao", role: "ZJD" },
    DIRECTOR_DP_REVIEW: { name: "Shri. Suresh Nair", role: "DIRECTOR_DP" },
    ADDITIONAL_COMMISSIONER_REVIEW: { name: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER" },
    COMMISSIONER_REVIEW: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" },
    FINAL_DECISION: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" },
  };
  const actionMap: Record<string, string> = {
    APPLICATION_CREATED: "Application created",
    DRAWING_SCRUTINY: status === "SCRUTINY_FAILED" ? "Scrutiny failed — re-upload required" : "Scrutiny passed",
    DOCUMENTS: status === "DOCUMENT_UPLOAD_PENDING" ? "Awaiting document upload" : "Documents verified",
    FEE_GENERATED: "Fee generated",
    PAYMENT: status === "PAYMENT_PENDING" ? "Payment pending" : "Payment received",
    TPS_TECHNICAL_SCRUTINY: "Technical scrutiny completed — forwarded to TPA",
    TPA_REVIEW: "Forwarded to ZAD/ZDD",
    ZAD_ZDD_REVIEW: "Forwarded to ZJD",
    ZJD_REVIEW: "Forwarded to Director – DP",
    DIRECTOR_DP_REVIEW: "Forwarded to Addl. Commissioner",
    ADDITIONAL_COMMISSIONER_REVIEW: "Forwarded to Commissioner",
    COMMISSIONER_REVIEW: status === "APPROVED" ? "Application approved" : status === "REJECTED" ? "Application rejected" : "Under final review",
    FINAL_DECISION: status === "APPROVED" ? "Final approval granted" : status === "REJECTED" ? "Final rejection issued" : "Awaiting final decision",
  };
  WORKFLOW_STAGES.slice(0, Math.max(currentOrder + 1, 1)).forEach((s, idx) => {
    const isCurrent = s.order === currentOrder && !["APPROVED", "REJECTED"].includes(status);
    const isPast = s.order < currentOrder || (["APPROVED", "REJECTED"].includes(status) && s.order <= currentOrder);
    entries.push({
      id: `wf-${appNo}-${idx}`,
      stage: s.key,
      stageLabel: s.label,
      actor: actorMap[s.key] ?? { name: "System", role: "TPS" },
      action: actionMap[s.key] ?? s.label,
      remarks: isCurrent && status === "SHORTFALL_RAISED" ? "Shortfall raised — response awaited." : undefined,
      timestamp: dates[idx] ?? "",
      status: isPast ? "COMPLETED" : isCurrent ? (status === "SHORTFALL_RAISED" ? "SHORTFALL" : "CURRENT") : "PENDING",
    });
  });
  return entries;
}

function makeAuditLog(appNo: string, stage: WorkflowStageKey, dates: string[]): AuditEntry[] {
  const currentOrder = getStage(stage)?.order ?? 0;
  const entries: AuditEntry[] = [];
  const actions = [
    { order: 0, user: "Ar. Vikram Deshpande", role: "LTP" as const, action: "Application created", old: undefined, new: "DRAFT" },
    { order: 0, user: "Ar. Vikram Deshpande", role: "LTP" as const, action: "Drawing v1 uploaded", old: "DRAFT", new: "DRAWING_UPLOADED" },
    { order: 1, user: "System", role: "TPS" as const, action: "Auto-scrutiny executed (v1)", old: "DRAWING_UPLOADED", new: "SCRUTINY_IN_PROGRESS" },
  ];
  if (currentOrder >= 1) {
    entries.push({ id: "a1", user: "Ar. Vikram Deshpande", role: "LTP", action: "Application created", entity: "Application", entityId: appNo, timestamp: dates[0], newStatus: "DRAFT", ip: "103.21.58.10", device: "Chrome / Windows" });
    entries.push({ id: "a2", user: "Ar. Vikram Deshpande", role: "LTP", action: "Drawing v1 uploaded", entity: "Drawing", entityId: appNo, timestamp: dates[0], oldStatus: "DRAFT", newStatus: "DRAWING_UPLOADED", ip: "103.21.58.10", device: "Chrome / Windows" });
    entries.push({ id: "a3", user: "System", role: "TPS", action: "Auto-scrutiny executed (v1)", entity: "ScrutinyReport", entityId: appNo, timestamp: dates[0], oldStatus: "DRAWING_UPLOADED", newStatus: "SCRUTINY_PASSED", ip: "10.0.0.4", device: "System" });
  }
  if (currentOrder >= 2) {
    entries.push({ id: "a4", user: "Ar. Vikram Deshpande", role: "LTP", action: "Documents uploaded", entity: "Document", entityId: appNo, timestamp: dates[1], oldStatus: "SCRUTINY_PASSED", newStatus: "DOCUMENT_UPLOAD_PENDING", ip: "103.21.58.10", device: "Chrome / Windows" });
    entries.push({ id: "a5", user: "Shri. Rajesh Patil", role: "TPA", action: "Documents verified", entity: "Document", entityId: appNo, timestamp: dates[2], oldStatus: "DOCUMENT_VERIFICATION", newStatus: "DOCUMENT_VERIFIED", ip: "10.0.0.18", device: "Edge / Windows" });
  }
  if (currentOrder >= 3) {
    entries.push({ id: "a6", user: "System", role: "TPA", action: "Fee calculated", entity: "ApplicationFee", entityId: appNo, timestamp: dates[2], oldStatus: "DOCUMENT_VERIFIED", newStatus: "FEE_GENERATED", ip: "10.0.0.4", device: "System" });
  }
  if (currentOrder >= 4) {
    entries.push({ id: "a7", user: "Ar. Vikram Deshpande", role: "LTP", action: "Payment initiated", entity: "Payment", entityId: appNo, timestamp: dates[3], oldStatus: "FEE_GENERATED", newStatus: "PAYMENT_PROCESSING", ip: "103.21.58.10", device: "Chrome / Windows" });
    entries.push({ id: "a8", user: "Mock Payment Gateway", role: "TPA", action: "Payment verified", entity: "Payment", entityId: appNo, timestamp: dates[3], oldStatus: "PAYMENT_PROCESSING", newStatus: "PAYMENT_SUCCESS", ip: "10.0.0.4", device: "Webhook (Mock)" });
  }
  if (currentOrder >= 5) {
    entries.push({ id: "a9", user: "Smt. Meena Kulkarni", role: "TPS", action: "Forwarded to TPA", entity: "Application", entityId: appNo, timestamp: dates[4], oldStatus: "TPS_TECHNICAL_SCRUTINY", newStatus: "TPA_REVIEW", ip: "10.0.0.18", device: "Edge / Windows", remarks: "Technical scrutiny complete. Drawings comply with DCR." });
  }
  if (currentOrder >= 6) {
    entries.push({ id: "a10", user: "Shri. Rajesh Patil", role: "TPA", action: "Forwarded to ZAD/ZDD", entity: "Application", entityId: appNo, timestamp: dates[5], oldStatus: "TPA_REVIEW", newStatus: "ZAD_ZDD_REVIEW", ip: "10.0.0.19", device: "Chrome / Windows" });
  }
  if (currentOrder >= 7) {
    entries.push({ id: "a11", user: "Shri. Ramesh Iyer", role: "ZDD", action: "Forwarded to ZJD", entity: "Application", entityId: appNo, timestamp: dates[6], oldStatus: "ZAD_ZDD_REVIEW", newStatus: "ZJD_REVIEW", ip: "10.0.0.22", device: "Firefox / Windows" });
  }
  if (currentOrder >= 8) {
    entries.push({ id: "a12", user: "Smt. Anjali Rao", role: "ZJD", action: "Forwarded to Director – DP", entity: "Application", entityId: appNo, timestamp: dates[7], oldStatus: "ZJD_REVIEW", newStatus: "DIRECTOR_DP_REVIEW", ip: "10.0.0.25", device: "Chrome / macOS" });
  }
  if (currentOrder >= 9) {
    entries.push({ id: "a13", user: "Shri. Suresh Nair", role: "DIRECTOR_DP", action: "Forwarded to Addl. Commissioner", entity: "Application", entityId: appNo, timestamp: dates[8], oldStatus: "DIRECTOR_DP_REVIEW", newStatus: "ADDITIONAL_COMMISSIONER_REVIEW", ip: "10.0.0.30", device: "Edge / Windows" });
  }
  if (currentOrder >= 10) {
    entries.push({ id: "a14", user: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER", action: "Forwarded to Commissioner", entity: "Application", entityId: appNo, timestamp: dates[9], oldStatus: "ADDITIONAL_COMMISSIONER_REVIEW", newStatus: "COMMISSIONER_REVIEW", ip: "10.0.0.35", device: "Chrome / Windows" });
  }
  if (currentOrder >= 11) {
    entries.push({ id: "a15", user: "Dr. Pratap Reddy", role: "COMMISSIONER", action: "Final decision: approved", entity: "Application", entityId: appNo, timestamp: dates[10], oldStatus: "COMMISSIONER_REVIEW", newStatus: "APPROVED", ip: "10.0.0.40", device: "Chrome / macOS", remarks: "Approved with conditions." });
  }
  return entries;
}

// ============================================================
// 14 DEMO APPLICATIONS — all 2026, covering every lifecycle stage
// ============================================================
function buildApp(
  id: string,
  appNo: string,
  projectName: string,
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL",
  builtUpArea: number,
  status: ApplicationStatus,
  stage: WorkflowStageKey,
  assignedOfficer: { name: string; role: RoleKey } | undefined,
  dates: string[],
  applicantName: string,
  applicantContact: string = "+91 98XXX XXXXX",
  applicantEmail: string = "applicant@email.com",
  applicantAddress: string = "Pune, Maharashtra",
  config: {
    drawings?: Drawing[];
    scrutiny?: ReturnType<typeof makeScrutinyReport>;
    documents?: DocumentRecord[];
    fee?: ReturnType<typeof makeFee>;
    payment?: ReturnType<typeof makePayment>;
    shortfalls?: Shortfall[];
    remarks?: { id: string; author: { name: string; role: RoleKey }; text: string; timestamp: string; type: "INFO" | "OBSERVATION" | "INSTRUCTION" | "DECISION" }[];
    progress?: number;
  } = {}
): Application {
  const stageInfo = getStage(stage)!;
  const progress = config.progress ?? Math.round((stageInfo.order / 12) * 100);
  return {
    id,
    applicationNo: appNo,
    applicant: { name: applicantName, contact: applicantContact, email: applicantEmail, address: applicantAddress },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: projectName,
      type: "BUILDING_PERMISSION",
      propertyType,
      plotArea: Math.round(builtUpArea * 0.7),
      builtUpArea,
      landUse: propertyType === "COMMERCIAL" ? "Commercial (C1)" : "Residential (R1)",
      ward: "Ward 14 — Baner",
      zone: "Zone IV — West",
      surveyNo: `Hissa ${Math.floor(Math.random() * 20) + 1}/2, Baner`,
      address: "Plot 14, Baner Road, Pune — 411045",
    },
    status,
    currentStage: stage,
    currentStageLabel: stageInfo.label,
    assignedOfficer,
    assignedAt: dates[dates.length - 1],
    submissionDate: dates[0],
    lastUpdated: dates[dates.length - 1],
    expectedSLA: "2026-02-20",
    priority: builtUpArea > 5000 ? "HIGH" : "NORMAL",
    progress,
    fee: config.fee,
    payment: config.payment,
    drawings: config.drawings ?? [],
    scrutinyReport: config.scrutiny,
    documents: config.documents ?? makeDocuments("early"),
    shortfalls: config.shortfalls ?? [],
    workflowHistory: makeWorkflowHistory(appNo, stage, status, dates),
    auditLog: makeAuditLog(appNo, stage, dates),
    remarks: config.remarks ?? [],
  };
}

export const SEED_APPLICATIONS: Application[] = [
  // 1. DRAFT — just created, no drawings
  buildApp("app-1", "MC/BP/2026/04/0001", "Greenfield Residency — Draft", "RESIDENTIAL", 1780, "DRAFT", "APPLICATION_CREATED", undefined, ["2026-01-20T09:00:00"], "Shri. Rakesh Kulkarni", "+91 98220 14501", "rakesh.kulkarni@email.com", "Baner, Pune — 411045", { documents: makeDocuments("early") }),

  // 2. SCRUTINY FAILED — drawing failed, re-upload needed
  buildApp("app-2", "MC/BP/2026/04/0002", "Tamhane Row Houses", "RESIDENTIAL", 1240, "SCRUTINY_FAILED", "DRAWING_SCRUTINY", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-01-18T13:20:00", "2026-01-18T13:22:00"], "Smt. Priya Tamhane", "+91 98220 14502", "priya.tamhane@email.com", "Kothrud, Pune — 411038", {
    drawings: [{ id: "dw-2-1", fileName: "RowHouse_v1.dwg", fileType: "DWG", fileSize: "6.2 MB", version: 1, uploadedAt: "2026-01-18T13:20:00", uploadedBy: "Ar. Vikram Deshpande", status: "SCRUTINY_FAILED", notes: "Failed — front setback non-compliant." }],
    scrutiny: makeScrutinyReport(1, "front_setback", "2026-01-18T13:22:00", "SCR/2026/0001"),
    documents: makeDocuments("early"),
  }),

  // 3. SCRUTINY PASSED → DOCUMENT_UPLOAD_PENDING
  buildApp("app-3", "MC/BP/2026/04/0003", "Shahane Bungalow — G+1", "RESIDENTIAL", 560, "DOCUMENT_UPLOAD_PENDING", "DOCUMENTS", { name: "Shri. Rajesh Patil", role: "TPA" }, ["2026-01-15T09:00:00", "2026-01-15T09:05:00", "2026-01-15T11:00:00"], "Shri. Deepak Shahane", "+91 98220 14503", "deepak.shahane@email.com", "Kothrud, Pune — 411038", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-15T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-01-15T11:00:00", "SCR/2026/0003"),
    documents: makeDocuments("early"),
  }),

  // 4. PAYMENT_PENDING — fee generated, awaiting payment
  buildApp("app-4", "MC/BP/2026/04/0004", "Kulkarni Residence — Redevelopment", "RESIDENTIAL", 980, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-01-12T10:00:00", "2026-01-12T10:05:00", "2026-01-13T14:00:00", "2026-01-14T18:00:00"], "Smt. Sunita Kulkarni", "+91 98220 14504", "sunita.kulkarni@email.com", "Kalyani Nagar, Pune — 411006", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-12T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-01-12T11:00:00", "SCR/2026/0004"),
    documents: makeDocuments("verified"),
    fee: makeFee(980, 8, false),
    payment: { id: "pay-4", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  // 5. TPS_TECHNICAL_SCRUTINY — payment done, at TPS
  buildApp("app-5", "MC/BP/2026/04/0005", "Greenfield Residency — Apartment", "RESIDENTIAL", 1780, "TPS_TECHNICAL_SCRUTINY", "TPS_TECHNICAL_SCRUTINY", { name: "Smt. Meena Kulkarni", role: "TPS" }, ["2026-01-05T09:28:00", "2026-01-05T09:30:00", "2026-01-05T09:31:00", "2026-01-06T10:00:00", "2026-01-07T14:00:00", "2026-01-08T12:00:00", "2026-01-09T16:00:00"], "Shri. Nikhil Patil", "+91 98220 14505", "nikhil.patil@email.com", "Baner, Pune — 411045", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-05T09:30:00" }]),
    scrutiny: makeScrutinyReport(1, "passed_warnings", "2026-01-05T09:31:00", "SCR/2026/0005"),
    documents: makeDocuments("verified"),
    fee: (() => { const f = makeFee(1780, 8, true); return f; })(),
    payment: makePayment(267850, true, "2026-01-08"),
    remarks: [{ id: "r-5-1", author: { name: "Smt. Meena Kulkarni", role: "TPS" }, text: "Application received. Beginning technical scrutiny.", timestamp: "2026-01-09T16:05:00", type: "INFO" }],
  }),

  // 6. TPA_REVIEW — TPS forwarded, at TPA
  buildApp("app-6", "MC/BP/2026/04/0006", "Crescent Plaza — Commercial", "COMMERCIAL", 6400, "TPA_REVIEW", "TPA_REVIEW", { name: "Shri. Rajesh Patil", role: "TPA" }, ["2026-01-04T10:00:00", "2026-01-04T10:05:00", "2026-01-04T10:06:00", "2026-01-05T11:00:00", "2026-01-06T09:00:00", "2026-01-07T15:00:00", "2026-01-08T10:00:00"], "Smt. Meena Joshi", "+91 98220 14506", "meena.joshi@email.com", "Aundh, Pune — 411007", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-04T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-01-04T10:06:00", "SCR/2026/0006"),
    documents: makeDocuments("verified"),
    fee: makeFee(6400, 8, true),
    payment: makePayment(853300, true, "2026-01-06"),
    remarks: [{ id: "r-6-1", author: { name: "Smt. Meena Kulkarni", role: "TPS" }, text: "Technical scrutiny complete. FAR compliant. Forwarding to TPA.", timestamp: "2026-01-08T10:00:00", type: "DECISION" }],
  }),

  // 7. ZAD_ZDD_REVIEW
  buildApp("app-7", "MC/BP/2026/04/0007", "Hillview Heights — Group Housing", "RESIDENTIAL", 12200, "ZAD_ZDD_REVIEW", "ZAD_ZDD_REVIEW", { name: "Shri. Ramesh Iyer", role: "ZDD" }, ["2026-01-03T10:00:00", "2026-01-03T10:05:00", "2026-01-03T10:06:00", "2026-01-04T14:00:00", "2026-01-05T09:00:00", "2026-01-06T11:00:00", "2026-01-07T15:00:00", "2026-01-08T10:00:00"], "Shri. Ramesh Iyer", "+91 98220 14507", "ramesh.iyer@email.com", "Bavdhan, Pune — 411021", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-03T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "ground_coverage", "2026-01-03T10:06:00", "SCR/2026/0007"),
    documents: makeDocuments("verified"),
    fee: makeFee(12200, 8, true),
    payment: makePayment(1618300, true, "2026-01-05"),
    remarks: [{ id: "r-7-1", author: { name: "Shri. Rajesh Patil", role: "TPA" }, text: "All documents verified. Fee paid. Forwarding to Zonal office.", timestamp: "2026-01-07T15:00:00", type: "DECISION" }],
  }),

  // 8. ZJD_REVIEW
  buildApp("app-8", "MC/BP/2026/04/0008", "Sunrise Apartments — G+4", "RESIDENTIAL", 3200, "ZJD_REVIEW", "ZJD_REVIEW", { name: "Smt. Anjali Rao", role: "ZJD" }, ["2026-01-02T09:00:00", "2026-01-02T09:05:00", "2026-01-02T09:06:00", "2026-01-03T11:00:00", "2026-01-04T10:00:00", "2026-01-05T14:00:00", "2026-01-06T09:00:00", "2026-01-07T11:00:00", "2026-01-08T15:00:00"], "Smt. Anjali Deshmukh", "+91 98220 14508", "anjali.deshmukh@email.com", "Wakad, Pune — 411057", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-02T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-01-02T09:06:00", "SCR/2026/0008"),
    documents: makeDocuments("verified"),
    fee: makeFee(3200, 8, true),
    payment: makePayment(446600, true, "2026-01-04"),
    remarks: [{ id: "r-8-1", author: { name: "Shri. Ramesh Iyer", role: "ZDD" }, text: "Zonal review complete. Forwarding to ZJD.", timestamp: "2026-01-08T15:00:00", type: "DECISION" }],
  }),

  // 9. DIRECTOR_DP_REVIEW
  buildApp("app-9", "MC/BP/2026/04/0009", "Riverside Towers — Commercial", "COMMERCIAL", 8900, "DIRECTOR_DP_REVIEW", "DIRECTOR_DP_REVIEW", { name: "Shri. Suresh Nair", role: "DIRECTOR_DP" }, ["2026-01-02T08:00:00", "2026-01-02T08:05:00", "2026-01-02T08:06:00", "2026-01-03T10:00:00", "2026-01-04T09:00:00", "2026-01-05T13:00:00", "2026-01-06T10:00:00", "2026-01-07T14:00:00", "2026-01-08T09:00:00", "2026-01-09T11:00:00"], "Shri. Prakash More", "+91 98220 14509", "prakash.more@email.com", "Hadapsar, Pune — 411028", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-02T08:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-01-02T08:06:00", "SCR/2026/0009"),
    documents: makeDocuments("verified"),
    fee: makeFee(8900, 8, true),
    payment: makePayment(1186300, true, "2026-01-04"),
    remarks: [{ id: "r-9-1", author: { name: "Smt. Anjali Rao", role: "ZJD" }, text: "Approved at ZJD level. Forwarding to Director.", timestamp: "2026-01-09T11:00:00", type: "DECISION" }],
  }),

  // 10. ADDITIONAL_COMMISSIONER_REVIEW
  buildApp("app-10", "MC/BP/2026/04/0010", "Heritage Residency — Premium", "RESIDENTIAL", 4500, "ADDITIONAL_COMMISSIONER_REVIEW", "ADDITIONAL_COMMISSIONER_REVIEW", { name: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER" }, ["2026-01-01T09:00:00", "2026-01-01T09:05:00", "2026-01-01T09:06:00", "2026-01-02T11:00:00", "2026-01-03T10:00:00", "2026-01-04T14:00:00", "2026-01-05T09:00:00", "2026-01-06T11:00:00", "2026-01-07T15:00:00", "2026-01-08T10:00:00", "2026-01-09T14:00:00"], "Smt. Kavita Sharma", "+91 98220 14510", "kavita.sharma@email.com", "Baner, Pune — 411045", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-01T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed_warnings", "2026-01-01T09:06:00", "SCR/2026/0010"),
    documents: makeDocuments("verified"),
    fee: makeFee(4500, 8, true),
    payment: makePayment(616300, true, "2026-01-03"),
    remarks: [{ id: "r-10-1", author: { name: "Shri. Suresh Nair", role: "DIRECTOR_DP" }, text: "Director-level review complete. Forwarding to Addl. Commissioner.", timestamp: "2026-01-09T14:00:00", type: "DECISION" }],
  }),

  // 11. COMMISSIONER_REVIEW
  buildApp("app-11", "MC/BP/2026/04/0011", "Metro Business Centre", "COMMERCIAL", 11200, "COMMISSIONER_REVIEW", "COMMISSIONER_REVIEW", { name: "Dr. Pratap Reddy", role: "COMMISSIONER" }, ["2025-12-28T09:00:00", "2025-12-28T09:05:00", "2025-12-28T09:06:00", "2025-12-29T11:00:00", "2025-12-30T10:00:00", "2026-01-01T14:00:00", "2026-01-02T09:00:00", "2026-01-03T11:00:00", "2026-01-04T15:00:00", "2026-01-05T10:00:00", "2026-01-06T14:00:00"], "Shri. Amit Verma", "+91 98220 14511", "amit.verma@email.com", "Aundh, Pune — 411007", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2025-12-28T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2025-12-28T09:06:00", "SCR/2026/0011"),
    documents: makeDocuments("verified"),
    fee: makeFee(11200, 8, true),
    payment: makePayment(1486300, true, "2025-12-30"),
    remarks: [{ id: "r-11-1", author: { name: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER" }, text: "Reviewed and forwarding to Commissioner for final decision.", timestamp: "2026-01-06T14:00:00", type: "DECISION" }],
  }),

  // 12. APPROVED
  buildApp("app-12", "MC/BP/2026/04/0012", "Sai Nagar Row Houses", "RESIDENTIAL", 1800, "APPROVED", "FINAL_DECISION", { name: "Dr. Pratap Reddy", role: "COMMISSIONER" }, ["2025-12-20T09:00:00", "2025-12-20T09:05:00", "2025-12-20T09:06:00", "2025-12-21T11:00:00", "2025-12-22T10:00:00", "2025-12-23T14:00:00", "2025-12-24T09:00:00", "2025-12-25T11:00:00", "2025-12-26T15:00:00", "2025-12-27T10:00:00", "2025-12-28T14:00:00", "2025-12-29T16:30:00"], "Smt. Neha Rao", "+91 98220 14512", "neha.rao@email.com", "Kalyani Nagar, Pune — 411006", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2025-12-20T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2025-12-20T09:06:00", "SCR/2026/0012"),
    documents: makeDocuments("verified"),
    fee: makeFee(1800, 8, true),
    payment: makePayment(271300, true, "2025-12-22"),
    remarks: [
      { id: "r-12-1", author: { name: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER" }, text: "Forwarded to Commissioner.", timestamp: "2025-12-28T14:00:00", type: "DECISION" },
      { id: "r-12-2", author: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" }, text: "Approved. Conditions: STP operational before occupancy; 10% area reserved for EWS.", timestamp: "2025-12-29T16:30:00", type: "DECISION" },
    ],
    progress: 100,
  }),

  // 13. SHORTFALL_RAISED — active shortfall at TPA review
  buildApp("app-13", "MC/BP/2026/04/0013", "Orchid Greens — Group Housing", "RESIDENTIAL", 6800, "SHORTFALL_RAISED", "TPA_REVIEW", { name: "Shri. Rajesh Patil", role: "TPA" }, ["2026-01-10T10:00:00", "2026-01-10T10:05:00", "2026-01-10T10:06:00", "2026-01-11T14:00:00", "2026-01-12T09:00:00", "2026-01-13T15:00:00", "2026-01-14T11:00:00"], "Shri. Suresh Reddy", "+91 98220 14513", "suresh.reddy@email.com", "Bavdhan, Pune — 411021", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-10T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed_warnings", "2026-01-10T10:06:00", "SCR/2026/0013"),
    documents: makeDocuments("shortfall"),
    fee: makeFee(6800, 8, true),
    payment: makePayment(906300, true, "2026-01-12"),
    shortfalls: [{
      id: "sf-13-1",
      shortfallId: "SF/2026/0042",
      type: "DOCUMENT",
      title: "Structural Stability Certificate — missing SE stamp",
      description: "The structural stability certificate uploaded on 11-Jan does not bear the stamp and signature of a Licensed Structural Engineer. Re-upload a properly stamped certificate.",
      raisedBy: { name: "Shri. Rajesh Patil", role: "TPA" },
      raisedAt: "2026-01-14T11:00:00",
      dueDate: "2026-01-21",
      status: "OPEN",
      applicationId: "app-13",
      applicationNo: "MC/BP/2026/04/0013",
      stageRaisedAt: "TPA_REVIEW",
    }],
    remarks: [{ id: "r-13-1", author: { name: "Shri. Rajesh Patil", role: "TPA" }, text: "Structural certificate requires licensed SE stamp. Shortfall SF/2026/0042 raised.", timestamp: "2026-01-14T11:00:00", type: "INSTRUCTION" }],
  }),

  // 14. Shortfall resolved, back in workflow (ZAD_ZDD_REVIEW with resolved shortfall)
  buildApp("app-14", "MC/BP/2026/04/0014", "Pinnacle Corporate Park", "COMMERCIAL", 7600, "ZAD_ZDD_REVIEW", "ZAD_ZDD_REVIEW", { name: "Shri. Ramesh Iyer", role: "ZDD" }, ["2026-01-05T09:00:00", "2026-01-05T09:05:00", "2026-01-05T09:06:00", "2026-01-06T11:00:00", "2026-01-07T10:00:00", "2026-01-08T14:00:00", "2026-01-09T09:00:00", "2026-01-12T15:00:00"], "Smt. Pooja Mehta", "+91 98220 14514", "pooja.mehta@email.com", "Wakad, Pune — 411057", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-01-05T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-01-05T09:06:00", "SCR/2026/0014"),
    documents: makeDocuments("verified"),
    fee: makeFee(7600, 8, true),
    payment: makePayment(1010300, true, "2026-01-07"),
    shortfalls: [{
      id: "sf-14-1",
      shortfallId: "SF/2026/0038",
      type: "DOCUMENT",
      title: "Fire NOC — expired",
      description: "The submitted Fire NOC expired on 31-Dec-2025. Please upload a renewed NOC.",
      raisedBy: { name: "Shri. Rajesh Patil", role: "TPA" },
      raisedAt: "2026-01-09T09:00:00",
      dueDate: "2026-01-15",
      status: "RESOLVED",
      applicationId: "app-14",
      applicationNo: "MC/BP/2026/04/0014",
      stageRaisedAt: "TPA_REVIEW",
      response: { text: "Renewed Fire NOC uploaded. Valid until 31-Dec-2027.", respondedAt: "2026-01-11T10:00:00", supportingDocument: "Fire_NOC_Renewed_2026.pdf" },
      reviewedBy: { name: "Shri. Rajesh Patil", role: "TPA" },
      reviewedAt: "2026-01-11T14:00:00",
      resolvedBy: { name: "Shri. Rajesh Patil", role: "TPA" },
      resolvedAt: "2026-01-11T14:00:00",
      resolution: "Renewed NOC verified. Valid until 31-Dec-2027. Shortfall resolved, forwarding application.",
    }],
    remarks: [
      { id: "r-14-1", author: { name: "Shri. Rajesh Patil", role: "TPA" }, text: "Fire NOC expired. Shortfall raised.", timestamp: "2026-01-09T09:00:00", type: "INSTRUCTION" },
      { id: "r-14-2", author: { name: "Shri. Rajesh Patil", role: "TPA" }, text: "Renewed NOC verified. Resolving shortfall and forwarding to ZAD/ZDD.", timestamp: "2026-01-11T14:00:00", type: "DECISION" },
    ],
  }),

  // ============================================================
  // 11 ADDITIONAL PENDING PAYMENT APPLICATIONS
  // ============================================================
  buildApp("app-17", "MC/BP/2026/04/0017", "Riverstone Commercial Complex", "COMMERCIAL", 2850, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-15T10:00:00", "2026-08-15T10:05:00", "2026-08-16T14:00:00", "2026-08-20T18:00:00"], "Shri. Prakash More", "+91 98220 14509", "prakash.more@email.com", "Hadapsar, Pune — 411028", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-15T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-16T14:00:00", "SCR/2026/0017"),
    documents: makeDocuments("verified"),
    fee: makeFee(2850, 8, false, 245600),
    payment: { id: "pay-17", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-18", "MC/BP/2026/04/0018", "Maple Residency", "RESIDENTIAL", 980, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-14T09:00:00", "2026-08-14T09:05:00", "2026-08-15T11:00:00", "2026-08-19T18:00:00"], "Smt. Kavita Sharma", "+91 98220 14510", "kavita.sharma@email.com", "Baner, Pune — 411045", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-14T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-15T11:00:00", "SCR/2026/0018"),
    documents: makeDocuments("verified"),
    fee: makeFee(980, 8, false, 98450),
    payment: { id: "pay-18", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-19", "MC/BP/2026/04/0019", "Sai Heights Apartments", "RESIDENTIAL", 2100, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-13T10:00:00", "2026-08-13T10:05:00", "2026-08-14T14:00:00", "2026-08-18T18:00:00"], "Shri. Arjun Reddy", "+91 98220 14511", "arjun.reddy@email.com", "Hadapsar, Pune — 411028", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-13T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed_warnings", "2026-08-14T14:00:00", "SCR/2026/0019"),
    documents: makeDocuments("verified"),
    fee: makeFee(2100, 8, false, 218750),
    payment: { id: "pay-19", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-20", "MC/BP/2026/04/0020", "Green Valley Villas", "RESIDENTIAL", 3200, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-12T09:00:00", "2026-08-12T09:05:00", "2026-08-13T11:00:00", "2026-08-17T18:00:00"], "Smt. Nisha Menon", "+91 98220 14512", "nisha.menon@email.com", "Kothrud, Pune — 411038", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-12T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-13T11:00:00", "SCR/2026/0020"),
    documents: makeDocuments("verified"),
    fee: makeFee(3200, 8, false, 142800),
    payment: { id: "pay-20", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-21", "MC/BP/2026/04/0021", "Metro Business Centre", "COMMERCIAL", 3750, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-11T10:00:00", "2026-08-11T10:05:00", "2026-08-12T14:00:00", "2026-08-16T18:00:00"], "Shri. Amit Verma", "+91 98220 14513", "amit.verma@email.com", "Aundh, Pune — 411007", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-11T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-12T14:00:00", "SCR/2026/0021"),
    documents: makeDocuments("verified"),
    fee: makeFee(3750, 8, false, 326480),
    payment: { id: "pay-21", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-22", "MC/BP/2026/04/0022", "Lakeview Enclave", "RESIDENTIAL", 1280, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-10T09:00:00", "2026-08-10T09:05:00", "2026-08-11T11:00:00", "2026-08-15T18:00:00"], "Smt. Asha Rao", "+91 98220 14514", "asha.rao@email.com", "Kalyani Nagar, Pune — 411006", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-10T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed_warnings", "2026-08-11T11:00:00", "SCR/2026/0022"),
    documents: makeDocuments("verified"),
    fee: makeFee(1280, 8, false, 136920),
    payment: { id: "pay-22", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-23", "MC/BP/2026/04/0023", "Pinnacle Industrial Park", "INDUSTRIAL", 4400, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-09T10:00:00", "2026-08-09T10:05:00", "2026-08-10T14:00:00", "2026-08-14T18:00:00"], "Shri. Suresh Reddy", "+91 98220 14515", "suresh.reddy@email.com", "Hadapsar, Pune — 411028", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-09T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-10T14:00:00", "SCR/2026/0023"),
    documents: makeDocuments("verified"),
    fee: makeFee(4400, 8, false, 415750),
    payment: { id: "pay-23", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-24", "MC/BP/2026/04/0024", "Sunrise Layout Extension", "RESIDENTIAL", 2750, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-08T09:00:00", "2026-08-08T09:05:00", "2026-08-09T11:00:00", "2026-08-13T18:00:00"], "Smt. Pooja Deshmukh", "+91 98220 14516", "pooja.deshmukh@email.com", "Wakad, Pune — 411057", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-08T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-09T11:00:00", "SCR/2026/0024"),
    documents: makeDocuments("verified"),
    fee: makeFee(2750, 8, false, 189640),
    payment: { id: "pay-24", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-25", "MC/BP/2026/04/0025", "Heritage Commercial Plaza", "COMMERCIAL", 4100, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-07T10:00:00", "2026-08-07T10:05:00", "2026-08-08T14:00:00", "2026-08-12T18:00:00"], "Shri. Vivek Nair", "+91 98220 14517", "vivek.nair@email.com", "Baner, Pune — 411045", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-07T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-08T14:00:00", "SCR/2026/0025"),
    documents: makeDocuments("verified"),
    fee: makeFee(4100, 8, false, 372850),
    payment: { id: "pay-25", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-26", "MC/BP/2026/04/0026", "Silver Oak Residency", "RESIDENTIAL", 1180, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-06T09:00:00", "2026-08-06T09:05:00", "2026-08-07T11:00:00", "2026-08-11T18:00:00"], "Smt. Neha Rao", "+91 98220 14518", "neha.rao@email.com", "Kothrud, Pune — 411038", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-06T09:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed_warnings", "2026-08-07T11:00:00", "SCR/2026/0026"),
    documents: makeDocuments("verified"),
    fee: makeFee(1180, 8, false, 164300),
    payment: { id: "pay-26", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),

  buildApp("app-27", "MC/BP/2026/04/0027", "Eastern Trade Hub", "COMMERCIAL", 2950, "PAYMENT_PENDING", "PAYMENT", { name: "Ar. Vikram Deshpande", role: "LTP" }, ["2026-08-05T10:00:00", "2026-08-05T10:05:00", "2026-08-06T14:00:00", "2026-08-10T18:00:00"], "Shri. Rohit Iyer", "+91 98220 14519", "rohit.iyer@email.com", "Hadapsar, Pune — 411028", {
    drawings: makeDrawings([{ v: 1, passed: true, date: "2026-08-05T10:05:00" }]),
    scrutiny: makeScrutinyReport(1, "passed", "2026-08-06T14:00:00", "SCR/2026/0027"),
    documents: makeDocuments("verified"),
    fee: makeFee(2950, 8, false, 296450),
    payment: { id: "pay-27", transactionId: "", referenceNo: "", status: "PENDING", amount: 0, method: "NETBANKING", gateway: "Mock Payment Gateway (Demo)", verified: false, isMock: true },
  }),
];

// Seed notifications
export const SEED_NOTIFICATIONS: NotificationRecord[] = [
  { id: "n-1", type: "APPLICATION_FORWARDED", title: "Application forwarded to ZAD/ZDD", message: "MC/BP/2026/04/0007 has been forwarded to Shri. Ramesh Iyer (ZDD) for review.", timestamp: "2026-01-08T10:00:00", read: false, applicationId: "app-7", applicationNo: "MC/BP/2026/04/0007", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-2", type: "SHORTFALL_RAISED", title: "Shortfall raised — action required", message: "Shortfall SF/2026/0042 raised on MC/BP/2026/04/0013. Structural certificate needs SE stamp.", timestamp: "2026-01-14T11:00:00", read: false, applicationId: "app-13", applicationNo: "MC/BP/2026/04/0013", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-3", type: "PAYMENT_SUCCESSFUL", title: "Payment successful", message: "Payment of ₹2,67,850 received for MC/BP/2026/04/0005. Approval workflow initiated.", timestamp: "2026-01-08T12:09:00", read: true, applicationId: "app-5", applicationNo: "MC/BP/2026/04/0005", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-4", type: "SCRUTINY_FAILED", title: "Scrutiny failed — re-upload required", message: "MC/BP/2026/04/0002 failed scrutiny: front setback non-compliant.", timestamp: "2026-01-18T13:22:00", read: false, applicationId: "app-2", applicationNo: "MC/BP/2026/04/0002", smsSent: true, smsStatus: "FAILED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-5", type: "APPLICATION_APPROVED", title: "Application approved", message: "MC/BP/2026/04/0012 has been approved by the Commissioner.", timestamp: "2025-12-29T16:30:00", read: true, applicationId: "app-12", applicationNo: "MC/BP/2026/04/0012", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
  { id: "n-6", type: "SHORTFALL_RESOLVED", title: "Shortfall resolved", message: "Shortfall SF/2026/0038 on MC/BP/2026/04/0014 has been resolved.", timestamp: "2026-01-11T14:00:00", read: true, applicationId: "app-14", applicationNo: "MC/BP/2026/04/0014", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP", recipientRole: "LTP" },
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
  portalName: "LTP Approval",
  portalSubtitle: "Building Permit Management System",
  dateFormat: "DD MMM YYYY",
  currency: "INR",
  maxFileSizeMB: 10,
  allowedDrawingFormats: ["DWG", "DXF", "PDF"],
  allowedDocumentFormats: ["PDF", "JPG", "PNG"],
  sessionTimeoutMinutes: 30,
  demoMode: true,
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
