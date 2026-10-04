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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";
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
  const { navigate, openApplication, goBack } = useAppStore();
  const { toast } = useToast();

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

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-4 sm:p-6 space-y-6 font-sans text-slate-800 overflow-y-auto">
      {/* Top Header / Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DCD5C8] shrink-0">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#DCD5C8] bg-white text-xs font-bold text-[#7A1316] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="size-4" /> Back to Submissions
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Application:</span>
          <span className="font-mono text-xs font-bold text-[#7A1316] bg-white px-2.5 py-1 rounded border border-[#DCD5C8]">
            {app.applicationNo}
          </span>
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner app={app} />

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
      <Tabs defaultValue="overview" className="space-y-4">
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
          <DrawingsTab app={app} />
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
          <ShortfallsTab app={app} />
        </TabsContent>
        <TabsContent value="remarks" className="space-y-6">
          <RemarksTab app={app} />
        </TabsContent>
        <TabsContent value="audit" className="space-y-6">
          <AuditTab app={app} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Status Banner ----------
function StatusBanner({ app }: { app: Application }) {
  const { openApplication, navigate } = useAppStore();
  const { toast } = useToast();

  const config = {
    SCRUTINY_FAILED: {
      icon: XCircle,
      cls: "border-destructive/30 bg-destructive/5 text-destructive",
      iconCls: "bg-destructive/10 text-destructive",
      title: "Drawing scrutiny failed",
      desc: `${app.scrutinyReport?.failed ?? 1} critical issue(s) found. Please re-upload corrected drawings.`,
      action: { label: "Re-upload drawings", view: "ltp-drawings" as const },
    },
    DRAWING_REUPLOAD_REQUIRED: {
      icon: XCircle,
      cls: "border-destructive/30 bg-destructive/5 text-destructive",
      iconCls: "bg-destructive/10 text-destructive",
      title: "Drawing re-upload required",
      desc: "Scrutiny identified critical non-compliances. Please re-upload a corrected drawing.",
      action: { label: "Re-upload drawings", view: "ltp-drawings" as const },
    },
    SHORTFALL_RAISED: {
      icon: AlertTriangle,
      cls: "border-warning/30 bg-warning/5 text-warning-foreground",
      iconCls: "bg-warning/15 text-warning-foreground",
      title: `${app.shortfalls.filter((sf) => sf.status !== "RESOLVED").length} shortfall(s) raised`,
      desc: "Action required from you. Respond to the shortfalls to resume processing.",
      action: { label: "View shortfalls", view: "ltp-shortfalls" as const },
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
      <Button
        size="sm"
        variant="outline"
        className={cn("shrink-0 border-current/30 bg-background/50", c.cls)}
        onClick={() => {
          openApplication(app.id, c.action.view);
          toast({ title: c.action.label });
        }}
      >
        {c.action.label} <ArrowRight className="size-4" />
      </Button>
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
function DrawingsTab({ app }: { app: Application }) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Drawing Viewer" description="View, zoom, rotate and switch versions" icon={Eye}>
            {app.drawings.length > 0 ? (
              <DrawingViewer drawings={app.drawings} />
            ) : (
              <EmptyState icon={Upload} title="No drawings uploaded" description="Upload your first drawing to begin scrutiny." />
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

// ---------- Shortfalls Tab ----------
function ShortfallsTab({ app }: { app: Application }) {
  const { navigate } = useAppStore();
  if (app.shortfalls.length === 0) {
    return <EmptyState icon={CheckCircle2} title="No shortfalls" description="There are no active shortfalls on this application." />;
  }
  return (
    <div className="space-y-4">
      {app.shortfalls.map((s) => (
        <SectionCard key={s.id} title={s.title} icon={AlertTriangle}
          action={<Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold">{s.shortfallId}</Badge>}>
          <div className="space-y-3">
            <p className="text-sm text-slate-800 leading-relaxed">{s.description}</p>
            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4 p-3 rounded-lg bg-[#FAF7F2] border border-[#EADBCE]">
              <div><p className="text-slate-500 font-medium">Type</p><p className="font-bold text-slate-800">{s.type}</p></div>
              <div><p className="text-slate-500 font-medium">Raised By</p><p className="font-bold text-slate-800">{s.raisedBy.name}</p></div>
              <div><p className="text-slate-500 font-medium">Raised On</p><p className="font-bold text-slate-800">{formatDate(s.raisedAt)}</p></div>
              <div><p className="text-slate-500 font-medium">Due Date</p><p className="font-bold text-rose-700">{formatDate(s.dueDate)}</p></div>
            </div>
            <Button size="sm" className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold cursor-pointer shadow-2xs" onClick={() => navigate("ltp-shortfalls")}>
              <MessageSquare className="size-4 mr-1.5" /> Respond to shortfall
            </Button>
          </div>
        </SectionCard>
      ))}
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
