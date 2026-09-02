import type { FeeComponent, FeeStructure } from "@/types";

// ============================================================
// FEE CONFIGURATION (configurable — not hardcoded business logic)
// Edit these to change fee rules without touching service code.
//
// TAX MODEL (configurable per fee structure):
//   taxApplicable: true/false
//   taxType: "CGST_SGST" | "IGST" | "ZERO_TAX"
//
// DEMO configuration (intra-state Andhra Pradesh scenario):
//   CGST 9% + AP SGST 9% = 18% combined GST
//
// IMPORTANT: This is a DEMO taxable scenario, NOT a universal legal
// statement. Government building permit fees may or may not attract
// GST depending on the final client/legal configuration. The admin
// can set taxApplicable=false to model tax-exempt fees.
// ============================================================

// Demo tax config: intra-state AP, CGST 9% + SGST 9%
const DEMO_TAX_CGST_SGST = {
  taxApplicable: true,
  taxType: "CGST_SGST" as const,
  cgstRate: 9,
  sgstRate: 9,
  label: "CGST 9% + AP SGST 9%",
};

// Demo tax config: interstate, IGST 18%
const DEMO_TAX_IGST = {
  taxApplicable: true,
  taxType: "IGST" as const,
  igstRate: 18,
  label: "IGST 18%",
};

// Tax-exempt config (e.g. for fee categories that do not attract GST)
const DEMO_TAX_NOT_APPLICABLE = {
  taxApplicable: false,
  taxType: "ZERO_TAX" as const,
  label: "Tax Not Applicable",
};

export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs-bp-res-2026",
    name: "Building Permission — Residential (2026)",
    applicationType: "BUILDING_PERMISSION",
    propertyType: "RESIDENTIAL",
    description: "Applicable to residential building permission applications.",
    active: true,
    effectiveFrom: "2026-04-01",
    version: "2026 v1",
    // Demo: intra-state AP taxable scenario
    taxConfig: DEMO_TAX_CGST_SGST,
  },
  {
    id: "fs-bp-com-2026",
    name: "Building Permission — Commercial (2026)",
    applicationType: "BUILDING_PERMISSION",
    propertyType: "COMMERCIAL",
    description: "Applicable to commercial building permission applications.",
    active: true,
    effectiveFrom: "2026-04-01",
    version: "2026 v1",
    // Demo: interstate — IGST 18%
    taxConfig: DEMO_TAX_IGST,
  },
  {
    id: "fs-layout-2026",
    name: "Layout Approval (2026)",
    applicationType: "LAYOUT_APPROVAL",
    description: "Group housing & layout approval fee structure.",
    active: true,
    effectiveFrom: "2026-04-01",
    version: "2026 v1",
    // Demo: tax-exempt fee category
    taxConfig: DEMO_TAX_NOT_APPLICABLE,
  },
];

export const FEE_COMPONENTS: FeeComponent[] = [
  { id: "fc-1", name: "Application Fee", code: "APP_FEE", description: "Base processing fee per application", basis: "FIXED", rate: 2500 },
  { id: "fc-2", name: "Scrutiny Fee", code: "SCRUTINY_FEE", description: "Per sq.m scrutiny charge on built-up area", basis: "AREA_BASED", rate: 45, unit: "sq.m" },
  { id: "fc-3", name: "Development Fee", code: "DEV_FEE", description: "Infrastructure development charge", basis: "AREA_BASED", rate: 120, unit: "sq.m" },
  { id: "fc-4", name: "Processing Fee", code: "PROC_FEE", description: "Administrative processing fee", basis: "FIXED", rate: 1500 },
  { id: "fc-5", name: "Document Verification Fee", code: "DOC_FEE", description: "Per-document verification charge", basis: "FIXED", rate: 800 },
  { id: "fc-6", name: "Labour Cess", code: "LABOUR_CESS", description: "1% of Development Fee — statutory", basis: "PERCENTAGE", rate: 1 },
];

// Re-export tax configs for admin UI / tests
export { DEMO_TAX_CGST_SGST, DEMO_TAX_IGST, DEMO_TAX_NOT_APPLICABLE };
