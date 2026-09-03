"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  useAllApplications,
  computeSLA,
  type SLAStatus,
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
} from "@/components/design-system/badges";
import { timeAgo } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORKFLOW_STAGES } from "@/data/workflow-config";
import {
  FileStack,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import type { ApplicationStatus } from "@/types";

// ============================================================
// PROJECT MANAGER — APPLICATIONS OVERVIEW
// Searchable / filterable / paginated table of all applications.
// READ-ONLY: only "View" actions (no edit/approve/reject buttons).
// ============================================================

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "DRAWING_UPLOADED", label: "Drawing Uploaded" },
  { value: "SCRUTINY_IN_PROGRESS", label: "Scrutiny In Progress" },
  { value: "SCRUTINY_FAILED", label: "Scrutiny Failed" },
  { value: "DRAWING_REUPLOAD_REQUIRED", label: "Drawing Reupload Required" },
  { value: "SCRUTINY_PASSED", label: "Scrutiny Passed" },
  { value: "DOCUMENT_UPLOAD_PENDING", label: "Documents Pending" },
  { value: "DOCUMENT_VERIFICATION", label: "Under Verification" },
  { value: "FEE_GENERATED", label: "Fee Generated" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_PROCESSING", label: "Payment Processing" },
  { value: "PAYMENT_SUCCESS", label: "Payment Successful" },
  { value: "TPS_TECHNICAL_SCRUTINY", label: "TPS Technical Scrutiny" },
  { value: "TPA_REVIEW", label: "TPA Review" },
  { value: "ZAD_ZDD_REVIEW", label: "ZAD/ZDD Review" },
  { value: "ZJD_REVIEW", label: "ZJD Review" },
  { value: "DIRECTOR_DP_REVIEW", label: "Director DP Review" },
  { value: "ADDITIONAL_COMMISSIONER_REVIEW", label: "Addl. Commissioner Review" },
  { value: "COMMISSIONER_REVIEW", label: "Commissioner Review" },
  { value: "SHORTFALL_RAISED", label: "Shortfall Raised" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RETURNED", label: "Returned" },
];

const STAGE_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All stages" },
  ...WORKFLOW_STAGES.map((s) => ({ value: s.key, label: s.label })),
];

const SLA_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All SLA statuses" },
  { value: "ON_TRACK", label: "On Track" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "DELAYED", label: "Delayed" },
  { value: "CRITICAL", label: "Critical" },
  { value: "BLOCKED", label: "Blocked" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Map ApplicationStatus → application type label is already in the app data,
// but we render `app.project.type` (ApplicationType) as a short label here.
const APP_TYPE_LABELS: Record<string, string> = {
  BUILDING_PERMISSION: "Building Permission",
  LAYOUT_APPROVAL: "Layout Approval",
  OCCUPANCY_CERTIFICATE: "Occupancy Certificate",
  REVISION_PERMISSION: "Revision Permission",
  DEVELOPMENT_PERMIT: "Development Permit",
  DEMOLITION_PERMIT: "Demolition Permit",
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PmApplications() {
  const navigate = useAppStore((s) => s.navigate);
  const openApplication = useAppStore((s) => s.openApplication);
  const apps = useAllApplications();

  // ---- Filter / pagination state ----
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [stageFilter, setStageFilter] = React.useState("ALL");
  const [slaFilter, setSlaFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  // ---- Pre-compute SLA per app (memoised so we don't recompute on each render) ----
  const slaMap = React.useMemo(() => {
    const m = new Map<string, { status: SLAStatus; label: string; cls: string }>();
    apps.forEach((a) => {
      const sla = computeSLA(a);
      m.set(a.id, { status: sla.status, label: sla.label, cls: sla.cls });
    });
    return m;
  }, [apps]);

  // ---- Derived: filtered + sorted list ----
  const filteredApps = React.useMemo(() => {
    let list = apps;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.applicationNo.toLowerCase().includes(q) ||
          a.project.name.toLowerCase().includes(q) ||
          a.applicant.name.toLowerCase().includes(q) ||
          (a.assignedOfficer?.name ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((a) => a.status === (statusFilter as ApplicationStatus));
    }
    if (stageFilter !== "ALL") {
      list = list.filter((a) => a.currentStage === stageFilter);
    }
    if (slaFilter !== "ALL") {
      list = list.filter((a) => slaMap.get(a.id)?.status === slaFilter);
    }
    // Sort by last-updated descending (most recent first)
    return [...list].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  }, [apps, query, statusFilter, stageFilter, slaFilter, slaMap]);

  // ---- Pagination math ----
  const totalApps = filteredApps.length;
  const totalPages = Math.max(1, Math.ceil(totalApps / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalApps);
  const pageApps = filteredApps.slice(startIndex, endIndex);

  // Reset page when filters or pageSize change
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  React.useEffect(() => {
    setPage(1);
  }, [query, statusFilter, stageFilter, slaFilter, pageSize]);

  // ---- KPI counts (computed from the unfiltered dataset) ----
  const counts = React.useMemo(() => {
    const total = apps.length;
    const inProgress = apps.filter(
      (a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status)
    ).length;
    const approved = apps.filter((a) => a.status === "APPROVED").length;
    const delayed = apps.filter((a) => {
      const sla = slaMap.get(a.id);
      return (
        sla?.status === "DELAYED" ||
        sla?.status === "CRITICAL" ||
        sla?.status === "AT_RISK" ||
        sla?.status === "BLOCKED"
      );
    }).length;
    return { total, inProgress, approved, delayed };
  }, [apps, slaMap]);

  const hasActiveFilters =
    query.trim() !== "" ||
    statusFilter !== "ALL" ||
    stageFilter !== "ALL" ||
    slaFilter !== "ALL";

  function handleClearFilters() {
    setQuery("");
    setStatusFilter("ALL");
    setStageFilter("ALL");
    setSlaFilter("ALL");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="All building permit applications across the workflow."
        icon={FileStack}
        breadcrumbs={[{ label: "Project Manager" }, { label: "Applications" }]}
      />

      {/* ===== KPI cards (4-col grid) ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={counts.total}
          icon={FileStack}
          accent="primary"
        />
        <StatCard
          label="In Progress"
          value={counts.inProgress}
          icon={Clock}
          accent="info"
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Delayed / At Risk"
          value={counts.delayed}
          icon={AlertTriangle}
          accent="destructive"
        />
      </div>

      <SectionCard noPadding>
        {/* ===== Filter toolbar ===== */}
        <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by application no, project, applicant, officer…"
              className="h-9 pl-9"
              aria-label="Search applications"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="h-9 w-full lg:w-[200px]"
              aria-label="Filter by status"
            >
              <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stage filter */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger
              className="h-9 w-full lg:w-[200px]"
              aria-label="Filter by workflow stage"
            >
              <SlidersHorizontal className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* SLA filter */}
          <Select value={slaFilter} onValueChange={setSlaFilter}>
            <SelectTrigger
              className="h-9 w-full lg:w-[180px]"
              aria-label="Filter by SLA status"
            >
              <Clock className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLA_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ===== Active filter chips + result count ===== */}
        <div className="flex flex-col gap-2 border-b border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {totalApps} {totalApps === 1 ? "application" : "applications"}
              {hasActiveFilters && " match your filters"}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleClearFilters}
              >
                <X className="size-3" /> Clear filters
              </Button>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Sorted by Last Updated (newest first)
          </span>
        </div>

        {/* ===== Table body ===== */}
        {pageApps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileStack}
              title={
                hasActiveFilters
                  ? "No applications match your filters"
                  : "No applications found"
              }
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters, or clear them to see all applications."
                  : "Applications will appear here once they are created."
              }
              action={
                hasActiveFilters ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    <X className="size-4" /> Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                All building permit applications
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
                    App Type
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
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageApps.map((a) => {
                  const sla = slaMap.get(a.id);
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
                        <span className="text-xs">
                          {APP_TYPE_LABELS[a.project.type] ?? a.project.type}
                        </span>
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
                          <Progress value={a.progress} className="h-1.5 w-14" />
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {a.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {sla ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] font-medium",
                              sla.cls
                            )}
                          >
                            {sla.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo(a.lastUpdated)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            openApplication(a.id, "pm-application-details")
                          }
                          aria-label={`View application ${a.applicationNo}`}
                        >
                          View <ArrowRight className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== Pagination footer ===== */}
        {totalApps > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {startIndex + 1}–{endIndex}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {totalApps}
                </span>
              </p>
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="pm-apps-page-size"
                  className="sr-only sm:not-sr-only sm:ml-1 sm:text-xs sm:text-muted-foreground"
                >
                  Rows
                </label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger
                    id="pm-apps-page-size"
                    className="h-8 w-[72px] text-xs"
                    aria-label="Rows per page"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {totalPages > 1 && (
              <div
                className="flex items-center gap-1"
                role="navigation"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                {buildPageList(page, totalPages).map((p, idx) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors",
                        p === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Slim footer note — PM is read-only */}
      <p className="text-center text-[11px] text-muted-foreground">
        Project Manager view is read-only ·{" "}
        <button
          onClick={() => navigate("pm-dashboard")}
          className="text-primary hover:underline"
        >
          Back to Dashboard
        </button>
      </p>
    </div>
  );
}

// ============================================================
// PAGE LIST BUILDER (with ellipsis)
// ============================================================

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}
