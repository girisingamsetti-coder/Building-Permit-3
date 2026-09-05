"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  FileWarning,
  XCircle,
  CircleDot,
  ArrowUpRight,
  Info,
  ShieldAlert,
  FileCheck2,
} from "lucide-react";
import type {
  ApplicationStatus,
  DocumentStatus,
  PaymentStatus,
  ScrutinySeverity,
  ShortfallStatus,
  ShortfallType,
  RoleKey,
} from "@/types";

// ---------- Status Badge ----------
const STATUS_MAP: Record<
  ApplicationStatus,
  { label: string; cls: string; icon?: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: { label: "Draft", cls: "bg-muted text-muted-foreground border-border", icon: CircleDot },
  DRAWING_UPLOADED: { label: "Drawing Uploaded", cls: "bg-info/10 text-info border-info/30", icon: Info },
  SCRUTINY_IN_PROGRESS: { label: "Scrutiny In Progress", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  SCRUTINY_FAILED: { label: "Scrutiny Failed", cls: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
  DRAWING_REUPLOAD_REQUIRED: { label: "Re-upload Required", cls: "bg-destructive/10 text-destructive border-destructive/30", icon: FileWarning },
  SCRUTINY_PASSED: { label: "Scrutiny Passed", cls: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  DOCUMENT_UPLOAD_PENDING: { label: "Documents Submission", cls: "bg-warning/15 text-warning-foreground border-warning/40", icon: Clock },
  DOCUMENT_VERIFICATION: { label: "Under Verification", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  FEE_GENERATED: { label: "Fee Generated", cls: "bg-warning/15 text-warning-foreground border-warning/40", icon: Info },
  PAYMENT_PENDING: { label: "Payment Pending", cls: "bg-warning/15 text-warning-foreground border-warning/40", icon: Clock },
  PAYMENT_PROCESSING: { label: "Payment Processing", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  PAYMENT_SUCCESS: { label: "Payment Successful", cls: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  PAYMENT_FAILED: { label: "Payment Failed", cls: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle },
  ZONAL_HEAD_REVIEW: { label: "Pending — Zonal Head", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  DIRECTOR_REVIEW: { label: "Pending — Director", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  ADDITIONAL_COMMISSIONER_REVIEW: { label: "Pending — Addl Commissioner", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  COMMISSIONER_REVIEW: { label: "Pending — Commissioner", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  SHORTFALL_RAISED: { label: "Shortfall Raised", cls: "bg-warning/15 text-warning-foreground border-warning/40", icon: AlertTriangle },
  APPROVED: { label: "Approved", cls: "bg-success/15 text-success border-success/40", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", cls: "bg-destructive/15 text-destructive border-destructive/40", icon: XCircle },
  RETURNED: { label: "Returned", cls: "bg-warning/15 text-warning-foreground border-warning/40", icon: ArrowUpRight },
};

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: {
  status: ApplicationStatus;
  className?: string;
  showIcon?: boolean;
}) {
  const cfg = STATUS_MAP[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cfg.cls, className)}>
      {showIcon && Icon && <Icon className="size-3" />}
      {cfg.label}
    </Badge>
  );
}

// ---------- Payment Status Badge ----------
const PAYMENT_MAP: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  PROCESSING: { label: "Processing", cls: "bg-info/10 text-info" },
  SUCCESS: { label: "Successful", cls: "bg-success/10 text-success" },
  FAILED: { label: "Failed", cls: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Cancelled", cls: "bg-muted text-muted-foreground" },
  REFUNDED: { label: "Refunded", cls: "bg-muted text-muted-foreground" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_MAP[status];
  return <Badge className={cn("border-transparent", cfg.cls)}>{cfg.label}</Badge>;
}

// ---------- Document Status Badge ----------
const DOC_MAP: Record<DocumentStatus, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  REQUIRED: { label: "Required", cls: "bg-muted text-muted-foreground border-border", icon: FileText },
  PENDING_VERIFICATION: { label: "Pending Verification", cls: "bg-info/10 text-info border-info/30", icon: Clock },
  VERIFIED: { label: "Verified", cls: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", cls: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
  SHORTFALL: { label: "Shortfall", cls: "bg-warning/15 text-warning-foreground border-warning/40", icon: FileWarning },
  SUPERSEDED: { label: "Superseded", cls: "bg-muted text-muted-foreground border-border", icon: FileText },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const cfg = DOC_MAP[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1", cfg.cls)}>
      <Icon className="size-3" />
      {cfg.label}
    </Badge>
  );
}

// ---------- Severity Badge ----------
const SEVERITY_MAP: Record<ScrutinySeverity, { label: string; cls: string }> = {
  CRITICAL: { label: "Critical", cls: "bg-destructive text-white border-transparent" },
  MAJOR: { label: "Major", cls: "bg-orange-600 text-white border-transparent" },
  MINOR: { label: "Minor", cls: "bg-amber-500 text-white border-transparent" },
};

export function SeverityBadge({ severity }: { severity: ScrutinySeverity }) {
  const cfg = SEVERITY_MAP[severity];
  return <Badge className={cn("font-semibold", cfg.cls)}>{cfg.label}</Badge>;
}

// ---------- Shortfall Badges ----------
const SF_STATUS_MAP: Record<ShortfallStatus, { label: string; cls: string }> = {
  OPEN: { label: "Open", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  RESPONDED: { label: "Responded", cls: "bg-info/10 text-info border-info/30" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-info/10 text-info border-info/30" },
  RESOLVED: { label: "Resolved", cls: "bg-success/10 text-success border-success/30" },
  REOPENED: { label: "Reopened", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  OVERDUE: { label: "Overdue", cls: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function ShortfallStatusBadge({ status }: { status: ShortfallStatus }) {
  const cfg = SF_STATUS_MAP[status];
  return <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>;
}

const SF_TYPE_MAP: Record<ShortfallType, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  DOCUMENT: { label: "Document", cls: "bg-info/10 text-info", icon: FileWarning },
  FEE: { label: "Fee", cls: "bg-warning/15 text-warning-foreground", icon: AlertTriangle },
  TECHNICAL: { label: "Technical", cls: "bg-destructive/10 text-destructive", icon: ShieldAlert },
  GENERAL: { label: "General", cls: "bg-muted text-muted-foreground", icon: ShieldAlert },
};

export function ShortfallTypeBadge({ type }: { type: ShortfallType }) {
  const cfg = SF_TYPE_MAP[type];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 border-transparent", cfg.cls)}>
      <Icon className="size-3" />
      {cfg.label}
    </Badge>
  );
}

// ---------- Role Badge ----------
const ROLE_COLOR: Record<RoleKey, string> = {
  LTP: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  ZONAL_HEAD: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900",
  DIRECTOR: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  ADDITIONAL_COMMISSIONER: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
  COMMISSIONER: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
  SUPER_ADMIN: "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
};

export function RoleBadge({ role, label }: { role: RoleKey; label?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", ROLE_COLOR[role])}>
      {label ?? role}
    </Badge>
  );
}

// ---------- Priority Badge ----------
export function PriorityBadge({ priority }: { priority: "NORMAL" | "HIGH" | "URGENT" }) {
  if (priority === "NORMAL")
    return <Badge variant="outline" className="bg-muted text-muted-foreground">Normal</Badge>;
  if (priority === "HIGH")
    return <Badge className="bg-amber-500 text-white">High</Badge>;
  return <Badge className="bg-destructive text-white">Urgent</Badge>;
}
