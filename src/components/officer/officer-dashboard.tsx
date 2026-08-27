"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAssignedApplications } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  InfoRow,
} from "@/components/design-system/layout";
import {
  StatusBadge,
  PriorityBadge,
  RoleBadge,
} from "@/components/design-system/badges";
import {
  WorkflowTimeline,
  formatDate,
  formatDateTime,
  timeAgo,
} from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Activity,
  ArrowRight,
  ChevronRight,
  CalendarClock,
  ShieldCheck,
  LayoutDashboard,
  Zap,
  Filter,
  TrendingUp,
  Gauge,
  ListChecks,
  Inbox,
  Undo2,
  FileSearch,
  History,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, ApplicationStatus, RoleKey, WorkflowHistoryEntry } from "@/types";

// ---------- Helpers ----------
function daysRemaining(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function slaTone(days: number | null): { cls: string; label: string; tone: "ok" | "near" | "critical" | "overdue" | "na" } {
  if (days === null) return { cls: "text-muted-foreground", label: "—", tone: "na" };
  if (days < 0) return { cls: "text-destructive font-semibold", label: `Overdue ${Math.abs(days)}d`, tone: "overdue" };
  if (days <= 3) return { cls: "text-destructive font-semibold", label: `${days}d left`, tone: "critical" };
  if (days <= 7) return { cls: "text-amber-600 dark:text-amber-400 font-semibold", label: `${days}d left`, tone: "near" };
  return { cls: "text-success font-medium", label: `${days}d left`, tone: "ok" };
}

// Statuses that count as "pending review" for an officer (in-stage, awaiting action)
const PENDING_REVIEW_STATUSES: ApplicationStatus[] = [
  "TPS_TECHNICAL_SCRUTINY",
  "TPA_REVIEW",
  "ZAD_ZDD_REVIEW",
  "ZJD_REVIEW",
  "DIRECTOR_DP_REVIEW",
  "ADDITIONAL_COMMISSIONER_REVIEW",
  "COMMISSIONER_REVIEW",
  "SHORTFALL_RAISED",
  "DOCUMENT_VERIFICATION",
];

const STAGE_REVIEW_STATUSES: ApplicationStatus[] = [
  "TPS_TECHNICAL_SCRUTINY",
  "TPA_REVIEW",
  "ZAD_ZDD_REVIEW",
  "ZJD_REVIEW",
  "DIRECTOR_DP_REVIEW",
  "ADDITIONAL_COMMISSIONER_REVIEW",
  "COMMISSIONER_REVIEW",
];

// ---------- Quick Filters config ----------
const QUICK_FILTERS: { label: string; value: string; icon: typeof Filter }[] = [
  { label: "Urgent Priority", value: "URGENT", icon: Zap },
  { label: "Near SLA (≤7d)", value: "NEAR_SLA", icon: CalendarClock },
  { label: "Shortfall Open", value: "SHORTFALL", icon: FileWarning },
  { label: "In Review Stage", value: "IN_REVIEW", icon: Clock },
];

export function OfficerDashboard() {
  const { user, navigate, openApplication, notifications, applications } = useAppStore();
  const { toast } = useToast();
  const assigned = useAssignedApplications();

  const role: RoleKey | undefined = user?.role;

  // Derived stats
  const stats = React.useMemo(() => {
    const totalAssigned = assigned.length;
    const pending = assigned.filter((a) => PENDING_REVIEW_STATUSES.includes(a.status)).length;
    const activeShortfalls = assigned.reduce(
      (s, a) => s + a.shortfalls.filter((sf) => sf.status !== "RESOLVED").length,
      0
    );
    const nearSLA = assigned.filter((a) => {
      const d = daysRemaining(a.expectedSLA);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    const recentlyProcessed = role ? getRecentDecisions(role, applications).length : 0;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const returned = applications.filter((a) => a.status === "RETURNED").length;
    return { totalAssigned, pending, activeShortfalls, nearSLA, recentlyProcessed, approved, returned };
  }, [assigned, role, applications]);

  // Priority Queue (sorted: urgent first, then by SLA)
  const priorityQueue = React.useMemo(() => {
    return [...assigned].sort((a, b) => {
      const pa = a.priority === "URGENT" ? 0 : a.priority === "HIGH" ? 1 : 2;
      const pb = b.priority === "URGENT" ? 0 : b.priority === "HIGH" ? 1 : 2;
      if (pa !== pb) return pa - pb;
      const sa = daysRemaining(a.expectedSLA) ?? 9999;
      const sb = daysRemaining(b.expectedSLA) ?? 9999;
      return sa - sb;
    });
  }, [assigned]);

  // Near SLA apps
  const nearSLAApps = React.useMemo(
    () =>
      assigned
        .filter((a) => {
          const d = daysRemaining(a.expectedSLA);
          return d !== null && d >= 0 && d <= 7;
        })
        .sort((a, b) => (daysRemaining(a.expectedSLA) ?? 0) - (daysRemaining(b.expectedSLA) ?? 0)),
    [assigned]
  );

  // Recent decisions timeline (from workflow history across all apps)
  const recentDecisions = React.useMemo(() => {
    if (!role) return [];
    return getRecentDecisions(role, applications).slice(0, 6);
  }, [role, applications]);

  // Workload by status (mini bar chart)
  const workload = React.useMemo(() => {
    const buckets: Record<string, number> = {
      "In Review Stage": 0,
      "Shortfall": 0,
      "Documents Pending": 0,
      "Other": 0,
    };
    assigned.forEach((a) => {
      if (STAGE_REVIEW_STATUSES.includes(a.status)) buckets["In Review Stage"]++;
      else if (a.status === "SHORTFALL_RAISED") buckets["Shortfall"]++;
      else if (a.status === "DOCUMENT_UPLOAD_PENDING") buckets["Documents Pending"]++;
      else buckets["Other"]++;
    });
    const max = Math.max(1, ...Object.values(buckets));
    return { buckets, max };
  }, [assigned]);

  // SLA performance (mocked but realistic: ~87% on-time)
  const slaPerformance = React.useMemo(() => {
    const onTime = 87;
    const avgDays = 4.2;
    const breachRate = 13;
    return { onTime, avgDays, breachRate };
  }, []);

  const recentNotifs = notifications.slice(0, 5);

  function handleQuickFilter(value: string) {
    toast({
      title: "Filter applied",
      description: `Showing applications matching: ${value.replace("_", " ").toLowerCase()}`,
    });
    navigate("officer-applications");
  }

  if (!role) return null;

  const officerTitle = ROLES[role].title;
  const officerFullName = ROLES[role].fullName;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Officer Workspace`}
        description={`Welcome, ${user?.name}. Here is your review pipeline at a glance — ${officerFullName}.`}
        icon={LayoutDashboard}
        breadcrumbs={[
          { label: "Officer Workspace", onClick: () => navigate("officer-dashboard") },
          { label: "Dashboard" },
        ]}
        badge={<RoleBadge role={role} label={officerTitle} />}
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Assigned Applications" value={stats.totalAssigned} icon={ClipboardCheck} accent="primary" onClick={() => navigate("officer-applications")} />
        <StatCard label="Pending Review" value={stats.pending} icon={Clock} accent="info" />
        <StatCard label="Active Shortfalls" value={stats.activeShortfalls} icon={FileWarning} accent="warning" />
        <StatCard label="Near SLA (≤7d)" value={stats.nearSLA} icon={AlertTriangle} accent="amber" onClick={() => navigate("officer-applications")} />
        <StatCard label="Recently Processed" value={stats.recentlyProcessed} icon={Activity} accent="info" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} accent="success" />
        <StatCard label="Returned" value={stats.returned} icon={Undo2} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Priority Queue */}
          <SectionCard
            title="Priority Queue"
            description="Applications assigned to your stage — sorted by priority and SLA urgency"
            icon={ListChecks}
            action={
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("officer-applications")}>
                View all <ChevronRight className="size-3.5" />
              </Button>
            }
            noPadding
          >
            {priorityQueue.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Inbox}
                  title="No applications pending at your stage"
                  description="When an application reaches your review stage in the approval workflow, it will appear here automatically."
                  action={<Button size="sm" variant="outline" onClick={() => navigate("officer-applications")}>Browse all applications</Button>}
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {priorityQueue.slice(0, 6).map((a) => {
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
                            <span className={cn("text-xs tabular-nums", sla.cls)}>{sla.label}</span>
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

          {/* Applications Near SLA */}
          <SectionCard
            title="Applications Near SLA"
            description="Time-critical applications within 7 days of their expected SLA"
            icon={AlertTriangle}
            action={
              nearSLAApps.length > 0 ? (
                <Badge className="bg-warning/15 text-warning-foreground border border-warning/40">
                  {nearSLAApps.length} near SLA
                </Badge>
              ) : undefined
            }
            noPadding
          >
            {nearSLAApps.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={CheckCircle2}
                  title="No SLA risks"
                  description="None of your assigned applications are within 7 days of their expected SLA."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {nearSLAApps.map((a) => {
                  const days = daysRemaining(a.expectedSLA) ?? 0;
                  const sla = slaTone(days);
                  const pct = Math.min(100, Math.max(0, 100 - (days / 30) * 100));
                  return (
                    <li key={a.id} className="p-4 transition-colors hover:bg-warning/[0.04]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => openApplication(a.id, "officer-review")}
                              className="font-mono text-xs font-semibold text-primary hover:underline"
                            >
                              {a.applicationNo}
                            </button>
                            <PriorityBadge priority={a.priority} />
                            <span className="text-xs text-muted-foreground">{a.project.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className={cn("text-xs font-semibold tabular-nums", sla.cls)}>{sla.label}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Expected SLA: {formatDate(a.expectedSLA ?? "")} · Stage: {a.currentStageLabel}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openApplication(a.id, "officer-review")}>
                          Review <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Recent Decisions timeline */}
          <SectionCard
            title="Recent Decisions"
            description="Chronological record of your recent actions across the approval pipeline"
            icon={Activity}
          >
            {recentDecisions.length === 0 ? (
              <EmptyState
                icon={History}
                title="No recent decisions recorded"
                description="Your past workflow actions will appear here as you approve, forward or return applications."
              />
            ) : (
              <WorkflowTimeline
                entries={recentDecisions.map((d) => ({
                  id: `rd-${d.app.id}-${d.entry.id}`,
                  stage: d.entry.stage,
                  stageLabel: d.entry.stageLabel,
                  actor: d.entry.actor,
                  action: `${d.entry.action} — ${d.app.applicationNo}`,
                  remarks: d.entry.remarks,
                  timestamp: d.entry.timestamp,
                  status: "COMPLETED",
                  duration: d.entry.duration,
                }))}
              />
            )}
          </SectionCard>
        </div>

        {/* RIGHT — 1/3 */}
        <div className="space-y-6">
          {/* My Workload mini-chart */}
          <SectionCard title="My Workload" description="Distribution of assigned applications by status" icon={Gauge}>
            <div className="space-y-3">
              {Object.entries(workload.buckets).map(([label, count]) => {
                const pct = Math.round((count / workload.max) * 100);
                const tone =
                  label === "In Review Stage"
                    ? "bg-info"
                    : label === "Shortfall"
                    ? "bg-warning"
                    : label === "Documents Pending"
                    ? "bg-amber-500"
                    : "bg-muted-foreground/60";
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", tone)}
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total in queue</span>
                <span className="text-lg font-semibold tabular-nums">{assigned.length}</span>
              </div>
            </div>
          </SectionCard>

          {/* SLA Performance */}
          <SectionCard title="SLA Performance" description="On-time decision rate · last 30 days" icon={TrendingUp}>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold tabular-nums text-success">{slaPerformance.onTime}%</p>
                  <p className="text-xs text-muted-foreground">On-time decisions</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="size-6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg. days / decision</p>
                  <p className="text-lg font-semibold tabular-nums">{slaPerformance.avgDays}d</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">SLA breach rate</p>
                  <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">{slaPerformance.breachRate}%</p>
                </div>
              </div>
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                <InfoRow label="Target on-time" value={<span className="font-medium">≥ 90%</span>} />
                <InfoRow label="Service level" value={<Badge className="bg-success/10 text-success">Tier A</Badge>} />
                <InfoRow label="Reviewed this month" value={<span className="font-medium">{stats.recentlyProcessed + 14}</span>} />
              </div>
            </div>
          </SectionCard>

          {/* Quick Filters */}
          <SectionCard title="Quick Filters" description="Jump straight to a filtered queue view" icon={Filter} noPadding>
            <div className="grid grid-cols-2 gap-2 p-3">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleQuickFilter(f.value)}
                  className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-gov"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <f.icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{f.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Recent Notifications */}
          <SectionCard
            title="Notifications"
            icon={Activity}
            action={
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("ltp-notifications")}>
                All <ChevronRight className="size-3.5" />
              </Button>
            }
            noPadding
          >
            <ScrollArea className="h-[260px]">
              <ul className="divide-y divide-border">
                {recentNotifs.map((n) => (
                  <li key={n.id} className={cn("p-3 transition-colors hover:bg-muted/40", !n.read && "bg-primary/[0.03]")}>
                    <div className="flex items-start gap-2.5">
                      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                        <Activity className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className={cn("text-xs leading-tight", !n.read && "font-semibold")}>{n.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </SectionCard>

          {/* Officer Profile */}
          <SectionCard title="Your Office" icon={ShieldCheck}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {(user?.name ?? "O").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.designation}</p>
                </div>
                {role && <RoleBadge role={role} label={officerTitle} />}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Employee ID</p>
                  <p className="font-mono font-medium">{user?.employeeId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Zone</p>
                  <p className="font-medium">{user?.zone ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{user?.department ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Last login</p>
                  <p className="font-medium">{user?.lastLogin ? formatDateTime(user.lastLogin) : "—"}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper: extract recent decisions for a role from store applications ----------
function getRecentDecisions(
  role: RoleKey,
  apps: Application[]
): { app: Application; entry: WorkflowHistoryEntry }[] {
  const out: { app: Application; entry: WorkflowHistoryEntry }[] = [];
  for (const app of apps) {
    for (const entry of app.workflowHistory) {
      if (entry.status !== "COMPLETED") continue;
      const stage = getStage(entry.stage);
      if (!stage) continue;
      const stageRole = stage.role;
      const isMatch =
        role === stageRole ||
        entry.actor.role === role ||
        ((role === "TPS" || role === "TPA") && (stageRole === "TPS" || stageRole === "TPA")) ||
        ((role === "ZAD" || role === "ZDD") && (stageRole === "ZAD" || stageRole === "ZDD"));
      if (isMatch && entry.timestamp) {
        out.push({ app, entry });
      }
    }
  }
  return out.sort((a, b) => b.entry.timestamp.localeCompare(a.entry.timestamp));
}
