// ============================================================
// BBAS Extended Modules Data Store
// Site Inspections, NOCs, Show Cause, Revocations, LTP Changes,
// Work Initiated, Developers, Professionals, Outward, Tasks, Shortfalls, Payments
// ============================================================

// ------------------------------------------------------------
// 1. SITE INSPECTIONS
// ------------------------------------------------------------
export interface InspectionChecklistItem {
  itemNumber: number;
  question: string;
  category: "Boundaries" | "Access" | "Encroachment" | "Constraints" | "Site condition" | "Existing construction" | "Trees and greenery" | "Layout conformity" | "Surroundings" | "Other";
  responseType: "YES_NO" | "YES_NO_NA" | "TEXT" | "MEASUREMENT";
  response: string;
  observation?: string;
  isMandatory: boolean;
  affectsRisk?: boolean;
}

export interface InspectionPhoto {
  id: string;
  category: "North view" | "South view" | "East view" | "West view" | "Abutting road" | "Site boundary" | "Adjacent structures";
  fileName: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  uploadedBy: string;
}

export interface SiteInspectionRecord {
  id: string;
  inspectionNumber: string;
  applicationId: string;
  applicationNumber: string;
  round: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SHORTFALL" | "REJECTED";
  inspectorName: string;
  inspectorDesignation: string;
  scheduledDate: string;
  inspectedDate?: string;
  recommendation: "RECOMMENDED" | "SHORTFALL" | "REJECT" | "PENDING";
  recommendationRemarks?: string;
  signedByName?: string;
  signedAt?: string;
  siteAddress: string;
  zone: string;
  district: string;
  ownerName: string;
  ltpName: string;
  plotAreaMeasured: number;
  roadWidthMeasured: number;
  overdue: boolean;
  checklist: InspectionChecklistItem[];
  photos: InspectionPhoto[];
}

export const SITE_INSPECTION_ITEMS_TEMPLATE: Omit<InspectionChecklistItem, "response" | "observation">[] = [
  { itemNumber: 1, category: "Boundaries", question: "Do the site boundaries on the ground agree with the boundaries shown in the application?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 2, category: "Boundaries", question: "Do the plot dimensions measured on site agree with those in the document and the drawing?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 3, category: "Boundaries", question: "What is the total area of the site as measured on the ground (sq m)?", responseType: "MEASUREMENT", isMandatory: true },
  { itemNumber: 4, category: "Access", question: "Is there an approach road to the site?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 5, category: "Access", question: "What is the width of the abutting road measured on the ground (m)?", responseType: "MEASUREMENT", isMandatory: true, affectsRisk: true },
  { itemNumber: 6, category: "Access", question: "Is the abutting road width on the ground the same as the width shown in the master plan or approved layout?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 7, category: "Access", question: "Is the site accessible for construction traffic and for fire tender access?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 8, category: "Encroachment", question: "Is any part of the site encroached upon?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 9, category: "Encroachment", question: "Does the site encroach on any road, drain, channel or other public land?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 10, category: "Constraints", question: "Does a high-tension power line pass over or beside the site?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 11, category: "Constraints", question: "Is there a natural water body, canal, tank or watercourse adjoining the site?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 12, category: "Constraints", question: "Is there any other physical constraint on the site that the application does not disclose?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 13, category: "Site condition", question: "What is the topography of the site — level, sloping, low-lying or undulating?", responseType: "TEXT", isMandatory: true },
  { itemNumber: 14, category: "Site condition", question: "Is the ground condition suitable for the construction proposed?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 15, category: "Site condition", question: "Is the site filled, excavated or otherwise altered from its natural level?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 16, category: "Existing construction", question: "Is any existing structure standing on the site?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 17, category: "Existing construction", question: "If a structure is standing, is it shown in the application and the drawing?", responseType: "YES_NO_NA", isMandatory: true },
  { itemNumber: 18, category: "Existing construction", question: "Has work already commenced on the site?", responseType: "YES_NO", isMandatory: true, affectsRisk: true },
  { itemNumber: 19, category: "Existing construction", question: "What is the stage of construction at the time of inspection?", responseType: "TEXT", isMandatory: true },
  { itemNumber: 20, category: "Existing construction", question: "Is a compound wall standing on the site?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 21, category: "Trees and greenery", question: "Are there trees standing on the site?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 22, category: "Trees and greenery", question: "How many trees are standing, and are any proposed to be felled?", responseType: "TEXT", isMandatory: false },
  { itemNumber: 23, category: "Layout conformity", question: "Does the plot on the ground conform to the plot shown in the approved layout?", responseType: "YES_NO_NA", isMandatory: true },
  { itemNumber: 24, category: "Layout conformity", question: "Are the layout roads and open spaces adjoining the plot formed as approved?", responseType: "YES_NO_NA", isMandatory: true },
  { itemNumber: 25, category: "Surroundings", question: "What is the predominant use of the surrounding development?", responseType: "TEXT", isMandatory: true },
  { itemNumber: 26, category: "Surroundings", question: "Is the neighbouring development consistent with the use proposed on this site?", responseType: "YES_NO", isMandatory: true },
  { itemNumber: 27, category: "Other", question: "Any other observation recorded during the inspection?", responseType: "TEXT", isMandatory: false },
];

export const MOCK_INSPECTIONS: SiteInspectionRecord[] = [
  {
    id: "insp-001",
    inspectionNumber: "INSP/2026/000104",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    round: 1,
    status: "COMPLETED",
    inspectorName: "K. Murali Mohan",
    inspectorDesignation: "Town Planning Assistant",
    scheduledDate: "2026-03-12",
    inspectedDate: "2026-03-12 11:30",
    recommendation: "RECOMMENDED",
    recommendationRemarks: "Physical boundaries tally accurately with registered deed and sanctioned layout. Abutting road width 12.20 m verified on site. Clear access for fire tender.",
    signedByName: "K. Murali Mohan (TPA)",
    signedAt: "2026-03-12 15:45",
    siteAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    zone: "Zone 1",
    district: "Guntur",
    ownerName: "P. Raghava Rao",
    ltpName: "Ar. Priya Sharma (COA CA/2015/67890)",
    plotAreaMeasured: 420.5,
    roadWidthMeasured: 12.2,
    overdue: false,
    checklist: SITE_INSPECTION_ITEMS_TEMPLATE.map((t, idx) => ({
      ...t,
      response: idx === 2 ? "420.5" : idx === 4 ? "12.2" : idx === 12 ? "Level site" : idx === 18 ? "Not commenced" : idx === 24 ? "Residential" : idx === 7 || idx === 8 || idx === 9 || idx === 10 || idx === 15 || idx === 17 ? "No" : "Yes",
      observation: idx === 4 ? "Measured road width matches master plan 40ft road standard." : undefined,
    })),
    photos: [
      { id: "p1", category: "North view", fileName: "IMG_INSP_01_NORTH.jpg", latitude: 16.3067, longitude: 80.4365, capturedAt: "2026-03-12 11:32:10", uploadedBy: "K. Murali Mohan" },
      { id: "p2", category: "Abutting road", fileName: "IMG_INSP_02_ROAD.jpg", latitude: 16.3069, longitude: 80.4366, capturedAt: "2026-03-12 11:35:44", uploadedBy: "K. Murali Mohan" },
      { id: "p3", category: "Site boundary", fileName: "IMG_INSP_03_BOUNDARY.jpg", latitude: 16.3065, longitude: 80.4362, capturedAt: "2026-03-12 11:38:22", uploadedBy: "K. Murali Mohan" },
    ],
  },
  {
    id: "insp-002",
    inspectionNumber: "INSP/2026/000108",
    applicationId: "app-002",
    applicationNumber: "BA/2026/00145",
    round: 1,
    status: "SCHEDULED",
    inspectorName: "V. Lakshmi Narayana",
    inspectorDesignation: "Town Planning Assistant",
    scheduledDate: "2026-09-28",
    recommendation: "PENDING",
    siteAddress: "Plot No. 18, Amaravati Heights, Vijayawada Rural",
    zone: "Zone 2",
    district: "Krishna",
    ownerName: "S. Venkatesh",
    ltpName: "Er. K. Suresh Kumar (IEI AM-098231)",
    plotAreaMeasured: 850.0,
    roadWidthMeasured: 18.0,
    overdue: false,
    checklist: SITE_INSPECTION_ITEMS_TEMPLATE.map((t) => ({ ...t, response: "PENDING" })),
    photos: [],
  },
  {
    id: "insp-003",
    inspectionNumber: "INSP/2026/000095",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    round: 2,
    status: "SHORTFALL",
    inspectorName: "K. Murali Mohan",
    inspectorDesignation: "Town Planning Assistant",
    scheduledDate: "2026-02-18",
    inspectedDate: "2026-02-18 14:10",
    recommendation: "SHORTFALL",
    recommendationRemarks: "High-tension 33kV overhead electric line passes within 2.8m of eastern boundary. Clearance certificate / NOC from APCPDCL required.",
    signedByName: "K. Murali Mohan",
    signedAt: "2026-02-18 17:00",
    siteAddress: "Survey 114/2B, Brodipet Main Road, Guntur West",
    zone: "Zone 1",
    district: "Guntur",
    ownerName: "Ch. Anjaneyulu",
    ltpName: "Ar. Ravi Varma (COA CA/2018/90123)",
    plotAreaMeasured: 1200.0,
    roadWidthMeasured: 15.0,
    overdue: false,
    checklist: SITE_INSPECTION_ITEMS_TEMPLATE.map((t, idx) => ({
      ...t,
      response: idx === 9 ? "Yes" : idx === 2 ? "1200.0" : idx === 4 ? "15.0" : "Yes",
      observation: idx === 9 ? "33kV overhead line proximity noted on east setback." : undefined,
    })),
    photos: [
      { id: "p4", category: "Adjacent structures", fileName: "IMG_HT_LINE_EAST.jpg", latitude: 16.3102, longitude: 80.4412, capturedAt: "2026-02-18 14:20:00", uploadedBy: "K. Murali Mohan" },
    ],
  },
  {
    id: "insp-004",
    inspectionNumber: "INSP/2026/000088",
    applicationId: "app-004",
    applicationNumber: "BA/2026/00119",
    round: 1,
    status: "COMPLETED",
    inspectorName: "M. Harish",
    inspectorDesignation: "Town Planning Assistant",
    scheduledDate: "2026-01-24",
    inspectedDate: "2026-01-24 10:15",
    recommendation: "REJECT",
    recommendationRemarks: "Encroachment on municipal drainage canal on southern boundary. Plot dimensions fall short of sanctioned sub-division by 4.2m width.",
    signedByName: "M. Harish",
    signedAt: "2026-01-24 16:30",
    siteAddress: "Sy No 89/1, Canal Road, Vijayawada",
    zone: "Zone 2",
    district: "Krishna",
    ownerName: "D. Prabhakar",
    ltpName: "Ar. Priya Sharma",
    plotAreaMeasured: 310.0,
    roadWidthMeasured: 9.0,
    overdue: false,
    checklist: SITE_INSPECTION_ITEMS_TEMPLATE.map((t, idx) => ({
      ...t,
      response: idx === 8 || idx === 10 ? "Yes" : idx === 1 ? "No" : "Yes",
      observation: idx === 8 ? "Drain channel culvert encroached by 1.8m." : undefined,
    })),
    photos: [],
  },
];

// ------------------------------------------------------------
// 2. NOCs (NO-OBJECTION CERTIFICATES)
// ------------------------------------------------------------
export interface NocRecord {
  id: string;
  nocNumber: string;
  applicationId: string;
  applicationNumber: string;
  nocType: "FIRE" | "AIRPORT" | "RAILWAY" | "ENVIRONMENT" | "WATER_RESOURCES" | "HERITAGE" | "OTHER";
  nocTypeName: string;
  authority: string;
  status: "PENDING" | "RECEIVED" | "VERIFIED" | "SHORTFALL" | "REJECTED" | "EXPIRED" | "NOT_REQUIRED";
  referenceNumber: string;
  appliedDate?: string;
  issuedDate?: string;
  expiryDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  hasDocument: boolean;
  fileName?: string;
  conditions: string[];
  remarks?: string;
}

export const MOCK_NOCS: NocRecord[] = [
  {
    id: "noc-001",
    nocNumber: "NOC/2026/00042",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    nocType: "FIRE",
    nocTypeName: "Fire NOC",
    authority: "State Disaster Response & Fire Services Department",
    status: "VERIFIED",
    referenceNumber: "DIS/FIRE/GNT/2026/4108",
    appliedDate: "2026-02-10",
    issuedDate: "2026-03-01",
    expiryDate: "2027-02-28",
    verifiedBy: "B. Sridhar (Zonal Officer)",
    verifiedAt: "2026-03-05 14:20",
    hasDocument: true,
    fileName: "FIRE_NOC_SANCTIONED.pdf",
    conditions: [
      "Dedicated 6.0m wide driveway for fire tender movement without obstruction.",
      "Installation of wet riser system and yard hydrants per NBC 2016 Part 4.",
      "Underground static water storage tank of minimum 50,000 litres capacity.",
    ],
    remarks: "Fire clearance certificate authentic and in order.",
  },
  {
    id: "noc-002",
    nocNumber: "NOC/2026/00043",
    applicationId: "app-002",
    applicationNumber: "BA/2026/00145",
    nocType: "AIRPORT",
    nocTypeName: "Airport Authority NOC",
    authority: "Airports Authority of India (NOCAS)",
    status: "RECEIVED",
    referenceNumber: "AAI/SR/VJA/NOCAS/2026/892",
    appliedDate: "2026-02-20",
    issuedDate: "2026-03-14",
    expiryDate: "2031-03-13",
    hasDocument: true,
    fileName: "AAI_HEIGHT_CLEARANCE.pdf",
    conditions: [
      "Permissible top elevation not to exceed 48.50m AMSL.",
      "Day and night obstacle markings on rooftop elevator room.",
    ],
    remarks: "Awaiting scrutiny desk verification.",
  },
  {
    id: "noc-003",
    nocNumber: "NOC/2026/00044",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    nocType: "ENVIRONMENT",
    nocTypeName: "Environmental Clearance",
    authority: "State Environment Impact Assessment Authority (SEIAA)",
    status: "SHORTFALL",
    referenceNumber: "SEIAA/AP/GNT/EC/2025/110",
    appliedDate: "2026-01-15",
    hasDocument: true,
    fileName: "EC_SUBMISSION_RECEIPT.pdf",
    conditions: [],
    remarks: "Form 1 and Environmental Management Plan (EMP) copy is unsealed. Certified EIA report copy needed.",
  },
  {
    id: "noc-004",
    nocNumber: "NOC/2026/00045",
    applicationId: "app-004",
    applicationNumber: "BA/2026/00119",
    nocType: "WATER_RESOURCES",
    nocTypeName: "Water Resources NOC",
    authority: "Water Resources Department (Irrigation Circle)",
    status: "REJECTED",
    referenceNumber: "WRD/IRR/KRISHNA/2026/09",
    appliedDate: "2026-01-10",
    hasDocument: true,
    fileName: "WRD_INSPECTION_MEMO.pdf",
    conditions: [],
    remarks: "Plot abuts flood margin of primary canal. Minimum 15m buffer zone violated.",
  },
  {
    id: "noc-005",
    nocNumber: "NOC/2026/00046",
    applicationId: "app-005",
    applicationNumber: "BA/2026/00160",
    nocType: "HERITAGE",
    nocTypeName: "Heritage / Monument NOC",
    authority: "Competent Authority for Protected Monuments (ASI)",
    status: "NOT_REQUIRED",
    referenceNumber: "ASI/HYD/GNT/EXEMPT/2026/12",
    hasDocument: false,
    conditions: [],
    remarks: "Site is 450m from Undavalli Caves, outside the 300m regulated buffer.",
  },
];

// ------------------------------------------------------------
// 3. SHOW CAUSE NOTICES
// ------------------------------------------------------------
export interface ShowCauseRecord {
  id: string;
  noticeNumber: string;
  applicationId: string;
  applicationNumber: string;
  section: string;
  status: "ISSUED" | "AWAITING_RESPONSE" | "OPEN" | "CLOSED" | "REFERRED_REVOCATION";
  issuedDate: string;
  responseDueDate: string;
  violation: string;
  reason: string;
  ownerName: string;
  ltpName: string;
  siteAddress: string;
  responseDate?: string;
  applicantExplanation?: string;
  decisionDate?: string;
  decisionRemarks?: string;
  decidedBy?: string;
  hearingScheduledDate?: string;
}

export const MOCK_SHOW_CAUSES: ShowCauseRecord[] = [
  {
    id: "sc-001",
    noticeNumber: "SCN/SEC53/2026/00018",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    section: "Section 53 (Andhra Pradesh Metropolitan Region Act)",
    status: "AWAITING_RESPONSE",
    issuedDate: "2026-09-18",
    responseDueDate: "2026-10-03",
    violation: "During post-approval inspection, front setback was observed to be enclosed with brick masonry, where sanctioned plan shows open setback.",
    reason: "The observation departs materially from the sanctioned plan without prior revision permit.",
    ownerName: "P. Raghava Rao",
    ltpName: "Ar. Priya Sharma",
    siteAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    hearingScheduledDate: "2026-10-05 11:00",
  },
  {
    id: "sc-002",
    noticeNumber: "SCN/SEC53/2026/00014",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    section: "Section 53 & Section 115 (Building Regulations)",
    status: "OPEN",
    issuedDate: "2026-08-10",
    responseDueDate: "2026-08-25",
    violation: "Construction commenced before notifying work commencement order.",
    reason: "The permission condition requires written notice of commencement and contractor details prior to ground breaking.",
    ownerName: "Ch. Anjaneyulu",
    ltpName: "Ar. Ravi Varma",
    siteAddress: "Survey 114/2B, Brodipet Main Road, Guntur West",
    responseDate: "2026-08-22",
    applicantExplanation: "Work began with site leveling and security cabin. The notice of commencement was dispatched through courier on 08-08-2026. Acknowledgment slip is attached.",
    hearingScheduledDate: "2026-08-29",
  },
  {
    id: "sc-003",
    noticeNumber: "SCN/SEC53/2026/00009",
    applicationId: "app-006",
    applicationNumber: "BA/2025/00982",
    section: "Section 53",
    status: "CLOSED",
    issuedDate: "2026-06-01",
    responseDueDate: "2026-06-16",
    violation: "Rainwater harvesting recharge pit not observed during mid-construction inspection.",
    reason: "Mandatory statutory condition for all plots above 300 sq.m.",
    ownerName: "T. Venkataramana",
    ltpName: "Er. S. Murthy",
    siteAddress: "Plot 88, Sunrise Estates, Vijayawada",
    responseDate: "2026-06-10",
    applicantExplanation: "Recharge pit is constructed below driveway slab at Section B-B. Geotagged photographs taken prior to slab casting enclosed.",
    decisionDate: "2026-06-14",
    decisionRemarks: "Explanation and photographic evidence accepted by Town Planning Officer. Show cause closed with compliance noted.",
    decidedBy: "Director of Town Planning",
  },
  {
    id: "sc-004",
    noticeNumber: "SCN/SEC53/2026/00005",
    applicationId: "app-007",
    applicationNumber: "BA/2025/00741",
    section: "Section 53 & Section 176 (Frauds & Misrepresentation)",
    status: "REFERRED_REVOCATION",
    issuedDate: "2026-04-12",
    responseDueDate: "2026-04-27",
    violation: "Sanctioned 3 floors (G+2). Applicant constructed 5 floors (G+4), violating FSI by 140%.",
    reason: "Gross deviation exceeding permissible compounding limits; structural stability of foundation jeopardized.",
    ownerName: "V. Srinivas",
    ltpName: "Ar. N. Suresh",
    siteAddress: "Benz Circle Main Road, Vijayawada",
    responseDate: "2026-04-24",
    applicantExplanation: "Additional floors were intended as temporary store rooms for material and will be dismantled.",
    decisionDate: "2026-05-02",
    decisionRemarks: "Reply does not deny unauthorized floors. Structural inspection confirmed permanent RCC columns. Referred for formal revocation of permission.",
    decidedBy: "Commissioner",
  },
];

// ------------------------------------------------------------
// 4. REVOKE PROCEEDINGS
// ------------------------------------------------------------
export interface RevocationRecord {
  id: string;
  proceedingNumber: string;
  applicationId: string;
  applicationNumber: string;
  approvalOrderNumber: string;
  approvalDate: string;
  status: "PROPOSED" | "UNDER_REVIEW" | "REVOKED" | "REJECTED";
  proposedDate: string;
  proposedBy: string;
  grounds: string[];
  ownerName: string;
  siteAddress: string;
  showCauseNoticeRef: string;
  hearingHeldDate?: string;
  decisionDate?: string;
  revocationOrderNumber?: string;
  forfeitedFeeAmount?: number;
  remarks: string;
}

export const MOCK_REVOCATIONS: RevocationRecord[] = [
  {
    id: "rev-001",
    proceedingNumber: "REV/2026/00004",
    applicationId: "app-007",
    applicationNumber: "BA/2025/00741",
    approvalOrderNumber: "BPO/2025/00741",
    approvalDate: "2025-08-15",
    status: "UNDER_REVIEW",
    proposedDate: "2026-05-04",
    proposedBy: "Zonal Head (Zone 2)",
    grounds: [
      "Gross deviation: 2 additional unauthorised RCC storeys constructed beyond G+2 sanction.",
      "Failure to rectify deviations within 15 days of Section 53 notice.",
      "Structural non-compliance with National Building Code safety norms.",
    ],
    ownerName: "V. Srinivas",
    siteAddress: "Benz Circle Main Road, Vijayawada",
    showCauseNoticeRef: "SCN/SEC53/2026/00005",
    hearingHeldDate: "2026-05-20",
    remarks: "Personal hearing held. Legal opinion received recommending immediate revocation of building permission.",
  },
  {
    id: "rev-002",
    proceedingNumber: "REV/2026/00002",
    applicationId: "app-008",
    applicationNumber: "BA/2024/00389",
    approvalOrderNumber: "BPO/2024/00389",
    approvalDate: "2024-11-20",
    status: "REVOKED",
    proposedDate: "2026-01-10",
    proposedBy: "Director of Town Planning",
    grounds: [
      "Title deed relied upon (Doc No 4182/2019) declared fraudulent by Sub-Registrar Office vide letter No SRO/2025/441.",
      "False affidavit submitted regarding ownership of public easement right-of-way.",
    ],
    ownerName: "K. Mohan Babu",
    siteAddress: "Auto Nagar, Vijayawada",
    showCauseNoticeRef: "SCN/SEC53/2025/00088",
    hearingHeldDate: "2026-01-25",
    decisionDate: "2026-02-12",
    revocationOrderNumber: "REV-ORDER/2026/0001",
    forfeitedFeeAmount: 185000,
    remarks: "Building permission revoked under Section 176. Permission order cancelled, site ordered for sealing and notice issued to electricity board.",
  },
  {
    id: "rev-003",
    proceedingNumber: "REV/2026/00005",
    applicationId: "app-009",
    applicationNumber: "BA/2025/01102",
    approvalOrderNumber: "BPO/2025/01102",
    approvalDate: "2025-10-18",
    status: "PROPOSED",
    proposedDate: "2026-09-12",
    proposedBy: "Town Planning Assistant",
    grounds: [
      "Total disregard of sanctioned front setback (reduced from 4.5m to 1.1m).",
      "Building constructed on layout road reserve portion.",
    ],
    ownerName: "G. V. Ramana",
    siteAddress: "Gorantla, Guntur",
    showCauseNoticeRef: "SCN/SEC53/2026/00019",
    remarks: "Show cause notice period expired without response. File placed before Commissioner for revocation proceedings.",
  },
];

// ------------------------------------------------------------
// 5. CHANGE OF LTP (TECHNICAL PROFESSIONAL)
// ------------------------------------------------------------
export interface LtpChangeRecord {
  id: string;
  changeRequestNumber: string;
  applicationId: string;
  applicationNumber: string;
  ownerName: string;
  siteAddress: string;
  currentLtp: {
    name: string;
    licenceNo: string;
    role: string;
    organization?: string;
  };
  proposedLtp: {
    name: string;
    licenceNo: string;
    role: string;
    organization?: string;
    phone: string;
    email: string;
  };
  reason: string;
  status: "PENDING_VERIFICATION" | "OPEN" | "APPROVED" | "REJECTED";
  requestedDate: string;
  hasOwnerConsent: boolean;
  hasNewLtpConsent: boolean;
  hasOutgoingLtpNoc: boolean;
  decidedBy?: string;
  decidedDate?: string;
  decisionRemarks?: string;
}

export const MOCK_LTP_CHANGES: LtpChangeRecord[] = [
  {
    id: "chg-001",
    changeRequestNumber: "LTP-CHG/2026/00012",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    ownerName: "P. Raghava Rao",
    siteAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    currentLtp: {
      name: "Ar. Priya Sharma",
      licenceNo: "COA CA/2015/67890",
      role: "Architect",
      organization: "Skyline Design Studio",
    },
    proposedLtp: {
      name: "Er. K. Suresh Kumar",
      licenceNo: "IEI AM-098231",
      role: "Licensed Engineer",
      organization: "BluePrint Engineering",
      phone: "9849011223",
      email: "suresh.kumar@example.com",
    },
    reason: "Original architect has relocated to Hyderabad and is unable to attend site inspections or respond to queries in person.",
    status: "OPEN",
    requestedDate: "2026-09-14",
    hasOwnerConsent: true,
    hasNewLtpConsent: true,
    hasOutgoingLtpNoc: true,
    decisionRemarks: "All required NOCs and indemnity bond verified. Ready for Zonal Head approval.",
  },
  {
    id: "chg-002",
    changeRequestNumber: "LTP-CHG/2026/00008",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    ownerName: "Ch. Anjaneyulu",
    siteAddress: "Survey 114/2B, Brodipet Main Road, Guntur West",
    currentLtp: {
      name: "Ar. Ravi Varma",
      licenceNo: "COA CA/2018/90123",
      role: "Architect",
      organization: "Aakriti Architects",
    },
    proposedLtp: {
      name: "Dr. Srinivas Murthy",
      licenceNo: "SE/SCE/2012/0321",
      role: "Structural Engineer",
      organization: "Murthy Structural Consultants",
      phone: "9000012101",
      email: "dr.murthy@example.com",
    },
    reason: "Mutual termination of consultancy contract; dispute over drawing revision charges amicably resolved.",
    status: "APPROVED",
    requestedDate: "2026-06-20",
    hasOwnerConsent: true,
    hasNewLtpConsent: true,
    hasOutgoingLtpNoc: true,
    decidedBy: "Additional Commissioner",
    decidedDate: "2026-07-02",
    decisionRemarks: "Change approved. Application custody transferred to Dr. Srinivas Murthy.",
  },
  {
    id: "chg-003",
    changeRequestNumber: "LTP-CHG/2026/00015",
    applicationId: "app-005",
    applicationNumber: "BA/2026/00160",
    ownerName: "K. Padmavathi",
    siteAddress: "Lakshmipuram, Guntur",
    currentLtp: {
      name: "Er. Ramesh Babu",
      licenceNo: "IEI M-14309",
      role: "Licensed Engineer",
    },
    proposedLtp: {
      name: "Ar. N. Kavitha",
      licenceNo: "COA CA/2021/45012",
      role: "Architect",
      organization: "Prabhava Design Collective",
      phone: "9440019283",
      email: "kavitha.ar@example.com",
    },
    reason: "Owner desires comprehensive architectural interior & elevation redesign.",
    status: "PENDING_VERIFICATION",
    requestedDate: "2026-09-22",
    hasOwnerConsent: true,
    hasNewLtpConsent: true,
    hasOutgoingLtpNoc: false,
    decisionRemarks: "Outgoing LTP NOC or formal 30-day notice under Rule 14 not yet uploaded.",
  },
];

// ------------------------------------------------------------
// 6. WORK INITIATED (COMMENCEMENT)
// ------------------------------------------------------------
export interface WorkCommencementRecord {
  id: string;
  commencementNumber: string;
  applicationId: string;
  applicationNumber: string;
  approvalOrderNumber: string;
  orderIssuedDate: string;
  status: "AWAITING_PROCEEDING" | "PROCEEDING_ISSUED" | "PENDING_COMMENCEMENT" | "WORK_INITIATED";
  ownerName: string;
  siteAddress: string;
  ltpName: string;
  commencementDate?: string;
  contractor: {
    name: string;
    licenceNo: string;
    phone: string;
    address: string;
  };
  sitePhotosCount: number;
  commencementNoticeUploaded: boolean;
  remarks: string;
}

export const MOCK_WORK_COMMENCEMENTS: WorkCommencementRecord[] = [
  {
    id: "wc-001",
    commencementNumber: "COMM/2026/00028",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    approvalOrderNumber: "BPO/2026/00142",
    orderIssuedDate: "2026-04-10",
    status: "WORK_INITIATED",
    ownerName: "P. Raghava Rao",
    siteAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    ltpName: "Ar. Priya Sharma",
    commencementDate: "2026-05-15",
    contractor: {
      name: "Sri Venkateswara Constructions",
      licenceNo: "CL/GHMC/2023/0412",
      phone: "9848012345",
      address: "Plot 14, Industrial Estate, Guntur",
    },
    sitePhotosCount: 4,
    commencementNoticeUploaded: true,
    remarks: "Foundation excavation completed. Permit display board erected at main gate as required.",
  },
  {
    id: "wc-002",
    commencementNumber: "COMM/2026/00031",
    applicationId: "app-002",
    applicationNumber: "BA/2026/00145",
    approvalOrderNumber: "BPO/2026/00145",
    orderIssuedDate: "2026-08-01",
    status: "PENDING_COMMENCEMENT",
    ownerName: "S. Venkatesh",
    siteAddress: "Plot No. 18, Amaravati Heights, Vijayawada Rural",
    ltpName: "Er. K. Suresh Kumar",
    commencementDate: "2026-10-15",
    contractor: {
      name: "Nandi Infra Projects Pvt Ltd",
      licenceNo: "CL/VMC/2022/1908",
      phone: "9989019283",
      address: "M.G. Road, Vijayawada",
    },
    sitePhotosCount: 2,
    commencementNoticeUploaded: true,
    remarks: "Notice of commencement submitted in advance. Soil investigation under way.",
  },
  {
    id: "wc-003",
    commencementNumber: "COMM/2026/00035",
    applicationId: "app-010",
    applicationNumber: "BA/2026/00201",
    approvalOrderNumber: "BPO/2026/00201",
    orderIssuedDate: "2026-09-05",
    status: "PROCEEDING_ISSUED",
    ownerName: "M. Sarita",
    siteAddress: "Brodipet 4th Line, Guntur",
    ltpName: "Ar. Ravi Varma",
    contractor: {
      name: "Unassigned",
      licenceNo: "-",
      phone: "-",
      address: "-",
    },
    sitePhotosCount: 0,
    commencementNoticeUploaded: false,
    remarks: "Building permission order issued on 05-09-2026. Awaiting LTP notice of commencement.",
  },
];

// ------------------------------------------------------------
// 7. DEVELOPERS
// ------------------------------------------------------------
export interface DeveloperRecord {
  id: string;
  registrationNumber: string;
  companyName: string;
  developerType: "PRIVATE_LIMITED" | "PUBLIC_LIMITED" | "PARTNERSHIP" | "PROPRIETORSHIP" | "LLP";
  authorizedPerson: string;
  designation: string;
  pan: string;
  gstin: string;
  incorporationNo: string;
  reraNumber: string;
  grade: "GRADE_A" | "GRADE_B" | "GRADE_C";
  phone: string;
  email: string;
  address: string;
  district: string;
  status: "APPROVED" | "PENDING" | "SHORTFALL" | "REJECTED" | "EXPIRED" | "RENEWAL";
  validFrom: string;
  validTo: string;
  activeProjects: number;
  experienceYears: number;
}

export const MOCK_DEVELOPERS: DeveloperRecord[] = [
  {
    id: "dev-001",
    registrationNumber: "DEV/AP/2023/0014",
    companyName: "Sri Sai Constructions Pvt Ltd",
    developerType: "PRIVATE_LIMITED",
    authorizedPerson: "Venkat Reddy",
    designation: "Managing Director",
    pan: "ZZZCS1101A",
    gstin: "37ZZZCS1101A1Z4",
    incorporationNo: "U45200AP2011PTC074411",
    reraNumber: "AP-RERA-P-2019-0418",
    grade: "GRADE_A",
    phone: "9000011001",
    email: "office@srisaiconstructions.example.com",
    address: "D.No 12-4-88, Main Road, Brodipet",
    district: "Guntur",
    status: "APPROVED",
    validFrom: "2023-08-01",
    validTo: "2026-07-31",
    activeProjects: 6,
    experienceYears: 14,
  },
  {
    id: "dev-002",
    registrationNumber: "DEV/AP/2024/0029",
    companyName: "Amaravati Urban Developers LLP",
    developerType: "LLP",
    authorizedPerson: "Ch. Anitha",
    designation: "Designated Partner",
    pan: "ZZZLL2209B",
    gstin: "37ZZZLL2209B1Z2",
    incorporationNo: "AAA-8901",
    reraNumber: "AP-RERA-P-2022-0981",
    grade: "GRADE_A",
    phone: "9000011002",
    email: "contact@amaravatiurban.example.com",
    address: "Benz Circle, Vijayawada",
    district: "Krishna",
    status: "APPROVED",
    validFrom: "2024-03-15",
    validTo: "2027-03-14",
    activeProjects: 9,
    experienceYears: 11,
  },
  {
    id: "dev-003",
    registrationNumber: "DEV/AP/2026/0005",
    companyName: "Green Meadows Estates",
    developerType: "PARTNERSHIP",
    authorizedPerson: "M. Harish",
    designation: "Managing Partner",
    pan: "ZZZPT3301C",
    gstin: "37ZZZPT3301C1Z8",
    incorporationNo: "REG-AP-GNT-2020-11",
    reraNumber: "AP-RERA-P-2023-1102",
    grade: "GRADE_B",
    phone: "9000011003",
    email: "info@greenmeadows.example.com",
    address: "Gorantla, Guntur",
    district: "Guntur",
    status: "SHORTFALL",
    validFrom: "2026-01-10",
    validTo: "2029-01-09",
    activeProjects: 2,
    experienceYears: 6,
  },
  {
    id: "dev-004",
    registrationNumber: "DEV/AP/2021/0002",
    companyName: "Skyline Infra Build Ltd",
    developerType: "PUBLIC_LIMITED",
    authorizedPerson: "D. Sridhar Raju",
    designation: "Director",
    pan: "ZZZPL4401D",
    gstin: "37ZZZPL4401D1Z1",
    incorporationNo: "L45200AP2005PLC048912",
    reraNumber: "AP-RERA-P-2018-0112",
    grade: "GRADE_A",
    phone: "9000011004",
    email: "corp@skylineinfra.example.com",
    address: "Seethammadhara, Visakhapatnam",
    district: "Visakhapatnam",
    status: "RENEWAL",
    validFrom: "2021-09-01",
    validTo: "2024-08-31",
    activeProjects: 4,
    experienceYears: 19,
  },
  {
    id: "dev-005",
    registrationNumber: "DEV/AP/2026/0011",
    companyName: "Vasavi Township Developers",
    developerType: "PROPRIETORSHIP",
    authorizedPerson: "V. Padmavathi",
    designation: "Proprietor",
    pan: "ZZZPP5501E",
    gstin: "37ZZZPP5501E1Z9",
    incorporationNo: "UDYAM-AP-08-00129",
    reraNumber: "Applied",
    grade: "GRADE_C",
    phone: "9000011005",
    email: "vasavi.township@example.com",
    address: "Dargamitta, Nellore",
    district: "Nellore",
    status: "PENDING",
    validFrom: "2026-09-01",
    validTo: "2029-08-31",
    activeProjects: 1,
    experienceYears: 3,
  },
];

// ------------------------------------------------------------
// 8. LTP — LICENSED TECHNICAL PERSONS
// ------------------------------------------------------------
export interface ProfessionalRecord {
  id: string;
  registrationNumber: string;
  name: string;
  professionalType: "ARCHITECT" | "ENGINEER" | "STRUCTURAL_ENGINEER" | "TOWN_PLANNER";
  licenceNo: string;
  councilRegistration: string;
  qualification: string;
  experienceYears: number;
  organization: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  status: "APPROVED" | "PENDING" | "IN_PROCESS" | "SHORTFALL" | "VERIFIED" | "REJECTED" | "EXPIRED" | "RENEWAL";
  validFrom: string;
  validTo: string;
  applicationsCount: number;
}

export const MOCK_PROFESSIONALS: ProfessionalRecord[] = [
  {
    id: "ltp-001",
    registrationNumber: "LTP/AP/2021/0088",
    name: "Ar. Priya Sharma",
    professionalType: "ARCHITECT",
    licenceNo: "COA CA/2015/67890",
    councilRegistration: "Council of Architecture, New Delhi",
    qualification: "B.Arch (SPA Vijayawada)",
    experienceYears: 11,
    organization: "Skyline Design Studio",
    phone: "9848099881",
    email: "priya.sharma@example.com",
    address: "4th Line, Arundelpet, Guntur",
    district: "Guntur",
    status: "APPROVED",
    validFrom: "2021-04-01",
    validTo: "2026-03-31",
    applicationsCount: 28,
  },
  {
    id: "ltp-002",
    registrationNumber: "LTP/AP/2019/0045",
    name: "Dr. Srinivas Murthy",
    professionalType: "STRUCTURAL_ENGINEER",
    licenceNo: "SE/SCE/2012/0321",
    councilRegistration: "State Council of Engineers, AP",
    qualification: "Ph.D (Structural Engineering, IIT Madras)",
    experienceYears: 19,
    organization: "Murthy Structural Consultants",
    phone: "9000012101",
    email: "dr.murthy@example.com",
    address: "Bank Street, Brodipet, Guntur",
    district: "Guntur",
    status: "APPROVED",
    validFrom: "2022-01-01",
    validTo: "2027-12-31",
    applicationsCount: 52,
  },
  {
    id: "ltp-003",
    registrationNumber: "LTP/AP/2020/0112",
    name: "Er. K. Suresh Kumar",
    professionalType: "ENGINEER",
    licenceNo: "IEI AM-098231",
    councilRegistration: "Institution of Engineers (India)",
    qualification: "B.Tech (Civil Engineering, JNTU Kakinada)",
    experienceYears: 15,
    organization: "BluePrint Engineering",
    phone: "9849011223",
    email: "suresh.kumar@example.com",
    address: "Patamata, Vijayawada",
    district: "Krishna",
    status: "APPROVED",
    validFrom: "2020-07-15",
    validTo: "2025-07-14",
    applicationsCount: 41,
  },
  {
    id: "ltp-004",
    registrationNumber: "LTP/AP/2022/0219",
    name: "Ar. Ravi Varma",
    professionalType: "ARCHITECT",
    licenceNo: "COA CA/2018/90123",
    councilRegistration: "Council of Architecture, New Delhi",
    qualification: "M.Arch (Urban Design, JNAFAU)",
    experienceYears: 8,
    organization: "Aakriti Architects",
    phone: "9949088771",
    email: "ravi.varma@example.com",
    address: "Lakshmipuram, Guntur",
    district: "Guntur",
    status: "APPROVED",
    validFrom: "2022-05-10",
    validTo: "2027-05-09",
    applicationsCount: 19,
  },
  {
    id: "ltp-005",
    registrationNumber: "LTP/AP/2026/0014",
    name: "Plnr. K. Venkataramana",
    professionalType: "TOWN_PLANNER",
    licenceNo: "ITPI/2016/092",
    councilRegistration: "Institute of Town Planners, India",
    qualification: "M.Plan (Urban & Regional Planning)",
    experienceYears: 12,
    organization: "Meridian Planners",
    phone: "9848011200",
    email: "ramana.plan@example.com",
    address: "MVP Colony, Visakhapatnam",
    district: "Visakhapatnam",
    status: "VERIFIED",
    validFrom: "2026-09-01",
    validTo: "2031-08-31",
    applicationsCount: 7,
  },
  {
    id: "ltp-006",
    registrationNumber: "LTP/AP/2026/0019",
    name: "Er. B. Anitha Reddy",
    professionalType: "ENGINEER",
    licenceNo: "IEI M-158902",
    councilRegistration: "Institution of Engineers (India)",
    qualification: "M.Tech (Structures)",
    experienceYears: 7,
    organization: "Nirman Consultancy",
    phone: "9440019280",
    email: "anitha.reddy@example.com",
    address: "Magunta Layout, Nellore",
    district: "Nellore",
    status: "SHORTFALL",
    validFrom: "2026-08-15",
    validTo: "2029-08-14",
    applicationsCount: 3,
  },
];

// ------------------------------------------------------------
// 9. OUTWARD REGISTER
// ------------------------------------------------------------
export interface OutwardRecord {
  id: string;
  dispatchNumber: string;
  applicationId: string;
  applicationNumber: string;
  documentType: "BUILDING_PERMIT_ORDER" | "OCCUPANCY_CERTIFICATE" | "SHOW_CAUSE_NOTICE" | "REVOCATION_ORDER" | "HEARING_NOTICE" | "SHORTFALL_MEMO";
  dispatchMode: "SPEED_POST" | "REGISTERED_POST" | "HAND_DELIVERY" | "EMAIL" | "SPECIAL_MESSENGER";
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
  dispatchDate: string;
  deliveryDate?: string;
  status: "PENDING" | "DISPATCHED" | "DELIVERED" | "ACKNOWLEDGED" | "RETURNED";
  senderOfficer: string;
  remarks?: string;
}

export const MOCK_OUTWARD: OutwardRecord[] = [
  {
    id: "out-001",
    dispatchNumber: "OUT/GNT/2026/00412",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    documentType: "BUILDING_PERMIT_ORDER",
    dispatchMode: "SPEED_POST",
    trackingNumber: "EP892014902IN",
    recipientName: "P. Raghava Rao",
    recipientAddress: "D.No 4-12-8, Brodipet, Guntur, AP - 522002",
    dispatchDate: "2026-04-12 11:00",
    deliveryDate: "2026-04-14 14:30",
    status: "ACKNOWLEDGED",
    senderOfficer: "Zonal Head (Zone 1)",
    remarks: "Signed postal acknowledgment card received back and placed on file.",
  },
  {
    id: "out-002",
    dispatchNumber: "OUT/GNT/2026/00588",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    documentType: "SHOW_CAUSE_NOTICE",
    dispatchMode: "SPEED_POST",
    trackingNumber: "EP910293841IN",
    recipientName: "P. Raghava Rao",
    recipientAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    dispatchDate: "2026-09-19 10:30",
    status: "DISPATCHED",
    senderOfficer: "Assistant City Planner",
    remarks: "In transit with India Post. SMS delivery intimation triggered.",
  },
  {
    id: "out-003",
    dispatchNumber: "OUT/VJA/2026/00291",
    applicationId: "app-007",
    applicationNumber: "BA/2025/00741",
    documentType: "REVOCATION_ORDER",
    dispatchMode: "SPECIAL_MESSENGER",
    trackingNumber: "SM-VMC-2026-89",
    recipientName: "V. Srinivas",
    recipientAddress: "Benz Circle Main Road, Vijayawada",
    dispatchDate: "2026-05-05 15:00",
    deliveryDate: "2026-05-05 17:15",
    status: "DELIVERED",
    senderOfficer: "City Planner",
    remarks: "Delivered by hand messenger. Receiver signed triplicate copy.",
  },
  {
    id: "out-004",
    dispatchNumber: "OUT/GNT/2026/00612",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    documentType: "SHORTFALL_MEMO",
    dispatchMode: "EMAIL",
    trackingNumber: "EM-20260921-0012",
    recipientName: "Ch. Anjaneyulu",
    recipientAddress: "anjaneyulu.ch@example.com",
    dispatchDate: "2026-09-21 09:15",
    deliveryDate: "2026-09-21 09:16",
    status: "ACKNOWLEDGED",
    senderOfficer: "Town Planning Assistant",
    remarks: "Delivered electronically to applicant and LTP registered email IDs.",
  },
  {
    id: "out-005",
    dispatchNumber: "OUT/GNT/2026/00380",
    applicationId: "app-011",
    applicationNumber: "BA/2025/00619",
    documentType: "HEARING_NOTICE",
    dispatchMode: "REGISTERED_POST",
    trackingNumber: "RP771029182IN",
    recipientName: "M. Koteswara Rao",
    recipientAddress: "Old Market Road, Nallapadu, Guntur",
    dispatchDate: "2026-03-01 10:00",
    status: "RETURNED",
    senderOfficer: "Administrative Officer",
    remarks: "Returned undelivered with endorsement 'Door Locked / Addressee Not Found'.",
  },
];

// ------------------------------------------------------------
// 10. OFFICER TASKS QUEUE
// ------------------------------------------------------------
export interface WorkflowTaskRecord {
  id: string;
  taskNumber: string;
  applicationId: string;
  applicationNumber: string;
  taskType: "DRAWING_SCRUTINY" | "SITE_INSPECTION" | "DOCUMENT_VERIFICATION" | "ZONAL_REVIEW" | "DIRECTOR_REVIEW" | "COMMISSIONER_REVIEW" | "NOC_VERIFICATION" | "SHORTFALL_REVIEW";
  title: string;
  assignedRole: string;
  assigneeName?: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  stage: string;
  dueDate: string;
  daysRemaining: number;
  status: "AT_DESK" | "HELD_BY_ME" | "DUE_SOON" | "OVERDUE" | "COMPLETED";
  applicantName: string;
  siteAddress: string;
  zone: string;
}

export const MOCK_TASKS: WorkflowTaskRecord[] = [
  {
    id: "tsk-001",
    taskNumber: "TSK/2026/00091",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    taskType: "ZONAL_REVIEW",
    title: "Zonal Head Technical Review & Recommendation",
    assignedRole: "ZONAL_HEAD",
    assigneeName: "B. Sridhar (Zonal Officer)",
    priority: "HIGH",
    stage: "Zonal Review",
    dueDate: "2026-09-28",
    daysRemaining: 2,
    status: "HELD_BY_ME",
    applicantName: "P. Raghava Rao",
    siteAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    zone: "Zone 1",
  },
  {
    id: "tsk-002",
    taskNumber: "TSK/2026/00094",
    applicationId: "app-002",
    applicationNumber: "BA/2026/00145",
    taskType: "SITE_INSPECTION",
    title: "Field Site Inspection & 27-Question Checklist Record",
    assignedRole: "TOWN_PLANNING_ASSISTANT",
    assigneeName: "V. Lakshmi Narayana",
    priority: "NORMAL",
    stage: "Site Inspection",
    dueDate: "2026-09-30",
    daysRemaining: 4,
    status: "AT_DESK",
    applicantName: "S. Venkatesh",
    siteAddress: "Plot No. 18, Amaravati Heights, Vijayawada Rural",
    zone: "Zone 2",
  },
  {
    id: "tsk-003",
    taskNumber: "TSK/2026/00088",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    taskType: "SHORTFALL_REVIEW",
    title: "Review of Resubmitted Electrical NOC Compliance",
    assignedRole: "ZONAL_HEAD",
    priority: "CRITICAL",
    stage: "Shortfall Review",
    dueDate: "2026-09-24",
    daysRemaining: -1,
    status: "OVERDUE",
    applicantName: "Ch. Anjaneyulu",
    siteAddress: "Survey 114/2B, Brodipet Main Road, Guntur West",
    zone: "Zone 1",
  },
  {
    id: "tsk-004",
    taskNumber: "TSK/2026/00099",
    applicationId: "app-005",
    applicationNumber: "BA/2026/00160",
    taskType: "DOCUMENT_VERIFICATION",
    title: "Verify Title Deed, Encumbrance and Structural Stability Certificate",
    assignedRole: "PLANNING_OFFICER",
    priority: "NORMAL",
    stage: "Document Verification",
    dueDate: "2026-10-02",
    daysRemaining: 6,
    status: "AT_DESK",
    applicantName: "K. Padmavathi",
    siteAddress: "Lakshmipuram, Guntur",
    zone: "Zone 1",
  },
  {
    id: "tsk-005",
    taskNumber: "TSK/2026/00078",
    applicationId: "app-007",
    applicationNumber: "BA/2025/00741",
    taskType: "COMMISSIONER_REVIEW",
    title: "Final Orders on Revocation Proceeding Under Sec 53",
    assignedRole: "COMMISSIONER",
    assigneeName: "Municipal Commissioner",
    priority: "CRITICAL",
    stage: "Commissioner Review",
    dueDate: "2026-09-27",
    daysRemaining: 1,
    status: "DUE_SOON",
    applicantName: "V. Srinivas",
    siteAddress: "Benz Circle Main Road, Vijayawada",
    zone: "Zone 2",
  },
];

// ------------------------------------------------------------
// 11. SHORTFALLS REGISTER
// ------------------------------------------------------------
export interface ShortfallItemDetail {
  id: string;
  category: string;
  observation: string;
  requiredAction: string;
  resolved: boolean;
  resolutionRemarks?: string;
  attachedDocumentName?: string;
}

export interface ShortfallRegisterRecord {
  id: string;
  shortfallNumber: string;
  applicationId: string;
  applicationNumber: string;
  cycle: number;
  stageName: string;
  status: "OPEN" | "AWAITING_APPLICANT" | "AWAITING_OFFICER" | "RESOLVED" | "OVERDUE";
  raisedBy: string;
  raisedDate: string;
  dueDate: string;
  responseDate?: string;
  ownerName: string;
  ltpName: string;
  siteAddress: string;
  items: ShortfallItemDetail[];
}

export const MOCK_SHORTFALLS_REGISTER: ShortfallRegisterRecord[] = [
  {
    id: "sf-001",
    shortfallNumber: "SF/2026/00041",
    applicationId: "app-003",
    applicationNumber: "BA/2026/00128",
    cycle: 1,
    stageName: "Site Inspection & NOC",
    status: "AWAITING_APPLICANT",
    raisedBy: "K. Murali Mohan (TPA)",
    raisedDate: "2026-02-19",
    dueDate: "2026-03-05",
    ownerName: "Ch. Anjaneyulu",
    ltpName: "Ar. Ravi Varma",
    siteAddress: "Survey 114/2B, Brodipet Main Road, Guntur West",
    items: [
      {
        id: "sfi-1",
        category: "Safety Constraints",
        observation: "High-tension 33kV overhead line passes within 2.8m of east boundary.",
        requiredAction: "Obtain NOC from APCPDCL specifying required vertical and horizontal clearance.",
        resolved: false,
      },
      {
        id: "sfi-2",
        category: "Setback Clearances",
        observation: "East setback shown as 2.0m on drawing, minimum required is 3.0m.",
        requiredAction: "Revise building drawing setbacks and re-upload CAD plan.",
        resolved: false,
      },
    ],
  },
  {
    id: "sf-002",
    shortfallNumber: "SF/2026/00038",
    applicationId: "app-005",
    applicationNumber: "BA/2026/00160",
    cycle: 1,
    stageName: "Document Verification",
    status: "AWAITING_OFFICER",
    raisedBy: "B. Sridhar (Zonal Head)",
    raisedDate: "2026-09-10",
    dueDate: "2026-09-25",
    responseDate: "2026-09-22",
    ownerName: "K. Padmavathi",
    ltpName: "Ar. N. Kavitha",
    siteAddress: "Lakshmipuram, Guntur",
    items: [
      {
        id: "sfi-3",
        category: "Encumbrance Certificate",
        observation: "Submitted Encumbrance Certificate expired on 31-12-2025.",
        requiredAction: "Submit latest EC covering period up to date of application.",
        resolved: true,
        resolutionRemarks: "Fresh EC from Sub-Registrar uploaded by LTP on 22-09-2026.",
        attachedDocumentName: "EC_LATEST_2026.pdf",
      },
    ],
  },
  {
    id: "sf-003",
    shortfallNumber: "SF/2026/00021",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    cycle: 1,
    stageName: "Drawing Scrutiny",
    status: "RESOLVED",
    raisedBy: "Auto-Scrutiny Engine",
    raisedDate: "2026-01-15",
    dueDate: "2026-01-30",
    responseDate: "2026-01-20",
    ownerName: "P. Raghava Rao",
    ltpName: "Ar. Priya Sharma",
    siteAddress: "Plot No. 42, Green Meadows Layout, Guntur East",
    items: [
      {
        id: "sfi-4",
        category: "Staircase Dimensions",
        observation: "Tread width 250mm, required minimum 300mm under building rules.",
        requiredAction: "Modify architectural drawing staircase section.",
        resolved: true,
        resolutionRemarks: "Revised drawing version 2 scrutinized and passed.",
        attachedDocumentName: "ARCH_PLAN_REV2.dwg",
      },
    ],
  },
];

// ------------------------------------------------------------
// 12. PAYMENTS REGISTER
// ------------------------------------------------------------
export interface PaymentRegisterRecord {
  id: string;
  transactionId: string;
  challanNumber: string;
  applicationId: string;
  applicationNumber: string;
  amount: number;
  paymentMode: "UPI" | "NET_BANKING" | "DEBIT_CARD" | "CREDIT_CARD" | "NEFT_RTGS";
  gatewayRef: string;
  status: "SUCCESS" | "PROCESSING" | "INITIATED" | "FAILED" | "TIMEOUT";
  payerName: string;
  ltpName: string;
  paidAt?: string;
  createdAt: string;
  feeBreakdown: Array<{ head: string; amount: number }>;
}

export const MOCK_PAYMENTS_REGISTER: PaymentRegisterRecord[] = [
  {
    id: "pay-001",
    transactionId: "TXN/2026/902148",
    challanNumber: "CHL/2026/00142",
    applicationId: "app-001",
    applicationNumber: "BA/2026/00142",
    amount: 84500,
    paymentMode: "NET_BANKING",
    gatewayRef: "SBI_EPAY_8921049281",
    status: "SUCCESS",
    payerName: "P. Raghava Rao",
    ltpName: "Ar. Priya Sharma",
    paidAt: "2026-03-20 14:15:22",
    createdAt: "2026-03-20 14:10:00",
    feeBreakdown: [
      { head: "Building Permit Application Fee", amount: 15000 },
      { head: "Development & Betterment Charges", amount: 48000 },
      { head: "Rainwater Harvesting Security Deposit", amount: 10000 },
      { head: "Labour Cess (1%)", amount: 11500 },
    ],
  },
  {
    id: "pay-002",
    transactionId: "TXN/2026/902188",
    challanNumber: "CHL/2026/00145",
    applicationId: "app-002",
    applicationNumber: "BA/2026/00145",
    amount: 142000,
    paymentMode: "UPI",
    gatewayRef: "HDFC_UPI_492109283",
    status: "SUCCESS",
    payerName: "S. Venkatesh",
    ltpName: "Er. K. Suresh Kumar",
    paidAt: "2026-07-28 11:42:05",
    createdAt: "2026-07-28 11:39:10",
    feeBreakdown: [
      { head: "Commercial Building Permit Fee", amount: 42000 },
      { head: "City Infrastructure Impact Fee", amount: 80000 },
      { head: "Debris & Demolition Security Fee", amount: 20000 },
    ],
  },
  {
    id: "pay-003",
    transactionId: "TXN/2026/902205",
    challanNumber: "CHL/2026/00160",
    applicationId: "app-005",
    applicationNumber: "BA/2026/00160",
    amount: 62000,
    paymentMode: "NET_BANKING",
    gatewayRef: "ICICI_NETB_1092831",
    status: "PROCESSING",
    payerName: "K. Padmavathi",
    ltpName: "Ar. N. Kavitha",
    createdAt: "2026-09-25 16:30:00",
    feeBreakdown: [
      { head: "Residential Building Permit Fee", amount: 22000 },
      { head: "Subdivision Regularisation Fee", amount: 40000 },
    ],
  },
  {
    id: "pay-004",
    transactionId: "TXN/2026/901994",
    challanNumber: "CHL/2026/00098",
    applicationId: "app-012",
    applicationNumber: "BA/2026/00098",
    amount: 35000,
    paymentMode: "CREDIT_CARD",
    gatewayRef: "AXIS_PG_9981023",
    status: "FAILED",
    payerName: "M. Harish",
    ltpName: "Ar. Ravi Varma",
    createdAt: "2026-09-18 10:12:00",
    feeBreakdown: [
      { head: "Initial Scrutiny Fee", amount: 35000 },
    ],
  },
];
