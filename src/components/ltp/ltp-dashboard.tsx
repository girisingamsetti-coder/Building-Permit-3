"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useVisibleApplications } from "@/store/app-store";
import { SectionCard, EmptyState } from "@/components/design-system/layout";
import { NewApplicationModal } from "@/components/ltp/new-application/new-application-modal";
import {
  StatusBadge,
  RoleBadge,
} from "@/components/design-system/badges";
import {
  WorkflowStepper,
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
  CreditCard,
  ArrowRight,
  TrendingUp,
  CalendarClock,
  Building2,
  Layers,
  FileWarning,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  CircleDollarSign,
  Upload,
  FileText,
  Sparkles,
} from "lucide-react";
import type { Application, ApplicationStatus, ViewKey } from "@/types";

// ============================================================
// KPI DATA — derived from shared application state
// ============================================================
const REVIEW_STATUSES: string[] = [
  "TPS_TECHNICAL_SCRUTINY", "TPA_REVIEW", "ZAD_ZDD_REVIEW", "ZJD_REVIEW",
  "DIRECTOR_DP_REVIEW", "ADDITIONAL_COMMISSIONER_REVIEW", "COMMISSIONER_REVIEW",
];
const ACTION_STATUSES: string[] = [
  "SCRUTINY_FAILED", "SHORTFALL_RAISED", "PAYMENT_PENDING",
  "DOCUMENT_UPLOAD_PENDING", "DRAWING_REUPLOAD_REQUIRED",
];

// ============================================================
// APPLICATION ACTION RESOLVER
// ============================================================
interface AppAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view: ViewKey;
}

function getApplicationAction(status: ApplicationStatus): AppAction {
  switch (status) {
    case "DRAFT":
      return { label: "Continue Application", icon: FilePlus2, view: "ltp-create-application" };
    case "SCRUTINY_FAILED":
    case "DRAWING_REUPLOAD_REQUIRED":
      return { label: "Upload Revised Drawing", icon: Upload, view: "ltp-drawings" };
    case "DOCUMENT_UPLOAD_PENDING":
      return { label: "Upload Documents", icon: Layers, view: "ltp-documents" };
    case "PAYMENT_PENDING":
    case "FEE_GENERATED":
      return { label: "Pay Now", icon: CircleDollarSign, view: "ltp-payment" };
    case "SHORTFALL_RAISED":
      return { label: "Resolve Shortfall", icon: FileWarning, view: "ltp-shortfalls" };
    case "APPROVED":
      return { label: "Download Sanction", icon: CheckCircle2, view: "ltp-receipt" };
    default:
      return { label: "View Status", icon: ArrowRight, view: "ltp-application-details" };
  }
}

// ============================================================
// DASHBOARD COMPONENT
// ============================================================
export function LtpDashboard() {
  const { user, navigate, openApplication } = useAppStore();
  const apps = useVisibleApplications();
  const [newAppOpen, setNewAppOpen] = React.useState(false);
  const [trackerAppId, setTrackerAppId] = React.useState<string>("");

  // Derive KPI stats from shared dataset
  const stats = {
    total: apps.length,
    pendingPayments: apps.filter((a) => a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED").length,
    scrutinyPending: apps.filter((a) =>
      a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED" ||
      a.status === "SCRUTINY_IN_PROGRESS" || a.status === "DRAWING_UPLOADED"
    ).length,
    shortfallRaised: apps.reduce((s, a) => s + a.shortfalls.filter((sf) => sf.status !== "RESOLVED").length, 0),
  };

  // Recent applications (sorted by lastUpdated, show up to 9)
  const recentApps = [...apps].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 9);

  // Dynamic tracker app
  const trackerApp = React.useMemo(() => {
    if (trackerAppId) return apps.find((a) => a.id === trackerAppId) ?? null;
    return apps.find((a) => REVIEW_STATUSES.includes(a.status)) ?? apps[0] ?? null;
  }, [trackerAppId, apps]);

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* ===== Welcome Header (minimal — no action buttons) ===== */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-gov">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          {(user?.name ?? "LTP").split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Welcome back, {user?.name?.split(" ").slice(-1)[0] === "Deshpande" ? "Ar. Deshpande" : user?.name}</h1>
          <p className="text-xs text-muted-foreground">LTP (Applicant) · {today}</p>
        </div>
      </div>

      {/* ===== KPI Cards (4 cards) ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          icon={FileStack}
          value={stats.total}
          label="TOTAL APPLICATIONS"
          subtext="Submitted by you"
          accent="bg-primary/10 text-primary"
          onClick={() => navigate("ltp-applications")}
        />
        <KpiStatCard
          icon={CreditCard}
          value={stats.pendingPayments}
          label="PENDING PAYMENTS"
          subtext="Awaiting fee payment"
          accent="bg-orange-500/10 text-orange-600"
          onClick={() => navigate("ltp-payment")}
        />
        <KpiStatCard
          icon={Clock}
          value={stats.scrutinyPending}
          label="SCRUTINY PENDING"
          subtext="Under drawing scrutiny"
          accent="bg-amber-500/10 text-amber-600"
          onClick={() => navigate("ltp-drawings")}
        />
        <KpiStatCard
          icon={AlertTriangle}
          value={stats.shortfallRaised}
          label="SHORTFALL RAISED"
          subtext="Needs your action"
          accent="bg-destructive/10 text-destructive"
          onClick={() => navigate("ltp-shortfalls")}
        />
      </div>

      {/* ===== My Applications + Quick Actions (side by side on desktop) ===== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* My Applications */}
        <div className="min-w-0">
          <SectionCard
            title="My Applications"
            description="Recent applications submitted by you"
            icon={FileStack}
            action={
              <button
                onClick={() => navigate("ltp-applications")}
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                View all <ChevronRight className="size-3.5" />
              </button>
            }
            noPadding
          >
            {recentApps.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={FileStack}
                  title="No applications submitted yet"
                  description="Create your first building permit application to get started."
                  action={<Button size="sm" onClick={() => setNewAppOpen(true)}><FilePlus2 className="size-4" /> New Application</Button>}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-2">
                {recentApps.slice(0, 6).map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onClick={() => openApplication(app.id)}
                    onAction={(view) => openApplication(app.id, view)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
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
        </div>
      </div>

      {/* ===== Live Workflow Tracker ===== */}
      {trackerApp && (
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{trackerApp.project.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {trackerApp.applicationNo} · {trackerApp.applicant.name}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={trackerApp.status} />
              </div>
            </div>
            <Progress value={trackerApp.progress} className="h-1.5" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">{trackerApp.progress}% complete</span>
            </div>
            <Separator />
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
            <Button variant="outline" size="sm" className="w-full" onClick={() => openApplication(trackerApp.id)}>
              <ArrowRight className="size-4" /> View Application
            </Button>
          </div>
        </SectionCard>
      )}

      {/* New Application Modal */}
      <NewApplicationModal open={newAppOpen} onOpenChange={setNewAppOpen} />
    </div>
  );
}

// ============================================================
// KPI STAT CARD
// ============================================================
function KpiStatCard({
  icon: Icon,
  value,
  label,
  subtext,
  accent,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  subtext: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-gov transition-all hover:border-primary/40 hover:shadow-gov-lg"
    >
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", accent)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{subtext}</p>
      </div>
    </button>
  );
}

// ============================================================
// APPLICATION CARD
// ============================================================
function ApplicationCard({
  app,
  onClick,
  onAction,
}: {
  app: Application;
  onClick: () => void;
  onAction: (view: ViewKey) => void;
}) {
  const action = getApplicationAction(app.status);
  const ActionIcon = action.icon;

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 shadow-gov transition-all hover:border-primary/40 hover:shadow-gov-lg"
    >
      {/* Top row: App No + Status */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs font-semibold text-primary group-hover:underline truncate">{app.applicationNo}</p>
        <StatusBadge status={app.status} showIcon={false} />
      </div>

      {/* Project name */}
      <p className="mt-2 text-sm font-medium truncate">{app.project.name}</p>

      {/* Metadata grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Application Type</p>
          <p className="text-[11px] font-medium text-foreground truncate">{app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Applicant</p>
          <p className="text-[11px] font-medium text-foreground truncate">{app.applicant.name}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Zone</p>
          <p className="text-[11px] font-medium text-foreground truncate">{app.project.zone}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Ward</p>
          <p className="text-[11px] font-medium text-foreground truncate">{app.project.ward}</p>
        </div>
      </div>

      {/* Divider */}
      <Separator className="my-3" />

      {/* Stage + Updated */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="size-3" />
          <span className="truncate">{app.currentStageLabel}</span>
        </span>
        <span className="text-muted-foreground whitespace-nowrap">{timeAgo(app.lastUpdated)}</span>
      </div>

      {/* Action button — pushes to bottom */}
      <div className="mt-3 pt-1">
        <Button
          size="sm"
          variant="default"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onAction(action.view);
          }}
        >
          <ActionIcon className="size-3.5" />
          {action.label}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
