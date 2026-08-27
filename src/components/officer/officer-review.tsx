"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication } from "@/store/app-store";
import { ROLES, WORKFLOW_STAGES } from "@/data/mock-data";
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
  ShortfallStatusBadge,
  ShortfallTypeBadge,
} from "@/components/design-system/badges";
import {
  WorkflowStepper,
  WorkflowTimeline,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileSearch,
  ArrowLeft,
  ArrowRight,
  Clock,
  CalendarClock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Send,
  AlertTriangle,
  MessageSquare,
  Gavel,
  User,
  Building2,
  MapPin,
  ReceiptIndianRupee,
  FolderClosed,
  Upload,
  Eye,
  Download,
  FileText,
  ScrollText,
  History,
  AlertCircle,
  Layers,
  ClipboardCheck,
  PanelLeft,
  PanelRight,
  Info,
  FileWarning,
  Ban,
  CircleCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  Application,
  RoleKey,
  ShortfallType,
  WorkflowAction,
} from "@/types";

// ---------- Helpers ----------
function daysRemaining(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function slaTone(days: number | null): { cls: string; label: string } {
  if (days === null) return { cls: "text-muted-foreground", label: "—" };
  if (days < 0) return { cls: "text-destructive font-semibold", label: `Overdue ${Math.abs(days)}d` };
  if (days <= 3) return { cls: "text-destructive font-semibold", label: `${days}d left` };
  if (days <= 7) return { cls: "text-amber-600 dark:text-amber-400 font-semibold", label: `${days}d left` };
  return { cls: "text-success font-medium", label: `${days}d left` };
}

/** Determine whether the user's role can act on the application's current stage. */
function canUserActOnStage(userRole: RoleKey, stageRole: RoleKey): boolean {
  if (userRole === stageRole) return true;
  if (
    (userRole === "TPS" || userRole === "TPA") &&
    (stageRole === "TPS" || stageRole === "TPA")
  )
    return true;
  if (
    (userRole === "ZAD" || userRole === "ZDD") &&
    (stageRole === "ZAD" || stageRole === "ZDD")
  )
    return true;
  return false;
}

function getStageAllowedActions(app: Application): WorkflowAction[] {
  const stage = WORKFLOW_STAGES.find((s) => s.key === app.currentStage);
  return stage?.allowedActions ?? [];
}

// ---------- Action button config ----------
type ActionKey = "APPROVE" | "FORWARD" | "RAISE_SHORTFALL" | "RETURN" | "ADD_REMARKS" | "FINAL_DECISION";

const ACTION_CONFIG: Record<
  ActionKey,
  { label: string; icon: typeof CheckCircle2; variant: "default" | "destructive" | "outline" | "secondary"; tone: string; description: string }
> = {
  APPROVE: { label: "Approve", icon: CheckCircle2, variant: "outline", tone: "text-success", description: "Approve at this stage and forward to the next reviewing officer." },
  FORWARD: { label: "Forward", icon: Send, variant: "default", tone: "text-primary", description: "Forward this application to the next stage in the workflow." },
  RAISE_SHORTFALL: { label: "Raise Shortfall", icon: AlertTriangle, variant: "outline", tone: "text-amber-600 dark:text-amber-400", description: "Raise a shortfall requiring applicant response before proceeding." },
  RETURN: { label: "Return", icon: ArrowLeft, variant: "outline", tone: "text-destructive", description: "Return the application to the previous officer or applicant." },
  ADD_REMARKS: { label: "Add Remarks", icon: MessageSquare, variant: "outline", tone: "text-muted-foreground", description: "Add an observation, instruction or informational remark to the file." },
  FINAL_DECISION: { label: "Final Decision", icon: Gavel, variant: "default", tone: "text-primary", description: "Issue the final approval or rejection as the Commissioner." },
};

const ALL_ACTIONS: ActionKey[] = ["APPROVE", "FORWARD", "RAISE_SHORTFALL", "RETURN", "ADD_REMARKS", "FINAL_DECISION"];

// ---------- Main component ----------
export function OfficerReview() {
  const app = useSelectedApplication();
  const { user, navigate, openApplication } = useAppStore();
  const { toast } = useToast();

  // Mobile pane toggle
  const [mobilePane, setMobilePane] = React.useState<"details" | "documents">("details");

  // Dialogs
  const [shortfallOpen, setShortfallOpen] = React.useState(false);
  const [remarksOpen, setRemarksOpen] = React.useState(false);
  const [decisionOpen, setDecisionOpen] = React.useState<null | "APPROVE" | "FORWARD" | "RETURN" | "FINAL_DECISION">(null);

  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Application Review"
          description="Open an application from your assigned queue to begin a split-screen review."
          icon={FileSearch}
          breadcrumbs={[
            { label: "Officer Workspace", onClick: () => navigate("officer-dashboard") },
            { label: "Application Review" },
          ]}
        />
        <EmptyState
          icon={FileWarning}
          title="No application selected for review"
          description="Pick an application from your assigned queue to view drawings, documents, scrutiny reports and take action."
          action={
            <Button size="sm" onClick={() => navigate("officer-applications")}>
              <ClipboardCheck className="size-4" /> Open assigned queue
            </Button>
          }
        />
      </div>
    );
  }

  const userRole = user?.role ?? "TPS";
  const stage = WORKFLOW_STAGES.find((s) => s.key === app.currentStage);
  const stageRole = stage?.role ?? "TPS";
  const allowedActions = getStageAllowedActions(app);
  const canAct = canUserActOnStage(userRole, stageRole);

  // Build action button list (visible only if relevant for this stage, enabled if canAct & in allowedActions)
  const actionButtons = ALL_ACTIONS.map((key) => {
    const cfg = ACTION_CONFIG[key];
    const inStage = allowedActions.includes(key);
    const enabled = canAct && inStage;
    return { key, cfg, inStage, enabled };
  }).filter((a) => a.inStage);

  const days = daysRemaining(app.expectedSLA);
  const sla = slaTone(days);

  function handleAction(key: ActionKey) {
    if (key === "RAISE_SHORTFALL") {
      setShortfallOpen(true);
      return;
    }
    if (key === "ADD_REMARKS") {
      setRemarksOpen(true);
      return;
    }
    if (key === "APPROVE" || key === "FORWARD" || key === "RETURN" || key === "FINAL_DECISION") {
      setDecisionOpen(key);
      return;
    }
  }

  return (
    <div className="space-y-4">
      {/* Top header / bar */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <button onClick={() => navigate("officer-dashboard")} className="hover:text-foreground transition-colors">Officer Workspace</button>
          <ChevronRight className="size-3" />
          <button onClick={() => navigate("officer-applications")} className="hover:text-foreground transition-colors">Assigned Queue</button>
          <ChevronRight className="size-3" />
          <button onClick={() => openApplication(app.id, "officer-review")} className="hover:text-foreground transition-colors font-mono">{app.applicationNo}</button>
        </nav>

        {/* Application summary bar */}
        <div className="rounded-xl border border-border bg-card shadow-gov">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: identity */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight font-mono">{app.applicationNo}</h1>
                  <StatusBadge status={app.status} />
                  <PriorityBadge priority={app.priority} />
                </div>
                <p className="text-sm text-muted-foreground truncate">{app.project.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {app.project.ward}</span>
                  <span className="flex items-center gap-1"><Building2 className="size-3" /> {app.project.propertyType.replace("_", " ").toLowerCase()}</span>
                  <span className="flex items-center gap-1"><User className="size-3" /> {app.applicant.name}</span>
                </div>
              </div>
            </div>

            {/* Right: SLA + stage */}
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="flex flex-col items-end gap-0.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Current Stage</span>
                <span className="text-xs font-medium">{app.currentStageLabel}</span>
              </div>
              <div className="flex flex-col items-end gap-0.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Expected SLA</span>
                <span className={cn("text-xs font-semibold tabular-nums flex items-center gap-1", sla.cls)}>
                  <CalendarClock className="size-3" /> {sla.label}
                </span>
              </div>
              {app.assignedOfficer && (
                <div className="flex flex-col items-end gap-0.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Assigned</span>
                  <span className="text-xs font-medium">{app.assignedOfficer.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
              <ShieldCheck className="size-3.5" />
              <span>
                {canAct ? (
                  <>You are authorised to act at this stage as <RoleBadge role={userRole} label={ROLES[userRole].title} /></>
                ) : (
                  <>Stage handled by <RoleBadge role={stageRole} label={ROLES[stageRole].title} /> — view-only access for your role</>
                )}
              </span>
            </div>
            {actionButtons.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">No actions permitted at this stage.</span>
            ) : (
              actionButtons.map(({ key, cfg, enabled }) => {
                const Icon = cfg.icon;
                const button = (
                  <Button
                    key={key}
                    variant={cfg.variant}
                    size="sm"
                    disabled={!enabled}
                    onClick={() => enabled && handleAction(key)}
                    className={cn("gap-1.5", cfg.variant === "outline" && "border-current/30")}
                  >
                    <Icon className={cn("size-4", enabled && cfg.tone)} />
                    {cfg.label}
                  </Button>
                );
                if (!enabled) {
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <span>{button}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{cfg.description} — not permitted at this stage.</span>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return button;
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile pane toggle */}
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 lg:hidden">
        <Button
          variant={mobilePane === "details" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => setMobilePane("details")}
        >
          <PanelLeft className="size-4" /> Details
        </Button>
        <Button
          variant={mobilePane === "documents" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => setMobilePane("documents")}
        >
          <PanelRight className="size-4" /> Documents
        </Button>
      </div>

      {/* Split-screen review workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[45%_55%]">
        {/* LEFT pane — application information */}
        <div className={cn("space-y-4 lg:block", mobilePane === "details" ? "block" : "hidden")}>
          <LeftPane app={app} />
        </div>

        {/* RIGHT pane — tabbed viewer */}
        <div className={cn("space-y-4 lg:block", mobilePane === "documents" ? "block" : "hidden")}>
          <RightPane app={app} />
        </div>
      </div>

      {/* Dialogs */}
      <ShortfallDialog open={shortfallOpen} onOpenChange={setShortfallOpen} app={app} />
      <RemarksDialog open={remarksOpen} onOpenChange={setRemarksOpen} app={app} />
      <DecisionDialog
        open={decisionOpen !== null}
        action={decisionOpen}
        app={app}
        onClose={() => setDecisionOpen(null)}
      />
    </div>
  );
}

// ============================================================
// LEFT PANE — Application information
// ============================================================
function LeftPane({ app }: { app: Application }) {
  return (
    <>
      <SectionCard title="Application Information" icon={FileText}>
        <div className="space-y-3">
          <InfoGrid
            items={[
              { label: "Application No.", value: app.applicationNo, mono: true },
              { label: "Status", value: <StatusBadge status={app.status} showIcon={false} /> },
              { label: "Priority", value: <PriorityBadge priority={app.priority} /> },
              { label: "Progress", value: `${app.progress}%` },
              { label: "Submission Date", value: formatDate(app.submissionDate) },
              { label: "Last Updated", value: timeAgo(app.lastUpdated) },
              { label: "Expected SLA", value: formatDate(app.expectedSLA ?? "") },
              { label: "Current Stage", value: app.currentStageLabel },
            ]}
            columns={2}
          />
          <Separator />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Workflow progress</span>
              <span className="font-medium tabular-nums">{app.progress}%</span>
            </div>
            <Progress value={app.progress} className="h-1.5" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Applicant Details" icon={User}>
        <InfoGrid
          items={[
            { label: "Applicant Name", value: app.applicant.name },
            { label: "Contact", value: app.applicant.contact, mono: true },
            { label: "Email", value: app.applicant.email },
            { label: "Address", value: app.applicant.address },
            { label: "Submitted by LTP", value: app.ltpName },
            { label: "LTP License No.", value: "LTP-MC-2019-0457", mono: true },
          ]}
          columns={2}
        />
      </SectionCard>

      <SectionCard title="Project Details" icon={Building2}>
        <InfoGrid
          items={[
            { label: "Project Name", value: app.project.name },
            { label: "Application Type", value: prettifyEnum(app.project.type) },
            { label: "Property Type", value: prettifyEnum(app.project.propertyType) },
            { label: "Land Use", value: app.project.landUse },
            { label: "Plot Area", value: `${app.project.plotArea.toLocaleString("en-IN")} sq.m` },
            { label: "Built-up Area", value: `${app.project.builtUpArea.toLocaleString("en-IN")} sq.m` },
            { label: "FAR Utilisation", value: `${(app.project.builtUpArea / app.project.plotArea).toFixed(2)} (perm. 1.50)` },
            { label: "Survey No.", value: app.project.surveyNo, mono: true },
            { label: "Ward", value: app.project.ward },
            { label: "Zone", value: app.project.zone },
          ]}
          columns={2}
        />
      </SectionCard>

      <SectionCard title="Fee Summary" icon={ReceiptIndianRupee}>
        {app.fee ? (
          <div className="space-y-2">
            <InfoRow label="Fee Structure" value={<span className="text-xs">{app.fee.feeStructureName}</span>} />
            <InfoRow label="Generated On" value={formatDate(app.fee.generatedAt)} />
            <Separator />
            <div className="space-y-1.5">
              {app.fee.lineItems.map((li) => (
                <div key={li.componentCode} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{li.name}</span>
                  <span className="font-mono tabular-nums">{formatINR(li.amount)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <InfoRow label="Subtotal" value={<span className="font-mono tabular-nums">{formatINR(app.fee.subtotal)}</span>} />
            <InfoRow label="GST" value={<span className="font-mono tabular-nums">{formatINR(app.fee.gst)}</span>} />
            <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
              <span className="text-sm font-semibold">Total Payable</span>
              <span className="font-mono text-base font-bold text-primary">{formatINR(app.fee.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="rounded-md border border-success/30 bg-success/5 px-2 py-1.5">
                <p className="text-muted-foreground">Paid</p>
                <p className="font-mono font-semibold text-success">{formatINR(app.fee.paidAmount)}</p>
              </div>
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5">
                <p className="text-muted-foreground">Outstanding</p>
                <p className="font-mono font-semibold text-destructive">{formatINR(app.fee.outstanding)}</p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={ReceiptIndianRupee} title="Fees not generated" description="Fee details will appear here once generated." />
        )}
      </SectionCard>

      <SectionCard title="Payment Status" icon={ReceiptIndianRupee}>
        {app.payment ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <PaymentStatusBadge status={app.payment.status} />
            </div>
            <InfoRow label="Transaction ID" value={app.payment.transactionId || "—"} mono />
            <InfoRow label="Reference No." value={app.payment.referenceNo || "—"} mono />
            <InfoRow label="Amount" value={formatINR(app.payment.amount)} />
            <InfoRow label="Method / Gateway" value={`${app.payment.method} · ${app.payment.gateway}`} />
            {app.payment.completedAt && <InfoRow label="Completed At" value={formatDateTime(app.payment.completedAt)} />}
            {app.payment.receiptNo && (
              <Button size="sm" variant="outline" className="w-full">
                <Download className="size-3.5" /> Receipt {app.payment.receiptNo}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No payment record yet.</p>
        )}
      </SectionCard>

      <SectionCard title="Workflow History" description="Compact timeline of stage transitions" icon={History}>
        <WorkflowTimeline entries={app.workflowHistory} />
      </SectionCard>

      <SectionCard
        title="Previous Remarks"
        description="Officer comments on this file"
        icon={MessageSquare}
      >
        {app.remarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No remarks yet from reviewing officers.</p>
        ) : (
          <ol className="space-y-3">
            {app.remarks.map((r) => {
              const typeCls = {
                INFO: "bg-info/10 text-info",
                OBSERVATION: "bg-muted text-muted-foreground",
                INSTRUCTION: "bg-warning/15 text-warning-foreground",
                DECISION: "bg-success/10 text-success",
              }[r.type];
              return (
                <li key={r.id} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{r.author.name}</span>
                      <RoleBadge role={r.author.role} />
                      <Badge className={cn("text-[9px]", typeCls)}>{r.type}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatDateTime(r.timestamp)}</span>
                  </div>
                  <p className="rounded-md bg-muted/40 px-3 py-2 text-xs text-foreground/90">{r.text}</p>
                </li>
              );
            })}
          </ol>
        )}
      </SectionCard>
    </>
  );
}

// ============================================================
// RIGHT PANE — Tabbed viewer (Drawings / Documents / Scrutiny)
// ============================================================
function RightPane({ app }: { app: Application }) {
  return (
    <SectionCard
      title="Review Workspace"
      description="Drawings, documents and automated scrutiny findings"
      icon={FileSearch}
      noPadding
      contentClassName="p-4"
    >
      <Tabs defaultValue="drawings" className="space-y-3">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="drawings" className="gap-1.5">
            <Layers className="size-3.5" /> Drawings
            <Badge variant="outline" className="text-[9px]">{app.drawings.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FolderClosed className="size-3.5" /> Documents
            <Badge variant="outline" className="text-[9px]">{app.documents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="scrutiny" className="gap-1.5">
            <ScrollText className="size-3.5" /> Scrutiny Report
            {app.scrutinyReport && (
              <Badge className={cn("text-[9px]", app.scrutinyReport.status === "PASSED" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                {app.scrutinyReport.status}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Drawings tab */}
        <TabsContent value="drawings" className="space-y-3">
          {app.drawings.length > 0 ? (
            <DrawingViewer drawings={app.drawings} />
          ) : (
            <EmptyState icon={Upload} title="No drawings uploaded" description="Drawings will appear here once uploaded by the LTP." />
          )}
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents" className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Document</th>
                  <th className="px-3 py-2 font-medium">Required</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Verified By</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {app.documents.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-medium">{d.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{d.code}</p>
                      {d.remarks && <p className="mt-0.5 text-[10px] text-destructive">{d.remarks}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      {d.required ? (
                        <Badge className="bg-destructive/10 text-destructive text-[9px]">Required</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px]">Optional</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5"><DocumentStatusBadge status={d.status} /></td>
                    <td className="px-3 py-2.5 text-xs">{d.verifiedBy ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="size-7"><Eye className="size-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="size-7"><Download className="size-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Scrutiny tab */}
        <TabsContent value="scrutiny" className="space-y-3">
          {app.scrutinyReport ? (
            <ScrutinyReportView app={app} />
          ) : (
            <EmptyState icon={ScrollText} title="No scrutiny report" description="Scrutiny findings will appear here once drawings have been processed." />
          )}
        </TabsContent>
      </Tabs>
    </SectionCard>
  );
}

// ============================================================
// Scrutiny Report view (compact)
// ============================================================
function ScrutinyReportView({ app }: { app: Application }) {
  const r = app.scrutinyReport!;
  return (
    <div className="space-y-3">
      {/* Summary banner */}
      <div className={cn("rounded-lg border p-3 text-sm", r.status === "PASSED" ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive")}>
        <div className="flex items-start gap-2">
          {r.status === "PASSED" ? <CheckCircle2 className="size-4 mt-0.5" /> : <AlertCircle className="size-4 mt-0.5" />}
          <div>
            <p className="font-medium">{r.summary}</p>
            <p className="text-[11px] opacity-80 mt-1">Report {r.reportNo} · v{r.drawingVersion} · {formatDateTime(r.generatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-xl font-semibold tabular-nums">{r.totalChecks}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Checks</p>
        </div>
        <div className="rounded-lg bg-success/10 p-3 text-center">
          <p className="text-xl font-semibold tabular-nums text-success">{r.passed}</p>
          <p className="text-[10px] uppercase tracking-wide text-success/80">Passed</p>
        </div>
        <div className="rounded-lg bg-warning/15 p-3 text-center">
          <p className="text-xl font-semibold tabular-nums text-warning-foreground">{r.failed} / {r.warnings}</p>
          <p className="text-[10px] uppercase tracking-wide text-warning-foreground/80">Failed / Warn</p>
        </div>
      </div>

      {/* Checks table */}
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
            {r.checks.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">
                  <p className="text-xs font-medium">{c.rule}</p>
                  <p className="text-[10px] text-muted-foreground">{c.message}</p>
                  {c.recommendation && (
                    <p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-400">↳ {c.recommendation}</p>
                  )}
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
  );
}

// ============================================================
// Shortfall Dialog
// ============================================================
function ShortfallDialog({
  open,
  onOpenChange,
  app,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  app: Application;
}) {
  const { toast } = useToast();
  const [type, setType] = React.useState<ShortfallType>("DOCUMENT");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  function reset() {
    setType("DOCUMENT");
    setTitle("");
    setDescription("");
    setDueDate("");
    setFiles([]);
  }

  function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide a title and description for the shortfall.",
      });
      return;
    }
    toast({
      title: "Shortfall raised",
      description: `Shortfall on ${app.applicationNo} (${type.toLowerCase()}) has been raised. Applicant notified via SMS & in-app.`,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Raise Shortfall
          </DialogTitle>
          <DialogDescription>
            Raise a shortfall on <span className="font-mono font-medium text-foreground">{app.applicationNo}</span>. The applicant will be notified and the application will pause until resolution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Shortfall Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ShortfallType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOCUMENT">Document — missing or invalid document</SelectItem>
                <SelectItem value="FEE">Fee — outstanding or incorrect fee</SelectItem>
                <SelectItem value="GENERAL">General — clarification or general query</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sf-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="sf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Structural stability certificate missing SE stamp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sf-desc">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="sf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the shortfall in detail — what is missing, why it is required, and how the applicant should respond."
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sf-due">Response Due Date <span className="text-destructive">*</span></Label>
            <Input
              id="sf-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Default response window is 7 calendar days from today.</p>
          </div>

          <div className="space-y-2">
            <Label>Supporting Document (optional)</Label>
            <FileUploader
              label="Drop supporting file here"
              hint="PDF, JPG, PNG · max 50 MB"
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-1.5">
            <AlertTriangle className="size-4" /> Raise Shortfall
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Remarks Dialog
// ============================================================
function RemarksDialog({
  open,
  onOpenChange,
  app,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  app: Application;
}) {
  const { toast } = useToast();
  const [type, setType] = React.useState<"INFO" | "OBSERVATION" | "INSTRUCTION" | "DECISION">("OBSERVATION");
  const [text, setText] = React.useState("");

  function reset() {
    setType("OBSERVATION");
    setText("");
  }

  function handleSubmit() {
    if (!text.trim()) {
      toast({
        title: "Remark text required",
        description: "Please write a remark before submitting.",
      });
      return;
    }
    toast({
      title: "Remark added",
      description: `Your ${type.toLowerCase()} on ${app.applicationNo} has been recorded in the file.`,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            Add Remark
          </DialogTitle>
          <DialogDescription>
            Add an observation, instruction or informational remark to <span className="font-mono font-medium text-foreground">{app.applicationNo}</span>. Remarks are visible to all downstream officers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Remark Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INFO">Info — general informational note</SelectItem>
                <SelectItem value="OBSERVATION">Observation — noted finding, no action required</SelectItem>
                <SelectItem value="INSTRUCTION">Instruction — action requested from applicant/LTP</SelectItem>
                <SelectItem value="DECISION">Decision — records a review decision</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark-text">Remark <span className="text-destructive">*</span></Label>
            <Textarea
              id="remark-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your remark here…"
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-1.5">
            <MessageSquare className="size-4" /> Save Remark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Decision Dialog (Approve / Forward / Return / Final Decision)
// ============================================================
function DecisionDialog({
  open,
  action,
  app,
  onClose,
}: {
  open: boolean;
  action: null | "APPROVE" | "FORWARD" | "RETURN" | "FINAL_DECISION";
  app: Application;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { navigate } = useAppStore();
  const [remarks, setRemarks] = React.useState("");
  const [decision, setDecision] = React.useState<"APPROVE" | "REJECT">("APPROVE");
  const [conditions, setConditions] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setRemarks("");
      setDecision("APPROVE");
      setConditions("");
    }
  }, [open, action]);

  if (!action) return null;

  const stage = WORKFLOW_STAGES.find((s) => s.key === app.currentStage);
  const nextStageLabel = stage?.nextStage
    ? WORKFLOW_STAGES.find((s) => s.key === stage.nextStage)?.label
    : undefined;

  const cfg = ACTION_CONFIG[action];
  const Icon = cfg.icon;

  const titleMap: Record<typeof action, string> = {
    APPROVE: "Approve & Forward",
    FORWARD: "Forward Application",
    RETURN: "Return Application",
    FINAL_DECISION: "Issue Final Decision",
  };

  const descMap: Record<typeof action, string> = {
    APPROVE: nextStageLabel
      ? `Approve at the ${app.currentStageLabel} stage and forward to ${nextStageLabel}.`
      : `Approve at the ${app.currentStageLabel} stage.`,
    FORWARD: nextStageLabel
      ? `Forward this application to ${nextStageLabel}.`
      : `Forward this application to the next stage.`,
    RETURN: "Return the application to the previous officer or applicant. A reason is required.",
    FINAL_DECISION: "Issue the final approval or rejection as the Commissioner. This action is binding.",
  };

  function handleSubmit() {
    if (action === "RETURN" && !remarks.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for returning this application.",
      });
      return;
    }
    const actionLabel =
      action === "FINAL_DECISION"
        ? decision === "APPROVE" ? "Application approved" : "Application rejected"
        : action === "APPROVE" ? "Application approved & forwarded"
        : action === "FORWARD" ? "Application forwarded"
        : "Application returned";

    toast({
      title: actionLabel,
      description: `${app.applicationNo} — ${action === "FINAL_DECISION" && decision === "APPROVE" ? "Final approval granted" : action === "FINAL_DECISION" ? "Final rejection issued" : "Workflow updated"}. Applicant & officers notified via SMS & in-app.`,
    });
    onClose();
    navigate("officer-applications");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("size-5", cfg.tone)} />
            {titleMap[action]}
          </DialogTitle>
          <DialogDescription>{descMap[action]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Application context summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Application</span>
              <span className="font-mono font-medium">{app.applicationNo}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Project</span>
              <span className="font-medium truncate max-w-[300px]">{app.project.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current Stage</span>
              <span className="font-medium">{app.currentStageLabel}</span>
            </div>
            {nextStageLabel && action !== "RETURN" && action !== "FINAL_DECISION" && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Next Stage</span>
                <span className="font-medium text-primary flex items-center gap-1">
                  <ArrowRight className="size-3" /> {nextStageLabel}
                </span>
              </div>
            )}
          </div>

          {/* Final decision radio (only for FINAL_DECISION) */}
          {action === "FINAL_DECISION" && (
            <div className="space-y-2">
              <Label>Decision</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision("APPROVE")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                    decision === "APPROVE"
                      ? "border-success bg-success/5 ring-2 ring-success/20"
                      : "border-border hover:border-success/40"
                  )}
                >
                  <CircleCheck className={cn("size-5", decision === "APPROVE" ? "text-success" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">Approve</p>
                    <p className="text-[10px] text-muted-foreground">Grant final approval</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("REJECT")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                    decision === "REJECT"
                      ? "border-destructive bg-destructive/5 ring-2 ring-destructive/20"
                      : "border-border hover:border-destructive/40"
                  )}
                >
                  <Ban className={cn("size-5", decision === "REJECT" ? "text-destructive" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">Reject</p>
                    <p className="text-[10px] text-muted-foreground">Issue final rejection</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Conditions (only on approve/final-approve) */}
          {((action === "FINAL_DECISION" && decision === "APPROVE") || action === "APPROVE") && (
            <div className="space-y-2">
              <Label htmlFor="cond">Conditions of Approval (optional)</Label>
              <Textarea
                id="cond"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. STP operational before occupancy; 10% area reserved for EWS…"
                className="min-h-20"
              />
            </div>
          )}

          {/* Remarks / reason */}
          <div className="space-y-2">
            <Label htmlFor="dec-remarks">
              {action === "RETURN" || (action === "FINAL_DECISION" && decision === "REJECT")
                ? <>Reason <span className="text-destructive">*</span></>
                : "Remarks (optional)"}
            </Label>
            <Textarea
              id="dec-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                action === "RETURN"
                  ? "Reason for returning — visible to applicant and previous officer…"
                  : action === "FINAL_DECISION" && decision === "REJECT"
                  ? "Reason for final rejection — visible to applicant and officers…"
                  : "Optional remarks for the next reviewing officer…"
              }
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={
              action === "RETURN" || (action === "FINAL_DECISION" && decision === "REJECT")
                ? "destructive"
                : "default"
            }
            onClick={handleSubmit}
            className="gap-1.5"
          >
            <Icon className="size-4" />
            {action === "FINAL_DECISION"
              ? decision === "APPROVE" ? "Grant Final Approval" : "Issue Final Rejection"
              : action === "APPROVE" ? "Approve & Forward"
              : action === "FORWARD" ? "Forward Application"
              : "Return Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Util ----------
function prettifyEnum(s: string): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
