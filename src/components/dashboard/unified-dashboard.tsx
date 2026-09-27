"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import {
  useDashboardScope,
  computeScopedKpis,
  applicationsByStatus,
  paymentStatusData,
  documentCompletionData,
  shortfallData,
  scrutinyResultsData,
} from "@/components/dashboard/dashboard-scope";
import { DonutChart } from "@/components/dashboard/charts";
import { StatusBadge } from "@/components/design-system/badges";
import {
  FileStack,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  FileWarning,
  Clock,
  ArrowRight,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Application, ViewKey } from "@/types";

function KpiCard({ label, value, subLabel, icon, color }: {
  label: string; value: number | string; subLabel?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={cn("flex size-8 items-center justify-center rounded-xl", color)}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-black text-slate-800 leading-none">{value}</div>
        {subLabel && <div className="mt-1 text-[11px] text-slate-500">{subLabel}</div>}
      </div>
    </div>
  );
}

function AppRow({ app, onOpen }: { app: Application; onOpen: () => void }) {
  const daysAgo = Math.floor((Date.now() - new Date(app.lastUpdated).getTime()) / 86400000);
  return (
    <div className="group flex items-center gap-3 border-b border-slate-100 py-2.5 px-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={onOpen}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700">{app.applicationNo}</span>
          <StatusBadge status={app.status} />
        </div>
        <div className="mt-0.5 text-xs text-slate-500 truncate">{app.project.name} — {app.applicant.name}</div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[10px] font-medium text-slate-400">{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{app.currentStageLabel}</span>
      </div>
      <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
    </div>
  );
}

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[120px] text-slate-300 text-xs">{label}</div>
  );
}

export function UnifiedDashboard() {
  const { navigate, user } = useAppStore();
  const scope = useDashboardScope();
  const kpis = computeScopedKpis(scope.applications);

  const roleInfo = user?.role ? ROLES[user.role] : null;
  const isLTP = user?.role === "LTP";
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "COMMISSIONER" || user?.role === "ADDITIONAL_COMMISSIONER";

  const statusData = applicationsByStatus(scope.applications);
  const payData = paymentStatusData(scope.applications);
  const docData = documentCompletionData(scope.applications);
  const sfData = shortfallData(scope.applications);
  const scrutinyData = scrutinyResultsData(scope.applications);

  const applicationsView: ViewKey = isLTP ? "ltp-applications" : isAdmin ? "admin-applications" : "officer-applications";

  return (
    <div className="bg-[#F8F9FB] text-slate-800 font-sans">

      {/* Welcome Banner */}
      <div className="mb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Welcome back, <span className="text-[#801824]">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {roleInfo?.fullName ?? user?.role} · {scope.isGlobal ? "Org-wide view" : `${scope.applications.length} application${scope.applications.length !== 1 ? "s" : ""} in your scope`}
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard label="Total" value={kpis.total} subLabel="applications" icon={<FileStack className="size-4 text-blue-500" />} color="bg-blue-100" />
        <KpiCard label="In Progress" value={kpis.inProgress} subLabel="active now" icon={<Activity className="size-4 text-indigo-500" />} color="bg-indigo-100" />
        <KpiCard label="Approved" value={kpis.approved} icon={<CheckCircle2 className="size-4 text-emerald-500" />} color="bg-emerald-100" />
        <KpiCard label="Rejected" value={kpis.rejected} icon={<XCircle className="size-4 text-rose-500" />} color="bg-rose-100" />
        <KpiCard label="Shortfalls" value={kpis.openShortfalls} subLabel="open" icon={<AlertTriangle className="size-4 text-amber-500" />} color="bg-amber-100" />
        <KpiCard label="Pending Pay" value={kpis.pendingPayments} subLabel="applications" icon={<CreditCard className="size-4 text-violet-500" />} color="bg-violet-100" />
      </div>

      {/* Application Status + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* Application Status */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 h-[381px] flex flex-col">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Application Status</h3>
            <Badge variant="outline" className="text-[10px]">{scope.applications.length} total</Badge>
          </div>
          <div className="flex-1 min-h-0">
            {statusData.length > 0
              ? <DonutChart data={statusData} centerLabel="Status" centerValue={kpis.total} />
              : <EmptyChartState label="No applications yet" />}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-[381px]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Recent Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(applicationsView)}
              className="h-6 gap-1 text-[11px] text-[#801824] hover:text-[#941C2B] px-2">
              View all <ArrowRight className="size-3" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            {scope.applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <Building2 className="size-8 opacity-30" />
                <span className="text-xs">No applications in your scope</span>
              </div>
            ) : (
              scope.applications
                .slice().sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                .slice(0, 15)
                .map((app) => <AppRow key={app.id} app={app} onOpen={() => navigate(applicationsView)} />)
            )}
          </div>
          {scope.applications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-1.5 grid grid-cols-3 text-center shrink-0">
              <div><div className="text-sm font-black text-emerald-600">{kpis.approved}</div><div className="text-[10px] text-slate-500">Approved</div></div>
              <div><div className="text-sm font-black text-amber-500">{kpis.inProgress}</div><div className="text-[10px] text-slate-500">In Progress</div></div>
              <div><div className="text-sm font-black text-rose-500">{kpis.rejected}</div><div className="text-[10px] text-slate-500">Rejected</div></div>
            </div>
          )}
        </div>
      </div>

      {/* Drawing Scrutiny | Payment Status | Documents | Shortfalls */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Drawing Scrutiny</h3>
            <Clock className="size-4 text-slate-400" />
          </div>
          {scrutinyData.length > 0
            ? <DonutChart data={scrutinyData} centerLabel="Plans" centerValue={scrutinyData.reduce((s, d) => s + d.value, 0)} />
            : <EmptyChartState label="No scrutiny data" />}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Payment Status</h3>
            <CreditCard className="size-4 text-slate-400" />
          </div>
          {payData.length > 0
            ? <DonutChart data={payData} centerLabel="Fees" centerValue={payData.reduce((s, d) => s + d.value, 0)} />
            : <EmptyChartState label="No payment data" />}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Documents</h3>
            <FileStack className="size-4 text-slate-400" />
          </div>
          {docData.length > 0
            ? <DonutChart data={docData} centerLabel="Docs" centerValue={docData.reduce((s, d) => s + d.value, 0)} />
            : <EmptyChartState label="No document data" />}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Shortfalls</h3>
            <FileWarning className="size-4 text-slate-400" />
          </div>
          {sfData.length > 0
            ? <DonutChart data={sfData} centerLabel="Total" centerValue={sfData.reduce((s, d) => s + d.value, 0)} />
            : <EmptyChartState label="No shortfalls" />}
        </div>
      </div>

    </div>
  );
}
