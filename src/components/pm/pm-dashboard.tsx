"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  useAllApplications,
  useAllUsers,
  computeSLA,
  computeOfficerWorkloads,
  identifyBottleneck,
  computePendingActions,
  computeRecentActivity,
  timeAgoBrief,
} from "@/components/pm/pm-helpers";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  StatCard,
} from "@/components/design-system/layout";
import {
  StatusBadge,
  RoleBadge,
  PriorityBadge,
} from "@/components/design-system/badges";
import { formatDateTime } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  FileStack,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
  Timer,
  Gauge,
  ArrowRight,
  ChevronRight,
  Ban,
  ListChecks,
  History,
  CircleDot,
} from "lucide-react";

// ============================================================
// PROJECT MANAGER DASHBOARD
// Central operational view — READ-ONLY monitoring.
// No edit/approve/reject/verify/pay buttons anywhere.
// ============================================================

export function PmDashboard() {
  const navigate = useAppStore((s) => s.navigate);
  const openApplication = useAppStore((s) => s.openApplication);

  const apps = useAllApplications();
  const users = useAllUsers();

  // ---- KPI counts derived from the shared applications dataset ----
  const kpis = React.useMemo(() => {
    const total = apps.length;
    const inProgress = apps.filter(
      (a) =>
        !["APPROVED", "REJECTED", "DRAFT"].includes(a.status)
    ).length;
    const approved = apps.filter((a) => a.status === "APPROVED").length;
    const delayedAtRisk = apps.filter((a) => {
      const sla = computeSLA(a);
      return (
        sla.status === "DELAYED" ||
        sla.status === "CRITICAL" ||
        sla.status === "AT_RISK" ||
        sla.status === "BLOCKED"
      );
    }).length;
    return { total, inProgress, approved, delayedAtRisk };
  }, [apps]);

  // ---- Application Progress Overview (max 10 rows) ----
  const overviewApps = React.useMemo(
    () =>
      [...apps]
        .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
        .slice(0, 10),
    [apps]
  );

  // ---- Live Workflow Monitor: 5 most-recently-updated non-completed apps ----
  const liveApps = React.useMemo(
    () =>
      apps
        .filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status))
        .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
        .slice(0, 5),
    [apps]
  );

  // ---- SLA Summary counts (across all apps) ----
  const slaSummary = React.useMemo(() => {
    const counts: Record<
      "ON_TRACK" | "AT_RISK" | "DELAYED" | "CRITICAL" | "BLOCKED",
      number
    > = {
      ON_TRACK: 0,
      AT_RISK: 0,
      DELAYED: 0,
      CRITICAL: 0,
      BLOCKED: 0,
    };
    apps.forEach((a) => {
      const sla = computeSLA(a);
      if (sla.status === "COMPLETED") return;
      if (sla.status in counts) counts[sla.status as keyof typeof counts]++;
    });
    return counts;
  }, [apps]);

  // ---- Officer workload ----
  const officerWorkloads = React.useMemo(
    () => computeOfficerWorkloads(apps, users).slice(0, 6),
    [apps, users]
  );

  // ---- Bottleneck ----
  const bottleneck = React.useMemo(() => identifyBottleneck(apps), [apps]);

  // ---- Pending Actions (top 5) ----
  const pendingActions = React.useMemo(
    () => computePendingActions(apps).slice(0, 5),
    [apps]
  );

  // ---- Recent Activity (15 events) ----
  const recentActivity = React.useMemo(
    () => computeRecentActivity(apps, 15),
    [apps]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Manager Dashboard"
        description="Central operational view of the building permit approval workflow."
        icon={BarChart3}
        breadcrumbs={[
          { label: "Project Manager" },
          { label: "Dashboard" },
        ]}
      />

      {/* ===== KPI CARDS (4-col grid) ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={kpis.total}
          icon={FileStack}
          accent="primary"
          onClick={() => navigate("pm-applications")}
        />
        <StatCard
          label="In Progress"
          value={kpis.inProgress}
          icon={Clock}
          accent="info"
          onClick={() => navigate("pm-applications")}
        />
        <StatCard
          label="Approved"
          value={kpis.approved}
          icon={CheckCircle2}
          accent="success"
          onClick={() => navigate("pm-applications")}
        />
        <StatCard
          label="Delayed / At Risk"
          value={kpis.delayedAtRisk}
          icon={AlertTriangle}
          accent="destructive"
          onClick={() => navigate("pm-sla")}
        />
      </div>

      {/* ===== Application Progress Overview (full-width table) ===== */}
      <SectionCard
        title="Application Progress Overview"
        description="Latest applications across the workflow"
        icon={Activity}
        noPadding
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => navigate("pm-applications")}
          >
            View all <ArrowRight className="size-3" />
          </Button>
        }
      >
        {overviewApps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileStack}
              title="No applications found"
              description="Applications will appear here once they are created."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Application progress overview
              </caption>
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                <tr className="border-b-2 border-border text-left text-[11px] uppercase tracking-wide text-foreground">
                  <th scope="col" className="px-4 py-3 font-bold">
                    Application No.
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Project
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Applicant
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Current Stage
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Assigned Role
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Assigned Officer
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Progress
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    SLA
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overviewApps.map((a) => {
                  const sla = computeSLA(a);
                  return (
                    <tr
                      key={a.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() =>
                        openApplication(a.id, "pm-application-details")
                      }
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openApplication(a.id, "pm-application-details");
                          }}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {a.applicationNo}
                        </button>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="truncate text-xs font-medium">
                          {a.project.name}
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="truncate text-xs">{a.applicant.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{a.currentStageLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        {a.assignedOfficer ? (
                          <RoleBadge role={a.assignedOfficer.role} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">
                          {a.assignedOfficer?.name ?? "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} showIcon={false} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Progress
                            value={a.progress}
                            className="h-1.5 w-16"
                          />
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {a.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SlaBadge label={sla.label} cls={sla.cls} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgoBrief(a.lastUpdated)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ===== ROW: Live Workflow Monitor (LEFT, span-2) + SLA Summary (RIGHT) ===== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <SectionCard
          title="Live Workflow Monitor"
          description="Most recently updated active applications"
          icon={Activity}
          className="xl:col-span-2"
        >
          {liveApps.length === 0 ? (
            <EmptyState
              icon={CircleDot}
              title="No active applications"
              description="All applications are currently completed or in draft."
            />
          ) : (
            <ul className="space-y-2.5">
              {liveApps.map((a) => {
                const sla = computeSLA(a);
                return (
                  <li key={a.id}>
                    <button
                      onClick={() =>
                        openApplication(a.id, "pm-application-details")
                      }
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-medium text-primary">
                            {a.applicationNo}
                          </span>
                          <span className="truncate text-xs font-medium">
                            {a.project.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{a.currentStageLabel}</span>
                          <span aria-hidden>·</span>
                          <span>
                            {a.assignedOfficer?.name ?? "Unassigned"}
                          </span>
                          {a.assignedOfficer && (
                            <RoleBadge role={a.assignedOfficer.role} />
                          )}
                          <span aria-hidden>·</span>
                          <span>
                            Pending since {timeAgoBrief(a.lastUpdated)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={a.progress}
                            className="h-1.5 w-20"
                          />
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {a.progress}%
                          </span>
                        </div>
                        <SlaBadge
                          label={sla.label}
                          cls={sla.cls}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="SLA Summary"
          description="Distribution of SLA statuses across all applications"
          icon={Gauge}
        >
          <ul className="space-y-2">
            {SLA_SUMMARY_ITEMS.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => navigate("pm-sla")}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  aria-label={`${item.label}: ${slaSummary[item.key]} applications. View SLA details.`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        item.cls
                      )}
                    >
                      <item.icon className="size-4" />
                    </span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="tabular-nums"
                    >
                      {slaSummary[item.key]}
                    </Badge>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* ===== ROW: Officer Workload (LEFT) + Current Bottleneck (RIGHT) ===== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <SectionCard
          title="Officer Workload"
          description="Active applications assigned per officer"
          icon={Users}
          className="xl:col-span-2"
          action={
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => navigate("pm-officers")}
            >
              View all <ArrowRight className="size-3" />
            </Button>
          }
        >
          {officerWorkloads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No officers found"
              description="There are no active officers in the system yet."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {officerWorkloads.map((w) => {
                const maxAssigned = Math.max(
                  1,
                  ...officerWorkloads.map((o) => o.assigned)
                );
                const pct =
                  maxAssigned === 0 ? 0 : (w.assigned / maxAssigned) * 100;
                return (
                  <button
                    key={w.user.id}
                    onClick={() => navigate("pm-officers")}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {w.user.name}
                        </p>
                        <div className="mt-1">
                          <RoleBadge role={w.user.role} />
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="tabular-nums shrink-0"
                      >
                        {w.assigned} assigned
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        Pending:{" "}
                        <span className="font-medium text-foreground tabular-nums">
                          {w.pending}
                        </span>
                      </span>
                      <span>
                        At risk:{" "}
                        <span className="font-medium text-amber-600 tabular-nums">
                          {w.atRisk}
                        </span>
                      </span>
                      <span>
                        Delayed:{" "}
                        <span className="font-medium text-destructive tabular-nums">
                          {w.delayed}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Current Bottleneck"
          description="Stage with the most pending applications"
          icon={Timer}
        >
          {bottleneck ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">
                    {bottleneck.stageLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bottleneck.reason}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <span className="text-xs text-muted-foreground">
                  Pending at this stage
                </span>
                <Badge className="bg-destructive/10 text-destructive tabular-nums">
                  {bottleneck.pendingCount}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate("pm-sla")}
              >
                Inspect SLA <ArrowRight className="size-3" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-6" />
              </div>
              <p className="text-sm font-medium">No bottleneck detected</p>
              <p className="text-xs text-muted-foreground">
                All stages are flowing smoothly.
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ===== Pending Actions ===== */}
      <SectionCard
        title="Pending Actions"
        description="Applications awaiting action, prioritised by urgency"
        icon={ListChecks}
        noPadding
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => navigate("pm-applications")}
          >
            View all <ArrowRight className="size-3" />
          </Button>
        }
      >
        {pendingActions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CheckCircle2}
              title="No pending actions"
              description="All active applications are on track."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Pending actions across applications
              </caption>
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                <tr className="border-b-2 border-border text-left text-[11px] uppercase tracking-wide text-foreground">
                  <th scope="col" className="px-4 py-3 font-bold">
                    Application
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Stage
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Responsible Role
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Responsible Officer
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Pending Since
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    SLA
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingActions.map((p) => (
                  <tr
                    key={p.app.id}
                    className="group cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() =>
                      openApplication(p.app.id, "pm-application-details")
                    }
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openApplication(
                            p.app.id,
                            "pm-application-details"
                          );
                        }}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {p.app.applicationNo}
                      </button>
                      <div className="truncate text-[10px] text-muted-foreground max-w-[180px]">
                        {p.app.project.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{p.stageLabel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{p.responsibleRole}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">
                        {p.responsibleOfficer}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgoBrief(p.pendingSince)}
                    </td>
                    <td className="px-4 py-3">
                      <SlaBadge
                        label={p.slaLabel}
                        cls={p.slaCls}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={p.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ===== Recent Activity ===== */}
      <SectionCard
        title="Recent Activity"
        description="Latest application and workflow events across the system"
        icon={History}
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => navigate("pm-reports")}
          >
            View all <ArrowRight className="size-3" />
          </Button>
        }
      >
        {recentActivity.length === 0 ? (
          <EmptyState
            icon={History}
            title="No recent activity"
            description="Activity events will appear here once actions are performed."
          />
        ) : (
          <ol className="relative space-y-0 max-h-[420px] overflow-y-auto pr-1">
            {recentActivity.map((e, idx) => (
              <li
                key={`${e.applicationId}-${e.timestamp}-${idx}`}
                className="relative flex gap-3 pb-4"
              >
                {idx < recentActivity.length - 1 && (
                  <div
                    className="absolute left-[7px] top-5 h-[calc(100%-0.5rem)] w-px bg-border"
                    aria-hidden
                  />
                )}
                <div className="relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-primary/60 bg-background">
                  <div className="absolute inset-0.5 rounded-full bg-primary/60" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium">{e.action}</p>
                    <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatDateTime(e.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {e.actor}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium"
                    >
                      {e.role}
                    </Badge>
                    <span aria-hidden>·</span>
                    <button
                      onClick={() =>
                        openApplication(
                          e.applicationId,
                          "pm-application-details"
                        )
                      }
                      className="font-mono text-[11px] text-primary hover:underline"
                    >
                      {e.applicationNo}
                    </button>
                  </div>
                  {e.remarks && (
                    <p className="text-xs text-muted-foreground italic">
                      {e.remarks}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}

// ============================================================
// SLA SUMMARY ITEMS (labels + classes — no hardcoded counts)
// ============================================================

const SLA_SUMMARY_ITEMS: {
  key: keyof {
    ON_TRACK: number;
    AT_RISK: number;
    DELAYED: number;
    CRITICAL: number;
    BLOCKED: number;
  };
  label: string;
  cls: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "ON_TRACK",
    label: "On Track",
    cls: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
  {
    key: "AT_RISK",
    label: "At Risk",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: AlertTriangle,
  },
  {
    key: "DELAYED",
    label: "Delayed",
    cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    icon: Clock,
  },
  {
    key: "CRITICAL",
    label: "Critical Delay",
    cls: "bg-destructive/10 text-destructive",
    icon: Timer,
  },
  {
    key: "BLOCKED",
    label: "Blocked",
    cls: "bg-destructive/10 text-destructive",
    icon: Ban,
  },
];

// ============================================================
// SLA BADGE (uses pre-computed classes from computeSLA)
// ============================================================

function SlaBadge({ label, cls }: { label: string; cls: string }) {
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", cls)}>
      {label}
    </Badge>
  );
}
