import type {
  ApplicationFee,
  ApplicationType,
  FeeComponent,
  FeeLineItem,
  FeeStructure,
  PropertyType,
} from "@/types";
import { FEE_COMPONENTS, FEE_STRUCTURES } from "@/data/fee-config";

// ============================================================
// FEE CALCULATION SERVICE
// Accepts application data and returns a fully computed fee object.
// Uses configurable fee rules — NOT hardcoded business logic.
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
  gst: number;
  labourCess: number;
  total: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
}

export class FeeCalculationService {
  private structures: FeeStructure[];
  private components: FeeComponent[];

  constructor(structures: FeeStructure[] = FEE_STRUCTURES, components: FeeComponent[] = FEE_COMPONENTS) {
    this.structures = structures;
    this.components = components;
  }

  /** Find the active fee structure for an application type */
  findStructure(applicationType: ApplicationType): FeeStructure | undefined {
    return this.structures.find(
      (s) => s.applicationType === applicationType && s.active
    );
  }

  /** Calculate fee for an application */
  calculate(input: FeeCalculationInput): FeeCalculationResult | null {
    const structure = this.findStructure(input.applicationType);
    if (!structure) return null;

    const lineItems: FeeLineItem[] = [];

    for (const comp of this.components) {
      // LABOUR_CESS is computed separately as 1% of DEV_FEE — skip in main loop
      if (comp.code === "LABOUR_CESS") continue;
      const item = this.computeLineItem(comp, input);
      if (item) lineItems.push(item);
    }

    const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);

    // Labour cess = 1% of development fee (statutory)
    const devFeeItem = lineItems.find((li) => li.componentCode === "DEV_FEE");
    const labourCess = devFeeItem ? Math.round(devFeeItem.amount * 0.01) : 0;
    if (labourCess > 0) {
      const cessComponent = this.components.find((c) => c.code === "LABOUR_CESS");
      if (cessComponent) {
        lineItems.push({
          componentCode: "LABOUR_CESS",
          name: cessComponent.name,
          description: "1% of Development Fee (statutory)",
          basis: "Percentage",
          rate: 1,
          quantity: devFeeItem?.amount ?? 0,
          amount: labourCess,
        });
      }
    }

    const gst = 0; // government fees — no GST
    const total = subtotal + labourCess + gst;

    return {
      feeStructure: structure,
      lineItems,
      subtotal,
      gst,
      labourCess,
      total,
      paidAmount: 0,
      outstanding: total,
      currency: "INR",
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
          amount: comp.rate * quantity,
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
          amount: comp.rate * area,
        };
      }
      case "PERCENTAGE": {
        // Percentage of development fee
        const devFee = input.builtUpArea * 120;
        const amount = Math.round((devFee * comp.rate) / 100);
        return {
          componentCode: comp.code,
          name: comp.name,
          description: `${comp.rate}% of Development Fee`,
          basis: "Percentage",
          rate: comp.rate,
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
          amount,
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
      generatedAt: new Date().toISOString(),
      lineItems: result.lineItems,
      subtotal: result.subtotal,
      gst: result.gst,
      total: result.total,
      paidAmount,
      outstanding: Math.max(0, result.total - paidAmount),
      currency: result.currency,
    };
  }
}

// Singleton instance
export const feeService = new FeeCalculationService();
