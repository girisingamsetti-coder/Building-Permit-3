"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAllShortfalls } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  StatCard,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import {
  ShortfallStatusBadge,
  ShortfallTypeBadge,
  RoleBadge,
} from "@/components/design-system/badges";
import { formatDate } from "@/components/design-system/workflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  AlarmClock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  PieChart,
  FileWarning,
} from "lucide-react";
import { WORKFLOW_STAGES } from "@/data/workflow-config";
import type { Shortfall, ShortfallStatus, Application, WorkflowStageKey } from "@/types";

const PAGE_SIZE = 15;

type ShortfallWithApp = Shortfall & { application: Application };

// Valid status filter values
type StatusFilter = "ALL" | ShortfallStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "RESPONDED", label: "Responded" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REOPENED", label: "Reopened" },
  { value: "OVERDUE", label: "Overdue" },
];

// ============================================================
// PM — Shortfall Monitoring
// Cross-application shortfall overview with KPIs, filter,
// paginated table and a by-stage breakdown.
// ============================================================

export function PmShortfalls() {
  const openApplication = useAppStore((s) => s.openApplication);
  const allShortfalls = useAllShortfalls();

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);

  // ---- KPI metrics ----
  const openCount = allShortfalls.filter((s) => s.status === "OPEN").length;
  const respondedCount = allShortfalls.filter(
    (s) => s.status === "RESPONDED" || s.status === "UNDER_REVIEW"
  ).length;
  const resolvedCount = allShortfalls.filter(
    (s) => s.status === "RESOLVED"
  ).length;
  const overdueCount = allShortfalls.filter(
    (s) => s.status === "OVERDUE" || s.status === "REOPENED"
  ).length;

  // ---- Filtered list ----
  const filtered = React.useMemo<ShortfallWithApp[]>(() => {
    const list =
      statusFilter === "ALL"
        ? allShortfalls
        : allShortfalls.filter((s) => s.status === statusFilter);
    // Sort: oldest open first by raisedAt (deterministic)
    return [...list].sort((a, b) => a.raisedAt.localeCompare(b.raisedAt));
  }, [allShortfalls, statusFilter]);

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ---- Shortfalls by Stage ----
  const byStage = React.useMemo(() => {
    const counts = new Map<WorkflowStageKey, number>();
    allShortfalls.forEach((s) => {
      counts.set(s.stageRaisedAt, (counts.get(s.stageRaisedAt) ?? 0) + 1);
    });
    return WORKFLOW_STAGES.map((stage) => ({
      stageKey: stage.key,
      stageLabel: stage.label,
      count: counts.get(stage.key) ?? 0,
    })).filter((row) => row.count > 0);
  }, [allShortfalls]);

  function ageDays(iso: string): number {
    if (!iso) return 0;
    const diff = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-dashboard" />

      <PageHeader
        title="Shortfall Monitoring"
        description="Track all open and resolved shortfalls across applications."
        icon={AlertTriangle}
      />

      {/* KPI Cards (4-col) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Shortfalls"
          value={openCount}
          icon={AlertTriangle}
          accent="warning"
        />
        <StatCard
          label="Responded / Under Review"
          value={respondedCount}
          icon={MessageSquare}
          accent="info"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Overdue / Reopened"
          value={overdueCount}
          icon={AlarmClock}
          accent="destructive"
        />
      </div>

      {/* Shortfalls Table */}
      <SectionCard
        title="Shortfalls"
        description={`${filtered.length} of ${allShortfalls.length} shortfalls shown.`}
        icon={FileWarning}
        noPadding
        action={
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="No shortfalls match the current filter"
              description={
                statusFilter === "ALL"
                  ? "There are no shortfalls recorded in the system."
                  : `No shortfalls with status "${statusFilter}". Choose a different status to see more.`
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-foreground border-b-2 border-border">
                    <th className="px-4 py-2.5 font-bold">Shortfall ID</th>
                    <th className="px-4 py-2.5 font-bold">Application No.</th>
                    <th className="px-4 py-2.5 font-bold">Title</th>
                    <th className="px-4 py-2.5 font-bold">Type</th>
                    <th className="px-4 py-2.5 font-bold">Raised By</th>
                    <th className="px-4 py-2.5 font-bold">Raised At</th>
                    <th className="px-4 py-2.5 font-bold text-right">Age</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 font-bold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((s) => {
                    const age = ageDays(s.raisedAt);
                    const overdue =
                      s.status === "OVERDUE" ||
                      (s.status !== "RESOLVED" &&
                        new Date(s.dueDate).getTime() < Date.now());
                    return (
                      <tr
                        key={s.id}
                        onClick={() =>
                          openApplication(
                            s.application.id,
                            "pm-application-details"
                          )
                        }
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-[11px] text-foreground">
                            {s.shortfallId}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs text-primary">
                            {s.applicationNo}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-medium text-foreground truncate max-w-[240px]">
                            {s.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                            {s.application.project.name}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <ShortfallTypeBadge type={s.type} />
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-medium text-foreground">
                            {s.raisedBy.name}
                          </p>
                          <div className="mt-0.5">
                            <RoleBadge role={s.raisedBy.role} />
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(s.raisedAt)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              overdue ? "text-destructive" : "text-muted-foreground"
                            )}
                          >
                            {age}d
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <ShortfallStatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(s.dueDate)}
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
                  Page {page} of {totalPages} · {filtered.length} total
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

      {/* Shortfalls by Stage */}
      <SectionCard
        title="Shortfalls by Stage"
        description="Workflow stage where each shortfall was raised, with live counts."
        icon={PieChart}
        noPadding
      >
        {byStage.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={CheckCircle2}
              title="No shortfalls raised"
              description="There are no shortfalls across any workflow stage — pipeline is healthy."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                <tr className="text-left text-[11px] uppercase tracking-wide text-foreground border-b-2 border-border">
                  <th className="px-4 py-2.5 font-bold">Workflow Stage</th>
                  <th className="px-4 py-2.5 font-bold text-right">Shortfalls Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byStage.map((row) => (
                  <tr key={row.stageKey} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-foreground">
                      {row.stageLabel}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                          row.count > 3
                            ? "bg-destructive/10 text-destructive"
                            : row.count > 1
                            ? "bg-amber-500/15 text-amber-600"
                            : "bg-info/10 text-info"
                        )}
                      >
                        <AlertTriangle className="size-3" /> {row.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Quick navigation footer */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Click any shortfall row to open the parent application.</span>
        <ArrowRight className="size-3.5" />
      </div>
    </div>
  );
}
