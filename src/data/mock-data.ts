import type {
  Application,
  ApplicationStatus,
  AuditEntry,
  DocumentRecord,
  Drawing,
  FeeStructure,
  FeeComponent,
  NotificationRecord,
  Role,
  RoleKey,
  Shortfall,
  User,
  WorkflowStage,
  WorkflowStageKey,
} from "@/types";

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
    description: "Performs initial technical scrutiny of drawings and documents.",
    level: 1,
    color: "teal",
    permissions: ["application:view_all", "drawing:scrutinize", "document:verify", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  TPA: {
    key: "TPA",
    title: "TPA",
    fullName: "Town Planning Assistant",
    description: "Assists in technical scrutiny and document verification.",
    level: 1,
    color: "teal",
    permissions: ["application:view_all", "drawing:scrutinize", "document:verify", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  ZAD: {
    key: "ZAD",
    title: "ZAD",
    fullName: "Zonal Assistant Director",
    description: "Reviews applications at zonal level and raises shortfalls.",
    level: 2,
    color: "cyan",
    permissions: ["application:view_all", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  ZDD: {
    key: "ZDD",
    title: "ZDD",
    fullName: "Zonal Deputy Director",
    description: "Approves/forwards applications within the zone.",
    level: 2,
    color: "cyan",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  ZJD: {
    key: "ZJD",
    title: "ZJD",
    fullName: "Zonal Joint Director",
    description: "Reviews, approves, and may report fee shortfalls.",
    level: 3,
    color: "amber",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  DIRECTOR_DP: {
    key: "DIRECTOR_DP",
    title: "Director – DP",
    fullName: "Director of Town & Country Planning",
    description: "Director-level review, shortfall reporting and forwarding.",
    level: 4,
    color: "amber",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  ADDL_COMMISSIONER: {
    key: "ADDL_COMMISSIONER",
    title: "Addl. Commissioner",
    fullName: "Additional Commissioner",
    description: "Senior review and forwarding to Commissioner.",
    level: 5,
    color: "rose",
    permissions: ["application:view_all", "workflow:approve", "workflow:forward", "shortfall:raise", "remarks:add"],
  },
  COMMISSIONER: {
    key: "COMMISSIONER",
    title: "Commissioner",
    fullName: "Commissioner of the Authority",
    description: "Final authority — issues final approval or rejection.",
    level: 6,
    color: "rose",
    permissions: ["application:view_all", "workflow:approve", "workflow:return", "remarks:add"],
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
// USERS
// ============================================================
export const USERS: User[] = [
  {
    id: "u-ltp-01",
    name: "Ar. Vikram Deshpande",
    role: "LTP",
    email: "vikram.deshpande@studiolattice.in",
    phone: "+91 98220 14578",
    licenseNo: "LTP-MC-2019-0457",
    designation: "Architect & Licensed Technical Person",
    zone: "Zone IV — West",
    avatarColor: "emerald",
    department: "Private Practice",
    active: true,
    lastLogin: "2025-01-14T09:12:00",
  },
  {
    id: "u-tps-01",
    name: "Smt. Meena Kulkarni",
    role: "TPS",
    email: "meena.kulkarni@municipality.gov.in",
    phone: "+91 99230 87120",
    employeeId: "MUN-TPS-1042",
    designation: "Town Planning Supervisor",
    zone: "Zone IV — West",
    avatarColor: "teal",
    department: "Department of Town Planning",
    active: true,
    lastLogin: "2025-01-14T08:40:00",
  },
  {
    id: "u-zdd-01",
    name: "Shri. Ramesh Iyer",
    role: "ZDD",
    email: "ramesh.iyer@municipality.gov.in",
    phone: "+91 98190 33214",
    employeeId: "MUN-ZDD-0218",
    designation: "Zonal Deputy Director",
    zone: "Zone IV — West",
    avatarColor: "cyan",
    department: "Zonal Office — West",
    active: true,
    lastLogin: "2025-01-13T17:25:00",
  },
  {
    id: "u-zjd-01",
    name: "Smt. Anjali Rao",
    role: "ZJD",
    email: "anjali.rao@municipality.gov.in",
    phone: "+91 99700 51288",
    employeeId: "MUN-ZJD-0107",
    designation: "Zonal Joint Director",
    zone: "Zone IV — West",
    avatarColor: "amber",
    department: "Zonal Office — West",
    active: true,
    lastLogin: "2025-01-14T10:05:00",
  },
  {
    id: "u-dir-01",
    name: "Shri. Suresh Nair",
    role: "DIRECTOR_DP",
    email: "suresh.nair@municipality.gov.in",
    phone: "+91 98690 70011",
    employeeId: "MUN-DIR-0009",
    designation: "Director, Town & Country Planning",
    zone: "Head Office",
    avatarColor: "amber",
    department: "Directorate of Town Planning",
    active: true,
    lastLogin: "2025-01-14T09:55:00",
  },
  {
    id: "u-com-01",
    name: "Dr. Pratap Reddy",
    role: "COMMISSIONER",
    email: "pratap.reddy@municipality.gov.in",
    phone: "+91 98220 00001",
    employeeId: "MUN-COM-0001",
    designation: "Commissioner",
    zone: "Head Office",
    avatarColor: "rose",
    department: "Office of the Commissioner",
    active: true,
    lastLogin: "2025-01-14T11:20:00",
  },
  {
    id: "u-admin-01",
    name: "Shri. Kailash Patil",
    role: "ADMIN",
    email: "kailash.patil@municipality.gov.in",
    phone: "+91 99300 44881",
    employeeId: "MUN-ADM-0003",
    designation: "System Administrator",
    zone: "Head Office",
    avatarColor: "slate",
    department: "IT & e-Governance Cell",
    active: true,
    lastLogin: "2025-01-14T09:00:00",
  },
];

// ============================================================
// WORKFLOW STAGES
// ============================================================
export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    key: "APPLICATION_CREATED",
    label: "Application Created",
    role: "LTP",
    order: 0,
    allowedActions: [],
    nextStage: "DRAWING_SCRUTINY",
    canRaiseShortfall: false,
    canApprove: false,
  },
  {
    key: "DRAWING_SCRUTINY",
    label: "Drawing Scrutiny",
    role: "TPS",
    order: 1,
    allowedActions: ["ADD_REMARKS"],
    nextStage: "DOCUMENTS",
    canRaiseShortfall: false,
    canApprove: false,
  },
  {
    key: "DOCUMENTS",
    label: "Documents",
    role: "TPS",
    order: 2,
    allowedActions: ["ADD_REMARKS"],
    nextStage: "FEE_GENERATED",
    canRaiseShortfall: false,
    canApprove: false,
  },
  {
    key: "FEE_GENERATED",
    label: "Fee Generated",
    role: "LTP",
    order: 3,
    allowedActions: [],
    nextStage: "PAYMENT",
    canRaiseShortfall: false,
    canApprove: false,
  },
  {
    key: "PAYMENT",
    label: "Payment",
    role: "LTP",
    order: 4,
    allowedActions: [],
    nextStage: "TPA_TPS",
    canRaiseShortfall: false,
    canApprove: false,
  },
  {
    key: "TPA_TPS",
    label: "TPA / TPS Review",
    role: "TPS",
    order: 5,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS", "RETURN"],
    nextStage: "ZAD_ZDD",
    canRaiseShortfall: true,
    canApprove: true,
  },
  {
    key: "ZAD_ZDD",
    label: "ZAD / ZDD Review",
    role: "ZDD",
    order: 6,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS", "RETURN"],
    nextStage: "ZJD",
    canRaiseShortfall: true,
    canApprove: true,
  },
  {
    key: "ZJD",
    label: "ZJD Review",
    role: "ZJD",
    order: 7,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS"],
    nextStage: "DIRECTOR_DP",
    canRaiseShortfall: true,
    canApprove: true,
  },
  {
    key: "DIRECTOR_DP",
    label: "Director – DP",
    role: "DIRECTOR_DP",
    order: 8,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS"],
    nextStage: "ADDL_COMMISSIONER",
    canRaiseShortfall: true,
    canApprove: true,
  },
  {
    key: "ADDL_COMMISSIONER",
    label: "Addl. Commissioner",
    role: "ADDL_COMMISSIONER",
    order: 9,
    allowedActions: ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "ADD_REMARKS"],
    nextStage: "COMMISSIONER",
    canRaiseShortfall: true,
    canApprove: true,
  },
  {
    key: "COMMISSIONER",
    label: "Commissioner",
    role: "COMMISSIONER",
    order: 10,
    allowedActions: ["FINAL_DECISION", "RETURN", "ADD_REMARKS"],
    nextStage: "FINAL_DECISION",
    canRaiseShortfall: false,
    canApprove: true,
  },
  {
    key: "FINAL_DECISION",
    label: "Final Decision",
    role: "COMMISSIONER",
    order: 11,
    allowedActions: [],
    canRaiseShortfall: false,
    canApprove: false,
  },
];

// ============================================================
// FEE STRUCTURES & COMPONENTS
// ============================================================
export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs-bp-res-2025",
    name: "Building Permission — Residential (2025)",
    applicationType: "BUILDING_PERMISSION",
    description: "Applicable to residential building permission applications on plots up to 1,000 sq.m.",
    active: true,
    effectiveFrom: "2025-04-01",
  },
  {
    id: "fs-bp-com-2025",
    name: "Building Permission — Commercial (2025)",
    applicationType: "BUILDING_PERMISSION",
    description: "Applicable to commercial building permission applications.",
    active: true,
    effectiveFrom: "2025-04-01",
  },
  {
    id: "fs-layout-2025",
    name: "Layout Approval (2025)",
    applicationType: "LAYOUT_APPROVAL",
    description: "Group housing & layout approval fee structure.",
    active: true,
    effectiveFrom: "2025-04-01",
  },
];

export const FEE_COMPONENTS: FeeComponent[] = [
  { id: "fc-1", name: "Application Fee", code: "APP_FEE", description: "Base processing fee per application", basis: "FIXED", rate: 2500 },
  { id: "fc-2", name: "Scrutiny Fee", code: "SCRUTINY_FEE", description: "Per sq.m scrutiny charge on built-up area", basis: "AREA_BASED", rate: 45, unit: "sq.m" },
  { id: "fc-3", name: "Development Fee", code: "DEV_FEE", description: "Infrastructure development charge", basis: "AREA_BASED", rate: 120, unit: "sq.m" },
  { id: "fc-4", name: "Processing Fee", code: "PROC_FEE", description: "Administrative processing fee", basis: "FIXED", rate: 1500 },
  { id: "fc-5", name: "Document Verification Fee", code: "DOC_FEE", description: "Per-document verification charge", basis: "FIXED", rate: 800 },
  { id: "fc-6", name: "Labour Cess", code: "LABOUR_CESS", description: "1% of development fee — statutory", basis: "PERCENTAGE", rate: 1 },
];

// ============================================================
// HELPERS
// ============================================================
export function buildDrawings(): Drawing[] {
  return [
    {
      id: "dw-1",
      fileName: "Site_Plan_GroundFloor_v3.dwg",
      fileType: "DWG",
      fileSize: "8.4 MB",
      version: 3,
      uploadedAt: "2025-01-12T11:20:00",
      uploadedBy: "Ar. Vikram Deshpande",
      status: "SCRUTINY_PASSED",
      notes: "Revised setback per scrutiny remarks v2.",
    },
    {
      id: "dw-2",
      fileName: "Site_Plan_GroundFloor_v2.dwg",
      fileType: "DWG",
      fileSize: "8.1 MB",
      version: 2,
      uploadedAt: "2025-01-08T15:42:00",
      uploadedBy: "Ar. Vikram Deshpande",
      status: "SUPERSEDED",
      notes: "Superseded — front setback non-compliant.",
    },
    {
      id: "dw-3",
      fileName: "Site_Plan_GroundFloor_v1.dwg",
      fileType: "DWG",
      fileSize: "7.9 MB",
      version: 1,
      uploadedAt: "2025-01-05T09:30:00",
      uploadedBy: "Ar. Vikram Deshpande",
      status: "SUPERSEDED",
      notes: "Initial submission.",
    },
  ];
}

export function buildScrutinyReport(version: number, passed: boolean) {
  const checks = [
    { id: "sc-1", rule: "Front Setback Compliance", category: "Setbacks", severity: "CRITICAL" as const, status: passed ? "PASS" : "FAIL" as const, message: passed ? "Front setback 6.2 m exceeds minimum 6.0 m." : "Front setback 5.4 m is below minimum 6.0 m.", recommendation: passed ? undefined : "Increase front setback to a minimum of 6.0 m." },
    { id: "sc-2", rule: "Rear Setback Compliance", category: "Setbacks", severity: "MAJOR" as const, status: "PASS" as const, message: "Rear setback 4.1 m compliant.", },
    { id: "sc-3", rule: "Side Setback (East)", category: "Setbacks", severity: "MAJOR" as const, status: "PASS" as const, message: "3.2 m compliant." },
    { id: "sc-4", rule: "Side Setback (West)", category: "Setbacks", severity: "MAJOR" as const, status: "PASS" as const, message: "3.0 m compliant." },
    { id: "sc-5", rule: "Ground Coverage", category: "Bulk & Density", severity: "MAJOR" as const, status: "PASS" as const, message: "Coverage 58% within 60% limit." },
    { id: "sc-6", rule: "FAR / FSI Compliance", category: "Bulk & Density", severity: "CRITICAL" as const, status: "PASS" as const, message: "Achieved FAR 1.42 against permissible 1.50." },
    { id: "sc-7", rule: "Height Restriction", category: "Bulk & Density", severity: "MAJOR" as const, status: "PASS" as const, message: "Building height 14.8 m within 15 m limit." },
    { id: "sc-8", rule: "Parking Provision", category: "Amenities", severity: "MAJOR" as const, status: "PASS" as const, message: "24 ECS provided, 22 required." },
    { id: "sc-9", rule: "Rain Water Harvesting", category: "Sustainability", severity: "MINOR" as const, status: "PASS" as const, message: "RWH pit shown at NE corner." },
    { id: "sc-10", rule: "Sewage Treatment Plant", category: "Sustainability", severity: "MINOR" as const, status: passed ? "PASS" : "WARNING" as const, message: passed ? "STP of 30 KLD provided." : "STP capacity calculation sheet not attached." },
    { id: "sc-11", rule: "Fire Safety — Exit Width", category: "Fire & Safety", severity: "CRITICAL" as const, status: "PASS" as const, message: "Stair width 1.8 m compliant." },
    { id: "sc-12", rule: "Fire Safety — Refuge Area", category: "Fire & Safety", severity: "MAJOR" as const, status: "PASS" as const, message: "Refuge area provided at 7th floor." },
    { id: "sc-13", rule: "Tree Plantation", category: "Environment", severity: "MINOR" as const, status: "WARNING" as const, message: "Indicate tree species on landscape plan." },
    { id: "sc-14", rule: "Accessibility — Ramp", category: "Accessibility", severity: "MAJOR" as const, status: "PASS" as const, message: "1:12 ramp at main entrance." },
    { id: "sc-15", rule: "Title & North Arrow", category: "Drawing Standards", severity: "WARNING" as const, status: "PASS" as const, message: "Title block and north arrow present." },
  ];
  const failed = checks.filter((c) => c.status === "FAIL").length;
  const warnings = checks.filter((c) => c.status === "WARNING").length;
  return {
    reportNo: `SCR/2025/${Math.floor(1000 + Math.random() * 9000)}`,
    drawingVersion: version,
    generatedAt: "2025-01-12T16:05:00",
    status: (failed === 0 ? "PASSED" : "FAILED") as "PASSED" | "FAILED",
    summary: passed
      ? "Drawing scrutiny completed successfully. All critical and major checks passed. Two minor advisories noted for compliance during construction."
      : "Scrutiny identified 1 critical non-compliance. Drawing must be corrected and re-uploaded before proceeding.",
    totalChecks: checks.length,
    passed: checks.length - failed - warnings,
    failed,
    warnings,
    checks,
  };
}

export function buildDocuments(stage: "early" | "verified" | "shortfall"): DocumentRecord[] {
  const base: DocumentRecord[] = [
    { id: "d-1", name: "7/12 Land Extract", code: "DOC_712", required: true, status: "VERIFIED", uploadedAt: "2025-01-06T10:00:00", version: 1, fileSize: "1.2 MB", verifiedBy: "Smt. Meena Kulkarni", verifiedAt: "2025-01-09T14:20:00" },
    { id: "d-2", name: "Property Card / Mutation", code: "DOC_PROP_CARD", required: true, status: "VERIFIED", uploadedAt: "2025-01-06T10:05:00", version: 1, fileSize: "0.9 MB", verifiedBy: "Smt. Meena Kulkarni", verifiedAt: "2025-01-09T14:22:00" },
    { id: "d-3", name: "Architectural Drawings (stamped)", code: "DOC_ARCH", required: true, status: "VERIFIED", uploadedAt: "2025-01-12T11:25:00", version: 3, fileSize: "8.4 MB", verifiedBy: "Smt. Meena Kulkarni", verifiedAt: "2025-01-13T09:10:00" },
    { id: "d-4", name: "Structural Drawings & Stability Certificate", code: "DOC_STRUCT", required: true, status: stage === "shortfall" ? "SHORTFALL" : "VERIFIED", uploadedAt: stage === "shortfall" ? undefined : "2025-01-12T11:30:00", version: stage === "shortfall" ? undefined : 1, fileSize: stage === "shortfall" ? undefined : "6.1 MB", verifiedBy: stage === "shortfall" ? undefined : "Smt. Meena Kulkarni", verifiedAt: stage === "shortfall" ? undefined : "2025-01-13T09:15:00", remarks: stage === "shortfall" ? "Structural stability certificate missing licensed SE stamp." : undefined },
    { id: "d-5", name: "NOC from Fire Department", code: "DOC_FIRE_NOC", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2025-01-13T16:40:00", version: stage === "early" ? undefined : 1, fileSize: stage === "early" ? undefined : "0.7 MB", verifiedBy: stage === "early" ? undefined : "Smt. Meena Kulkarni", verifiedAt: stage === "early" ? undefined : "2025-01-14T10:00:00" },
    { id: "d-6", name: "Environmental Clearance", code: "DOC_ENV", required: false, status: stage === "early" ? "REQUIRED" : "UPLOADED", uploadedAt: stage === "early" ? undefined : "2025-01-13T16:42:00", version: stage === "early" ? undefined : 1, fileSize: stage === "early" ? undefined : "1.4 MB" },
    { id: "d-7", name: "Heritage NOC (if applicable)", code: "DOC_HERITAGE", required: false, status: "REQUIRED" },
    { id: "d-8", name: "Society / Landowner Authorization", code: "DOC_AUTH", required: true, status: "VERIFIED", uploadedAt: "2025-01-06T10:08:00", version: 1, fileSize: "0.5 MB", verifiedBy: "Smt. Meena Kulkarni", verifiedAt: "2025-01-09T14:25:00" },
    { id: "d-9", name: "Demand Draft / Fee Receipt", code: "DOC_FEE", required: true, status: stage === "early" ? "REQUIRED" : "VERIFIED", uploadedAt: stage === "early" ? undefined : "2025-01-15T12:10:00", version: stage === "early" ? undefined : 1, fileSize: stage === "early" ? undefined : "0.3 MB", verifiedBy: stage === "early" ? undefined : "System" },
    { id: "d-10", name: "Affidavit — Ownership", code: "DOC_AFFIDAVIT", required: true, status: "VERIFIED", uploadedAt: "2025-01-06T10:10:00", version: 1, fileSize: "0.4 MB", verifiedBy: "Smt. Meena Kulkarni", verifiedAt: "2025-01-09T14:30:00" },
  ];
  return base;
}

export function buildFee(area: number) {
  const items = [
    { componentCode: "APP_FEE", name: "Application Fee", description: "Base processing fee", basis: "Fixed", rate: 2500, quantity: 1, amount: 2500 },
    { componentCode: "SCRUTINY_FEE", name: "Scrutiny Fee", description: `Built-up area × ₹45/sq.m`, basis: "Area based", rate: 45, quantity: area, amount: area * 45 },
    { componentCode: "DEV_FEE", name: "Development Fee", description: `Built-up area × ₹120/sq.m`, basis: "Area based", rate: 120, quantity: area, amount: area * 120 },
    { componentCode: "PROC_FEE", name: "Processing Fee", description: "Administrative processing", basis: "Fixed", rate: 1500, quantity: 1, amount: 1500 },
    { componentCode: "DOC_FEE", name: "Document Verification Fee", description: "10 documents × ₹800", basis: "Fixed", rate: 800, quantity: 10, amount: 8000 },
  ];
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const labourCess = Math.round((items[2].amount * 0.01) * 100) / 100;
  const gst = 0;
  const total = subtotal + labourCess + gst;
  return {
    feeStructureId: "fs-bp-res-2025",
    feeStructureName: "Building Permission — Residential (2025)",
    generatedAt: "2025-01-14T18:00:00",
    lineItems: [...items, { componentCode: "LABOUR_CESS", name: "Labour Cess", description: "1% of Development Fee (statutory)", basis: "Percentage", rate: 1, quantity: items[2].amount, amount: labourCess }],
    subtotal,
    gst,
    total,
    paidAmount: 0,
    outstanding: total,
    currency: "INR",
  };
}

// ============================================================
// APPLICATIONS
// ============================================================
function workflowHistory(
  appNo: string,
  current: WorkflowStageKey,
  status: ApplicationStatus
) {
  const order = WORKFLOW_STAGES.find((s) => s.key === current)!.order;
  const entries: import("@/types").WorkflowHistoryEntry[] = [];
  const stages = WORKFLOW_STAGES.slice(0, Math.max(order + 1, 1));
  const actors: Record<string, { name: string; role: RoleKey }> = {
    APPLICATION_CREATED: { name: "Ar. Vikram Deshpande", role: "LTP" },
    DRAWING_SCRUTINY: { name: "System (Auto-Scrutiny)", role: "TPS" },
    DOCUMENTS: { name: "Smt. Meena Kulkarni", role: "TPS" },
    FEE_GENERATED: { name: "System (Fee Engine)", role: "TPS" },
    PAYMENT: { name: "Ar. Vikram Deshpande", role: "LTP" },
    TPA_TPS: { name: "Smt. Meena Kulkarni", role: "TPS" },
    ZAD_ZDD: { name: "Shri. Ramesh Iyer", role: "ZDD" },
    ZJD: { name: "Smt. Anjali Rao", role: "ZJD" },
    DIRECTOR_DP: { name: "Shri. Suresh Nair", role: "DIRECTOR_DP" },
    ADDL_COMMISSIONER: { name: "Smt. Lakshmi Menon", role: "ADDL_COMMISSIONER" },
    COMMISSIONER: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" },
    FINAL_DECISION: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" },
  };
  const actions: Record<string, string> = {
    APPLICATION_CREATED: "Application submitted",
    DRAWING_SCRUTINY: status === "SCRUTINY_FAILED" ? "Scrutiny failed — re-upload required" : "Scrutiny passed",
    DOCUMENTS: status === "DOCUMENTS_PENDING" ? "Documents under verification" : "Documents verified",
    FEE_GENERATED: "Fee generated",
    PAYMENT: status === "PAYMENT_PENDING" ? "Payment pending" : "Payment received",
    TPA_TPS: "Forwarded to ZAD/ZDD",
    ZAD_ZDD: "Forwarded to ZJD",
    ZJD: "Forwarded to Director – DP",
    DIRECTOR_DP: "Forwarded to Addl. Commissioner",
    ADDL_COMMISSIONER: "Forwarded to Commissioner",
    COMMISSIONER: status === "APPROVED" ? "Application approved" : status === "REJECTED" ? "Application rejected" : "Under final review",
    FINAL_DECISION: status === "APPROVED" ? "Final approval granted" : status === "REJECTED" ? "Final rejection issued" : "Awaiting final decision",
  };
  stages.forEach((s, idx) => {
    const isCurrent = s.key === current;
    const isFuture = idx > order;
    entries.push({
      id: `wf-${appNo}-${idx}`,
      stage: s.key,
      stageLabel: s.label,
      actor: actors[s.key],
      action: actions[s.key],
      remarks: isCurrent && status === "SHORTFALL_RAISED" ? "Shortfall raised — response awaited." : undefined,
      timestamp: isFuture ? "" : `2025-01-${String(5 + idx * 2).padStart(2, "0")}T${10 + idx}:00:00`,
      status: isCurrent ? "CURRENT" : isFuture ? "PENDING" : status === "RETURNED" && isCurrent ? "RETURNED" : "COMPLETED",
      duration: isFuture ? undefined : `${1 + idx}d`,
    });
  });
  return entries;
}

function auditLog(appNo: string): AuditEntry[] {
  return [
    { id: "a1", user: "Ar. Vikram Deshpande", role: "LTP", action: "Application created", entity: "Application", entityId: appNo, timestamp: "2025-01-05T09:28:00", newStatus: "DRAFT", ip: "103.21.58.10", device: "Chrome / Windows" },
    { id: "a2", user: "Ar. Vikram Deshpande", role: "LTP", action: "Drawing v1 uploaded", entity: "Drawing", entityId: appNo, timestamp: "2025-01-05T09:30:00", ip: "103.21.58.10", device: "Chrome / Windows" },
    { id: "a3", user: "System", role: "TPS", action: "Auto-scrutiny executed (v1)", entity: "ScrutinyReport", entityId: appNo, timestamp: "2025-01-05T09:31:00", oldStatus: "DRAFT", newStatus: "SCRUTINY_FAILED", ip: "10.0.0.4", device: "System" },
    { id: "a4", user: "Ar. Vikram Deshpande", role: "LTP", action: "Drawing v2 uploaded", entity: "Drawing", entityId: appNo, timestamp: "2025-01-08T15:42:00", ip: "103.21.58.10", device: "Chrome / Windows" },
    { id: "a5", user: "Ar. Vikram Deshpande", role: "LTP", action: "Drawing v3 uploaded", entity: "Drawing", entityId: appNo, timestamp: "2025-01-12T11:20:00", ip: "103.21.58.10", device: "Chrome / Windows" },
    { id: "a6", user: "System", role: "TPS", action: "Auto-scrutiny executed (v3)", entity: "ScrutinyReport", entityId: appNo, timestamp: "2025-01-12T16:05:00", oldStatus: "SCRUTINY_FAILED", newStatus: "SCRUTINY_PASSED", ip: "10.0.0.4", device: "System" },
    { id: "a7", user: "Smt. Meena Kulkarni", role: "TPS", action: "Documents verified", entity: "Document", entityId: appNo, timestamp: "2025-01-14T10:00:00", oldStatus: "DOCUMENTS_PENDING", newStatus: "DOCUMENTS_VERIFIED", ip: "10.0.0.18", device: "Edge / Windows" },
    { id: "a8", user: "System", role: "TPS", action: "Fee calculated", entity: "ApplicationFee", entityId: appNo, timestamp: "2025-01-14T18:00:00", oldStatus: "DOCUMENTS_VERIFIED", newStatus: "FEE_GENERATED", ip: "10.0.0.4", device: "System" },
    { id: "a9", user: "Ar. Vikram Deshpande", role: "LTP", action: "Payment initiated", entity: "Payment", entityId: appNo, timestamp: "2025-01-15T12:05:00", oldStatus: "FEE_GENERATED", newStatus: "PAYMENT_PENDING", ip: "103.21.58.10", device: "Chrome / Windows" },
    { id: "a10", user: "Payment Gateway", role: "TPS", action: "Payment verified", entity: "Payment", entityId: appNo, timestamp: "2025-01-15T12:09:00", oldStatus: "PAYMENT_PENDING", newStatus: "PAYMENT_SUCCESSFUL", ip: "10.0.0.4", device: "Webhook" },
    { id: "a11", user: "Smt. Meena Kulkarni", role: "TPS", action: "Forwarded to ZAD/ZDD", entity: "Application", entityId: appNo, timestamp: "2025-01-16T11:00:00", oldStatus: "PAYMENT_SUCCESSFUL", newStatus: "UNDER_REVIEW", ip: "10.0.0.18", device: "Edge / Windows" },
  ];
}

export const APPLICATIONS: Application[] = [
  {
    id: "app-1",
    applicationNo: "MC/BP/2025/04/0184",
    applicant: { name: "Shri. Anand Joshi", contact: "+91 98900 11223", email: "anand.joshi@gmail.com", address: "Plot 14, Baner Road, Pune — 411045" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "Residential Apartment — Greenfield Residency",
      type: "BUILDING_PERMISSION",
      propertyType: "RESIDENTIAL",
      plotArea: 1250,
      builtUpArea: 1780,
      landUse: "Residential (R1)",
      ward: "Ward 14 — Baner",
      zone: "Zone IV — West",
      surveyNo: "Hissa 14/2, Baner",
      address: "Plot 14, Baner Road, Pune — 411045",
    },
    status: "UNDER_REVIEW",
    currentStage: "ZAD_ZDD",
    currentStageLabel: "ZAD / ZDD Review",
    assignedOfficer: { name: "Shri. Ramesh Iyer", role: "ZDD" },
    submissionDate: "2025-01-05T09:28:00",
    lastUpdated: "2025-01-16T11:00:00",
    expectedSLA: "2025-02-05",
    priority: "NORMAL",
    progress: 62,
    fee: buildFee(1780),
    payment: {
      id: "pay-1",
      transactionId: "TXN882190457712",
      referenceNo: "MAHGP/2025/554812",
      status: "SUCCESSFUL",
      amount: 267850,
      method: "NETBANKING",
      gateway: "BillDesk (Sandbox)",
      initiatedAt: "2025-01-15T12:05:00",
      completedAt: "2025-01-15T12:09:00",
      receiptNo: "RCP/2025/04/00921",
      verified: true,
    },
    drawings: buildDrawings(),
    scrutinyReport: buildScrutinyReport(3, true),
    documents: buildDocuments("verified"),
    shortfalls: [],
    workflowHistory: workflowHistory("MC/BP/2025/04/0184", "ZAD_ZDD", "UNDER_REVIEW"),
    auditLog: auditLog("MC/BP/2025/04/0184"),
    remarks: [
      { id: "r1", author: { name: "Smt. Meena Kulkarni", role: "TPS" }, text: "Drawings comply with DCR. FAR utilisation 94.6%. Forwarding to Zonal office.", timestamp: "2025-01-16T10:58:00", type: "DECISION" },
      { id: "r2", author: { name: "System", role: "TPS" }, text: "Scrutiny v3 passed with 2 advisories.", timestamp: "2025-01-12T16:05:00", type: "INFO" },
    ],
  },
  {
    id: "app-2",
    applicationNo: "MC/BP/2025/03/0098",
    applicant: { name: "M/s Crescent Retail Pvt Ltd", contact: "+91 90210 44556", email: "projects@crescentretail.in", address: "Survey 88, Aundh, Pune — 411007" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "Crescent Plaza — Commercial",
      type: "BUILDING_PERMISSION",
      propertyType: "COMMERCIAL",
      plotArea: 2100,
      builtUpArea: 6400,
      landUse: "Commercial (C1)",
      ward: "Ward 09 — Aundh",
      zone: "Zone III — North",
      surveyNo: "88, Aundh",
      address: "Survey 88, Aundh, Pune — 411007",
    },
    status: "SHORTFALL_RAISED",
    currentStage: "TPA_TPS",
    currentStageLabel: "TPA / TPS Review",
    assignedOfficer: { name: "Smt. Meena Kulkarni", role: "TPS" },
    submissionDate: "2025-01-03T14:10:00",
    lastUpdated: "2025-01-15T17:40:00",
    expectedSLA: "2025-01-29",
    priority: "HIGH",
    progress: 48,
    fee: buildFee(6400),
    payment: {
      id: "pay-2",
      transactionId: "TXN882190458001",
      referenceNo: "MAHGP/2025/554920",
      status: "SUCCESSFUL",
      amount: 853300,
      method: "UPI",
      gateway: "BillDesk (Sandbox)",
      initiatedAt: "2025-01-13T10:00:00",
      completedAt: "2025-01-13T10:02:00",
      receiptNo: "RCP/2025/03/00478",
      verified: true,
    },
    drawings: buildDrawings(),
    scrutinyReport: buildScrutinyReport(3, true),
    documents: buildDocuments("shortfall"),
    shortfalls: [
      {
        id: "sf-1",
        shortfallId: "SF/2025/0142",
        type: "DOCUMENT",
        title: "Structural Stability Certificate — missing SE stamp",
        description: "The structural stability certificate uploaded on 12-Jan does not bear the stamp and signature of a Licensed Structural Engineer. Re-upload a properly stamped certificate.",
        raisedBy: { name: "Smt. Meena Kulkarni", role: "TPS" },
        raisedAt: "2025-01-15T17:38:00",
        dueDate: "2025-01-22",
        status: "OPEN",
        applicationId: "app-2",
        applicationNo: "MC/BP/2025/03/0098",
      },
    ],
    workflowHistory: workflowHistory("MC/BP/2025/03/0098", "TPA_TPS", "SHORTFALL_RAISED"),
    auditLog: auditLog("MC/BP/2025/03/0098"),
    remarks: [
      { id: "r3", author: { name: "Smt. Meena Kulkarni", role: "TPS" }, text: "Structural certificate requires licensed SE stamp. Shortfall SF/2025/0142 raised.", timestamp: "2025-01-15T17:38:00", type: "INSTRUCTION" },
    ],
  },
  {
    id: "app-3",
    applicationNo: "MC/BP/2025/04/0201",
    applicant: { name: "Shri. Deepak Shahane", contact: "+91 98225 67890", email: "deepak.shahane@gmail.com", address: "Plot 7, Kothrud, Pune — 411038" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "Shahane Bungalow — G+1",
      type: "BUILDING_PERMISSION",
      propertyType: "RESIDENTIAL",
      plotArea: 420,
      builtUpArea: 560,
      landUse: "Residential (R2)",
      ward: "Ward 22 — Kothrud",
      zone: "Zone II — South",
      surveyNo: "7/1, Kothrud",
      address: "Plot 7, Kothrud, Pune — 411038",
    },
    status: "PAYMENT_PENDING",
    currentStage: "PAYMENT",
    currentStageLabel: "Payment",
    submissionDate: "2025-01-11T11:00:00",
    lastUpdated: "2025-01-15T18:00:00",
    expectedSLA: "2025-01-30",
    priority: "NORMAL",
    progress: 38,
    fee: buildFee(560),
    payment: {
      id: "pay-3",
      transactionId: "",
      referenceNo: "",
      status: "PENDING",
      amount: 83960,
      method: "NETBANKING",
      gateway: "BillDesk (Sandbox)",
      verified: false,
    },
    drawings: buildDrawings(),
    scrutinyReport: buildScrutinyReport(3, true),
    documents: buildDocuments("verified"),
    shortfalls: [],
    workflowHistory: workflowHistory("MC/BP/2025/04/0201", "PAYMENT", "PAYMENT_PENDING"),
    auditLog: auditLog("MC/BP/2025/04/0201"),
    remarks: [],
  },
  {
    id: "app-4",
    applicationNo: "MC/BP/2025/01/0033",
    applicant: { name: "Smt. Sunita Kulkarni", contact: "+91 91450 33210", email: "sunita.k@gmail.com", address: "Plot 22, Kalyani Nagar, Pune — 411006" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "Kulkarni Residence — Redevelopment",
      type: "REVISION_PERMISSION",
      propertyType: "RESIDENTIAL",
      plotArea: 600,
      builtUpArea: 980,
      landUse: "Residential (R1)",
      ward: "Ward 11 — Kalyani Nagar",
      zone: "Zone IV — West",
      surveyNo: "22, Kalyani Nagar",
      address: "Plot 22, Kalyani Nagar, Pune — 411006",
    },
    status: "APPROVED",
    currentStage: "FINAL_DECISION",
    currentStageLabel: "Final Decision",
    assignedOfficer: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" },
    submissionDate: "2024-12-18T10:00:00",
    lastUpdated: "2025-01-09T16:30:00",
    expectedSLA: "2025-01-17",
    priority: "NORMAL",
    progress: 100,
    fee: buildFee(980),
    payment: {
      id: "pay-4",
      transactionId: "TXN882190451200",
      referenceNo: "MAHGP/2024/548001",
      status: "SUCCESSFUL",
      amount: 142400,
      method: "CARD",
      gateway: "BillDesk (Sandbox)",
      initiatedAt: "2024-12-22T12:00:00",
      completedAt: "2024-12-22T12:03:00",
      receiptNo: "RCP/2024/12/00880",
      verified: true,
    },
    drawings: buildDrawings(),
    scrutinyReport: buildScrutinyReport(3, true),
    documents: buildDocuments("verified"),
    shortfalls: [],
    workflowHistory: workflowHistory("MC/BP/2025/01/0033", "FINAL_DECISION", "APPROVED"),
    auditLog: auditLog("MC/BP/2025/01/0033"),
    remarks: [
      { id: "r4", author: { name: "Dr. Pratap Reddy", role: "COMMISSIONER" }, text: "Approved. Conditions: STP operational before occupancy; 10% area reserved for EWS.", timestamp: "2025-01-09T16:30:00", type: "DECISION" },
    ],
  },
  {
    id: "app-5",
    applicationNo: "MC/BP/2025/04/0212",
    applicant: { name: "Shri. Nikhil Tamhane", contact: "+91 99700 88112", email: "nikhil.tamhane@gmail.com", address: "Plot 3, Wakad, Pune — 411057" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "Tamhane Row Houses (4 units)",
      type: "BUILDING_PERMISSION",
      propertyType: "RESIDENTIAL",
      plotArea: 780,
      builtUpArea: 1240,
      landUse: "Residential (R2)",
      ward: "Ward 27 — Wakad",
      zone: "Zone IV — West",
      surveyNo: "3, Wakad",
      address: "Plot 3, Wakad, Pune — 411057",
    },
    status: "SCRUTINY_FAILED",
    currentStage: "DRAWING_SCRUTINY",
    currentStageLabel: "Drawing Scrutiny",
    submissionDate: "2025-01-14T13:20:00",
    lastUpdated: "2025-01-14T13:22:00",
    expectedSLA: "2025-02-03",
    priority: "URGENT",
    progress: 12,
    drawings: [
      { id: "dw-5a", fileName: "RowHouse_v1.dwg", fileType: "DWG", fileSize: "6.2 MB", version: 1, uploadedAt: "2025-01-14T13:20:00", uploadedBy: "Ar. Vikram Deshpande", status: "SCRUTINY_FAILED", notes: "Failed — parking shortfall & FAR excess." },
    ],
    scrutinyReport: buildScrutinyReport(1, false),
    documents: buildDocuments("early"),
    shortfalls: [],
    workflowHistory: workflowHistory("MC/BP/2025/04/0212", "DRAWING_SCRUTINY", "SCRUTINY_FAILED"),
    auditLog: auditLog("MC/BP/2025/04/0212"),
    remarks: [],
  },
  {
    id: "app-6",
    applicationNo: "MC/BP/2025/04/0225",
    applicant: { name: "M/s Hillview Developers", contact: "+91 90110 22001", email: "admin@hillview.in", address: "Survey 41, Bavdhan, Pune — 411021" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "Hillview Heights — Group Housing",
      type: "LAYOUT_APPROVAL",
      propertyType: "RESIDENTIAL",
      plotArea: 5400,
      builtUpArea: 12200,
      landUse: "Residential (R1)",
      ward: "Ward 19 — Bavdhan",
      zone: "Zone IV — West",
      surveyNo: "41, Bavdhan",
      address: "Survey 41, Bavdhan, Pune — 411021",
    },
    status: "DOCUMENTS_PENDING",
    currentStage: "DOCUMENTS",
    currentStageLabel: "Documents",
    assignedOfficer: { name: "Smt. Meena Kulkarni", role: "TPS" },
    submissionDate: "2025-01-10T09:00:00",
    lastUpdated: "2025-01-15T11:30:00",
    expectedSLA: "2025-02-02",
    priority: "HIGH",
    progress: 28,
    drawings: buildDrawings(),
    scrutinyReport: buildScrutinyReport(3, true),
    documents: buildDocuments("early"),
    shortfalls: [],
    workflowHistory: workflowHistory("MC/BP/2025/04/0225", "DOCUMENTS", "DOCUMENTS_PENDING"),
    auditLog: auditLog("MC/BP/2025/04/0225"),
    remarks: [],
  },
  {
    id: "app-7",
    applicationNo: "MC/BP/2025/04/0240",
    applicant: { name: "Shri. Prakash More", contact: "+91 98190 55612", email: "prakash.more@gmail.com", address: "Plot 9, Hadapsar, Pune — 411028" },
    ltpId: "u-ltp-01",
    ltpName: "Ar. Vikram Deshpande",
    project: {
      name: "More Industries — Small Scale Unit",
      type: "BUILDING_PERMISSION",
      propertyType: "INDUSTRIAL",
      plotArea: 900,
      builtUpArea: 1500,
      landUse: "Industrial (I1)",
      ward: "Ward 31 — Hadapsar",
      zone: "Zone I — East",
      surveyNo: "9, Hadapsar",
      address: "Plot 9, Hadapsar, Pune — 411028",
    },
    status: "DRAFT",
    currentStage: "APPLICATION_CREATED",
    currentStageLabel: "Application Created",
    submissionDate: "2025-01-16T15:00:00",
    lastUpdated: "2025-01-16T15:00:00",
    expectedSLA: "2025-02-15",
    priority: "NORMAL",
    progress: 5,
    drawings: [],
    documents: buildDocuments("early"),
    shortfalls: [],
    workflowHistory: workflowHistory("MC/BP/2025/04/0240", "APPLICATION_CREATED", "DRAFT"),
    auditLog: auditLog("MC/BP/2025/04/0240"),
    remarks: [],
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const NOTIFICATIONS: NotificationRecord[] = [
  { id: "n1", type: "APPLICATION_FORWARDED", title: "Application forwarded to ZAD/ZDD", message: "MC/BP/2025/04/0184 has been forwarded to Shri. Ramesh Iyer (ZDD) for review.", timestamp: "2025-01-16T11:00:00", read: false, applicationId: "app-1", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP" },
  { id: "n2", type: "SHORTFALL_RAISED", title: "Shortfall raised — action required", message: "Shortfall SF/2025/0142 raised on MC/BP/2025/03/0098. Structural certificate needs SE stamp.", timestamp: "2025-01-15T17:38:00", read: false, applicationId: "app-2", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP" },
  { id: "n3", type: "FEE_GENERATED", title: "Fee generated", message: "Fee of ₹2,67,850 generated for MC/BP/2025/04/0184. Proceed to payment.", timestamp: "2025-01-14T18:00:00", read: true, applicationId: "app-1", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP" },
  { id: "n4", type: "SCRUTINY_PASSED", title: "Drawing scrutiny passed", message: "Scrutiny of v3 drawing for MC/BP/2025/04/0184 passed with 2 advisories.", timestamp: "2025-01-12T16:05:00", read: true, applicationId: "app-1", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP" },
  { id: "n5", type: "SCRUTINY_FAILED", title: "Scrutiny failed — re-upload required", message: "MC/BP/2025/04/0212 failed scrutiny: front setback non-compliant.", timestamp: "2025-01-14T13:22:00", read: false, applicationId: "app-5", smsSent: true, smsStatus: "FAILED", channel: "IN_APP" },
  { id: "n6", type: "PAYMENT_SUCCESSFUL", title: "Payment successful", message: "Payment of ₹2,67,850 received for MC/BP/2025/04/0184. Receipt RCP/2025/04/00921 generated.", timestamp: "2025-01-15T12:09:00", read: true, applicationId: "app-1", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP" },
  { id: "n7", type: "APPLICATION_APPROVED", title: "Application approved", message: "MC/BP/2025/01/0033 has been approved by the Commissioner.", timestamp: "2025-01-09T16:30:00", read: true, applicationId: "app-4", smsSent: true, smsStatus: "DELIVERED", channel: "IN_APP" },
  { id: "n8", type: "DOCUMENTS_REQUIRED", title: "Documents pending verification", message: "MC/BP/2025/04/0225 awaiting upload of Fire NOC and Environmental Clearance.", timestamp: "2025-01-15T11:30:00", read: true, applicationId: "app-6", smsSent: false, channel: "IN_APP" },
];

// ============================================================
// SMS TEMPLATES
// ============================================================
export const SMS_TEMPLATES = [
  { id: "t1", code: "SMS_APP_SUBMIT", name: "Application Submitted", template: "Dear {name}, your building permission application {appNo} has been submitted successfully. Track at municipality.gov.in/track — Municipal Authority.", type: "TRANSACTIONAL", active: true },
  { id: "t2", code: "SMS_SCRUTINY_FAIL", name: "Scrutiny Failed", template: "Dear {name}, scrutiny for {appNo} has FAILED. Please re-upload corrected drawings. Ref: {reportNo}.", type: "TRANSACTIONAL", active: true },
  { id: "t3", code: "SMS_SCRUTINY_PASS", name: "Scrutiny Passed", template: "Dear {name}, scrutiny for {appNo} has PASSED. Upload required documents to proceed.", type: "TRANSACTIONAL", active: true },
  { id: "t4", code: "SMS_FEE_GEN", name: "Fee Generated", template: "Dear {name}, fee of ₹{amount} generated for {appNo}. Pay online within 15 days.", type: "TRANSACTIONAL", active: true },
  { id: "t5", code: "SMS_PAY_OK", name: "Payment Successful", template: "Dear {name}, payment of ₹{amount} received for {appNo}. Receipt {receiptNo}. Approval workflow initiated.", type: "TRANSACTIONAL", active: true },
  { id: "t6", code: "SMS_SHORTFALL", name: "Shortfall Raised", template: "Dear {name}, a shortfall has been raised on {appNo}. Respond within {dueDate} to avoid delay.", type: "TRANSACTIONAL", active: true },
  { id: "t7", code: "SMS_FORWARD", name: "Application Forwarded", template: "Dear {name}, {appNo} forwarded to {stage}. Current status: under review.", type: "TRANSACTIONAL", active: true },
  { id: "t8", code: "SMS_APPROVED", name: "Application Approved", template: "Dear {name}, your application {appNo} has been APPROVED. Permit no: {permitNo}.", type: "TRANSACTIONAL", active: true },
  { id: "t9", code: "SMS_REJECTED", name: "Application Rejected", template: "Dear {name}, your application {appNo} has been REJECTED. Reason: {reason}.", type: "TRANSACTIONAL", active: true },
];

// ============================================================
// OFFICER ASSIGNMENTS (for officer portal)
// ============================================================
export function applicationsForRole(role: RoleKey): Application[] {
  if (role === "TPS" || role === "TPA") {
    return APPLICATIONS.filter((a) => ["UNDER_REVIEW", "SHORTFALL_RAISED", "DOCUMENTS_PENDING"].includes(a.status) && (a.currentStage === "TPA_TPS" || a.currentStage === "DOCUMENTS" || a.currentStage === "DRAWING_SCRUTINY"));
  }
  if (role === "ZAD" || role === "ZDD") {
    return APPLICATIONS.filter((a) => a.currentStage === "ZAD_ZDD");
  }
  if (role === "ZJD") {
    return APPLICATIONS.filter((a) => a.currentStage === "ZJD");
  }
  if (role === "DIRECTOR_DP") {
    return APPLICATIONS.filter((a) => a.currentStage === "DIRECTOR_DP");
  }
  if (role === "ADDL_COMMISSIONER") {
    return APPLICATIONS.filter((a) => a.currentStage === "ADDL_COMMISSIONER");
  }
  if (role === "COMMISSIONER") {
    return APPLICATIONS.filter((a) => a.currentStage === "COMMISSIONER");
  }
  return [];
}

export function resolveShortfallList(): Shortfall[] {
  return APPLICATIONS.flatMap((a) => a.shortfalls);
}
