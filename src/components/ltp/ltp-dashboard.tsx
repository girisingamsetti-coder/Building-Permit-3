"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useVisibleApplications } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { KpiCard } from "@/components/design-system/kpi-card";
import { NewApplicationModal } from "@/components/ltp/new-application/new-application-modal";
import {
  StatusBadge,
  PriorityBadge,
  RoleBadge,
} from "@/components/design-system/badges";
import {
  WorkflowStepper,
  formatDateTime,
  formatDate,
  timeAgo,
} from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileStack,
  FilePlus2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Inbox,
  ArrowRight,
  TrendingUp,
  CalendarClock,
  Building2,
  MapPin,
  Layers,
  FileWarning,
  Sparkles,
  ChevronRight,
  CircleDollarSign,
  Activity,
  FileText,
  ShieldCheck,
  User,
  Briefcase,
} from "lucide-react";
import type { Application } from "@/types";

// Compact "View all" text-link component for section headers
function ViewAllLink({ onClick, label = "View all" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 rounded-sm whitespace-nowrap"
    >
      {label} <ChevronRight className="size-3.5" />
    </button>
  );
}

export function LtpDashboard() {
  const { user, navigate, openApplication } = useAppStore();
  const apps = useVisibleApplications();
  const [newAppOpen, setNewAppOpen] = React.useState(false);
  const [trackerAppId, setTrackerAppId] = React.useState<string>("");

  const REVIEW_STATUSES = [
    "TPS_TECHNICAL_SCRUTINY",
    "TPA_REVIEW",
    "ZAD_ZDD_REVIEW",
    "ZJD_REVIEW",
    "DIRECTOR_DP_REVIEW",
    "ADDITIONAL_COMMISSIONER_REVIEW",
    "COMMISSIONER_REVIEW",
  ] as const;
  const ACTION_STATUSES = [
    "SCRUTINY_FAILED",
    "SHORTFALL_RAISED",
    "PAYMENT_PENDING",
    "DOCUMENT_UPLOAD_PENDING",
    "DRAWING_REUPLOAD_REQUIRED",
  ] as const;

  // Derive all stats from the same applications dataset (single source of truth)
  const stats = {
    total: apps.length,
    draft: apps.filter((a) => a.status === "DRAFT").length,
    underReview: apps.filter((a) => (REVIEW_STATUSES as readonly string[]).includes(a.status)).length,
    action: apps.filter((a) => (ACTION_STATUSES as readonly string[]).includes(a.status)).length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    shortfalls: apps.reduce((s, a) => s + a.shortfalls.filter((sf) => sf.status !== "RESOLVED").length, 0),
    pendingPayment: apps.filter((a) => a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED").length,
  };

  const recent = [...apps].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);
  const actionRequired = apps
    .filter((a) => (ACTION_STATUSES as readonly string[]).includes(a.status))
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

  // Dynamic tracker app: use selected, or default to one under review
  const trackerApp = React.useMemo(() => {
    if (trackerAppId) return apps.find((a) => a.id === trackerAppId) ?? null;
    return apps.find((a) => a.status === "TPS_TECHNICAL_SCRUTINY" || a.status === "TPA_REVIEW") ?? apps[0] ?? null;
  }, [trackerAppId, apps]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name.split(" ").slice(-1)[0] === "Deshpande" ? "Ar. Deshpande" : user?.name}`}
        description="Here's an overview of your applications and pending actions across the approval workflow."
        icon={Building2}
        breadcrumbs={[{ label: "LTP Portal" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("ltp-applications")}>
              <FileStack className="size-4" /> View all
            </Button>
            <Button size="sm" onClick={() => setNewAppOpen(true)}>
              <FilePlus2 className="size-4" /> New Application
            </Button>
          </>
        }
      />

      {/* ===== KPI Cards ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Total Applications" value={stats.total} icon={FileStack} accent="primary" onClick={() => navigate("ltp-applications")} />
        <KpiCard label="Drafts" value={stats.draft} icon={Inbox} accent="info" onClick={() => navigate("ltp-applications")} />
        <KpiCard label="Under Review" value={stats.underReview} icon={Clock} accent="teal" onClick={() => navigate("ltp-applications")} />
        <KpiCard label="Action Required" value={stats.action} icon={AlertTriangle} accent="amber" onClick={() => navigate("ltp-applications")} />
        <KpiCard label="Approved" value={stats.approved} icon={CheckCircle2} accent="success" onClick={() => navigate("ltp-applications")} />
        <KpiCard label="Shortfalls" value={stats.shortfalls} icon={FileWarning} accent="danger" onClick={() => navigate("ltp-shortfalls")} />
        <KpiCard label="Pending Payments" value={stats.pendingPayment} icon={CreditCard} accent="orange" onClick={() => navigate("ltp-payment")} />
      </div>

      {/* ===== Main + Right Rail grid ===== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* ===== Main content ===== */}
        <div className="space-y-6 min-w-0">
          {/* Action Required */}
          <SectionCard
            title="Action Required"
            description="Applications that need your immediate attention"
            icon={AlertTriangle}
            action={<ViewAllLink onClick={() => navigate("ltp-applications")} />}
          >
            {actionRequired.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="All caught up!" description="No applications require action right now." />
            ) : (
              <ul className="divide-y divide-border">
                {actionRequired.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => openApplication(a.id)}
                      className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          (a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED") && "bg-destructive/10 text-destructive",
                          a.status === "SHORTFALL_RAISED" && "bg-warning/15 text-warning-foreground",
                          a.status === "PAYMENT_PENDING" && "bg-orange-500/15 text-orange-600",
                          a.status === "DOCUMENT_UPLOAD_PENDING" && "bg-info/10 text-info"
                        )}
                      >
                        {(a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED") && <FileWarning className="size-5" />}
                        {a.status === "SHORTFALL_RAISED" && <AlertTriangle className="size-5" />}
                        {a.status === "PAYMENT_PENDING" && <CircleDollarSign className="size-5" />}
                        {a.status === "DOCUMENT_UPLOAD_PENDING" && <Layers className="size-5" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono text-xs font-semibold text-foreground">{a.applicationNo}</p>
                          <StatusBadge status={a.status} showIcon={false} />
                        </div>
                        <p className="text-sm font-medium truncate">{a.project.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {(a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED") && "Re-upload corrected drawings to proceed"}
                          {a.status === "SHORTFALL_RAISED" && `${a.shortfalls.filter((sf) => sf.status !== "RESOLVED").length} shortfall(s) awaiting your response`}
                          {a.status === "PAYMENT_PENDING" && `Outstanding ₹${(a.fee?.outstanding ?? 0).toLocaleString("en-IN")} — pay to start workflow`}
                          {a.status === "DOCUMENT_UPLOAD_PENDING" && "Upload remaining required documents"}
                        </p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">Updated {timeAgo(a.lastUpdated)}</span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Recent Applications */}
          <SectionCard
            title="Recent Applications"
            description="Your most recently updated applications"
            icon={Activity}
            action={<ViewAllLink onClick={() => navigate("ltp-applications")} />}
          >
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium min-w-[120px]">Application No.</th>
                    <th className="pb-2 pr-3 font-medium min-w-[180px]">Project</th>
                    <th className="pb-2 pr-3 font-medium min-w-[110px]">Status</th>
                    <th className="pb-2 pr-3 font-medium min-w-[120px]">Stage</th>
                    <th className="pb-2 pr-3 font-medium whitespace-nowrap">Updated</th>
                    <th className="pb-2 font-medium text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => openApplication(a.id)}
                      className="group cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <td className="py-3 pr-3">
                        <p className="font-mono text-xs font-semibold text-primary group-hover:underline">{a.applicationNo}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="size-2.5" /> {a.project.ward}
                        </div>
                      </td>
                      <td className="py-3 pr-3 max-w-[200px]">
                        <p className="truncate text-xs font-medium">{a.project.name}</p>
                        <p className="text-[10px] text-muted-foreground">{a.project.propertyType.replace("_", " ").toLowerCase()}</p>
                      </td>
                      <td className="py-3 pr-3"><StatusBadge status={a.status} showIcon={false} /></td>
                      <td className="py-3 pr-3"><span className="text-xs">{a.currentStageLabel}</span></td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(a.lastUpdated)}</td>
                      <td className="py-3 text-right">
                        <ArrowRight className="size-4 text-muted-foreground inline group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-border">
              {recent.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openApplication(a.id)}
                  className="flex w-full items-center gap-3 py-3 text-left active:bg-muted/40"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs font-semibold text-primary truncate">{a.applicationNo}</p>
                      <StatusBadge status={a.status} showIcon={false} />
                    </div>
                    <p className="text-xs font-medium truncate">{a.project.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.currentStageLabel} · {timeAgo(a.lastUpdated)}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Live Workflow Tracker — DYNAMIC */}
          {trackerApp ? (
            <SectionCard
              title="Live Workflow Tracker"
              description="Track the selected application through the approval pipeline"
              icon={TrendingUp}
              action={
                <Select value={trackerApp.id} onValueChange={(id) => setTrackerAppId(id)}>
                  <SelectTrigger className="h-8 w-[220px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-mono font-medium">{a.applicationNo}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[260px]">
                            {a.project.name} · {a.applicant.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <div className="space-y-4">
                {/* Selected application context */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{trackerApp.project.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {trackerApp.applicationNo} · {trackerApp.applicant.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={trackerApp.status} />
                    <PriorityBadge priority={trackerApp.priority} />
                  </div>
                </div>

                {/* Progress */}
                <Progress value={trackerApp.progress} className="h-1.5" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium tabular-nums">{trackerApp.progress}% complete</span>
                </div>

                <Separator />

                {/* Workflow stepper — dynamically reflects selected app's stage */}
                <WorkflowStepper
                  currentStage={trackerApp.currentStage}
                  status={
                    trackerApp.status === "APPROVED" ? "COMPLETED" :
                    trackerApp.status === "REJECTED" ? "FAILED" :
                    trackerApp.status === "SHORTFALL_RAISED" ? "SHORTFALL" :
                    trackerApp.status === "SCRUTINY_FAILED" ? "FAILED" :
                    trackerApp.status === "RETURNED" ? "RETURNED" :
                    "CURRENT"
                  }
                />

                {/* SLA + assigned officer */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Expected SLA:</span>
                    <span className="font-medium">{formatDate(trackerApp.expectedSLA ?? "")}</span>
                  </div>
                  {trackerApp.assignedOfficer && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Assigned:</span>
                      <span className="font-medium">{trackerApp.assignedOfficer.name}</span>
                      <RoleBadge role={trackerApp.assignedOfficer.role} />
                    </div>
                  )}
                </div>

                {/* View Application button */}
                <Button variant="outline" size="sm" className="w-full" onClick={() => openApplication(trackerApp.id)}>
                  <ArrowRight className="size-4" /> View Application
                </Button>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Live Workflow Tracker" description="No applications to track" icon={TrendingUp}>
              <EmptyState icon={TrendingUp} title="No applications available" description="Create an application to track its workflow." />
            </SectionCard>
          )}
        </div>

        {/* ===== Right rail ===== */}
        <div className="space-y-6 min-w-0">
          {/* Quick Actions */}
          <SectionCard title="Quick Actions" icon={Sparkles} noPadding>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                { label: "New Application", icon: FilePlus2, view: null as const, accent: "bg-primary/10 text-primary" },
                { label: "Upload Drawing", icon: Layers, view: "ltp-drawings" as const, accent: "bg-info/10 text-info" },
                { label: "Pay Fees", icon: CircleDollarSign, view: "ltp-payment" as const, accent: "bg-orange-500/15 text-orange-600" },
                { label: "Shortfalls", icon: FileWarning, view: "ltp-shortfalls" as const, accent: "bg-warning/15 text-warning-foreground" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => a.view ? navigate(a.view) : setNewAppOpen(true)}
                  className="group flex h-[72px] flex-col items-start justify-center gap-1.5 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-gov focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <div className={cn("flex size-7 items-center justify-center rounded-md", a.accent)}>
                    <a.icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Your License — Enhanced with Application Overview */}
          <SectionCard title="Your License" icon={Building2}>
            <div className="space-y-3">
              {/* Profile header */}
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {(user?.name ?? "LTP").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.designation}</p>
                </div>
                <RoleBadge role="LTP" />
              </div>

              <Separator />

              {/* License details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">License No.</p>
                  <p className="font-mono font-medium">{user?.licenseNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Zone</p>
                  <p className="font-medium">{user?.zone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">License Status</p>
                  <span className="inline-flex items-center gap-1 text-success font-medium">
                    <span className="size-1.5 rounded-full bg-success" /> Active
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Login</p>
                  <p className="font-medium">{user?.lastLogin ? formatDateTime(user.lastLogin) : "—"}</p>
                </div>
              </div>

              <Separator />

              {/* Application Overview — derived from shared dataset */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Application Overview</p>
                <div className="grid grid-cols-2 gap-2">
                  <OverviewStat label="Active" value={stats.total - stats.approved} icon={FileStack} />
                  <OverviewStat label="Action Required" value={stats.action} icon={AlertTriangle} />
                  <OverviewStat label="Under Review" value={stats.underReview} icon={Clock} />
                  <OverviewStat label="Approved" value={stats.approved} icon={CheckCircle2} />
                </div>
              </div>

              <Separator />

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("ltp-profile")}>
                  <User className="size-3.5" /> View Profile
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("ltp-applications")}>
                  <Briefcase className="size-3.5" /> Applications
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* New Application Modal (shared) */}
      <NewApplicationModal open={newAppOpen} onOpenChange={setNewAppOpen} />
    </div>
  );
}

// Compact stat for the License card
function OverviewStat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5">
      <Icon className="size-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground leading-tight truncate">{label}</p>
      </div>
    </div>
  );
}
