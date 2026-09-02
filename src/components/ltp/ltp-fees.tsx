"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication, useVisibleApplications } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  InfoGrid,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import { StatusBadge, PaymentStatusBadge } from "@/components/design-system/badges";
import { formatDateTime, formatDate, formatINR, timeAgo } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReceiptIndianRupee,
  CreditCard,
  ScrollText,
  CheckCircle2,
  Clock,
  Loader2,
  Download,
  ShieldCheck,
  Landmark,
  Smartphone,
  Wallet,
  Building2,
  FileCheck2,
  Printer,
  AlertCircle,
  Lock,
  Check,
  ArrowRight,
  IndianRupee,
  Hash,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, ApplicationFee, Payment, ViewKey } from "@/types";

// ============================================================
// HELPERS
// ============================================================

function formatRupee(n: number): string {
  return formatINR(n);
}

/** Render the tax line items in a fee summary based on the fee's tax config */
function renderTaxLines(fee: ApplicationFee): React.ReactNode {
  if (!fee.taxApplicable) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">GST</span>
        <span className="font-mono tabular-nums text-muted-foreground">Not Applicable</span>
      </div>
    );
  }
  if (fee.taxType === "CGST_SGST") {
    const cgstRate = fee.taxConfig?.cgstRate ?? 0;
    const sgstRate = fee.taxConfig?.sgstRate ?? 0;
    return (
      <>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">CGST @ {cgstRate}%</span>
          <span className="font-mono tabular-nums">{formatRupee(fee.cgst)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AP SGST @ {sgstRate}%</span>
          <span className="font-mono tabular-nums">{formatRupee(fee.sgst)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total GST</span>
          <span className="font-mono tabular-nums font-medium">{formatRupee(fee.totalGST)}</span>
        </div>
      </>
    );
  }
  if (fee.taxType === "IGST") {
    const igstRate = fee.taxConfig?.igstRate ?? 0;
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">IGST @ {igstRate}%</span>
        <span className="font-mono tabular-nums font-medium">{formatRupee(fee.igst)}</span>
      </div>
    );
  }
  return null;
}

/** Human-readable tax label for the Fee Structure card */
function taxLabel(fee: ApplicationFee): string {
  if (!fee.taxApplicable) return "Tax Not Applicable";
  if (fee.taxType === "CGST_SGST") {
    const cg = fee.taxConfig?.cgstRate ?? 0;
    const sg = fee.taxConfig?.sgstRate ?? 0;
    return `CGST ${cg}% + AP SGST ${sg}%`;
  }
  if (fee.taxType === "IGST") {
    const ig = fee.taxConfig?.igstRate ?? 0;
    return `IGST ${ig}%`;
  }
  return "Tax Not Applicable";
}

function useAppOrDefault(): Application | null {
  const sel = useSelectedApplication();
  const apps = useVisibleApplications();
  return sel ?? apps.find((a) => a.fee) ?? apps[0] ?? null;
}

function AppSelect({ apps, current, view }: { apps: Application[]; current: Application; view: "ltp-fees" | "ltp-payment" | "ltp-receipt" }) {
  const { openApplication } = useAppStore();
  return (
    <Select value={current.id} onValueChange={(id) => openApplication(id, view)}>
      <SelectTrigger className="h-8 w-full sm:w-[220px] text-xs" aria-label="Switch application">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {apps.map((a) => (
          <SelectItem key={a.id} value={a.id} className="text-xs">
            <div className="flex flex-col">
              <span className="font-mono font-medium">{a.applicationNo}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                {a.project.name} · {a.applicant.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ============================================================
// APPLICATION CONTEXT CARD (prominent, shown once)
// ============================================================
function ApplicationContextCard({ app, onView }: { app: Application; onView: () => void }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Application Number", value: <span className="font-mono text-primary">{app.applicationNo}</span> },
    { label: "Project", value: app.project.name },
    { label: "Applicant", value: app.applicant.name },
    {
      label: "Application Type",
      value: app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    },
    { label: "Property Type", value: app.project.propertyType.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) },
    { label: "Current Stage", value: app.currentStageLabel },
    { label: "Status", value: <StatusBadge status={app.status} showIcon={false} /> },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Application Context</p>
            <p className="text-[11px] text-muted-foreground">All fee data below belongs to this application.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={onView}>
          View Application
        </Button>
      </div>
      <Separator className="my-3" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</p>
            <div className="truncate text-xs font-medium">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FEE DETAILS PAGE
// ============================================================
export function LtpFees() {
  const { navigate, openApplication } = useAppStore();
  const visibleApps = useVisibleApplications();
  const app = useAppOrDefault();

  // ----- Empty / no-app state -----
  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fee Details" icon={ReceiptIndianRupee} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Fees" }]} />
        <EmptyState icon={ReceiptIndianRupee} title="No applications" description="Create an application to view its fee details." />
      </div>
    );
  }

  // ----- Fee not generated state -----
  if (!app.fee) {
    const isVerifying = app.status === "DOCUMENT_VERIFICATION";
    const isDocPending = app.status === "DOCUMENT_UPLOAD_PENDING" || app.status === "DRAFT" || app.status === "DRAWING_UPLOADED" || app.status === "SCRUTINY_IN_PROGRESS" || app.status === "SCRUTINY_FAILED" || app.status === "DRAWING_REUPLOAD_REQUIRED" || app.status === "SCRUTINY_PASSED";
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="ltp-applications" />
        <PageHeader
          title="Fee Details"
          description="Invoice-style breakdown of all applicable fees and charges."
          icon={ReceiptIndianRupee}
          breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Fees" }]}
          actions={<AppSelect apps={visibleApps} current={app} view="ltp-fees" />}
        />
        <ApplicationContextCard app={app} onView={() => openApplication(app.id, "ltp-application-details")} />
        <SectionCard title="No Fee Generated Yet" icon={ReceiptIndianRupee}>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-info/10 text-info">
              <Clock className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {isVerifying
                  ? "Documents under verification"
                  : isDocPending
                  ? "Upload drawings & documents first"
                  : "Fee generation pending"}
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                {isVerifying
                  ? "Fee will be auto-generated when all documents are verified by TPA. You will be notified once the fee is ready."
                  : isDocPending
                  ? "Complete drawing scrutiny and upload all required documents. Once verified, the fee will be auto-generated."
                  : "The fee for this application will be generated automatically once the prerequisite stages are complete."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("ltp-documents")}>View documents</Button>
              <Button variant="outline" size="sm" onClick={() => navigate("ltp-application-details")}>Track application</Button>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  const f = app.fee;
  const isPaid = app.payment?.status === "SUCCESS";
  const paymentStatus: Payment["status"] = app.payment?.status ?? "PENDING";

  return (
    <div className="space-y-5">
      <PageBackButton fallbackView="ltp-applications" />
      <PageHeader
        title="Fee Details"
        description="Invoice-style breakdown of all applicable fees and charges."
        icon={ReceiptIndianRupee}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Fees" }]}
        actions={<AppSelect apps={visibleApps} current={app} view="ltp-fees" />}
      />

      {/* ===== Application Context (shown once, prominent) ===== */}
      <ApplicationContextCard app={app} onView={() => openApplication(app.id, "ltp-application-details")} />

      {/* ===== Main 72/28 grid ===== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[72fr_28fr]">
        {/* ----- LEFT: Fee Breakdown (72%) ----- */}
        <div className="space-y-5">
          <SectionCard noPadding>
            {/* Invoice header band */}
            <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Fee Breakdown</p>
                  <p className="text-xs text-muted-foreground">{f.feeStructureName} · Generated {formatDate(f.generatedAt)}</p>
                </div>
                <PaymentStatusBadge status={paymentStatus} />
              </div>
            </div>

            {/* Invoice meta row */}
            <div className="grid grid-cols-2 gap-3 border-b border-border px-4 py-3 sm:grid-cols-4 sm:px-5">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Application No.</p>
                <p className="font-mono text-xs font-medium text-primary">{app.applicationNo}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Fee Structure</p>
                <p className="truncate text-xs font-medium">{f.feeStructureName}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Generated On</p>
                <p className="text-xs font-medium">{formatDate(f.generatedAt)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                <PaymentStatusBadge status={paymentStatus} />
              </div>
            </div>

            {/* Line items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-border bg-muted/40">
                  <tr className="text-left text-[10px] uppercase tracking-wide text-foreground">
                    <th className="w-[5%] px-3 py-2.5 font-bold">#</th>
                    <th className="w-[32%] px-3 py-2.5 font-bold">Component</th>
                    <th className="w-[18%] px-3 py-2.5 font-bold">Basis</th>
                    <th className="w-[14%] px-3 py-2.5 text-right font-bold">Rate</th>
                    <th className="w-[11%] px-3 py-2.5 text-right font-bold">Qty</th>
                    <th className="w-[20%] px-3 py-2.5 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {f.lineItems.map((li, idx) => (
                    <tr key={li.componentCode} className="hover:bg-muted/30" style={{ height: "52px" }}>
                      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-medium">{li.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{li.description}</p>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{li.basis}</td>
                      <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                        {li.basis === "Percentage" ? `${li.ratePercent ?? li.rate}%` : `₹${li.rate.toLocaleString("en-IN")}`}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {li.quantity.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-semibold tabular-nums">
                        ₹{li.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary — right aligned, inside the card */}
            <div className="border-t border-border bg-muted/20 px-4 py-4 sm:px-5">
              <div className="ml-auto w-full max-w-sm space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono tabular-nums">{formatRupee(f.subtotal)}</span>
                </div>
                {/* Labour Cess is part of subtotal but shown for clarity */}
                {f.cess > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground pl-3">— includes Labour Cess</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{formatRupee(f.cess)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxable Amount</span>
                  <span className="font-mono tabular-nums">{formatRupee(f.taxableAmount)}</span>
                </div>
                {renderTaxLines(f)}
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Payable</span>
                  <span className="font-mono text-xl font-bold tabular-nums text-primary">{formatRupee(f.total)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-mono tabular-nums text-success">{formatRupee(f.paidAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-destructive">Outstanding</span>
                  <span className="font-mono font-bold tabular-nums text-destructive">{formatRupee(f.outstanding)}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ----- RIGHT: Payment Status + Fee Structure (28%) ----- */}
        <div className="space-y-5">
          {/* Payment Status card — compact */}
          <SectionCard noPadding>
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <p className="text-sm font-semibold">Payment Status</p>
              </div>
            </div>
            <div className="space-y-3 px-4 py-4">
              {/* Status pill */}
              <div className="flex items-center gap-2">
                {isPaid ? (
                  <Badge className="bg-success/10 text-success">Payment Successful</Badge>
                ) : paymentStatus === "PROCESSING" ? (
                  <Badge className="bg-info/10 text-info">Processing</Badge>
                ) : paymentStatus === "FAILED" ? (
                  <Badge className="bg-destructive/10 text-destructive">Payment Failed</Badge>
                ) : f.paidAmount > 0 ? (
                  <Badge className="bg-amber-500/15 text-amber-600">Partially Paid</Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-600">Payment Pending</Badge>
                )}
              </div>

              {/* Outstanding amount — the most important number */}
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Outstanding Amount</p>
                <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">{formatRupee(f.outstanding)}</p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Total Fee</span>
                  <span className="font-mono tabular-nums">{formatRupee(f.total)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Paid</span>
                  <span className="font-mono tabular-nums text-success">{formatRupee(f.paidAmount)}</span>
                </div>
              </div>

              {/* Action button */}
              {isPaid ? (
                <Button className="w-full" variant="outline" onClick={() => navigate("ltp-receipt")}>
                  <ScrollText className="size-4" /> View Receipt <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={() => navigate("ltp-payment")}>
                  <CreditCard className="size-4" /> Pay Now <ArrowRight className="size-4" />
                </Button>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <Lock className="size-3" /> Demo mode — no real payment processed
              </div>
            </div>
          </SectionCard>

          {/* Fee Structure card — compact key-value */}
          <SectionCard noPadding>
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-4 text-primary" />
                <p className="text-sm font-semibold">Fee Structure</p>
              </div>
            </div>
            <div className="px-4 py-3">
              <dl className="space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Structure</dt>
                  <dd className="text-right font-medium text-foreground">{f.feeStructureName}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Application Type</dt>
                  <dd className="text-right font-medium">
                    {app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Property Type</dt>
                  <dd className="text-right font-medium">
                    {app.project.propertyType.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Version</dt>
                  <dd className="text-right font-medium">{f.feeStructureVersion ?? "—"}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Built-up Area</dt>
                  <dd className="text-right font-medium">{app.project.builtUpArea.toLocaleString("en-IN")} sq.m</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Effective From</dt>
                  <dd className="text-right font-medium">{formatDate("2026-04-01")}</dd>
                </div>
                <Separator className="my-1" />
                <div className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">Tax</dt>
                  <dd className="text-right font-medium">
                    {f.taxApplicable ? (
                      <span className="text-foreground">{taxLabel(f)}</span>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Not Applicable</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAYMENT FLOW
// ============================================================
type PayStage = "pending" | "method" | "processing" | "success";

export function LtpPayment() {
  const { navigate, openApplication, initiatePayment: storeInitiatePayment, selectedApplicationId } = useAppStore();
  const visibleApps = useVisibleApplications();
  const processingAppIds = useAppStore((s) => s.processingAppIds);
  const { toast } = useToast();

  // If a specific app is selected and it has a fee, show the payment flow for it
  const selectedApp = selectedApplicationId
    ? visibleApps.find((a) => a.id === selectedApplicationId)
    : null;
  const isPaymentFlow = selectedApp && selectedApp.fee;

  // All apps with fees (for the payments listing)
  const appsWithFees = visibleApps.filter((a) => a.fee);
  const pendingPayments = appsWithFees.filter((a) =>
    a.payment?.status === "PENDING" || a.payment?.status === "PROCESSING" || a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED"
  );
  const paidApps = appsWithFees.filter((a) => a.payment?.status === "SUCCESS");
  const totalOutstanding = pendingPayments.reduce((sum, a) => sum + (a.fee?.outstanding ?? 0), 0);

  // ===== Payment flow view (for a specific app) =====
  if (isPaymentFlow && selectedApp) {
    return <PaymentFlow app={selectedApp} navigate={navigate} storeInitiatePayment={storeInitiatePayment} processingAppIds={processingAppIds} toast={toast} />;
  }

  // ===== Payments listing view =====
  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-applications" />
      <PageHeader
        title="Payment"
        description="Manage application fees, outstanding amounts and payment receipts."
        icon={CreditCard}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Payment" }]}
        badge={<Badge className="bg-warning/15 text-warning-foreground">Demo mode</Badge>}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PaymentStatCard icon={Clock} value={pendingPayments.length} label="PENDING PAYMENTS" subtext="Applications awaiting payment" accent="bg-amber-500/10 text-amber-600" />
        <PaymentStatCard icon={IndianRupee} value={formatRupee(totalOutstanding)} label="TOTAL OUTSTANDING" subtext="Across pending applications" accent="bg-destructive/10 text-destructive" />
        <PaymentStatCard icon={CheckCircle2} value={paidApps.length} label="PAID APPLICATIONS" subtext="Payment successfully completed" accent="bg-success/10 text-success" />
        <PaymentStatCard icon={CreditCard} value={paidApps.length} label="PAYMENT COMPLETED" subtext="Successful transactions" accent="bg-primary/10 text-primary" />
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <SectionCard title="Pending Payments" description="Applications requiring fee payment" icon={Clock}>
          <div className="space-y-3">
            {pendingPayments.map((app) => (
              <div key={app.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-xs font-semibold text-primary">{app.applicationNo}</p>
                      <StatusBadge status={app.status} showIcon={false} />
                    </div>
                    <p className="text-sm font-medium">{app.project.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} · {app.applicant.name}
                    </p>
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">Fee Generated</span>
                      <span className="font-mono font-medium">{formatRupee(app.fee!.total)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-mono text-success">{formatRupee(app.fee!.paidAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className="font-mono font-semibold text-destructive">{formatRupee(app.fee!.outstanding)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">Generated: {formatDate(app.fee!.generatedAt)}</span>
                  <Button
                    size="sm"
                    onClick={() => openApplication(app.id, "ltp-payment")}
                  >
                    <CreditCard className="size-3.5" />
                    {app.fee!.paidAmount > 0 ? "Pay Remaining" : "Pay Now"}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Payment History / All Applications with fees */}
      {appsWithFees.length > 0 && (
        <SectionCard title="Payment Applications" description="All applications with fee records" icon={ReceiptIndianRupee} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b-2 border-border text-left text-[11px] uppercase tracking-wide text-foreground">
                  <th className="px-4 py-2.5 font-bold">Application No.</th>
                  <th className="px-4 py-2.5 font-bold">Project</th>
                  <th className="px-4 py-2.5 font-bold">Applicant</th>
                  <th className="px-4 py-2.5 text-right font-bold">Total Fee</th>
                  <th className="px-4 py-2.5 text-right font-bold">Paid</th>
                  <th className="px-4 py-2.5 text-right font-bold">Outstanding</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appsWithFees.map((app) => {
                  const isPaid = app.payment?.status === "SUCCESS";
                  const isPending = app.payment?.status === "PENDING" || app.payment?.status === "PROCESSING" || app.status === "PAYMENT_PENDING" || app.status === "FEE_GENERATED";
                  return (
                    <tr key={app.id} className="hover:bg-muted/30 h-14">
                      <td className="px-4 py-2">
                        <button onClick={() => openApplication(app.id, "ltp-application-details")} className="font-mono text-xs font-semibold text-primary hover:underline">
                          {app.applicationNo}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-xs truncate max-w-[180px]">{app.project.name}</td>
                      <td className="px-4 py-2 text-xs truncate max-w-[140px]">{app.applicant.name}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">{formatRupee(app.fee!.total)}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-success">{formatRupee(app.fee!.paidAmount)}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-destructive">{formatRupee(app.fee!.outstanding)}</td>
                      <td className="px-4 py-2">
                        {isPaid && <Badge className="bg-success/10 text-success">Success</Badge>}
                        {isPending && <Badge className="bg-amber-500/15 text-amber-600">Pending</Badge>}
                        {!isPaid && !isPending && <Badge variant="outline">{app.payment?.status ?? "—"}</Badge>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {isPending && (
                          <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => openApplication(app.id, "ltp-payment")}>
                            {app.fee!.paidAmount > 0 ? "Pay Remaining" : "Pay Now"}
                          </Button>
                        )}
                        {isPaid && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openApplication(app.id, "ltp-receipt")}>
                            View Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Empty state */}
      {appsWithFees.length === 0 && (
        <EmptyState icon={CreditCard} title="No payment records" description="Applications with generated fees will appear here." />
      )}
    </div>
  );
}

// ============================================================
// PAYMENT FLOW — for a specific application
// ============================================================
function PaymentFlow({
  app,
  navigate,
  storeInitiatePayment,
  processingAppIds,
  toast,
}: {
  app: Application;
  navigate: (view: ViewKey) => void;
  storeInitiatePayment: (appId: string, method: Payment["method"]) => void;
  processingAppIds: string[];
  toast: (params: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
}) {
  const [method, setMethod] = React.useState<Payment["method"]>("UPI");
  const isProcessing = processingAppIds.includes(app.id);
  const isAlreadyPaid = app.payment?.status === "SUCCESS";
  const [stage, setStage] = React.useState<PayStage>(isAlreadyPaid ? "success" : "pending");

  React.useEffect(() => {
    if (app.payment?.status === "SUCCESS") setStage("success");
    else if (isProcessing) setStage("processing");
  }, [app.payment?.status, isProcessing]);

  function initiatePayment() {
    setStage("processing");
    storeInitiatePayment(app.id, method);
    toast({ title: "Payment initiated", description: `Processing payment for ${app.applicationNo}…` });
  }

  const PAYMENT_STEPS = [
    { key: "pending", label: "Fee Pending" },
    { key: "method", label: "Select Method" },
    { key: "processing", label: "Processing" },
    { key: "success", label: "Successful" },
  ];

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-payment" />
      <PageHeader
        title="Payment"
        description={app.applicationNo}
        icon={CreditCard}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Payment" }]}
        badge={<Badge className="bg-warning/15 text-warning-foreground">Demo mode — no real payment</Badge>}
      />

      {/* Application context */}
      <ApplicationContextCard app={app} onView={() => navigate("ltp-application-details")} />

      {/* Payment progress stepper */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
        <ol className="flex items-center justify-between">
          {PAYMENT_STEPS.map((s, idx) => {
            const currentIdx = PAYMENT_STEPS.findIndex((p) => p.key === stage);
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[72fr_28fr]">
        <div className="space-y-6">
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
                {app.fee!.lineItems.map((li) => (
                  <div key={li.componentCode} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{li.name}</span>
                    <span className="font-mono tabular-nums">₹{li.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono tabular-nums">{formatRupee(app.fee!.subtotal)}</span>
                </div>
                {/* Tax breakdown */}
                {app.fee!.taxApplicable && app.fee!.taxType === "CGST_SGST" && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CGST @ {app.fee!.taxConfig?.cgstRate ?? 0}%</span>
                      <span className="font-mono tabular-nums">{formatRupee(app.fee!.cgst)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AP SGST @ {app.fee!.taxConfig?.sgstRate ?? 0}%</span>
                      <span className="font-mono tabular-nums">{formatRupee(app.fee!.sgst)}</span>
                    </div>
                  </>
                )}
                {app.fee!.taxApplicable && app.fee!.taxType === "IGST" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">IGST @ {app.fee!.taxConfig?.igstRate ?? 0}%</span>
                    <span className="font-mono tabular-nums">{formatRupee(app.fee!.igst)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Payable</span>
                  <span className="font-mono text-xl font-bold text-primary">{formatRupee(app.fee!.total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-mono text-success">{formatRupee(app.fee!.paidAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span className="font-mono font-semibold text-destructive">{formatRupee(app.fee!.outstanding)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => setStage("method")}>
                  Proceed to Payment <ArrowRight className="size-4" />
                </Button>
              </div>
            </SectionCard>
          )}

          {stage === "method" && (
            <SectionCard title="Select Payment Method" icon={Wallet}>
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as Payment["method"])} className="space-y-2">
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
                  <Lock className="size-4" /> Pay {formatRupee(app.fee!.outstanding)} Securely
                </Button>
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3" /> Demo mode: no real payment is processed.
              </p>
            </SectionCard>
          )}

          {stage === "processing" && (
            <SectionCard title="Processing Payment" icon={Loader2}>
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Processing your payment…</p>
                  <p className="text-sm text-muted-foreground">Verifying transaction for {app.applicationNo}.</p>
                </div>
                <div className="w-full max-w-xs space-y-1.5 text-left text-xs">
                  <ProcessingStep label="Connecting to payment gateway" done />
                  <ProcessingStep label="Authenticating with bank" done />
                  <ProcessingStep label="Verifying transaction" active />
                  <ProcessingStep label="Generating receipt" />
                </div>
                <p className="text-[10px] text-muted-foreground">Demo gateway · no real money is debited</p>
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
                  <p className="text-sm text-muted-foreground">Your payment has been processed. The application has been forwarded for technical scrutiny.</p>
                </div>
                <div className="w-full max-w-sm space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-left text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Application</span><span className="font-mono font-medium text-primary">{app.applicationNo}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono font-medium">{app.payment?.transactionId || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-mono font-medium text-success">{formatRupee(app.fee!.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Receipt No.</span><span className="font-mono font-medium text-primary">{app.payment?.receiptNo || "—"}</span></div>
                  <Separator className="my-1" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Outstanding</span><span className="font-mono font-medium text-success">₹0</span></div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => navigate("ltp-receipt")}><Download className="size-4" /> View Receipt</Button>
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
              Demo mode: no real payment is processed.
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
// PAYMENT STAT CARD
// ============================================================
function PaymentStatCard({ icon: Icon, value, label, subtext, accent }: { icon: React.ComponentType<{ className?: string }>; value: string | number; label: string; subtext: string; accent: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", accent)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold tabular-nums leading-none truncate">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{subtext}</p>
      </div>
    </div>
  );
}

// ============================================================
// RECEIPT
// ============================================================
export function LtpReceipt() {
  const { navigate, openApplication } = useAppStore();
  const visibleApps = useVisibleApplications();
  const app = useAppOrDefault();
  if (!app || !app.payment || app.payment.status !== "SUCCESS") {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="ltp-applications" />
        <PageHeader title="Payment Receipt" icon={ScrollText} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Receipt" }]} />
        <EmptyState icon={ScrollText} title="No receipt available" description="Receipts are generated after a successful payment." action={<Button size="sm" onClick={() => navigate("ltp-payment")}>Go to payment</Button>} />
      </div>
    );
  }
  const p = app.payment;
  const f = app.fee;

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-payment" />
      <PageHeader
        title="Payment Receipt"
        description="Official receipt for your payment transaction."
        icon={ScrollText}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Receipt" }]}
        actions={
          <>
            <AppSelect apps={visibleApps} current={app} view="ltp-receipt" />
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
                <p className="text-sm font-semibold">LTP Approval</p>
                <p className="text-[11px] text-sidebar-foreground/60">Building Permit Management System</p>
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
                  {f?.lineItems.map((li) => (
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
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono tabular-nums">{formatRupee(f?.subtotal ?? 0)}</span></div>
                  {/* Tax breakdown on receipt */}
                  {f?.taxApplicable && f.taxType === "CGST_SGST" && (
                    <>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">CGST @ {f.taxConfig?.cgstRate ?? 0}%</span><span className="font-mono tabular-nums">{formatRupee(f.cgst)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">AP SGST @ {f.taxConfig?.sgstRate ?? 0}%</span><span className="font-mono tabular-nums">{formatRupee(f.sgst)}</span></div>
                    </>
                  )}
                  {f?.taxApplicable && f.taxType === "IGST" && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">IGST @ {f.taxConfig?.igstRate ?? 0}%</span><span className="font-mono tabular-nums">{formatRupee(f.igst)}</span></div>
                  )}
                  {!f?.taxApplicable && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-mono tabular-nums text-muted-foreground">Not Applicable</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between"><span className="font-semibold">Total Paid</span><span className="font-mono text-lg font-bold text-success">{formatRupee(p.amount)}</span></div>
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
