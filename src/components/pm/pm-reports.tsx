"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  StatCard,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import { RoleBadge } from "@/components/design-system/badges";
import { formatDateTime, timeAgo } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Inbox,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  Download,
  Activity,
  TrendingUp,
  PieChart,
  Gauge,
  Users,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoleKey } from "@/types";
import {
  useAllApplications,
  useAllUsers,
  computeOfficerWorkloads,
  computeStagePerformance,
  identifyBottleneck,
  computeRecentActivity,
  computeSLA,
  type OfficerWorkload,
  type StagePerf,
  type ActivityEvent,
} from "@/components/pm/pm-helpers";

// ============================================================
// PM — Progress Reports
// Aggregated performance overview: KPIs, approval rate, stage
// performance, officer report (with CSV export), bottleneck and
// recent activity feed.
// ============================================================

export function PmReports() {
  const apps = useAllApplications();
  const users = useAllUsers();
  const openApplication = useAppStore((s) => s.openApplication);
  const { toast } = useToast();

  // ---- KPI metrics (derived) ----
  const totalReceived = apps.length;
  const inProgress = apps.filter(
    (a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status)
  ).length;
  const completedApproved = apps.filter((a) => a.status === "APPROVED").length;
  const delayedCount = apps.filter((a) => {
    const sla = computeSLA(a);
    return sla.status === "DELAYED" || sla.status === "CRITICAL";
  }).length;

  // ---- Approval rate ----
  const decisioned = apps.filter((a) =>
    ["APPROVED", "REJECTED"].includes(a.status)
  ).length;
  const approvalRate =
    decisioned === 0 ? 0 : Math.round((completedApproved / decisioned) * 100);

  // ---- Stage performance ----
  const stagePerf = React.useMemo<StagePerf[]>(
    () => computeStagePerformance(apps),
    [apps]
  );

  // ---- Officer report ----
  const officerWorkloads = React.useMemo<OfficerWorkload[]>(
    () => computeOfficerWorkloads(apps, users),
    [apps, users]
  );

  // ---- Bottleneck ----
  const bottleneck = React.useMemo(() => identifyBottleneck(apps), [apps]);

  // ---- Recent activity feed ----
  const recentActivity = React.useMemo<ActivityEvent[]>(
    () => computeRecentActivity(apps, 30),
    [apps]
  );

  // ---- Officer SLA compliance % for the report table ----
  function officerCompliance(w: OfficerWorkload): number {
    // Compliance for this officer = (assigned - delayed) / max(assigned, 1)
    if (w.assigned === 0) return 100;
    const onTrack = w.assigned - w.delayed - w.atRisk;
    return Math.max(0, Math.round((onTrack / w.assigned) * 100));
  }

  function exportOfficerCsv() {
    const headers = [
      "Officer",
      "Role",
      "Email",
      "Assigned",
      "Completed",
      "Pending",
      "Delayed",
      "At Risk",
      "Avg Processing Days",
      "SLA Compliance %",
    ];
    const rows = officerWorkloads.map((w) => [
      w.user.name,
      w.user.role,
      w.user.email,
      w.assigned,
      w.completed,
      w.pending,
      w.delayed,
      w.atRisk,
      w.avgProcessingDays,
      officerCompliance(w),
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `officer-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export complete",
      description: `${officerWorkloads.length} officers exported to CSV.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-dashboard" />

      <PageHeader
        title="Progress Reports"
        description="Overview of approval performance, SLA and officer workload."
        icon={BarChart3}
      />

      {/* Summary KPI Cards (4-col) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications Received"
          value={totalReceived}
          icon={Inbox}
          accent="primary"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={Hourglass}
          accent="info"
        />
        <StatCard
          label="Completed (Approved)"
          value={completedApproved}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Delayed"
          value={delayedCount}
          icon={AlertTriangle}
          accent="destructive"
        />
      </div>

      {/* Approval Rate */}
      <SectionCard
        title="Approval Rate"
        description="Share of decisioned applications that were approved."
        icon={TrendingUp}
      >
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                {approvalRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                {completedApproved} approved of {decisioned} decisioned ·{" "}
                {apps.length - decisioned} pending decision
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[11px] font-medium text-success">
              <PieChart className="size-3.5" /> Live
            </span>
          </div>
          <Progress value={approvalRate} className="h-2" />
        </div>
      </SectionCard>

      {/* Stage-wise Pending Count */}
      <SectionCard
        title="Stage-wise Pending Count"
        description="Pending applications and average processing time per workflow stage."
        icon={Gauge}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
              <tr className="text-left text-[11px] uppercase tracking-wide text-foreground border-b-2 border-border">
                <th className="px-4 py-2.5 font-bold">Stage</th>
                <th className="px-4 py-2.5 font-bold text-right">Pending</th>
                <th className="px-4 py-2.5 font-bold text-right">Avg Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stagePerf.map((p) => (
                <tr key={p.stageKey} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-foreground">
                    {p.stageLabel}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {p.pendingCount > 0 ? (
                      <span className="font-medium text-info">
                        {p.pendingCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {p.avgDays > 0 ? `${p.avgDays}d` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Officer Report with CSV Export */}
      <SectionCard
        title="Officer Report"
        description="Per-officer workload, completion and SLA compliance."
        icon={Users}
        noPadding
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={exportOfficerCsv}
            disabled={officerWorkloads.length === 0}
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      >
        {officerWorkloads.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Users}
              title="No officers"
              description="There are no active officers to report on."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                <tr className="text-left text-[11px] uppercase tracking-wide text-foreground border-b-2 border-border">
                  <th className="px-4 py-2.5 font-bold">Officer</th>
                  <th className="px-4 py-2.5 font-bold">Role</th>
                  <th className="px-4 py-2.5 font-bold text-right">Assigned</th>
                  <th className="px-4 py-2.5 font-bold text-right">Completed</th>
                  <th className="px-4 py-2.5 font-bold text-right">Pending</th>
                  <th className="px-4 py-2.5 font-bold text-right">Delayed</th>
                  <th className="px-4 py-2.5 font-bold text-right">Avg Days</th>
                  <th className="px-4 py-2.5 font-bold text-right">SLA %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {officerWorkloads.map((w) => (
                  <tr key={w.user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium text-foreground">
                        {w.user.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {w.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <RoleBadge role={w.user.role} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                      {w.assigned}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-success">
                      {w.completed}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {w.pending}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {w.delayed > 0 ? (
                        <span className="text-destructive font-medium">
                          {w.delayed}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {w.avgProcessingDays > 0 ? `${w.avgProcessingDays}d` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                          officerCompliance(w) >= 80
                            ? "bg-success/10 text-success"
                            : officerCompliance(w) >= 50
                            ? "bg-amber-500/15 text-amber-600"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {officerCompliance(w)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Bottleneck Identification */}
      <SectionCard
        title="Bottleneck Identification"
        description="Workflow stage with the highest pending count."
        icon={AlertTriangle}
      >
        {bottleneck ? (
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {bottleneck.stageLabel}
              </p>
              <p className="text-xs text-muted-foreground">{bottleneck.reason}</p>
              <p className="text-[11px] text-muted-foreground/80">
                Investigate officer assignment, average processing time and
                outstanding shortfalls at this stage to unblock the pipeline.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="No bottleneck detected"
            description="All workflow stages are flowing — no pending backlog at any stage."
          />
        )}
      </SectionCard>

      {/* Recent Activity Feed */}
      <SectionCard
        title="Recent Activity Feed"
        description="Latest 30 audit-log events across all applications."
        icon={Activity}
        noPadding
      >
        {recentActivity.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="No audit events recorded yet."
            />
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {recentActivity.map((ev) => (
              <li
                key={`${ev.applicationId}-${ev.timestamp}-${ev.action}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="relative mt-1.5 size-2.5 shrink-0 rounded-full bg-primary/60" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {ev.action}
                    </p>
                    <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatDateTime(ev.timestamp)} · {timeAgo(ev.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {ev.actor}
                    </span>
                    <RoleBadge role={ev.role as RoleKey} />
                    <span className="text-muted-foreground/60">·</span>
                    <button
                      onClick={() =>
                        openApplication(ev.applicationId, "pm-application-details")
                      }
                      className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                    >
                      {ev.applicationNo} <ArrowRight className="size-3" />
                    </button>
                  </div>
                  {ev.remarks && (
                    <p className="mt-1 text-xs text-muted-foreground italic">
                      “{ev.remarks}”
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
