"use client";

import * as React from "react";
import type { Application, User, RoleKey } from "@/types";
import { useAppStore } from "@/store/app-store";
import { rolesForStage } from "@/lib/permissions";

// ============================================================
// DASHBOARD DATA-SCOPE ENGINE
//
// Centralized role-aware data scoping. Every dashboard derives its data
// from `getDashboardScope(user)` — NOT from global selectors.
//
// Scope hierarchy:
//   ADMIN → ALL applications (organization-wide)
//   PROJECT_MANAGER → assigned projects only
//   LTP → own applications only (ltpId === user.id)
//   Officers (TPS/TPA/ZAD/ZDD/ZJD/Director/AddlComm/Commissioner) →
//     applications currently assigned to their role at their stage +
//     applications where they acted in workflow history
// ============================================================

export interface DashboardScope {
  user: User;
  role: RoleKey;
  applications: Application[];      // scoped applications
  users: User[];                     // scoped users (officers relevant to the scope)
  projectIds: string[];              // project identifiers in scope (empty = all)
  isGlobal: boolean;                 // true for ADMIN (org-wide)
}

/**
 * Resolve the dashboard data scope for a given user.
 * Returns the scoped applications + users that the user is authorized to see.
 *
 * This is the SINGLE source of truth for dashboard data scoping.
 * All KPIs, charts, tables, and search must derive from this scoped dataset.
 */
export function getDashboardScope(user: User | null, allApps: Application[], allUsers: User[]): DashboardScope {
  if (!user) {
    return { user: {} as User, role: "LTP", applications: [], users: [], projectIds: [], isGlobal: false };
  }

  // ---- SUPER_ADMIN: organization-wide ----
  if (user.role === "SUPER_ADMIN") {
    return {
      user,
      role: "SUPER_ADMIN",
      applications: allApps,
      users: allUsers,
      projectIds: [],
      isGlobal: true,
    };
  }

  // ---- LTP: own applications only ----
  if (user.role === "LTP") {
    const scopedApps = allApps.filter((a) => a.ltpId === user.id);
    return {
      user,
      role: "LTP",
      applications: scopedApps,
      users: [user],
      projectIds: [],
      isGlobal: false,
    };
  }

  // ---- Officers (TPS/TPA/ZAD/ZDD/ZJD/Director/AddlComm/Commissioner) ----
  const scopedApps = allApps.filter((a) => {
    const roles = rolesForStage(a.currentStage);
    if (roles.includes(user.role) && !["APPROVED", "REJECTED"].includes(a.status)) return true;
    if (a.assignedOfficer?.name === user.name && a.assignedOfficer?.role === user.role) return true;
    return a.workflowHistory.some((w) => w.actor.role === user.role && w.actor.name === user.name);
  });

  const scopedUsers = allUsers.filter(
    (u) => u.role === user.role || u.role === "LTP"
  );

  return {
    user,
    role: user.role,
    applications: scopedApps,
    users: scopedUsers,
    projectIds: [],
    isGlobal: false,
  };
}

/**
 * Hook: useDashboardScope
 * Returns the scoped dashboard data for the currently logged-in user.
 * All dashboard components should use this hook for data access.
 */
export function useDashboardScope(): DashboardScope {
  const user = useAppStore((s) => s.user);
  const allApps = useAppStore((s) => s.applications);
  const allUsers = useAppStore((s) => s.users);
  return React.useMemo(
    () => getDashboardScope(user, allApps, allUsers),
    [user, allApps, allUsers]
  );
}

// ============================================================
// SCOPED KPI CALCULATIONS
// ============================================================

export interface ScopedKpis {
  total: number;
  inProgress: number;
  approved: number;
  rejected: number;
  delayed: number;
  atRisk: number;
  drafts: number;
  pendingPayments: number;
  openShortfalls: number;
  pendingDocuments: number;
}

export function computeScopedKpis(apps: Application[]): ScopedKpis {
  return {
    total: apps.length,
    inProgress: apps.filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status)).length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
    drafts: apps.filter((a) => a.status === "DRAFT").length,
    delayed: apps.filter((a) => {
      const sla = computeSlaStatus(a);
      return sla === "DELAYED" || sla === "CRITICAL";
    }).length,
    atRisk: apps.filter((a) => computeSlaStatus(a) === "AT_RISK").length,
    pendingPayments: apps.filter((a) =>
      a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED"
    ).length,
    openShortfalls: apps.reduce((sum, a) =>
      sum + a.shortfalls.filter((sf) =>
        sf.status === "OPEN" || sf.status === "RESPONDED" || sf.status === "UNDER_REVIEW" || sf.status === "REOPENED"
      ).length, 0
    ),
    pendingDocuments: apps.reduce((sum, a) =>
      sum + a.documents.filter((d) => d.required && (d.status === "REQUIRED" || d.status === "PENDING_VERIFICATION")).length, 0
    ),
  };
}

function computeSlaStatus(app: Application): string {
  if (app.status === "APPROVED" || app.status === "REJECTED") return "COMPLETED";
  const openShortfalls = app.shortfalls.filter(
    (sf) => sf.status === "OPEN" || sf.status === "RESPONDED" || sf.status === "UNDER_REVIEW" || sf.status === "REOPENED"
  );
  if (openShortfalls.length > 0) return "BLOCKED";
  if (app.status === "SCRUTINY_FAILED" || app.status === "DRAWING_REUPLOAD_REQUIRED") return "BLOCKED";
  const blockedDocs = app.documents.filter((d) => d.required && (d.status === "REJECTED" || d.status === "SHORTFALL"));
  if (blockedDocs.length > 0) return "BLOCKED";

  const stageSlaDays: Record<string, number> = {
    APPLICATION_CREATED: 1, DRAWING_SCRUTINY: 2, DOCUMENTS: 3, FEE_GENERATED: 1, PAYMENT: 1,
    TPS_TECHNICAL_SCRUTINY: 3, TPA_REVIEW: 2, ZAD_ZDD_REVIEW: 3, ZJD_REVIEW: 4,
    DIRECTOR_DP_REVIEW: 5, ADDITIONAL_COMMISSIONER_REVIEW: 5, COMMISSIONER_REVIEW: 7, FINAL_DECISION: 1,
  };
  const expectedDays = stageSlaDays[app.currentStage] ?? 3;
  const elapsedDays = Math.floor((Date.now() - new Date(app.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = expectedDays - elapsedDays;
  if (remainingDays >= 1) return "ON_TRACK";
  if (remainingDays >= 0) return "AT_RISK";
  if (remainingDays >= -2) return "DELAYED";
  return "CRITICAL";
}

// ============================================================
// SCOPED CHART DATA CALCULATIONS
// ============================================================

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

export function applicationsByStatus(apps: Application[]): ChartDatum[] {
  const statusLabels: Record<string, string> = {
    DRAFT: "Draft", DRAWING_UPLOADED: "Drawing Uploaded", SCRUTINY_IN_PROGRESS: "Scrutiny In Progress",
    SCRUTINY_FAILED: "Scrutiny Failed", DRAWING_REUPLOAD_REQUIRED: "Re-upload Required",
    DOCUMENT_UPLOAD_PENDING: "Documents Pending", DOCUMENT_VERIFICATION: "Doc Verification",
    SHORTFALL_RAISED: "Shortfall Raised", FEE_GENERATED: "Fee Generated", PAYMENT_PENDING: "Payment Pending",
    PAYMENT_PROCESSING: "Payment Processing", TPS_TECHNICAL_SCRUTINY: "TPS Scrutiny", TPA_REVIEW: "TPA Review",
    ZAD_ZDD_REVIEW: "ZAD/ZDD Review", ZJD_REVIEW: "ZJD Review", DIRECTOR_DP_REVIEW: "Director Review",
    ADDITIONAL_COMMISSIONER_REVIEW: "Addl. Commissioner", COMMISSIONER_REVIEW: "Commissioner Review",
    APPROVED: "Approved", REJECTED: "Rejected", RETURNED: "Returned",
  };
  const counts = new Map<string, number>();
  apps.forEach((a) => { counts.set(a.status, (counts.get(a.status) ?? 0) + 1); });
  return Array.from(counts.entries())
    .map(([status, count]) => ({ label: statusLabels[status] ?? status, value: count }))
    .filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
}

export function applicationsByStage(apps: Application[]): ChartDatum[] {
  const counts = new Map<string, number>();
  apps.forEach((a) => { counts.set(a.currentStageLabel, (counts.get(a.currentStageLabel) ?? 0) + 1); });
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
}

export function slaSummary(apps: Application[]): ChartDatum[] {
  const counts = { ON_TRACK: 0, AT_RISK: 0, DELAYED: 0, CRITICAL: 0, BLOCKED: 0, COMPLETED: 0 };
  apps.forEach((a) => { const s = computeSlaStatus(a); if (s in counts) counts[s as keyof typeof counts]++; });
  return [
    { label: "On Track", value: counts.ON_TRACK, color: "#10b981" },
    { label: "At Risk", value: counts.AT_RISK, color: "#f59e0b" },
    { label: "Delayed", value: counts.DELAYED, color: "#f97316" },
    { label: "Critical", value: counts.CRITICAL, color: "#ef4444" },
    { label: "Blocked", value: counts.BLOCKED, color: "#dc2626" },
    { label: "Completed", value: counts.COMPLETED, color: "#059669" },
  ].filter((d) => d.value > 0);
}

export function paymentStatusData(apps: Application[]): ChartDatum[] {
  const paid = apps.filter((a) => a.payment?.status === "SUCCESS").length;
  const pending = apps.filter((a) => a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED" || a.payment?.status === "PENDING" || a.payment?.status === "PROCESSING").length;
  const none = apps.filter((a) => !a.fee && !["APPROVED", "REJECTED"].includes(a.status)).length;
  return [
    { label: "Paid", value: paid, color: "#10b981" },
    { label: "Pending", value: pending, color: "#f59e0b" },
    { label: "No Fee Yet", value: none, color: "#94a3b8" },
  ].filter((d) => d.value > 0);
}

export function applicationVolumeOverTime(apps: Application[], months = 6): ChartDatum[] {
  const now = new Date();
  const result: ChartDatum[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const label = monthStart.toLocaleDateString("en-IN", { month: "short" });
    const count = apps.filter((a) => { const s = new Date(a.submissionDate); return s >= monthStart && s <= monthEnd; }).length;
    result.push({ label, value: count });
  }
  return result;
}

export function scrutinyResultsData(apps: Application[]): ChartDatum[] {
  const passed = apps.filter((a) => a.scrutinyReport?.status === "PASSED").length;
  const failed = apps.filter((a) => a.scrutinyReport?.status === "FAILED").length;
  const noScrutiny = apps.filter((a) => !a.scrutinyReport && a.drawings.length > 0).length;
  return [
    { label: "Passed", value: passed, color: "#10b981" },
    { label: "Failed", value: failed, color: "#ef4444" },
    { label: "Pending", value: noScrutiny, color: "#f59e0b" },
  ].filter((d) => d.value > 0);
}

export function documentCompletionData(apps: Application[]): ChartDatum[] {
  let verified = 0, pending = 0, required = 0;
  apps.forEach((a) => { a.documents.filter((d) => d.required).forEach((d) => {
    if (d.status === "VERIFIED") verified++;
    else if (d.status === "PENDING_VERIFICATION") pending++;
    else required++;
  }); });
  return [
    { label: "Verified", value: verified, color: "#10b981" },
    { label: "Pending", value: pending, color: "#f59e0b" },
    { label: "Required", value: required, color: "#94a3b8" },
  ].filter((d) => d.value > 0);
}

export function shortfallData(apps: Application[]): ChartDatum[] {
  let open = 0, responded = 0, resolved = 0;
  apps.forEach((a) => { a.shortfalls.forEach((sf) => {
    if (sf.status === "OPEN" || sf.status === "REOPENED") open++;
    else if (sf.status === "RESPONDED" || sf.status === "UNDER_REVIEW") responded++;
    else if (sf.status === "RESOLVED") resolved++;
  }); });
  return [
    { label: "Open", value: open, color: "#ef4444" },
    { label: "Responded", value: responded, color: "#f59e0b" },
    { label: "Resolved", value: resolved, color: "#10b981" },
  ].filter((d) => d.value > 0);
}
