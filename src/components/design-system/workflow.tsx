"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  CircleDot,
  CornerDownRight,
  FileWarning,
  ChevronRight,
} from "lucide-react";
import { WORKFLOW_STAGES } from "@/data/mock-data";
import type {
  WorkflowHistoryEntry,
  WorkflowStageKey,
  RoleKey,
} from "@/types";
import { RoleBadge } from "./badges";

// ---------- Horizontal Workflow Stepper ----------
export function WorkflowStepper({
  currentStage,
  status,
  className,
  variant,
}: {
  currentStage: WorkflowStageKey;
  status: "COMPLETED" | "CURRENT" | "FAILED" | "RETURNED" | "SHORTFALL";
  className?: string;
  variant?: "default" | "maroon";
}) {
  const currentOrder = WORKFLOW_STAGES.find((s) => s.key === currentStage)?.order ?? 0;
  const isFinished = status === "COMPLETED";

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <ol className="flex min-w-max items-start gap-0 px-1 py-2">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const isCurrent = stage.order === currentOrder && !isFinished;
          const isPast = stage.order < currentOrder || (isFinished && stage.order <= currentOrder);
          const isFuture = stage.order > currentOrder && !isFinished;
          const isFailed = status === "FAILED" && isCurrent;
          const isShortfall = status === "SHORTFALL" && isCurrent;

          let dotCls = "";
          let labelCls = "";
          let Icon = CircleDot;
          if (isPast) {
            dotCls = variant === "maroon"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
              : "bg-success text-success-foreground border-success";
            labelCls = variant === "maroon" ? "text-slate-800 font-semibold" : "text-foreground font-medium";
            Icon = Check;
          } else if (isCurrent) {
            if (isFailed) {
              dotCls = "bg-rose-700 text-white border-rose-700 ring-4 ring-rose-700/15";
              Icon = X;
            } else if (isShortfall) {
              dotCls = "bg-amber-600 text-white border-amber-600 ring-4 ring-amber-600/15";
              Icon = AlertTriangle;
            } else {
              dotCls = variant === "maroon"
                ? "bg-[#7A1316] text-white border-[#7A1316] ring-4 ring-[#7A1316]/20 shadow-xs"
                : "bg-primary text-primary-foreground border-primary ring-4 ring-primary/15";
              Icon = Clock;
            }
            labelCls = variant === "maroon" ? "text-[#7A1316] font-bold" : "text-foreground font-semibold";
          } else {
            dotCls = variant === "maroon"
              ? "bg-white text-slate-400 border-[#DCD5C8]"
              : "bg-background text-muted-foreground border-border";
            labelCls = "text-muted-foreground";
            Icon = CircleDot;
          }

          return (
            <li key={stage.key} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5 px-2 w-28">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 transition-all",
                    dotCls
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className={cn("text-[11px] leading-tight", labelCls)}>{stage.label}</p>
                  <p className={cn("text-[10px]", variant === "maroon" ? "text-slate-500 font-medium" : "text-muted-foreground")}>{stage.role}</p>
                </div>
              </div>
              {idx < WORKFLOW_STAGES.length - 1 && (
                <div className="relative top-4 h-0.5 w-8 -mx-1 shrink-0">
                  <div
                    className={cn(
                      "h-full w-full rounded-full",
                      variant === "maroon"
                        ? (isPast ? "bg-emerald-600" : isCurrent ? "bg-[#7A1316]" : "bg-[#DCD5C8]")
                        : (isPast || isCurrent ? "bg-success" : "bg-border")
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------- Vertical Workflow Timeline (from history) ----------
export function WorkflowTimeline({
  entries,
  className,
  variant,
}: {
  entries: WorkflowHistoryEntry[];
  className?: string;
  variant?: "default" | "maroon";
}) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {entries.map((e, idx) => {
        const isLast = idx === entries.length - 1;
        let dotCls = variant === "maroon" ? "bg-white text-slate-400 border-[#DCD5C8]" : "bg-muted text-muted-foreground border-border";
        let Icon = Clock;
        if (e.status === "COMPLETED") {
          dotCls = variant === "maroon" ? "bg-emerald-700 text-white border-emerald-700" : "bg-success text-success-foreground border-success";
          Icon = Check;
        } else if (e.status === "CURRENT") {
          dotCls = variant === "maroon" ? "bg-[#7A1316] text-white border-[#7A1316] ring-4 ring-[#7A1316]/20 shadow-xs" : "bg-primary text-primary-foreground border-primary ring-4 ring-primary/10";
          Icon = Clock;
        } else if (e.status === "FAILED") {
          dotCls = "bg-rose-700 text-white border-rose-700";
          Icon = X;
        } else if (e.status === "RETURNED") {
          dotCls = "bg-amber-600 text-white border-amber-600";
          Icon = CornerDownRight;
        } else if (e.status === "SHORTFALL") {
          dotCls = "bg-amber-600 text-white border-amber-600";
          Icon = FileWarning;
        } else {
          dotCls = variant === "maroon" ? "bg-[#FAF7F2] text-slate-400 border-dashed border-[#DCD5C8]" : "bg-background text-muted-foreground border-dashed border-border";
          Icon = CircleDot;
        }

        return (
          <li key={e.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5",
                  variant === "maroon"
                    ? (e.status === "COMPLETED" ? "bg-emerald-600/50" : "bg-[#DCD5C8]")
                    : (e.status === "COMPLETED" ? "bg-success/40" : "bg-border")
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                dotCls
              )}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="flex-1 space-y-1 pt-0.5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-sm font-bold", variant === "maroon" ? "text-slate-900" : "text-foreground")}>{e.stageLabel}</span>
                  {e.status === "CURRENT" && (
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      variant === "maroon" ? "bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20" : "bg-primary/10 text-primary"
                    )}>
                      <span className={cn("size-1.5 animate-pulse rounded-full", variant === "maroon" ? "bg-[#7A1316]" : "bg-primary")} /> Current
                    </span>
                  )}
                  {e.status === "PENDING" && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Pending</span>
                  )}
                </div>
                {e.timestamp && (
                  <span className="text-xs text-slate-500 font-mono tabular-nums">{formatDateTime(e.timestamp)}</span>
                )}
              </div>
              <p className={cn("text-sm", variant === "maroon" ? "text-slate-800" : "text-foreground/90")}>{e.action}</p>
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span>by</span>
                <span className="font-semibold text-slate-800">{e.actor.name}</span>
                <RoleBadge role={e.actor.role} />
                {e.duration && <span>· {e.duration}</span>}
              </div>
              {e.remarks && (
                <p className="mt-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 font-medium">
                  <span className="font-bold">Note:</span> {e.remarks}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Audit Timeline (chronological) ----------
export function AuditTimeline({
  entries,
  variant,
}: {
  entries: import("@/types").AuditEntry[];
  variant?: "default" | "maroon";
}) {
  return (
    <ol className="relative space-y-0">
      {entries.map((e, idx) => {
        const isLast = idx === entries.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-5">
            {!isLast && <div className={cn("absolute left-[7px] top-5 h-[calc(100%-0.5rem)] w-px", variant === "maroon" ? "bg-[#DCD5C8]" : "bg-border")} />}
            <div className={cn("relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-2 bg-white", variant === "maroon" ? "border-[#7A1316]" : "border-primary/60 bg-background")}>
              <div className={cn("absolute inset-0.5 rounded-full", variant === "maroon" ? "bg-[#7A1316]" : "bg-primary/60")} />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className={cn("text-sm font-bold", variant === "maroon" ? "text-slate-900" : "text-foreground")}>{e.action}</p>
                <span className="text-xs text-slate-500 font-mono tabular-nums">{formatDateTime(e.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{e.user}</span>
                <RoleBadge role={e.role} />
                <span className="text-slate-400">·</span>
                <span className="font-mono">{e.ip}</span>
                <span className="text-slate-400">·</span>
                <span>{e.device}</span>
              </div>
              {(e.oldStatus || e.newStatus) && (
                <div className={cn("mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px]", variant === "maroon" ? "border-[#DCD5C8] bg-[#FAF7F2]" : "border-border bg-muted/40")}>
                  {e.oldStatus && <span className="text-slate-500 font-medium">{e.oldStatus}</span>}
                  {e.oldStatus && e.newStatus && <ChevronRight className="size-3 text-slate-400" />}
                  {e.newStatus && <span className="font-bold text-[#7A1316]">{e.newStatus}</span>}
                </div>
              )}
              {e.remarks && <p className="text-xs text-slate-600 italic bg-[#FAF7F2] p-2 rounded border border-[#EADBCE] mt-1">{e.remarks}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Stage status pill ----------
export function StageStatusPill({ status }: { status: WorkflowHistoryEntry["status"] }) {
  const map: Record<WorkflowHistoryEntry["status"], { label: string; cls: string }> = {
    COMPLETED: { label: "Completed", cls: "bg-success/10 text-success border-success/30" },
    CURRENT: { label: "In Progress", cls: "bg-primary/10 text-primary border-primary/30" },
    PENDING: { label: "Pending", cls: "bg-muted text-muted-foreground border-border" },
    FAILED: { label: "Failed", cls: "bg-destructive/10 text-destructive border-destructive/30" },
    RETURNED: { label: "Returned", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
    SHORTFALL: { label: "Shortfall", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  };
  const cfg = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ---------- Helpers ----------
export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
}
