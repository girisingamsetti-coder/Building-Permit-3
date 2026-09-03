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
import {
  Users,
  ClipboardList,
  AlertTriangle,
  Gauge,
  ArrowRight,
  Crown,
  Hourglass,
  CheckCircle2,
  Activity,
} from "lucide-react";
import {
  useAllApplications,
  useAllUsers,
  computeOfficerWorkloads,
  computeSLA,
  type OfficerWorkload,
} from "@/components/pm/pm-helpers";

// ============================================================
// PM — Officer Progress
// Workload + performance + SLA compliance across every officer.
// All metrics derived from the shared applications/users dataset.
// ============================================================

export function PmOfficers() {
  const navigate = useAppStore((s) => s.navigate);
  const openApplication = useAppStore((s) => s.openApplication);
  const apps = useAllApplications();
  const users = useAllUsers();

  const workloads = React.useMemo<OfficerWorkload[]>(
    () => computeOfficerWorkloads(apps, users),
    [apps, users]
  );

  // ---- KPI metrics ----
  const totalOfficers = workloads.length;
  const totalAssigned = workloads.reduce((s, w) => s + w.assigned, 0);
  const totalDelayed = workloads.reduce((s, w) => s + w.delayed + w.atRisk, 0);

  // SLA compliance: % of assigned (non-completed) apps that are ON_TRACK or AT_RISK
  const compliancePct = React.useMemo(() => {
    let onTrack = 0;
    let considered = 0;
    apps.forEach((a) => {
      if (a.assignedOfficer && !["APPROVED", "REJECTED"].includes(a.status)) {
        considered += 1;
        const sla = computeSLA(a);
        if (sla.status === "ON_TRACK" || sla.status === "AT_RISK") onTrack += 1;
      }
    });
    if (considered === 0) return 100;
    return Math.round((onTrack / considered) * 100);
  }, [apps]);

  function handleRowClick(officerId: string) {
    // Reuse selectedApplicationId as the officer ID carrier.
    openApplication(officerId, "pm-officer-details");
  }

  if (workloads.length === 0) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="pm-dashboard" />
        <PageHeader
          title="Officer Progress"
          description="Monitor workload, performance and SLA compliance across all officers."
          icon={Users}
        />
        <EmptyState
          icon={Users}
          title="No officers available"
          description="There are no active officers in the system to monitor. Add or activate officers to see workload metrics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-dashboard" />

      <PageHeader
        title="Officer Progress"
        description="Monitor workload, performance and SLA compliance across all officers."
        icon={Users}
      />

      {/* KPI Cards (4-col on desktop) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Officers"
          value={totalOfficers}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label="Total Assigned"
          value={totalAssigned}
          icon={ClipboardList}
          accent="info"
        />
        <StatCard
          label="Total Delayed / At Risk"
          value={totalDelayed}
          icon={AlertTriangle}
          accent="destructive"
        />
        <StatCard
          label="Avg SLA Compliance"
          value={`${compliancePct}%`}
          icon={Gauge}
          accent="success"
        />
      </div>

      {/* Officer Workload Table */}
      <SectionCard
        title="Officer Workload"
        description="Live workload snapshot across all assigned applications."
        icon={ClipboardList}
        noPadding
      >
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
                <th className="px-4 py-2.5 font-bold text-right">At Risk</th>
                <th className="px-4 py-2.5 font-bold text-right">Avg Days</th>
                <th className="px-4 py-2.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workloads.map((w) => (
                <tr
                  key={w.user.id}
                  onClick={() => handleRowClick(w.user.id)}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ background: w.user.avatarColor }}
                        aria-hidden
                      >
                        {w.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {w.user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {w.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <RoleBadge role={w.user.role} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                    {w.assigned}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span className="text-success font-medium">{w.completed}</span>
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
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {w.atRisk > 0 ? (
                      <span className="text-amber-600 font-medium">{w.atRisk}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {w.avgProcessingDays > 0 ? `${w.avgProcessingDays}d` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(w.user.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
                      aria-label={`View details for ${w.user.name}`}
                    >
                      View <ArrowRight className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Officer Comparison */}
      <SectionCard
        title="Officer Comparison"
        description="Side-by-side comparison of current workload across officers."
        icon={Crown}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workloads.map((w) => (
            <div
              key={w.user.id}
              className={cn(
                "rounded-xl border border-border bg-card p-4 shadow-gov transition-all cursor-pointer",
                "hover:border-primary/40 hover:shadow-gov-lg"
              )}
              onClick={() => handleRowClick(w.user.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRowClick(w.user.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: w.user.avatarColor }}
                    aria-hidden
                  >
                    {w.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {w.user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {w.user.designation ?? w.user.role}
                    </p>
                  </div>
                </div>
                <RoleBadge role={w.user.role} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <div className="text-lg font-semibold tabular-nums">
                    {w.assigned}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Assigned
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <div className="text-lg font-semibold tabular-nums text-info">
                    {w.pending}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Pending
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <div
                    className={cn(
                      "text-lg font-semibold tabular-nums",
                      w.delayed > 0 ? "text-destructive" : "text-success"
                    )}
                  >
                    {w.delayed}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Delayed
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Hourglass className="size-3" /> Avg {w.avgProcessingDays > 0 ? `${w.avgProcessingDays}d` : "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> {w.completed} done
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick navigation footer */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <Activity className="size-3.5" />
        <span>
          Click any officer row or card to view the detailed profile and recent actions.
        </span>
        <button
          onClick={() => navigate("pm-reports")}
          className="ml-2 inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          View reports <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
