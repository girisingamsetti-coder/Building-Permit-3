"use client";

import * as React from "react";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { StatusBadge, RoleBadge, PriorityBadge } from "@/components/design-system/badges";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Activity,
  Clock,
  AlertOctagon,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  Gauge,
} from "lucide-react";
import type { Application, RoleKey, WorkflowStageKey } from "@/types";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";
import { rolesForStage } from "@/lib/permissions";
import {
  useAllApplications,
  computeSLA,
  computeStagePerformance,
  computePendingActions,
  identifyBottleneck,
  timeAgoBrief,
} from "@/components/pm/pm-helpers";
import { formatDate } from "@/components/design-system/workflow";

const PAGE_SIZE = 15;

// ============================================================
// PROJECT MANAGER — Live Workflow Monitor (read-only)
// Real-time view of every application moving through the
// approval workflow. Highlights the current bottleneck and
// stage-by-stage performance.
// ============================================================

export function PmWorkflow() {
  const { navigate } = useAppStore();
  const apps = useAllApplications();

  // ---- Derived metrics (no hardcoded counters) ----
  const inProgress = React.useMemo(
    () => apps.filter((a) => !["APPROVED", "REJECTED"].includes(a.status)),
    [apps]
  );

  const completedStagesSum = React.useMemo(
    () =>
      inProgress.reduce(
        (acc, a) => acc + a.workflowHistory.filter((w) => w.status === "COMPLETED").length,
        0
      ),
    [inProgress]
  );

  const pendingActions = React.useMemo(
    () => computePendingActions(apps),
    [apps]
  );

  const bottleneck = React.useMemo(
    () => identifyBottleneck(apps),
    [apps]
  );

  const stagePerf = React.useMemo(
    () => computeStagePerformance(apps),
    [apps]
  );

  // Bottleneck stage label + key (for highlighting)
  const bottleneckKey = React.useMemo(() => {
    if (!bottleneck) return null;
    return WORKFLOW_STAGES.find((s) => s.label === bottleneck.stageLabel)?.key ?? null;
  }, [bottleneck]);

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-dashboard" />
      <PageHeader
        title="Live Workflow Monitor"
        description="Track every application through the approval workflow in real time."
        icon={Activity}
        breadcrumbs={[
          { label: "PM", onClick: () => navigate("pm-dashboard") },
          { label: "Live Workflow Monitor" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total In Progress"
          value={inProgress.length}
          icon={Activity}
          cls="bg-primary/10 text-primary"
        />
        <KpiCard
          label="Completed Stages (sum)"
          value={completedStagesSum}
          icon={ListChecks}
          cls="bg-success/10 text-success"
        />
        <KpiCard
          label="Pending Actions"
          value={pendingActions.length}
          icon={Clock}
          cls="bg-info/10 text-info"
        />
        <KpiCard
          label="Current Bottleneck"
          value={bottleneck ? bottleneck.stageLabel : "—"}
          sub={bottleneck ? `${bottleneck.pendingCount} pending` : "No bottleneck"}
          icon={AlertOctagon}
          cls="bg-destructive/10 text-destructive"
          wide
        />
      </div>

      {/* Stage Performance */}
      <SectionCard
        title="Stage Performance"
        description="Pending counts and average processing time per workflow stage"
        icon={Gauge}
        noPadding
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <TableHead className="px-4 py-2.5 font-bold">Stage</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Responsible Role</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-right">Pending Count</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-right">Avg Processing Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stagePerf.map((p) => {
                const isBottleneck = bottleneckKey === p.stageKey && p.pendingCount > 0;
                return (
                  <TableRow
                    key={p.stageKey}
                    className={isBottleneck ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/30"}
                  >
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{p.stageLabel}</span>
                        {isBottleneck && (
                          <Badge className="bg-destructive text-white text-[9px]">Bottleneck</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <StageRoles stageKey={p.stageKey as WorkflowStageKey} />
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-right text-xs tabular-nums">
                      {p.pendingCount}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-right text-xs tabular-nums">
                      {p.avgDays > 0 ? `${p.avgDays} d` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Live Workflow Table */}
      <LiveWorkflowTable apps={inProgress} />

      {/* Stage-by-Stage Accordion */}
      <StageByStageView apps={inProgress} />
    </div>
  );
}

// ---------- KPI Card (compact, stat-only) ----------
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  cls,
  wide,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  cls: string;
  wide?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-gov " +
        (wide ? "col-span-2 xl:col-span-1" : "")
      }
    >
      <div className={"flex size-10 items-center justify-center rounded-lg " + cls}>
        <Icon className="size-5" />
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

// ---------- Stage Roles Pill ----------
function StageRoles({ stageKey }: { stageKey: WorkflowStageKey }) {
  const roles = rolesForStage(stageKey);
  if (roles.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {roles.map((r) => (
        <RoleBadge key={r} role={r} label={r.replace("_", " ")} />
      ))}
    </div>
  );
}

// ---------- Live Workflow Table (paginated) ----------
function LiveWorkflowTable({ apps }: { apps: Application[] }) {
  const openApplication = useAppStore((s) => s.openApplication);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    // Reset page if dataset shrinks below current page
    const maxPage = Math.max(1, Math.ceil(apps.length / PAGE_SIZE));
    if (page > maxPage) setPage(1);
  }, [apps.length, page]);

  const sorted = React.useMemo(
    () =>
      [...apps].sort((a, b) => {
        // Sort by SLA urgency first: CRITICAL > DELAYED > AT_RISK > ON_TRACK > others
        const order: Record<string, number> = {
          CRITICAL: 0,
          DELAYED: 1,
          BLOCKED: 2,
          AT_RISK: 3,
          ON_TRACK: 4,
          COMPLETED: 5,
        };
        const sa = order[computeSLA(a).status] ?? 6;
        const sb = order[computeSLA(b).status] ?? 6;
        if (sa !== sb) return sa - sb;
        return a.applicationNo.localeCompare(b.applicationNo);
      }),
    [apps]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <SectionCard
      title="Live Workflow"
      description={`${sorted.length} in-progress application${sorted.length === 1 ? "" : "s"}`}
      icon={Activity}
      noPadding
    >
      {sorted.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Activity}
            title="No applications in progress"
            description="All applications are either completed or rejected."
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
                  <TableHead className="px-4 py-2.5 font-bold">Assigned Role</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Assigned Officer</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Pending Since</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold text-right">Expected SLA</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">SLA Status</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Next Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((a) => {
                  const sla = computeSLA(a);
                  const stage = getStage(a.currentStage);
                  const nextStage = stage?.nextStage ? getStage(stage.nextStage) : null;
                  const responsibleRoles = rolesForStage(a.currentStage);
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
                        <span className="text-xs">{a.currentStageLabel}</span>
                        <div className="mt-0.5">
                          <PriorityBadge priority={a.priority} />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {responsibleRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {responsibleRoles.map((r: RoleKey) => (
                              <RoleBadge key={r} role={r} label={r.replace("_", " ")} />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {a.assignedOfficer ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium">{a.assignedOfficer.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                        {timeAgoBrief(sla.pendingSince)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-xs tabular-nums">
                        {sla.expectedDays > 0 ? `${sla.expectedDays} d` : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={sla.cls}>{sla.label}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {nextStage ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            {nextStage.shortLabel}
                            <ArrowRight className="size-3 text-muted-foreground" />
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Final</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={sorted.length}
            startIdx={startIdx}
            endIdx={Math.min(startIdx + PAGE_SIZE, sorted.length)}
            onPage={setPage}
          />
        </>
      )}
    </SectionCard>
  );
}

// ---------- Pagination Bar ----------
function Pagination({
  page,
  totalPages,
  total,
  startIdx,
  endIdx,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  startIdx: number;
  endIdx: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startIdx + 1}–{endIdx}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
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
          onClick={() => onPage(page + 1)}
          className="h-8"
        >
          Next <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------- Stage-by-Stage Accordion ----------
function StageByStageView({ apps }: { apps: Application[] }) {
  const openApplication = useAppStore((s) => s.openApplication);

  // Pre-group applications by stage for fast lookup
  const appsByStage = React.useMemo(() => {
    const map = new Map<string, Application[]>();
    apps.forEach((a) => {
      if (!map.has(a.currentStage)) map.set(a.currentStage, []);
      map.get(a.currentStage)!.push(a);
    });
    return map;
  }, [apps]);

  // Default-open the first stage that has applications
  const defaultOpen = React.useMemo(() => {
    const withApps = WORKFLOW_STAGES.filter((s) => (appsByStage.get(s.key) ?? []).length > 0);
    return withApps.length > 0 ? withApps[0].key : "";
  }, [appsByStage]);

  return (
    <SectionCard
      title="Stage-by-Stage View"
      description="Each workflow stage with the applications currently sitting in it"
      icon={Layers}
    >
      {apps.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No applications in progress"
          description="There are no in-progress applications to group by stage."
        />
      ) : (
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen}
          className="w-full"
        >
          {WORKFLOW_STAGES.map((stage) => {
            const stageApps = appsByStage.get(stage.key) ?? [];
            return (
              <AccordionItem key={stage.key} value={stage.key}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold">{stage.label}</span>
                      <StageRoles stageKey={stage.key} />
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                      <Badge
                        className={
                          stageApps.length > 0
                            ? "bg-primary/10 text-primary text-[10px]"
                            : "bg-muted text-muted-foreground text-[10px]"
                        }
                      >
                        {stageApps.length} app{stageApps.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {stageApps.length === 0 ? (
                    <p className="px-1 py-3 text-xs text-muted-foreground">
                      No applications currently at this stage.
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                            <TableHead className="px-3 py-2 font-bold">Application No.</TableHead>
                            <TableHead className="px-3 py-2 font-bold">Project</TableHead>
                            <TableHead className="px-3 py-2 font-bold">Applicant</TableHead>
                            <TableHead className="px-3 py-2 font-bold">Priority</TableHead>
                            <TableHead className="px-3 py-2 font-bold">Status</TableHead>
                            <TableHead className="px-3 py-2 font-bold">Pending Since</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stageApps.map((a) => {
                            const sla = computeSLA(a);
                            return (
                              <TableRow
                                key={a.id}
                                className="cursor-pointer hover:bg-muted/30"
                                onClick={() => openApplication(a.id, "pm-application-details")}
                              >
                                <TableCell className="px-3 py-2 font-mono text-[11px] font-medium">
                                  {a.applicationNo}
                                </TableCell>
                                <TableCell className="px-3 py-2 text-xs font-medium">
                                  {a.project.name}
                                </TableCell>
                                <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                                  {a.applicant.name}
                                </TableCell>
                                <TableCell className="px-3 py-2">
                                  <PriorityBadge priority={a.priority} />
                                </TableCell>
                                <TableCell className="px-3 py-2">
                                  <StatusBadge status={a.status} showIcon={false} />
                                </TableCell>
                                <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                                  {formatDate(sla.pendingSince)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </SectionCard>
  );
}
