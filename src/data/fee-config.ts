import type { FeeComponent, FeeStructure } from "@/types";

// ============================================================
// FEE CONFIGURATION (configurable — not hardcoded business logic)
// Edit these to change fee rules without touching service code.
// ============================================================

export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs-bp-res-2026",
    name: "Building Permission — Residential (2026)",
    applicationType: "BUILDING_PERMISSION",
    description: "Applicable to residential building permission applications.",
    active: true,
    effectiveFrom: "2026-04-01",
  },
  {
    id: "fs-bp-com-2026",
    name: "Building Permission — Commercial (2026)",
    applicationType: "BUILDING_PERMISSION",
    description: "Applicable to commercial building permission applications.",
    active: true,
    effectiveFrom: "2026-04-01",
  },
  {
    id: "fs-layout-2026",
    name: "Layout Approval (2026)",
    applicationType: "LAYOUT_APPROVAL",
    description: "Group housing & layout approval fee structure.",
    active: true,
    effectiveFrom: "2026-04-01",
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
