"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { APPLICATIONS, ROLES } from "@/data/mock-data";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileStack,
  FilePlus2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Inbox,
  ArrowRight,
  Bell,
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";

export function LtpDashboard() {
  const { user, navigate, openApplication, notifications } = useAppStore();
  const apps = APPLICATIONS.filter((a) => a.ltpId === user?.id || user?.role === "LTP");

  const stats = {
    total: apps.length,
    draft: apps.filter((a) => a.status === "DRAFT").length,
    underReview: apps.filter((a) => ["UNDER_REVIEW", "PAYMENT_SUCCESSFUL"].includes(a.status)).length,
    action: apps.filter((a) => ["SCRUTINY_FAILED", "SHORTFALL_RAISED", "PAYMENT_PENDING", "DOCUMENTS_PENDING"].includes(a.status)).length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    shortfalls: apps.reduce((s, a) => s + a.shortfalls.length, 0),
    pendingPayment: apps.filter((a) => a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED").length,
  };

  const recent = [...apps].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);
  const actionRequired = apps.filter((a) =>
    ["SCRUTINY_FAILED", "SHORTFALL_RAISED", "PAYMENT_PENDING", "DOCUMENTS_PENDING"].includes(a.status)
  );
  const showcaseApp = apps.find((a) => a.status === "UNDER_REVIEW") ?? apps[0];
  const recentNotifs = notifications.slice(0, 5);

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
            <Button size="sm" onClick={() => navigate("ltp-create-application")}>
              <FilePlus2 className="size-4" /> New Application
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Applications" value={stats.total} icon={FileStack} accent="primary" onClick={() => navigate("ltp-applications")} />
        <StatCard label="Drafts" value={stats.draft} icon={Inbox} accent="info" />
        <StatCard label="Under Review" value={stats.underReview} icon={Clock} accent="info" />
        <StatCard label="Action Required" value={stats.action} icon={AlertTriangle} accent="warning" onClick={() => navigate("ltp-applications")} />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} accent="success" />
        <StatCard label="Shortfalls" value={stats.shortfalls} icon={FileWarning} accent="warning" onClick={() => navigate("ltp-shortfalls")} />
        <StatCard label="Pending Payments" value={stats.pendingPayment} icon={CreditCard} accent="amber" onClick={() => navigate("ltp-payment")} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left col (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action required */}
          <SectionCard
            title="Action Required"
            description="Applications that need your immediate attention"
            icon={AlertTriangle}
            action={
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("ltp-applications")}>
                View all <ChevronRight className="size-3.5" />
              </Button>
            }
          >
            {actionRequired.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="All caught up!" description="No applications require action right now." />
            ) : (
              <ul className="divide-y divide-border">
                {actionRequired.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => openApplication(a.id)}
                      className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          a.status === "SCRUTINY_FAILED" && "bg-destructive/10 text-destructive",
                          a.status === "SHORTFALL_RAISED" && "bg-warning/15 text-warning-foreground",
                          a.status === "PAYMENT_PENDING" && "bg-amber-500/15 text-amber-600",
                          a.status === "DOCUMENTS_PENDING" && "bg-info/10 text-info"
                        )}
                      >
                        {a.status === "SCRUTINY_FAILED" && <FileWarning className="size-5" />}
                        {a.status === "SHORTFALL_RAISED" && <AlertTriangle className="size-5" />}
                        {a.status === "PAYMENT_PENDING" && <CircleDollarSign className="size-5" />}
                        {a.status === "DOCUMENTS_PENDING" && <Layers className="size-5" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{a.applicationNo}</p>
                          <StatusBadge status={a.status} showIcon={false} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{a.project.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.status === "SCRUTINY_FAILED" && "Re-upload corrected drawings to proceed"}
                          {a.status === "SHORTFALL_RAISED" && `${a.shortfalls.length} shortfall(s) awaiting your response`}
                          {a.status === "PAYMENT_PENDING" && `Outstanding ₹${a.fee?.outstanding.toLocaleString("en-IN")} — pay to start workflow`}
                          {a.status === "DOCUMENTS_PENDING" && "Upload remaining required documents"}
                        </p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className="text-[11px] text-muted-foreground">Updated {timeAgo(a.lastUpdated)}</span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Recent applications */}
          <SectionCard
            title="Recent Applications"
            description="Your most recently updated applications"
            icon={Activity}
            action={
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("ltp-applications")}>
                View all <ChevronRight className="size-3.5" />
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Application No.</th>
                    <th className="pb-2 pr-3 font-medium">Project</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 pr-3 font-medium">Stage</th>
                    <th className="pb-2 pr-3 font-medium">Updated</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((a) => (
                    <tr key={a.id} className="group transition-colors hover:bg-muted/40">
                      <td className="py-2.5 pr-3">
                        <button
                          onClick={() => openApplication(a.id)}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {a.applicationNo}
                        </button>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="size-2.5" /> {a.project.ward}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 max-w-[200px]">
                        <p className="truncate text-xs font-medium">{a.project.name}</p>
                        <p className="text-[10px] text-muted-foreground">{a.project.propertyType.replace("_", " ").toLowerCase()}</p>
                      </td>
                      <td className="py-2.5 pr-3"><StatusBadge status={a.status} showIcon={false} /></td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs">{a.currentStageLabel}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(a.lastUpdated)}</td>
                      <td className="py-2.5 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openApplication(a.id)}>
                          Open <ArrowRight className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Workflow timeline showcase */}
          {showcaseApp && (
            <SectionCard
              title="Live Workflow Tracker"
              description={`Tracking ${showcaseApp.applicationNo} through the approval pipeline`}
              icon={TrendingUp}
              action={
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => openApplication(showcaseApp.id)}>
                  Details <ChevronRight className="size-3.5" />
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{showcaseApp.project.name}</p>
                    <p className="text-xs text-muted-foreground">{showcaseApp.applicationNo} · {showcaseApp.project.propertyType.replace("_", " ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={showcaseApp.status} />
                    <PriorityBadge priority={showcaseApp.priority} />
                  </div>
                </div>
                <Progress value={showcaseApp.progress} className="h-1.5" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium tabular-nums">{showcaseApp.progress}% complete</span>
                </div>
                <Separator />
                <WorkflowStepper currentStage={showcaseApp.currentStage} status={showcaseApp.status === "APPROVED" ? "COMPLETED" : "CURRENT"} />
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Expected SLA:</span>
                    <span className="font-medium">{formatDate(showcaseApp.expectedSLA ?? "")}</span>
                  </div>
                  {showcaseApp.assignedOfficer && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">{showcaseApp.assignedOfficer.name}</span>
                      <RoleBadge role={showcaseApp.assignedOfficer.role} />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right col (1/3) */}
        <div className="space-y-6">
          {/* Quick actions */}
          <SectionCard title="Quick Actions" icon={Sparkles} noPadding>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                { label: "New Application", icon: FilePlus2, view: "ltp-create-application" as const, accent: "bg-primary/10 text-primary" },
                { label: "Upload Drawing", icon: Layers, view: "ltp-drawings" as const, accent: "bg-info/10 text-info" },
                { label: "Pay Fees", icon: CircleDollarSign, view: "ltp-payment" as const, accent: "bg-amber-500/15 text-amber-600" },
                { label: "Shortfalls", icon: FileWarning, view: "ltp-shortfalls" as const, accent: "bg-warning/15 text-warning-foreground" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.view)}
                  className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-gov"
                >
                  <div className={cn("flex size-8 items-center justify-center rounded-md", a.accent)}>
                    <a.icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Recent notifications */}
          <SectionCard
            title="Recent Notifications"
            icon={Bell}
            action={
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("ltp-notifications")}>
                All <ChevronRight className="size-3.5" />
              </Button>
            }
            noPadding
          >
            <ScrollArea className="h-[280px]">
              <ul className="divide-y divide-border">
                {recentNotifs.map((n) => (
                  <li key={n.id} className={cn("p-3 transition-colors hover:bg-muted/40", !n.read && "bg-primary/[0.03]")}>
                    <div className="flex items-start gap-2.5">
                      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                        <Bell className="size-3.5" />
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className={cn("text-xs leading-tight", !n.read && "font-semibold")}>{n.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </SectionCard>

          {/* LTP profile summary */}
          <SectionCard title="Your License" icon={Building2}>
            <div className="space-y-3">
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
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">License No.</p>
                  <p className="font-mono font-medium">{user?.licenseNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Zone</p>
                  <p className="font-medium">{user?.zone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Last login</p>
                  <p className="font-medium">{user?.lastLogin ? formatDateTime(user.lastLogin) : "—"}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("ltp-profile")}>
                View full profile
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
