"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAssignedApplications } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
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
import { formatDate } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardCheck,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  FileWarning,
  ArrowRight,
  MapPin,
  CalendarClock,
  FileSearch,
  ListFilter,
} from "lucide-react";
import type { ApplicationStatus } from "@/types";

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

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ZONAL_HEAD_REVIEW", label: "Zonal Head Review" },
  { value: "DIRECTOR_REVIEW", label: "Director Review" },
  { value: "ADDITIONAL_COMMISSIONER_REVIEW", label: "Addl. Commissioner Review" },
  { value: "COMMISSIONER_REVIEW", label: "Commissioner Review" },
  { value: "SHORTFALL_RAISED", label: "Shortfall Raised" },
  { value: "DOCUMENT_UPLOAD_PENDING", label: "Documents Pending" },
  { value: "RETURNED", label: "Returned" },
];

const PENDING_REVIEW_STATUSES: ApplicationStatus[] = [
  "ZONAL_HEAD_REVIEW",
  "DIRECTOR_REVIEW",
  "ADDITIONAL_COMMISSIONER_REVIEW",
  "COMMISSIONER_REVIEW",
  "SHORTFALL_RAISED",
];

const PRIORITY_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
];

export function OfficerApplications() {
  const { user, navigate, openApplication } = useAppStore();
  const assigned = useAssignedApplications();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [priority, setPriority] = React.useState("ALL");

  const filtered = React.useMemo(() => {
    let list = [...assigned];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.applicationNo.toLowerCase().includes(q) ||
          a.project.name.toLowerCase().includes(q) ||
          a.applicant.name.toLowerCase().includes(q) ||
          a.ltpName.toLowerCase().includes(q)
      );
    }
    if (status !== "ALL") list = list.filter((a) => a.status === status);
    if (priority !== "ALL") list = list.filter((a) => a.priority === priority);
    return list.sort((a, b) => {
      // Sort by SLA urgency first, then priority, then last updated
      const sa = daysRemaining(a.expectedSLA) ?? 9999;
      const sb = daysRemaining(b.expectedSLA) ?? 9999;
      if (sa !== sb) return sa - sb;
      const pa = a.priority === "URGENT" ? 0 : a.priority === "HIGH" ? 1 : 2;
      const pb = b.priority === "URGENT" ? 0 : b.priority === "HIGH" ? 1 : 2;
      if (pa !== pb) return pa - pb;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [assigned, query, status, priority]);

  const counts = React.useMemo(() => {
    const nearSLA = assigned.filter((a) => {
      const d = daysRemaining(a.expectedSLA);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    return {
      total: assigned.length,
      pending: assigned.filter((a) => PENDING_REVIEW_STATUSES.includes(a.status)).length,
      nearSLA,
      shortfalls: assigned.reduce(
        (s, a) => s + a.shortfalls.filter((sf) => sf.status !== "RESOLVED").length,
        0
      ),
    };
  }, [assigned]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Queue"
        description="Applications currently awaiting your review action. Sorted by SLA urgency and priority."
        icon={ClipboardCheck}
        breadcrumbs={[
          { label: "Officer Workspace", onClick: () => navigate("officer-dashboard") },
          { label: "Assigned Queue" },
        ]}
        badge={user ? <RoleBadge role={user.role} label={ROLES[user.role].title} /> : undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("officer-dashboard")}>
            <CalendarClock className="size-4" /> Dashboard
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Assigned" value={counts.total} icon={ClipboardCheck} accent="primary" onClick={() => navigate("officer-applications")} />
        <StatCard label="Pending Review" value={counts.pending} icon={Clock} accent="info" />
        <StatCard label="Near SLA (≤7d)" value={counts.nearSLA} icon={AlertTriangle} accent="warning" />
        <StatCard label="Active Shortfalls" value={counts.shortfalls} icon={FileWarning} accent="destructive" />
      </div>

      <SectionCard noPadding>
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by application no, project, applicant or LTP…"
              className="h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[160px]">
                <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-9 w-[150px]">
                <ListFilter className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileSearch}
              title={assigned.length === 0 ? "No applications assigned to your stage" : "No applications match your filters"}
              description={
                assigned.length === 0
                  ? "Applications will appear here when they reach your review stage in the approval workflow."
                  : "Try adjusting your search query or filters."
              }
              action={
                assigned.length === 0 ? (
                  <Button size="sm" variant="outline" onClick={() => navigate("officer-dashboard")}>
                    Back to dashboard
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setQuery(""); setStatus("ALL"); setPriority("ALL"); }}>
                    Clear filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Application No.</th>
                  <th className="px-4 py-2.5 font-medium">Project</th>
                  <th className="px-4 py-2.5 font-medium">Applicant / LTP</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Current Stage</th>
                  <th className="px-4 py-2.5 font-medium">Assigned Officer</th>
                  <th className="px-4 py-2.5 font-medium">SLA</th>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => {
                  const days = daysRemaining(a.expectedSLA);
                  const sla = slaTone(days);
                  return (
                    <tr key={a.id} className="group transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openApplication(a.id, "officer-review")}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {a.applicationNo}
                        </button>
                        <div className="text-[10px] text-muted-foreground">
                          Submitted {formatDate(a.submissionDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="truncate text-xs font-medium">{a.project.name}</p>
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="size-2.5" /> {a.project.ward} · {a.project.zone}
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="truncate text-xs font-medium">{a.applicant.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">via {a.ltpName}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} showIcon={false} /></td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">{a.currentStageLabel}</span>
                        <div className="text-[10px] text-muted-foreground">
                          {a.progress}% complete
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.assignedOfficer ? (
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs">{a.assignedOfficer.name}</span>
                            <RoleBadge role={a.assignedOfficer.role} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-help">
                              <Clock className={cn("size-3.5", sla.cls)} />
                              <span className={cn("text-xs tabular-nums", sla.cls)}>{sla.label}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Expected SLA: {formatDate(a.expectedSLA ?? "")}</span>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={a.priority} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openApplication(a.id, "officer-review")}
                        >
                          Open Review <ArrowRight className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
              <span className="font-medium text-foreground">{assigned.length}</span> assigned application{assigned.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-success" /> On track</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> Near SLA</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-destructive" /> Critical</span>
            </span>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
