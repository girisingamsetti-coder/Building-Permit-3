"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useVisibleApplications } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/design-system/badges";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Check,
  ExternalLink,
  Search,
} from "lucide-react";
import type { Application, ViewKey } from "@/types";

// ============================================================
// APP SWITCH LOADING HOOK
// Shows a brief loading state when the selected application changes.
// Prevents any visual flash of the previous application's data.
// Returns `true` for ~250ms after the appId changes, then `false`.
// ============================================================
export function useAppSwitchLoading(appId: string | undefined): boolean {
  const [loading, setLoading] = React.useState(false);
  const prevId = React.useRef<string | undefined>(appId);
  React.useEffect(() => {
    if (appId !== prevId.current) {
      prevId.current = appId;
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 250);
      return () => clearTimeout(t);
    }
  }, [appId]);
  return loading;
}

// ============================================================
// APP SWITCH SKELETON
// Lightweight loading skeleton shown during app switching.
// ============================================================
export function AppSwitchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 rounded-xl border border-border bg-card p-4 shadow-gov">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="h-64 rounded-xl border border-border bg-card shadow-gov animate-pulse" />
    </div>
  );
}

// ============================================================
// APPLICATION CONTEXT BAR
// Reusable component showing the currently selected application
// at the top of application-specific pages (Drawings, Documents, Fees, etc.)
// ============================================================

export function ApplicationContextBar({
  app,
  onChangeView,
  showViewButton = true,
}: {
  app: Application;
  onChangeView?: ViewKey;
  showViewButton?: boolean;
}) {
  const { openApplication, navigate } = useAppStore();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-gov sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-primary">{app.applicationNo}</span>
            <StatusBadge status={app.status} showIcon={false} />
          </div>
          <p className="text-sm font-medium truncate">{app.project.name}</p>
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
            <span>{app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
            <span>·</span>
            <span>{app.project.propertyType.replace("_", " ").toLowerCase()}</span>
            <span>·</span>
            <span>Applicant: {app.applicant.name}</span>
            <span>·</span>
            <span>Stage: {app.currentStageLabel}</span>
          </div>
        </div>
      </div>
      {showViewButton && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => openApplication(app.id, "ltp-application-details")}
        >
          <ExternalLink className="size-3.5" /> View Application
        </Button>
      )}
    </div>
  );
}

// ============================================================
// APPLICATION SELECTOR (Searchable)
// Reusable dropdown for switching between applications.
// Trigger shows: Application Number (primary) + Project · Applicant (secondary).
// Dropdown has a built-in search field (by app no, project, applicant).
// Keyboard: ArrowUp/Down to navigate, Enter to select, Escape to close.
// Width 240px, height 40px — aligns with PageHeader.
// ============================================================

export function ApplicationSelector({
  currentApp,
  view,
  apps,
}: {
  currentApp: Application;
  view: ViewKey;
  apps?: Application[];
}) {
  const { openApplication } = useAppStore();
  const visibleApps = useVisibleApplications();
  const allApps = apps ?? visibleApps;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Filter apps by query (case-insensitive, partial match on app no / project / applicant)
  const filtered = React.useMemo(() => {
    if (!query.trim()) return allApps;
    const q = query.toLowerCase();
    return allApps.filter(
      (a) =>
        a.applicationNo.toLowerCase().includes(q) ||
        a.project.name.toLowerCase().includes(q) ||
        a.applicant.name.toLowerCase().includes(q)
    );
  }, [allApps, query]);

  // Reset active index when filtered list changes
  React.useEffect(() => {
    setActiveIndex(0);
  }, [filtered]);

  // Focus search input when dropdown opens; clear query when it closes
  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  // Scroll active item into view
  React.useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-idx="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function handleSelect(appId: string) {
    openApplication(appId, view);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Select application"
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-[240px]"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate font-mono text-xs font-semibold text-primary">
                {currentApp.applicationNo}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {currentApp.project.name} · {currentApp.applicant.name}
              </span>
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0"
        align="end"
        sideOffset={4}
        onKeyDown={handleKeyDown}
      >
        {/* Search field — sticky at top */}
        <div className="sticky top-0 z-10 border-b border-border bg-popover p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications…"
              aria-label="Search applications"
              className="h-8 border-0 bg-muted/40 pl-8 text-xs shadow-none focus-visible:bg-background"
            />
          </div>
        </div>

        {/* Results list — scrollable */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Applications"
          className="max-h-[320px] overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-xs font-medium text-foreground">No applications found.</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Try another application number, project or applicant.
              </p>
            </div>
          ) : (
            filtered.map((a, idx) => {
              const isSelected = a.id === currentApp.id;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={a.id}
                  type="button"
                  data-idx={idx}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(a.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                    isSelected && "bg-primary/10",
                    isActive && !isSelected && "bg-muted",
                    !isActive && !isSelected && "hover:bg-muted/50"
                  )}
                >
                  {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                  {!isSelected && <span className="w-3.5 shrink-0" />}
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-mono text-xs font-semibold text-foreground">
                      {a.applicationNo}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {a.project.name}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {a.applicant.name}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
