import type {
  ApplicationFee,
  ApplicationType,
  FeeComponent,
  FeeLineItem,
  FeeStructure,
  PropertyType,
  TaxConfig,
} from "@/types";
import { FEE_COMPONENTS, FEE_STRUCTURES } from "@/data/fee-config";

// ============================================================
// FEE CALCULATION SERVICE
// Accepts application data and returns a fully computed fee object.
// Uses configurable fee rules — NOT hardcoded business logic.
//
// TAX MODEL (configurable via FeeStructure.taxConfig):
//   taxApplicable: true/false
//   taxType: "CGST_SGST" | "IGST" | "ZERO_TAX"
//
// ROUNDING:
//   Each line-item amount and each tax component is individually
//   rounded with Math.round so stored + displayed values match.
// ============================================================

export interface FeeCalculationInput {
  applicationType: ApplicationType;
  propertyType: PropertyType;
  builtUpArea: number;
  plotArea: number;
  documentCount: number;
}

export interface FeeCalculationResult {
  feeStructure: FeeStructure;
  lineItems: FeeLineItem[];
  subtotal: number;
  taxableAmount: number;
  // Tax breakdown
  taxApplicable: boolean;
  taxType: "CGST_SGST" | "IGST" | "ZERO_TAX";
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalGST: number;
  gst: number; // legacy = totalGST
  total: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
  taxConfig: TaxConfig;
}

function round(n: number): number {
  return Math.round(n);
}

export class FeeCalculationService {
  private structures: FeeStructure[];
  private components: FeeComponent[];

  constructor(structures: FeeStructure[] = FEE_STRUCTURES, components: FeeComponent[] = FEE_COMPONENTS) {
    this.structures = structures;
    this.components = components;
  }

  /** Find the active fee structure for an application type (+ optional property type) */
  findStructure(applicationType: ApplicationType, propertyType?: PropertyType): FeeStructure | undefined {
    // Prefer a structure that matches BOTH applicationType AND propertyType
    const byTypeAndProperty = this.structures.find(
      (s) => s.applicationType === applicationType && s.active && s.propertyType === propertyType
    );
    if (byTypeAndProperty) return byTypeAndProperty;
    // Fall back to any active structure for the application type
    return this.structures.find((s) => s.applicationType === applicationType && s.active && !s.propertyType);
  }

  /** Calculate fee for an application */
  calculate(input: FeeCalculationInput): FeeCalculationResult | null {
    const structure = this.findStructure(input.applicationType, input.propertyType);
    if (!structure) return null;

    const lineItems: FeeLineItem[] = [];

    for (const comp of this.components) {
      // LABOUR_CESS is computed separately as 1% of DEV_FEE — skip in main loop
      if (comp.code === "LABOUR_CESS") continue;
      const item = this.computeLineItem(comp, input);
      if (item) lineItems.push(item);
    }

    const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);

    // Labour cess = 1% of development fee (statutory) — added as a line item
    const devFeeItem = lineItems.find((li) => li.componentCode === "DEV_FEE");
    const devFeeAmount = devFeeItem?.amount ?? 0;
    const labourCess = devFeeAmount > 0 ? round((devFeeAmount * 0.01)) : 0;
    if (labourCess > 0) {
      const cessComponent = this.components.find((c) => c.code === "LABOUR_CESS");
      if (cessComponent) {
        lineItems.push({
          componentCode: "LABOUR_CESS",
          name: cessComponent.name,
          description: "1% of Development Fee (statutory)",
          basis: "Percentage",
          rate: 1,
          ratePercent: 1,
          base: devFeeAmount,
          quantity: devFeeAmount,
          amount: labourCess,
        });
      }
    }

    // Recompute subtotal AFTER adding labour cess (cess is part of subtotal)
    const subtotalWithCess = lineItems.reduce((sum, li) => sum + li.amount, 0);
    const taxableAmount = subtotalWithCess;

    // ===== Configurable tax computation =====
    const taxConfig: TaxConfig = structure.taxConfig ?? {
      taxApplicable: false,
      taxType: "ZERO_TAX",
      label: "Tax Not Applicable",
    };

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (taxConfig.taxApplicable) {
      if (taxConfig.taxType === "CGST_SGST") {
        const cgstRate = taxConfig.cgstRate ?? 0;
        const sgstRate = taxConfig.sgstRate ?? 0;
        cgst = round((taxableAmount * cgstRate) / 100);
        sgst = round((taxableAmount * sgstRate) / 100);
      } else if (taxConfig.taxType === "IGST") {
        const igstRate = taxConfig.igstRate ?? 0;
        igst = round((taxableAmount * igstRate) / 100);
      }
    }

    const totalGST = cgst + sgst + igst;
    const total = taxableAmount + totalGST;

    return {
      feeStructure: structure,
      lineItems,
      subtotal: subtotalWithCess,
      taxableAmount,
      taxApplicable: taxConfig.taxApplicable,
      taxType: taxConfig.taxType,
      cgst,
      sgst,
      igst,
      cess: labourCess,
      totalGST,
      gst: totalGST, // legacy field
      total,
      paidAmount: 0,
      outstanding: total,
      currency: "INR",
      taxConfig,
    };
  }

  private computeLineItem(comp: FeeComponent, input: FeeCalculationInput): FeeLineItem | null {
    switch (comp.basis) {
      case "FIXED": {
        let quantity = 1;
        if (comp.code === "DOC_FEE") {
          quantity = input.documentCount;
        }
        return {
          componentCode: comp.code,
          name: comp.name,
          description: comp.description,
          basis: "Fixed",
          rate: comp.rate,
          quantity,
          amount: round(comp.rate * quantity),
        };
      }
      case "AREA_BASED": {
        const area = comp.unit === "sq.m" ? input.builtUpArea : input.plotArea;
        return {
          componentCode: comp.code,
          name: comp.name,
          description: `${area} sq.m × ₹${comp.rate}/sq.m`,
          basis: "Area based",
          rate: comp.rate,
          quantity: area,
          amount: round(comp.rate * area),
        };
      }
      case "PERCENTAGE": {
        // Percentage of development fee
        const devFee = input.builtUpArea * 120;
        const amount = round((devFee * comp.rate) / 100);
        return {
          componentCode: comp.code,
          name: comp.name,
          description: `${comp.rate}% of Development Fee`,
          basis: "Percentage",
          rate: comp.rate,
          ratePercent: comp.rate,
          base: devFee,
          quantity: devFee,
          amount,
        };
      }
      case "SLAB": {
        // Simplified slab: based on built-up area
        let amount = comp.rate;
        if (input.builtUpArea > 5000) amount = comp.rate * 3;
        else if (input.builtUpArea > 1000) amount = comp.rate * 2;
        return {
          componentCode: comp.code,
          name: comp.name,
          description: `Slab: ${input.builtUpArea > 5000 ? ">5000" : input.builtUpArea > 1000 ? "1000-5000" : "<1000"} sq.m`,
          basis: "Slab",
          rate: comp.rate,
          quantity: 1,
          amount: round(amount),
        };
      }
      default:
        return null;
    }
  }

  /** Convert calculation result to ApplicationFee (stored on application) */
  toApplicationFee(result: FeeCalculationResult, paidAmount = 0): ApplicationFee {
    return {
      feeStructureId: result.feeStructure.id,
      feeStructureName: result.feeStructure.name,
      feeStructureVersion: result.feeStructure.version,
      generatedAt: new Date().toISOString(),
      lineItems: result.lineItems,
      subtotal: result.subtotal,
      taxableAmount: result.taxableAmount,
      taxApplicable: result.taxApplicable,
      taxType: result.taxType,
      cgst: result.cgst,
      sgst: result.sgst,
      igst: result.igst,
      cess: result.cess,
      totalGST: result.totalGST,
      gst: result.totalGST,
      total: result.total,
      paidAmount,
      outstanding: Math.max(0, result.total - paidAmount),
      currency: result.currency,
      taxConfig: result.taxConfig,
    };
  }
}

// Singleton instance
export const feeService = new FeeCalculationService();
