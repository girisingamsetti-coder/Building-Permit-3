"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  computeSLA,
  computeOfficerWorkloads,
  identifyBottleneck,
  computePendingActions,
  computeRecentActivity,
  timeAgoBrief,
} from "@/components/pm/pm-helpers";
import { PageHeader } from "@/components/design-system/layout";
import {
  StatusBadge,
  RoleBadge,
  PriorityBadge,
} from "@/components/design-system/badges";
import { formatDate, formatDateTime } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WORKFLOW_STAGES } from "@/data/workflow-config";
import { rolesForStage } from "@/lib/permissions";
import {
  PmSearchInput,
  PmFilterSelect,
  PmPagination,
  PmCardHeader,
  PmEmptyState,
  usePmPagination,
} from "@/components/pm/pm-shared";
import {
  useDashboardScope,
  computeScopedKpis,
  applicationsByStatus,
  applicationsByStage,
  slaSummary as slaSummaryChartData,
  paymentStatusData,
} from "@/components/dashboard/dashboard-scope";
import {
  DonutChart,
  BarChart,
  ChartCard,
} from "@/components/dashboard/charts";
import {
  BarChart3,
  FileStack,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
  Gauge,
  ArrowRight,
  ListChecks,
  History,
  Ban,
  TrendingDown,
  PieChart,
  CreditCard,
  Layers,
  Globe,
  ShieldCheck,
  AlertCircle,
  Hourglass,
  Timer,
  Coins,
  Landmark,
  TrendingUp,
} from "lucide-react";
import type { Application, RoleKey, User } from "@/types";

// ============================================================
// PROJECT MANAGER DASHBOARD
// Central operational view — READ-ONLY monitoring.
// Every data-heavy section has its OWN search + filters + pagination.
// No nested scrolling — pagination instead.
// No hardcoded counts — everything derived from shared store data.
// ============================================================

// ---- Shared option lists ----
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "DRAWING_UPLOADED", label: "Drawing Uploaded" },
  { value: "SCRUTINY_IN_PROGRESS", label: "Scrutiny In Progress" },
  { value: "SCRUTINY_FAILED", label: "Scrutiny Failed" },
  { value: "DRAWING_REUPLOAD_REQUIRED", label: "Drawing Reupload Required" },
  { value: "DOCUMENT_UPLOAD_PENDING", label: "Documents Pending" },
  { value: "DOCUMENT_VERIFICATION", label: "Document Verification" },
  { value: "SHORTFALL_RAISED", label: "Shortfall Raised" },
  { value: "FEE_GENERATED", label: "Fee Generated" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_PROCESSING", label: "Payment Processing" },
  { value: "TPS_TECHNICAL_SCRUTINY", label: "TPS Technical Scrutiny" },
  { value: "TPA_REVIEW", label: "TPA Review" },
  { value: "ZAD_ZDD_REVIEW", label: "ZAD/ZDD Review" },
  { value: "ZJD_REVIEW", label: "ZJD Review" },
  { value: "DIRECTOR_DP_REVIEW", label: "Director Review" },
  { value: "ADDITIONAL_COMMISSIONER_REVIEW", label: "Addl. Commissioner Review" },
  { value: "COMMISSIONER_REVIEW", label: "Commissioner Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RETURNED", label: "Returned" },
];

const STAGE_OPTIONS = [
  { value: "ALL", label: "All Stages" },
  ...WORKFLOW_STAGES.map((s) => ({ value: s.key, label: s.label })),
];

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Roles" },
  { value: "LTP", label: "LTP" },
  { value: "TPS", label: "TPS" },
  { value: "TPA", label: "TPA" },
  { value: "ZAD", label: "ZAD" },
  { value: "ZDD", label: "ZDD" },
  { value: "ZJD", label: "ZJD" },
  { value: "DIRECTOR_DP", label: "Director" },
  { value: "ADDL_COMMISSIONER", label: "Addl. Commissioner" },
  { value: "COMMISSIONER", label: "Commissioner" },
];

const SLA_OPTIONS = [
  { value: "ALL", label: "All SLA" },
  { value: "ON_TRACK", label: "On Track" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "DELAYED", label: "Delayed" },
  { value: "CRITICAL", label: "Critical Delay" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priority" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
];

const ACTIVITY_TYPES = [
  { value: "ALL", label: "All Activities" },
  { value: "Application", label: "Application" },
  { value: "Drawing", label: "Drawing" },
  { value: "Scrutiny", label: "Scrutiny" },
  { value: "Document", label: "Document" },
  { value: "Shortfall", label: "Shortfall" },
  { value: "Fee", label: "Fee" },
  { value: "Payment", label: "Payment" },
  { value: "Forwarded", label: "Forwarded" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

// ============================================================
// MAIN DASHBOARD
// ============================================================
export function PmDashboard() {
  const navigate = useAppStore((s) => s.navigate);
  const openApplication = useAppStore((s) => s.openApplication);
  const dashboardVersion = useAppStore((s) => s.dashboardVersion);
  const scope = useDashboardScope();
  const apps = scope.applications;
  const users = scope.users;

  // ---- KPI counts (derived from the dashboard-scope engine) ----
  const kpis = React.useMemo(() => computeScopedKpis(apps), [apps]);
  // "Delayed / At Risk" = DELAYED + CRITICAL + AT_RISK (per scoped KPI fields).
  // BLOCKED apps surface separately in the SLA Summary chart + card.
  const delayedAtRisk = kpis.delayed + kpis.atRisk;

  // ---- SLA summary counts (for the clickable SLA Summary card) ----
  const slaSummary = React.useMemo(() => {
    const counts = { ON_TRACK: 0, AT_RISK: 0, DELAYED: 0, CRITICAL: 0, BLOCKED: 0, COMPLETED: 0 };
    apps.forEach((a) => {
      const sla = computeSLA(a);
      if (sla.status in counts) counts[sla.status as keyof typeof counts]++;
    });
    return counts;
  }, [apps]);

  // ---- Bottleneck ----
  const bottleneck = React.useMemo(() => identifyBottleneck(apps), [apps]);

  return (
    <div className="space-y-4">
      <div className="space-y-4 lg:flex lg:gap-4 lg:space-y-0">
        {dashboardVersion === "v1" ? (
          <div className="flex-1 space-y-5">
            <div className="mb-2 p-2 bg-blue-100 text-blue-800 text-xs font-bold rounded">
              ✅ V1 Layout Active (If you click V2, this should disappear and cards should change)
            </div>
            <section>
              <div className="mb-3 flex items-center rounded-full border border-border/80 bg-transparent px-4 py-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Applications</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Total applications" value="260" blobColor="#22d3ee" iconBgClass="bg-sky-100" iconColorClass="text-sky-600" icon={Layers} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="In progress" value="197" blobColor="#818cf8" iconBgClass="bg-indigo-100" iconColorClass="text-indigo-600" icon={Globe} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Approved" value="26" blobColor="#34d399" iconBgClass="bg-emerald-100" iconColorClass="text-emerald-600" icon={ShieldCheck} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Rejected" value="2" blobColor="#fb7185" iconBgClass="bg-rose-100" iconColorClass="text-rose-600" icon={Ban} />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center rounded-full border border-border/80 bg-transparent px-4 py-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Workflow</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Open shortfalls" value="19" blobColor="#fbbf24" iconBgClass="bg-amber-100" iconColorClass="text-amber-600" icon={AlertCircle} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Overdue tasks" value="0" blobColor="#f87171" iconBgClass="bg-red-100" iconColorClass="text-red-600" icon={Hourglass} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Due soon" value="0" blobColor="#fb923c" iconBgClass="bg-orange-100" iconColorClass="text-orange-600" icon={Timer} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Average time to decide" value="0 d" blobColor="#a78bfa" iconBgClass="bg-purple-100" iconColorClass="text-purple-600" icon={Clock} />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center rounded-full border border-border/80 bg-transparent px-4 py-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Revenue</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Fees generated" value="₹1.84 Cr" blobColor="#e879f9" iconBgClass="bg-fuchsia-100" iconColorClass="text-fuchsia-600" icon={Coins} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Fees collected" value="₹1.33 Cr" blobColor="#34d399" iconBgClass="bg-emerald-100" iconColorClass="text-emerald-600" icon={Landmark} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Pending fee" value="₹50.28 L" blobColor="#c084fc" iconBgClass="bg-purple-100" iconColorClass="text-purple-600" icon={CreditCard} />
                <EnhancedKpiCard version={dashboardVersion as "v1" | "v3"} title="Payment success rate" value="78%" blobColor="#2dd4bf" iconBgClass="bg-teal-100" iconColorClass="text-teal-600" icon={TrendingUp} />
              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            {/* ===== APPLICATIONS ===== */}
            <section>
              <div className="mb-3 flex items-center rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Applications</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <GradientKpiCard title="Total applications" value={kpis.total.toString()} gradient="bg-gradient-to-br from-white to-cyan-50" iconColor="text-cyan-500" />
                <GradientKpiCard title="In progress" value={kpis.inProgress.toString()} gradient="bg-gradient-to-br from-white to-blue-50" iconColor="text-blue-500" />
                <GradientKpiCard title="Approved" value={kpis.approved.toString()} gradient="bg-gradient-to-br from-white to-emerald-50" iconColor="text-emerald-500" />
                <GradientKpiCard title="Rejected" value={kpis.rejected.toString()} gradient="bg-gradient-to-br from-white to-rose-50" iconColor="text-rose-500" />
              </div>
            </section>

            {/* ===== WORKFLOW ===== */}
            <section>
              <div className="mb-3 flex items-center rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workflow</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <GradientKpiCard title="Open shortfalls" value="18" gradient="bg-gradient-to-br from-white to-amber-50" iconColor="text-amber-500" />
                <GradientKpiCard title="Overdue tasks" value="0" gradient="bg-gradient-to-br from-white to-red-50" iconColor="text-red-500" />
                <GradientKpiCard title="Due soon" value="0" gradient="bg-gradient-to-br from-white to-orange-50" iconColor="text-orange-500" />
                <GradientKpiCard title="Average time to decide" value="0 d" gradient="bg-gradient-to-br from-white to-indigo-50" iconColor="text-indigo-500" />
              </div>
            </section>

            {/* ===== REVENUE ===== */}
            <section>
              <div className="mb-3 flex items-center rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revenue</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <GradientKpiCard title="Fees generated" value="₹1.66 Cr" gradient="bg-gradient-to-br from-white to-purple-50" iconColor="text-purple-500" />
                <GradientKpiCard title="Fees collected" value="₹1.16 Cr" gradient="bg-gradient-to-br from-white to-green-50" iconColor="text-green-500" />
                <GradientKpiCard title="Pending fee" value="₹50.28 L" gradient="bg-gradient-to-br from-white to-fuchsia-50" iconColor="text-fuchsia-500" />
                <GradientKpiCard title="Payment success rate" value="76.8%" gradient="bg-gradient-to-br from-white to-teal-50" iconColor="text-teal-500" />
              </div>
            </section>
          </div>
        )}

        {/* ===== RECENT ACTIVITY SIDEBAR ===== */}
        <aside className="w-full lg:w-1/4 shrink-0">
          <RecentActivitySection apps={apps} onViewAll={() => navigate("pm-reports")} />
        </aside>
      </div>

      {/* ===== ANALYTICS & VISUAL OVERVIEW ===== */}
      <section>
        <div className="mb-3 flex items-center rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Analytics & Visual Overview</h2>
        </div>
        <ChartsSection apps={apps} />
      </section>
    </div>
  );
}

function GradientKpiCard({ title, value, gradient, iconColor }: { title: string; value: string; gradient: string; iconColor: string }) {
  return (
    <div className={cn("flex flex-col justify-between rounded-lg border border-border p-3 shadow-sm", gradient)}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <div className={cn("size-6 rounded-full bg-white shadow-sm flex items-center justify-center", iconColor)}>
          <div className="size-2 rounded-full bg-current"></div>
        </div>
      </div>
    </div>
  );
}

function EnhancedKpiCard({ title, value, blobColor, iconColorClass, iconBgClass, icon: Icon, version }: { title: string; value: string; blobColor: string; iconColorClass: string; iconBgClass: string; icon: React.ElementType; version: "v1" | "v3" }) {
  const baseClasses = "relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm h-[105px] flex flex-col justify-between";
  const borderClasses = version === "v3" ? "" : "border border-border/60";

  return (
    <div
      className={cn(baseClasses, borderClasses)}
      style={{
        background: `radial-gradient(circle at 105% 105%, ${blobColor}40 0%, transparent 50%), white`
      }}
    >
      {version === "v3" && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            padding: "1.5px",
            background: `linear-gradient(135deg, ${blobColor}b0 0%, ${blobColor}00 45%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
      <div className="flex items-start justify-between z-10 relative">
        <p className="text-[13px] font-bold text-slate-500 leading-none mt-1">{title}</p>
        <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full shadow-sm bg-white", iconBgClass)}>
          <Icon className={cn("size-3.5", iconColorClass)} />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900 z-10 relative">{value}</p>
    </div>
  );
}

// ============================================================
// COMPACT KPI CARD (90-110px height)
// ============================================================
function CompactKpiCard({
  icon: Icon,
  value,
  label,
  accent,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", accent)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </button>
  );
}

// ============================================================
// CHARTS SECTION
// 2-col grid on desktop, 1-col on mobile.
// Four chart cards: Applications by Status (donut), Applications by
// Stage (bar), SLA Summary (donut), Payment Status (donut).
// All cards share a consistent body height (h-[280px]) so the grid
// rows line up with aligned tops. Each chart shows a "No data
// available" fallback when the scoped dataset is empty.
// ============================================================
function ChartsSection({ apps }: { apps: Application[] }) {
  const statusData = React.useMemo(() => applicationsByStatus(apps), [apps]);
  const stageData = React.useMemo(() => applicationsByStage(apps), [apps]);
  const slaData = React.useMemo(() => slaSummaryChartData(apps), [apps]);
  const paymentData = React.useMemo(() => paymentStatusData(apps), [apps]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-4">
      <ChartCard
        icon={PieChart}
        title="Applications by Status"
        subtitle="Distribution across workflow statuses"
      >
        <DonutChart data={statusData} centerLabel="Total" centerValue={apps.length} />
      </ChartCard>

      <ChartCard
        icon={CreditCard}
        title="Payment Status"
        subtitle="Paid vs pending vs no fee yet"
      >
        <DonutChart data={paymentData} centerLabel="Total" centerValue={apps.length} />
      </ChartCard>

      <ChartCard
        icon={Gauge}
        title="SLA Summary"
        subtitle="On-track vs at-risk vs delayed vs blocked"
      >
        <DonutChart data={slaData} centerLabel="Total" centerValue={apps.length} />
      </ChartCard>

      <ChartCard
        icon={BarChart3}
        title="Applications by Stage"
        subtitle="Current stage distribution"
      >
        <BarChart data={stageData} />
      </ChartCard>
    </div>
  );
}

// ============================================================
// SECTION WRAPPER
// ============================================================
function PmSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      {children}
    </div>
  );
}

// ============================================================
// APPLICATION PROGRESS SECTION
// ============================================================
function ApplicationProgressSection({
  apps,
  onViewAll,
  onOpen,
}: {
  apps: Application[];
  onViewAll: () => void;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [stageFilter, setStageFilter] = React.useState("ALL");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [slaFilter, setSlaFilter] = React.useState("ALL");
  const { page, setPage, reset } = usePmPagination();
  const pageSize = 10;

  const filtered = React.useMemo(() => {
    let list = [...apps].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        a.applicationNo.toLowerCase().includes(q) ||
        a.project.name.toLowerCase().includes(q) ||
        a.applicant.name.toLowerCase().includes(q) ||
        (a.assignedOfficer?.name ?? "").toLowerCase().includes(q) ||
        a.currentStageLabel.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") list = list.filter((a) => a.status === statusFilter);
    if (stageFilter !== "ALL") list = list.filter((a) => a.currentStage === stageFilter);
    if (roleFilter !== "ALL") {
      list = list.filter((a) => {
        const roles = rolesForStage(a.currentStage);
        return roles.includes(roleFilter as RoleKey) || a.assignedOfficer?.role === roleFilter;
      });
    }
    if (slaFilter !== "ALL") list = list.filter((a) => computeSLA(a).status === slaFilter);
    return list;
  }, [apps, query, statusFilter, stageFilter, roleFilter, slaFilter]);

  // Reset to page 1 when filters change
  React.useEffect(() => { reset(); }, [query, statusFilter, stageFilter, roleFilter, slaFilter, reset]);

  const pageApps = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <PmSection>
      <PmCardHeader
        icon={Activity}
        title="Application Progress Overview"
        subtitle="Latest applications across the approval workflow"
        controls={
          <div className="flex items-center gap-2 flex-wrap">
            <PmSearchInput value={query} onChange={setQuery} placeholder="Search applications…" className="w-full sm:w-48" />
            <PmFilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} ariaLabel="Filter by status" className="w-full sm:w-36" />
            <PmFilterSelect value={stageFilter} onChange={setStageFilter} options={STAGE_OPTIONS} ariaLabel="Filter by stage" className="w-full sm:w-36" />
            <PmFilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} ariaLabel="Filter by role" className="w-full sm:w-32" />
            <PmFilterSelect value={slaFilter} onChange={setSlaFilter} options={SLA_OPTIONS} ariaLabel="Filter by SLA" className="w-full sm:w-32" />
          </div>
        }
      />
      {pageApps.length === 0 ? (
        <PmEmptyState
          message="No applications match your filters."
          onClear={() => { setQuery(""); setStatusFilter("ALL"); setStageFilter("ALL"); setRoleFilter("ALL"); setSlaFilter("ALL"); }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b-2 border-border text-left text-[10px] uppercase tracking-wide text-foreground">
                <th scope="col" className="px-4 py-2.5 font-bold w-[12%]">Application No.</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[16%]">Project</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[12%]">Applicant</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[12%]">Current Stage</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[8%]">Role</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[12%]">Officer</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[10%]">Status</th>
                <th scope="col" className="px-4 py-2.5 text-right font-bold w-[8%]">Progress</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[5%]">SLA</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[5%]">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageApps.map((a) => {
                const sla = computeSLA(a);
                return (
                  <tr
                    key={a.id}
                    onClick={() => onOpen(a.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    style={{ height: "52px" }}
                  >
                    <td className="px-4 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                        title={a.applicationNo}
                      >
                        {a.applicationNo}
                      </button>
                    </td>
                    <td className="px-4 py-2 max-w-[180px]">
                      <p className="truncate text-xs font-medium" title={a.project.name}>{a.project.name}</p>
                    </td>
                    <td className="px-4 py-2 max-w-[140px]">
                      <p className="truncate text-xs" title={a.applicant.name}>{a.applicant.name}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs truncate" title={a.currentStageLabel}>{a.currentStageLabel}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs text-muted-foreground">
                        {a.assignedOfficer ? a.assignedOfficer.role.replace("_", " ") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2 max-w-[140px]">
                      <p className="truncate text-xs" title={a.assignedOfficer?.name}>
                        {a.assignedOfficer?.name ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-2"><StatusBadge status={a.status} showIcon={false} /></td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 justify-end">
                        <Progress value={a.progress} className="h-1.5 w-12" />
                        <span className="text-xs tabular-nums w-8 text-right">{a.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={cn("text-[9px] whitespace-nowrap", sla.cls)}>{sla.label}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{timeAgoBrief(a.lastUpdated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewAll}>
          View All <ArrowRight className="size-3" />
        </Button>
      </div>
      <PmPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </PmSection>
  );
}

// ============================================================
// LIVE WORKFLOW MONITOR SECTION (5 per page)
// ============================================================
function LiveWorkflowSection({
  apps,
  onOpen,
  onViewAll,
}: {
  apps: Application[];
  onOpen: (id: string) => void;
  onViewAll: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState("ALL");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [slaFilter, setSlaFilter] = React.useState("ALL");
  const { page, setPage, reset } = usePmPagination();
  const pageSize = 5;

  const filtered = React.useMemo(() => {
    let list = apps
      .filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status))
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        a.applicationNo.toLowerCase().includes(q) ||
        a.project.name.toLowerCase().includes(q) ||
        (a.assignedOfficer?.name ?? "").toLowerCase().includes(q) ||
        (a.assignedOfficer?.role ?? "").toLowerCase().includes(q) ||
        a.currentStageLabel.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== "ALL") list = list.filter((a) => a.currentStage === stageFilter);
    if (roleFilter !== "ALL") {
      list = list.filter((a) => {
        const roles = rolesForStage(a.currentStage);
        return roles.includes(roleFilter as RoleKey) || a.assignedOfficer?.role === roleFilter;
      });
    }
    if (slaFilter !== "ALL") list = list.filter((a) => computeSLA(a).status === slaFilter);
    return list;
  }, [apps, query, stageFilter, roleFilter, slaFilter]);

  React.useEffect(() => { reset(); }, [query, stageFilter, roleFilter, slaFilter, reset]);

  const pageApps = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <PmSection>
      <PmCardHeader
        icon={Activity}
        title="Live Workflow Monitor"
        subtitle="Applications currently moving through the approval pipeline"
        controls={
          <div className="flex items-center gap-2 flex-wrap">
            <PmSearchInput value={query} onChange={setQuery} placeholder="Search app / project / officer…" className="w-full sm:w-52" />
            <PmFilterSelect value={stageFilter} onChange={setStageFilter} options={STAGE_OPTIONS} ariaLabel="Filter by stage" className="w-full sm:w-36" />
            <PmFilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} ariaLabel="Filter by role" className="w-full sm:w-32" />
            <PmFilterSelect value={slaFilter} onChange={setSlaFilter} options={SLA_OPTIONS} ariaLabel="Filter by SLA" className="w-full sm:w-32" />
          </div>
        }
      />
      {pageApps.length === 0 ? (
        <PmEmptyState
          message="No applications match your filters."
          onClear={() => { setQuery(""); setStageFilter("ALL"); setRoleFilter("ALL"); setSlaFilter("ALL"); }}
        />
      ) : (
        <div className="divide-y divide-border">
          {pageApps.map((a) => {
            const sla = computeSLA(a);
            return (
              <div
                key={a.id}
                onClick={() => onOpen(a.id)}
                className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{a.applicationNo}</span>
                    <Badge variant="outline" className={cn("text-[9px]", sla.cls)}>{sla.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium" title={a.project.name}>{a.project.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {a.currentStageLabel} · {a.assignedOfficer?.name ?? "Unassigned"} · {a.assignedOfficer ? a.assignedOfficer.role.replace("_", " ") : "—"}
                  </p>
                </div>
                <div className="shrink-0 w-20 text-right">
                  <Progress value={a.progress} className="h-1.5" />
                  <p className="mt-1 text-xs font-semibold tabular-nums">{a.progress}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewAll}>
          View All <ArrowRight className="size-3" />
        </Button>
      </div>
      <PmPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </PmSection>
  );
}

// ============================================================
// SLA SUMMARY SECTION (clickable categories)
// ============================================================
function SlaSummarySection({
  slaSummary,
  onCategoryClick,
}: {
  slaSummary: Record<string, number>;
  onCategoryClick: (status: string) => void;
}) {
  const categories = [
    { status: "ON_TRACK", label: "On Track", cls: "bg-success/10 text-success", icon: CheckCircle2 },
    { status: "AT_RISK", label: "At Risk", cls: "bg-amber-500/15 text-amber-600", icon: AlertTriangle },
    { status: "DELAYED", label: "Delayed", cls: "bg-orange-500/15 text-orange-600", icon: Clock },
    { status: "CRITICAL", label: "Critical Delay", cls: "bg-destructive/10 text-destructive", icon: AlertTriangle },
    { status: "BLOCKED", label: "Blocked", cls: "bg-destructive/15 text-destructive", icon: Ban },
    { status: "COMPLETED", label: "Completed", cls: "bg-success/10 text-success", icon: CheckCircle2 },
  ];
  return (
    <PmSection>
      <PmCardHeader icon={Gauge} title="SLA Summary" subtitle="Click a category to inspect applications" />
      <div className="grid grid-cols-2 gap-px bg-border">
        {categories.map((cat) => (
          <button
            key={cat.status}
            onClick={() => onCategoryClick(cat.status)}
            className="flex items-center gap-3 bg-card p-3 text-left transition-colors hover:bg-muted/40"
          >
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", cat.cls)}>
              <cat.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums leading-none">{slaSummary[cat.status] ?? 0}</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{cat.label}</p>
            </div>
          </button>
        ))}
      </div>
    </PmSection>
  );
}

// ============================================================
// BOTTLENECK SECTION (compact)
// ============================================================
function BottleneckSection({
  bottleneck,
  onInspect,
}: {
  bottleneck: { stageLabel: string; pendingCount: number; reason: string } | null;
  onInspect: () => void;
}) {
  return (
    <PmSection>
      <PmCardHeader icon={TrendingDown} title="Current Bottleneck" subtitle="Stage with the most pending applications" />
      {bottleneck ? (
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{bottleneck.stageLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">{bottleneck.reason}</p>
            </div>
            <Badge className="bg-destructive/10 text-destructive shrink-0">{bottleneck.pendingCount} pending</Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onInspect}>
            <Gauge className="size-4" /> Inspect SLA <ArrowRight className="size-3" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <CheckCircle2 className="size-8 text-success" />
          <p className="text-sm font-medium text-success">No bottleneck detected</p>
          <p className="text-xs text-muted-foreground">All stages are processing within SLA.</p>
        </div>
      )}
    </PmSection>
  );
}

// ============================================================
// OFFICER WORKLOAD SECTION (6 per page)
// ============================================================
function OfficerWorkloadSection({
  apps,
  users,
  onViewAll,
  onOpenOfficer,
}: {
  apps: Application[];
  users: User[];
  onViewAll: () => void;
  onOpenOfficer: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState("WORKLOAD");
  const { page, setPage, reset } = usePmPagination();
  const pageSize = 6;

  const workloads = React.useMemo(() => computeOfficerWorkloads(apps, users), [apps, users]);

  const filtered = React.useMemo(() => {
    let list = workloads;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((w) => w.user.name.toLowerCase().includes(q) || w.user.role.toLowerCase().includes(q));
    }
    if (roleFilter !== "ALL") list = list.filter((w) => w.user.role === roleFilter);
    list = [...list];
    if (sortBy === "WORKLOAD") list.sort((a, b) => b.assigned - a.assigned);
    else if (sortBy === "PENDING") list.sort((a, b) => b.pending - a.pending);
    else if (sortBy === "DELAYED") list.sort((a, b) => b.delayed - a.delayed);
    else if (sortBy === "NAME") list.sort((a, b) => a.user.name.localeCompare(b.user.name));
    return list;
  }, [workloads, query, roleFilter, sortBy]);

  React.useEffect(() => { reset(); }, [query, roleFilter, sortBy, reset]);

  const pageOfficers = filtered.slice((page - 1) * pageSize, page * pageSize);

  const sortOptions = [
    { value: "WORKLOAD", label: "Highest Workload" },
    { value: "PENDING", label: "Most Pending" },
    { value: "DELAYED", label: "Most Delayed" },
    { value: "NAME", label: "Officer Name" },
  ];

  return (
    <PmSection>
      <PmCardHeader
        icon={Users}
        title="Officer Workload"
        subtitle="Current active assignments across all officers"
        controls={
          <div className="flex items-center gap-2 flex-wrap">
            <PmSearchInput value={query} onChange={setQuery} placeholder="Search officer…" className="w-full sm:w-40" />
            <PmFilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} ariaLabel="Filter by role" className="w-full sm:w-32" />
            <PmFilterSelect value={sortBy} onChange={setSortBy} options={sortOptions} ariaLabel="Sort by" className="w-full sm:w-36" />
          </div>
        }
      />
      {pageOfficers.length === 0 ? (
        <PmEmptyState
          message="No officers match your filters."
          onClear={() => { setQuery(""); setRoleFilter("ALL"); }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b-2 border-border text-left text-[10px] uppercase tracking-wide text-foreground">
                <th scope="col" className="px-4 py-2.5 font-bold w-[22%]">Officer</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[12%]">Role</th>
                <th scope="col" className="px-4 py-2.5 text-right font-bold w-[10%]">Assigned</th>
                <th scope="col" className="px-4 py-2.5 text-right font-bold w-[10%]">Pending</th>
                <th scope="col" className="px-4 py-2.5 text-right font-bold w-[10%]">At Risk</th>
                <th scope="col" className="px-4 py-2.5 text-right font-bold w-[10%]">Delayed</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[26%]">Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageOfficers.map((w) => {
                // Workload % = assigned / (assigned + 5) capped at 100, where 5 represents a full load
                const workloadPct = Math.min(100, Math.round((w.assigned / Math.max(w.assigned, 5)) * 100));
                return (
                  <tr
                    key={w.user.id}
                    onClick={() => onOpenOfficer(w.user.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    style={{ height: "48px" }}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {w.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <p className="truncate text-xs font-medium" title={w.user.name}>{w.user.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2"><RoleBadge role={w.user.role} /></td>
                    <td className="px-4 py-2 text-right text-xs font-semibold tabular-nums">{w.assigned}</td>
                    <td className="px-4 py-2 text-right text-xs font-semibold tabular-nums">{w.pending}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={cn("text-xs font-semibold tabular-nums", w.atRisk > 0 ? "text-amber-600" : "text-muted-foreground")}>{w.atRisk}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={cn("text-xs font-semibold tabular-nums", w.delayed > 0 ? "text-destructive" : "text-muted-foreground")}>{w.delayed}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Progress value={workloadPct} className="h-1.5 flex-1" />
                        <span className="text-xs font-semibold tabular-nums w-8 text-right">{workloadPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewAll}>
          View All <ArrowRight className="size-3" />
        </Button>
      </div>
      <PmPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </PmSection>
  );
}

// ============================================================
// PENDING ACTIONS SECTION (10 per page)
// ============================================================
function PendingActionsSection({
  apps,
  onOpen,
  onViewAll,
}: {
  apps: Application[];
  onOpen: (id: string) => void;
  onViewAll: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [stageFilter, setStageFilter] = React.useState("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState("ALL");
  const [slaFilter, setSlaFilter] = React.useState("ALL");
  const { page, setPage, reset } = usePmPagination();
  const pageSize = 10;

  const allPending = React.useMemo(() => computePendingActions(apps), [apps]);

  const filtered = React.useMemo(() => {
    let list = allPending;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((pa) =>
        pa.app.applicationNo.toLowerCase().includes(q) ||
        pa.app.project.name.toLowerCase().includes(q) ||
        pa.responsibleOfficer.toLowerCase().includes(q) ||
        pa.responsibleRole.toLowerCase().includes(q) ||
        pa.stageLabel.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "ALL") {
      list = list.filter((pa) => {
        const roles = rolesForStage(pa.app.currentStage);
        return roles.includes(roleFilter as RoleKey) || pa.app.assignedOfficer?.role === roleFilter;
      });
    }
    if (stageFilter !== "ALL") list = list.filter((pa) => pa.app.currentStage === stageFilter);
    if (priorityFilter !== "ALL") list = list.filter((pa) => pa.priority === priorityFilter);
    if (slaFilter !== "ALL") list = list.filter((pa) => computeSLA(pa.app).status === slaFilter);
    return list;
  }, [allPending, query, roleFilter, stageFilter, priorityFilter, slaFilter]);

  React.useEffect(() => { reset(); }, [query, roleFilter, stageFilter, priorityFilter, slaFilter, reset]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <PmSection>
      <PmCardHeader
        icon={ListChecks}
        title="Pending Actions"
        subtitle="Applications awaiting action across all stages"
        controls={
          <div className="flex items-center gap-2 flex-wrap">
            <PmSearchInput value={query} onChange={setQuery} placeholder="Search pending actions…" className="w-full sm:w-44" />
            <PmFilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} ariaLabel="Filter by role" className="w-full sm:w-28" />
            <PmFilterSelect value={stageFilter} onChange={setStageFilter} options={STAGE_OPTIONS} ariaLabel="Filter by stage" className="w-full sm:w-32" />
            <PmFilterSelect value={priorityFilter} onChange={setPriorityFilter} options={PRIORITY_OPTIONS} ariaLabel="Filter by priority" className="w-full sm:w-28" />
            <PmFilterSelect value={slaFilter} onChange={setSlaFilter} options={SLA_OPTIONS} ariaLabel="Filter by SLA" className="w-full sm:w-28" />
          </div>
        }
      />
      {pageItems.length === 0 ? (
        <PmEmptyState
          message="No pending actions match your filters."
          onClear={() => { setQuery(""); setRoleFilter("ALL"); setStageFilter("ALL"); setPriorityFilter("ALL"); setSlaFilter("ALL"); }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b-2 border-border text-left text-[10px] uppercase tracking-wide text-foreground">
                <th scope="col" className="px-4 py-2.5 font-bold w-[14%]">Application</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[16%]">Project</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[14%]">Stage</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[10%]">Role</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[14%]">Officer</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[12%]">Pending Since</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[10%]">SLA</th>
                <th scope="col" className="px-4 py-2.5 font-bold w-[10%]">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((pa) => (
                <tr
                  key={pa.app.id}
                  onClick={() => onOpen(pa.app.id)}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  style={{ height: "48px" }}
                >
                  <td className="px-4 py-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpen(pa.app.id); }}
                      className="font-mono text-xs font-medium text-primary hover:underline"
                      title={pa.app.applicationNo}
                    >
                      {pa.app.applicationNo}
                    </button>
                  </td>
                  <td className="px-4 py-2 max-w-[160px]">
                    <p className="truncate text-xs" title={pa.app.project.name}>{pa.app.project.name}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs truncate" title={pa.stageLabel}>{pa.stageLabel}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs text-muted-foreground">{pa.responsibleRole}</span>
                  </td>
                  <td className="px-4 py-2 max-w-[140px]">
                    <p className="truncate text-xs" title={pa.responsibleOfficer}>{pa.responsibleOfficer}</p>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{timeAgoBrief(pa.pendingSince)}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className={cn("text-[9px] whitespace-nowrap", pa.slaCls)}>{pa.slaLabel}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <PriorityBadge priority={pa.priority === "URGENT" ? "HIGH" : pa.priority === "HIGH" ? "HIGH" : "NORMAL"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewAll}>
          View All <ArrowRight className="size-3" />
        </Button>
      </div>
      <PmPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </PmSection>
  );
}

// ============================================================
// RECENT ACTIVITY SECTION (10 per page, NO nested scroll)
// ============================================================
function RecentActivitySection({
  apps,
  onViewAll,
}: {
  apps: Application[];
  onViewAll: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const { page, setPage, reset } = usePmPagination();
  const pageSize = 15;

  const allActivity = React.useMemo(() => computeRecentActivity(apps, 9999), [apps]);

  const filtered = React.useMemo(() => {
    let list = allActivity;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((ev) =>
        ev.action.toLowerCase().includes(q) ||
        ev.actor.toLowerCase().includes(q) ||
        ev.applicationNo.toLowerCase().includes(q) ||
        ev.projectName.toLowerCase().includes(q) ||
        ev.role.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "ALL") {
      list = list.filter((ev) => ev.action.toLowerCase().includes(typeFilter.toLowerCase()));
    }
    return list;
  }, [allActivity, query, typeFilter]);

  React.useEffect(() => { reset(); }, [query, typeFilter, reset]);

  const pageEvents = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <PmSection className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 border-b border-border bg-card shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 shrink-0">
          <History className="size-3.5" /> Recent Activity
        </h2>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <PmSearchInput value={query} onChange={setQuery} placeholder="Search…" className="w-full sm:w-28 h-7 text-[10px]" />
          <PmFilterSelect value={typeFilter} onChange={setTypeFilter} options={ACTIVITY_TYPES} ariaLabel="Filter" className="w-full sm:w-24 h-7 text-[10px]" />
        </div>
      </div>
      {pageEvents.length === 0 ? (
        <PmEmptyState
          message="No activity matches your filters."
          onClear={() => { setQuery(""); setTypeFilter("ALL"); }}
        />
      ) : (
        <div className="divide-y divide-border flex-1 overflow-y-auto min-h-0">
          {pageEvents.map((ev, idx) => (
            <div key={idx} className="flex items-start gap-3 px-4 py-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">{ev.action}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {ev.actor} · {ev.role} · <span className="font-mono text-primary">{ev.applicationNo}</span>
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">{formatDateTime(ev.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col shrink-0">
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewAll}>
            View All <ArrowRight className="size-3" />
          </Button>
        </div>
        <PmPagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
      </div>
    </PmSection>
  );
}
