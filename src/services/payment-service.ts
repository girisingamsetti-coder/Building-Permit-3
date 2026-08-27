import type { Payment, PaymentStatus } from "@/types";

// ============================================================
// PAYMENT GATEWAY SERVICE
// Interface for payment gateway integration.
// Currently implemented by MockPaymentService.
// To integrate a real gateway, implement this interface
// with Razorpay/BillDesk/CCAvenue SDK calls.
// ============================================================

export interface PaymentInitiationInput {
  applicationId: string;
  applicationNo: string;
  amount: number;
  method: "UPI" | "NETBANKING" | "CARD" | "DEMAND_DRAFT";
  payerName: string;
  payerEmail: string;
  payerPhone: string;
}

export interface PaymentInitiationResult {
  paymentId: string;
  gatewayOrderId: string;
  status: PaymentStatus;
  gatewayRedirectUrl?: string;
  isMock: boolean;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: PaymentStatus;
  transactionId: string;
  referenceNo: string;
  receiptNo: string;
  completedAt: string;
  message: string;
  isMock: boolean;
}

export interface IPaymentGatewayService {
  initiate(input: PaymentInitiationInput): Promise<PaymentInitiationResult>;
  verify(paymentId: string): Promise<PaymentVerificationResult>;
  getPayment(paymentId: string): Promise<Payment | null>;
}

// ============================================================
// MOCK PAYMENT SERVICE
// Simulates a payment gateway for demonstration.
// Does NOT process real transactions. Clearly marked as mock.
// ============================================================

export class MockPaymentService implements IPaymentGatewayService {
  private payments: Map<string, Payment> = new Map();
  private counter = 0;

  async initiate(input: PaymentInitiationInput): Promise<PaymentInitiationResult> {
    this.counter++;
    const paymentId = `pay-mock-${Date.now()}-${this.counter}`;
    const gatewayOrderId = `MOCKORD${String(this.counter).padStart(8, "0")}`;

    const payment: Payment = {
      id: paymentId,
      transactionId: "",
      referenceNo: gatewayOrderId,
      status: "PROCESSING",
      amount: input.amount,
      method: input.method,
      gateway: "Mock Payment Gateway (Demo)",
      initiatedAt: new Date().toISOString(),
      verified: false,
      isMock: true,
    };
    this.payments.set(paymentId, payment);

    return {
      paymentId,
      gatewayOrderId,
      status: "PROCESSING",
      isMock: true,
    };
  }

  async verify(paymentId: string): Promise<PaymentVerificationResult> {
    const payment = this.payments.get(paymentId);
    // For demo: if payment not registered via initiate(), still process verification
    // (the store creates payment objects directly and calls verify() after a delay)
    // Real gateways would reject unknown payment IDs.

    // Mock: 95% success rate
    const success = Math.random() > 0.05;
    const now = new Date().toISOString();

    if (success) {
      const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const receiptNo = `RCP/2026/${String(Math.floor(Math.random() * 90000) + 10000)}`;
      if (payment) {
        const updated: Payment = {
          ...payment,
          status: "SUCCESS",
          transactionId: txnId,
          receiptNo,
          completedAt: now,
          verified: true,
          isMock: true,
        };
        this.payments.set(paymentId, updated);
      }
      return {
        verified: true,
        status: "SUCCESS",
        transactionId: txnId,
        referenceNo: payment?.referenceNo ?? `MOCKORD${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
        receiptNo,
        completedAt: now,
        message: "Payment verified successfully (MOCK — no real transaction)",
        isMock: true,
      };
    } else {
      if (payment) {
        const updated: Payment = {
          ...payment,
          status: "FAILED",
          completedAt: now,
          verified: true,
          isMock: true,
        };
        this.payments.set(paymentId, updated);
      }
      return {
        verified: false,
        status: "FAILED",
        transactionId: "",
        referenceNo: payment?.referenceNo ?? "",
        receiptNo: "",
        completedAt: now,
        message: "Payment failed (MOCK — simulated failure)",
        isMock: true,
      };
    }
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.payments.get(paymentId) ?? null;
  }
}

// ============================================================
// PAYMENT SERVICE (facade)
// Uses the mock service now. Swap with real gateway later.
// ============================================================

export class PaymentService {
  private gateway: IPaymentGatewayService;

  constructor(gateway?: IPaymentGatewayService) {
    this.gateway = gateway ?? new MockPaymentService();
  }

  async initiatePayment(input: PaymentInitiationInput): Promise<PaymentInitiationResult> {
    return this.gateway.initiate(input);
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    return this.gateway.verify(paymentId);
  }

  // For real gateway integration, set a new gateway implementation
  setGateway(gateway: IPaymentGatewayService): void {
    this.gateway = gateway;
  }
}

// Singleton — uses mock by default
export const paymentService = new PaymentService();
