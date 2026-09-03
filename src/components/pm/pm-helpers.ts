"use client";

import * as React from "react";
import type { Application, ApplicationStatus, User, RoleKey } from "@/types";
import { useAppStore } from "@/store/app-store";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";
import { rolesForStage } from "@/lib/permissions";

// ============================================================
// PROJECT MANAGER — Shared monitoring helpers
// All calculations derive from the shared application/user dataset.
// No hardcoded counters — everything computed from real store data.
// ============================================================

// ---------- SLA Classification ----------
export type SLAStatus = "ON_TRACK" | "AT_RISK" | "DELAYED" | "CRITICAL" | "COMPLETED" | "BLOCKED";

export interface SLAInfo {
  status: SLAStatus;
  label: string;
  cls: string;          // badge class
  expectedDays: number; // configured SLA for the current stage
  elapsedDays: number;  // actual elapsed since last stage entry
  remainingDays: number;// remaining (negative if overdue)
  pendingSince: string; // ISO date when the current stage was entered
  reason?: string;      // why it's delayed/blocked
}

// Configured SLA per stage (in days). Derived from workflow config where possible;
// these are the demo SLA values used by the Project Manager monitoring views.
const STAGE_SLA_DAYS: Record<string, number> = {
  APPLICATION_CREATED: 1,
  DRAWING_SCRUTINY: 2,
  DOCUMENTS: 3,
  FEE_GENERATED: 1,
  PAYMENT: 1,
  TPS_TECHNICAL_SCRUTINY: 3,
  TPA_REVIEW: 2,
  ZAD_ZDD_REVIEW: 3,
  ZJD_REVIEW: 4,
  DIRECTOR_DP_REVIEW: 5,
  ADDITIONAL_COMMISSIONER_REVIEW: 5,
  COMMISSIONER_REVIEW: 7,
  FINAL_DECISION: 1,
};

/**
 * Compute SLA info for an application based on its current stage and
 * the last-updated timestamp (used as a proxy for stage-entered time).
 */
export function computeSLA(app: Application): SLAInfo {
  const completed = app.status === "APPROVED" || app.status === "REJECTED";
  if (completed) {
    return {
      status: "COMPLETED",
      label: "Completed",
      cls: "bg-success/10 text-success border-success/30",
      expectedDays: 0,
      elapsedDays: 0,
      remainingDays: 0,
      pendingSince: app.lastUpdated,
    };
  }

  // Blocked if there's an open shortfall
  const openShortfalls = app.shortfalls.filter(
    (sf) => sf.status === "OPEN" || sf.status === "RESPONDED" || sf.status === "UNDER_REVIEW" || sf.status === "REOPENED"
  );
  if (openShortfalls.length > 0) {
    const sf = openShortfalls[0];
    return {
      status: "BLOCKED",
      label: "Blocked",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
      expectedDays: STAGE_SLA_DAYS[app.currentStage] ?? 3,
      elapsedDays: daysBetween(app.lastUpdated),
      remainingDays: 0,
      pendingSince: app.lastUpdated,
      reason: `Shortfall ${sf.shortfallId} — ${sf.title}`,
    };
  }

  // Blocked if scrutiny failed or drawing reupload required
  if (app.status === "SCRUTINY_FAILED" || app.status === "DRAWING_REUPLOAD_REQUIRED") {
    return {
      status: "BLOCKED",
      label: "Blocked",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
      expectedDays: STAGE_SLA_DAYS[app.currentStage] ?? 3,
      elapsedDays: daysBetween(app.lastUpdated),
      remainingDays: 0,
      pendingSince: app.lastUpdated,
      reason: "Drawing scrutiny failed — re-upload required",
    };
  }

  // Blocked if documents rejected/shortfall
  const blockedDocs = app.documents.filter((d) => d.required && (d.status === "REJECTED" || d.status === "SHORTFALL"));
  if (blockedDocs.length > 0) {
    return {
      status: "BLOCKED",
      label: "Blocked",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
      expectedDays: STAGE_SLA_DAYS[app.currentStage] ?? 3,
      elapsedDays: daysBetween(app.lastUpdated),
      remainingDays: 0,
      pendingSince: app.lastUpdated,
      reason: `Document ${blockedDocs[0].name} — ${blockedDocs[0].status === "REJECTED" ? "Rejected" : "Shortfall"}`,
    };
  }

  const expectedDays = STAGE_SLA_DAYS[app.currentStage] ?? 3;
  const elapsedDays = daysBetween(app.lastUpdated);
  const remainingDays = expectedDays - elapsedDays;

  let status: SLAStatus;
  let label: string;
  let cls: string;
  if (remainingDays >= 1) {
    status = "ON_TRACK";
    label = "On Track";
    cls = "bg-success/10 text-success border-success/30";
  } else if (remainingDays >= 0) {
    status = "AT_RISK";
    label = "At Risk";
    cls = "bg-amber-500/15 text-amber-600 border-amber-500/30";
  } else if (remainingDays >= -2) {
    status = "DELAYED";
    label = "Delayed";
    cls = "bg-orange-500/15 text-orange-600 border-orange-500/30";
  } else {
    status = "CRITICAL";
    label = "Critical Delay";
    cls = "bg-destructive/10 text-destructive border-destructive/30";
  }

  return { status, label, cls, expectedDays, elapsedDays, remainingDays, pendingSince: app.lastUpdated };
}

// ---------- Application Health ----------
export type AppHealth = "ON_TRACK" | "AT_RISK" | "DELAYED" | "BLOCKED" | "COMPLETED";

export function computeAppHealth(app: Application): { health: AppHealth; label: string; cls: string } {
  const sla = computeSLA(app);
  if (sla.status === "COMPLETED") return { health: "COMPLETED", label: "Completed", cls: "bg-success/10 text-success" };
  if (sla.status === "BLOCKED") return { health: "BLOCKED", label: "Blocked", cls: "bg-destructive/10 text-destructive" };
  if (sla.status === "CRITICAL" || sla.status === "DELAYED") return { health: "DELAYED", label: "Delayed", cls: "bg-orange-500/15 text-orange-600" };
  if (sla.status === "AT_RISK") return { health: "AT_RISK", label: "At Risk", cls: "bg-amber-500/15 text-amber-600" };
  return { health: "ON_TRACK", label: "On Track", cls: "bg-success/10 text-success" };
}

// ---------- Officer Workload ----------
export interface OfficerWorkload {
  user: User;
  assigned: number;
  completed: number;
  pending: number;
  delayed: number;
  atRisk: number;
  avgProcessingDays: number;
}

/**
 * Compute workload for every officer (non-LTP, non-ADMIN, non-PROJECT_MANAGER)
 * based on the shared applications dataset.
 */
export function computeOfficerWorkloads(apps: Application[], users: User[]): OfficerWorkload[] {
  const officers = users.filter(
    (u) => u.role !== "LTP" && u.role !== "ADMIN" && u.role !== "PROJECT_MANAGER" && u.active
  );
  return officers.map((officer) => {
    // Assigned = applications where this officer is the assignedOfficer AND the app is not completed
    const assignedApps = apps.filter(
      (a) => a.assignedOfficer?.role === officer.role && !["APPROVED", "REJECTED"].includes(a.status)
    );
    // Completed = apps where this officer acted in workflowHistory AND the app is APPROVED
    const completedApps = apps.filter(
      (a) => a.workflowHistory.some((w) => w.actor.role === officer.role) && a.status === "APPROVED"
    );
    // Pending = assigned apps that are on track or at risk
    const pending = assignedApps.filter((a) => {
      const sla = computeSLA(a);
      return sla.status === "ON_TRACK" || sla.status === "AT_RISK";
    }).length;
    // Delayed = assigned apps that are delayed or critical
    const delayed = assignedApps.filter((a) => {
      const sla = computeSLA(a);
      return sla.status === "DELAYED" || sla.status === "CRITICAL";
    }).length;
    const atRisk = assignedApps.filter((a) => computeSLA(a).status === "AT_RISK").length;
    // Average processing time: compute from workflowHistory durations
    const processingTimes: number[] = [];
    apps.forEach((a) => {
      const history = a.workflowHistory.filter((w) => w.actor.role === officer.role);
      history.forEach((w, idx) => {
        if (idx > 0) {
          const prev = history[idx - 1];
          const diff = daysBetween(prev.timestamp, w.timestamp);
          if (diff >= 0 && diff < 30) processingTimes.push(diff);
        }
      });
    });
    const avgProcessingDays = processingTimes.length > 0
      ? Math.round((processingTimes.reduce((s, t) => s + t, 0) / processingTimes.length) * 10) / 10
      : 0;
    return {
      user: officer,
      assigned: assignedApps.length,
      completed: completedApps.length,
      pending,
      delayed,
      atRisk,
      avgProcessingDays,
    };
  });
}

// ---------- Stage Performance ----------
export interface StagePerf {
  stageKey: string;
  stageLabel: string;
  pendingCount: number;
  avgDays: number;
}

/**
 * Compute stage-by-stage performance: pending count + average processing time.
 */
export function computeStagePerformance(apps: Application[]): StagePerf[] {
  const stageMap = new Map<string, number[]>();
  // Pending count per stage
  const pendingPerStage = new Map<string, number>();
  apps.forEach((a) => {
    if (!["APPROVED", "REJECTED"].includes(a.status)) {
      pendingPerStage.set(a.currentStage, (pendingPerStage.get(a.currentStage) ?? 0) + 1);
    }
    // Processing times from workflowHistory
    a.workflowHistory.forEach((w, idx) => {
      if (idx > 0) {
        const prev = a.workflowHistory[idx - 1];
        const diff = daysBetween(prev.timestamp, w.timestamp);
        if (diff >= 0 && diff < 60) {
          if (!stageMap.has(w.stage)) stageMap.set(w.stage, []);
          stageMap.get(w.stage)!.push(diff);
        }
      }
    });
  });
  const result: StagePerf[] = WORKFLOW_STAGES.map((stage) => {
    const times = stageMap.get(stage.key) ?? [];
    const avgDays = times.length > 0
      ? Math.round((times.reduce((s, t) => s + t, 0) / times.length) * 10) / 10
      : 0;
    return {
      stageKey: stage.key,
      stageLabel: stage.label,
      pendingCount: pendingPerStage.get(stage.key) ?? 0,
      avgDays,
    };
  });
  return result;
}

// ---------- Bottleneck Identification ----------
export function identifyBottleneck(apps: Application[]): { stageLabel: string; pendingCount: number; reason: string } | null {
  const perf = computeStagePerformance(apps);
  const withPending = perf.filter((p) => p.pendingCount > 0);
  if (withPending.length === 0) return null;
  // Bottleneck = stage with the most pending applications
  const bottleneck = withPending.reduce((max, p) => (p.pendingCount > max.pendingCount ? p : max));
  return {
    stageLabel: bottleneck.stageLabel,
    pendingCount: bottleneck.pendingCount,
    reason: `${bottleneck.pendingCount} application${bottleneck.pendingCount === 1 ? "" : "s"} pending at this stage`,
  };
}

// ---------- Pending Actions ----------
export interface PendingAction {
  app: Application;
  stageLabel: string;
  responsibleRole: string;
  responsibleOfficer: string;
  pendingSince: string;
  slaLabel: string;
  slaCls: string;
  priority: "HIGH" | "NORMAL" | "URGENT";
}

export function computePendingActions(apps: Application[]): PendingAction[] {
  const pending = apps.filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status));
  return pending.map((a) => {
    const sla = computeSLA(a);
    const stageInfo = getStage(a.currentStage);
    const roles = rolesForStage(a.currentStage);
    return {
      app: a,
      stageLabel: a.currentStageLabel,
      responsibleRole: roles.map((r) => r.replace("_", " ")).join(" / "),
      responsibleOfficer: a.assignedOfficer?.name ?? "Unassigned",
      pendingSince: a.lastUpdated,
      slaLabel: sla.label,
      slaCls: sla.cls,
      priority: (a.priority === "HIGH" ? "HIGH" : sla.status === "CRITICAL" ? "URGENT" : "NORMAL") as "HIGH" | "NORMAL" | "URGENT",
    };
  }).sort((a, b) => {
    // Sort by priority: URGENT > HIGH > NORMAL
    const order = { URGENT: 0, HIGH: 1, NORMAL: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ---------- Recent Activity ----------
export interface ActivityEvent {
  applicationNo: string;
  applicationId: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  remarks?: string;
}

export function computeRecentActivity(apps: Application[], limit = 20): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  apps.forEach((a) => {
    a.auditLog.forEach((log) => {
      events.push({
        applicationNo: a.applicationNo,
        applicationId: a.id,
        timestamp: log.timestamp,
        actor: log.user,
        role: log.role,
        action: log.action,
        remarks: log.remarks,
      });
    });
  });
  events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return events.slice(0, limit);
}

// ---------- Helpers ----------
function daysBetween(fromISO: string, toISO?: string): number {
  const from = new Date(fromISO).getTime();
  const to = toISO ? new Date(toISO).getTime() : Date.now();
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

export function formatDuration(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}

export function timeAgoBrief(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ---------- Hook: all applications (shared dataset) ----------
export function useAllApplications(): Application[] {
  return useAppStore((s) => s.applications);
}

// ---------- Hook: all users (shared dataset) ----------
export function useAllUsers(): User[] {
  return useAppStore((s) => s.users);
}
