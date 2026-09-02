"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { SMS_TEMPLATES, FEE_STRUCTURES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
} from "@/components/design-system/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MailWarning,
  MessageSquare,
  Bell,
  Send,
  Smartphone,
  Mail,
  CircleCheck,
  CircleSlash,
  Activity,
  FileStack,
  Zap,
  Building2,
  FileText,
  IndianRupee,
  FileCog,
  CircleAlert,
  Clock,
  Pencil,
} from "lucide-react";
import type {
  NotificationType,
  ApplicationType,
  FeeStructure,
} from "@/types";

// ============================================================
// Notification channel catalog (local — no store backing)
// ============================================================
interface NotifTypeConfig {
  type: NotificationType;
  label: string;
  inApp: boolean;
  sms: boolean;
  email: boolean;
  description: string;
}

const NOTIF_TYPES: NotifTypeConfig[] = [
  { type: "APPLICATION_SUBMITTED", label: "Application Submitted", inApp: true, sms: true, email: false, description: "Sent to LTP when an application is submitted." },
  { type: "SCRUTINY_FAILED", label: "Scrutiny Failed", inApp: true, sms: true, email: true, description: "Sent to LTP when drawing scrutiny fails." },
  { type: "SCRUTINY_PASSED", label: "Scrutiny Passed", inApp: true, sms: true, email: false, description: "Sent to LTP when drawings pass scrutiny." },
  { type: "DOCUMENTS_REQUIRED", label: "Documents Required", inApp: true, sms: true, email: false, description: "Sent to LTP prompting upload of required documents." },
  { type: "FEE_GENERATED", label: "Fee Generated", inApp: true, sms: true, email: false, description: "Sent to LTP when fee is generated." },
  { type: "PAYMENT_SUCCESSFUL", label: "Payment Successful", inApp: true, sms: true, email: true, description: "Sent to LTP after a successful payment." },
  { type: "SHORTFALL_RAISED", label: "Shortfall Raised", inApp: true, sms: true, email: true, description: "Sent to LTP when a shortfall is raised." },
  { type: "SHORTFALL_RESPONDED", label: "Shortfall Responded", inApp: true, sms: false, email: false, description: "Sent to assigned officer when LTP responds to a shortfall." },
  { type: "SHORTFALL_RESOLVED", label: "Shortfall Resolved", inApp: true, sms: true, email: false, description: "Sent to LTP when a shortfall is closed." },
  { type: "APPLICATION_FORWARDED", label: "Application Forwarded", inApp: true, sms: false, email: false, description: "Sent to LTP when the application moves to the next stage." },
  { type: "APPLICATION_APPROVED", label: "Application Approved", inApp: true, sms: true, email: true, description: "Sent to LTP on final approval." },
  { type: "APPLICATION_REJECTED", label: "Application Rejected", inApp: true, sms: true, email: true, description: "Sent to LTP when an application is rejected." },
  { type: "APPLICATION_RETURNED", label: "Application Returned", inApp: true, sms: true, email: false, description: "Sent to LTP when an application is returned for correction." },
  { type: "FINAL_DECISION", label: "Final Decision", inApp: true, sms: true, email: true, description: "Sent to LTP when the final decision is recorded." },
  { type: "SYSTEM", label: "System Broadcast", inApp: true, sms: false, email: false, description: "System-wide broadcast notifications (no per-app context)." },
];

// Maps each SMS template code → the notification event type it serves.
// Used to compute "templates in use" / per-template usage from real store notifications.
const SMS_TEMPLATE_EVENT_MAP: Record<string, NotificationType> = {
  SMS_APP_SUBMIT: "APPLICATION_SUBMITTED",
  SMS_SCRUTINY_FAIL: "SCRUTINY_FAILED",
  SMS_SCRUTINY_PASS: "SCRUTINY_PASSED",
  SMS_FEE_GEN: "FEE_GENERATED",
  SMS_PAY_OK: "PAYMENT_SUCCESSFUL",
  SMS_SHORTFALL: "SHORTFALL_RAISED",
  SMS_FORWARD: "APPLICATION_FORWARDED",
  SMS_APPROVED: "APPLICATION_APPROVED",
  SMS_REJECTED: "APPLICATION_REJECTED",
  SMS_SF_RESPONDED: "SHORTFALL_RESPONDED",
};

// Sample data for rendering template previews (mock — no real data is sent).
const SAMPLE_DATA: Record<string, string> = {
  "{name}": "Ar. Vikram Deshpande",
  "{appNo}": "MC/BP/2026/04/0184",
  "{amount}": "2,67,850",
  "{receiptNo}": "RCP/2026/04/00921",
  "{reportNo}": "SCR/2026/4827",
  "{dueDate}": "22-Jan-2026",
  "{stage}": "ZAD / ZDD Review",
  "{permitNo}": "PER/2026/04/0098",
  "{reason}": "FAR excess beyond permissible limit",
  "{shortfallId}": "SF/2026/0042",
};

function renderTemplate(tpl: string): string {
  let out = tpl;
  Object.entries(SAMPLE_DATA).forEach(([k, v]) => {
    out = out.split(k).join(v);
  });
  return out;
}

// Preview-only badge shown next to controls that have no store backing.
function PreviewBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900 text-[10px] font-medium"
    >
      <CircleAlert className="size-3" /> Preview only
    </Badge>
  );
}

// Inline KPI card (matches the pattern used by admin-dashboard & admin-audit).
function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  cls,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  cls: string;
}) {
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

// Scrollbar styling utility class used for long lists.
const SCROLLBAR_CLS =
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent";

export function AdminTemplates() {
  // ---- Store selectors (single source of truth where data exists) ----
  const applicationTypes = useAppStore((s) => s.applicationTypes);
  const applications = useAppStore((s) => s.applications);
  const notifications = useAppStore((s) => s.notifications);
  const smsLogs = useAppStore((s) => s.smsLogs);
  const systemSettings = useAppStore((s) => s.systemSettings);

  // ---- Local catalog state (preview-only — no store action exists for these toggles) ----
  const [activeMap, setActiveMap] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(SMS_TEMPLATES.map((t) => [t.id, t.active]))
  );
  const [channelState, setChannelState] = React.useState<NotifTypeConfig[]>(NOTIF_TYPES);

  // ---- Test send dialog state (mock sandbox — no real SMS delivered) ----
  const [testOpen, setTestOpen] = React.useState<string | null>(null);
  const [testPhone, setTestPhone] = React.useState("+91 98220 14578");

  // ---- Derived stats (real store data where possible) ----

  // Notifications grouped by event type (real store data)
  const notifsByType = React.useMemo(() => {
    const counts: Partial<Record<NotificationType, number>> = {};
    notifications.forEach((n) => {
      counts[n.type] = (counts[n.type] ?? 0) + 1;
    });
    return counts;
  }, [notifications]);

  // SMS templates "in use" = those whose mapped NotificationType has produced
  // at least one notification in the store (real store data).
  const templatesInUse = React.useMemo(
    () =>
      SMS_TEMPLATES.filter((t) => {
        const nt = SMS_TEMPLATE_EVENT_MAP[t.code];
        return !!nt && (notifsByType[nt] ?? 0) > 0;
      }).length,
    [notifsByType]
  );

  // Per-template usage count (notifications of the mapped event type — real store data)
  const usageByTemplateId = React.useMemo(() => {
    const m: Record<string, number> = {};
    SMS_TEMPLATES.forEach((t) => {
      const nt = SMS_TEMPLATE_EVENT_MAP[t.code];
      m[t.id] = nt ? notifsByType[nt] ?? 0 : 0;
    });
    return m;
  }, [notifsByType]);

  // Application types coverage (real store data)
  const appTypesCovered = applicationTypes.filter((t) => t.active).length;
  const pendingCustomizations = applicationTypes.filter((t) => !t.active).length;

  // Applications using templates = distinct applicationNos appearing in store.notifications
  const appsUsingTemplates = React.useMemo(() => {
    const nums = new Set<string>();
    notifications.forEach((n) => {
      if (n.applicationNo) nums.add(n.applicationNo);
    });
    return nums.size;
  }, [notifications]);

  // Catalog counts
  const totalTemplates = SMS_TEMPLATES.length;
  const activeTemplates = Object.values(activeMap).filter(Boolean).length;
  const totalNotifTypes = NOTIF_TYPES.length;

  // Per-application-type stats (real store data)
  const appsByType = React.useMemo(() => {
    const counts: Partial<Record<ApplicationType, number>> = {};
    applications.forEach((a) => {
      counts[a.project.type] = (counts[a.project.type] ?? 0) + 1;
    });
    return counts;
  }, [applications]);

  // Per-application-type notification count: notifications joined to applications via applicationId.
  const notifsByAppType = React.useMemo(() => {
    const counts: Partial<Record<ApplicationType, number>> = {};
    notifications.forEach((n) => {
      const app = applications.find((a) => a.id === n.applicationId);
      if (app) {
        counts[app.project.type] = (counts[app.project.type] ?? 0) + 1;
      }
    });
    return counts;
  }, [notifications, applications]);

  // Fee structures per application type (catalog from data/fee-config)
  const feesByType = React.useMemo(() => {
    const m: Partial<Record<ApplicationType, FeeStructure[]>> = {};
    FEE_STRUCTURES.forEach((f) => {
      if (!m[f.applicationType]) m[f.applicationType] = [];
      m[f.applicationType]!.push(f);
    });
    return m;
  }, []);

  // SMS delivery stats (real store data)
  const smsStats = React.useMemo(() => {
    const total = smsLogs.length;
    const delivered = smsLogs.filter((l) => l.status === "DELIVERED").length;
    const failed = smsLogs.filter((l) => l.status === "FAILED").length;
    const pending = smsLogs.filter((l) => l.status === "PENDING" || l.status === "SENT").length;
    return {
      total,
      delivered,
      failed,
      pending,
      deliveryRate: total === 0 ? 0 : Math.round((delivered / total) * 1000) / 10,
    };
  }, [smsLogs]);

  // Recent notifications (most recent first, from store)
  const recentNotifications = React.useMemo(
    () =>
      [...notifications]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 8),
    [notifications]
  );

  // ---- Handlers (preview-only — no store mutations) ----
  // No store action exists for SMS template activation.
  function handleTemplateToggle(id: string, v: boolean) {
    setActiveMap((prev) => ({ ...prev, [id]: v }));
  }

  // No store action exists for notification channel routing.
  function handleChannelToggle(type: NotificationType, channel: "inApp" | "sms" | "email") {
    setChannelState((prev) =>
      prev.map((n) => (n.type === type ? { ...n, [channel]: !n[channel] } : n))
    );
  }

  // Mock test send — closes the dialog. No toast (no real action runs / no real SMS delivered).
  function handleTestSend() {
    setTestOpen(null);
  }

  // Gateway label derived from systemSettings.demoMode (real store value).
  const gatewayLabel = systemSettings.demoMode ? "Sandbox · Mock gateway" : "Live · MSG91";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification & SMS Templates"
        description="Manage transactional SMS templates, in-app notification copy, per-event channel routing and per-application-type template usage. Channel routing and SMS activation are preview-only in this build; deliveries are logged for audit."
        icon={MailWarning}
        breadcrumbs={[{ label: "Administration" }, { label: "Notification & SMS Templates" }]}
        badge={
          <Badge
            variant="outline"
            className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
          >
            <Zap className="size-3" /> {gatewayLabel}
          </Badge>
        }
        actions={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button size="sm" disabled aria-label="New template (preview only)">
                    <Pencil className="size-4" /> New template
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">
                  Preview only — no store action exists for creating new SMS templates in this build.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      />

      {/* Stats row (4 StatCards) — derived from store where possible */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Templates" value={totalTemplates} icon={FileStack} accent="primary" />
        <StatCard
          label="Active Templates"
          value={activeTemplates}
          icon={CircleCheck}
          accent="success"
          footer={
            <span className="text-[10px] text-muted-foreground">Local state · preview only</span>
          }
        />
        <StatCard
          label="Templates In Use"
          value={templatesInUse}
          icon={Send}
          accent="info"
          footer={<span className="text-[10px] text-muted-foreground">From store notifications</span>}
        />
        <StatCard
          label="App Types Covered"
          value={appTypesCovered}
          icon={Building2}
          accent="amber"
          footer={
            <span className="text-[10px] text-muted-foreground">From store applicationTypes</span>
          }
        />
      </div>

      {/* KPI row (4 cards) — derived from store where possible */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total Notification Types"
          value={totalNotifTypes}
          icon={Bell}
          hint="Catalog of notification events"
          cls="bg-primary/10 text-primary"
        />
        <KpiCard
          label="Active App Types"
          value={appTypesCovered}
          icon={FileCog}
          hint={`${pendingCustomizations} inactive`}
          cls="bg-success/10 text-success"
        />
        <KpiCard
          label="Applications Using Templates"
          value={appsUsingTemplates}
          icon={Activity}
          hint="Distinct apps in notifications"
          cls="bg-info/10 text-info"
        />
        <KpiCard
          label="Pending Customizations"
          value={pendingCustomizations}
          icon={CircleAlert}
          hint="Inactive application types"
          cls="bg-warning/15 text-warning-foreground"
        />
      </div>

      <Tabs defaultValue="sms">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="sms" className="gap-1.5">
            <MessageSquare className="size-3.5" /> SMS Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="size-3.5" /> Notification Templates
          </TabsTrigger>
          <TabsTrigger value="per-type" className="gap-1.5">
            <Building2 className="size-3.5" /> Per-Type Usage
          </TabsTrigger>
        </TabsList>

        {/* ===== SMS Templates tab ===== */}
        <TabsContent value="sms" className="mt-4">
          <SectionCard
            title="SMS Templates"
            description="Transactional templates rendered and dispatched via the configured SMS gateway. Active toggles are preview-only — no store action exists for SMS template activation in this build."
            icon={MessageSquare}
            noPadding
          >
            <div className={cn("max-h-96 overflow-y-auto pr-1", SCROLLBAR_CLS)}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow className="border-b-2">
                    <TableHead className="pl-5 font-bold text-foreground">Template</TableHead>
                    <TableHead className="font-bold text-foreground">Code</TableHead>
                    <TableHead className="min-w-[280px] font-bold text-foreground">Message</TableHead>
                    <TableHead className="font-bold text-foreground">Type</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Usage</TableHead>
                    <TableHead className="font-bold text-foreground">Active</TableHead>
                    <TableHead className="text-right pr-5 font-bold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SMS_TEMPLATES.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10">
                        <EmptyState
                          icon={MessageSquare}
                          title="No SMS templates"
                          description="No SMS templates are configured in the catalog."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    SMS_TEMPLATES.map((t) => {
                      const isActive = activeMap[t.id] ?? t.active;
                      const usage = usageByTemplateId[t.id] ?? 0;
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="pl-5">
                            <span className="text-sm font-medium text-foreground">{t.name}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{t.code}</span>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="line-clamp-1 cursor-help text-xs text-muted-foreground">
                                    {t.template}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <p className="text-xs leading-relaxed">{t.template}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-info/10 text-info border-info/30 text-[10px]"
                            >
                              {t.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {usage > 0 ? (
                              <Badge
                                variant="outline"
                                className="bg-success/10 text-success border-success/30 text-[10px] tabular-nums"
                                title="Notifications of the mapped event type fired in the store"
                              >
                                {usage} fired
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Switch
                                      checked={isActive}
                                      onCheckedChange={(v) => handleTemplateToggle(t.id, v)}
                                      aria-label={`Toggle active state for ${t.name} (preview only)`}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs">
                                    Preview only — no store action exists for SMS template activation.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled
                                        aria-label={`Edit ${t.name} (preview only)`}
                                      >
                                        <Pencil className="size-3.5" /> Edit
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-xs">
                                      Preview only — template editor is not wired to a store action.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button variant="outline" size="sm" onClick={() => setTestOpen(t.id)}>
                                <Send className="size-3.5" /> Test send
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ===== Notification Templates tab ===== */}
        <TabsContent value="notifications" className="mt-4 space-y-6">
          <SectionCard
            title="Notification Channel Matrix"
            description="Toggle the default delivery channels for each notification event type. All switches are preview-only — no store action exists for channel routing in this build."
            icon={Bell}
            noPadding
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 bg-muted/40">
                    <TableHead className="pl-5 font-bold text-foreground">Notification Event</TableHead>
                    <TableHead className="text-center font-bold text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Bell className="size-3.5" /> In-app
                      </span>
                    </TableHead>
                    <TableHead className="text-center font-bold text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Smartphone className="size-3.5" /> SMS
                      </span>
                    </TableHead>
                    <TableHead className="text-center font-bold text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5" /> Email
                      </span>
                    </TableHead>
                    <TableHead className="text-center font-bold text-foreground">Fired</TableHead>
                    <TableHead className="pr-5 font-bold text-foreground">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelState.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10">
                        <EmptyState
                          icon={Bell}
                          title="No notification events"
                          description="Notification event catalog is empty."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    channelState.map((n) => {
                      const fired = notifsByType[n.type] ?? 0;
                      return (
                        <TableRow key={n.type}>
                          <TableCell className="pl-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{n.label}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {n.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Switch
                                      checked={n.inApp}
                                      onCheckedChange={() => handleChannelToggle(n.type, "inApp")}
                                      aria-label={`In-app channel for ${n.label} (preview only)`}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs">
                                    Preview only — channel routing is not persisted to the store.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Switch
                                      checked={n.sms}
                                      onCheckedChange={() => handleChannelToggle(n.type, "sms")}
                                      aria-label={`SMS channel for ${n.label} (preview only)`}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs">
                                    Preview only — channel routing is not persisted to the store.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Switch
                                      checked={n.email}
                                      onCheckedChange={() => handleChannelToggle(n.type, "email")}
                                      aria-label={`Email channel for ${n.label} (preview only)`}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs">
                                    Preview only — channel routing is not persisted to the store.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            {fired > 0 ? (
                              <Badge
                                variant="outline"
                                className="bg-success/10 text-success border-success/30 text-[10px] tabular-nums"
                              >
                                {fired}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="pr-5 text-xs text-muted-foreground">
                            {n.description}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* SMS delivery stats — real store data */}
          <SectionCard
            title="SMS Delivery Stats"
            description="Aggregate delivery statistics sourced from the store's SMS logs (real data)."
            icon={Send}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total Sent" value={smsStats.total} icon={Send} accent="primary" />
              <StatCard
                label="Delivered"
                value={smsStats.delivered}
                icon={CircleCheck}
                accent="success"
              />
              <StatCard
                label="Failed"
                value={smsStats.failed}
                icon={CircleAlert}
                accent="destructive"
              />
              <StatCard
                label="Delivery Rate"
                value={`${smsStats.deliveryRate}%`}
                icon={Activity}
                accent="info"
                footer={
                  <span className="text-[10px] text-muted-foreground">
                    {smsStats.pending} pending
                  </span>
                }
              />
            </div>
          </SectionCard>

          {/* Recent notifications — sourced from store (not mock-data) */}
          <SectionCard
            title="Recent Notifications Dispatched"
            description="Latest notifications from the store's notifications slice (real data, most recent first)."
            icon={Activity}
          >
            {recentNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications yet"
                description="Notifications will appear here once they are dispatched by the workflow engine."
              />
            ) : (
              <div
                className={cn(
                  "max-h-96 space-y-2 overflow-y-auto pr-1",
                  SCROLLBAR_CLS
                )}
              >
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        n.smsSent
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {n.smsSent ? (
                        <CircleCheck className="size-4" />
                      ) : (
                        <CircleSlash className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground text-[10px]"
                        >
                          {n.channel}
                        </Badge>
                        {n.smsSent ? (
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success border-success/30 text-[10px]"
                          >
                            SMS {n.smsStatus ?? "SENT"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground text-[10px]"
                          >
                            SMS skipped
                          </Badge>
                        )}
                        {n.applicationNo && (
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] text-muted-foreground"
                          >
                            {n.applicationNo}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ===== Per-Type Usage tab ===== */}
        <TabsContent value="per-type" className="mt-4">
          <SectionCard
            title="Per-Application-Type Template Usage"
            description="Template usage broken down by application type. Application counts, notifications fired, fee structures and typical duration are sourced from the store; fee structures come from the configured fee catalog."
            icon={Building2}
            noPadding
          >
            <div className={cn("max-h-96 overflow-y-auto pr-1", SCROLLBAR_CLS)}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow className="border-b-2">
                    <TableHead className="pl-5 font-bold text-foreground">Application Type</TableHead>
                    <TableHead className="font-bold text-foreground">Code</TableHead>
                    <TableHead className="font-bold text-foreground">Status</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Applications</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Notifications</TableHead>
                    <TableHead className="font-bold text-foreground">Fee Structure</TableHead>
                    <TableHead className="text-center font-bold text-foreground">SLA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10">
                        <EmptyState
                          icon={Building2}
                          title="No application types"
                          description="Application types will appear here once seeded in the store."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    applicationTypes.map((t) => {
                      const appCount = appsByType[t.key] ?? 0;
                      const notifCount = notifsByAppType[t.key] ?? 0;
                      const fees = feesByType[t.key] ?? [];
                      return (
                        <TableRow key={t.key}>
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="size-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {t.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground line-clamp-1">
                                  {t.description}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{t.key}</span>
                          </TableCell>
                          <TableCell>
                            {t.active ? (
                              <Badge
                                variant="outline"
                                className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 text-[10px]"
                              >
                                <CircleCheck className="size-3" /> Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground text-[10px]"
                              >
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-semibold tabular-nums text-foreground">
                              {appCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {notifCount > 0 ? (
                              <Badge
                                variant="outline"
                                className="bg-info/10 text-info border-info/30 text-[10px] tabular-nums"
                              >
                                {notifCount}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {fees.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {fees.map((f) => (
                                  <span
                                    key={f.id}
                                    className="inline-flex items-center gap-1.5 text-xs text-foreground"
                                  >
                                    <IndianRupee className="size-3 text-muted-foreground" />
                                    {f.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileText className="size-3" /> Not configured
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {t.typicalDuration}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* Per-type template catalog (preview-only controls) */}
          <SectionCard
            title="Document & Scrutiny Checklist Templates"
            description="Per-application-type document and scrutiny checklists are managed in the Application Types module. The counts below are derived from the active application types in the store."
            icon={FileCog}
            className="mt-6"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {applicationTypes.map((t) => (
                <div
                  key={t.key}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-gov",
                    t.active ? "border-border" : "border-dashed border-border/60 opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileCog className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{t.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{t.key}</span>
                      </div>
                    </div>
                    {t.active ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 text-[10px]"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground text-[10px]"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-border/60 bg-muted/30 p-2">
                      <p className="text-muted-foreground">Applications</p>
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {appsByType[t.key] ?? 0}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/60 bg-muted/30 p-2">
                      <p className="text-muted-foreground">Notifications fired</p>
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {notifsByAppType[t.key] ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/60 pt-2">
                    <PreviewBadge />
                    <Button variant="outline" size="sm" disabled aria-label={`Configure ${t.name} (preview only)`}>
                      <Pencil className="size-3.5" /> Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ===== Test send dialog (mock sandbox — no real SMS delivered) ===== */}
      <Dialog open={!!testOpen} onOpenChange={(o) => !o && setTestOpen(null)}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Test SMS send</DialogTitle>
            <DialogDescription>
              {testOpen && (
                <>
                  Preview of{" "}
                  <span className="font-medium text-foreground">
                    {SMS_TEMPLATES.find((t) => t.id === testOpen)?.name}
                  </span>{" "}
                  with sample placeholders. This is a sandbox send — no real SMS is delivered.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {testOpen && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Recipient phone</Label>
                <Input
                  id="phone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+91 98220 00000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rendered preview</Label>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {renderTemplate(SMS_TEMPLATES.find((t) => t.id === testOpen)!.template)}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Placeholders auto-filled with sample application data.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-info/30 bg-info/5 px-3 py-2 text-xs text-info">
                <Zap className="size-3.5" />
                Mock send — message will not be delivered to a real device. No store action runs.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(null)}>
              Cancel
            </Button>
            <Button onClick={handleTestSend}>
              <Send className="size-4" /> Send test (mock)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminTemplates;
