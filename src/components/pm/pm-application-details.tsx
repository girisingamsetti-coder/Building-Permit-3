"use client";

import * as React from "react";
import { useAppStore, useSelectedApplication } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  InfoGrid,
  InfoRow,
} from "@/components/design-system/layout";
import {
  StatusBadge,
  PriorityBadge,
  RoleBadge,
  DocumentStatusBadge,
  PaymentStatusBadge,
  ShortfallStatusBadge,
  ShortfallTypeBadge,
} from "@/components/design-system/badges";
import {
  WorkflowStepper,
  WorkflowTimeline,
  AuditTimeline,
  StageStatusPill,
  formatDate,
  formatDateTime,
  formatINR,
  timeAgo,
} from "@/components/design-system/workflow";
import { PageBackButton } from "@/components/design-system/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Workflow as WorkflowIcon,
  FolderClosed,
  Upload,
  ReceiptIndianRupee,
  AlertTriangle,
  History,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ScrollText,
  Info,
  ArrowRight,
  Flag,
} from "lucide-react";
import type { Application, WorkflowHistoryEntry } from "@/types";
import { WORKFLOW_STAGES, getStage } from "@/data/workflow-config";
import { computeSLA } from "@/components/pm/pm-helpers";

// ============================================================
// PROJECT MANAGER — Application Details (read-only)
// Comprehensive view of a single application across all 7 tabs.
// ============================================================

export function PmApplicationDetails() {
  const app = useSelectedApplication();
  const { navigate, openApplication } = useAppStore();

  if (!app) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="pm-applications" />
        <PageHeader
          title="Application Details"
          icon={FileText}
          breadcrumbs={[
            { label: "PM", onClick: () => navigate("pm-dashboard") },
            { label: "Applications", onClick: () => navigate("pm-applications") },
            { label: "Application" },
          ]}
        />
        <EmptyState
          icon={FileText}
          title="No application selected"
          description="Go to Applications and pick one to view its full monitoring details."
          action={
            <Button size="sm" onClick={() => navigate("pm-applications")}>
              Go to Applications <ArrowRight className="size-4" />
            </Button>
          }
        />
      </div>
    );
  }

  const sla = computeSLA(app);

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-applications" />
      <PageHeader
        title={app.applicationNo}
        description={app.project.name}
        icon={FileText}
        breadcrumbs={[
          { label: "PM", onClick: () => navigate("pm-dashboard") },
          { label: "Applications", onClick: () => navigate("pm-applications") },
          { label: app.applicationNo },
        ]}
        badge={<StatusBadge status={app.status} />}
      />

      {/* Application Context — compact summary card */}
      <ApplicationContextCard app={app} slaLabel={sla.label} slaCls={sla.cls} />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <Info className="size-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-1.5">
            <WorkflowIcon className="size-3.5" /> Workflow
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FolderClosed className="size-3.5" /> Documents
          </TabsTrigger>
          <TabsTrigger value="drawings" className="gap-1.5">
            <Upload className="size-3.5" /> Drawings
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-1.5">
            <ReceiptIndianRupee className="size-3.5" /> Fees &amp; Payments
          </TabsTrigger>
          <TabsTrigger value="shortfalls" className="gap-1.5">
            <AlertTriangle className="size-3.5" /> Shortfalls
            {app.shortfalls.length > 0 && (
              <Badge className="ml-1 bg-warning text-warning-foreground text-[9px]">
                {app.shortfalls.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <History className="size-3.5" /> Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab app={app} slaLabel={sla.label} slaCls={sla.cls} />
        </TabsContent>
        <TabsContent value="workflow" className="space-y-6">
          <WorkflowTab app={app} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-6">
          <DocumentsTab app={app} />
        </TabsContent>
        <TabsContent value="drawings" className="space-y-6">
          <DrawingsTab app={app} />
        </TabsContent>
        <TabsContent value="fees" className="space-y-6">
          <FeesTab app={app} />
        </TabsContent>
        <TabsContent value="shortfalls" className="space-y-6">
          <ShortfallsTab app={app} />
        </TabsContent>
        <TabsContent value="activity" className="space-y-6">
          <ActivityTab app={app} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Application Context Card ----------
function ApplicationContextCard({
  app,
  slaLabel,
  slaCls,
}: {
  app: Application;
  slaLabel: string;
  slaCls: string;
}) {
  return (
    <SectionCard title="Application Context" icon={FileText}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ContextItem label="Application No." value={app.applicationNo} mono />
        <ContextItem label="Project" value={app.project.name} />
        <ContextItem label="Applicant" value={app.applicant.name} />
        <ContextItem
          label="Type"
          value={app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
        />
        <ContextItem
          label="Property Type"
          value={app.project.propertyType.replace("_", " ").toLowerCase()}
        />
        <ContextItem label="Current Stage" value={app.currentStageLabel} />
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <div className="pt-0.5">
            <StatusBadge status={app.status} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Progress
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Progress value={app.progress} className="h-1.5 flex-1" />
            <span className="text-xs font-semibold tabular-nums">{app.progress}%</span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={app.priority} />
          <span className="text-muted-foreground">Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">SLA:</span>
          <Badge className={slaCls}>{slaLabel}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Last Updated:</span>
          <span className="font-medium">{timeAgo(app.lastUpdated)}</span>
        </div>
      </div>
    </SectionCard>
  );
}

function ContextItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

// ---------- Overview Tab ----------
function OverviewTab({
  app,
  slaLabel,
  slaCls,
}: {
  app: Application;
  slaLabel: string;
  slaCls: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SectionCard title="Application Information" icon={FileText}>
          <InfoGrid
            items={[
              { label: "Application No.", value: app.applicationNo, mono: true },
              { label: "Submission Date", value: formatDate(app.submissionDate) },
              { label: "Last Updated", value: formatDateTime(app.lastUpdated) },
              { label: "Expected SLA", value: app.expectedSLA ? formatDate(app.expectedSLA) : "—" },
              { label: "Application Type", value: app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) },
              { label: "LTP", value: app.ltpName },
            ]}
            columns={2}
          />
        </SectionCard>

        <SectionCard title="Property Information" icon={MapPin}>
          <InfoGrid
            items={[
              { label: "Plot Area", value: `${app.project.plotArea.toLocaleString("en-IN")} sq.m` },
              { label: "Built-up Area", value: `${app.project.builtUpArea.toLocaleString("en-IN")} sq.m` },
              { label: "Land Use", value: app.project.landUse },
              { label: "Ward", value: app.project.ward },
              { label: "Zone", value: app.project.zone },
              { label: "Survey No.", value: app.project.surveyNo, mono: true },
              { label: "Site Address", value: app.project.address },
              { label: "Property Type", value: app.project.propertyType.replace("_", " ").toLowerCase() },
            ]}
            columns={2}
          />
        </SectionCard>

        <SectionCard title="Applicant Information" icon={User}>
          <InfoGrid
            items={[
              { label: "Applicant Name", value: app.applicant.name },
              { label: "Contact", value: app.applicant.contact, mono: true },
              { label: "Email", value: app.applicant.email },
              { label: "Address", value: app.applicant.address },
            ]}
            columns={2}
          />
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Current Status" icon={Info}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <StatusBadge status={app.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Stage</span>
              <span className="text-xs font-medium">{app.currentStageLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Priority</span>
              <PriorityBadge priority={app.priority} />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">{app.progress}%</span>
              </div>
              <Progress value={app.progress} className="h-1.5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Assigned Officer" icon={ShieldCheck}>
          {app.assignedOfficer ? (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {app.assignedOfficer.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">
                  {app.assignedOfficer.name}
                </p>
                <RoleBadge role={app.assignedOfficer.role} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unassigned</p>
          )}
          {app.assignedAt && (
            <p className="mt-3 text-[10px] text-muted-foreground">
              Assigned on {formatDate(app.assignedAt)}
            </p>
          )}
        </SectionCard>

        <SectionCard title="SLA" icon={Clock}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge className={slaCls}>{slaLabel}</Badge>
            </div>
            <InfoRow label="Expected SLA" value={app.expectedSLA ? formatDate(app.expectedSLA) : "—"} />
            <InfoRow label="Last Updated" value={timeAgo(app.lastUpdated)} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ---------- Workflow Tab ----------
function WorkflowTab({ app }: { app: Application }) {
  const currentStageOrder = getStage(app.currentStage)?.order ?? 0;
  const isCompleted = app.status === "APPROVED" || app.status === "REJECTED";

  // Determine the stepper status
  const stepperStatus: "COMPLETED" | "CURRENT" | "FAILED" | "RETURNED" | "SHORTFALL" =
    app.status === "APPROVED"
      ? "COMPLETED"
      : app.status === "SCRUTINY_FAILED" || app.status === "DRAWING_REUPLOAD_REQUIRED"
      ? "FAILED"
      : app.status === "SHORTFALL_RAISED"
      ? "SHORTFALL"
      : app.status === "RETURNED"
      ? "RETURNED"
      : "CURRENT";

  return (
    <div className="space-y-6">
      <SectionCard
        title="Approval Workflow"
        description="Multi-level approval pipeline (read-only)"
        icon={WorkflowIcon}
      >
        <WorkflowStepper currentStage={app.currentStage} status={stepperStatus} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Submitted:</span>
            <span className="font-medium">{formatDate(app.submissionDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Expected SLA:</span>
            <span className="font-medium">{app.expectedSLA ? formatDate(app.expectedSLA) : "—"}</span>
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
      </SectionCard>

      <SectionCard
        title="Stage-by-Stage Status"
        description="Per-stage completion based on the current workflow position"
        icon={Flag}
        noPadding
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <TableHead className="px-4 py-2.5 font-bold">#</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Stage</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Responsible Role</TableHead>
                <TableHead className="px-4 py-2.5 font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WORKFLOW_STAGES.map((stage, idx) => {
                let stageState: WorkflowHistoryEntry["status"];
                if (isCompleted) {
                  stageState = "COMPLETED";
                } else if (stage.order < currentStageOrder) {
                  stageState = "COMPLETED";
                } else if (stage.order === currentStageOrder) {
                  stageState = stepperStatus === "COMPLETED" ? "CURRENT" : stepperStatus;
                } else {
                  stageState = "PENDING";
                }
                return (
                  <TableRow key={stage.key} className="hover:bg-muted/30">
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <p className="text-xs font-medium">{stage.label}</p>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <RoleBadge role={stage.role} />
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <StageStatusPill status={stageState} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard
        title="Workflow Timeline"
        description="Chronological record of stage transitions"
        icon={WorkflowIcon}
      >
        {app.workflowHistory.length > 0 ? (
          <WorkflowTimeline entries={app.workflowHistory} />
        ) : (
          <EmptyState
            icon={WorkflowIcon}
            title="No workflow events yet"
            description="Workflow events will appear here once officers begin processing this application."
          />
        )}
      </SectionCard>
    </div>
  );
}

// ---------- Documents Tab ----------
function DocumentsTab({ app }: { app: Application }) {
  if (app.documents.length === 0) {
    return (
      <EmptyState
        icon={FolderClosed}
        title="No documents"
        description="This application has no document records yet."
      />
    );
  }
  return (
    <SectionCard
      title="Documents"
      description="Read-only document register"
      icon={FolderClosed}
      noPadding
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <TableHead className="px-4 py-2.5 font-bold">Document</TableHead>
              <TableHead className="px-4 py-2.5 font-bold">Required</TableHead>
              <TableHead className="px-4 py-2.5 font-bold">Status</TableHead>
              <TableHead className="px-4 py-2.5 font-bold">Version</TableHead>
              <TableHead className="px-4 py-2.5 font-bold">Uploaded By</TableHead>
              <TableHead className="px-4 py-2.5 font-bold">Uploaded Date</TableHead>
              <TableHead className="px-4 py-2.5 font-bold">Reviewed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {app.documents.map((d) => (
              <TableRow key={d.id} className="hover:bg-muted/30">
                <TableCell className="px-4 py-3">
                  <p className="text-xs font-medium">{d.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{d.code}</p>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {d.required ? (
                    <Badge className="bg-destructive/10 text-destructive text-[9px]">Required</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px]">Optional</Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DocumentStatusBadge status={d.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-xs">
                  {d.version ? `v${d.version}` : "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-xs">{d.uploadedBy ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                  {d.uploadedAt ? formatDate(d.uploadedAt) : "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-xs">
                  {d.reviewedBy ?? d.verifiedBy ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}

// ---------- Drawings Tab ----------
function DrawingsTab({ app }: { app: Application }) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Drawings"
        description="Read-only drawing register"
        icon={Upload}
        noPadding
      >
        {app.drawings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <TableHead className="px-4 py-2.5 font-bold">File Name</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Version</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Uploaded</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {app.drawings.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/30">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{d.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {d.fileType} · {d.fileSize}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs">v{d.version}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(d.uploadedAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <DrawingStatusBadge status={d.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Upload}
              title="No drawings uploaded"
              description="Drawings will appear here once the LTP uploads them."
            />
          </div>
        )}
      </SectionCard>

      {app.scrutinyReport && (
        <SectionCard
          title="Scrutiny Report"
          description={`${app.scrutinyReport.reportNo} · v${app.scrutinyReport.drawingVersion}`}
          icon={ScrollText}
          action={
            app.scrutinyReport.status === "PASSED" ? (
              <Badge className="bg-success text-success-foreground">Passed</Badge>
            ) : app.scrutinyReport.status === "PASSED_WITH_WARNINGS" ? (
              <Badge className="bg-warning text-warning-foreground">Warnings</Badge>
            ) : (
              <Badge className="bg-destructive text-white">Failed</Badge>
            )
          }
        >
          <div className="space-y-4">
            <div
              className={
                "rounded-lg border p-3 text-sm " +
                (app.scrutinyReport.status === "PASSED"
                  ? "border-success/30 bg-success/5 text-success"
                  : app.scrutinyReport.status === "PASSED_WITH_WARNINGS"
                  ? "border-warning/30 bg-warning/5 text-warning-foreground"
                  : "border-destructive/30 bg-destructive/5 text-destructive")
              }
            >
              <p className="font-medium">{app.scrutinyReport.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ScrutinyStat
                label="Total Checks"
                value={app.scrutinyReport.totalChecks}
                cls="bg-muted text-muted-foreground"
              />
              <ScrutinyStat
                label="Passed"
                value={app.scrutinyReport.passed}
                cls="bg-success/10 text-success"
              />
              <ScrutinyStat
                label="Failed"
                value={app.scrutinyReport.failed}
                cls="bg-destructive/10 text-destructive"
              />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Generated at {formatDateTime(app.scrutinyReport.generatedAt)} · {app.scrutinyReport.warnings} warning(s)
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function DrawingStatusBadge({
  status,
}: {
  status: "PENDING_SCRUTINY" | "SCRUTINY_IN_PROGRESS" | "SCRUTINY_PASSED" | "SCRUTINY_FAILED" | "SUPERSEDED";
}) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING_SCRUTINY: { label: "Pending", cls: "bg-muted text-muted-foreground border-border" },
    SCRUTINY_IN_PROGRESS: { label: "In Progress", cls: "bg-info/10 text-info border-info/30" },
    SCRUTINY_PASSED: { label: "Passed", cls: "bg-success/10 text-success border-success/30" },
    SCRUTINY_FAILED: { label: "Failed", cls: "bg-destructive/10 text-destructive border-destructive/30" },
    SUPERSEDED: { label: "Superseded", cls: "bg-muted text-muted-foreground border-border" },
  };
  const cfg = map[status];
  return (
    <Badge variant="outline" className={cfg.cls}>
      {cfg.label}
    </Badge>
  );
}

function ScrutinyStat({
  label,
  value,
  cls,
}: {
  label: string;
  value: string | number;
  cls: string;
}) {
  return (
    <div className={"rounded-lg p-3 text-center " + cls}>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

// ---------- Fees & Payments Tab ----------
function FeesTab({ app }: { app: Application }) {
  if (!app.fee) {
    return (
      <EmptyState
        icon={ReceiptIndianRupee}
        title="Fees not generated"
        description="Fees will be generated automatically once all required documents are verified."
      />
    );
  }
  const f = app.fee;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard
          title="Fee Breakdown"
          description={`${f.feeStructureName} · generated ${formatDate(f.generatedAt)}`}
          icon={ReceiptIndianRupee}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs uppercase tracking-wide text-muted-foreground">
              <span>Component</span>
              <span>Amount (₹)</span>
            </div>
            {f.lineItems.map((li) => (
              <div
                key={li.componentCode}
                className="flex items-center justify-between py-2.5 border-b border-dashed border-border/60 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{li.name}</p>
                  <p className="text-[11px] text-muted-foreground">{li.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {li.basis} · ₹{li.rate.toLocaleString("en-IN")} × {li.quantity.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums">
                  {li.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono tabular-nums">{formatINR(f.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span className="font-mono tabular-nums">{formatINR(f.totalGST)}</span>
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
        <SectionCard title="Payment Summary" icon={CheckCircle2}>
          <div className="space-y-3">
            <InfoRow label="Total Fee" value={formatINR(f.total)} />
            <InfoRow label="Subtotal" value={formatINR(f.subtotal)} />
            <InfoRow label="GST" value={formatINR(f.totalGST)} />
            <Separator />
            <InfoRow label="Paid" value={<span className="text-success">{formatINR(f.paidAmount)}</span>} />
            <InfoRow
              label="Outstanding"
              value={
                <span className={f.outstanding > 0 ? "text-destructive font-semibold" : "text-success"}>
                  {formatINR(f.outstanding)}
                </span>
              }
            />
          </div>
        </SectionCard>

        {app.payment && (
          <SectionCard title="Payment Record" icon={ReceiptIndianRupee}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <PaymentStatusBadge status={app.payment.status} />
              </div>
              <InfoRow label="Method" value={app.payment.method} />
              <InfoRow label="Gateway" value={app.payment.gateway} />
              <InfoRow label="Transaction ID" value={app.payment.transactionId} mono />
              <InfoRow label="Reference No." value={app.payment.referenceNo} mono />
              {app.payment.receiptNo && (
                <InfoRow label="Receipt No." value={app.payment.receiptNo} mono />
              )}
              {app.payment.initiatedAt && (
                <InfoRow label="Initiated" value={formatDateTime(app.payment.initiatedAt)} />
              )}
              {app.payment.completedAt && (
                <InfoRow label="Completed" value={formatDateTime(app.payment.completedAt)} />
              )}
              <Separator />
              <InfoRow
                label="Amount"
                value={<span className="font-semibold">{formatINR(app.payment.amount)}</span>}
              />
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ---------- Shortfalls Tab ----------
function ShortfallsTab({ app }: { app: Application }) {
  if (app.shortfalls.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No shortfalls"
        description="There are no shortfalls raised on this application."
      />
    );
  }
  return (
    <div className="space-y-4">
      {app.shortfalls.map((s) => (
        <SectionCard
          key={s.id}
          title={s.title}
          icon={AlertTriangle}
          action={
            <div className="flex items-center gap-2">
              <ShortfallTypeBadge type={s.type} />
              <Badge className="bg-muted text-muted-foreground font-mono text-[10px]">
                {s.shortfallId}
              </Badge>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground/90">{s.description}</p>
            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="pt-1">
                  <ShortfallStatusBadge status={s.status} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Raised By</p>
                <p className="font-medium">{s.raisedBy.name}</p>
                <div className="pt-1">
                  <RoleBadge role={s.raisedBy.role} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Raised On</p>
                <p className="font-medium">{formatDate(s.raisedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium text-destructive">{formatDate(s.dueDate)}</p>
              </div>
            </div>
            {s.response && (
              <div className="rounded-md border border-info/30 bg-info/5 p-3 text-xs">
                <p className="font-medium text-info">Response</p>
                <p className="mt-1 text-foreground/80">{s.response.text}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Responded on {formatDate(s.response.respondedAt)}
                </p>
              </div>
            )}
            {s.resolution && (
              <div className="rounded-md border border-success/30 bg-success/5 p-3 text-xs">
                <p className="font-medium text-success">Resolution</p>
                <p className="mt-1 text-foreground/80">{s.resolution}</p>
                {s.resolvedAt && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Resolved on {formatDate(s.resolvedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

// ---------- Activity Tab ----------
function ActivityTab({ app }: { app: Application }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard
          title="Audit Trail"
          description="Complete chronological record of all actions"
          icon={History}
        >
          {app.auditLog.length > 0 ? (
            <AuditTimeline entries={app.auditLog} />
          ) : (
            <EmptyState
              icon={History}
              title="No audit events"
              description="Audit events will appear here as the application progresses."
            />
          )}
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Compliance Metadata" icon={ShieldCheck}>
          <div className="space-y-2">
            <InfoRow label="Total Events" value={app.auditLog.length} />
            <InfoRow
              label="First Event"
              value={app.auditLog[0] ? formatDateTime(app.auditLog[0].timestamp) : "—"}
            />
            <InfoRow
              label="Last Event"
              value={
                app.auditLog.length > 0
                  ? formatDateTime(app.auditLog[app.auditLog.length - 1].timestamp)
                  : "—"
              }
            />
            <Separator />
            <InfoRow label="Data Retention" value="7 years" />
            <InfoRow
              label="Integrity"
              value={<Badge className="bg-success/10 text-success">Verified</Badge>}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
