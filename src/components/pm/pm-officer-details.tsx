"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  StatCard,
  InfoGrid,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import {
  RoleBadge,
  StatusBadge,
} from "@/components/design-system/badges";
import { formatDateTime, formatDate, timeAgo } from "@/components/design-system/workflow";
import {
  User as UserIcon,
  ClipboardList,
  CheckCircle2,
  Hourglass,
  AlertTriangle,
  ArrowRight,
  History,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import {
  useAllApplications,
  useAllUsers,
  computeOfficerWorkloads,
  computeSLA,
  type OfficerWorkload,
} from "@/components/pm/pm-helpers";
import type { Application, RoleKey } from "@/types";

const PAGE_SIZE = 10;

// ============================================================
// PM — Officer Detail
// Profile, workload summary, assigned applications, recent actions.
// Officer ID is passed via the shared `selectedApplicationId`
// slot (set by pm-officers.tsx via openApplication(officerId, view)).
// ============================================================

export function PmOfficerDetails() {
  const selectedOfficerId = useAppStore((s) => s.selectedApplicationId);
  const openApplication = useAppStore((s) => s.openApplication);
  const navigate = useAppStore((s) => s.navigate);
  const apps = useAllApplications();
  const users = useAllUsers();

  const officer = React.useMemo(
    () => users.find((u) => u.id === selectedOfficerId) ?? null,
    [users, selectedOfficerId]
  );

  // Workload for THIS officer
  const workload = React.useMemo<OfficerWorkload | null>(() => {
    if (!officer) return null;
    const all = computeOfficerWorkloads(apps, users);
    return all.find((w) => w.user.id === officer.id) ?? null;
  }, [apps, users, officer]);

  // Assigned applications for this officer's role
  const assignedApps = React.useMemo<Application[]>(() => {
    if (!officer) return [];
    return apps.filter(
      (a) => a.assignedOfficer?.role === officer.role
    );
  }, [apps, officer]);

  // Recent actions from audit log where actor.role === officer.role
  const recentActions = React.useMemo(() => {
    if (!officer) return [];
    type RecentAction = {
      id: string;
      appNo: string;
      appId: string;
      timestamp: string;
      action: string;
      user: string;
      remarks?: string;
    };
    const events: RecentAction[] = [];
    apps.forEach((a) => {
      a.auditLog.forEach((log) => {
        if (log.role === officer.role) {
          events.push({
            id: log.id,
            appNo: a.applicationNo,
            appId: a.id,
            timestamp: log.timestamp,
            action: log.action,
            user: log.user,
            remarks: log.remarks,
          });
        }
      });
    });
    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return events.slice(0, 15);
  }, [apps, officer]);

  const [page, setPage] = React.useState(1);

  // Reset page when officer changes
  React.useEffect(() => {
    setPage(1);
  }, [selectedOfficerId]);

  const totalPages = Math.max(1, Math.ceil(assignedApps.length / PAGE_SIZE));
  const pagedApps = assignedApps.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (!officer) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="pm-officers" />
        <PageHeader
          title="Officer Details"
          description="Profile, workload and recent actions for the selected officer."
          icon={UserIcon}
        />
        <EmptyState
          icon={Inbox}
          title="No officer selected"
          description="Go to the Officer Progress page and click an officer row to view their detailed profile and performance."
          action={
            <button
              onClick={() => navigate("pm-officers")}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Officer Progress <ArrowRight className="size-3.5" />
            </button>
          }
        />
      </div>
    );
  }

  const roleLabel: string = officer.role;

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-officers" />

      <PageHeader
        title={officer.name}
        description={`${officer.designation ?? roleLabel}${officer.zone ? ` · ${officer.zone}` : ""}`}
        icon={UserIcon}
        badge={<RoleBadge role={officer.role} />}
      />

      {/* Officer Profile */}
      <SectionCard
        title="Officer Profile"
        description="Basic information and assignment metadata for this officer."
        icon={UserIcon}
      >
        <InfoGrid
          columns={3}
          items={[
            { label: "Name", value: officer.name },
            {
              label: "Role",
              value: <RoleBadge role={officer.role} />,
            },
            { label: "Designation", value: officer.designation ?? "—" },
            { label: "Zone", value: officer.zone ?? "—" },
            { label: "Department", value: officer.department ?? "—" },
            {
              label: "Employee ID",
              value: officer.employeeId ?? "—",
              mono: true,
            },
          ]}
        />
      </SectionCard>

      {/* Workload Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned"
          value={workload?.assigned ?? assignedApps.length}
          icon={ClipboardList}
          accent="primary"
        />
        <StatCard
          label="Completed"
          value={workload?.completed ?? 0}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Pending"
          value={workload?.pending ?? 0}
          icon={Hourglass}
          accent="info"
        />
        <StatCard
          label="Delayed"
          value={workload?.delayed ?? 0}
          icon={AlertTriangle}
          accent="destructive"
        />
      </div>

      {/* Assigned Applications */}
      <SectionCard
        title="Assigned Applications"
        description={`${assignedApps.length} application${assignedApps.length === 1 ? "" : "s"} assigned to this officer's role.`}
        icon={ClipboardList}
        noPadding
      >
        {pagedApps.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="No applications assigned"
              description="There are no applications currently assigned to this officer's role."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-foreground border-b-2 border-border">
                    <th className="px-4 py-2.5 font-bold">Application No.</th>
                    <th className="px-4 py-2.5 font-bold">Project</th>
                    <th className="px-4 py-2.5 font-bold">Current Stage</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 font-bold">Assigned Since</th>
                    <th className="px-4 py-2.5 font-bold">SLA</th>
                    <th className="px-4 py-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedApps.map((a) => {
                    const sla = computeSLA(a);
                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs text-foreground">
                            {a.applicationNo}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-medium text-foreground truncate max-w-[220px]">
                            {a.project.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                            {a.applicant.name}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-foreground">
                          {a.currentStageLabel}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(a.assignedAt ?? a.lastUpdated)}
                          <span className="block text-[10px]">
                            {timeAgo(a.assignedAt ?? a.lastUpdated)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                              sla.cls
                            )}
                          >
                            {sla.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() =>
                              openApplication(a.id, "pm-application-details")
                            }
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
                            aria-label={`View ${a.applicationNo}`}
                          >
                            View <ArrowRight className="size-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
                <span className="text-muted-foreground">
                  Page {page} of {totalPages} · {assignedApps.length} total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="size-3.5" /> Prev
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Next <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Recent Actions */}
      <SectionCard
        title="Recent Actions"
        description={`Latest 15 audit-log actions performed by ${officer.name}.`}
        icon={History}
        noPadding
      >
        {recentActions.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={History}
              title="No recent actions"
              description="This officer hasn't performed any recorded actions yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                <tr className="text-left text-[11px] uppercase tracking-wide text-foreground border-b-2 border-border">
                  <th className="px-4 py-2.5 font-bold">Timestamp</th>
                  <th className="px-4 py-2.5 font-bold">Action</th>
                  <th className="px-4 py-2.5 font-bold">Application No.</th>
                  <th className="px-4 py-2.5 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentActions.map((ev) => (
                  <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(ev.timestamp)}
                      <span className="block text-[10px]">
                        {timeAgo(ev.timestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium text-foreground">
                        {ev.action}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() =>
                          openApplication(ev.appId, "pm-application-details")
                        }
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {ev.appNo}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {ev.remarks ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
