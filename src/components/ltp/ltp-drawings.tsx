"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication, useVisibleApplications } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  InfoGrid,
} from "@/components/design-system/layout";
import { PageBackButton, PageBreadcrumb, type BreadcrumbItem } from "@/components/design-system/back-button";
import { ApplicationContextBar, ApplicationSelector } from "@/components/design-system/app-context";
import {
  StatusBadge,
  SeverityBadge,
  PriorityBadge,
} from "@/components/design-system/badges";
import {
  WorkflowStepper,
  formatDateTime,
  formatDate,
} from "@/components/design-system/workflow";
import {
  DrawingViewer,
  FileUploader,
  type UploadedFile,
} from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Eye,
  ScrollText,
  History,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RotateCw,
  Layers,
  FileWarning,
  Play,
  ArrowRight,
  Info,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";

function useAppOrDefault(): Application | null {
  const sel = useSelectedApplication();
  const apps = useVisibleApplications();
  if (sel) return sel;
  return apps.find((a) => a.drawings.length > 0) ?? apps[0] ?? null;
}

// ============================================================
// DRAWINGS PAGE
// ============================================================
export function LtpDrawings() {
  const { navigate, openApplication, uploadDrawing, reuploadDrawing, runScrutiny } = useAppStore();
  const visibleApps = useVisibleApplications();
  const processingAppIds = useAppStore((s) => s.processingAppIds);
  const app = useAppOrDefault();
  const { toast } = useToast();
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [confirmUpload, setConfirmUpload] = React.useState<UploadedFile | null>(null);

  const isProcessing = app ? processingAppIds.includes(app.id) : false;

  if (!app) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="ltp-applications" fallbackLabel="Applications" />
        <PageHeader title="Drawings & Scrutiny" icon={Upload} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Drawings" }]} />
        <EmptyState icon={FileWarning} title="No applications" description="Create an application first to upload drawings." action={<Button size="sm" onClick={() => navigate("ltp-applications")}>Go to My Applications</Button>} />
      </div>
    );
  }

  function handleUpload(newFiles: UploadedFile[]) {
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [f.id, f]));
      newFiles.forEach((f) => map.set(f.id, f));
      return Array.from(map.values());
    });
    // Show confirmation dialog for the first file
    const first = newFiles[0];
    if (first && first.status === "done") {
      setConfirmUpload(first);
    }
  }

  function confirmAndUpload() {
    if (!app || !confirmUpload) return;
    uploadDrawing(app.id, confirmUpload.name, confirmUpload.size || `${(5 + Math.random() * 3).toFixed(1)} MB`);
    toast({
      title: "Drawing uploaded successfully",
      description: `${confirmUpload.name} → ${app.applicationNo}`,
    });
    setConfirmUpload(null);
  }

  function handleRunScrutiny() {
    if (!app) return;
    runScrutiny(app.id);
    toast({
      title: "Scrutiny started",
      description: `Auto-scrutiny running for ${app.applicationNo}.`,
    });
  }

  function handleReupload() {
    if (!app) return;
    const fileName = `Drawing_v${app.drawings.length + 1}_corrected.dwg`;
    const fileSize = `${(5 + Math.random() * 3).toFixed(1)} MB`;
    reuploadDrawing(app.id, fileName, fileSize);
    toast({
      title: "Drawing re-uploaded",
      description: `${fileName} → ${app.applicationNo}. New version created.`,
    });
    setTimeout(() => runScrutiny(app.id), 400);
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-applications" fallbackLabel="Applications" />
      <PageHeader
        title="Drawings & Scrutiny"
        description="Upload, version and scrutinise your project drawings against Development Control Regulations."
        icon={Upload}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Drawings & Scrutiny" }]}
        actions={<ApplicationSelector currentApp={app} view="ltp-drawings" apps={visibleApps} />}
      />

      {/* Application Context Bar */}
      <ApplicationContextBar app={app} />

      {/* Status banner */}
      <DrawingStatusBanner app={app} onScrutinize={handleRunScrutiny} onReupload={handleReupload} scrutinizing={isProcessing} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Drawing Viewer"
            description={app.drawings.length > 0 ? `Viewing ${app.drawings[app.drawings.length - 1]?.fileName}` : "No drawings yet"}
            icon={Eye}
          >
            <DrawingViewer drawings={app.drawings.length ? app.drawings : [{ id: "empty", fileName: "No drawing", fileType: "PDF", fileSize: "0", version: 0, uploadedAt: "", uploadedBy: "", status: "PENDING_SCRUTINY" }]} />
          </SectionCard>

          {app.scrutinyReport && (
            <SectionCard
              title="Latest Scrutiny Report"
              description={`${app.scrutinyReport.reportNo} · v${app.scrutinyReport.drawingVersion} · ${app.applicationNo}`}
              icon={ScrollText}
              action={
                <div className="flex items-center gap-2">
                  {app.scrutinyReport.status === "PASSED" ? <Badge className="bg-success text-success-foreground">Passed</Badge> : <Badge className="bg-destructive text-white">Failed</Badge>}
                  <Button variant="outline" size="sm" onClick={() => navigate("ltp-scrutiny")}>Full report <ArrowRight className="size-3" /></Button>
                </div>
              }
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center"><p className="text-xl font-semibold tabular-nums">{app.scrutinyReport.totalChecks}</p><p className="text-[10px] uppercase text-muted-foreground">Total</p></div>
                <div className="rounded-lg bg-success/10 p-3 text-center text-success"><p className="text-xl font-semibold tabular-nums">{app.scrutinyReport.passed}</p><p className="text-[10px] uppercase">Passed</p></div>
                <div className="rounded-lg bg-destructive/10 p-3 text-center text-destructive"><p className="text-xl font-semibold tabular-nums">{app.scrutinyReport.failed + app.scrutinyReport.warnings}</p><p className="text-[10px] uppercase">Issues</p></div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <SectionCard title="Upload Drawing" description={`For: ${app.applicationNo}`} icon={Upload}>
            <div className="mb-3 rounded-md border border-info/30 bg-info/5 px-3 py-2 text-[11px] text-info">
              <p className="font-medium">You are uploading to:</p>
              <p className="font-mono">{app.applicationNo}</p>
              <p>{app.project.name}</p>
            </div>
            <FileUploader
              label="Drop drawing here"
              hint="Supported: DWG, DXF, PDF · max 50 MB"
              accept=".dwg,.dxf,.pdf"
              uploadedFiles={files}
              onUpload={handleUpload}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
            {app.drawings.length > 0 && app.status !== "SCRUTINY_PASSED" && (
              <Button className="mt-3 w-full" onClick={handleRunScrutiny} disabled={isProcessing}>
                {isProcessing ? (<><RotateCw className="size-4 animate-spin" /> Running scrutiny…</>) : (<><Play className="size-4" /> Run Auto-Scrutiny</>)}
              </Button>
            )}
          </SectionCard>

          <SectionCard title="Version History" description={`Drawings for ${app.applicationNo}`} icon={History} noPadding>
            <ul className="divide-y divide-border">
              {app.drawings.map((d) => (
                <li key={d.id} className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><FileText className="size-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{d.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">{d.fileSize} · v{d.version} · {formatDateTime(d.uploadedAt)}</p>
                    </div>
                    {d.status === "SCRUTINY_PASSED" && <Badge className="bg-success/10 text-success text-[9px]">Passed</Badge>}
                    {d.status === "SCRUTINY_FAILED" && <Badge className="bg-destructive/10 text-destructive text-[9px]">Failed</Badge>}
                    {d.status === "SUPERSEDED" && <Badge className="bg-muted text-muted-foreground text-[9px]">Superseded</Badge>}
                    {d.status === "PENDING_SCRUTINY" && <Badge className="bg-info/10 text-info text-[9px]">Pending</Badge>}
                    {d.status === "SCRUTINY_IN_PROGRESS" && <Badge className="bg-info/10 text-info text-[9px]">In Progress</Badge>}
                  </div>
                  {d.notes && <p className="mt-1.5 text-[10px] text-muted-foreground italic">{d.notes}</p>}
                </li>
              ))}
              {app.drawings.length === 0 && (
                <li className="p-6 text-center text-xs text-muted-foreground">No drawings uploaded yet.</li>
              )}
            </ul>
          </SectionCard>
        </div>
      </div>

      {/* Upload Confirmation Dialog */}
      <Dialog open={!!confirmUpload} onOpenChange={(o) => !o && setConfirmUpload(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Drawing</DialogTitle>
            <DialogDescription>Confirm the upload details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application:</span>
              <span className="font-mono font-medium text-primary">{app.applicationNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium">{app.project.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">File:</span>
              <span className="font-medium">{confirmUpload?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{confirmUpload?.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">v{app.drawings.length + 1}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUpload(null)}>Cancel</Button>
            <Button onClick={confirmAndUpload}>
              <Upload className="size-4" /> Upload Drawing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DrawingStatusBanner({ app, onScrutinize, onReupload, scrutinizing }: { app: Application; onScrutinize: () => void; onReupload: () => void; scrutinizing: boolean }) {
  if (scrutinizing || app.status === "SCRUTINY_IN_PROGRESS") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-info/30 bg-info/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"><RotateCw className="size-5 animate-spin" /></div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-info">Auto-Scrutiny In Progress</p>
            <p className="text-xs text-info/80">Validating drawing against Development Control Regulations for {app.applicationNo}. This takes a few seconds…</p>
          </div>
        </div>
      </div>
    );
  }
  const failed = app.status === "SCRUTINY_FAILED" || app.status === "DRAWING_REUPLOAD_REQUIRED";
  if (failed) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><XCircle className="size-5" /></div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-destructive">Scrutiny Failed — Re-upload Required</p>
            <p className="text-xs text-destructive/80">{app.scrutinyReport?.summary ?? "Critical non-compliances were identified. Please re-upload a corrected drawing."}</p>
            <p className="text-[10px] text-destructive/60 font-mono">Re-uploading for: {app.applicationNo}</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={onReupload} disabled={scrutinizing}>
          {scrutinizing ? <><RotateCw className="size-4 animate-spin" /> Processing…</> : <><Upload className="size-4" /> Re-upload Drawing</>}
        </Button>
      </div>
    );
  }
  if (app.scrutinyReport?.status === "PASSED" || app.status === "SCRUTINY_PASSED") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-success/30 bg-success/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"><CheckCircle2 className="size-5" /></div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-success">Scrutiny Passed</p>
            <p className="text-xs text-success/80">{app.scrutinyReport?.summary ?? "Drawing complies with all critical and major DCR checks."}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-success/30" onClick={() => useAppStore.getState().navigate("ltp-documents")}>Proceed to documents <ArrowRight className="size-4" /></Button>
      </div>
    );
  }
  if (app.drawings.length > 0) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-info/30 bg-info/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"><Info className="size-5" /></div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-info">Drawing Uploaded — Run Scrutiny</p>
            <p className="text-xs text-info/80">Run auto-scrutiny to validate the drawing against DCR rules for {app.applicationNo}.</p>
          </div>
        </div>
        <Button size="sm" onClick={onScrutinize} disabled={scrutinizing}>
          {scrutinizing ? <><RotateCw className="size-4 animate-spin" /> Processing…</> : <><Play className="size-4" /> Run Scrutiny</>}
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-info/30 bg-info/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"><Info className="size-5" /></div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-info">Awaiting Drawing Upload</p>
          <p className="text-xs text-info/80">Upload a drawing for {app.applicationNo} to begin automated scrutiny against DCR rules.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCRUTINY DASHBOARD PAGE
// ============================================================
export function LtpScrutiny() {
  const { navigate, openApplication } = useAppStore();
  const visibleApps = useVisibleApplications();
  const app = useAppOrDefault();

  if (!app || !app.scrutinyReport) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="ltp-drawings" fallbackLabel="Drawings" />
        <PageHeader title="Scrutiny Report" icon={ScrollText} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Scrutiny" }]} />
        <EmptyState icon={ScrollText} title="No scrutiny report" description="Run scrutiny on a drawing to generate a report." />
      </div>
    );
  }

  const r = app.scrutinyReport;
  const drawing = app.drawings.find((d) => d.version === r.drawingVersion);

  // Derive all values from the checks array
  const totalChecks = r.checks.length;
  const passedCount = r.checks.filter((c) => c.status === "PASS").length;
  const failedCount = r.checks.filter((c) => c.status === "FAIL").length;
  const warningCount = r.checks.filter((c) => c.status === "WARNING").length;

  // Severity distribution — only Critical, Major, Minor (NOT Warning, NOT Passed)
  const severityCounts = {
    CRITICAL: r.checks.filter((c) => c.severity === "CRITICAL").length,
    MAJOR: r.checks.filter((c) => c.severity === "MAJOR").length,
    MINOR: r.checks.filter((c) => c.severity === "MINOR").length,
  };

  // Category summary
  const grouped = r.checks.reduce((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {} as Record<string, typeof r.checks>);

  // Overall status display
  const statusConfig = {
    PASSED: { label: "Scrutiny Passed", cls: "border-success/30 bg-success/5", iconCls: "bg-success/10 text-success", badge: "bg-success text-success-foreground", Icon: CheckCircle2 },
    PASSED_WITH_WARNINGS: { label: "Passed with Warnings", cls: "border-amber-500/30 bg-amber-500/5", iconCls: "bg-amber-500/10 text-amber-600", badge: "bg-amber-500 text-white", Icon: AlertTriangle },
    FAILED: { label: "Scrutiny Failed", cls: "border-destructive/30 bg-destructive/5", iconCls: "bg-destructive/10 text-destructive", badge: "bg-destructive text-white", Icon: XCircle },
  };
  const sCfg = statusConfig[r.status];
  const SIcon = sCfg.Icon;

  return (
    <div className="space-y-6">
      {/* Compact breadcrumb navigation */}
      <PageBreadcrumb
        items={[
          { label: "My Applications", view: "ltp-applications" },
          { label: app.applicationNo, applicationId: app.id, view: "ltp-application-details" },
          { label: "Drawings & Scrutiny", applicationId: app.id, view: "ltp-drawings" },
          { label: "Scrutiny Report" },
        ]}
      />

      <PageHeader
        title="Scrutiny Report"
        description={r.reportNo}
        icon={ScrollText}
        actions={<ApplicationSelector currentApp={app} view="ltp-scrutiny" apps={visibleApps} />}
      />

      {/* Application Context Bar */}
      <ApplicationContextBar app={app} />

      {/* Report summary header */}
      <div className={cn("rounded-xl border p-5", sCfg.cls)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-12 items-center justify-center rounded-xl", sCfg.iconCls)}>
              <SIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{r.reportNo}</p>
                <Badge className={sCfg.badge}>{sCfg.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Drawing: {drawing?.fileName ?? `v${r.drawingVersion}`} · Version v{r.drawingVersion} · Generated {formatDateTime(r.generatedAt)}
              </p>
              <p className="text-sm">{r.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="size-4" /> Download PDF</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("ltp-drawings")}>
              <Eye className="size-4" /> View Drawing
            </Button>
            {r.status === "FAILED" && <Button size="sm" onClick={() => navigate("ltp-drawings")}><Upload className="size-4" /> Re-upload</Button>}
          </div>
        </div>
      </div>

      {/* KPI cards — Total / Passed / Failed / Warnings */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScrutinyStatCard label="Total Checks" value={totalChecks} icon={Layers} cls="bg-muted text-muted-foreground" />
        <ScrutinyStatCard label="Passed" value={passedCount} icon={CheckCircle2} cls="bg-success/10 text-success" />
        <ScrutinyStatCard label="Failed" value={failedCount} icon={XCircle} cls="bg-destructive/10 text-destructive" />
        <ScrutinyStatCard label="Warnings" value={warningCount} icon={AlertTriangle} cls="bg-amber-500/15 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main: Detailed Checks */}
        <div className="min-w-0 space-y-6">
          <SectionCard title="Detailed Checks" description={`${totalChecks} checks evaluated`} icon={ScrollText} noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                  <col className="w-[24%]" />
                  <col className="w-[24%]" />
                </colgroup>
                <thead className="bg-muted/40">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Rule</th>
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 font-medium text-center">Severity</th>
                    <th className="px-4 py-2.5 font-medium text-center">Result</th>
                    <th className="px-4 py-2.5 font-medium">Observation</th>
                    <th className="px-4 py-2.5 font-medium">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {r.checks.map((c) => (
                    <tr key={c.id} className={cn("hover:bg-muted/30 h-14", c.status === "FAIL" && "bg-destructive/[0.02]")}>
                      <td className="px-4 py-2">
                        <p className="text-xs font-medium leading-tight">{c.rule}</p>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{c.category}</td>
                      <td className="px-4 py-2 text-center"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-4 py-2 text-center">
                        {c.status === "PASS" && <Badge className="bg-success/15 text-success">Pass</Badge>}
                        {c.status === "FAIL" && <Badge className="bg-destructive text-white">Fail</Badge>}
                        {c.status === "WARNING" && <Badge className="bg-amber-500 text-white">Warning</Badge>}
                      </td>
                      <td className="px-4 py-2 text-[11px] text-muted-foreground">{c.message}</td>
                      <td className="px-4 py-2 text-[11px] text-muted-foreground">{c.recommendation ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right rail: Result Summary + Severity Distribution + By Category */}
        <div className="space-y-6 min-w-0">
          {/* Result Summary */}
          <SectionCard title="Result Summary" icon={CheckCircle2}>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Passed</span>
                <Badge className="bg-success/10 text-success">{passedCount}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Warnings</span>
                <Badge className="bg-amber-500/15 text-amber-600">{warningCount}</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Failed</span>
                <Badge className="bg-destructive/10 text-destructive">{failedCount}</Badge>
              </li>
              <li className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Total</span>
                <Badge className="bg-muted text-muted-foreground">{totalChecks}</Badge>
              </li>
            </ul>
          </SectionCard>

          {/* Severity Distribution — only Critical, Major, Minor */}
          <SectionCard title="Severity Distribution" icon={AlertTriangle}>
            <ul className="space-y-2.5">
              {(["CRITICAL", "MAJOR", "MINOR"] as const).map((sev) => {
                const count = severityCounts[sev];
                const pct = totalChecks > 0 ? Math.round((count / totalChecks) * 100) : 0;
                return (
                  <li key={sev} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <SeverityBadge severity={sev} />
                      <span className="tabular-nums text-muted-foreground">{count} · {pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* By Category */}
          <SectionCard title="By Category" icon={Layers}>
            <ul className="space-y-2">
              {Object.entries(grouped).map(([cat, checks]) => {
                const catPassed = checks.filter((c) => c.status === "PASS").length;
                const catFailed = checks.filter((c) => c.status === "FAIL").length;
                const catWarn = checks.filter((c) => c.status === "WARNING").length;
                return (
                  <li key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted-foreground">{checks.length} checks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {catFailed > 0 && <Badge className="bg-destructive/10 text-destructive text-[9px]">{catFailed} fail</Badge>}
                      {catWarn > 0 && <Badge className="bg-amber-500/15 text-amber-600 text-[9px]">{catWarn} warn</Badge>}
                      {catFailed === 0 && catWarn === 0 && <Badge className="bg-success/10 text-success text-[9px]">all pass</Badge>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ScrutinyStatCard({ label, value, icon: Icon, cls }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className="flex items-center justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></div>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
