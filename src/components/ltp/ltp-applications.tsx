"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useVisibleApplications } from "@/store/app-store";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { StatusBadge, PriorityBadge } from "@/components/design-system/badges";
import { timeAgo } from "@/components/design-system/workflow";
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
  FileStack,
  FilePlus2,
  Search,
  Filter,
  ArrowRight,
  LayoutGrid,
  List,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  Hash,
  Building2,
  AlertCircle,
} from "lucide-react";
import type { Application, ApplicationStatus } from "@/types";
import { NewApplicationModal } from "@/components/ltp/new-application/new-application-modal";

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "DRAWING_UPLOADED", label: "Drawing Uploaded" },
  { value: "SCRUTINY_IN_PROGRESS", label: "Scrutiny In Progress" },
  { value: "SCRUTINY_FAILED", label: "Scrutiny Failed" },
  { value: "DRAWING_REUPLOAD_REQUIRED", label: "Drawing Reupload Required" },
  { value: "DOCUMENT_UPLOAD_PENDING", label: "Documents Pending" },
  { value: "SHORTFALL_RAISED", label: "Shortfall Raised" },
  { value: "FEE_GENERATED", label: "Fee Generated" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "TPS_TECHNICAL_SCRUTINY", label: "TPS Technical Scrutiny" },
  { value: "TPA_REVIEW", label: "TPA Review" },
  { value: "ZAD_ZDD_REVIEW", label: "ZAD/ZDD Review" },
  { value: "ZJD_REVIEW", label: "ZJD Review" },
  { value: "DIRECTOR_DP_REVIEW", label: "Director DP Review" },
  { value: "ADDITIONAL_COMMISSIONER_REVIEW", label: "Addl. Commissioner Review" },
  { value: "COMMISSIONER_REVIEW", label: "Commissioner Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RETURNED", label: "Returned" },
];

type SortKey =
  | "lastUpdated"
  | "submissionDate"
  | "applicationNo"
  | "projectName"
  | "status"
  | "priority";

type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: string; label: string; key: SortKey; dir: SortDir }[] = [
  { value: "lastUpdated-desc", label: "Last Updated (newest first)", key: "lastUpdated", dir: "desc" },
  { value: "lastUpdated-asc", label: "Last Updated (oldest first)", key: "lastUpdated", dir: "asc" },
  { value: "submissionDate-desc", label: "Submission Date (newest first)", key: "submissionDate", dir: "desc" },
  { value: "submissionDate-asc", label: "Submission Date (oldest first)", key: "submissionDate", dir: "asc" },
  { value: "applicationNo-asc", label: "Application No. (A → Z)", key: "applicationNo", dir: "asc" },
  { value: "applicationNo-desc", label: "Application No. (Z → A)", key: "applicationNo", dir: "desc" },
  { value: "projectName-asc", label: "Project Name (A → Z)", key: "projectName", dir: "asc" },
  { value: "projectName-desc", label: "Project Name (Z → A)", key: "projectName", dir: "desc" },
  { value: "status-asc", label: "Status (A → Z)", key: "status", dir: "asc" },
  { value: "status-desc", label: "Status (Z → A)", key: "status", dir: "desc" },
  { value: "priority-desc", label: "Priority (high → low)", key: "priority", dir: "desc" },
  { value: "priority-asc", label: "Priority (low → high)", key: "priority", dir: "asc" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const PRIORITY_RANK: Record<Application["priority"], number> = {
  URGENT: 3,
  HIGH: 2,
  NORMAL: 1,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LtpApplications() {
  const { user, openApplication, navigate } = useAppStore();
  const visibleApps = useVisibleApplications();

  // ---- Filter / sort / pagination state ----
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [sortKey, setSortKey] = React.useState<SortKey>("lastUpdated");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [newAppOpen, setNewAppOpen] = React.useState(false);

  // ---- Derived: filtered + sorted list ----
  const filteredApps = React.useMemo(() => {
    let list = visibleApps;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.applicationNo.toLowerCase().includes(q) ||
          a.project.name.toLowerCase().includes(q) ||
          a.applicant.name.toLowerCase().includes(q) ||
          a.project.ward.toLowerCase().includes(q) ||
          a.project.zone.toLowerCase().includes(q)
      );
    }
    if (status !== "ALL") list = list.filter((a) => a.status === status);

    // Sort
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "lastUpdated":
          cmp = a.lastUpdated.localeCompare(b.lastUpdated);
          break;
        case "submissionDate":
          cmp = a.submissionDate.localeCompare(b.submissionDate);
          break;
        case "applicationNo":
          cmp = a.applicationNo.localeCompare(b.applicationNo);
          break;
        case "projectName":
          cmp = a.project.name.localeCompare(b.project.name);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "priority":
          cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          break;
        default:
          cmp = 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [visibleApps, query, status, sortKey, sortDir]);

  // ---- Pagination math ----
  const totalApps = filteredApps.length;
  const totalPages = Math.max(1, Math.ceil(totalApps / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalApps);
  const pageApps = filteredApps.slice(startIndex, endIndex);

  // Reset to page 1 when filters/sort/pageSize change (guard against out-of-range)
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // Reset page to 1 whenever the filter/sort inputs change
  React.useEffect(() => {
    setPage(1);
  }, [query, status, sortKey, sortDir, pageSize]);

  // ---- KPI counts (computed from the unfiltered visible set) ----
  const ACTION_STATUSES = [
    "SCRUTINY_FAILED",
    "SHORTFALL_RAISED",
    "PAYMENT_PENDING",
    "DOCUMENT_UPLOAD_PENDING",
    "DRAWING_REUPLOAD_REQUIRED",
  ];
  const counts = {
    total: visibleApps.length,
    active: visibleApps.filter((a) => !["APPROVED", "REJECTED"].includes(a.status)).length,
    approved: visibleApps.filter((a) => a.status === "APPROVED").length,
    action: visibleApps.filter((a) => ACTION_STATUSES.includes(a.status)).length,
  };

  const hasActiveFilters = query.trim() !== "" || status !== "ALL";

  function handleClearFilters() {
    setQuery("");
    setStatus("ALL");
  }

  function handleSortChange(value: string) {
    const opt = SORT_OPTIONS.find((o) => o.value === value);
    if (opt) {
      setSortKey(opt.key);
      setSortDir(opt.dir);
    }
  }

  // Toggle sort by clicking a column header
  function toggleColumnSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      // Default direction per column
      const defaultDir: SortDir = key === "lastUpdated" || key === "submissionDate" || key === "priority" ? "desc" : "asc";
      setSortKey(key);
      setSortDir(defaultDir);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="All building and project approval applications you have submitted."
        icon={FileStack}
        breadcrumbs={[
          { label: "LTP Portal", onClick: () => navigate("ltp-dashboard") },
          { label: "Applications" },
        ]}
        actions={
          <Button size="sm" onClick={() => setNewAppOpen(true)}>
            <FilePlus2 className="size-4" /> New Application
          </Button>
        }
      />

      {/* ===== KPI cards ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} icon={FileStack} accent="primary" />
        <StatCard label="Active" value={counts.active} icon={Clock} accent="info" />
        <StatCard label="Action Required" value={counts.action} icon={AlertTriangle} accent="warning" />
        <StatCard label="Approved" value={counts.approved} icon={CheckCircle2} accent="success" />
      </div>

      <SectionCard noPadding>
        {/* ===== Filter / sort / view toolbar ===== */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by application no, project, applicant, ward, zone…"
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
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-full sm:w-[180px]" aria-label="Filter by status">
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

          {/* Sort */}
          <Select
            value={`${sortKey}-${sortDir}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="h-9 w-full sm:w-[230px]" aria-label="Sort applications">
              <ChevronsUpDown className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex items-center rounded-md border border-border" role="group" aria-label="View toggle">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setView("table")}
              aria-label="List view"
              aria-pressed={view === "table"}
            >
              <List className="size-4" />
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
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
            Sorted by {SORT_OPTIONS.find((o) => o.key === sortKey && o.dir === sortDir)?.label ?? "Last Updated"}
          </span>
        </div>

        {/* ===== List / Grid body ===== */}
        {pageApps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title={hasActiveFilters ? "No applications match your filters" : "No applications found"}
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters, or clear them to see all applications."
                  : "Create a new application to get started."
              }
              action={
                hasActiveFilters ? (
                  <Button size="sm" variant="outline" onClick={handleClearFilters}>
                    <X className="size-4" /> Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setNewAppOpen(true)}>
                    <FilePlus2 className="size-4" /> New Application
                  </Button>
                )
              }
            />
          </div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                <tr className="border-b-2 border-border text-left text-[11px] uppercase tracking-wide text-foreground">
                  <SortableTh
                    label="Application No."
                    active={sortKey === "applicationNo"}
                    dir={sortDir}
                    onClick={() => toggleColumnSort("applicationNo")}
                    icon={Hash}
                  />
                  <SortableTh
                    label="Project"
                    active={sortKey === "projectName"}
                    dir={sortDir}
                    onClick={() => toggleColumnSort("projectName")}
                    icon={Building2}
                  />
                  <th className="px-4 py-3 font-bold">Applicant</th>
                  <SortableTh
                    label="Status"
                    active={sortKey === "status"}
                    dir={sortDir}
                    onClick={() => toggleColumnSort("status")}
                  />
                  <th className="px-4 py-3 font-bold">Current Stage</th>
                  <SortableTh
                    label="Priority"
                    active={sortKey === "priority"}
                    dir={sortDir}
                    onClick={() => toggleColumnSort("priority")}
                  />
                  <SortableTh
                    label="Submitted"
                    active={sortKey === "submissionDate"}
                    dir={sortDir}
                    onClick={() => toggleColumnSort("submissionDate")}
                    icon={Calendar}
                  />
                  <SortableTh
                    label="Updated"
                    active={sortKey === "lastUpdated"}
                    dir={sortDir}
                    onClick={() => toggleColumnSort("lastUpdated")}
                    icon={Clock}
                  />
                  <th className="px-4 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageApps.map((a) => (
                  <tr
                    key={a.id}
                    className="group cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => openApplication(a.id)}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openApplication(a.id);
                        }}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {a.applicationNo}
                      </button>
                      <div className="text-[10px] text-muted-foreground">{formatDate(a.submissionDate)}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="truncate text-xs font-medium">{a.project.name}</p>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="size-2.5" /> {a.project.ward} · {a.project.zone}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="truncate text-xs">{a.applicant.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {a.project.propertyType.replace("_", " ").toLowerCase()}
                      </p>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={a.status} showIcon={false} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{a.currentStageLabel}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <PriorityBadge priority={a.priority} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(a.submissionDate)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(a.lastUpdated)}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => openApplication(a.id)}
                      >
                        Open <ArrowRight className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {pageApps.map((a) => (
              <ApplicationCard key={a.id} app={a} onOpen={() => openApplication(a.id)} />
            ))}
          </div>
        )}

        {/* ===== Pagination footer ===== */}
        {totalApps > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startIndex + 1}–{endIndex}</span> of{" "}
                <span className="font-medium text-foreground">{totalApps}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <label htmlFor="page-size" className="text-xs text-muted-foreground sr-only sm:not-sr-only sm:ml-1">
                  Rows
                </label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger
                    id="page-size"
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
              <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
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

      {/* ===== New Application Modal ===== */}
      <NewApplicationModal open={newAppOpen} onOpenChange={setNewAppOpen} />
    </div>
  );
}

// ============================================================
// SORTABLE TABLE HEADER
// ============================================================

function SortableTh({
  label,
  active,
  dir,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <th
      className="px-4 py-3 font-bold"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-0.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-colors hover:text-primary",
          active && "text-primary"
        )}
        aria-label={`Sort by ${label}, currently ${active ? (dir === "asc" ? "ascending" : "descending") : "unsorted"}`}
      >
        {Icon && <Icon className="size-3" />}
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )
        ) : (
          <ChevronsUpDown className="size-3 opacity-40" />
        )}
      </button>
    </th>
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

// ============================================================
// APPLICATION CARD (grid view)
// ============================================================

function ApplicationCard({ app, onOpen }: { app: Application; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-gov transition-all hover:border-primary/40 hover:shadow-gov-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-primary">{app.applicationNo}</p>
          <p className="truncate text-sm font-medium">{app.project.name}</p>
        </div>
        <PriorityBadge priority={app.priority} />
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="size-3" /> {app.project.ward} · {app.project.zone}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={app.status} showIcon={false} />
        <span className="text-[11px] text-muted-foreground">{timeAgo(app.lastUpdated)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-[11px] text-muted-foreground">
          Stage: <span className="font-medium text-foreground">{app.currentStageLabel}</span>
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </button>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
