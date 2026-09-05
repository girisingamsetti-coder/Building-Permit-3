"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication, ROLES } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  InfoGrid,
  InfoRow,
  EmptyState,
} from "@/components/design-system/layout";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageBackButton } from "@/components/design-system/back-button";
import type { Application } from "@/types";

export function LtpApplicationDetails() {
  const app = useSelectedApplication();
  const { navigate, openApplication } = useAppStore();

  if (!app) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="ltp-applications" />
        <PageHeader
          title="Application Details"
          icon={FileText}
          breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Applications", onClick: () => navigate("ltp-applications") }, { label: "Details" }]}
        />
        <EmptyState
          icon={FileWarning}
          title="No application selected"
          description="Select an application from the list to view its details."
          action={<Button size="sm" onClick={() => navigate("ltp-applications")}>Browse applications</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-applications" fallbackLabel="Applications" />
      <PageHeader
        title={app.applicationNo}
        description={app.project.name}
        icon={FileText}
        breadcrumbs={[
          { label: "LTP Portal", onClick: () => navigate("ltp-dashboard") },
          { label: "Applications", onClick: () => navigate("ltp-applications") },
          { label: app.applicationNo },
        ]}
        badge={<StatusBadge status={app.status} />}
        actions={
          <>
            <Button variant="outline" size="sm"><Printer className="size-4" /> Print</Button>
            <Button variant="outline" size="sm"><Share2 className="size-4" /> Share</Button>
          </>
        }
      />

      {/* Status banner */}
      <StatusBanner app={app} />

      {/* Workflow stepper */}
      <SectionCard title="Approval Workflow" description="Multi-level approval pipeline" icon={Workflow}>
        <div className="space-y-4">
          <WorkflowStepper currentStage={app.currentStage} status={app.status === "APPROVED" ? "COMPLETED" : app.status === "SCRUTINY_FAILED" ? "FAILED" : app.status === "SHORTFALL_RAISED" ? "SHORTFALL" : "CURRENT"} />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="font-medium">{formatDate(app.submissionDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Expected SLA:</span>
              <span className="font-medium">{formatDate(app.expectedSLA ?? "")}</span>
            </div>
            {app.assignedOfficer && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned:</span>
                <span className="font-medium">{app.assignedOfficer.name}</span>
                <RoleBadge role={app.assignedOfficer.role} />
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="overview" className="gap-1.5"><Info className="size-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="workflow" className="gap-1.5"><Workflow className="size-3.5" /> Workflow Timeline</TabsTrigger>
          <TabsTrigger value="drawings" className="gap-1.5"><Upload className="size-3.5" /> Drawings &amp; Scrutiny</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5"><FolderClosed className="size-3.5" /> Documents</TabsTrigger>
          <TabsTrigger value="fees" className="gap-1.5"><ReceiptIndianRupee className="size-3.5" /> Fees &amp; Payment</TabsTrigger>
          <TabsTrigger value="shortfalls" className="gap-1.5"><AlertTriangle className="size-3.5" /> Shortfalls {app.shortfalls.length > 0 && <Badge className="ml-1 bg-warning text-warning-foreground text-[9px]">{app.shortfalls.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="remarks" className="gap-1.5"><MessageSquare className="size-3.5" /> Remarks {app.remarks.length > 0 && <Badge className="ml-1 bg-muted text-muted-foreground text-[9px]">{app.remarks.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5"><History className="size-3.5" /> Audit Log</TabsTrigger>
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
  const docsVerified = app.documents.filter((d) => d.status === "VERIFIED").length;
  const docsTotal = app.documents.filter((d) => d.required).length;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SectionCard title="Applicant Information" icon={User}>
          <InfoGrid
            items={[
              { label: "Applicant Name", value: app.applicant.name },
              { label: "Contact", value: app.applicant.contact, mono: true },
              { label: "Email", value: app.applicant.email },
              { label: "Address", value: app.applicant.address },
              { label: "Submitted on behalf of", value: app.ltpName },
              { label: "LTP License No.", value: "LTP-MC-2019-0457", mono: true },
            ]}
            columns={2}
          />
        </SectionCard>

        <SectionCard title="Project Information" icon={Building2}>
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
        </SectionCard>

        <SectionCard title="Property Location" icon={MapPin}>
          <InfoGrid
            items={[
              { label: "Ward", value: app.project.ward },
              { label: "Zone", value: app.project.zone },
              { label: "Survey No.", value: app.project.surveyNo, mono: true },
              { label: "Site Address", value: app.project.address },
            ]}
            columns={2}
          />
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
              <span className="text-xs text-muted-foreground">Current Stage</span>
              <span className="text-xs font-medium">{app.currentStageLabel}</span>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">{app.progress}%</span>
              </div>
              <Progress value={app.progress} className="h-1.5" />
            </div>
            <Separator />
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
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ---------- Workflow Tab ----------
function WorkflowTab({ app }: { app: Application }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard title="Workflow Timeline" description="Chronological record of all stage transitions" icon={Workflow}>
          <WorkflowTimeline entries={app.workflowHistory} />
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Stage Status" icon={Flag}>
          <ul className="space-y-2">
            {app.workflowHistory.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-foreground/80">{e.stageLabel}</span>
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
                <li key={name} className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{name}</p>
                    <p className="text-[10px] text-muted-foreground">{ROLES[entry.actor.role].fullName}</p>
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
              action={app.scrutinyReport.status === "PASSED" ? <Badge className="bg-success text-success-foreground">Passed</Badge> : <Badge className="bg-destructive text-white">Failed</Badge>}
            >
              <div className="space-y-4">
                <div className={cn("rounded-lg border p-3 text-sm", app.scrutinyReport.status === "PASSED" ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive")}>
                  <p className="font-medium">{app.scrutinyReport.summary}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ScrutinyStat label="Total Checks" value={app.scrutinyReport.totalChecks} cls="bg-muted text-muted-foreground" />
                  <ScrutinyStat label="Passed" value={app.scrutinyReport.passed} cls="bg-success/10 text-success" />
                  <ScrutinyStat label="Failed / Warnings" value={`${app.scrutinyReport.failed} / ${app.scrutinyReport.warnings}`} cls="bg-warning/15 text-warning-foreground" />
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Rule</th>
                        <th className="px-3 py-2 font-medium">Category</th>
                        <th className="px-3 py-2 font-medium">Severity</th>
                        <th className="px-3 py-2 font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {app.scrutinyReport.checks.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <p className="text-xs font-medium">{c.rule}</p>
                            <p className="text-[10px] text-muted-foreground">{c.message}</p>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{c.category}</td>
                          <td className="px-3 py-2"><SeverityBadge severity={c.severity} /></td>
                          <td className="px-3 py-2">
                            {c.status === "PASS" && <Badge className="bg-success/15 text-success">Pass</Badge>}
                            {c.status === "FAIL" && <Badge className="bg-destructive text-white">Fail</Badge>}
                            {c.status === "WARNING" && <Badge className="bg-warning text-warning-foreground">Warning</Badge>}
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
            <ul className="divide-y divide-border">
              {app.drawings.map((d) => (
                <li key={d.id} className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{d.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">{d.fileSize} · v{d.version} · {formatDateTime(d.uploadedAt)}</p>
                    </div>
                    {d.status === "SCRUTINY_PASSED" && <Badge className="bg-success/10 text-success text-[9px]">Passed</Badge>}
                    {d.status === "SCRUTINY_FAILED" && <Badge className="bg-destructive/10 text-destructive text-[9px]">Failed</Badge>}
                    {d.status === "SUPERSEDED" && <Badge className="bg-muted text-muted-foreground text-[9px]">Superseded</Badge>}
                    {d.status === "PENDING_SCRUTINY" && <Badge className="bg-info/10 text-info text-[9px]">Pending</Badge>}
                  </div>
                  {d.notes && <p className="mt-1.5 text-[10px] text-muted-foreground italic">{d.notes}</p>}
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
    <div className={cn("rounded-lg p-3 text-center", cls)}>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
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
            <p className="text-sm font-medium">{verified} of {required} required documents verified</p>
            <p className="text-xs text-muted-foreground">{app.documents.filter((d) => d.status === "SHORTFALL").length} shortfalls · {app.documents.filter((d) => d.status === "REQUIRED").length} pending upload</p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-2 w-32" />
            <span className="text-sm font-semibold tabular-nums">{pct}%</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Required Documents" description="Upload, preview and track verification status" icon={FileText} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Document</th>
                <th className="px-4 py-2.5 font-medium">Required</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Version</th>
                <th className="px-4 py-2.5 font-medium">Verified By</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {app.documents.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{d.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{d.code}</p>
                    {d.remarks && <p className="mt-0.5 text-[10px] text-destructive">{d.remarks}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {d.required ? <Badge className="bg-destructive/10 text-destructive text-[9px]">Required</Badge> : <Badge variant="outline" className="text-[9px]">Optional</Badge>}
                  </td>
                  <td className="px-4 py-3"><DocumentStatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-xs">{d.version ? `v${d.version}` : "—"}</td>
                  <td className="px-4 py-3 text-xs">{d.verifiedBy ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.verifiedAt ? formatDate(d.verifiedAt) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {d.status === "REQUIRED" || d.status === "SHORTFALL" ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs"><Upload className="size-3" /> Upload</Button>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="size-7"><Eye className="size-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="size-7"><Download className="size-3.5" /></Button>
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
  if (!app.fee) {
    return <EmptyState icon={ReceiptIndianRupee} title="Fees not generated" description="Fees will be generated automatically once documents are verified." />;
  }
  const f = app.fee;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard title="Fee Breakdown" description={`${f.feeStructureName} · generated ${formatDate(f.generatedAt)}`} icon={ReceiptIndianRupee}>
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs uppercase tracking-wide text-muted-foreground">
              <span>Component</span>
              <span>Amount (₹)</span>
            </div>
            {f.lineItems.map((li) => (
              <div key={li.componentCode} className="flex items-center justify-between py-2.5 border-b border-dashed border-border/60 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{li.name}</p>
                  <p className="text-[11px] text-muted-foreground">{li.description}</p>
                  <p className="text-[10px] text-muted-foreground">{li.basis} · ₹{li.rate.toLocaleString("en-IN")} × {li.quantity.toLocaleString("en-IN")}</p>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums">{li.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono tabular-nums">{formatINR(f.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span className="font-mono tabular-nums">{formatINR(f.gst)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Total Payable</span>
              <span className="font-mono text-lg font-bold text-primary">{formatINR(f.total)}</span>
            </div>
          </div>
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Payment Status" icon={CheckCircle2}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Fee</span>
              <span className="font-mono text-sm font-medium">{formatINR(f.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Paid</span>
              <span className="font-mono text-sm text-success">{formatINR(f.paidAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Outstanding</span>
              <span className="font-mono text-sm font-semibold text-destructive">{formatINR(f.outstanding)}</span>
            </div>
            <Separator />
            {app.payment ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Transaction</span>
                  <PaymentStatusBadge status={app.payment.status} />
                </div>
                <p className="font-mono text-[11px]">{app.payment.transactionId || "—"}</p>
                <p className="text-[10px] text-muted-foreground">{app.payment.gateway} · {app.payment.method}</p>
                {app.payment.receiptNo && (
                  <Button size="sm" variant="outline" className="w-full"><Download className="size-3.5" /> Receipt {app.payment.receiptNo}</Button>
                )}
              </div>
            ) : (
              <Button className="w-full"><ReceiptIndianRupee className="size-4" /> Pay Now</Button>
            )}
          </div>
        </SectionCard>
      </div>
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
          action={<Badge className="bg-warning text-warning-foreground">{s.shortfallId}</Badge>}>
          <div className="space-y-3">
            <p className="text-sm text-foreground/90">{s.description}</p>
            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div><p className="text-muted-foreground">Type</p><p className="font-medium">{s.type}</p></div>
              <div><p className="text-muted-foreground">Raised By</p><p className="font-medium">{s.raisedBy.name}</p></div>
              <div><p className="text-muted-foreground">Raised On</p><p className="font-medium">{formatDate(s.raisedAt)}</p></div>
              <div><p className="text-muted-foreground">Due Date</p><p className="font-medium text-destructive">{formatDate(s.dueDate)}</p></div>
            </div>
            <Button size="sm" onClick={() => navigate("ltp-shortfalls")}><MessageSquare className="size-4" /> Respond to shortfall</Button>
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
            INFO: "bg-info/10 text-info",
            OBSERVATION: "bg-muted text-muted-foreground",
            INSTRUCTION: "bg-warning/15 text-warning-foreground",
            DECISION: "bg-success/10 text-success",
          }[r.type];
          return (
            <li key={r.id} className="relative flex gap-3 pb-5">
              {!isLast && <div className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border" />}
              <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                {r.author.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-x-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.author.name}</span>
                    <RoleBadge role={r.author.role} />
                    <Badge className={cn("text-[9px]", typeCls)}>{r.type}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(r.timestamp)}</span>
                </div>
                <p className="text-sm text-foreground/90 rounded-md bg-muted/40 px-3 py-2">{r.text}</p>
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
          <AuditTimeline entries={app.auditLog} />
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Compliance Metadata" icon={ShieldCheck}>
          <div className="space-y-2">
            <InfoRow label="Total Events" value={app.auditLog.length} />
            <InfoRow label="First Event" value={formatDateTime(app.auditLog[0]?.timestamp ?? "")} />
            <InfoRow label="Last Event" value={formatDateTime(app.auditLog[app.auditLog.length - 1]?.timestamp ?? "")} />
            <Separator />
            <InfoRow label="Data Retention" value="7 years" />
            <InfoRow label="Audit Standard" value="NIC eGov" />
            <InfoRow label="Integrity" value={<Badge className="bg-success/10 text-success">Verified</Badge>} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
