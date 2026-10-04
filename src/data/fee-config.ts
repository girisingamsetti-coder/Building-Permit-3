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
  { id: "fc-101", name: "101 Scrutiny fee/Application fee", code: "101_SCRUTINY_APP_FEE", description: "Statutory scrutiny & application assessment charge", basis: "AREA_BASED", rate: 45, unit: "sq.m" },
  { id: "fc-102", name: "102 Development Charges (BUA)", code: "102_DEV_CHARGES_BUA", description: "Infrastructure development charges on Built-Up Area", basis: "AREA_BASED", rate: 120, unit: "sq.m" },
  { id: "fc-103", name: "103 Development Charges (Vacant Land)", code: "103_DEV_CHARGES_VACANT", description: "Statutory development charges on vacant land portion", basis: "AREA_BASED", rate: 35, unit: "sq.m" },
  { id: "fc-104", name: "104 Special Development Charges (IRR)", code: "104_SPL_DEV_IRR", description: "Special Inner Ring Road corridor development assessment", basis: "FIXED", rate: 16500 },
  { id: "fc-105", name: "105 1% Labour Welfare Cess", code: "105_LABOUR_CESS", description: "Statutory 1% BOCW labour welfare cess on development charges", basis: "PERCENTAGE", rate: 1 },
  { id: "fc-106", name: "106 Green Fee", code: "106_GREEN_FEE", description: "Statutory environmental greening & urban forestry fee", basis: "FIXED", rate: 4200 },
];

// Re-export tax configs for admin UI / tests
export { DEMO_TAX_CGST_SGST, DEMO_TAX_IGST, DEMO_TAX_NOT_APPLICABLE };
