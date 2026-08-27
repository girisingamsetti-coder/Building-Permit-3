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
  // default to one with drawings
  return apps.find((a) => a.drawings.length > 0) ?? apps[0] ?? null;
}

function AppPicker({ apps, current }: { apps: Application[]; current: Application | null }) {
  const { openApplication } = useAppStore();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Application:</span>
      <select
        value={current?.id ?? ""}
        onChange={(e) => openApplication(e.target.value, "ltp-drawings")}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs font-mono"
      >
        {apps.map((a) => (
          <option key={a.id} value={a.id}>{a.applicationNo}</option>
        ))}
      </select>
    </div>
  );
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

  const isProcessing = app ? processingAppIds.includes(app.id) : false;

  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader title="Drawings & Scrutiny" icon={Upload} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Drawings" }]} />
        <EmptyState icon={FileWarning} title="No applications" description="Create an application first to upload drawings." action={<Button size="sm" onClick={() => navigate("ltp-create-application")}>New Application</Button>} />
      </div>
    );
  }

  function handleUpload(newFiles: UploadedFile[]) {
    // Track locally for the FileUploader UI
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [f.id, f]));
      newFiles.forEach((f) => map.set(f.id, f));
      return Array.from(map.values());
    });
    // Persist to store: upload first new file as next drawing version
    if (!app) return;
    const first = newFiles[0];
    if (!first) return;
    uploadDrawing(app.id, first.name, first.size || `${(5 + Math.random() * 3).toFixed(1)} MB`);
    toast({
      title: "Drawing uploaded",
      description: `${first.name} has been uploaded. Run auto-scrutiny to validate.`,
    });
  }

  function handleRunScrutiny() {
    if (!app) return;
    runScrutiny(app.id);
    toast({
      title: "Scrutiny started",
      description: "Auto-scrutiny is running. This takes a few seconds.",
    });
  }

  function handleReupload() {
    if (!app) return;
    // Simulate re-upload of a corrected drawing
    const fileName = `Drawing_v${app.drawings.length + 1}_corrected.dwg`;
    const fileSize = `${(5 + Math.random() * 3).toFixed(1)} MB`;
    reuploadDrawing(app.id, fileName, fileSize);
    toast({
      title: "Drawing re-uploaded",
      description: `${fileName} uploaded. Auto-scrutiny will run automatically.`,
    });
    // Store reuploadDrawing calls uploadDrawing which sets status to DRAWING_UPLOADED.
    // Trigger scrutiny explicitly after a short delay (matches demo deterministic v2+ pass)
    setTimeout(() => runScrutiny(app.id), 400);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drawings & Scrutiny"
        description="Upload, version and scrutinise your project drawings against Development Control Regulations."
        icon={Upload}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Drawings & Scrutiny" }]}
        actions={<AppPicker apps={visibleApps} current={app} />}
      />

      {/* Status banner */}
      <DrawingStatusBanner app={app} onScrutinize={handleRunScrutiny} onReupload={handleReupload} scrutinizing={isProcessing} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Drawing Viewer" description="Zoom, rotate, switch versions" icon={Eye}>
            <DrawingViewer drawings={app.drawings.length ? app.drawings : [{ id: "empty", fileName: "No drawing", fileType: "PDF", fileSize: "0", version: 0, uploadedAt: "", uploadedBy: "", status: "PENDING_SCRUTINY" }]} />
          </SectionCard>

          {app.scrutinyReport && (
            <SectionCard
              title="Latest Scrutiny Report"
              description={`${app.scrutinyReport.reportNo} · v${app.scrutinyReport.drawingVersion}`}
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
          <SectionCard title="Upload Drawing" description="DWG, DXF or PDF · max 50 MB" icon={Upload}>
            <FileUploader
              label="Drop drawing here"
              hint="Supported: DWG, DXF, PDF"
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

          <SectionCard title="Version History" icon={History} noPadding>
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
            <p className="text-xs text-info/80">Validating drawing against Development Control Regulations. This takes a few seconds…</p>
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
        <Button variant="outline" size="sm" className="border-success/30">Proceed to documents <ArrowRight className="size-4" /></Button>
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
            <p className="text-xs text-info/80">Run auto-scrutiny to validate the drawing against DCR rules.</p>
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
          <p className="text-xs text-info/80">Upload your drawing to begin automated scrutiny against DCR rules.</p>
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
        <PageHeader title="Scrutiny Report" icon={ScrollText} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Scrutiny" }]} />
        <EmptyState icon={ScrollText} title="No scrutiny report" description="Run scrutiny on a drawing to generate a report." />
      </div>
    );
  }
  const r = app.scrutinyReport;
  const grouped = r.checks.reduce((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {} as Record<string, typeof r.checks>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scrutiny Report"
        description="Automated validation of drawings against Development Control Regulations"
        icon={ScrollText}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Scrutiny Report" }]}
        actions={<AppPicker apps={visibleApps} current={app} />}
      />

      {/* Summary */}
      <div className={cn("rounded-xl border p-5", r.status === "PASSED" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-12 items-center justify-center rounded-xl", r.status === "PASSED" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {r.status === "PASSED" ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{r.reportNo}</p>
                {r.status === "PASSED" ? <Badge className="bg-success text-success-foreground">Passed</Badge> : <Badge className="bg-destructive text-white">Failed</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">Drawing v{r.drawingVersion} · Generated {formatDateTime(r.generatedAt)}</p>
              <p className="text-sm">{r.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="size-4" /> Download PDF</Button>
            {r.status === "FAILED" && <Button size="sm" onClick={() => navigate("ltp-drawings")}><Upload className="size-4" /> Re-upload</Button>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScrutinyStatCard label="Total Checks" value={r.totalChecks} icon={Layers} cls="bg-muted text-muted-foreground" />
        <ScrutinyStatCard label="Passed" value={r.passed} icon={CheckCircle2} cls="bg-success/10 text-success" />
        <ScrutinyStatCard label="Failed" value={r.failed} icon={XCircle} cls="bg-destructive/10 text-destructive" />
        <ScrutinyStatCard label="Warnings" value={r.warnings} icon={AlertTriangle} cls="bg-warning/15 text-warning-foreground" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Detailed Checks" description="Rule-by-rule validation results" icon={ScrollText} noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Rule</th>
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 font-medium">Severity</th>
                    <th className="px-4 py-2.5 font-medium">Result</th>
                    <th className="px-4 py-2.5 font-medium">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {r.checks.map((c) => (
                    <tr key={c.id} className={cn("hover:bg-muted/30", c.status === "FAIL" && "bg-destructive/[0.02]")}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{c.rule}</p>
                        <p className="text-[10px] text-muted-foreground">{c.message}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.category}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-4 py-3">
                        {c.status === "PASS" && <Badge className="bg-success/15 text-success">Pass</Badge>}
                        {c.status === "FAIL" && <Badge className="bg-destructive text-white">Fail</Badge>}
                        {c.status === "WARNING" && <Badge className="bg-warning text-warning-foreground">Warning</Badge>}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">{c.recommendation ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Severity Distribution" icon={AlertTriangle}>
            <ul className="space-y-2.5">
              {(["CRITICAL", "MAJOR", "MINOR", "WARNING", "PASSED"] as const).map((sev) => {
                const count = r.checks.filter((c) => c.severity === sev).length;
                const pct = Math.round((count / r.totalChecks) * 100);
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

          <SectionCard title="By Category" icon={Layers}>
            <ul className="space-y-2">
              {Object.entries(grouped).map(([cat, checks]) => {
                const fails = checks.filter((c) => c.status === "FAIL").length;
                return (
                  <li key={cat} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{cat}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">{checks.length} checks</span>
                      {fails > 0 ? <Badge className="bg-destructive/10 text-destructive text-[9px]">{fails} fail</Badge> : <Badge className="bg-success/10 text-success text-[9px]">all pass</Badge>}
                    </span>
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
