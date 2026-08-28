"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

// ============================================================
// KPI CARD — modern government-enterprise statistic tile
// Equal height/width, consistent padding, icon, value, label, optional trend.
// Interactive (clickable) with hover/focus states — doesn't look like a button.
// ============================================================

export type KpiAccent = "primary" | "info" | "teal" | "amber" | "success" | "danger" | "orange";

const ACCENT_MAP: Record<KpiAccent, { iconBg: string; iconText: string; accentBar: string }> = {
  primary: { iconBg: "bg-primary/10", iconText: "text-primary", accentBar: "bg-primary" },
  info: { iconBg: "bg-info/10", iconText: "text-info", accentBar: "bg-info" },
  teal: { iconBg: "bg-teal-500/10", iconText: "text-teal-600 dark:text-teal-400", accentBar: "bg-teal-500" },
  amber: { iconBg: "bg-amber-500/10", iconText: "text-amber-600 dark:text-amber-400", accentBar: "bg-amber-500" },
  success: { iconBg: "bg-success/10", iconText: "text-success", accentBar: "bg-success" },
  danger: { iconBg: "bg-destructive/10", iconText: "text-destructive", accentBar: "bg-destructive" },
  orange: { iconBg: "bg-orange-500/10", iconText: "text-orange-600 dark:text-orange-400", accentBar: "bg-orange-500" },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  trend,
  trendLabel,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: KpiAccent;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  onClick?: () => void;
}) {
  const cfg = ACCENT_MAP[accent];
  const clickable = !!onClick;

  const inner = (
    <>
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", cfg.iconBg)}>
          <Icon className="size-4.5" />
        </div>
        {trend && trendLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" && <ArrowUpRight className="size-2.5" />}
            {trendLabel}
          </span>
        )}
      </div>

      {/* Value + label */}
      <div className="flex-1 space-y-0.5">
        <div className="text-2xl font-bold tracking-tight tabular-nums leading-none">{value}</div>
        <div className="text-[11px] leading-tight text-muted-foreground">{label}</div>
      </div>
    </>
  );

  const baseCls = cn(
    "group relative flex h-full min-h-[104px] flex-col gap-3 overflow-hidden rounded-lg border bg-card p-4 transition-all",
    "border-border shadow-gov",
    clickable && "cursor-pointer hover:border-primary/40 hover:shadow-gov-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
  );

  if (clickable) {
    return (
      <button type="button" onClick={onClick} className={baseCls} aria-label={`${label}: ${value}`}>
        {/* accent bar */}
        <div className={cn("absolute inset-x-0 top-0 h-0.5", cfg.accentBar)} />
        {inner}
      </button>
    );
  }

  return (
    <div className={cn(baseCls, "cursor-default")}>
      <div className={cn("absolute inset-x-0 top-0 h-0.5", cfg.accentBar)} />
      {inner}
    </div>
  );
}
