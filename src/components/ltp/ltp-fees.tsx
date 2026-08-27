"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  InfoGrid,
} from "@/components/design-system/layout";
import { StatusBadge, PaymentStatusBadge } from "@/components/design-system/badges";
import { formatDateTime, formatDate, formatINR, timeAgo } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ReceiptIndianRupee,
  CreditCard,
  ScrollText,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Download,
  ShieldCheck,
  Landmark,
  Smartphone,
  Wallet,
  Building2,
  FileCheck2,
  Printer,
  Share2,
  AlertCircle,
  Lock,
  Check,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";

function useAppOrDefault(): Application | null {
  const sel = useSelectedApplication();
  const apps = useAppStore((s) => s.applications);
  return sel ?? apps.find((a) => a.fee) ?? apps[0] ?? null;
}

function AppSelect({ apps, current, view }: { apps: Application[]; current: Application; view: "ltp-fees" | "ltp-payment" | "ltp-receipt" }) {
  const { openApplication } = useAppStore();
  return (
    <select value={current.id} onChange={(e) => openApplication(e.target.value, view)} className="h-8 rounded-md border border-input bg-background px-2 text-xs font-mono">
      {apps.map((a) => <option key={a.id} value={a.id}>{a.applicationNo}</option>)}
    </select>
  );
}

// ============================================================
// FEE DETAILS
// ============================================================
export function LtpFees() {
  const { navigate, applications } = useAppStore();
  const app = useAppOrDefault();
  if (!app || !app.fee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fee Details" icon={ReceiptIndianRupee} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Fees" }]} />
        <EmptyState icon={ReceiptIndianRupee} title="No fee generated" description="Fees are generated automatically once documents are verified." />
      </div>
    );
  }
  const f = app.fee;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Details"
        description="Invoice-style breakdown of all applicable fees and charges."
        icon={ReceiptIndianRupee}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Fees" }]}
        actions={<AppSelect apps={applications} current={app} view="ltp-fees" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Fee Breakdown" description={`${f.feeStructureName} · generated ${formatDate(f.generatedAt)}`} icon={ReceiptIndianRupee}>
            {/* Invoice header */}
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Application No.</p>
                <p className="font-mono text-sm font-medium text-primary">{app.applicationNo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fee Structure</p>
                <p className="text-sm font-medium">{f.feeStructureName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Generated On</p>
                <p className="text-sm font-medium">{formatDate(f.generatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <PaymentStatusBadge status={app.payment?.status ?? "PENDING"} />
              </div>
            </div>

            {/* Line items */}
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">Component</th>
                    <th className="px-4 py-2.5 font-medium">Basis</th>
                    <th className="px-4 py-2.5 font-medium text-right">Rate</th>
                    <th className="px-4 py-2.5 font-medium text-right">Qty</th>
                    <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {f.lineItems.map((li, idx) => (
                    <tr key={li.componentCode} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{li.name}</p>
                        <p className="text-[10px] text-muted-foreground">{li.description}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{li.basis}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">₹{li.rate.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{li.quantity.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-medium tabular-nums">₹{li.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono tabular-nums">{formatINR(f.subtotal)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-mono tabular-nums">{formatINR(f.gst)}</span></div>
                <Separator />
                <div className="flex items-center justify-between"><span className="font-semibold">Total Payable</span><span className="font-mono text-lg font-bold text-primary">{formatINR(f.total)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Paid</span><span className="font-mono tabular-nums text-success">{formatINR(f.paidAmount)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Outstanding</span><span className="font-mono font-semibold tabular-nums text-destructive">{formatINR(f.outstanding)}</span></div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Payment Status" icon={CreditCard}>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">Outstanding Amount</p>
                <p className="text-3xl font-bold text-primary">{formatINR(f.outstanding)}</p>
                <p className="text-[11px] text-muted-foreground">of {formatINR(f.total)} total</p>
              </div>
              {app.payment?.status === "SUCCESSFUL" ? (
                <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center text-success">
                  <CheckCircle2 className="mx-auto size-6" />
                  <p className="mt-1 text-sm font-medium">Payment Successful</p>
                  <p className="text-[10px]">Receipt {app.payment.receiptNo}</p>
                </div>
              ) : (
                <Button className="w-full" size="lg" onClick={() => navigate("ltp-payment")}>
                  <CreditCard className="size-4" /> Pay Now <ArrowRight className="size-4" />
                </Button>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <Lock className="size-3" /> Secured by BillDesk (sandbox)
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Fee Structure" icon={FileCheck2}>
            <InfoGrid
              items={[
                { label: "Structure", value: f.feeStructureName },
                { label: "Application Type", value: app.project.type.replace(/_/g, " ") },
                { label: "Built-up Area", value: `${app.project.builtUpArea.toLocaleString("en-IN")} sq.m` },
                { label: "Effective From", value: formatDate("2025-04-01") },
              ]}
              columns={1}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAYMENT FLOW
// ============================================================
type PayStage = "pending" | "method" | "processing" | "success" | "failed";

export function LtpPayment() {
  const { navigate, applications } = useAppStore();
  const app = useAppOrDefault();
  const { toast } = useToast();
  const [method, setMethod] = React.useState("UPI");
  const [stage, setStage] = React.useState<PayStage>(app?.payment?.status === "SUCCESSFUL" ? "success" : "pending");
  const appId = app?.id;
  React.useEffect(() => {
    setStage(app?.payment?.status === "SUCCESSFUL" ? "success" : "pending");
    setMethod("UPI");
  }, [appId, app?.payment?.status]);

  if (!app || !app.fee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment" icon={CreditCard} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Payment" }]} />
        <EmptyState icon={CreditCard} title="No payment due" description="There is no outstanding payment for this application." />
      </div>
    );
  }

  function initiatePayment() {
    setStage("processing");
    setTimeout(() => {
      setStage("success");
      toast({ title: "Payment Successful", description: "Your payment has been verified and receipt generated." });
    }, 2600);
  }

  const PAYMENT_STEPS = [
    { key: "pending", label: "Fee Pending" },
    { key: "method", label: "Select Method" },
    { key: "processing", label: "Processing" },
    { key: "success", label: "Successful" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment"
        description="Secure online payment for your application fees."
        icon={CreditCard}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Payment" }]}
        actions={<AppSelect apps={applications} current={app} view="ltp-payment" />}
      />

      {/* Payment progress stepper */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
        <ol className="flex items-center justify-between">
          {PAYMENT_STEPS.map((s, idx) => {
            const currentIdx = PAYMENT_STEPS.findIndex((p) => p.key === (stage === "failed" ? "processing" : stage));
            const isActive = idx === currentIdx;
            const isDone = idx < currentIdx;
            return (
              <li key={s.key} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <div className={cn("flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold", isDone && "border-success bg-success text-success-foreground", isActive && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15", !isDone && !isActive && "border-border bg-background text-muted-foreground")}>
                    {isDone ? <Check className="size-4" /> : idx + 1}
                  </div>
                  <span className={cn("hidden text-xs font-medium sm:block", isActive ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                </div>
                {idx < PAYMENT_STEPS.length - 1 && <div className={cn("mx-2 h-0.5 flex-1 rounded-full", isDone ? "bg-success" : "bg-border")} />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {stage === "pending" && (
            <SectionCard title="Payment Summary" description="Review the amount before proceeding" icon={ReceiptIndianRupee}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Application</p>
                    <p className="font-mono text-sm font-medium text-primary">{app.applicationNo}</p>
                  </div>
                  <StatusBadge status={app.status} showIcon={false} />
                </div>
                {app.fee.lineItems.map((li) => (
                  <div key={li.componentCode} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{li.name}</span>
                    <span className="font-mono tabular-nums">₹{li.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Payable</span>
                  <span className="font-mono text-xl font-bold text-primary">{formatINR(app.fee.total)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => setStage("method")}>
                  Proceed to Payment <ArrowRight className="size-4" />
                </Button>
              </div>
            </SectionCard>
          )}

          {stage === "method" && (
            <SectionCard title="Select Payment Method" icon={Wallet}>
              <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
                {[
                  { value: "UPI", label: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: Smartphone },
                  { value: "NETBANKING", label: "Net Banking", desc: "All major banks", icon: Landmark },
                  { value: "CARD", label: "Debit / Credit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
                  { value: "DEMAND_DRAFT", label: "Demand Draft", desc: "Submit DD at office", icon: FileCheck2 },
                ].map((m) => (
                  <Label key={m.value} htmlFor={m.value} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all", method === m.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                    <RadioGroupItem value={m.value} id={m.value} />
                    <m.icon className="size-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStage("pending")}>Back</Button>
                <Button className="flex-1" size="lg" onClick={initiatePayment}>
                  <Lock className="size-4" /> Pay {formatINR(app.fee.total)} Securely
                </Button>
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3" /> Payment is processed on a secure gateway. We do not store card details.
              </p>
            </SectionCard>
          )}

          {stage === "processing" && (
            <SectionCard title="Processing Payment" icon={Loader2}>
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Processing your payment…</p>
                  <p className="text-sm text-muted-foreground">Please do not refresh or close this page. Verifying transaction with the bank.</p>
                </div>
                <div className="w-full max-w-xs space-y-1.5 text-left text-xs">
                  <ProcessingStep label="Connecting to payment gateway" done />
                  <ProcessingStep label="Authenticating with bank" done />
                  <ProcessingStep label="Verifying transaction" active />
                  <ProcessingStep label="Generating receipt" />
                </div>
              </div>
            </SectionCard>
          )}

          {stage === "success" && (
            <SectionCard title="Payment Successful" icon={CheckCircle2}>
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Payment Verified</p>
                  <p className="text-sm text-muted-foreground">Your payment has been successfully processed and verified.</p>
                </div>
                <div className="w-full max-w-sm space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-left text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono font-medium">{app.payment?.transactionId || "TXN882190459001"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reference No.</span><span className="font-mono font-medium">{app.payment?.referenceNo || "MAHGP/2025/555001"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-mono font-medium text-success">{formatINR(app.fee.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{method}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Receipt No.</span><span className="font-mono font-medium text-primary">{app.payment?.receiptNo || "RCP/2025/04/00999"}</span></div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => navigate("ltp-receipt")}><Download className="size-4" /> Download Receipt</Button>
                  <Button onClick={() => navigate("ltp-application-details")}>Track Application <ArrowRight className="size-4" /></Button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <SectionCard title="Security & Trust" icon={ShieldCheck}>
            <ul className="space-y-2.5 text-xs">
              {[
                { icon: Lock, text: "256-bit SSL encrypted gateway" },
                { icon: ShieldCheck, text: "PCI-DSS compliant infrastructure" },
                { icon: FileCheck2, text: "Backend transaction verification" },
                { icon: CheckCircle2, text: "Auto-generated verified receipt" },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <s.icon className="size-3.5 text-success" /> <span>{s.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-2 text-[10px] text-warning-foreground">
              <AlertCircle className="mr-1 inline size-3" />
              Demo mode: no real payment is processed. Status is simulated for demonstration.
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ProcessingStep({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? <CheckCircle2 className="size-3.5 text-success" /> : active ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <Clock className="size-3.5 text-muted-foreground" />}
      <span className={cn(done || active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}

// ============================================================
// RECEIPT
// ============================================================
export function LtpReceipt() {
  const { navigate, applications } = useAppStore();
  const app = useAppOrDefault();
  if (!app || !app.payment || app.payment.status !== "SUCCESSFUL") {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Receipt" icon={ScrollText} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Receipt" }]} />
        <EmptyState icon={ScrollText} title="No receipt available" description="Receipts are generated after a successful payment." action={<Button size="sm" onClick={() => navigate("ltp-payment")}>Go to payment</Button>} />
      </div>
    );
  }
  const p = app.payment;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Receipt"
        description="Official receipt for your payment transaction."
        icon={ScrollText}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Receipt" }]}
        actions={
          <>
            <AppSelect apps={applications} current={app} view="ltp-receipt" />
            <Button variant="outline" size="sm"><Printer className="size-4" /> Print</Button>
            <Button size="sm"><Download className="size-4" /> Download PDF</Button>
          </>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-gov-lg">
          {/* Receipt header */}
          <div className="flex flex-col gap-4 border-b border-border bg-sidebar p-6 text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">Municipal Authority</p>
                <p className="text-[11px] text-sidebar-foreground/60">Directorate of Town &amp; Country Planning</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-sidebar-foreground/60">Receipt No.</p>
              <p className="font-mono text-sm font-semibold">{p.receiptNo}</p>
            </div>
          </div>

          {/* Receipt body */}
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/5 px-4 py-1.5 text-success">
                <CheckCircle2 className="size-4" />
                <span className="text-sm font-medium">Payment Successful &amp; Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoGrid items={[
                { label: "Application No.", value: <span className="font-mono text-primary">{app.applicationNo}</span> },
                { label: "Applicant", value: app.applicant.name },
                { label: "Project", value: app.project.name },
              ]} columns={1} />
              <InfoGrid items={[
                { label: "Transaction ID", value: <span className="font-mono">{p.transactionId}</span> },
                { label: "Reference No.", value: <span className="font-mono">{p.referenceNo}</span> },
                { label: "Date", value: formatDateTime(p.completedAt ?? "") },
              ]} columns={1} />
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee Breakup</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {app.fee?.lineItems.map((li) => (
                    <tr key={li.componentCode}>
                      <td className="py-2">
                        <p className="text-xs font-medium">{li.name}</p>
                        <p className="text-[10px] text-muted-foreground">{li.description}</p>
                      </td>
                      <td className="py-2 text-right font-mono text-xs tabular-nums">₹{li.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono tabular-nums">{formatINR(app.fee?.subtotal ?? 0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-mono tabular-nums">{formatINR(app.fee?.gst ?? 0)}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="font-semibold">Total Paid</span><span className="font-mono text-lg font-bold text-success">{formatINR(p.amount)}</span></div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{p.method} · {p.gateway}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verified</p>
                <p className="font-medium text-success">{p.verified ? "Yes — backend verified" : "Pending"}</p>
              </div>
            </div>
          </div>

          {/* Receipt footer */}
          <div className="border-t border-border bg-muted/30 p-4 text-center">
            <p className="text-[10px] text-muted-foreground">
              This is a computer-generated receipt and does not require a physical signature. Please retain for your records.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Generated on {formatDateTime(p.completedAt ?? "")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
