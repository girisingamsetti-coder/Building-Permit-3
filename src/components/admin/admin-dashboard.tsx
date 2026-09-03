"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ROLES, FEE_STRUCTURES, SMS_TEMPLATES, WORKFLOW_STAGES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
} from "@/components/design-system/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users as UsersIcon,
  UserCheck,
  ShieldCheck,
  UserX,
  Workflow,
  AlertTriangle,
  History,
  HeartPulse,
  Settings,
  ArrowRight,
  Server,
  Database,
  Smartphone,
  CreditCard,
  HardDrive,
  FileCog,
  Calculator,
  MailWarning,
  CircleCheck,
  CircleAlert,
  Clock,
  PieChart,
  BarChart3,
  Activity,
  TrendingUp,
  FileStack,
  CheckCircle2,
  CircleDollarSign,
  FileWarning,
} from "lucide-react";
import type { AdminAuditEntry, ViewKey } from "@/types";
import {
  useDashboardScope,
  computeScopedKpis,
  applicationsByStatus,
  applicationsByStage,
  slaSummary,
  paymentStatusData,
  applicationVolumeOverTime,
} from "@/components/dashboard/dashboard-scope";
import {
  DonutChart,
  BarChart,
  LineChart,
  ChartCard,
} from "@/components/dashboard/charts";

const HEALTH_ITEMS = [
  { id: "api", label: "API Gateway", icon: Server, status: "Operational" as const, note: "Demo monitoring — all routes responding" },
  { id: "db", label: "Database (SQLite)", icon: Database, status: "Operational" as const, note: "Demo local database" },
  { id: "storage", label: "File Storage", icon: HardDrive, status: "Operational" as const, note: "Demo local storage" },
  { id: "sms", label: "SMS Gateway", icon: Smartphone, status: "Demo" as const, note: "Mock SMS — no real delivery" },
  { id: "pay", label: "Payment Gateway", icon: CreditCard, status: "Demo" as const, note: "Mock payment — no real charges" },
];

export function AdminDashboard() {
  const { navigate, users, roles, adminAuditLog, applicationTypes } = useAppStore();
  // Org-wide dashboard scope (ADMIN sees ALL applications)
  const scope = useDashboardScope();
  const appKpis = computeScopedKpis(scope.applications);
  const statusData = applicationsByStatus(scope.applications);
  const stageData = applicationsByStage(scope.applications);
  const slaData = slaSummary(scope.applications);
  const paymentData = paymentStatusData(scope.applications);
  const volumeData = applicationVolumeOverTime(scope.applications);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active && u.status === "ACTIVE").length;
  const inactiveUsers = users.filter((u) => !u.active || u.status === "INACTIVE" || u.status === "SUSPENDED").length;
  const pendingUsers = users.filter((u) => u.status === "PENDING").length;
  const totalRoles = Object.keys(roles).length;
  const workflowStages = 13;
  const activeAlerts = inactiveUsers + pendingUsers;
  const today = new Date().toISOString().slice(0, 10);
  const auditToday = adminAuditLog.filter((e) => e.timestamp.startsWith(today)).length;

  const recentAudit = adminAuditLog.slice(0, 8);

  const attentionItems: { label: string; count: number; view: ViewKey; severity: "high" | "medium" | "low" }[] = [];
  if (pendingUsers > 0) attentionItems.push({ label: "Pending user approvals", count: pendingUsers, view: "admin-users", severity: "high" });
  if (inactiveUsers > 0) attentionItems.push({ label: "Inactive/suspended users", count: inactiveUsers, view: "admin-users", severity: "medium" });
  const inactiveAppTypes = applicationTypes.filter((t) => !t.active).length;
  if (inactiveAppTypes > 0) attentionItems.push({ label: "Inactive application types", count: inactiveAppTypes, view: "admin-application-types", severity: "low" });
  if (appKpis.openShortfalls > 0) attentionItems.push({ label: "Open shortfalls across applications", count: appKpis.openShortfalls, view: "admin-audit", severity: "medium" });

  const configCards: { view: ViewKey; title: string; desc: string; icon: typeof UsersIcon; count: string }[] = [
    { view: "admin-users", title: "Users", desc: "Accounts, activation & access", icon: UsersIcon, count: `${totalUsers} users` },
    { view: "admin-roles", title: "Roles & Permissions", desc: "RBAC matrix & permissions", icon: ShieldCheck, count: `${totalRoles} roles` },
    { view: "admin-application-types", title: "Application Types", desc: "Per-type document checklist", icon: FileCog, count: `${applicationTypes.length} types` },
    { view: "admin-fee-structures", title: "Fee Structures", desc: "Components & rate schedules", icon: Calculator, count: "View structures" },
    { view: "admin-workflow", title: "Workflow Stages", desc: "Stage routing & ownership", icon: Workflow, count: `${workflowStages} stages` },
    { view: "admin-templates", title: "Notification / SMS", desc: "Template library", icon: MailWarning, count: "View templates" },
    { view: "admin-audit", title: "Audit Logs", desc: "Event history & search", icon: History, count: `${adminAuditLog.length} events` },
    { view: "admin-settings", title: "System Settings", desc: "Portal config & integrations", icon: Settings, count: "View settings" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Centralized control centre for users, roles, permissions, workflow configuration, integrations and system monitoring."
        icon={Settings}
        breadcrumbs={[{ label: "Administration" }, { label: "Dashboard" }]}
        badge={<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">Admin Console</Badge>}
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

      {/* ROW 1: Organization-wide Application KPIs (derived from computeScopedKpis) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileStack className="size-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Organization-wide Application KPIs</h2>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">Live data</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Applications" value={appKpis.total} icon={FileStack} hint={`${appKpis.drafts} drafts`} cls="bg-primary/10 text-primary" />
          <KpiCard label="In Progress" value={appKpis.inProgress} icon={Activity} hint={`${appKpis.atRisk} at risk`} cls="bg-info/10 text-info" />
          <KpiCard label="Approved" value={appKpis.approved} icon={CheckCircle2} hint={`${appKpis.rejected} rejected`} cls="bg-success/10 text-success" />
          <KpiCard label="Pending Payments" value={appKpis.pendingPayments} icon={CircleDollarSign} hint="Awaiting fee payment" cls="bg-warning/15 text-warning-foreground" />
          <KpiCard label="Delayed / Critical" value={appKpis.delayed} icon={Clock} hint="Past SLA threshold" cls="bg-destructive/10 text-destructive" />
          <KpiCard label="Open Shortfalls" value={appKpis.openShortfalls} icon={FileWarning} hint="Needs officer action" cls="bg-warning/15 text-warning-foreground" />
          <KpiCard label="Pending Documents" value={appKpis.pendingDocuments} icon={FileCog} hint="Awaiting verification" cls="bg-info/10 text-info" />
          <KpiCard label="Drafts" value={appKpis.drafts} icon={FileStack} hint="Not yet submitted" cls="bg-muted text-muted-foreground" />
        </div>
      </div>

      {/* ROW 2: Admin KPI cards (users, roles, audit) — kept from existing */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Users" value={totalUsers} icon={UsersIcon} hint={`${activeUsers} active · ${inactiveUsers} inactive`} cls="bg-primary/10 text-primary" />
        <KpiCard label="Active Users" value={activeUsers} icon={UserCheck} hint={`${pendingUsers} pending approval`} cls="bg-success/10 text-success" />
        <KpiCard label="Roles" value={totalRoles} icon={ShieldCheck} hint="RBAC configured" cls="bg-info/10 text-info" />
        <KpiCard label="Pending Access" value={pendingUsers} icon={UserX} hint="Awaiting approval" cls="bg-warning/15 text-warning-foreground" />
        <KpiCard label="Workflow Stages" value={workflowStages} icon={Workflow} hint="Configured pipeline" cls="bg-primary/10 text-primary" />
        <KpiCard label="Active Alerts" value={activeAlerts} icon={AlertTriangle} hint={`${inactiveUsers} inactive users`} cls="bg-destructive/10 text-destructive" />
        <KpiCard label="Audit Events Today" value={auditToday} icon={History} hint={`${adminAuditLog.length} total events`} cls="bg-info/10 text-info" />
        <KpiCard label="System Health" value="Operational" icon={HeartPulse} hint="Demo monitoring" cls="bg-success/10 text-success" />
      </div>

      {/* ROW 3: Charts Section (2-col grid + full-width line chart) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <PieChart className="size-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Application Analytics</h2>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">Org-wide</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard icon={PieChart} title="Applications by Status" subtitle="Distribution across all statuses">
            <DonutChart data={statusData} centerLabel="Total" centerValue={appKpis.total} />
          </ChartCard>
          <ChartCard icon={BarChart3} title="Applications by Stage" subtitle="Pipeline distribution">
            <BarChart data={stageData} />
          </ChartCard>
          <ChartCard icon={Activity} title="SLA Performance" subtitle="On track · at risk · delayed · blocked">
            <DonutChart data={slaData} centerLabel="Total" centerValue={appKpis.total} />
          </ChartCard>
          <ChartCard icon={CircleDollarSign} title="Payment Status" subtitle="Paid · pending · no fee yet">
            <DonutChart data={paymentData} centerLabel="Total" centerValue={appKpis.total} />
          </ChartCard>
        </div>
        <ChartCard icon={TrendingUp} title="Application Volume Over Time" subtitle="Submissions over the last 6 months">
          <LineChart data={volumeData} />
        </ChartCard>
      </div>

      {/* ROW 4: System Health + Administrative Attention */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[72%_28%]">
        <SectionCard title="System Health" description="Demo monitoring data — no real infrastructure backend" icon={HeartPulse}>
          <ul className="space-y-3">
            {HEALTH_ITEMS.map((item) => {
              const Icon = item.icon;
              const isDegraded = (item.status as string) === "Degraded";
              const isDemo = item.status === "Demo";
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      isDegraded ? "bg-warning/15 text-warning-foreground" : isDemo ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"
                    )}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.note}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "shrink-0",
                    isDegraded ? "bg-warning/15 text-warning-foreground" : isDemo ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"
                  )}>
                    {isDegraded ? <CircleAlert className="size-3" /> : isDemo ? <Clock className="size-3" /> : <CircleCheck className="size-3" />}
                    {item.status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Administrative Attention" description="Items requiring admin action" icon={AlertTriangle}>
          {attentionItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CircleCheck className="size-8 text-success" />
              <p className="text-sm font-medium">All clear</p>
              <p className="text-xs text-muted-foreground">No pending administrative actions.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {attentionItems.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => navigate(item.view)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        item.severity === "high" ? "bg-destructive/10 text-destructive" : item.severity === "medium" ? "bg-warning/15 text-warning-foreground" : "bg-info/10 text-info"
                      )}>
                        <AlertTriangle className="size-4" />
                      </div>
                      <span className="text-xs font-medium truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn(
                        item.severity === "high" ? "bg-destructive/10 text-destructive" : item.severity === "medium" ? "bg-warning/15 text-warning-foreground" : "bg-info/10 text-info"
                      )}>{item.count}</Badge>
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* ROW 5: Recent Audit + Configuration Overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[72%_28%]">
        <SectionCard title="Recent Audit Activity" description="Latest administrative and application events" icon={History}
          action={<Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("admin-audit")}>View All</Button>}
        >
          {recentAudit.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <History className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No audit events yet</p>
              <p className="text-xs text-muted-foreground">Administrative actions will appear here once performed.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {recentAudit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <History className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <Badge variant="outline" className="text-[9px]">{entry.targetType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.user} · {entry.entityId}
                      {entry.oldValue && entry.newValue ? ` · ${entry.oldValue} → ${entry.newValue}` : entry.newValue ? ` → ${entry.newValue}` : ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Configuration Overview" description="Admin modules" icon={Settings}>
          <div className="grid grid-cols-1 gap-2.5">
            {configCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.view}
                  onClick={() => navigate(card.view)}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{card.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{card.count}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, hint, cls }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; hint?: string; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}>
        <Icon className="size-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
