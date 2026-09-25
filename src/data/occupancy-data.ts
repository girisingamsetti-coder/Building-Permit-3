import type {
  AsBuiltFigures,
  ComparisonRow,
  OccupancyDocument,
  OccupancyPhoto,
  OccupancyPhotoView,
  OccupancyRegisterState,
  OccupancyStatus,
} from "@/lib/occupancy";
import { compareAsBuilt } from "@/lib/occupancy";

export type HistoryEvent = {
  id: string;
  action: string;
  fromStatus?: string;
  toStatus: string;
  actorName: string;
  actorRoleKey?: string;
  stageName?: string;
  remarks?: string;
  occurredAt: string;
};

export type StepOffer = {
  offered: boolean;
  available: boolean;
  reason: string;
};

export type InspectionRecord = {
  id: string;
  round: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  scheduledFor: string;
  inspectorName: string;
  inspectorDesignation: string;
  scheduledByName: string;
  inspectedAt: string | null;
  siteCondition: string;
  actualConstruction: string;
  approvedConstruction: string;
  deviations: string;
  remarks: string;
  photos: OccupancyPhoto[];
  recommendation: "RECOMMENDED" | "SHORTFALL" | "REJECT" | "";
  asBuiltFigures: AsBuiltFigures;
};

export type OccupancyApplicationRecord = {
  id: string;
  occupancyNumber: string;
  applicationId: string;
  applicationNumber: string;
  status: OccupancyStatus;
  state: OccupancyRegisterState;
  round: number;
  currentDesk: string;
  orderNumber: string;
  orderIssuedAt: string;
  commencementNumber: string;
  commencementDate: string;
  completionDate: string;
  completionRemarks: string;
  submittedAt: string;
  submittedByName: string;
  owner: {
    name: string;
    contact: string;
    email: string;
    address: string;
  };
  ltp: {
    name: string;
    licenceNo: string;
    contact: string;
    email: string;
  };
  project: {
    name: string;
    type: string;
    zone: string;
    ward: string;
    surveyNo: string;
    address: string;
    approvedAreaSqm: number;
    completedAreaSqm: number;
  };
  documents: OccupancyDocument[];
  inspections: InspectionRecord[];
  approvedFigures: AsBuiltFigures;
  comparison: ComparisonRow[];
  recommendation?: {
    recommendation: "APPROVE" | "REJECT";
    label: string;
    notes: string;
    reviewedByName: string;
    reviewedAt: string;
  };
  shortfall?: {
    items: string[];
    remarks: string;
    raisedByName: string;
    raisedAt: string;
    response?: string;
    respondedAt?: string;
  };
  decision?: {
    decision: "APPROVED" | "REJECTED";
    remarks: string;
    decidedByName: string;
    decidedAt: string;
  };
  certificate?: {
    certificateNumber: string;
    issuedAt: string;
    issuedByName: string;
    approvedAreaSqm: number;
    completedAreaSqm: number;
    conditions: string[];
    outwardNumber: string;
    verificationCode: string;
  };
  events: HistoryEvent[];
  history: Array<{
    id: string;
    occupancyNumber: string;
    status: string;
    submittedAt: string;
    decidedAt: string | null;
    decisionRemarks: string;
  }>;
};

// ── PHOTO SVG ASSETS ────────────────────────────────────────────────────────
export const PHOTO_SVGS: Record<OccupancyPhotoView, string> = {
  FRONT_ELEVATION: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#bae6fd" />
          <stop offset="100%" stop-color="#e0f2fe" />
        </linearGradient>
        <linearGradient id="bldg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#sky)" />
      <rect y="320" width="600" height="80" fill="#94a3b8" />
      <rect y="330" width="600" height="10" fill="#475569" opacity="0.4" />
      <!-- Building structure G+2 -->
      <rect x="120" y="70" width="360" height="250" fill="url(#bldg)" stroke="#cbd5e1" stroke-width="3" rx="4" />
      <!-- Ground Floor Entrance & Porch -->
      <rect x="140" y="240" width="120" height="80" fill="#334155" />
      <rect x="270" y="260" width="60" height="60" fill="#64748b" rx="2" />
      <!-- Windows Floor 1 -->
      <rect x="140" y="160" width="80" height="55" fill="url(#glass)" rx="3" stroke="#cbd5e1" stroke-width="2" />
      <rect x="260" y="160" width="80" height="55" fill="url(#glass)" rx="3" stroke="#cbd5e1" stroke-width="2" />
      <rect x="380" y="160" width="80" height="55" fill="url(#glass)" rx="3" stroke="#cbd5e1" stroke-width="2" />
      <!-- Balconies Floor 2 -->
      <rect x="140" y="85" width="80" height="55" fill="url(#glass)" rx="3" stroke="#cbd5e1" stroke-width="2" />
      <rect x="260" y="85" width="80" height="55" fill="url(#glass)" rx="3" stroke="#cbd5e1" stroke-width="2" />
      <rect x="380" y="85" width="80" height="55" fill="url(#glass)" rx="3" stroke="#cbd5e1" stroke-width="2" />
      <!-- Parapet & Water tank -->
      <rect x="110" y="60" width="380" height="12" fill="#0284c7" rx="2" />
      <rect x="160" y="35" width="50" height="25" fill="#0369a1" rx="2" />
      <!-- Stamp -->
      <rect x="15" y="15" width="170" height="42" fill="#0f172a" opacity="0.75" rx="4" />
      <text x="25" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">FRONT ELEVATION</text>
      <text x="25" y="47" font-family="sans-serif" font-size="9" fill="#94a3b8">GEO: 18.5204° N, 73.8567° E</text>
    </svg>
  `),
  REAR_ELEVATION: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#e2e8f0" />
      <rect y="310" width="600" height="90" fill="#64748b" />
      <rect x="140" y="80" width="320" height="230" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" rx="4" />
      <!-- Fire Staircase -->
      <path d="M 400 90 L 440 140 L 400 190 L 440 240 L 400 290 L 440 310" stroke="#b91c1c" stroke-width="6" fill="none" stroke-linecap="round" />
      <!-- Ventilation Windows -->
      <rect x="180" y="110" width="40" height="30" fill="#38bdf8" rx="2" />
      <rect x="250" y="110" width="40" height="30" fill="#38bdf8" rx="2" />
      <rect x="180" y="180" width="40" height="30" fill="#38bdf8" rx="2" />
      <rect x="250" y="180" width="40" height="30" fill="#38bdf8" rx="2" />
      <rect x="180" y="250" width="40" height="30" fill="#38bdf8" rx="2" />
      <rect x="250" y="250" width="40" height="30" fill="#38bdf8" rx="2" />
      <!-- Stamp -->
      <rect x="15" y="15" width="170" height="42" fill="#0f172a" opacity="0.75" rx="4" />
      <text x="25" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">REAR ELEVATION</text>
      <text x="25" y="47" font-family="sans-serif" font-size="9" fill="#94a3b8">GEO: 18.5209° N, 73.8569° E</text>
    </svg>
  `),
  SIDE_SETBACK: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#f8fafc" />
      <!-- Building Wall on left -->
      <rect x="0" y="0" width="220" height="400" fill="#cbd5e1" stroke="#94a3b8" stroke-width="4" />
      <line x1="220" y1="0" x2="220" y2="400" stroke="#475569" stroke-width="6" />
      <!-- Compound Wall on right -->
      <rect x="520" y="140" width="80" height="260" fill="#94a3b8" />
      <!-- Paved Passage -->
      <rect x="220" y="220" width="300" height="180" fill="#e2e8f0" />
      <line x1="220" y1="280" x2="520" y2="280" stroke="#cbd5e1" stroke-dasharray="10 10" />
      <line x1="220" y1="340" x2="520" y2="340" stroke="#cbd5e1" stroke-dasharray="10 10" />
      <!-- Dimension line showing 3.2m -->
      <line x1="230" y1="180" x2="510" y2="180" stroke="#0284c7" stroke-width="3" marker-start="url(#dot)" marker-end="url(#dot)" />
      <rect x="330" y="165" width="80" height="30" fill="#0284c7" rx="4" />
      <text x="345" y="185" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">3.20 m</text>
      <!-- Stamp -->
      <rect x="15" y="15" width="170" height="42" fill="#0f172a" opacity="0.75" rx="4" />
      <text x="25" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">SIDE SETBACK</text>
      <text x="25" y="47" font-family="sans-serif" font-size="9" fill="#94a3b8">MIN REQUIRED: 3.0 m</text>
    </svg>
  `),
  PARKING: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#334155" />
      <!-- Stilt Ceiling Beams -->
      <rect x="0" y="0" width="600" height="50" fill="#1e293b" />
      <!-- Stilt Columns -->
      <rect x="70" y="40" width="50" height="360" fill="#475569" stroke="#cbd5e1" stroke-width="2" />
      <rect x="275" y="40" width="50" height="360" fill="#475569" stroke="#cbd5e1" stroke-width="2" />
      <rect x="480" y="40" width="50" height="360" fill="#475569" stroke="#cbd5e1" stroke-width="2" />
      <!-- Floor & Yellow Parking Lines -->
      <rect y="320" width="600" height="80" fill="#1e293b" />
      <rect x="140" y="310" width="110" height="15" fill="#facc15" />
      <rect x="350" y="310" width="110" height="15" fill="#facc15" />
      <!-- Signage -->
      <rect x="150" y="100" width="90" height="40" fill="#0284c7" rx="4" />
      <text x="165" y="125" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">BAY P-01</text>
      <rect x="360" y="100" width="90" height="40" fill="#0284c7" rx="4" />
      <text x="375" y="125" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">BAY P-02</text>
      <!-- Stamp -->
      <rect x="15" y="15" width="170" height="42" fill="#0f172a" opacity="0.75" rx="4" />
      <text x="25" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">PARKING AREA</text>
      <text x="25" y="47" font-family="sans-serif" font-size="9" fill="#94a3b8">PROVISION: 24 ECS</text>
    </svg>
  `),
  INTERIOR: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#f1f5f9" />
      <!-- Perspective Corridor Wall -->
      <polygon points="0,0 200,80 200,320 0,400" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" />
      <polygon points="600,0 400,80 400,320 600,400" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" />
      <!-- End Wall Door -->
      <rect x="250" y="140" width="100" height="180" fill="#94a3b8" rx="2" />
      <rect x="270" y="160" width="60" height="140" fill="#64748b" rx="2" />
      <!-- Ceiling Lights -->
      <ellipse cx="300" cy="50" rx="35" ry="12" fill="#fef08a" opacity="0.8" />
      <ellipse cx="300" cy="50" rx="20" ry="6" fill="#ffffff" />
      <!-- Fire Extinguisher on wall -->
      <rect x="180" y="180" width="14" height="35" fill="#dc2626" rx="2" />
      <!-- Stamp -->
      <rect x="15" y="15" width="170" height="42" fill="#0f172a" opacity="0.75" rx="4" />
      <text x="25" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">INTERIOR LOBBY</text>
      <text x="25" y="47" font-family="sans-serif" font-size="9" fill="#94a3b8">FINISHES &amp; FIRE SAFETY</text>
    </svg>
  `),
  TERRACE: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#93c5fd" />
      <!-- Floor Slab -->
      <rect y="240" width="600" height="160" fill="#cbd5e1" />
      <!-- Waterproofing Screed Tiles -->
      <line x1="0" y1="280" x2="600" y2="280" stroke="#94a3b8" stroke-width="2" />
      <line x1="0" y1="330" x2="600" y2="330" stroke="#94a3b8" stroke-width="2" />
      <!-- Parapet Wall -->
      <rect y="200" width="600" height="45" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
      <rect y="195" width="600" height="8" fill="#64748b" />
      <!-- Solar Panels & Inverter -->
      <rect x="80" y="150" width="180" height="50" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2" transform="skewX(-15)" />
      <!-- Overhead Water Tank -->
      <rect x="380" y="100" width="100" height="100" fill="#0284c7" rx="8" />
      <rect x="360" y="190" width="140" height="15" fill="#334155" />
      <!-- Stamp -->
      <rect x="15" y="15" width="170" height="42" fill="#0f172a" opacity="0.75" rx="4" />
      <text x="25" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">TERRACE &amp; RWH</text>
      <text x="25" y="47" font-family="sans-serif" font-size="9" fill="#94a3b8">WATERPROOFING INSPECTED</text>
    </svg>
  `),
};

// ── DEFAULT FULL SEED DATA ──────────────────────────────────────────────────
export const SEED_OCCUPANCY_RECORDS: OccupancyApplicationRecord[] = [
  // 1. CERTIFICATE_ISSUED — Complete record with 2 rounds of inspection and official certificate
  {
    id: "occ-1",
    occupancyNumber: "OC/2026/04/0012",
    applicationId: "app-12",
    applicationNumber: "MC/BP/2026/04/0012",
    status: "CERTIFICATE_ISSUED",
    state: "CERTIFICATE_ISSUED",
    round: 2,
    currentDesk: "Closed — Certificate Issued",
    orderNumber: "BPO/2026/04/0012",
    orderIssuedAt: "2025-12-29T16:30:00Z",
    commencementNumber: "COMM/2026/0012",
    commencementDate: "2026-01-05T00:00:00Z",
    completionDate: "2026-03-01T00:00:00Z",
    completionRemarks: "Construction is complete as per sanctioned plan. Finishes, drainage, rainwater harvesting and parking marked. Applied for final occupancy certificate.",
    submittedAt: "2026-03-05T10:30:00Z",
    submittedByName: "Ar. Vikram Deshpande (LTP)",
    owner: {
      name: "Smt. Neha Rao",
      contact: "+91 98220 14512",
      email: "neha.rao@email.com",
      address: "Plot 42, Sai Nagar, Kalyani Nagar, Pune — 411006",
    },
    ltp: {
      name: "Ar. Vikram Deshpande",
      licenceNo: "COA/2018/89412",
      contact: "+91 98220 99881",
      email: "vikram.deshpande@architects.in",
    },
    project: {
      name: "Sai Nagar Row Houses — G+2",
      type: "RESIDENTIAL",
      zone: "Zone 2 (East)",
      ward: "Ward 14 (Kalyani Nagar)",
      surveyNo: "S.No. 42/1A, Hissa 3",
      address: "Sai Nagar, Kalyani Nagar, Pune",
      approvedAreaSqm: 1800,
      completedAreaSqm: 1792.5,
    },
    documents: [
      {
        kind: "COMPLETION_LETTER",
        fileObjectId: "doc-12-1",
        fileName: "Architect_Completion_Intimation_Signed.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1450200,
        isDemo: false,
        addedAt: "2026-03-05T10:30:00Z",
        addedByName: "Ar. Vikram Deshpande",
        round: 1,
      },
      {
        kind: "AS_BUILT_DRAWING",
        fileObjectId: "doc-12-2",
        fileName: "As_Built_Architectural_Floorplans_v2.dwg",
        mimeType: "application/acad",
        sizeBytes: 8420100,
        isDemo: false,
        addedAt: "2026-03-12T14:15:00Z",
        addedByName: "Ar. Vikram Deshpande",
        round: 2,
      },
      {
        kind: "STRUCTURAL_STABILITY_CERTIFICATE",
        fileObjectId: "doc-12-3",
        fileName: "Structural_Stability_Certificate_Er_Kulkarni.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2150000,
        isDemo: false,
        addedAt: "2026-03-05T10:30:00Z",
        addedByName: "Ar. Vikram Deshpande",
        round: 1,
      },
      {
        kind: "FIRE_CLEARANCE",
        fileObjectId: "doc-12-4",
        fileName: "Chief_Fire_Officer_Final_NOC.pdf",
        mimeType: "application/pdf",
        sizeBytes: 3204000,
        isDemo: false,
        addedAt: "2026-03-05T10:30:00Z",
        addedByName: "Ar. Vikram Deshpande",
        round: 1,
      },
      {
        kind: "SITE_PHOTOGRAPHS",
        fileObjectId: "doc-12-5",
        fileName: "Site_Photographs_Geotagged_AllViews.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12450000,
        isDemo: false,
        addedAt: "2026-03-12T14:15:00Z",
        addedByName: "Ar. Vikram Deshpande",
        round: 2,
      },
      {
        kind: "OTHER",
        fileObjectId: "doc-12-6",
        fileName: "RWH_And_Sewage_Compliance_Report.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1980000,
        isDemo: false,
        addedAt: "2026-03-05T10:30:00Z",
        addedByName: "Ar. Vikram Deshpande",
        round: 1,
      },
    ],
    approvedFigures: {
      plotAreaSqm: 850.0,
      builtUpAreaSqm: 1800.0,
      coveragePercent: 48.5,
      fsi: 1.45,
      heightM: 12.0,
      floors: 3,
      setbackMinM: 3.0,
      parkingAreaSqm: 380.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: 850.0,
        builtUpAreaSqm: 1800.0,
        coveragePercent: 48.5,
        fsi: 1.45,
        heightM: 12.0,
        floors: 3,
        setbackMinM: 3.0,
        parkingAreaSqm: 380.0,
      },
      {
        plotAreaSqm: 850.0,
        builtUpAreaSqm: 1792.5,
        coveragePercent: 48.2,
        fsi: 1.44,
        heightM: 11.9,
        floors: 3,
        setbackMinM: 3.1,
        parkingAreaSqm: 385.0,
      }
    ),
    inspections: [
      {
        id: "insp-12-1",
        round: 1,
        status: "COMPLETED",
        scheduledFor: "2026-03-08T00:00:00Z",
        inspectorName: "Shri. Suresh Kulkarni",
        inspectorDesignation: "Town Planning Assistant",
        scheduledByName: "Shri. Suresh Kulkarni",
        inspectedAt: "2026-03-09T11:30:00Z",
        siteCondition: "Building construction largely completed. Debris still present in East setback. Staircase railing finishing in progress.",
        actualConstruction: "Ground + 2 floors built. Minor debris on setback. Parking area marked.",
        approvedConstruction: "Ground + 2 floors residential as per BPO/2026/04/0012.",
        deviations: "Debris blocking eastern side setback — clear before final approval.",
        remarks: "Recommended shortfall for clearance of setback passage.",
        recommendation: "SHORTFALL",
        photos: [
          { view: "FRONT_ELEVATION", fileObjectId: null, fileName: "front.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-09T11:45:00Z" },
          { view: "SIDE_SETBACK", fileObjectId: null, fileName: "setback.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-09T11:48:00Z" },
        ],
        asBuiltFigures: {
          plotAreaSqm: 850.0,
          builtUpAreaSqm: 1792.5,
          coveragePercent: 48.2,
          fsi: 1.44,
          heightM: 11.9,
          floors: 3,
          setbackMinM: 2.8,
          parkingAreaSqm: 385.0,
        },
      },
      {
        id: "insp-12-2",
        round: 2,
        status: "COMPLETED",
        scheduledFor: "2026-03-14T00:00:00Z",
        inspectorName: "Shri. Suresh Kulkarni",
        inspectorDesignation: "Town Planning Assistant",
        scheduledByName: "Shri. Suresh Kulkarni",
        inspectedAt: "2026-03-15T15:00:00Z",
        siteCondition: "Site cleared of all debris. Clean approach road, stormwater drains functioning, rainwater harvesting pit operational. 6 trees planted along perimeter.",
        actualConstruction: "Building constructed completely in accordance with the sanctioned drawings. All setbacks open to sky and free of encroachments.",
        approvedConstruction: "Ground + 2 floors as per BPO/2026/04/0012.",
        deviations: "None. Setback cleared and verified at 3.10 m (approved 3.00 m).",
        remarks: "Re-inspection satisfactory. Construction compliant with permissible limits. Recommended for Occupancy Certificate issue.",
        recommendation: "RECOMMENDED",
        photos: [
          { view: "FRONT_ELEVATION", fileObjectId: null, fileName: "front_final.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-15T15:10:00Z" },
          { view: "REAR_ELEVATION", fileObjectId: null, fileName: "rear_final.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-15T15:15:00Z" },
          { view: "SIDE_SETBACK", fileObjectId: null, fileName: "setback_clear.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-15T15:20:00Z" },
          { view: "PARKING", fileObjectId: null, fileName: "parking_bays.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-15T15:25:00Z" },
          { view: "INTERIOR", fileObjectId: null, fileName: "lobby_corridor.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-15T15:30:00Z" },
          { view: "TERRACE", fileObjectId: null, fileName: "terrace_rwh.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-03-15T15:35:00Z" },
        ],
        asBuiltFigures: {
          plotAreaSqm: 850.0,
          builtUpAreaSqm: 1792.5,
          coveragePercent: 48.2,
          fsi: 1.44,
          heightM: 11.9,
          floors: 3,
          setbackMinM: 3.1,
          parkingAreaSqm: 385.0,
        },
      },
    ],
    shortfall: {
      items: ["Clear debris in Eastern side setback corridor to maintain clear 3.0m width"],
      remarks: "Please rectify and upload photographic confirmation.",
      raisedByName: "Shri. Suresh Kulkarni (TPA)",
      raisedAt: "2026-03-09T14:00:00Z",
      response: "Debris has been fully removed. Passage paved and cleaned. Geotagged photos attached for verification.",
      respondedAt: "2026-03-12T14:15:00Z",
    },
    recommendation: {
      recommendation: "APPROVE",
      label: "Recommended for Approval",
      notes: "Scrutiny of as-built parameters against sanctioned BPO shows full compliance. Built-up area (1792.5 sq m) is within sanctioned limit (1800.0 sq m). Setbacks, parking and height are satisfactory. Fire NOC and Structural Stability certificates valid.",
      reviewedByName: "Smt. Meena Kulkarni (ZDD)",
      reviewedAt: "2026-03-18T11:00:00Z",
    },
    decision: {
      decision: "APPROVED",
      remarks: "Occupancy Certificate granted subject to standard maintenance conditions. Sent to Outward for dispatch.",
      decidedByName: "Dr. Pratap Reddy (Commissioner)",
      decidedAt: "2026-03-20T16:00:00Z",
    },
    certificate: {
      certificateNumber: "OCC-CERT-2026-012",
      issuedAt: "2026-03-22T10:00:00Z",
      issuedByName: "Dr. Pratap Reddy (Commissioner)",
      approvedAreaSqm: 1800.0,
      completedAreaSqm: 1792.5,
      conditions: [
        "The building shall be used exclusively for RESIDENTIAL purposes for which permission was sanctioned. Any change of use without prior written consent will invalidate this certificate.",
        "The designated parking area of 385 sq m (24 ECS) shall remain un-encumbered and strictly used for vehicle parking only. No conversion or enclosure permitted.",
        "The peripheral setbacks (Front: 6.0m, Rear: 4.1m, Sides: 3.1m) shall be maintained permanently open to sky without any cantilever or temporary construction.",
        "Rainwater harvesting pits and the roof runoff recharge system shall be maintained in clean operating condition before each monsoon season.",
        "No alteration, addition, structural modification or vertical extension shall be undertaken without obtaining prior sanctioned plans from the authority.",
        "This certificate is liable to be cancelled or revoked if obtained through suppression of material facts, misrepresentation, or violation of municipal bylaws.",
      ],
      outwardNumber: "OUT/2026/03/0488",
      verificationCode: "OCC-9821-X4K9",
    },
    events: [
      { id: "ev-1", action: "CERTIFICATE_ISSUED", fromStatus: "APPROVED", toStatus: "CERTIFICATE_ISSUED", actorName: "Dr. Pratap Reddy", actorRoleKey: "COMMISSIONER", stageName: "Dispatch", remarks: "Occupancy certificate generated and outwarded as OUT/2026/03/0488.", occurredAt: "2026-03-22T10:00:00Z" },
      { id: "ev-2", action: "APPROVED", fromStatus: "RECOMMENDED", toStatus: "APPROVED", actorName: "Dr. Pratap Reddy", actorRoleKey: "COMMISSIONER", stageName: "Decision Desk", remarks: "Occupancy approved after final scrutiny.", occurredAt: "2026-03-20T16:00:00Z" },
      { id: "ev-3", action: "RECOMMENDED", fromStatus: "INSPECTION_COMPLETED", toStatus: "RECOMMENDED", actorName: "Smt. Meena Kulkarni", actorRoleKey: "ZDD", stageName: "Technical Review", remarks: "As-built drawings verified. Recommended for approval.", occurredAt: "2026-03-18T11:00:00Z" },
      { id: "ev-4", action: "INSPECTED", fromStatus: "INSPECTION_PENDING", toStatus: "INSPECTION_COMPLETED", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Round 2 inspection completed. Site cleared and compliant.", occurredAt: "2026-03-15T15:00:00Z" },
      { id: "ev-5", action: "INSPECTION_SCHEDULED", fromStatus: "SUBMITTED", toStatus: "INSPECTION_PENDING", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Inspection Scheduling", remarks: "Re-inspection booked for 15 March.", occurredAt: "2026-03-13T10:00:00Z" },
      { id: "ev-6", action: "SHORTFALL_ANSWERED", fromStatus: "SHORTFALL", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Shortfall compliance uploaded with site photos.", occurredAt: "2026-03-12T14:15:00Z" },
      { id: "ev-7", action: "SHORTFALL_RAISED", fromStatus: "INSPECTION_COMPLETED", toStatus: "SHORTFALL", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Shortfall notice issued for setback obstruction.", occurredAt: "2026-03-09T14:00:00Z" },
      { id: "ev-8", action: "INSPECTED", fromStatus: "INSPECTION_PENDING", toStatus: "INSPECTION_COMPLETED", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Round 1 inspection conducted.", occurredAt: "2026-03-09T11:30:00Z" },
      { id: "ev-9", action: "INSPECTION_SCHEDULED", fromStatus: "SUBMITTED", toStatus: "INSPECTION_PENDING", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Inspection Scheduling", remarks: "Inspection scheduled for 09 March.", occurredAt: "2026-03-06T12:00:00Z" },
      { id: "ev-10", action: "SUBMITTED", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Completion intimated and occupancy application filed.", occurredAt: "2026-03-05T10:30:00Z" },
    ],
    history: [],
  },

  // 2. RECOMMENDED — Ready for Commissioner decision
  {
    id: "occ-2",
    occupancyNumber: "OC/2026/04/0011",
    applicationId: "app-11",
    applicationNumber: "MC/BP/2026/04/0011",
    status: "RECOMMENDED",
    state: "RECOMMENDED",
    round: 1,
    currentDesk: "Commissioner Review / Decision",
    orderNumber: "BPO/2026/04/0011",
    orderIssuedAt: "2025-12-30T10:00:00Z",
    commencementNumber: "COMM/2026/0011",
    commencementDate: "2026-01-08T00:00:00Z",
    completionDate: "2026-02-15T00:00:00Z",
    completionRemarks: "Commercial complex complete with basement parking and DG sets. Fire clearance obtained.",
    submittedAt: "2026-02-20T11:00:00Z",
    submittedByName: "Ar. Vikram Deshpande (LTP)",
    owner: {
      name: "Shri. Amit Verma",
      contact: "+91 98220 14511",
      email: "amit.verma@email.com",
      address: "Commercial Plot 11, Central Avenue, Aundh, Pune — 411007",
    },
    ltp: {
      name: "Ar. Vikram Deshpande",
      licenceNo: "COA/2018/89412",
      contact: "+91 98220 99881",
      email: "vikram.deshpande@architects.in",
    },
    project: {
      name: "Metro Business Centre",
      type: "COMMERCIAL",
      zone: "Zone 1 (Central)",
      ward: "Ward 07 (Aundh)",
      surveyNo: "S.No. 108/2B",
      address: "Aundh, Pune",
      approvedAreaSqm: 11200.0,
      completedAreaSqm: 11180.0,
    },
    documents: [
      { kind: "COMPLETION_LETTER", fileObjectId: "doc-11-1", fileName: "Completion_Intimation_Letter.pdf", mimeType: "application/pdf", sizeBytes: 1540000, isDemo: false, addedAt: "2026-02-20T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "AS_BUILT_DRAWING", fileObjectId: "doc-11-2", fileName: "Metro_Business_Centre_AsBuilt.dwg", mimeType: "application/acad", sizeBytes: 14200000, isDemo: false, addedAt: "2026-02-20T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "STRUCTURAL_STABILITY_CERTIFICATE", fileObjectId: "doc-11-3", fileName: "Structural_Report_STP_Lift.pdf", mimeType: "application/pdf", sizeBytes: 3100000, isDemo: false, addedAt: "2026-02-20T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "FIRE_CLEARANCE", fileObjectId: "doc-11-4", fileName: "Fire_Dept_Final_No_Objection.pdf", mimeType: "application/pdf", sizeBytes: 4200000, isDemo: false, addedAt: "2026-02-20T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "SITE_PHOTOGRAPHS", fileObjectId: "doc-11-5", fileName: "Site_Photographs_Inspection.pdf", mimeType: "application/pdf", sizeBytes: 15400000, isDemo: false, addedAt: "2026-02-20T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
    ],
    approvedFigures: {
      plotAreaSqm: 4200.0,
      builtUpAreaSqm: 11200.0,
      coveragePercent: 42.0,
      fsi: 2.66,
      heightM: 28.5,
      floors: 7,
      setbackMinM: 6.0,
      parkingAreaSqm: 2400.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: 4200.0,
        builtUpAreaSqm: 11200.0,
        coveragePercent: 42.0,
        fsi: 2.66,
        heightM: 28.5,
        floors: 7,
        setbackMinM: 6.0,
        parkingAreaSqm: 2400.0,
      },
      {
        plotAreaSqm: 4200.0,
        builtUpAreaSqm: 11180.0,
        coveragePercent: 41.9,
        fsi: 2.65,
        heightM: 28.4,
        floors: 7,
        setbackMinM: 6.05,
        parkingAreaSqm: 2420.0,
      }
    ),
    inspections: [
      {
        id: "insp-11-1",
        round: 1,
        status: "COMPLETED",
        scheduledFor: "2026-02-24T00:00:00Z",
        inspectorName: "Smt. Anita Sharma",
        inspectorDesignation: "Town Planning Assistant",
        scheduledByName: "Smt. Anita Sharma",
        inspectedAt: "2026-02-25T14:00:00Z",
        siteCondition: "Commercial premises completely finished. Multi-level basement parking operational with sensor lighting. Transformer and generator bays enclosed.",
        actualConstruction: "7-floor commercial building compliant with architectural drawings. High-speed elevators commissioned and certified.",
        approvedConstruction: "Ground + 6 floors commercial as per BPO/2026/04/0011.",
        deviations: "None. All parameters within statutory 2% tolerance.",
        remarks: "Inspection completed satisfactorily. Recommended for approval.",
        recommendation: "RECOMMENDED",
        photos: [
          { view: "FRONT_ELEVATION", fileObjectId: null, fileName: "front.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-02-25T14:10:00Z" },
          { view: "PARKING", fileObjectId: null, fileName: "parking.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-02-25T14:20:00Z" },
          { view: "INTERIOR", fileObjectId: null, fileName: "interior.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-02-25T14:30:00Z" },
        ],
        asBuiltFigures: {
          plotAreaSqm: 4200.0,
          builtUpAreaSqm: 11180.0,
          coveragePercent: 41.9,
          fsi: 2.65,
          heightM: 28.4,
          floors: 7,
          setbackMinM: 6.05,
          parkingAreaSqm: 2420.0,
        },
      },
    ],
    recommendation: {
      recommendation: "APPROVE",
      label: "Recommended for Approval",
      notes: "Commercial development inspected and found fully compliant. Fire safety, lifts, and sewage treatment plant certificates verified. Forwarded to Commissioner for approval.",
      reviewedByName: "Smt. Lakshmi Menon (Addl. Commissioner)",
      reviewedAt: "2026-03-01T15:00:00Z",
    },
    events: [
      { id: "ev-21", action: "RECOMMENDED", fromStatus: "INSPECTION_COMPLETED", toStatus: "RECOMMENDED", actorName: "Smt. Lakshmi Menon", actorRoleKey: "ADDITIONAL_COMMISSIONER", stageName: "Review", remarks: "Recommended for approval.", occurredAt: "2026-03-01T15:00:00Z" },
      { id: "ev-22", action: "INSPECTED", fromStatus: "INSPECTION_PENDING", toStatus: "INSPECTION_COMPLETED", actorName: "Smt. Anita Sharma", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Site inspection completed.", occurredAt: "2026-02-25T14:00:00Z" },
      { id: "ev-23", action: "INSPECTION_SCHEDULED", fromStatus: "SUBMITTED", toStatus: "INSPECTION_PENDING", actorName: "Smt. Anita Sharma", actorRoleKey: "TPA", stageName: "Inspection Scheduling", remarks: "Inspection scheduled.", occurredAt: "2026-02-22T09:30:00Z" },
      { id: "ev-24", action: "SUBMITTED", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Applied for commercial occupancy.", occurredAt: "2026-02-20T11:00:00Z" },
    ],
    history: [],
  },

  // 3. SHORTFALL — Active shortfall awaiting LTP rectification
  {
    id: "occ-3",
    occupancyNumber: "OC/2026/04/0005",
    applicationId: "app-5",
    applicationNumber: "MC/BP/2026/04/0005",
    status: "SHORTFALL",
    state: "SHORTFALL",
    round: 1,
    currentDesk: "Applicant / LTP Action",
    orderNumber: "BPO/2026/04/0005",
    orderIssuedAt: "2026-01-09T16:00:00Z",
    commencementNumber: "COMM/2026/0005",
    commencementDate: "2026-01-15T00:00:00Z",
    completionDate: "2026-02-01T00:00:00Z",
    completionRemarks: "Apartment building completion reported.",
    submittedAt: "2026-02-05T14:00:00Z",
    submittedByName: "Ar. Vikram Deshpande (LTP)",
    owner: {
      name: "Shri. Nikhil Patil",
      contact: "+91 98220 14505",
      email: "nikhil.patil@email.com",
      address: "Plot 18, Baner Road, Pune — 411045",
    },
    ltp: {
      name: "Ar. Vikram Deshpande",
      licenceNo: "COA/2018/89412",
      contact: "+91 98220 99881",
      email: "vikram.deshpande@architects.in",
    },
    project: {
      name: "Greenfield Residency — Apartment",
      type: "RESIDENTIAL",
      zone: "Zone 3 (West)",
      ward: "Ward 22 (Baner)",
      surveyNo: "S.No. 64/2",
      address: "Baner, Pune",
      approvedAreaSqm: 1780.0,
      completedAreaSqm: 1845.0,
    },
    documents: [
      { kind: "COMPLETION_LETTER", fileObjectId: "doc-5-1", fileName: "Completion_Notice.pdf", mimeType: "application/pdf", sizeBytes: 1200000, isDemo: false, addedAt: "2026-02-05T14:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "AS_BUILT_DRAWING", fileObjectId: "doc-5-2", fileName: "Greenfield_AsBuilt_v1.dwg", mimeType: "application/acad", sizeBytes: 6500000, isDemo: false, addedAt: "2026-02-05T14:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
    ],
    approvedFigures: {
      plotAreaSqm: 900.0,
      builtUpAreaSqm: 1780.0,
      coveragePercent: 52.0,
      fsi: 1.97,
      heightM: 14.5,
      floors: 4,
      setbackMinM: 3.0,
      parkingAreaSqm: 320.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: 900.0,
        builtUpAreaSqm: 1780.0,
        coveragePercent: 52.0,
        fsi: 1.97,
        heightM: 14.5,
        floors: 4,
        setbackMinM: 3.0,
        parkingAreaSqm: 320.0,
      },
      {
        plotAreaSqm: 900.0,
        builtUpAreaSqm: 1845.0,
        coveragePercent: 55.4,
        fsi: 2.05,
        heightM: 14.6,
        floors: 4,
        setbackMinM: 2.4,
        parkingAreaSqm: 320.0,
      }
    ),
    inspections: [
      {
        id: "insp-5-1",
        round: 1,
        status: "COMPLETED",
        scheduledFor: "2026-02-10T00:00:00Z",
        inspectorName: "Shri. Rahul Gupta",
        inspectorDesignation: "Town Planning Assistant",
        scheduledByName: "Shri. Rahul Gupta",
        inspectedAt: "2026-02-12T11:00:00Z",
        siteCondition: "Building completed. A masonry utility store room has been constructed in the rear setback.",
        actualConstruction: "Rear setback partly covered by a utility shed measuring 3.5m x 2.2m. Setback reduced to 2.4m.",
        approvedConstruction: "Ground + 3 floors residential as per BPO/2026/04/0005.",
        deviations: "1. Rear setback encroached by utility room (2.4m observed against 3.0m sanctioned).\n2. Built-up area exceeds sanctioned limit by 65 sq m (+3.6%).",
        remarks: "Shortfall raised. Demolish unauthorized utility shed or apply for compounding regularisation.",
        recommendation: "SHORTFALL",
        photos: [
          { view: "FRONT_ELEVATION", fileObjectId: null, fileName: "front.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-02-12T11:10:00Z" },
          { view: "SIDE_SETBACK", fileObjectId: null, fileName: "setback_shed.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-02-12T11:15:00Z" },
        ],
        asBuiltFigures: {
          plotAreaSqm: 900.0,
          builtUpAreaSqm: 1845.0,
          coveragePercent: 55.4,
          fsi: 2.05,
          heightM: 14.6,
          floors: 4,
          setbackMinM: 2.4,
          parkingAreaSqm: 320.0,
        },
      },
    ],
    shortfall: {
      items: [
        "Rear setback encroached by unauthorized utility shed (observed 2.4m vs approved 3.0m). Remove structure to restore clear setback.",
        "Built-up area (1845 sq m) exceeds sanctioned area (1780 sq m) by 65 sq m. Rectify or submit revised compounding plan.",
      ],
      remarks: "The application is returned to applicant. Re-inspection will be conducted upon compliance.",
      raisedByName: "Shri. Rahul Gupta (TPA)",
      raisedAt: "2026-02-13T10:00:00Z",
    },
    events: [
      { id: "ev-31", action: "SHORTFALL_RAISED", fromStatus: "INSPECTION_COMPLETED", toStatus: "SHORTFALL", actorName: "Shri. Rahul Gupta", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Shortfall notice issued for setback encroachment.", occurredAt: "2026-02-13T10:00:00Z" },
      { id: "ev-32", action: "INSPECTED", fromStatus: "INSPECTION_PENDING", toStatus: "INSPECTION_COMPLETED", actorName: "Shri. Rahul Gupta", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Inspection conducted.", occurredAt: "2026-02-12T11:00:00Z" },
      { id: "ev-33", action: "INSPECTION_SCHEDULED", fromStatus: "SUBMITTED", toStatus: "INSPECTION_PENDING", actorName: "Shri. Rahul Gupta", actorRoleKey: "TPA", stageName: "Inspection Scheduling", remarks: "Inspection booked.", occurredAt: "2026-02-08T10:00:00Z" },
      { id: "ev-34", action: "SUBMITTED", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Occupancy submitted.", occurredAt: "2026-02-05T14:00:00Z" },
    ],
    history: [],
  },

  // 4. INSPECTION_PENDING
  {
    id: "occ-4",
    occupancyNumber: "OC/2026/04/0007",
    applicationId: "app-7",
    applicationNumber: "MC/BP/2026/04/0007",
    status: "INSPECTION_PENDING",
    state: "INSPECTION_PENDING",
    round: 1,
    currentDesk: "TPA Field Inspection",
    orderNumber: "BPO/2026/04/0007",
    orderIssuedAt: "2026-01-08T10:00:00Z",
    commencementNumber: "COMM/2026/0007",
    commencementDate: "2026-01-12T00:00:00Z",
    completionDate: "2026-03-20T00:00:00Z",
    completionRemarks: "Group housing development completed. Final inspection requested.",
    submittedAt: "2026-03-21T10:00:00Z",
    submittedByName: "Ar. Vikram Deshpande (LTP)",
    owner: {
      name: "Shri. Ramesh Iyer",
      contact: "+91 98220 14507",
      email: "ramesh.iyer@email.com",
      address: "Hillview Heights, Bavdhan, Pune — 411021",
    },
    ltp: {
      name: "Ar. Vikram Deshpande",
      licenceNo: "COA/2018/89412",
      contact: "+91 98220 99881",
      email: "vikram.deshpande@architects.in",
    },
    project: {
      name: "Hillview Heights — Group Housing",
      type: "RESIDENTIAL",
      zone: "Zone 3 (West)",
      ward: "Ward 25 (Bavdhan)",
      surveyNo: "S.No. 89/1",
      address: "Bavdhan, Pune",
      approvedAreaSqm: 12200.0,
      completedAreaSqm: 12200.0,
    },
    documents: [
      { kind: "COMPLETION_LETTER", fileObjectId: "doc-7-1", fileName: "Completion_Intimation_Letter.pdf", mimeType: "application/pdf", sizeBytes: 1300000, isDemo: false, addedAt: "2026-03-21T10:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "AS_BUILT_DRAWING", fileObjectId: "doc-7-2", fileName: "Hillview_AsBuilt_Set.dwg", mimeType: "application/acad", sizeBytes: 16500000, isDemo: false, addedAt: "2026-03-21T10:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "STRUCTURAL_STABILITY_CERTIFICATE", fileObjectId: "doc-7-3", fileName: "Structural_Audit_Report.pdf", mimeType: "application/pdf", sizeBytes: 2800000, isDemo: false, addedAt: "2026-03-21T10:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
    ],
    approvedFigures: {
      plotAreaSqm: 5600.0,
      builtUpAreaSqm: 12200.0,
      coveragePercent: 44.0,
      fsi: 2.18,
      heightM: 32.0,
      floors: 9,
      setbackMinM: 6.0,
      parkingAreaSqm: 2600.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: 5600.0,
        builtUpAreaSqm: 12200.0,
        coveragePercent: 44.0,
        fsi: 2.18,
        heightM: 32.0,
        floors: 9,
        setbackMinM: 6.0,
        parkingAreaSqm: 2600.0,
      },
      {}
    ),
    inspections: [
      {
        id: "insp-7-1",
        round: 1,
        status: "SCHEDULED",
        scheduledFor: "2026-03-28T00:00:00Z",
        inspectorName: "Shri. Suresh Kulkarni",
        inspectorDesignation: "Town Planning Assistant",
        scheduledByName: "Shri. Suresh Kulkarni",
        inspectedAt: null,
        siteCondition: "Awaiting inspection",
        actualConstruction: "Pending field measurement",
        approvedConstruction: "9-floor residential group housing",
        deviations: "",
        remarks: "Inspection scheduled for 28 March 2026 at 11:00 AM.",
        recommendation: "",
        photos: [],
        asBuiltFigures: {},
      },
    ],
    events: [
      { id: "ev-41", action: "INSPECTION_SCHEDULED", fromStatus: "SUBMITTED", toStatus: "INSPECTION_PENDING", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Inspection Scheduling", remarks: "Final inspection booked.", occurredAt: "2026-03-23T11:00:00Z" },
      { id: "ev-42", action: "SUBMITTED", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Occupancy submitted.", occurredAt: "2026-03-21T10:00:00Z" },
    ],
    history: [],
  },

  // 5. SUBMITTED — Just intimating completion
  {
    id: "occ-5",
    occupancyNumber: "OC/2026/04/0006",
    applicationId: "app-6",
    applicationNumber: "MC/BP/2026/04/0006",
    status: "SUBMITTED",
    state: "SUBMITTED",
    round: 1,
    currentDesk: "TPA Inspection Scheduling",
    orderNumber: "BPO/2026/04/0006",
    orderIssuedAt: "2026-01-08T10:00:00Z",
    commencementNumber: "COMM/2026/0006",
    commencementDate: "2026-01-14T00:00:00Z",
    completionDate: "2026-03-24T00:00:00Z",
    completionRemarks: "Commercial building construction completed. Ready for municipal inspection.",
    submittedAt: "2026-03-25T09:30:00Z",
    submittedByName: "Ar. Vikram Deshpande (LTP)",
    owner: {
      name: "Smt. Meena Joshi",
      contact: "+91 98220 14506",
      email: "meena.joshi@email.com",
      address: "Crescent Plaza, Aundh, Pune — 411007",
    },
    ltp: {
      name: "Ar. Vikram Deshpande",
      licenceNo: "COA/2018/89412",
      contact: "+91 98220 99881",
      email: "vikram.deshpande@architects.in",
    },
    project: {
      name: "Crescent Plaza — Commercial",
      type: "COMMERCIAL",
      zone: "Zone 1 (Central)",
      ward: "Ward 08 (Aundh)",
      surveyNo: "S.No. 54/3",
      address: "Aundh, Pune",
      approvedAreaSqm: 6400.0,
      completedAreaSqm: 6390.0,
    },
    documents: [
      { kind: "COMPLETION_LETTER", fileObjectId: "doc-6-1", fileName: "Completion_Letter_Crescent.pdf", mimeType: "application/pdf", sizeBytes: 1100000, isDemo: false, addedAt: "2026-03-25T09:30:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "AS_BUILT_DRAWING", fileObjectId: "doc-6-2", fileName: "Crescent_Plaza_AsBuilt.dwg", mimeType: "application/acad", sizeBytes: 9800000, isDemo: false, addedAt: "2026-03-25T09:30:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "STRUCTURAL_STABILITY_CERTIFICATE", fileObjectId: "doc-6-3", fileName: "Structural_Stability.pdf", mimeType: "application/pdf", sizeBytes: 2100000, isDemo: false, addedAt: "2026-03-25T09:30:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
    ],
    approvedFigures: {
      plotAreaSqm: 2800.0,
      builtUpAreaSqm: 6400.0,
      coveragePercent: 45.0,
      fsi: 2.28,
      heightM: 22.5,
      floors: 5,
      setbackMinM: 4.5,
      parkingAreaSqm: 1450.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: 2800.0,
        builtUpAreaSqm: 6400.0,
        coveragePercent: 45.0,
        fsi: 2.28,
        heightM: 22.5,
        floors: 5,
        setbackMinM: 4.5,
        parkingAreaSqm: 1450.0,
      },
      {}
    ),
    inspections: [],
    events: [
      { id: "ev-51", action: "SUBMITTED", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Occupancy submitted.", occurredAt: "2026-03-25T09:30:00Z" },
    ],
    history: [],
  },

  // 6. REJECTED — Substantial non-rectifiable deviations
  {
    id: "occ-6",
    occupancyNumber: "OC/2026/04/0010",
    applicationId: "app-10",
    applicationNumber: "MC/BP/2026/04/0010",
    status: "REJECTED",
    state: "REJECTED",
    round: 1,
    currentDesk: "Closed — Rejected",
    orderNumber: "BPO/2026/04/0010",
    orderIssuedAt: "2026-01-03T10:00:00Z",
    commencementNumber: "COMM/2026/0010",
    commencementDate: "2026-01-06T00:00:00Z",
    completionDate: "2026-01-20T00:00:00Z",
    completionRemarks: "Occupancy certificate application submitted.",
    submittedAt: "2026-01-25T11:00:00Z",
    submittedByName: "Ar. Vikram Deshpande (LTP)",
    owner: {
      name: "Smt. Kavita Sharma",
      contact: "+91 98220 14510",
      email: "kavita.sharma@email.com",
      address: "Plot 99, Baner, Pune — 411045",
    },
    ltp: {
      name: "Ar. Vikram Deshpande",
      licenceNo: "COA/2018/89412",
      contact: "+91 98220 99881",
      email: "vikram.deshpande@architects.in",
    },
    project: {
      name: "Silver Oak Residency",
      type: "RESIDENTIAL",
      zone: "Zone 2 (East)",
      ward: "Ward 19",
      surveyNo: "S.No. 33/1",
      address: "Baner, Pune",
      approvedAreaSqm: 4500.0,
      completedAreaSqm: 5120.0,
    },
    documents: [
      { kind: "COMPLETION_LETTER", fileObjectId: "doc-10-1", fileName: "Completion_Report.pdf", mimeType: "application/pdf", sizeBytes: 1100000, isDemo: false, addedAt: "2026-01-25T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
      { kind: "AS_BUILT_DRAWING", fileObjectId: "doc-10-2", fileName: "SilverOak_AsBuilt.dwg", mimeType: "application/acad", sizeBytes: 7400000, isDemo: false, addedAt: "2026-01-25T11:00:00Z", addedByName: "Ar. Vikram Deshpande", round: 1 },
    ],
    approvedFigures: {
      plotAreaSqm: 2100.0,
      builtUpAreaSqm: 4500.0,
      coveragePercent: 50.0,
      fsi: 2.14,
      heightM: 18.0,
      floors: 5,
      setbackMinM: 4.5,
      parkingAreaSqm: 980.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: 2100.0,
        builtUpAreaSqm: 4500.0,
        coveragePercent: 50.0,
        fsi: 2.14,
        heightM: 18.0,
        floors: 5,
        setbackMinM: 4.5,
        parkingAreaSqm: 980.0,
      },
      {
        plotAreaSqm: 2100.0,
        builtUpAreaSqm: 5120.0,
        coveragePercent: 58.2,
        fsi: 2.44,
        heightM: 21.6,
        floors: 6,
        setbackMinM: 3.1,
        parkingAreaSqm: 720.0,
      }
    ),
    inspections: [
      {
        id: "insp-10-1",
        round: 1,
        status: "COMPLETED",
        scheduledFor: "2026-01-27T00:00:00Z",
        inspectorName: "Shri. Suresh Kulkarni",
        inspectorDesignation: "Town Planning Assistant",
        scheduledByName: "Shri. Suresh Kulkarni",
        inspectedAt: "2026-01-28T10:00:00Z",
        siteCondition: "Major deviations observed. 6th floor has been fully constructed without sanction.",
        actualConstruction: "G+5 floors constructed instead of sanctioned G+4. Excess built-up area of 620 sq m (+13.8%). Parking converted into commercial storage.",
        approvedConstruction: "Ground + 4 floors residential as per BPO/2026/04/0010.",
        deviations: "1. Additional unauthorized floor (6th floor constructed).\n2. Built-up area exceeds by 620 sq m (+13.8%).\n3. Parking deficient by 260 sq m.\n4. Setbacks violated on three sides.",
        remarks: "Critical non-compliance. Cannot be regularized. Recommendation for rejection and initiation of Section 53 notice.",
        recommendation: "REJECT",
        photos: [
          { view: "FRONT_ELEVATION", fileObjectId: null, fileName: "front.png", mimeType: "image/png", isDemo: true, capturedAt: "2026-01-28T10:15:00Z" },
        ],
        asBuiltFigures: {
          plotAreaSqm: 2100.0,
          builtUpAreaSqm: 5120.0,
          coveragePercent: 58.2,
          fsi: 2.44,
          heightM: 21.6,
          floors: 6,
          setbackMinM: 3.1,
          parkingAreaSqm: 720.0,
        },
      },
    ],
    decision: {
      decision: "REJECTED",
      remarks: "Occupancy application rejected due to unauthorized extra floor (G+5 vs sanctioned G+4) and 620 sq m built-up area deviation. Enforcement action recommended.",
      decidedByName: "Dr. Pratap Reddy (Commissioner)",
      decidedAt: "2026-02-05T15:00:00Z",
    },
    events: [
      { id: "ev-61", action: "REJECTED", fromStatus: "INSPECTION_COMPLETED", toStatus: "REJECTED", actorName: "Dr. Pratap Reddy", actorRoleKey: "COMMISSIONER", stageName: "Decision Desk", remarks: "Occupancy rejected due to major violations.", occurredAt: "2026-02-05T15:00:00Z" },
      { id: "ev-62", action: "INSPECTED", fromStatus: "INSPECTION_PENDING", toStatus: "INSPECTION_COMPLETED", actorName: "Shri. Suresh Kulkarni", actorRoleKey: "TPA", stageName: "Field Inspection", remarks: "Inspection completed — critical deviations found.", occurredAt: "2026-01-28T10:00:00Z" },
      { id: "ev-63", action: "SUBMITTED", toStatus: "SUBMITTED", actorName: "Ar. Vikram Deshpande", actorRoleKey: "LTP", stageName: "Applicant", remarks: "Occupancy applied.", occurredAt: "2026-01-25T11:00:00Z" },
    ],
    history: [],
  },
];

// In-memory store for reactive updates during demonstration
let recordsCache: OccupancyApplicationRecord[] = [...SEED_OCCUPANCY_RECORDS];

export function getOccupancyRecords(): OccupancyApplicationRecord[] {
  return recordsCache;
}

export function getOccupancyRecordById(id: string): OccupancyApplicationRecord | undefined {
  return recordsCache.find((r) => r.id === id || r.applicationId === id || r.occupancyNumber === id || r.applicationNumber === id);
}

export function updateOccupancyRecord(
  id: string,
  updater: (prev: OccupancyApplicationRecord) => OccupancyApplicationRecord
): OccupancyApplicationRecord | undefined {
  const idx = recordsCache.findIndex((r) => r.id === id || r.applicationId === id || r.occupancyNumber === id);
  if (idx < 0) return undefined;
  const updated = updater(recordsCache[idx]);
  recordsCache = [...recordsCache.slice(0, idx), updated, ...recordsCache.slice(idx + 1)];
  return updated;
}
