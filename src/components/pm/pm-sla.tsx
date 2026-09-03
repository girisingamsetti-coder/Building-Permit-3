"use client";

import * as React from "react";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { StatusBadge, PriorityBadge } from "@/components/design-system/badges";
import { PageBackButton } from "@/components/design-system/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Clock,
  OctagonAlert,
  Ban,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FilterX,
  ListFilter,
} from "lucide-react";
import type { Application } from "@/types";
import { getStage } from "@/data/workflow-config";
import {
  useAllApplications,
  computeSLA,
  type SLAStatus,
} from "@/components/pm/pm-helpers";

const PAGE_SIZE = 15;

// ============================================================
// PROJECT MANAGER — SLA & Delay Monitoring (read-only)
// Aggregates SLAInfo across every application to surface
// on-track / at-risk / delayed / critical / blocked counts,
// a filterable details table, a blocked applications block,
// and a delay-reason breakdown.
// ============================================================

type FilterKey = "ALL" | SLAStatus;

export function PmSla() {
  const { navigate } = useAppStore();
  const apps = useAllApplications();
  const [filter, setFilter] = React.useState<FilterKey>("ALL");

  // ---- Aggregate SLA counts ----
  const slaBuckets = React.useMemo(() => {
    const counts: Record<SLAStatus, number> = {
      ON_TRACK: 0,
      AT_RISK: 0,
      DELAYED: 0,
      CRITICAL: 0,
      BLOCKED: 0,
      COMPLETED: 0,
    };
    apps.forEach((a) => {
      counts[computeSLA(a).status] += 1;
    });
    return counts;
  }, [apps]);

  // ---- Delay reason grouping (BLOCKED + DELAYED + CRITICAL with reasons) ----
  const delayReasons = React.useMemo(() => {
    const map = new Map<string, number>();
    apps.forEach((a) => {
      const sla = computeSLA(a);
      if (
        (sla.status === "BLOCKED" || sla.status === "DELAYED" || sla.status === "CRITICAL") &&
        sla.reason
      ) {
        map.set(sla.reason, (map.get(sla.reason) ?? 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }, [apps]);

  // ---- Filtered applications for the details table ----
  const filtered = React.useMemo(() => {
    if (filter === "ALL") return apps;
    return apps.filter((a) => computeSLA(a).status === filter);
  }, [apps, filter]);

  // ---- Blocked applications ----
  const blocked = React.useMemo(
    () =>
      apps
        .filter((a) => computeSLA(a).status === "BLOCKED")
        .map((a) => ({ app: a, sla: computeSLA(a) })),
    [apps]
  );

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-dashboard" />
      <PageHeader
        title="SLA & Delay Monitoring"
        description="Track SLA compliance and identify delayed applications."
        icon={Gauge}
        breadcrumbs={[
          { label: "PM", onClick: () => navigate("pm-dashboard") },
          { label: "SLA & Delay Monitoring" },
        ]}
        actions={
          filter !== "ALL" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("ALL")}
              className="h-8"
            >
              <FilterX className="size-3.5" /> Clear filter ({filter.replace("_", " ")})
            </Button>
          ) : undefined
        }
      />

      {/* SLA Summary Cards (clickable) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SlaSummaryCard
          label="On Track"
          count={slaBuckets.ON_TRACK}
          icon={CheckCircle2}
          cls="bg-success/10 text-success border-success/30"
          active={filter === "ON_TRACK"}
          onClick={() => setFilter(filter === "ON_TRACK" ? "ALL" : "ON_TRACK")}
        />
        <SlaSummaryCard
          label="At Risk"
          count={slaBuckets.AT_RISK}
          icon={Clock}
          cls="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
          active={filter === "AT_RISK"}
          onClick={() => setFilter(filter === "AT_RISK" ? "ALL" : "AT_RISK")}
        />
        <SlaSummaryCard
          label="Delayed"
          count={slaBuckets.DELAYED}
          icon={AlertTriangle}
          cls="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30"
          active={filter === "DELAYED"}
          onClick={() => setFilter(filter === "DELAYED" ? "ALL" : "DELAYED")}
        />
        <SlaSummaryCard
          label="Critical"
          count={slaBuckets.CRITICAL}
          icon={OctagonAlert}
          cls="bg-destructive/10 text-destructive border-destructive/30"
          active={filter === "CRITICAL"}
          onClick={() => setFilter(filter === "CRITICAL" ? "ALL" : "CRITICAL")}
        />
        <SlaSummaryCard
          label="Blocked"
          count={slaBuckets.BLOCKED}
          icon={Ban}
          cls="bg-destructive/15 text-destructive border-destructive/40"
          active={filter === "BLOCKED"}
          onClick={() => setFilter(filter === "BLOCKED" ? "ALL" : "BLOCKED")}
        />
      </div>

      {/* SLA Details Table */}
      <SlaDetailsTable apps={filtered} filter={filter} />

      {/* Blocked Applications */}
      <BlockedApplications blocked={blocked} />

      {/* Delay Identification */}
      <DelayIdentification reasons={delayReasons} />
    </div>
  );
}

// ---------- SLA Summary Card (clickable) ----------
function SlaSummaryCard({
  label,
  count,
  icon: Icon,
  cls,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  cls: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-left shadow-gov transition-all hover:shadow-gov-lg " +
        (active ? "border-primary ring-2 ring-primary/30 " : "border-border ") +
        cls
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-background/60">
          <Icon className="size-4" />
        </div>
        {active && (
          <Badge className="bg-background/80 text-foreground text-[9px]">Filtered</Badge>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{count}</div>
        <div className="text-xs font-medium opacity-90">{label}</div>
      </div>
    </button>
  );
}

// ---------- SLA Details Table (paginated) ----------
function SlaDetailsTable({ apps, filter }: { apps: Application[]; filter: FilterKey }) {
  const openApplication = useAppStore((s) => s.openApplication);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(apps.length / PAGE_SIZE));
    if (page > maxPage) setPage(1);
  }, [apps.length, page]);

  // Sort: critical/blocked/delayed/at-risk first, then by remaining (asc)
  const sorted = React.useMemo(() => {
    const order: Record<string, number> = {
      BLOCKED: 0,
      CRITICAL: 1,
      DELAYED: 2,
      AT_RISK: 3,
      ON_TRACK: 4,
      COMPLETED: 5,
    };
    return [...apps].sort((a, b) => {
      const sa = order[computeSLA(a).status] ?? 6;
      const sb = order[computeSLA(b).status] ?? 6;
      if (sa !== sb) return sa - sb;
      return computeSLA(a).remainingDays - computeSLA(b).remainingDays;
    });
  }, [apps]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <SectionCard
      title="SLA Details"
      description={
        filter === "ALL"
          ? `${sorted.length} application${sorted.length === 1 ? "" : "s"} (all)`
          : `${sorted.length} application${sorted.length === 1 ? "" : "s"} filtered by ${filter.replace("_", " ")}`
      }
      icon={Gauge}
      noPadding
    >
      {sorted.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Gauge}
            title="No applications match this filter"
            description="Pick a different SLA status to view its applications."
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <TableHead className="px-4 py-2.5 font-bold">Application No.</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Project</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Current Stage</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold text-right">Expected SLA</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold text-right">Elapsed</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold text-right">Remaining</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Status</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((a) => {
                  const sla = computeSLA(a);
                  const stageInfo = getStage(a.currentStage);
                  return (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => openApplication(a.id, "pm-application-details")}
                    >
                      <TableCell className="px-4 py-3 font-mono text-[11px] font-medium">
                        {a.applicationNo}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <p className="truncate text-xs font-medium">{a.project.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {a.applicant.name}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-xs">{stageInfo?.label ?? a.currentStageLabel}</span>
                        <div className="mt-0.5">
                          <PriorityBadge priority={a.priority} />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-xs tabular-nums">
                        {sla.expectedDays > 0 ? `${sla.expectedDays} d` : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-xs tabular-nums">
                        {sla.elapsedDays > 0 ? `${sla.elapsedDays} d` : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-xs tabular-nums">
                        <span
                          className={
                            sla.remainingDays < 0
                              ? "font-semibold text-destructive"
                              : sla.remainingDays === 0
                              ? "font-semibold text-amber-600"
                              : "text-foreground"
                          }
                        >
                          {sla.remainingDays > 0 ? `${sla.remainingDays} d` : sla.remainingDays === 0 ? "Due today" : `${Math.abs(sla.remainingDays)} d over`}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={sla.cls}>{sla.label}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {sla.reason ? (
                          <span className="text-[11px] text-muted-foreground">{sla.reason}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-start justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, sorted.length)}
              </span>{" "}
              of <span className="font-medium text-foreground">{sorted.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-8"
              >
                <ChevronLeft className="size-3.5" /> Prev
              </Button>
              <span className="px-2 text-xs font-medium tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8"
              >
                Next <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </SectionCard>
  );
}

// ---------- Blocked Applications ----------
function BlockedApplications({
  blocked,
}: {
  blocked: { app: Application; sla: ReturnType<typeof computeSLA> }[];
}) {
  const openApplication = useAppStore((s) => s.openApplication);

  return (
    <SectionCard
      title="Blocked Applications"
      description={`${blocked.length} application${blocked.length === 1 ? "" : "s"} currently blocked`}
      icon={Ban}
      noPadding
    >
      {blocked.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={CheckCircle2}
            title="No blocked applications"
            description="All applications are progressing through the workflow without blockers."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <TableHead className="px-4 py-2.5 font-bold">Application No.</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Project</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Current Stage</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Blocking Reason</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocked.map(({ app, sla }) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => openApplication(app.id, "pm-application-details")}
                >
                  <TableCell className="px-4 py-3 font-mono text-[11px] font-medium">
                    {app.applicationNo}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="truncate text-xs font-medium">{app.project.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {app.applicant.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-xs">{app.currentStageLabel}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      <span className="text-[11px] text-foreground/80">
                        {sla.reason ?? "Unspecified block"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      Open <ArrowRight className="size-3" />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}

// ---------- Delay Identification ----------
function DelayIdentification({
  reasons,
}: {
  reasons: { reason: string; count: number }[];
}) {
  const total = reasons.reduce((s, r) => s + r.count, 0);
  return (
    <SectionCard
      title="Delay Identification"
      description={`${reasons.length} distinct delay reason${reasons.length === 1 ? "" : "s"} · ${total} affected application${total === 1 ? "" : "s"}`}
      icon={ListFilter}
    >
      {reasons.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No delay reasons recorded"
          description="No applications are currently delayed, blocked, or critical."
        />
      ) : (
        <ul className="space-y-3">
          {reasons.map((r, idx) => {
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
            return (
              <li
                key={r.reason + idx}
                className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                    <p className="text-xs font-medium text-foreground/90">{r.reason}</p>
                  </div>
                  <Badge className="bg-warning/15 text-warning-foreground text-[10px]">
                    {r.count} app{r.count === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-warning"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                    {pct}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
