"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import { WORKFLOW_STAGES } from "@/data/workflow-config";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import {
  StatusBadge,
  PriorityBadge,
  RoleBadge,
} from "@/components/design-system/badges";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  ArrowRight,
  ChevronRight,
  CalendarClock,
  LayoutDashboard,
  ListChecks,
  Inbox,
  FileSearch,
  PieChart,
  BarChart3,
  Gauge,
  XCircle,
} from "lucide-react";
import type { RoleKey, WorkflowStageKey } from "@/types";
import {
  useDashboardScope,
  computeScopedKpis,
  applicationsByStatus,
  applicationsByStage,
  slaSummary,
  scrutinyResultsData,
} from "@/components/dashboard/dashboard-scope";
import {
  DonutChart,
  BarChart,
  ChartCard,
} from "@/components/dashboard/charts";

// ============================================================
// Officer Dashboard (role-specific)
//
// All officers (TPS / TPA / ZAD / ZDD / ZJD / Director /
// Addl. Commissioner / Commissioner) share this dashboard, but
// each role sees its OWN KPIs + charts derived from the scoped
// dataset returned by useDashboardScope().
//
// Layout:
//   1. PageHeader — role-aware title ("TPS Dashboard", etc.)
//   2. KPI Cards — 4-col grid, role-specific
//   3. Charts — 2-col grid (status donut, stage bar, optional
//      scrutiny donut for TPS, SLA donut)
//   4. Assigned Applications — sorted priority queue with
//      "Open Review" navigation action
//
// READ-ONLY: no approve / reject / verify / pay actions here.
// Officers perform workflow actions on the Review page.
// ============================================================

// ---------- Helpers ----------
function daysRemaining(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function slaTone(days: number | null): { cls: string; label: string } {
  if (days === null) return { cls: "text-muted-foreground", label: "—" };
  if (days < 0) return { cls: "text-destructive font-semibold", label: `Overdue ${Math.abs(days)}d` };
  if (days <= 3) return { cls: "text-destructive font-semibold", label: `${days}d left` };
  if (days <= 7) return { cls: "text-amber-600 dark:text-amber-400 font-semibold", label: `${days}d left` };
  return { cls: "text-success font-medium", label: `${days}d left` };
}

// Role-specific KPI definition (one row in the KPI grid)
type KpiAccent = "primary" | "success" | "warning" | "info" | "destructive" | "amber";
interface KpiDef {
  label: string;
  value: number;
  icon: typeof ClipboardCheck;
  accent: KpiAccent;
  onClick?: () => void;
}

const OFFICER_REVIEW_STAGES: WorkflowStageKey[] = [
  "TPS_TECHNICAL_SCRUTINY",
  "TPA_REVIEW",
  "ZAD_ZDD_REVIEW",
  "ZJD_REVIEW",
  "DIRECTOR_DP_REVIEW",
  "ADDITIONAL_COMMISSIONER_REVIEW",
  "COMMISSIONER_REVIEW",
  "FINAL_DECISION",
];

export function OfficerDashboard() {
  const { user, navigate, openApplication } = useAppStore();
  const scope = useDashboardScope();
  const role: RoleKey = scope.role;

  // ---- Base scoped KPIs (single source of truth) ----
  const baseKpis = React.useMemo(
    () => computeScopedKpis(scope.applications),
    [scope.applications]
  );

  // ---- Role-specific KPI definitions ----
  // Each role shows a different set of 4 KPIs derived from the scoped apps.
  const kpis: KpiDef[] = React.useMemo(() => {
    if (!user) return [];

    const atRisk = baseKpis.atRisk;
    const openShortfalls = baseKpis.openShortfalls;
    const approved = baseKpis.approved;
    const rejected = baseKpis.rejected;
    const delayed = baseKpis.delayed;

    // Apps currently sitting at the given workflow stage (excludes
    // APPROVED / REJECTED — those are no longer pending at a stage).
    const atStage = (stage: WorkflowStageKey) =>
      scope.applications.filter(
        (a) =>
          a.currentStage === stage &&
          a.status !== "APPROVED" &&
          a.status !== "REJECTED"
      ).length;

    // Count of COMPLETED workflow-history entries performed by THIS officer
    // (user-level match on name + role) — represents the officer's own
    // completed actions across all apps in their scope.
    const myCompletedActions = scope.applications.reduce(
      (sum, a) =>
        sum +
        a.workflowHistory.filter(
          (w) =>
            w.status === "COMPLETED" &&
            w.actor.name === user.name &&
            w.actor.role === user.role
        ).length,
      0
    );

    switch (role) {
      case "TPS":
        return [
          {
            label: "Assigned Applications",
            value: scope.applications.length,
            icon: ClipboardCheck,
            accent: "primary",
            onClick: () => navigate("officer-applications"),
          },
          {
            label: "Pending Scrutiny",
            value: atStage("TPS_TECHNICAL_SCRUTINY"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Completed Scrutiny",
            value: myCompletedActions,
            icon: CheckCircle2,
            accent: "success",
          },
          {
            label: "SLA At Risk",
            value: atRisk,
            icon: AlertTriangle,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
        ];
      case "TPA":
        return [
          {
            label: "Pending Reviews",
            value: atStage("TPA_REVIEW"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Completed Reviews",
            value: myCompletedActions,
            icon: CheckCircle2,
            accent: "success",
          },
          {
            label: "Open Shortfalls",
            value: openShortfalls,
            icon: FileWarning,
            accent: "warning",
          },
          {
            label: "SLA At Risk",
            value: atRisk,
            icon: AlertTriangle,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
        ];
      case "ZAD":
      case "ZDD":
        return [
          {
            label: "Pending Approvals",
            value: atStage("ZAD_ZDD_REVIEW"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Open Shortfalls",
            value: openShortfalls,
            icon: FileWarning,
            accent: "warning",
          },
          {
            label: "SLA At Risk",
            value: atRisk,
            icon: AlertTriangle,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
          {
            label: "Completed Reviews",
            value: myCompletedActions,
            icon: CheckCircle2,
            accent: "success",
          },
        ];
      case "ZJD":
        return [
          {
            label: "Pending Decisions",
            value: atStage("ZJD_REVIEW"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Open Shortfalls",
            value: openShortfalls,
            icon: FileWarning,
            accent: "warning",
          },
          {
            label: "SLA At Risk",
            value: atRisk,
            icon: AlertTriangle,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
          {
            label: "Completed Decisions",
            value: myCompletedActions,
            icon: CheckCircle2,
            accent: "success",
          },
        ];
      case "DIRECTOR_DP":
        return [
          {
            label: "Pending Decisions",
            value: atStage("DIRECTOR_DP_REVIEW"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Open Shortfalls",
            value: openShortfalls,
            icon: FileWarning,
            accent: "warning",
          },
          {
            label: "SLA At Risk",
            value: atRisk,
            icon: AlertTriangle,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
          {
            label: "Approved",
            value: approved,
            icon: CheckCircle2,
            accent: "success",
          },
        ];
      case "ADDL_COMMISSIONER":
        return [
          {
            label: "Pending Reviews",
            value: atStage("ADDITIONAL_COMMISSIONER_REVIEW"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Approved",
            value: approved,
            icon: CheckCircle2,
            accent: "success",
          },
          {
            label: "Rejected",
            value: rejected,
            icon: XCircle,
            accent: "destructive",
          },
          {
            label: "SLA At Risk",
            value: atRisk,
            icon: AlertTriangle,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
        ];
      case "COMMISSIONER":
        return [
          {
            label: "Pending Final Decisions",
            value:
              atStage("COMMISSIONER_REVIEW") + atStage("FINAL_DECISION"),
            icon: Clock,
            accent: "info",
          },
          {
            label: "Approved",
            value: approved,
            icon: CheckCircle2,
            accent: "success",
          },
          {
            label: "Rejected",
            value: rejected,
            icon: XCircle,
            accent: "destructive",
          },
          {
            label: "Delayed",
            value: delayed,
            icon: CalendarClock,
            accent: "amber",
            onClick: () => navigate("officer-applications"),
          },
        ];
      default:
        return [];
    }
  }, [role, scope.applications, baseKpis, user, navigate]);

  // ---- Chart data (scoped) ----
  const statusData = React.useMemo(
    () => applicationsByStatus(scope.applications),
    [scope.applications]
  );
  const stageData = React.useMemo(
    () => applicationsByStage(scope.applications),
    [scope.applications]
  );
  const slaData = React.useMemo(
    () => slaSummary(scope.applications),
    [scope.applications]
  );
  const scrutinyData = React.useMemo(
    () => scrutinyResultsData(scope.applications),
    [scope.applications]
  );

  const totalApps = scope.applications.length;
  const totalSla = slaData.reduce((s, d) => s + d.value, 0);
  const totalScrutiny = scrutinyData.reduce((s, d) => s + d.value, 0);

  // ---- Assigned Applications (priority queue) ----
  // Uses scope.applications (assigned-to-me + apps where I acted) instead
  // of the old useAssignedApplications() selector — this gives a richer,
  // scope-aware view.
  const priorityQueue = React.useMemo(() => {
    return [...scope.applications].sort((a, b) => {
      // Urgent first, then HIGH, then NORMAL
      const pa = a.priority === "URGENT" ? 0 : a.priority === "HIGH" ? 1 : 2;
      const pb = b.priority === "URGENT" ? 0 : b.priority === "HIGH" ? 1 : 2;
      if (pa !== pb) return pa - pb;
      // Then by SLA proximity (closest first)
      const sa = daysRemaining(a.expectedSLA) ?? 9999;
      const sb = daysRemaining(b.expectedSLA) ?? 9999;
      return sa - sb;
    });
  }, [scope.applications]);

  // Currently in-review apps = subset of priority queue that's sitting at
  // one of the officer review stages. Shown as the primary list.
  const inReviewApps = React.useMemo(
    () =>
      priorityQueue.filter(
        (a) =>
          OFFICER_REVIEW_STAGES.includes(a.currentStage) &&
          a.status !== "APPROVED" &&
          a.status !== "REJECTED"
      ),
    [priorityQueue]
  );

  if (!user) return null;

  const roleTitle = ROLES[role]?.title ?? "Officer";
  const roleFullName = ROLES[role]?.fullName ?? "Officer";
  const dashboardTitle = `${roleTitle} Dashboard`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dashboardTitle}
        description={`Welcome, ${user.name}. Here is your review pipeline at a glance — ${roleFullName}.`}
        icon={LayoutDashboard}
        breadcrumbs={[
          { label: "Officer Workspace", onClick: () => navigate("officer-dashboard") },
          { label: "Dashboard" },
        ]}
        badge={<RoleBadge role={role} label={roleTitle} />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("officer-applications")}>
              <ClipboardCheck className="size-4" /> Assigned Queue
            </Button>
            <Button size="sm" onClick={() => navigate("officer-review")}>
              <FileSearch className="size-4" /> Open Review
            </Button>
          </>
        }
      />

      {/* ===== KPI Cards — 1-col mobile → 2-col tablet → 4-col desktop ===== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <StatCard
            key={`${kpi.label}-${i}`}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            accent={kpi.accent}
            onClick={kpi.onClick}
          />
        ))}
      </div>

      {/* ===== Charts — 1-col mobile → 2-col desktop ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          icon={PieChart}
          title="Applications by Status"
          subtitle="Distribution across all status categories in your scope"
        >
          <DonutChart
            data={statusData}
            centerLabel="Total"
            centerValue={totalApps}
          />
        </ChartCard>

        <ChartCard
          icon={BarChart3}
          title="Applications by Stage"
          subtitle="Current workflow stage distribution"
        >
          <BarChart data={stageData} />
        </ChartCard>

        {/* TPS-only: scrutiny results donut */}
        {role === "TPS" && (
          <ChartCard
            icon={CheckCircle2}
            title="Scrutiny Results"
            subtitle="Passed · failed · pending scrutiny reports"
          >
            <DonutChart
              data={scrutinyData}
              centerLabel="Reports"
              centerValue={totalScrutiny}
            />
          </ChartCard>
        )}

        <ChartCard
          icon={Gauge}
          title="SLA Summary"
          subtitle="On-track · at-risk · delayed · blocked · completed"
        >
          <DonutChart
            data={slaData}
            centerLabel="Apps"
            centerValue={totalSla}
          />
        </ChartCard>
      </div>

      {/* ===== Assigned Applications (priority queue) ===== */}
      <SectionCard
        title="Assigned Applications"
        description="Applications assigned to your role — sorted by priority and SLA urgency"
        icon={ListChecks}
        action={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigate("officer-applications")}
          >
            View all <ChevronRight className="size-3.5" />
          </Button>
        }
        noPadding
      >
        {inReviewApps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title="No applications pending at your stage"
              description="When an application reaches your review stage in the approval workflow, it will appear here automatically."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("officer-applications")}
                >
                  Browse all applications
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {inReviewApps.slice(0, 8).map((a) => {
              const days = daysRemaining(a.expectedSLA);
              const sla = slaTone(days);
              const stage = WORKFLOW_STAGES.find((s) => s.key === a.currentStage);
              return (
                <li key={a.id}>
                  <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          a.priority === "URGENT"
                            ? "bg-destructive/10 text-destructive"
                            : a.priority === "HIGH"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <ClipboardCheck className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => openApplication(a.id, "officer-review")}
                            className="font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            {a.applicationNo}
                          </button>
                          <StatusBadge status={a.status} showIcon={false} />
                          <PriorityBadge priority={a.priority} />
                        </div>
                        <p className="truncate text-sm font-medium">{a.project.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.project.propertyType.replace("_", " ").toLowerCase()} · {a.project.ward} · via {a.ltpName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className={cn("size-3.5", sla.cls)} />
                        <span className={cn("text-xs tabular-nums", sla.cls)}>
                          {sla.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden text-[10px] text-muted-foreground sm:inline">
                          {stage?.label ?? a.currentStageLabel}
                        </span>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openApplication(a.id, "officer-review")}
                        >
                          Open review <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
