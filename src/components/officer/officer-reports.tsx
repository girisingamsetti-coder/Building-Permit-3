"use client";
import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { PageHeader, SectionCard } from "@/components/design-system/layout";
import { BarChart3, FileStack, CheckCircle, Clock, XCircle, AlertTriangle, IndianRupee, TrendingUp } from "lucide-react";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function OfficerReports() {
  const applications = useAppStore((s) => s.applications);

  const total = applications.length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;
  const pending = applications.filter((a) => !["APPROVED", "REJECTED"].includes(a.status)).length;
  const shortfallCount = applications.filter((a) => a.status === "SHORTFALL_RAISED").length;
  const totalRevenue = applications.reduce((sum, a) => sum + (a.payment?.amount ?? 0), 0);
  const pendingPayments = applications.filter((a) => a.status === "PAYMENT_PENDING").length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="Reports"
        description="Summary of application workflow and performance metrics."
        icon={BarChart3}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Applications" value={total} sub="All time" />
        <StatCard label="Approved" value={approved} sub={`${approvalRate}% approval rate`} color="text-emerald-600" />
        <StatCard label="Rejected" value={rejected} color="text-destructive" />
        <StatCard label="In Progress" value={pending} color="text-amber-600" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Shortfalls Open" value={shortfallCount} color="text-orange-600" />
        <StatCard label="Pending Payments" value={pendingPayments} />
        <StatCard label="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} sub="From successful payments" color="text-emerald-600" />
      </div>

      <SectionCard title="Applications by Stage">
        <div className="space-y-2">
          {[
            { label: "Draft / Submission", count: applications.filter((a) => ["DRAFT", "DRAWING_UPLOADED", "SCRUTINY_IN_PROGRESS", "SCRUTINY_FAILED"].includes(a.status)).length },
            { label: "Document Verification", count: applications.filter((a) => ["DOCUMENT_UPLOAD_PENDING", "DOCUMENT_VERIFICATION"].includes(a.status)).length },
            { label: "Fee & Payment", count: applications.filter((a) => ["FEE_GENERATED", "PAYMENT_PENDING", "PAYMENT_PROCESSING"].includes(a.status)).length },
            { label: "Zonal Head Review", count: applications.filter((a) => a.status === "ZONAL_HEAD_REVIEW").length },
            { label: "Director Review", count: applications.filter((a) => a.status === "DIRECTOR_REVIEW").length },
            { label: "Additional Commissioner", count: applications.filter((a) => a.status === "ADDITIONAL_COMMISSIONER_REVIEW").length },
            { label: "Commissioner Review", count: applications.filter((a) => a.status === "COMMISSIONER_REVIEW").length },
            { label: "Final Decision", count: applications.filter((a) => ["APPROVED", "REJECTED"].includes(a.status)).length },
          ].map(({ label, count }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-48 text-xs text-muted-foreground shrink-0">{label}</span>
              <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary/70"
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-xs font-medium w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
