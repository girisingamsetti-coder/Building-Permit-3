"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  APPLICATIONS,
  USERS,
  ROLES,
  FEE_STRUCTURES,
  SMS_TEMPLATES,
  WORKFLOW_STAGES,
} from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { AuditTimeline, formatDateTime } from "@/components/design-system/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users as UsersIcon,
  ShieldCheck,
  FileCog,
  Calculator,
  Workflow,
  MailWarning,
  History,
  Settings,
  Activity,
  Server,
  Database,
  Smartphone,
  CreditCard,
  HardDrive,
  ArrowRight,
  CircleCheck,
  CircleAlert,
  Clock,
  Cpu,
  Gauge,
} from "lucide-react";
import type { AuditEntry, RoleKey, ViewKey } from "@/types";

// ---------- helpers ----------
const activeRoles = Object.values(ROLES).filter((r) => r.key !== "ADMIN");
const todayIso = "2025-01-16";

function buildAdminAuditEntries(): AuditEntry[] {
  const fromApps = APPLICATIONS.flatMap((a) => a.auditLog);
  const adminExtras: AuditEntry[] = [
    { id: "ax-1", user: "Shri. Kailash Patil", role: "ADMIN", action: "Created user account", entity: "User", entityId: "u-tps-02", timestamp: "2025-01-16T08:42:00", ip: "10.0.0.55", device: "Edge / Windows" },
    { id: "ax-2", user: "Shri. Kailash Patil", role: "ADMIN", action: "Updated fee structure", entity: "FeeStructure", entityId: "fs-bp-res-2025", timestamp: "2025-01-16T09:05:00", oldStatus: "Active", newStatus: "Active", ip: "10.0.0.55", device: "Edge / Windows" },
    { id: "ax-3", user: "Shri. Kailash Patil", role: "ADMIN", action: "Disabled SMS template", entity: "SmsTemplate", entityId: "t9", timestamp: "2025-01-16T09:20:00", oldStatus: "Active", newStatus: "Inactive", ip: "10.0.0.55", device: "Edge / Windows" },
    { id: "ax-4", user: "Shri. Kailash Patil", role: "ADMIN", action: "Exported audit log (CSV)", entity: "AuditLog", entityId: "export-2025-0142", timestamp: "2025-01-16T10:11:00", ip: "10.0.0.55", device: "Edge / Windows" },
    { id: "ax-5", user: "Shri. Kailash Patil", role: "ADMIN", action: "Updated role permissions", entity: "Role", entityId: "ZJD", timestamp: "2025-01-16T11:30:00", ip: "10.0.0.55", device: "Edge / Windows" },
  ];
  const merged = [...fromApps, ...adminExtras];
  // dedupe by id
  const seen = new Set<string>();
  const deduped = merged.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  return deduped.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

const HEALTH_ITEMS = [
  { id: "api", label: "API Gateway", icon: Server, status: "Operational" as const, latency: "82 ms", note: "All routes responding within SLA" },
  { id: "db", label: "Database (Primary)", icon: Database, status: "Operational" as const, latency: "14 ms", note: "Read replica lag 0.3s" },
  { id: "sms", label: "SMS Gateway (MSG91)", icon: Smartphone, status: "Degraded" as const, latency: "1.4 s", note: "Transactional queue degraded — retrying" },
  { id: "pay", label: "Payment Gateway (BillDesk)", icon: CreditCard, status: "Operational" as const, latency: "210 ms", note: "Sandbox environment — all UPI/NetBanking flows nominal" },
  { id: "storage", label: "Object Storage (S3)", icon: HardDrive, status: "Operational" as const, latency: "47 ms", note: "Bucket: ltp-uploads-prod, 1.2 TB used" },
];

const CONFIG_CARDS: {
  view: ViewKey;
  title: string;
  desc: string;
  icon: typeof UsersIcon;
  count: () => string;
}[] = [
  { view: "admin-users", title: "Users", desc: "Manage user accounts, activation & access", icon: UsersIcon, count: () => `${USERS.length} users` },
  { view: "admin-roles", title: "Roles & Permissions", desc: "RBAC matrix, role-level permissions", icon: ShieldCheck, count: () => `${activeRoles.length} roles` },
  { view: "admin-application-types", title: "Application Types", desc: "Per-type document checklist config", icon: FileCog, count: () => "6 types" },
  { view: "admin-fee-structures", title: "Fee Structures", desc: "Components, slabs & rate schedules", icon: Calculator, count: () => `${FEE_STRUCTURES.length} structures` },
  { view: "admin-workflow", title: "Workflow Stages", desc: "Stage routing & role ownership", icon: Workflow, count: () => `${WORKFLOW_STAGES.length} stages` },
  { view: "admin-templates", title: "Notification / SMS", desc: "Template library & delivery rules", icon: MailWarning, count: () => `${SMS_TEMPLATES.length} templates` },
  { view: "admin-audit", title: "Audit Logs", desc: "Searchable, exportable event history", icon: History, count: () => "12,480 events" },
  { view: "admin-settings", title: "System Settings", desc: "Authority, integrations & maintenance", icon: Settings, count: () => "5 sections" },
];

export function AdminDashboard() {
  const { navigate, user } = useAppStore();
  const auditEntries = React.useMemo(() => buildAdminAuditEntries().slice(0, 8), []);
  const todaysEvents = auditEntries.filter((e) => e.timestamp.startsWith(todayIso)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Centralised control centre for users, configuration, integrations and system monitoring across the LTP approval workflow portal."
        icon={Settings}
        breadcrumbs={[{ label: "Administration" }, { label: "Dashboard" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">Admin Console</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("admin-audit")}>
              <History className="size-4" /> View Audit
            </Button>
            <Button size="sm" onClick={() => navigate("admin-settings")}>
              <Settings className="size-4" /> System Settings
            </Button>
          </>
        }
      />

      {/* ---------- Stat row ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Total Users" value={USERS.length} icon={UsersIcon} accent="primary" onClick={() => navigate("admin-users")} />
        <StatCard label="Active Roles" value={activeRoles.length} icon={ShieldCheck} accent="info" onClick={() => navigate("admin-roles")} />
        <StatCard label="Application Types" value={6} icon={FileCog} accent="amber" onClick={() => navigate("admin-application-types")} />
        <StatCard label="Fee Structures" value={FEE_STRUCTURES.length} icon={Calculator} accent="success" onClick={() => navigate("admin-fee-structures")} />
        <StatCard label="Workflow Stages" value={WORKFLOW_STAGES.length} icon={Workflow} accent="info" onClick={() => navigate("admin-workflow")} />
        <StatCard label="SMS Templates" value={SMS_TEMPLATES.length} icon={MailWarning} accent="amber" onClick={() => navigate("admin-templates")} />
        <StatCard label="Today's Audit Events" value={todaysEvents} icon={Activity} accent="warning" onClick={() => navigate("admin-audit")} />
        <StatCard label="System Uptime" value="99.94%" icon={Gauge} accent="success" />
      </div>

      {/* ---------- System Health ---------- */}
      <SectionCard
        title="System Health"
        description="Real-time status of platform integrations and infrastructure components."
        icon={Cpu}
        action={
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> All systems operational
          </Badge>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {HEALTH_ITEMS.map((h) => {
            const isDegraded = h.status === "Degraded";
            const StatusIcon = isDegraded ? CircleAlert : CircleCheck;
            return (
              <div
                key={h.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-gov",
                  isDegraded ? "border-amber-300/60 dark:border-amber-800/60" : "border-border"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("flex size-9 items-center justify-center rounded-lg", isDegraded ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400")}>
                    <h.icon className="size-4.5" />
                  </div>
                  <Badge variant="outline" className={cn("gap-1 font-medium", isDegraded ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900")}>
                    <StatusIcon className="size-3" /> {h.status}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{h.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{h.note}</p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span className="font-mono tabular-nums">{h.latency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ---------- Recent Activity ---------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Activity"
            description="Latest audit events across the portal — newest first."
            icon={Activity}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("admin-audit")} className="text-primary">
                View all <ArrowRight className="size-3.5" />
              </Button>
            }
          >
            <ScrollArea className="max-h-[460px] pr-3">
              <AuditTimeline entries={auditEntries} />
            </ScrollArea>
          </SectionCard>
        </div>

        {/* ---------- Configuration Overview ---------- */}
        <SectionCard
          title="Configuration Overview"
          description="Jump straight into any administrative module."
          icon={Settings}
        >
          <div className="grid grid-cols-1 gap-3">
            {CONFIG_CARDS.map((c) => (
              <button
                key={c.view}
                type="button"
                onClick={() => navigate(c.view)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{c.count()}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ---------- Configuration cards grid (manage) ---------- */}
      <SectionCard
        title="Manage Modules"
        description="Each module is independently configurable. All changes are audit-logged."
        icon={ShieldCheck}
        noPadding
      >
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 lg:[&>*:nth-child(2)]:border-l-0">
          {CONFIG_CARDS.map((c) => (
            <button
              key={`mc-${c.view}`}
              type="button"
              onClick={() => navigate(c.view)}
              className="group flex flex-col gap-2 p-5 text-left transition-colors hover:bg-accent/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-4.5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{c.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.count()}</p>
              </div>
              <span className="mt-1 inline-flex items-center text-xs font-medium text-primary">Manage →</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ---------- Footer info ---------- */}
      <Card className="shadow-gov">
        <CardContent className="flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <span>
              Signed in as <span className="font-medium text-foreground">{user?.name}</span>
              {user?.role && (<span className="ml-2"><RoleBadge role={user.role as RoleKey} /></span>)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            <span>Last portal refresh: {formatDateTime(new Date().toISOString())}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
