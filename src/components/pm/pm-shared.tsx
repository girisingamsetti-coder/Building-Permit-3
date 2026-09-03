"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

// ============================================================
// REUSABLE PM DASHBOARD COMPONENTS
// PmSearchInput, PmFilterSelect, PmPagination
// Used across every data-heavy section of the PM dashboard
// so there is ONE consistent pagination/search/filter implementation.
// ============================================================

// ---------- PmSearchInput ----------
// Compact search input (36-40px height) with clear button.
export function PmSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        aria-label={placeholder ?? "Search"}
        className="h-9 pl-8 pr-7 text-xs"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ---------- PmFilterSelect ----------
// Compact filter dropdown (36-40px height).
export function PmFilterSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-9 text-xs", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------- PmPagination ----------
// Reusable pagination: "Showing X–Y of Z" + prev/next + numbered pages.
// Pagination happens AFTER search/filter/sort (caller passes the filtered+sorted list).
export function PmPagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  // Build page list with ellipsis
  const pages: (number | "…")[] = buildPageList(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startIndex + 1}–{endIndex}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          {pages.map((p, idx) =>
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
                onClick={() => onPageChange(p)}
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
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- usePmPagination hook ----------
// Manages page state + resets to page 1 when filters/search change.
export function usePmPagination() {
  const [page, setPage] = React.useState(1);
  // Reset to page 1 — call this from a useEffect that watches filter/search deps.
  const reset = React.useCallback(() => setPage(1), []);
  return { page, setPage, reset };
}

// ---------- buildPageList helper ----------
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

// ---------- PmCardHeader ----------
// Consistent card header: LEFT = icon + title + subtitle, RIGHT = controls.
export function PmCardHeader({
  icon: Icon,
  title,
  subtitle,
  controls,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {controls && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {controls}
        </div>
      )}
    </div>
  );
}

// ---------- PmEmptyState ----------
// Compact empty state for "no results after search/filter".
export function PmEmptyState({
  message,
  onClear,
  clearLabel,
}: {
  message?: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        {message ?? "No matching records found."}
      </p>
      {onClear && (
        <Button variant="outline" size="sm" className="mt-2 h-8 text-xs" onClick={onClear}>
          {clearLabel ?? "Clear Filters"}
        </Button>
      )}
    </div>
  );
}
