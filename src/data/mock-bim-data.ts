export type BimStatus =
  | "BIM_NOT_SUBMITTED"
  | "BIM_UPLOADED"
  | "BIM_VALIDATING"
  | "BIM_VALIDATION_FAILED"
  | "BIM_VALIDATION_PASSED"
  | "BIM_SCRUTINY_IN_PROGRESS"
  | "BIM_SCRUTINY_PASSED"
  | "BIM_SCRUTINY_FAILED"
  | "BIM_REVISION_REQUIRED"
  | "BIM_ACCEPTED";

export type RuleSeverity = "CRITICAL" | "MAJOR" | "MINOR";
export type RuleStatus = "PASS" | "FAIL" | "WARNING";
export type RuleCategory = "Setbacks" | "Bulk & Density" | "Amenities" | "Fire & Safety" | "Sustainability";

export interface BimScrutinyRule {
  id: string;
  category: RuleCategory;
  title: string;
  description: string;
  requiredValue: string;
  observedValue: string;
  delta: string;
  status: RuleStatus;
  severity: RuleSeverity;
  elementName?: string;
  elementGuid?: string;
  cameraTarget?: { x: number; y: number; z: number };
  recommendation?: string;
}

export interface BimStorey {
  id: string;
  name: string;
  elevation: number; // in meters
  height: number;
  builtUpArea: number; // in m²
  carpetArea: number;
  spacesCount: number;
}

export interface BimBuildingMetrics {
  grossFloorArea: number;
  groundCoverageArea: number;
  groundCoveragePct: number;
  buildingHeight: number;
  storeysAboveGround: number;
  basements: number;
  farAchieved: number;
  farPermissible: number;
  parkingEcsProvided: number;
  parkingEcsRequired: number;
  spaceCount: number;
  wallCount: number;
  slabCount: number;
  columnCount: number;
  doorCount: number;
  windowCount: number;
}

export interface BimVersion {
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  fileSizeBytes: number;
  schemaVersion: string;
  status: BimStatus;
  checksum: string;
  summaryNotes: string;
  violationsCount: number;
  resolvedShortfalls?: string[];
}

export interface BimModelData {
  applicationId: string;
  projectName: string;
  currentVersion: number;
  status: BimStatus;
  activeFileName: string;
  activeFileSize: string;
  schema: string;
  lastUpdated: string;
  metrics: BimBuildingMetrics;
  storeys: BimStorey[];
  rules: BimScrutinyRule[];
  versions: BimVersion[];
}

// =========================================================================
// MOCK BIM DATA STORE (Strictly referencing existing Application IDs)
// =========================================================================

export const MOCK_BIM_MODELS: Record<string, BimModelData> = {
  // 1. Greenfield Residency (Draft / Initial upload)
  "MC/BP/2026/04/0001": {
    applicationId: "MC/BP/2026/04/0001",
    projectName: "Greenfield Residency — Baner",
    currentVersion: 1,
    status: "BIM_SCRUTINY_FAILED",
    activeFileName: "Greenfield_Residency_v1.ifc",
    activeFileSize: "24.6 MB",
    schema: "IFC4 (Reference View)",
    lastUpdated: "2026-01-20T09:15:00",
    metrics: {
      grossFloorArea: 1780.45,
      groundCoverageArea: 582.1,
      groundCoveragePct: 58.2,
      buildingHeight: 14.8,
      storeysAboveGround: 4,
      basements: 1,
      farAchieved: 1.42,
      farPermissible: 1.5,
      parkingEcsProvided: 16,
      parkingEcsRequired: 22,
      spaceCount: 36,
      wallCount: 142,
      slabCount: 6,
      columnCount: 28,
      doorCount: 48,
      windowCount: 56,
    },
    storeys: [
      { id: "st-b1", name: "Basement Parking", elevation: -3.2, height: 3.2, builtUpArea: 640.0, carpetArea: 590.0, spacesCount: 16 },
      { id: "st-g", name: "Ground Floor", elevation: 0.0, height: 3.8, builtUpArea: 582.1, carpetArea: 495.2, spacesCount: 8 },
      { id: "st-1", name: "First Floor (Typical)", elevation: 3.8, height: 3.2, builtUpArea: 399.4, carpetArea: 345.0, spacesCount: 6 },
      { id: "st-2", name: "Second Floor (Typical)", elevation: 7.0, height: 3.2, builtUpArea: 399.4, carpetArea: 345.0, spacesCount: 6 },
      { id: "st-3", name: "Third Floor", elevation: 10.2, height: 3.2, builtUpArea: 399.4, carpetArea: 345.0, spacesCount: 6 },
      { id: "st-r", name: "Terrace / Roof", elevation: 13.4, height: 1.4, builtUpArea: 45.0, carpetArea: 30.0, spacesCount: 2 },
    ],
    rules: [
      {
        id: "DCR-SB-01",
        category: "Setbacks",
        title: "Front Setback Compliance",
        description: "Minimum clearance between front boundary road edge and building exterior envelope.",
        requiredValue: "6.00 m",
        observedValue: "4.80 m",
        delta: "-1.20 m",
        status: "FAIL",
        severity: "CRITICAL",
        elementName: "IfcWall_Exterior_Front_L1",
        elementGuid: "2O2$O$tVn0$xW_0001",
        cameraTarget: { x: 0, y: 1.8, z: 7.5 },
        recommendation: "Shift the front structural facade inward by at least 1.20 m to comply with 12m road margin regulations.",
      },
      {
        id: "DCR-SB-02",
        category: "Setbacks",
        title: "Rear Setback Compliance",
        description: "Minimum distance from rear parcel plot boundary line.",
        requiredValue: "4.00 m",
        observedValue: "4.20 m",
        delta: "+0.20 m",
        status: "PASS",
        severity: "MAJOR",
        elementName: "IfcWall_Exterior_Rear_L1",
        elementGuid: "3A1$B$cDe2$zY_0002",
        cameraTarget: { x: 0, y: 1.8, z: -7.5 },
      },
      {
        id: "DCR-SB-03",
        category: "Setbacks",
        title: "Side Setback (East)",
        description: "Minimum lateral side margin clearance from eastern neighbor boundary.",
        requiredValue: "3.00 m",
        observedValue: "1.90 m",
        delta: "-1.10 m",
        status: "FAIL",
        severity: "CRITICAL",
        elementName: "IfcColumn_East_C04",
        elementGuid: "4F3$G$hIj5$uV_0003",
        cameraTarget: { x: 7.2, y: 1.8, z: 0 },
        recommendation: "East side cantilever balcony exceeds maximum allowable projection by 1.10m.",
      },
      {
        id: "DCR-SB-04",
        category: "Setbacks",
        title: "Side Setback (West)",
        description: "Minimum lateral side margin clearance from western neighbor boundary.",
        requiredValue: "3.00 m",
        observedValue: "3.10 m",
        delta: "+0.10 m",
        status: "PASS",
        severity: "MAJOR",
        elementName: "IfcWall_Exterior_West_L1",
        elementGuid: "5H4$I$jKl6$tU_0004",
        cameraTarget: { x: -7.2, y: 1.8, z: 0 },
      },
      {
        id: "DCR-BD-01",
        category: "Bulk & Density",
        title: "Maximum Building Height",
        description: "Total structural height from average ground level to terrace parapet.",
        requiredValue: "15.00 m",
        observedValue: "14.80 m",
        delta: "-0.20 m",
        status: "PASS",
        severity: "MAJOR",
        elementName: "IfcRoof_Main_Terrace",
        elementGuid: "6J5$K$lMn7$sT_0005",
        cameraTarget: { x: 0, y: 14.8, z: 0 },
      },
      {
        id: "DCR-BD-02",
        category: "Bulk & Density",
        title: "Ground Coverage Percentage",
        description: "Ratio of ground floor building footprint to total parcel plot area.",
        requiredValue: "60.00 %",
        observedValue: "58.20 %",
        delta: "-1.80 %",
        status: "PASS",
        severity: "MAJOR",
        elementName: "IfcSlab_GroundFloor",
        elementGuid: "7L6$M$nOp8$rS_0006",
        cameraTarget: { x: 0, y: 0.5, z: 0 },
      },
      {
        id: "DCR-BD-03",
        category: "Bulk & Density",
        title: "Floor Area Ratio (FAR / FSI)",
        description: "Cumulative gross built-up area divided by net plot area.",
        requiredValue: "1.50",
        observedValue: "1.42",
        delta: "-0.08",
        status: "PASS",
        severity: "CRITICAL",
        cameraTarget: { x: 0, y: 6.0, z: 0 },
      },
      {
        id: "DCR-AM-01",
        category: "Amenities",
        title: "Equivalent Car Parking Spaces (ECS)",
        description: "Mandatory off-street parking bays based on residential tenement count.",
        requiredValue: "22 ECS",
        observedValue: "16 ECS",
        delta: "-6 ECS",
        status: "FAIL",
        severity: "MAJOR",
        elementName: "IfcSpace_Basement_Parking",
        elementGuid: "8N7$O$pQr9$qR_0007",
        cameraTarget: { x: 0, y: -2.5, z: 0 },
        recommendation: "Provide 6 additional car parking spaces in basement or ground stilt area.",
      },
      {
        id: "DCR-FS-01",
        category: "Fire & Safety",
        title: "Staircase Flight Width",
        description: "Minimum unobstructed clear escape width for primary fire evacuation stairs.",
        requiredValue: "1.50 m",
        observedValue: "1.80 m",
        delta: "+0.30 m",
        status: "PASS",
        severity: "CRITICAL",
        elementName: "IfcStair_Core_A",
        elementGuid: "9P8$Q$rSt0$pQ_0008",
        cameraTarget: { x: 2.5, y: 4.5, z: 2.0 },
      },
      {
        id: "DCR-SU-01",
        category: "Sustainability",
        title: "Rainwater Harvesting Tank Volume",
        description: "RWH storage tank capacity proportional to rooftop catchment surface.",
        requiredValue: "25 m³",
        observedValue: "28 m³",
        delta: "+3.0 m³",
        status: "PASS",
        severity: "MINOR",
        elementName: "IfcTank_RWH_Ground",
        elementGuid: "0R9$S$tUv1$oP_0009",
        cameraTarget: { x: -6.0, y: 0.0, z: -6.0 },
      },
    ],
    versions: [
      {
        version: 1,
        uploadedAt: "2026-01-20T09:15:00",
        uploadedBy: "Ar. Vikram Deshpande",
        fileName: "Greenfield_Residency_v1.ifc",
        fileSizeBytes: 25794500,
        schemaVersion: "IFC4",
        status: "BIM_SCRUTINY_FAILED",
        checksum: "8a1f33f2b4c590e8a7d65c43d21b4a09e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3",
        summaryNotes: "Initial BIM model submission from Autodesk Revit 2026.",
        violationsCount: 3,
      },
    ],
  },

  // 2. Tamhane Row Houses (Scrutiny Failed)
  "MC/BP/2026/04/0002": {
    applicationId: "MC/BP/2026/04/0002",
    projectName: "Tamhane Row Houses",
    currentVersion: 1,
    status: "BIM_SCRUTINY_FAILED",
    activeFileName: "RowHouse_v1.ifc",
    activeFileSize: "18.2 MB",
    schema: "IFC2X3",
    lastUpdated: "2026-01-18T13:22:00",
    metrics: {
      grossFloorArea: 1240.0,
      groundCoverageArea: 480.0,
      groundCoveragePct: 62.0,
      buildingHeight: 11.4,
      storeysAboveGround: 3,
      basements: 0,
      farAchieved: 1.62,
      farPermissible: 1.5,
      parkingEcsProvided: 6,
      parkingEcsRequired: 8,
      spaceCount: 22,
      wallCount: 96,
      slabCount: 4,
      columnCount: 18,
      doorCount: 24,
      windowCount: 32,
    },
    storeys: [
      { id: "st-g", name: "Ground Floor", elevation: 0.0, height: 3.6, builtUpArea: 480.0, carpetArea: 410.0, spacesCount: 8 },
      { id: "st-1", name: "First Floor", elevation: 3.6, height: 3.2, builtUpArea: 380.0, carpetArea: 325.0, spacesCount: 7 },
      { id: "st-2", name: "Second Floor", elevation: 6.8, height: 3.2, builtUpArea: 380.0, carpetArea: 325.0, spacesCount: 7 },
    ],
    rules: [
      {
        id: "DCR-SB-01",
        category: "Setbacks",
        title: "Front Setback Compliance",
        description: "Minimum clearance between front plot boundary and building line.",
        requiredValue: "4.50 m",
        observedValue: "3.20 m",
        delta: "-1.30 m",
        status: "FAIL",
        severity: "CRITICAL",
        elementName: "IfcWall_Porch_Front",
        elementGuid: "1A2$B$3C4$D5",
        cameraTarget: { x: 0, y: 1.5, z: 6.0 },
        recommendation: "Car porch projection encroaches into mandatory front setback by 1.30m.",
      },
      {
        id: "DCR-BD-03",
        category: "Bulk & Density",
        title: "Floor Area Ratio (FAR / FSI)",
        description: "Achieved FAR exceeds permissible limit for row housing.",
        requiredValue: "1.50",
        observedValue: "1.62",
        delta: "+0.12",
        status: "FAIL",
        severity: "CRITICAL",
        cameraTarget: { x: 0, y: 4.5, z: 0 },
        recommendation: "Reduce built-up area on second floor by 92 m².",
      },
      {
        id: "DCR-BD-02",
        category: "Bulk & Density",
        title: "Ground Coverage",
        description: "Ground coverage exceeds 60% permissible ceiling.",
        requiredValue: "60.00 %",
        observedValue: "62.00 %",
        delta: "+2.00 %",
        status: "FAIL",
        severity: "MAJOR",
        cameraTarget: { x: 0, y: 0.0, z: 0 },
      },
    ],
    versions: [
      {
        version: 1,
        uploadedAt: "2026-01-18T13:20:00",
        uploadedBy: "Ar. Vikram Deshpande",
        fileName: "RowHouse_v1.ifc",
        fileSizeBytes: 19084000,
        schemaVersion: "IFC2X3",
        status: "BIM_SCRUTINY_FAILED",
        checksum: "5b2c44f1e3a681d7c9e54b32a10e7f8d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1",
        summaryNotes: "Initial submission — failed setback and FAR scrutiny.",
        violationsCount: 3,
      },
    ],
  },

  // 3. Greenfield Residency — Apartment (Resolved in v2, Under Zonal Head Review)
  "MC/BP/2026/04/0005": {
    applicationId: "MC/BP/2026/04/0005",
    projectName: "Greenfield Residency — Apartment",
    currentVersion: 2,
    status: "BIM_SCRUTINY_PASSED",
    activeFileName: "Greenfield_Apartment_v2_Compliant.ifc",
    activeFileSize: "25.2 MB",
    schema: "IFC4 (Reference View)",
    lastUpdated: "2026-01-08T12:00:00",
    metrics: {
      grossFloorArea: 1780.0,
      groundCoverageArea: 574.0,
      groundCoveragePct: 57.4,
      buildingHeight: 14.8,
      storeysAboveGround: 4,
      basements: 1,
      farAchieved: 1.42,
      farPermissible: 1.5,
      parkingEcsProvided: 24,
      parkingEcsRequired: 22,
      spaceCount: 38,
      wallCount: 146,
      slabCount: 6,
      columnCount: 28,
      doorCount: 48,
      windowCount: 56,
    },
    storeys: [
      { id: "st-b1", name: "Basement Parking", elevation: -3.2, height: 3.2, builtUpArea: 660.0, carpetArea: 610.0, spacesCount: 24 },
      { id: "st-g", name: "Ground Floor", elevation: 0.0, height: 3.8, builtUpArea: 574.0, carpetArea: 490.0, spacesCount: 8 },
      { id: "st-1", name: "First Floor", elevation: 3.8, height: 3.2, builtUpArea: 402.0, carpetArea: 348.0, spacesCount: 6 },
      { id: "st-2", name: "Second Floor", elevation: 7.0, height: 3.2, builtUpArea: 402.0, carpetArea: 348.0, spacesCount: 6 },
      { id: "st-3", name: "Third Floor", elevation: 10.2, height: 3.2, builtUpArea: 402.0, carpetArea: 348.0, spacesCount: 6 },
      { id: "st-r", name: "Terrace Floor", elevation: 13.4, height: 1.4, builtUpArea: 42.0, carpetArea: 28.0, spacesCount: 2 },
    ],
    rules: [
      {
        id: "DCR-SB-01",
        category: "Setbacks",
        title: "Front Setback Compliance",
        description: "Clearance from front road boundary edge.",
        requiredValue: "6.00 m",
        observedValue: "6.20 m",
        delta: "+0.20 m",
        status: "PASS",
        severity: "CRITICAL",
        elementName: "IfcWall_Exterior_Front_L1",
        elementGuid: "2O2$O$tVn0$xW_0001",
        cameraTarget: { x: 0, y: 1.8, z: 7.5 },
      },
      {
        id: "DCR-SB-02",
        category: "Setbacks",
        title: "Rear Setback Compliance",
        description: "Minimum distance from rear parcel plot boundary line.",
        requiredValue: "4.00 m",
        observedValue: "4.20 m",
        delta: "+0.20 m",
        status: "PASS",
        severity: "MAJOR",
        elementName: "IfcWall_Exterior_Rear_L1",
        elementGuid: "3A1$B$cDe2$zY_0002",
        cameraTarget: { x: 0, y: 1.8, z: -7.5 },
      },
      {
        id: "DCR-SB-03",
        category: "Setbacks",
        title: "Side Setback (East)",
        description: "Minimum lateral side margin clearance.",
        requiredValue: "3.00 m",
        observedValue: "3.15 m",
        delta: "+0.15 m",
        status: "PASS",
        severity: "CRITICAL",
        elementName: "IfcColumn_East_C04",
        elementGuid: "4F3$G$hIj5$uV_0003",
        cameraTarget: { x: 7.2, y: 1.8, z: 0 },
      },
      {
        id: "DCR-BD-01",
        category: "Bulk & Density",
        title: "Maximum Building Height",
        description: "Total structural height within permissible 15m limit.",
        requiredValue: "15.00 m",
        observedValue: "14.80 m",
        delta: "-0.20 m",
        status: "PASS",
        severity: "MAJOR",
        cameraTarget: { x: 0, y: 14.8, z: 0 },
      },
      {
        id: "DCR-BD-02",
        category: "Bulk & Density",
        title: "Ground Coverage",
        description: "Coverage within 60% permissible threshold.",
        requiredValue: "60.00 %",
        observedValue: "57.40 %",
        delta: "-2.60 %",
        status: "PASS",
        severity: "MAJOR",
        cameraTarget: { x: 0, y: 0.5, z: 0 },
      },
      {
        id: "DCR-BD-03",
        category: "Bulk & Density",
        title: "Floor Area Ratio (FAR)",
        description: "Calculated FAR satisfies municipal master plan ceiling.",
        requiredValue: "1.50",
        observedValue: "1.42",
        delta: "-0.08",
        status: "PASS",
        severity: "CRITICAL",
        cameraTarget: { x: 0, y: 6.0, z: 0 },
      },
      {
        id: "DCR-AM-01",
        category: "Amenities",
        title: "Parking Provision (ECS)",
        description: "Basement parking capacity verified with 24 dedicated stalls.",
        requiredValue: "22 ECS",
        observedValue: "24 ECS",
        delta: "+2 ECS",
        status: "PASS",
        severity: "MAJOR",
        cameraTarget: { x: 0, y: -2.5, z: 0 },
      },
      {
        id: "DCR-FS-01",
        category: "Fire & Safety",
        title: "Fire Evacuation Staircase",
        description: "Stair width meets high-occupancy residential norms.",
        requiredValue: "1.50 m",
        observedValue: "1.80 m",
        delta: "+0.30 m",
        status: "PASS",
        severity: "CRITICAL",
        cameraTarget: { x: 2.5, y: 4.5, z: 2.0 },
      },
    ],
    versions: [
      {
        version: 1,
        uploadedAt: "2026-01-05T09:30:00",
        uploadedBy: "Ar. Vikram Deshpande",
        fileName: "Greenfield_Apartment_v1.ifc",
        fileSizeBytes: 24680000,
        schemaVersion: "IFC4",
        status: "BIM_SCRUTINY_FAILED",
        checksum: "aa2319089ef0982341b590e8a7d65c43d21b4a09e8f7a6b5c4d3e2f1a0b9c8d7",
        summaryNotes: "Initial model — Front setback and East side cantilever violation.",
        violationsCount: 2,
      },
      {
        version: 2,
        uploadedAt: "2026-01-08T12:00:00",
        uploadedBy: "Ar. Vikram Deshpande",
        fileName: "Greenfield_Apartment_v2_Compliant.ifc",
        fileSizeBytes: 25210000,
        schemaVersion: "IFC4",
        status: "BIM_SCRUTINY_PASSED",
        checksum: "7c1d32a90b8e7f6c5d4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2",
        summaryNotes: "Revised front structural grid by +1.4m; trimmed east balcony cantilever to clear 3.0m side setback.",
        violationsCount: 0,
        resolvedShortfalls: ["Front Setback corrected to 6.20m", "Side setback expanded to 3.15m"],
      },
    ],
  },
};

export function getBimModelByAppId(applicationId: string): BimModelData | null {
  if (MOCK_BIM_MODELS[applicationId]) {
    return MOCK_BIM_MODELS[applicationId];
  }
  
  // Return a synthesized default model for any other existing application ID
  return {
    applicationId,
    projectName: `Building Permit - ${applicationId}`,
    currentVersion: 1,
    status: "BIM_SCRUTINY_PASSED",
    activeFileName: `${applicationId.replace(/\//g, "_")}_BIM_v1.ifc`,
    activeFileSize: "21.4 MB",
    schema: "IFC4 (Reference View)",
    lastUpdated: new Date().toISOString(),
    metrics: {
      grossFloorArea: 1450.0,
      groundCoverageArea: 510.0,
      groundCoveragePct: 51.0,
      buildingHeight: 12.6,
      storeysAboveGround: 3,
      basements: 1,
      farAchieved: 1.45,
      farPermissible: 1.5,
      parkingEcsProvided: 18,
      parkingEcsRequired: 16,
      spaceCount: 28,
      wallCount: 112,
      slabCount: 5,
      columnCount: 22,
      doorCount: 36,
      windowCount: 44,
    },
    storeys: [
      { id: "st-b", name: "Basement", elevation: -3.0, height: 3.0, builtUpArea: 510.0, carpetArea: 480.0, spacesCount: 18 },
      { id: "st-g", name: "Ground Floor", elevation: 0.0, height: 3.6, builtUpArea: 510.0, carpetArea: 440.0, spacesCount: 8 },
      { id: "st-1", name: "First Floor", elevation: 3.6, height: 3.2, builtUpArea: 470.0, carpetArea: 410.0, spacesCount: 10 },
      { id: "st-2", name: "Second Floor", elevation: 6.8, height: 3.2, builtUpArea: 470.0, carpetArea: 410.0, spacesCount: 10 },
    ],
    rules: [
      {
        id: "DCR-SB-01",
        category: "Setbacks",
        title: "Front Setback Compliance",
        description: "Clearance from front road boundary edge.",
        requiredValue: "6.00 m",
        observedValue: "6.15 m",
        delta: "+0.15 m",
        status: "PASS",
        severity: "CRITICAL",
        cameraTarget: { x: 0, y: 1.8, z: 7.0 },
      },
      {
        id: "DCR-SB-02",
        category: "Setbacks",
        title: "Rear Setback Compliance",
        description: "Clearance from rear boundary line.",
        requiredValue: "4.00 m",
        observedValue: "4.30 m",
        delta: "+0.30 m",
        status: "PASS",
        severity: "MAJOR",
        cameraTarget: { x: 0, y: 1.8, z: -7.0 },
      },
      {
        id: "DCR-BD-01",
        category: "Bulk & Density",
        title: "Maximum Building Height",
        description: "Building height is within allowable limit.",
        requiredValue: "15.00 m",
        observedValue: "12.60 m",
        delta: "-2.40 m",
        status: "PASS",
        severity: "MAJOR",
        cameraTarget: { x: 0, y: 12.6, z: 0 },
      },
      {
        id: "DCR-BD-03",
        category: "Bulk & Density",
        title: "Floor Area Ratio (FAR)",
        description: "FAR complies with master plan regulations.",
        requiredValue: "1.50",
        observedValue: "1.45",
        delta: "-0.05",
        status: "PASS",
        severity: "CRITICAL",
        cameraTarget: { x: 0, y: 6.0, z: 0 },
      },
    ],
    versions: [
      {
        version: 1,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Licensed Architect",
        fileName: `${applicationId.replace(/\//g, "_")}_BIM_v1.ifc`,
        fileSizeBytes: 22440000,
        schemaVersion: "IFC4",
        status: "BIM_SCRUTINY_PASSED",
        checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        summaryNotes: "Initial IFC model passed automated DCR checks.",
        violationsCount: 0,
      },
    ],
  };
}
