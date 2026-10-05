"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication, ROLES } from "@/store/app-store";
import {
  StatusBadge,
  PriorityBadge,
  RoleBadge,
  SeverityBadge,
  DocumentStatusBadge,
  PaymentStatusBadge,
} from "@/components/design-system/badges";
import {
  WorkflowStepper,
  WorkflowTimeline,
  AuditTimeline,
  StageStatusPill,
  formatDateTime,
  formatDate,
  formatINR,
  timeAgo,
} from "@/components/design-system/workflow";
import {
  DrawingViewer,
  FileUploader,
  DocumentFileRow,
  type UploadedFile,
} from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Workflow,
  Upload,
  FolderClosed,
  ReceiptIndianRupee,
  Flame,
  AlertTriangle,
  MessageSquare,
  History,
  Building2,
  MapPin,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Eye,
  FileWarning,
  ScrollText,
  ShieldCheck,
  Info,
  Copy,
  Printer,
  Share2,
  ChevronRight,
  Flag,
  Box,
  Pencil,
  Check,
  X,
  Save,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, Shortfall, ShortfallType } from "@/types";
import {
  ApcrdaPaymentReceiptModal,
  buildReceiptFromApplication,
} from "@/components/common/apcrda-payment-receipt";

// ─────────────────────────────────────────────────────────────
// APCRDA BEIGE & MAROON LOCAL DESIGN SYSTEM COMPONENTS
// ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  noPadding,
}: {
  title?: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-[#DCD5C8] bg-white shadow-2xs overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 bg-[#F5EBE1] border-b border-[#DCD5C8] px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#7A1316]/10 text-[#7A1316]">
                <Icon className="size-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm font-bold text-[#7A1316] leading-tight">{title}</h3>}
              {description && <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-4 sm:p-5")}>{children}</div>
    </div>
  );
}

function InfoGrid({
  items,
  columns = 2,
  className,
}: {
  items: { label: string; value?: React.ReactNode; mono?: boolean }[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const colMap = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };
  return (
    <div className={cn("grid grid-cols-1 gap-3", colMap[columns], className)}>
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-[#EADBCE] bg-[#FAF7F2]/75 p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A1316]/80 mb-0.5">{it.label}</div>
          <div className={cn("text-xs font-semibold text-slate-800", it.mono && "font-mono")}>
            {it.value ?? <span className="text-slate-400">—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#EADBCE]/70 last:border-0 text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={cn("font-bold text-slate-800", mono && "font-mono")}>{value ?? "—"}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon = FileWarning,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#DCD5C8] bg-[#FAF7F2] p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#F5EBE1] text-[#7A1316]">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-slate-900 text-sm">{title}</p>
        {description && <p className="text-xs text-slate-500 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LtpApplicationDetails() {
  const app = useSelectedApplication();
  const { navigate, openApplication, goBack, user } = useAppStore();
  const { toast } = useToast();
  const isLtp = user?.role === "LTP";

  const [activeTab, setActiveTab] = React.useState("overview");
  const [raiseShortfallOpen, setRaiseShortfallOpen] = React.useState(false);
  const [respondShortfallOpen, setRespondShortfallOpen] = React.useState(false);
  const [resolveShortfallOpen, setResolveShortfallOpen] = React.useState(false);
  const [selectedShortfall, setSelectedShortfall] = React.useState<Shortfall | null>(null);

  const handleBack = () => {
    if (useAppStore.getState().viewHistory.length > 0) {
      goBack();
    } else {
      navigate("ltp-dashboard");
    }
  };

  if (!app) {
    return (
      <div className="w-full h-full bg-[#FAF7F2] p-4 sm:p-6 space-y-6 font-sans text-slate-800">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#DCD5C8] bg-white text-xs font-bold text-[#7A1316] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="size-4" /> Back to Submissions
        </button>
        <EmptyState
          icon={FileWarning}
          title="No application selected"
          description="Select an application from Submissions or Dashboard to view its details."
          action={
            <Button
              size="sm"
              onClick={() => navigate("ltp-dashboard")}
              className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold cursor-pointer"
            >
              Browse Submissions
            </Button>
          }
        />
      </div>
    );
  }

  const openShortfalls = app.shortfalls.filter((s) => s.status !== "RESOLVED");

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-4 sm:p-6 space-y-5 font-sans text-slate-800 overflow-y-auto">
      {/* Top Application Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCD5C8] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="h-8 px-3 text-xs font-bold text-[#7A1316] border-[#DCD5C8] bg-white hover:bg-[#F3EADF] cursor-pointer shadow-2xs gap-1.5"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Button>
          <div className="h-4 w-px bg-[#DCD5C8] hidden sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#7A1316] bg-[#7A1316]/10 px-2.5 py-1 rounded border border-[#7A1316]/20">
              {app.applicationNo}
            </span>
            <span className="text-xs font-bold text-slate-800 hidden md:inline">
              {app.project.name}
            </span>
            <Badge variant="outline" className="text-[10px] font-semibold border-[#DCD5C8] bg-[#FAF7F2]">
              {app.project.propertyType?.replace(/_/g, " ") || "Building Permit"}
            </Badge>
            <StatusBadge status={app.status} />
          </div>
        </div>

        {/* Top Header Action Buttons: Role-aware shortfall controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isLtp ? (
            <Button
              size="sm"
              onClick={() => setRaiseShortfallOpen(true)}
              className="h-8 px-3.5 text-xs font-bold bg-[#7A1316] hover:bg-[#8F161A] text-white cursor-pointer shadow-xs gap-1.5"
            >
              <AlertTriangle className="size-3.5 text-amber-300" />
              <span>Raise Shortfall</span>
            </Button>
          ) : (
            openShortfalls.length > 0 && (
              <Button
                size="sm"
                onClick={() => setActiveTab("shortfalls")}
                className="h-8 px-3.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs gap-1.5"
              >
                <MessageSquare className="size-3.5" />
                <span>Respond to Shortfall ({openShortfalls.length})</span>
              </Button>
            )
          )}
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner app={app} isLtp={isLtp} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Workflow stepper */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCD5C8]">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-[#7A1316]" />
            <h3 className="font-bold text-sm text-[#7A1316]">Approval Workflow</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Multi-level approval pipeline</span>
        </div>
        <div className="space-y-4">
          <WorkflowStepper currentStage={app.currentStage} status={app.status === "APPROVED" ? "COMPLETED" : app.status === "SCRUTINY_FAILED" ? "FAILED" : app.status === "SHORTFALL_RAISED" ? "SHORTFALL" : "CURRENT"} variant="maroon" />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DCD5C8] bg-white px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-[#7A1316]" />
              <span className="text-slate-500">Submitted:</span>
              <span className="font-medium text-slate-800">{formatDate(app.submissionDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-[#7A1316]" />
              <span className="text-slate-500">Expected SLA:</span>
              <span className="font-medium text-slate-800">{formatDate(app.expectedSLA ?? "")}</span>
            </div>
            {app.assignedOfficer && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-[#7A1316]" />
                <span className="text-slate-500">Assigned:</span>
                <span className="font-medium text-slate-800">{app.assignedOfficer.name}</span>
                <RoleBadge role={app.assignedOfficer.role} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-[#F5EBE1] border border-[#DCD5C8] p-1.5 rounded-xl">
          <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><Info className="size-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="workflow" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><Workflow className="size-3.5" /> Workflow Timeline</TabsTrigger>
          <TabsTrigger value="drawings" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><Upload className="size-3.5" /> Drawings &amp; Scrutiny</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><FolderClosed className="size-3.5" /> Documentation</TabsTrigger>
          <TabsTrigger value="fees" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><ReceiptIndianRupee className="size-3.5" /> Fees &amp; Payment</TabsTrigger>
          <TabsTrigger value="nocs" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><Flame className="size-3.5 text-orange-500" /> Apply for NOCs</TabsTrigger>
          <TabsTrigger value="shortfalls" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><AlertTriangle className="size-3.5" /> Shortfalls {app.shortfalls.length > 0 && <Badge className="ml-1 bg-warning text-warning-foreground text-[9px]">{app.shortfalls.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="remarks" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><MessageSquare className="size-3.5" /> Remarks {app.remarks.length > 0 && <Badge className="ml-1 bg-muted text-muted-foreground text-[9px]">{app.remarks.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 data-[state=active]:bg-[#7A1316] data-[state=active]:text-white font-semibold text-slate-700"><History className="size-3.5" /> Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab app={app} />
        </TabsContent>
        <TabsContent value="workflow" className="space-y-6">
          <WorkflowTab app={app} />
        </TabsContent>
        <TabsContent value="drawings" className="space-y-6">
          <DrawingsTab app={app} isLtp={isLtp} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-6">
          <DocumentsTab app={app} />
        </TabsContent>
        <TabsContent value="fees" className="space-y-6">
          <FeesTab app={app} />
        </TabsContent>
        <TabsContent value="nocs" className="space-y-6">
          <NocsTab app={app} />
        </TabsContent>
        <TabsContent value="shortfalls" className="space-y-6">
          <ShortfallsTab
            app={app}
            onOpenRaise={() => setRaiseShortfallOpen(true)}
            onOpenRespond={(sf) => {
              setSelectedShortfall(sf);
              setRespondShortfallOpen(true);
            }}
            onOpenResolve={(sf) => {
              setSelectedShortfall(sf);
              setResolveShortfallOpen(true);
            }}
          />
        </TabsContent>
        <TabsContent value="remarks" className="space-y-6">
          <RemarksTab app={app} />
        </TabsContent>
        <TabsContent value="audit" className="space-y-6">
          <AuditTab app={app} />
        </TabsContent>
      </Tabs>

      {/* Raise Shortfall Modal (for Officers, Admin, Reviewers) */}
      <RaiseShortfallDialog
        open={raiseShortfallOpen}
        onOpenChange={setRaiseShortfallOpen}
        app={app}
      />

      {/* Respond to Shortfall Modal (for LTP) */}
      <RespondShortfallDialog
        open={respondShortfallOpen}
        onOpenChange={setRespondShortfallOpen}
        app={app}
        shortfall={selectedShortfall}
      />

      {/* Resolve Shortfall Modal (for Officers) */}
      <ResolveShortfallDialog
        open={resolveShortfallOpen}
        onOpenChange={setResolveShortfallOpen}
        app={app}
        shortfall={selectedShortfall}
      />
    </div>
  );
}

// ---------- Status Banner ----------
function StatusBanner({
  app,
  isLtp,
  onSelectTab,
}: {
  app: Application;
  isLtp?: boolean;
  onSelectTab?: (tab: string) => void;
}) {
  const { openApplication, navigate } = useAppStore();
  const { toast } = useToast();

  const config = {
    SCRUTINY_FAILED: {
      icon: XCircle,
      cls: "border-destructive/30 bg-destructive/5 text-destructive",
      iconCls: "bg-destructive/10 text-destructive",
      title: "Drawing scrutiny failed",
      desc: isLtp
        ? `${app.scrutinyReport?.failed ?? 1} critical issue(s) found. Please re-upload corrected drawings.`
        : `${app.scrutinyReport?.failed ?? 1} critical issue(s) found in drawing scrutiny.`,
      action: isLtp ? { label: "Re-upload drawings", view: "ltp-drawings" as const } : undefined,
    },
    DRAWING_REUPLOAD_REQUIRED: {
      icon: XCircle,
      cls: "border-destructive/30 bg-destructive/5 text-destructive",
      iconCls: "bg-destructive/10 text-destructive",
      title: "Drawing re-upload required",
      desc: isLtp
        ? "Scrutiny identified critical non-compliances. Please re-upload a corrected drawing."
        : "Scrutiny identified critical non-compliances. Awaiting corrected drawing upload by LTP.",
      action: isLtp ? { label: "Re-upload drawings", view: "ltp-drawings" as const } : undefined,
    },
    SHORTFALL_RAISED: {
      icon: AlertTriangle,
      cls: "border-warning/30 bg-warning/5 text-warning-foreground",
      iconCls: "bg-warning/15 text-warning-foreground",
      title: `${app.shortfalls.filter((sf) => sf.status !== "RESOLVED").length} shortfall(s) active`,
      desc: isLtp
        ? "Action required from you. Respond to the shortfalls to resume processing."
        : "Active shortfall notice issued to applicant. File review is paused pending applicant compliance.",
      action: {
        label: isLtp ? "Respond to shortfalls" : "Review shortfalls",
        view: "ltp-application-details" as const,
        tab: "shortfalls",
      },
    },
    PAYMENT_PENDING: {
      icon: AlertCircle,
      cls: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
      iconCls: "bg-amber-500/15 text-amber-600",
      title: "Payment pending",
      desc: `Outstanding amount ${formatINR(app.fee?.outstanding ?? 0)}. Complete payment to initiate the approval workflow.`,
      action: { label: "Pay now", view: "ltp-payment" as const },
    },
    DOCUMENT_UPLOAD_PENDING: {
      icon: AlertCircle,
      cls: "border-info/30 bg-info/5 text-info",
      iconCls: "bg-info/10 text-info",
      title: "Documents pending",
      desc: "Some required documents are yet to be uploaded or verified.",
      action: { label: "Upload documents", view: "ltp-documents" as const },
    },
    PAYMENT_SUCCESS: {
      icon: CheckCircle2,
      cls: "border-success/30 bg-success/5 text-success",
      iconCls: "bg-success/10 text-success",
      title: "Payment successful",
      desc: "Your payment has been verified. The application is now in the approval pipeline.",
      action: { label: "Track application", view: "ltp-application-details" as const },
    },
    APPROVED: {
      icon: CheckCircle2,
      cls: "border-success/30 bg-success/5 text-success",
      iconCls: "bg-success/10 text-success",
      title: "Application approved",
      desc: "Your application has been approved. Download the permit below.",
      action: { label: "Download permit", view: "ltp-receipt" as const },
    },
    REJECTED: {
      icon: XCircle,
      cls: "border-destructive/30 bg-destructive/5 text-destructive",
      iconCls: "bg-destructive/10 text-destructive",
      title: "Application rejected",
      desc: "Your application has been rejected. Contact the reviewing officer for details.",
      action: { label: "View remarks", view: "ltp-application-details" as const },
    },
    RETURNED: {
      icon: AlertCircle,
      cls: "border-warning/30 bg-warning/5 text-warning-foreground",
      iconCls: "bg-warning/15 text-warning-foreground",
      title: "Application returned",
      desc: "The application has been returned for correction. Please review the remarks and resubmit.",
      action: { label: "View remarks", view: "ltp-application-details" as const },
    },
  } as const;

  const c = config[app.status as keyof typeof config];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between", c.cls)}>
      <div className="flex items-start gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", c.iconCls)}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">{c.title}</p>
          <p className="text-xs opacity-90">{c.desc}</p>
        </div>
      </div>
      {(() => {
        const action = c.action;
        if (!action) return null;
        return (
          <Button
            size="sm"
            variant="outline"
            className={cn("shrink-0 border-current/30 bg-background/50 cursor-pointer", c.cls)}
            onClick={() => {
              if ("tab" in action && action.tab && onSelectTab) {
                onSelectTab(action.tab);
              } else {
                openApplication(app.id, action.view);
                toast({ title: action.label });
              }
            }}
          >
            {action.label} <ArrowRight className="size-4" />
          </Button>
        );
      })()}
    </div>
  );
}

// ---------- Overview Tab ----------
function OverviewTab({ app }: { app: Application }) {
  const { updateApplicationDetails } = useAppStore();
  const { toast } = useToast();

  const [isBulkEdit, setIsBulkEdit] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<Record<string, boolean>>({});
  const [applicantPurpose, setApplicantPurpose] = React.useState<"Self Use" | "Selling">("Self Use");
  const [applicantDraft, setApplicantDraft] = React.useState(app.applicant);
  const [ltpNameDraft, setLtpNameDraft] = React.useState(app.ltpName);
  const [projectDraft, setProjectDraft] = React.useState(app.project);
  const [priorityDraft, setPriorityDraft] = React.useState(app.priority);

  const [prevAppId, setPrevAppId] = React.useState(app.id);
  if (prevAppId !== app.id) {
    setPrevAppId(app.id);
    setApplicantDraft(app.applicant);
    setLtpNameDraft(app.ltpName);
    setProjectDraft(app.project);
    setPriorityDraft(app.priority);
  }

  const isEditing = (cardKey: string) => isBulkEdit || !!editingCard[cardKey];

  const handleSaveApplicant = () => {
    updateApplicationDetails(app.id, {
      applicant: applicantDraft,
      ltpName: ltpNameDraft,
    });
    setEditingCard((prev) => ({ ...prev, applicant: false }));
    toast({
      title: "Applicant Updated",
      description: "Applicant information saved successfully.",
    });
  };

  const handleCancelApplicant = () => {
    setApplicantDraft(app.applicant);
    setLtpNameDraft(app.ltpName);
    setEditingCard((prev) => ({ ...prev, applicant: false }));
  };

  const handleSaveProject = () => {
    updateApplicationDetails(app.id, {
      project: projectDraft,
      priority: priorityDraft,
    });
    setEditingCard((prev) => ({ ...prev, project: false }));
    toast({
      title: "Project Details Updated",
      description: "Project information and priority saved successfully.",
    });
  };

  const handleCancelProject = () => {
    setProjectDraft(app.project);
    setPriorityDraft(app.priority);
    setEditingCard((prev) => ({ ...prev, project: false }));
  };

  const handleSaveLocation = () => {
    updateApplicationDetails(app.id, {
      project: projectDraft,
    });
    setEditingCard((prev) => ({ ...prev, location: false }));
    toast({
      title: "Location Updated",
      description: "Property location details saved successfully.",
    });
  };

  const handleCancelLocation = () => {
    setProjectDraft(app.project);
    setEditingCard((prev) => ({ ...prev, location: false }));
  };

  const handleSaveAll = () => {
    updateApplicationDetails(app.id, {
      applicant: applicantDraft,
      ltpName: ltpNameDraft,
      project: projectDraft,
      priority: priorityDraft,
    });
    setIsBulkEdit(false);
    setEditingCard({});
    toast({
      title: "All Cards Updated",
      description: "All application overview cards saved successfully.",
    });
  };

  const handleCancelAll = () => {
    setApplicantDraft(app.applicant);
    setLtpNameDraft(app.ltpName);
    setProjectDraft(app.project);
    setPriorityDraft(app.priority);
    setIsBulkEdit(false);
    setEditingCard({});
    toast({
      title: "Changes Discarded",
      description: "All edits have been discarded.",
    });
  };

  const renderCardAction = (cardKey: string, onSave: () => void, onCancel: () => void) => {
    if (isBulkEdit) return null;
    if (editingCard[cardKey]) {
      return (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="h-7 px-2.5 text-xs font-semibold cursor-pointer"
          >
            <X className="size-3 mr-1" /> Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            className="h-7 px-3 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs"
          >
            <Check className="size-3 mr-1" /> Save
          </Button>
        </div>
      );
    }
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setEditingCard((prev) => ({ ...prev, [cardKey]: true }))}
        className="h-7 px-2.5 text-xs font-semibold text-[#7A1316] border-[#7A1316]/30 hover:bg-[#FAF7F2] cursor-pointer shadow-2xs"
      >
        <Pencil className="size-3 mr-1" /> Edit
      </Button>
    );
  };

  const docsVerified = app.documents.filter((d) => d.status === "VERIFIED").length;
  const docsTotal = app.documents.filter((d) => d.required).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Top Action Toolbar for Overview Cards */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#DCD5C8] bg-[#FAF7F2] px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <span className="font-bold text-[#7A1316]">Card Edit Controls:</span>
            <span>Click <strong>Edit</strong> on any card or use bulk edit for all cards.</span>
          </div>
          {isBulkEdit ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelAll}
                className="h-7 px-3 text-xs font-semibold cursor-pointer bg-white"
              >
                <X className="size-3 mr-1" /> Discard All
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveAll}
                className="h-7 px-3 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs"
              >
                <Check className="size-3 mr-1" /> Save All Cards
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsBulkEdit(true)}
              className="h-7 px-3 text-xs font-bold text-[#7A1316] border-[#7A1316]/40 hover:bg-[#F5EBE1] cursor-pointer"
            >
              <Pencil className="size-3 mr-1" /> Edit All Cards
            </Button>
          )}
        </div>

        {/* Card 1: Applicant Information */}
        <SectionCard
          title="Applicant Information"
          icon={User}
          action={renderCardAction("applicant", handleSaveApplicant, handleCancelApplicant)}
        >
          {isEditing("applicant") ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="sm:col-span-2 pb-2 border-b border-[#DCD5C8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0 text-xs">
                  <span className="text-rose-600 font-black mr-1">*</span> Application is for Self Use or Selling Purpose?
                </label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="appOverviewPurpose"
                      checked={applicantPurpose === "Self Use"}
                      onChange={() => setApplicantPurpose("Self Use")}
                      className="accent-[#7A1316] cursor-pointer"
                    />
                    <span>Self Use</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 text-xs">
                    <input
                      type="radio"
                      name="appOverviewPurpose"
                      checked={applicantPurpose === "Selling"}
                      onChange={() => setApplicantPurpose("Selling")}
                      className="accent-[#7A1316] cursor-pointer"
                    />
                    <span>Selling</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  {applicantPurpose === "Selling" ? "Firm Name" : "Applicant Name"}
                </label>
                <Input
                  value={applicantDraft.name}
                  onChange={(e) => setApplicantDraft({ ...applicantDraft, name: e.target.value })}
                  placeholder={applicantPurpose === "Selling" ? "Enter Firm Name" : "e.g. Sri K. Venkateswara Rao"}
                  className="h-8 text-xs font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Contact Number</label>
                <Input
                  value={applicantDraft.contact}
                  onChange={(e) => setApplicantDraft({ ...applicantDraft, contact: e.target.value })}
                  placeholder="e.g. +91 98480 12345"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  value={applicantDraft.email}
                  onChange={(e) => setApplicantDraft({ ...applicantDraft, email: e.target.value })}
                  placeholder="e.g. applicant@example.com"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Address</label>
                <Input
                  value={applicantDraft.address}
                  onChange={(e) => setApplicantDraft({ ...applicantDraft, address: e.target.value })}
                  placeholder="e.g. Plot 42, Sector 8, Amaravati"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Submitted on behalf of (LTP)</label>
                <Input
                  value={ltpNameDraft}
                  onChange={(e) => setLtpNameDraft(e.target.value)}
                  placeholder="e.g. Ar. Venkata Ramanujam"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">LTP License No.</label>
                <Input
                  disabled
                  value="LTP-MC-2019-0457"
                  className="h-8 text-xs font-mono bg-muted/50 cursor-not-allowed text-slate-500"
                />
              </div>
            </div>
          ) : (
            <InfoGrid
              items={[
                { label: applicantPurpose === "Selling" ? "Firm Name" : "Applicant Name", value: app.applicant.name },
                { label: "Purpose", value: applicantPurpose },
                { label: "Contact", value: app.applicant.contact, mono: true },
                { label: "Email", value: app.applicant.email },
                { label: "Address", value: app.applicant.address },
                { label: "Submitted on behalf of", value: app.ltpName },
                { label: "LTP License No.", value: "LTP-MC-2019-0457", mono: true },
              ]}
              columns={2}
            />
          )}
        </SectionCard>

        {/* Card 2: Project Information */}
        <SectionCard
          title="Project Information"
          icon={Building2}
          action={renderCardAction("project", handleSaveProject, handleCancelProject)}
        >
          {isEditing("project") ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Project Name</label>
                <Input
                  value={projectDraft.name}
                  onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
                  placeholder="Project name"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Application Type</label>
                <select
                  value={projectDraft.type}
                  onChange={(e) => setProjectDraft({ ...projectDraft, type: e.target.value as any })}
                  className="h-8 w-full rounded-md border border-[#DCD5C8] bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1316]"
                >
                  <option value="NEW_CONSTRUCTION">New Construction</option>
                  <option value="ALTERATION">Alteration</option>
                  <option value="ADDITION">Addition</option>
                  <option value="REGULARISATION">Regularisation</option>
                  <option value="DEMOLITION">Demolition</option>
                  <option value="OCCUPANCY_CERTIFICATE">Occupancy Certificate</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Property Type</label>
                <select
                  value={projectDraft.propertyType}
                  onChange={(e) => setProjectDraft({ ...projectDraft, propertyType: e.target.value as any })}
                  className="h-8 w-full rounded-md border border-[#DCD5C8] bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1316]"
                >
                  <option value="RESIDENTIAL_INDIVIDUAL">Residential Individual</option>
                  <option value="RESIDENTIAL_APARTMENT">Residential Apartment</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="INSTITUTIONAL">Institutional</option>
                  <option value="MIXED_USE">Mixed Use</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Land Use</label>
                <Input
                  value={projectDraft.landUse}
                  onChange={(e) => setProjectDraft({ ...projectDraft, landUse: e.target.value })}
                  placeholder="e.g. Residential R-3"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Plot Area (sq.m)</label>
                <Input
                  type="number"
                  value={projectDraft.plotArea}
                  onChange={(e) => setProjectDraft({ ...projectDraft, plotArea: Number(e.target.value) || 0 })}
                  placeholder="sq.m"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Built-up Area (sq.m)</label>
                <Input
                  type="number"
                  value={projectDraft.builtUpArea}
                  onChange={(e) => setProjectDraft({ ...projectDraft, builtUpArea: Number(e.target.value) || 0 })}
                  placeholder="sq.m"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">FAR Utilisation (Live)</label>
                <div className="h-8 rounded-md bg-muted/40 border border-border px-3 flex items-center text-xs font-mono font-medium text-slate-800">
                  {projectDraft.plotArea > 0 ? (projectDraft.builtUpArea / projectDraft.plotArea).toFixed(2) : "0.00"} (permissible 1.50)
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Priority</label>
                <select
                  value={priorityDraft}
                  onChange={(e) => setPriorityDraft(e.target.value as any)}
                  className="h-8 w-full rounded-md border border-[#DCD5C8] bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1316]"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          ) : (
            <InfoGrid
              items={[
                { label: "Project Name", value: app.project.name },
                { label: "Application Type", value: app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) },
                { label: "Property Type", value: app.project.propertyType.replace("_", " ").toLowerCase() },
                { label: "Land Use", value: app.project.landUse },
                { label: "Plot Area", value: `${app.project.plotArea.toLocaleString("en-IN")} sq.m` },
                { label: "Built-up Area", value: `${app.project.builtUpArea.toLocaleString("en-IN")} sq.m` },
                { label: "FAR Utilisation", value: `${(app.project.builtUpArea / app.project.plotArea).toFixed(2)} (permissible 1.50)` },
                { label: "Priority", value: <PriorityBadge priority={app.priority} /> },
              ]}
              columns={2}
            />
          )}
        </SectionCard>

        {/* Card 3: Property Location */}
        <SectionCard
          title="Property Location"
          icon={MapPin}
          action={renderCardAction("location", handleSaveLocation, handleCancelLocation)}
        >
          {isEditing("location") ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Ward</label>
                <Input
                  value={projectDraft.ward}
                  onChange={(e) => setProjectDraft({ ...projectDraft, ward: e.target.value })}
                  placeholder="e.g. Ward 12"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Zone</label>
                <Input
                  value={projectDraft.zone}
                  onChange={(e) => setProjectDraft({ ...projectDraft, zone: e.target.value })}
                  placeholder="e.g. Zone 4 (North)"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Survey No.</label>
                <Input
                  value={projectDraft.surveyNo}
                  onChange={(e) => setProjectDraft({ ...projectDraft, surveyNo: e.target.value })}
                  placeholder="e.g. Sy. No. 142/2B"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Site Address</label>
                <Input
                  value={projectDraft.address}
                  onChange={(e) => setProjectDraft({ ...projectDraft, address: e.target.value })}
                  placeholder="Full site address"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ) : (
            <InfoGrid
              items={[
                { label: "Ward", value: app.project.ward },
                { label: "Zone", value: app.project.zone },
                { label: "Survey No.", value: app.project.surveyNo, mono: true },
                { label: "Site Address", value: app.project.address },
              ]}
              columns={2}
            />
          )}
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Application Summary" icon={FileText}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Application No.</span>
              <span className="font-mono text-xs font-medium">{app.applicationNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <StatusBadge status={app.status} showIcon={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Current Stage</span>
              <span className="text-xs font-bold text-slate-800">{app.currentStageLabel}</span>
            </div>
            <Separator className="bg-[#DCD5C8]" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Progress</span>
                <span className="font-bold text-[#7A1316] tabular-nums">{app.progress}%</span>
              </div>
              <Progress value={app.progress} className="h-2 bg-[#EADBCE] [&>div]:bg-[#7A1316]" />
            </div>
            <Separator className="bg-[#DCD5C8]" />
            <InfoRow label="Submission Date" value={formatDate(app.submissionDate)} />
            <InfoRow label="Last Updated" value={timeAgo(app.lastUpdated)} />
            <InfoRow label="Expected SLA" value={formatDate(app.expectedSLA ?? "")} />
          </div>
        </SectionCard>

        <SectionCard title="Quick Stats" icon={Info}>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Drawings" value={`${app.drawings.length}`} sub={`${app.drawings[0]?.version ?? 0} versions`} />
            <Stat label="Documents" value={`${docsVerified}/${docsTotal}`} sub="verified" />
            <Stat label="Shortfalls" value={`${app.shortfalls.length}`} sub={app.shortfalls.length ? "open" : "none"} />
            <Stat label="Fee Paid" value={app.payment?.status === "SUCCESS" ? "Yes" : "No"} sub={app.payment ? formatINR(app.payment.amount) : "—"} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[#DCD5C8] bg-[#FAF7F2] p-3 shadow-2xs">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A1316]">{label}</p>
      <p className="text-lg font-bold text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 font-medium">{sub}</p>}
    </div>
  );
}

// ---------- Workflow Tab ----------
function WorkflowTab({ app }: { app: Application }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard title="Workflow Timeline" description="Chronological record of all stage transitions" icon={Workflow}>
          <WorkflowTimeline entries={app.workflowHistory} variant="maroon" />
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Stage Status" icon={Flag}>
          <ul className="space-y-2">
            {app.workflowHistory.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 p-1 border-b border-[#EADBCE]/50 last:border-0">
                <span className="text-xs font-semibold text-slate-800">{e.stageLabel}</span>
                <StageStatusPill status={e.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Assigned Officers" icon={ShieldCheck}>
          <ul className="space-y-3">
            {Array.from(new Set(app.workflowHistory.filter((w) => w.timestamp).map((w) => w.actor.name))).map((name) => {
              const entry = app.workflowHistory.find((w) => w.actor.name === name)!;
              return (
                <li key={name} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#FAF7F2] border border-[#EADBCE]">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#7A1316]/10 text-[#7A1316] text-[11px] font-bold">
                    {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{ROLES[entry.actor.role].fullName}</p>
                  </div>
                  <RoleBadge role={entry.actor.role} />
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

// ---------- Drawings & Scrutiny Tab ----------
function DrawingsTab({ app, isLtp }: { app: Application; isLtp?: boolean }) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={cn("space-y-6", isLtp ? "lg:col-span-2" : "lg:col-span-2")}>
          <SectionCard title="Drawing Viewer" description="View, zoom, rotate and switch versions" icon={Eye}>
            {app.drawings.length > 0 ? (
              <DrawingViewer drawings={app.drawings} />
            ) : (
              <EmptyState icon={Upload} title="No drawings uploaded" description={isLtp ? "Upload your first drawing to begin scrutiny." : "No drawings have been uploaded by the LTP applicant yet."} />
            )}
          </SectionCard>

          {app.scrutinyReport && (
            <SectionCard
              title="Scrutiny Report"
              description={`${app.scrutinyReport.reportNo} · v${app.scrutinyReport.drawingVersion}`}
              icon={ScrollText}
              action={app.scrutinyReport.status === "PASSED" ? <Badge className="bg-emerald-600 text-white font-bold">Passed</Badge> : <Badge className="bg-rose-700 text-white font-bold">Failed</Badge>}
            >
              <div className="space-y-4">
                <div className={cn("rounded-lg border p-3.5 text-sm", app.scrutinyReport.status === "PASSED" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800")}>
                  <p className="font-semibold">{app.scrutinyReport.summary}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ScrutinyStat label="Total Checks" value={app.scrutinyReport.totalChecks} cls="border-[#DCD5C8] bg-[#FAF7F2]" />
                  <ScrutinyStat label="Passed" value={app.scrutinyReport.passed} cls="border-emerald-200 bg-emerald-50 text-emerald-800" />
                  <ScrutinyStat label="Failed / Warnings" value={`${app.scrutinyReport.failed} / ${app.scrutinyReport.warnings}`} cls="border-amber-200 bg-amber-50 text-amber-900" />
                </div>
                <div className="overflow-hidden rounded-xl border border-[#DCD5C8]">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F5EBE1] text-[#7A1316]">
                      <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-[#7A1316]">
                        <th className="w-1/2 px-3.5 py-2.5 font-bold">Rule</th>
                        <th className="w-1/6 px-3.5 py-2.5 font-bold">Category</th>
                        <th className="w-1/6 px-3.5 py-2.5 font-bold">Severity</th>
                        <th className="w-1/6 px-3.5 py-2.5 font-bold">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADBCE] bg-white">
                      {app.scrutinyReport.checks.map((c) => (
                        <tr key={c.id} className="hover:bg-[#FAF4EB] transition-colors">
                          <td className="px-3.5 py-2.5">
                            <p className="text-xs font-semibold text-slate-900">{c.rule}</p>
                            <p className="text-[10px] text-slate-500">{c.message}</p>
                          </td>
                          <td className="px-3.5 py-2.5 text-xs text-slate-600 font-medium">{c.category}</td>
                          <td className="px-3.5 py-2.5"><SeverityBadge severity={c.severity} /></td>
                          <td className="px-3.5 py-2.5">
                            {c.status === "PASS" && <Badge className="bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">Pass</Badge>}
                            {c.status === "FAIL" && <Badge className="bg-rose-100 text-rose-800 font-bold border border-rose-300">Fail</Badge>}
                            {c.status === "WARNING" && <Badge className="bg-amber-100 text-amber-800 font-bold border border-amber-300">Warning</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          {isLtp && (
            <SectionCard title="Upload New Drawing" description="Re-upload corrected drawings after a failed scrutiny" icon={Upload}>
              <FileUploader
                variant="maroon"
                label="Drop drawing here"
                hint="DWG, DXF or PDF · max 50 MB"
                accept=".dwg,.dxf,.pdf"
                uploadedFiles={files}
                onUpload={(newFiles) => {
                  setFiles((prev) => {
                    const map = new Map(prev.map((f) => [f.id, f]));
                    newFiles.forEach((f) => map.set(f.id, f));
                    return Array.from(map.values());
                  });
                }}
                onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
              />
            </SectionCard>
          )}

          <SectionCard title="Version History" icon={History} noPadding>
            <ul className="divide-y divide-[#EADBCE]">
              {app.drawings.map((d) => (
                <li key={d.id} className="p-3.5 hover:bg-[#FAF4EB] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#7A1316]/10 text-[#7A1316]">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{d.fileName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{d.fileSize} · v{d.version} · {formatDateTime(d.uploadedAt)}</p>
                    </div>
                    {d.status === "SCRUTINY_PASSED" && <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">Passed</Badge>}
                    {d.status === "SCRUTINY_FAILED" && <Badge className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">Failed</Badge>}
                    {d.status === "SUPERSEDED" && <Badge className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-medium">Superseded</Badge>}
                    {d.status === "PENDING_SCRUTINY" && <Badge className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-medium">Pending</Badge>}
                  </div>
                  {d.notes && <p className="mt-1.5 text-[10px] text-slate-500 italic pl-10.5">{d.notes}</p>}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ScrutinyStat({ label, value, cls }: { label: string; value: string | number; cls: string }) {
  return (
    <div className={cn("rounded-lg border border-[#DCD5C8] bg-[#FAF7F2] p-3 text-center shadow-2xs", cls)}>
      <p className="text-xl font-black tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A1316] mt-0.5">{label}</p>
    </div>
  );
}

// ---------- Documents Tab ----------
function DocumentsTab({ app }: { app: Application }) {
  const verified = app.documents.filter((d) => d.status === "VERIFIED").length;
  const required = app.documents.filter((d) => d.required).length;
  const pct = Math.round((verified / required) * 100);
  return (
    <div className="space-y-6">
      <SectionCard title="Document Compliance" icon={FolderClosed}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">{verified} of {required} required documents verified</p>
            <p className="text-xs text-slate-500">{app.documents.filter((d) => d.status === "SHORTFALL").length} shortfalls · {app.documents.filter((d) => d.status === "REQUIRED").length} pending upload</p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-2.5 w-36 bg-[#EADBCE] [&>div]:bg-[#7A1316]" />
            <span className="text-sm font-bold text-[#7A1316] tabular-nums">{pct}%</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Required Documents" description="Upload, preview and track verification status" icon={FileText} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8]">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-[#7A1316]">
                <th className="w-[32%] px-4 py-2.5 font-bold">Document</th>
                <th className="w-[10%] px-4 py-2.5 font-bold text-center">Required</th>
                <th className="w-[14%] px-4 py-2.5 font-bold text-center">Status</th>
                <th className="w-[8%] px-4 py-2.5 font-bold text-center">Version</th>
                <th className="w-[14%] px-4 py-2.5 font-bold">Verified By</th>
                <th className="w-[11%] px-4 py-2.5 font-bold text-center">Date</th>
                <th className="w-[11%] px-4 py-2.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] bg-white">
              {app.documents.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAF4EB] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-900">{d.name}</p>
                    <p className="font-mono text-[10px] text-slate-500">{d.code}</p>
                    {d.remarks && <p className="mt-0.5 text-[10px] text-rose-700 font-medium">{d.remarks}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {d.required ? <Badge className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-bold">Required</Badge> : <Badge variant="outline" className="text-[9px] border-[#DCD5C8]">Optional</Badge>}
                  </td>
                  <td className="px-4 py-3"><DocumentStatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">{d.version ? `v${d.version}` : "—"}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">{d.verifiedBy ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{d.verifiedAt ? formatDate(d.verifiedAt) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {d.status === "REQUIRED" || d.status === "SHORTFALL" ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs border border-[#DCD5C8] text-[#7A1316] hover:bg-[#F3EADF] font-bold"><Upload className="size-3 mr-1" /> Upload</Button>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="size-7 text-[#7A1316] hover:bg-[#F3EADF]"><Eye className="size-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="size-7 text-[#7A1316] hover:bg-[#F3EADF]"><Download className="size-3.5" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ---------- Fees Tab ----------
function FeesTab({ app }: { app: Application }) {
  const { openApplication } = useAppStore();
  const [showReceiptModal, setShowReceiptModal] = React.useState(false);

  if (!app.fee) {
    return <EmptyState icon={ReceiptIndianRupee} title="Fees not generated" description="Fees will be generated automatically once documents are verified." />;
  }
  const f = app.fee;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard title="Fee Breakdown" description={`${f.feeStructureName} · generated ${formatDate(f.generatedAt)}`} icon={ReceiptIndianRupee}>
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-2 text-xs font-bold uppercase tracking-wide text-[#7A1316]">
              <span>Component</span>
              <span>Amount (₹)</span>
            </div>
            {f.lineItems.map((li) => (
              <div key={li.componentCode} className="flex items-center justify-between py-2.5 border-b border-dashed border-[#EADBCE] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{li.name}</p>
                  <p className="text-[11px] text-slate-500">{li.description}</p>
                  <p className="text-[10px] text-slate-400">{li.basis} · ₹{li.rate.toLocaleString("en-IN")} × {li.quantity.toLocaleString("en-IN")}</p>
                </div>
                <span className="font-mono text-sm font-bold text-slate-800 tabular-nums">{li.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-mono font-bold tabular-nums text-slate-800">{formatINR(f.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">GST</span>
              <span className="font-mono font-bold tabular-nums text-slate-800">{formatINR(f.gst)}</span>
            </div>
            <Separator className="my-2 bg-[#DCD5C8]" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Total Payable</span>
              <span className="font-mono text-xl font-black text-[#7A1316]">{formatINR(f.total)}</span>
            </div>
          </div>
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Payment Status" icon={CheckCircle2}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Total Fee</span>
              <span className="font-mono text-sm font-bold text-slate-800">{formatINR(f.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Paid</span>
              <span className="font-mono text-sm font-bold text-emerald-700">{formatINR(f.paidAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Outstanding</span>
              <span className="font-mono text-sm font-bold text-rose-700">{formatINR(f.outstanding)}</span>
            </div>
            <Separator className="bg-[#DCD5C8]" />
            {app.payment ? (
              <div className="space-y-2 rounded-lg border border-[#DCD5C8] bg-[#FAF7F2] p-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Transaction</span>
                  <PaymentStatusBadge status={app.payment.status} />
                </div>
                <p className="font-mono text-[11px] font-bold text-[#7A1316]">{app.payment.transactionId || "—"}</p>
                <p className="text-[10px] text-slate-500 font-medium">{app.payment.gateway} · {app.payment.method}</p>
                {app.payment.receiptNo && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full cursor-pointer bg-white border border-[#7A1316] text-[#7A1316] hover:bg-[#F3EADF] font-bold shadow-2xs mt-2"
                      onClick={() => setShowReceiptModal(true)}
                    >
                      <Download className="size-3.5 mr-1.5" /> Official Receipt {app.payment.receiptNo}
                    </Button>
                    <ApcrdaPaymentReceiptModal
                      isOpen={showReceiptModal}
                      onClose={() => setShowReceiptModal(false)}
                      data={buildReceiptFromApplication(app)}
                    />
                  </>
                )}
              </div>
            ) : (
              <Button
                className="w-full cursor-pointer bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold shadow-2xs"
                onClick={() => openApplication(app.id, "ltp-payment")}
              >
                <ReceiptIndianRupee className="size-4 mr-1.5" /> Pay Now
              </Button>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ---------- Apply for NOCs Tab ----------
function NocsTab({ app }: { app: Application }) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Single Desk Statutory Clearances & NOCs"
        description="Official inter-departmental clearances for building permission sanction"
        icon={Flame}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl border border-[#DCD5C8] bg-[#FAF7F2] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A1316]">Fire Service NOC</span>
              <Badge className="bg-emerald-500/10 text-emerald-800 text-[10px] font-bold border border-emerald-300">Approved</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">AP State Disaster Response &amp; Fire Services (Rule 18)</p>
            <p className="font-mono text-xs font-bold text-[#7A1316]">AP/FIRE/NOC/2026/0412</p>
          </div>

          <div className="p-4 rounded-xl border border-[#DCD5C8] bg-[#FAF7F2] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A1316]">Airport Clearance (AAI)</span>
              <Badge variant="outline" className="text-[10px] font-bold border-[#DCD5C8] bg-white">Exempted</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Height &lt; 30m CCZM Obstacle Envelope</p>
            <p className="font-mono text-xs font-bold text-slate-500">Within CCZM Zone</p>
          </div>

          <div className="p-4 rounded-xl border border-[#DCD5C8] bg-[#FAF7F2] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A1316]">Environmental (PCB/SEIAA)</span>
              <Badge variant="outline" className="text-[10px] font-bold border-[#DCD5C8] bg-white">Category B2</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Plot area &lt; 20,000 sq.m (Exempted)</p>
            <p className="font-mono text-xs font-bold text-slate-500">SEIAA-AP-B2-EXEMPT</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#DCD5C8] p-4 bg-[#FBF3E4] space-y-2 shadow-2xs">
          <h4 className="text-xs font-bold text-[#7A1316]">Water Bodies &amp; Irrigation Canals Buffer Clearance</h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            The site boundaries have been checked against the APCRDA Master Plan GIS spatial layers. The parcel is certified to be located beyond 30m buffer from the Krishna river bank and irrigation channels.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">Canal buffer verification passed automatically by GIS Engine</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ---------- APCRDA Common Shortfall Templates ----------
const APCRDA_SHORTFALL_TEMPLATES = [
  {
    label: "Custom Deficiency / Query",
    type: "DOCUMENT" as ShortfallType,
    title: "",
    desc: "",
  },
  {
    label: "Structural Stability Certificate — Missing SE Stamp",
    type: "DOCUMENT" as ShortfallType,
    title: "Structural stability certificate missing Registered Structural Engineer stamp & signature",
    desc: "The structural drawings and stability declaration submitted lack the valid seal, registration number, and digital signature of an APCRDA-empaneled Structural Engineer. Please furnish an attested structural certificate.",
  },
  {
    label: "Rear Setback Non-Compliance (Table 8 DCR)",
    type: "TECHNICAL" as ShortfallType,
    title: "Rear setback provided (2.1m) is less than statutory requirement (3.0m) as per DCR Table 8",
    desc: "Drawing scrutiny reveals that the rear open setback provided in the layout plan is 2.1 meters, which is below the mandatory minimum of 3.0 meters for the given plot depth and building height. Please revise drawings adhering to APCRDA Byelaws.",
  },
  {
    label: "Plot Dimension Discrepancy with Registered Deed",
    type: "DOCUMENT" as ShortfallType,
    title: "Plot boundary & dimensions differ from Registered Sale Deed schedule",
    desc: "The boundary dimensions shown in the submitted site layout (North: 18.5m, South: 18.2m) do not tally with the schedule of property in Registered Deed No. 4281/2021. Provide an authenticated surveyor sketch and rectification deed.",
  },
  {
    label: "Fire NOC Endorsement for Height > 15m",
    type: "TECHNICAL" as ShortfallType,
    title: "Provisional Fire NOC endorsement required for building height exceeding 15 meters",
    desc: "As the proposed total building height exceeds 15.0 meters, a Provisional No Objection Certificate from the State Disaster Response and Fire Services Department is mandatory before technical sanction.",
  },
  {
    label: "Rainwater Harvesting & Percolation Pit Missing",
    type: "TECHNICAL" as ShortfallType,
    title: "Rainwater harvesting & percolation pit details missing from site services drawing",
    desc: "Rainwater harvesting and recharge pit specifications as mandated under APCRDA Green Building Norms are absent in the site services plan. Incorporate detailed design and cross-section.",
  },
  {
    label: "Statutory Betterment / Development Charges Shortfall",
    type: "FEE" as ShortfallType,
    title: "Shortfall in statutory development charges / Betterment fee calculation",
    desc: "A calculation variance has been noticed in the external infrastructure betterment levy. An outstanding balance of Rs. 45,000 must be remitted towards revised scrutiny fees.",
  },
  {
    label: "General Clarification — Ambiguous Ventilation Shaft",
    type: "GENERAL" as ShortfallType,
    title: "Clarification required on habitable room light and ventilation shaft",
    desc: "The internal ventilation shaft dimensions on the second floor fail to satisfy the minimum 1.2m x 1.5m air shaft requirement under Byelaw 14.2. Submit a detailed cross-section clarification.",
  },
];

// ---------- Modal 1: Raise Shortfall Dialog (For All Officers & Admins) ----------
function RaiseShortfallDialog({
  open,
  onOpenChange,
  app,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application;
}) {
  const { toast } = useToast();
  const { raiseShortfall } = useAppStore();

  const [templateIdx, setTemplateIdx] = React.useState<string>("0");
  const [type, setType] = React.useState<ShortfallType>("DOCUMENT");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSelectTemplate = (val: string) => {
    setTemplateIdx(val);
    const idx = parseInt(val, 10);
    if (idx > 0 && APCRDA_SHORTFALL_TEMPLATES[idx]) {
      const tmpl = APCRDA_SHORTFALL_TEMPLATES[idx];
      setType(tmpl.type);
      setTitle(tmpl.title);
      setDescription(tmpl.desc);
    }
  };

  const handleReset = () => {
    setTemplateIdx("0");
    setType("DOCUMENT");
    setTitle("");
    setDescription("");
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 10));
    setFiles([]);
    setIsSubmitting(false);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Required information missing",
        description: "Please specify both the shortfall title and detailed description.",
      });
      return;
    }

    setIsSubmitting(true);
    const dueIso = dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

    raiseShortfall(app.id, {
      type,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueIso,
    });

    setIsSubmitting(false);
    toast({
      title: "Shortfall Notice Raised",
      description: `Shortfall on ${app.applicationNo} (${type}) has been issued. Applicant notified via SMS and portal notice.`,
    });
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto bg-[#FAF7F2] border-[#DCD5C8] p-0 font-sans">
        <DialogHeader className="bg-[#F5EBE1] border-b border-[#DCD5C8] p-4 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[#7A1316] text-white">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-[#7A1316]">
                Raise Shortfall Notice
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Application: <span className="font-mono font-bold text-slate-900">{app.applicationNo}</span> · {app.applicant.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Notice info banner */}
          <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-amber-700" />
              <span>Statutory Shortfall Procedure (APCRDA Building Byelaws)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Raising a shortfall places the application on hold and stops the SLA countdown clock until the applicant submits compliant rectification.
            </p>
          </div>

          {/* Quick template picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="size-3 text-[#7A1316]" /> Common APCRDA Deficiency Templates
            </Label>
            <Select value={templateIdx} onValueChange={handleSelectTemplate}>
              <SelectTrigger className="h-8.5 text-xs bg-white border-[#DCD5C8]">
                <SelectValue placeholder="Select a preset deficiency..." />
              </SelectTrigger>
              <SelectContent>
                {APCRDA_SHORTFALL_TEMPLATES.map((tmpl, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {tmpl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shortfall Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Shortfall Category <span className="text-rose-600">*</span>
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as ShortfallType)}>
                <SelectTrigger className="h-8.5 text-xs bg-white border-[#DCD5C8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">Document — Missing / Invalid / Expired</SelectItem>
                  <SelectItem value="TECHNICAL">Technical — Scrutiny / Drawing Violation</SelectItem>
                  <SelectItem value="FEE">Fee — Payment Discrepancy / Shortfall</SelectItem>
                  <SelectItem value="GENERAL">General — Statutory Query / Clarification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sf-due-date" className="text-xs font-bold text-slate-800">
                Compliance Due Date <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="sf-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8.5 text-xs bg-white border-[#DCD5C8]"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sf-title-input" className="text-xs font-bold text-slate-800">
              Shortfall Subject / Deficiency Summary <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="sf-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Structural stability certificate missing SE stamp"
              className="h-8.5 text-xs bg-white border-[#DCD5C8] font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="sf-desc-input" className="text-xs font-bold text-slate-800">
              Detailed Observation & Required Action <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="sf-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the discrepancy in detail, citing specific building byelaws or missing documents, and specify what the applicant must upload to rectify it..."
              rows={4}
              className="text-xs bg-white border-[#DCD5C8] leading-relaxed resize-y"
            />
          </div>

          {/* Supporting Document / Markup file (optional) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-800">
              Attach Scrutiny Markup / Inspection Notice (Optional)
            </Label>
            <FileUploader
              label="Drop scrutiny markup or notice PDF here"
              hint="PDF, JPG, PNG · max 25 MB"
              accept=".pdf,.jpg,.png"
              uploadedFiles={files}
              onUpload={(newFiles) => {
                setFiles((prev) => {
                  const map = new Map(prev.map((f) => [f.id, f]));
                  newFiles.forEach((f) => map.set(f.id, f));
                  return Array.from(map.values());
                });
              }}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
          </div>
        </div>

        <DialogFooter className="bg-[#F5EBE1] border-t border-[#DCD5C8] p-3.5 sm:px-5 flex items-center justify-between sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold border-[#DCD5C8] bg-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="h-8 px-4 text-xs font-bold bg-[#7A1316] hover:bg-[#8F161A] text-white cursor-pointer shadow-xs gap-1.5"
          >
            <AlertTriangle className="size-3.5" />
            <span>Issue Shortfall Notice</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Modal 2: Respond to Shortfall Dialog (Strictly for LTP) ----------
function RespondShortfallDialog({
  open,
  onOpenChange,
  app,
  shortfall,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application;
  shortfall: Shortfall | null;
}) {
  const { toast } = useToast();
  const { respondToShortfall } = useAppStore();

  const [responseText, setResponseText] = React.useState("");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleReset = () => {
    setResponseText("");
    setFiles([]);
    setIsSubmitting(false);
  };

  const handleSubmit = () => {
    if (!shortfall) return;
    if (!responseText.trim()) {
      toast({
        title: "Response statement required",
        description: "Please explain the rectification details before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    const supportingDocName = files[0]?.name || "Rectified_Compliance_Docs.pdf";

    respondToShortfall(app.id, shortfall.id, responseText.trim(), supportingDocName);

    setIsSubmitting(false);
    toast({
      title: "Shortfall Response Submitted",
      description: `Your response for ${shortfall.shortfallNumber || shortfall.shortfallId} has been submitted for scrutiny review.`,
    });
    handleReset();
    onOpenChange(false);
  };

  if (!shortfall) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto bg-[#FAF7F2] border-[#DCD5C8] p-0 font-sans">
        <DialogHeader className="bg-[#F5EBE1] border-b border-[#DCD5C8] p-4 text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#7A1316] bg-white px-2 py-0.5 rounded border border-[#DCD5C8]">
              {shortfall.shortfallNumber || shortfall.shortfallId}
            </span>
            <span className="font-mono text-xs text-slate-600">{shortfall.shortfallId}</span>
          </div>
          <DialogTitle className="text-base font-bold text-slate-900 mt-1">
            Respond to Shortfall
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            {shortfall.title} · Application: <span className="font-mono font-bold text-[#7A1316]">{app.applicationNo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Officer Observation Box */}
          <div className="rounded-lg border border-[#EADBCE] bg-white p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Officer Observation &amp; Directive</span>
              <span className="text-[10px] text-rose-700 font-bold">Due: {formatDate(shortfall.dueDate)}</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">{shortfall.description}</p>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Raised By: <strong>{shortfall.raisedBy.name}</strong> ({shortfall.raisedBy.role})</span>
              <span>Category: <strong>{shortfall.type}</strong></span>
            </div>
          </div>

          {/* Response Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="sf-resp-text" className="text-xs font-bold text-slate-800">
              Compliance Statement &amp; Rectification Details <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="sf-resp-text"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="State clearly how the discrepancy has been addressed, e.g. 'Uploaded revised structural stability declaration signed by SE Venkata Ramanujam (Reg No: SE/AP/4421)...'"
              rows={4}
              className="text-xs bg-white border-[#DCD5C8] leading-relaxed resize-y"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-800">
              Upload Rectified Document / Revised Drawing
            </Label>
            <FileUploader
              label="Drop rectified PDF or DWG drawing here"
              hint="PDF, DWG, JPG, PNG · max 50 MB"
              accept=".pdf,.dwg,.jpg,.png"
              uploadedFiles={files}
              onUpload={(newFiles) => {
                setFiles((prev) => {
                  const map = new Map(prev.map((f) => [f.id, f]));
                  newFiles.forEach((f) => map.set(f.id, f));
                  return Array.from(map.values());
                });
              }}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
          </div>
        </div>

        <DialogFooter className="bg-[#F5EBE1] border-t border-[#DCD5C8] p-3.5 sm:px-5 flex items-center justify-between sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold border-[#DCD5C8] bg-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !responseText.trim()}
            className="h-8 px-4 text-xs font-bold bg-[#7A1316] hover:bg-[#8F161A] text-white cursor-pointer shadow-xs gap-1.5"
          >
            <Send className="size-3.5" />
            <span>Submit Compliance Response</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Modal 3: Verify & Resolve Shortfall Dialog (For Reviewing Officers) ----------
function ResolveShortfallDialog({
  open,
  onOpenChange,
  app,
  shortfall,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: Application;
  shortfall: Shortfall | null;
}) {
  const { toast } = useToast();
  const { resolveShortfall } = useAppStore();

  const [resolutionRemarks, setResolutionRemarks] = React.useState(
    "Verified the rectified documents and drawings submitted by applicant. Discrepancy satisfactorily resolved in accordance with APCRDA Byelaws."
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = () => {
    if (!shortfall) return;
    if (!resolutionRemarks.trim()) {
      toast({
        title: "Resolution remarks required",
        description: "Please provide verification remarks before resolving this shortfall.",
      });
      return;
    }

    setIsSubmitting(true);
    resolveShortfall(app.id, shortfall.id, resolutionRemarks.trim());
    setIsSubmitting(false);

    toast({
      title: "Shortfall Verified & Resolved",
      description: `Shortfall ${shortfall.shortfallNumber || shortfall.shortfallId} has been resolved. Application review workflow resumed.`,
    });
    onOpenChange(false);
  };

  if (!shortfall) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-[#FAF7F2] border-[#DCD5C8] p-0 font-sans">
        <DialogHeader className="bg-[#F5EBE1] border-b border-[#DCD5C8] p-4 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-emerald-700 text-white">
              <CheckCircle2 className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Verify &amp; Resolve Shortfall
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                {shortfall.title} · Application: <span className="font-mono font-bold text-[#7A1316]">{app.applicationNo}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Notice & Response Box */}
          <div className="rounded-lg border border-[#EADBCE] bg-white p-3 space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Deficiency Notice</span>
              <p className="text-xs text-slate-800 mt-0.5">{shortfall.description}</p>
            </div>
            {shortfall.response ? (
              <div className="pt-2 border-t border-slate-100 bg-blue-50/50 p-2.5 rounded border border-blue-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-900 mb-1">
                  <span>Applicant Rectification Statement</span>
                  <span className="font-mono text-slate-500">{formatDateTime(shortfall.response.respondedAt)}</span>
                </div>
                <p className="text-xs text-slate-800">{shortfall.response.text}</p>
                {shortfall.response.supportingDocument && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-blue-200 text-[10px] font-mono text-blue-800">
                    <FileText className="size-3" />
                    <span>{shortfall.response.supportingDocument}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                Note: No formal response recorded yet. You may proceed to resolve if verified via field inspection or external verification.
              </div>
            )}
          </div>

          {/* Resolution Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="sf-resolve-remarks" className="text-xs font-bold text-slate-800">
              Officer Verification &amp; Resolution Order <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="sf-resolve-remarks"
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              placeholder="Record your verification findings and clearance remarks..."
              rows={3}
              className="text-xs bg-white border-[#DCD5C8] leading-relaxed resize-y"
            />
          </div>
        </div>

        <DialogFooter className="bg-[#F5EBE1] border-t border-[#DCD5C8] p-3.5 sm:px-5 flex items-center justify-between sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold border-[#DCD5C8] bg-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !resolutionRemarks.trim()}
            className="h-8 px-4 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Mark Shortfall Resolved</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Shortfalls Tab ----------
function ShortfallsTab({
  app,
  onOpenRaise,
  onOpenRespond,
  onOpenResolve,
}: {
  app: Application;
  onOpenRaise: () => void;
  onOpenRespond: (s: Shortfall) => void;
  onOpenResolve: (s: Shortfall) => void;
}) {
  const { user } = useAppStore();
  const isLtp = user?.role === "LTP";

  if (app.shortfalls.length === 0) {
    if (isLtp) {
      return (
        <EmptyState
          icon={CheckCircle2}
          title="No Active Shortfalls"
          description="There are no active shortfalls or deficiencies on this application. All statutory requirements are compliant."
        />
      );
    }
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No Shortfalls Raised Yet"
        description="No shortfalls or document queries have been raised on this application. If you have identified discrepancies in the scrutiny drawings, documents, or fee schedule, you can raise a shortfall to notify the applicant."
        action={
          <Button
            onClick={onOpenRaise}
            className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold cursor-pointer shadow-xs gap-1.5"
          >
            <AlertTriangle className="size-4" /> Raise Shortfall
          </Button>
        }
      />
    );
  }

  const activeCount = app.shortfalls.filter((s) => s.status !== "RESOLVED").length;
  const resolvedCount = app.shortfalls.filter((s) => s.status === "RESOLVED").length;

  return (
    <div className="space-y-4">
      {/* Shortfalls Header Banner with Action for Non-LTP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#DCD5C8] bg-white shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Deficiency &amp; Shortfall Records</h4>
            <p className="text-[11px] text-slate-500">
              Total Notices: <strong>{app.shortfalls.length}</strong> · Open: <strong className="text-amber-700">{activeCount}</strong> · Resolved: <strong className="text-emerald-700">{resolvedCount}</strong>
            </p>
          </div>
        </div>

        {!isLtp && (
          <Button
            size="sm"
            onClick={onOpenRaise}
            className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs h-8 px-3.5 gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Raise Shortfall</span>
          </Button>
        )}
      </div>

      {app.shortfalls.map((s) => {
        const isResolved = s.status === "RESOLVED" || s.status === "CLOSED";
        const hasResponded = s.status === "RESPONDED" || s.status === "UNDER_REVIEW" || s.status === "RESPONSE_SUBMITTED" || !!s.response;

        return (
          <SectionCard
            key={s.id}
            title={s.title}
            icon={AlertTriangle}
            action={
              <div className="flex items-center gap-1.5">
                <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono text-[10px]">
                  {s.shortfallNumber || s.shortfallId}
                </Badge>
                <Badge
                  className={cn(
                    "text-[10px] font-bold uppercase",
                    isResolved
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : hasResponded
                      ? "bg-blue-100 text-blue-900 border-blue-300"
                      : "bg-rose-100 text-rose-900 border-rose-300"
                  )}
                >
                  {s.status}
                </Badge>
              </div>
            }
          >
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{s.description}</p>

              <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4 p-3 rounded-lg bg-[#FAF7F2] border border-[#EADBCE]">
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Category</p>
                  <p className="font-bold text-slate-800">{s.type}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Raised By</p>
                  <p className="font-bold text-slate-800">{s.raisedBy.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Notice Date</p>
                  <p className="font-bold text-slate-800">{formatDate(s.raisedAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Compliance Due</p>
                  <p className="font-bold text-rose-700">{formatDate(s.dueDate)}</p>
                </div>
              </div>

              {/* Applicant Response Details if available */}
              {s.response && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-blue-700" /> Applicant Response Statement
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatDateTime(s.response.respondedAt)}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">{s.response.text}</p>
                  {s.response.supportingDocument && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-blue-200 text-[11px] font-semibold text-blue-900">
                      <FileText className="size-3 text-blue-700" />
                      <span>{s.response.supportingDocument}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resolution Remarks if resolved */}
              {s.resolution && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-700" /> Shortfall Resolved &amp; Cleared
                    </span>
                    {s.resolvedAt && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDateTime(s.resolvedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 leading-relaxed">{s.resolution}</p>
                  {s.resolvedBy && (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Verified by {s.resolvedBy.name} ({s.resolvedBy.role})
                    </p>
                  )}
                </div>
              )}

              {/* Role-Specific Action Buttons */}
              <div className="pt-1">
                {isLtp ? (
                  /* LTP Actions */
                  !isResolved ? (
                    <Button
                      size="sm"
                      className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold cursor-pointer shadow-2xs gap-1.5"
                      onClick={() => onOpenRespond(s)}
                    >
                      <MessageSquare className="size-4" /> Respond to shortfall
                    </Button>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold py-1 px-3">
                      <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-700" /> Cleared &amp; Closed
                    </Badge>
                  )
                ) : (
                  /* Officer / Non-LTP Actions: NEVER SHOW "Respond to shortfall"! */
                  <div className="flex flex-wrap items-center gap-2">
                    {!isResolved ? (
                      hasResponded ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onOpenResolve(s)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 px-3 gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span>Verify &amp; Resolve Shortfall</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenRaise}
                            className="border-[#7A1316]/40 text-[#7A1316] hover:bg-[#FAF7F2] font-bold text-xs h-8 gap-1 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Raise Additional Shortfall</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-medium py-1 px-3 text-xs">
                            <Clock className="size-3.5 mr-1.5 text-amber-700" />
                            Awaiting Applicant Response (Due: {formatDate(s.dueDate)})
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenRaise}
                            className="border-[#7A1316]/40 text-[#7A1316] hover:bg-[#FAF7F2] font-bold text-xs h-8 gap-1 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Raise Another Shortfall</span>
                          </Button>
                        </>
                      )
                    ) : (
                      <>
                        <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold py-1 px-3 text-xs">
                          <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-700" />
                          Verified &amp; Resolved
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onOpenRaise}
                          className="border-[#7A1316]/40 text-[#7A1316] hover:bg-[#FAF7F2] font-bold text-xs h-8 gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          <span>Raise New Shortfall</span>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

// ---------- Remarks Tab ----------
function RemarksTab({ app }: { app: Application }) {
  if (app.remarks.length === 0) {
    return <EmptyState icon={MessageSquare} title="No remarks yet" description="Remarks from reviewing officers will appear here." />;
  }
  return (
    <SectionCard title="Officer Remarks" description="Comments and observations from the review chain" icon={MessageSquare}>
      <ol className="relative space-y-0">
        {app.remarks.map((r, idx) => {
          const isLast = idx === app.remarks.length - 1;
          const typeCls = {
            INFO: "bg-blue-100 text-blue-800 border-blue-300",
            OBSERVATION: "bg-slate-100 text-slate-800 border-slate-300",
            INSTRUCTION: "bg-amber-100 text-amber-800 border-amber-300",
            DECISION: "bg-emerald-100 text-emerald-800 border-emerald-300",
          }[r.type];
          return (
            <li key={r.id} className="relative flex gap-3 pb-5">
              {!isLast && <div className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-[#DCD5C8]" />}
              <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7A1316]/10 text-[#7A1316] text-[10px] font-bold">
                {(r.author?.name || "Officer").split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-x-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{r.author?.name || "Official"}</span>
                    {r.author?.role && <RoleBadge role={r.author.role} />}
                    <Badge className={cn("text-[9px] font-bold border", typeCls)}>{r.type}</Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{formatDateTime(r.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-800 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] px-3.5 py-2.5 font-medium leading-relaxed">{r.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}

// ---------- Audit Tab ----------
function AuditTab({ app }: { app: Application }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard title="Audit Trail" description="Complete chronological record of all actions" icon={History}>
          <AuditTimeline entries={app.auditLog} variant="maroon" />
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Compliance Metadata" icon={ShieldCheck}>
          <div className="space-y-2">
            <InfoRow label="Total Events" value={app.auditLog.length} />
            <InfoRow label="First Event" value={formatDateTime(app.auditLog[0]?.timestamp ?? "")} />
            <InfoRow label="Last Event" value={formatDateTime(app.auditLog[app.auditLog.length - 1]?.timestamp ?? "")} />
            <Separator className="bg-[#DCD5C8]" />
            <InfoRow label="Data Retention" value="7 years" />
            <InfoRow label="Audit Standard" value="NIC eGov" />
            <InfoRow label="Integrity" value={<Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">Verified</Badge>} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
