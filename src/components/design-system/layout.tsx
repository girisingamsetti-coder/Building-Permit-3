"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { LucideIcon, ChevronRight, Inbox, ArrowUpRight, ArrowDownRight } from "lucide-react";

// ---------- Page Header ----------
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  icon: Icon,
  badge,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; onClick?: () => void }[];
  actions?: React.ReactNode;
  icon?: LucideIcon;
  badge?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border pb-5">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {b.onClick ? (
                <button
                  onClick={b.onClick}
                  className="hover:text-foreground transition-colors"
                >
                  {b.label}
                </button>
              ) : (
                <span className={i === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                  {b.label}
                </span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight className="size-3" />}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground max-w-2xl text-balance">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

// ---------- Section Card ----------
export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  noPadding,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}) {
  return (
    <Card className={cn("shadow-gov", className)}>
      {(title || action) && (
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
            )}
            <div className="space-y-0.5">
              {title && <CardTitle className="text-base">{title}</CardTitle>}
              {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </div>
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : "", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

// ---------- Stat Card ----------
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  accent = "primary",
  onClick,
  footer,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: "up" | "down" | "neutral";
  deltaLabel?: string;
  accent?: "primary" | "success" | "warning" | "info" | "destructive" | "amber";
  onClick?: () => void;
  footer?: React.ReactNode;
}) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
    destructive: "bg-destructive/10 text-destructive",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-gov transition-all",
        onClick && "hover:border-primary/40 hover:shadow-gov-lg cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-lg", accentMap[accent])}>
          <Icon className="size-5" />
        </div>
        {delta && deltaLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              delta === "up" && "text-success",
              delta === "down" && "text-destructive",
              delta === "neutral" && "text-muted-foreground"
            )}
          >
            {delta === "up" && <ArrowUpRight className="size-3" />}
            {delta === "down" && <ArrowDownRight className="size-3" />}
            {deltaLabel}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      {footer && <div className="pt-1">{footer}</div>}
    </button>
  );
}

// ---------- Empty State ----------
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Info Grid (description list) ----------
export function InfoGrid({
  items,
  columns = 2,
  className,
}: {
  items: { label: string; value?: React.ReactNode; mono?: boolean }[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const colMap = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4", colMap[columns], className)}>
      {items.map((it, i) => (
        <div key={i} className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{it.label}</dt>
          <dd className={cn("text-sm text-foreground", it.mono && "font-mono")}>
            {it.value ?? <span className="text-muted-foreground">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Info Row (inline label/value) ----------
export function InfoRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-sm text-foreground text-right", mono && "font-mono")}>
        {value ?? <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

// ---------- Loading skeleton grid ----------
export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shadow-gov">
          <CardContent className="space-y-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Key Value Chip ----------
export function KeyValueChip({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{k}</span>
      <Separator orientation="vertical" className="h-3" />
      <span className="text-xs font-medium text-foreground">{v}</span>
    </div>
  );
}
