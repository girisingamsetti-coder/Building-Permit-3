"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication, useVisibleApplications } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import { ApplicationContextBar, ApplicationSelector, useAppSwitchLoading, AppSwitchSkeleton } from "@/components/design-system/app-context";
import {
  StatusBadge,
  DocumentStatusBadge,
} from "@/components/design-system/badges";
import { formatDate } from "@/components/design-system/workflow";
import {
  FileUploader,
  type UploadedFile,
} from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FolderClosed,
  Upload,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  Search,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, DocumentRecord } from "@/types";

function useAppOrDefault(): Application | null {
  const sel = useSelectedApplication();
  const apps = useVisibleApplications();
  return sel ?? apps.find((a) => a.documents.length > 0) ?? apps[0] ?? null;
}

export function LtpDocuments() {
  const { navigate, openApplication, uploadDocument } = useAppStore();
  const visibleApps = useVisibleApplications();
  const app = useAppOrDefault();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [selectedDocCode, setSelectedDocCode] = React.useState<string>("");
  const [confirmDoc, setConfirmDoc] = React.useState<DocumentRecord | null>(null);
  const switching = useAppSwitchLoading(app?.id);

  if (!app) {
    return (
      <div className="space-y-6">
        <PageBackButton fallbackView="ltp-applications" />
        <PageHeader title="Documents" icon={FolderClosed} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Documents" }]} />
        <EmptyState icon={FileWarning} title="No applications" />
      </div>
    );
  }

  function handleUploadDocument(doc: DocumentRecord) {
    setConfirmDoc(doc);
  }

  function confirmDocumentUpload() {
    if (!app || !confirmDoc) return;
    const fakeName = `${confirmDoc.code}_${Date.now().toString().slice(-6)}.pdf`;
    const fakeSize = `${(0.5 + Math.random() * 2).toFixed(1)} MB`;
    uploadDocument(app.id, confirmDoc.code, fakeName, fakeSize);
    toast({
      title: "Document uploaded successfully",
      description: `${confirmDoc.name} → ${app.applicationNo}`,
    });
    setConfirmDoc(null);
  }

  // ===== FIXED COUNTERS — derived from the selected application's documents =====
  const requiredDocs = app.documents.filter((d) => d.required);
  const optionalDocs = app.documents.filter((d) => !d.required);
  const verifiedDocs = requiredDocs.filter((d) => d.status === "VERIFIED");
  const pendingDocs = requiredDocs.filter((d) =>
    d.status === "REQUIRED" || d.status === "SHORTFALL" || d.status === "REJECTED"
  );
  const uploadedNotVerified = requiredDocs.filter((d) =>
    d.status === "UPLOADED" || d.status === "UNDER_REVIEW"
  );
  // Compliance = verified required / total required × 100
  const compliancePct = requiredDocs.length > 0
    ? Math.round((verifiedDocs.length / requiredDocs.length) * 1000) / 10
    : 0;

  const docs = app.documents.filter((d) => {
    if (query && !d.name.toLowerCase().includes(query.toLowerCase()) && !d.code.toLowerCase().includes(query.toLowerCase())) return false;
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-applications" />
      <PageHeader
        title="Documents"
        description="Upload, verify and track all required documents for your application."
        icon={FolderClosed}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Documents" }]}
        actions={<ApplicationSelector currentApp={app} view="ltp-documents" apps={visibleApps} />}
      />

      {switching ? (
        <AppSwitchSkeleton />
      ) : (
        <>
          {/* Application Context Bar */}
          <ApplicationContextBar app={app} />

          {/* Compliance summary — fixed counters */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ComplianceCard label="Required" value={requiredDocs.length} icon={FileText} cls="bg-muted text-muted-foreground" />
            <ComplianceCard label="Verified" value={verifiedDocs.length} icon={CheckCircle2} cls="bg-success/10 text-success" />
            <ComplianceCard label="Pending" value={pendingDocs.length} icon={Clock} cls="bg-warning/15 text-warning-foreground" />
            <ComplianceCard label="Compliance" value={`${compliancePct}%`} icon={ShieldCheck} cls="bg-primary/10 text-primary" />
          </div>

          <SectionCard title="Document Compliance Progress" icon={ShieldCheck}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{verifiedDocs.length} of {requiredDocs.length} required documents verified</p>
                <p className="text-xs text-muted-foreground">{pendingDocs.length} pending · {uploadedNotVerified.length} uploaded (pending verification) · {optionalDocs.length} optional</p>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={compliancePct} className="h-2.5 w-40" />
                <span className="text-sm font-semibold tabular-nums">{compliancePct}%</span>
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main: Document table */}
            <div className="min-w-0">
              <SectionCard title="Required Documents" description={`Documents for ${app.applicationNo}`} icon={FileText} noPadding
                action={
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-8 w-36 pl-8 text-xs" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      <option value="ALL">All</option>
                      <option value="REQUIRED">Required</option>
                      <option value="UPLOADED">Uploaded</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="SHORTFALL">Shortfall</option>
                    </select>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[8%]" />
                      <col className="w-[14%]" />
                      <col className="w-[8%]" />
                      <col className="w-[16%]" />
                      <col className="w-[12%]" />
                      <col className="w-[14%]" />
                    </colgroup>
                    <thead className="bg-muted/40">
                      <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">Document</th>
                        <th className="px-4 py-2.5 font-medium">Req.</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Ver.</th>
                        <th className="px-4 py-2.5 font-medium">Verified By</th>
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {docs.map((d) => (
                        <tr key={d.id} className="hover:bg-muted/30 h-14">
                          <td className="px-4 py-2">
                            <p className="text-xs font-medium leading-tight">{d.name}</p>
                            <p className="font-mono text-[9px] text-muted-foreground">{d.code}</p>
                            {d.remarks && <p className="text-[9px] text-destructive">{d.remarks}</p>}
                          </td>
                          <td className="px-4 py-2">{d.required ? <Badge className="bg-destructive/10 text-destructive text-[9px]">Req.</Badge> : <Badge variant="outline" className="text-[9px]">Opt.</Badge>}</td>
                          <td className="px-4 py-2"><DocumentStatusBadge status={d.status} /></td>
                          <td className="px-4 py-2 text-xs">{d.version ? `v${d.version}` : "—"}</td>
                          <td className="px-4 py-2 text-xs truncate">{d.verifiedBy ?? "—"}</td>
                          <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{d.verifiedAt ? formatDate(d.verifiedAt) : "—"}</td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              {d.status === "REQUIRED" || d.status === "SHORTFALL" || d.status === "REJECTED" ? (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUploadDocument(d)}><Upload className="size-3" /> Upload</Button>
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

            {/* Right rail: Quick Upload + Verification Status */}
            <div className="space-y-6 min-w-0">
              <SectionCard title="Quick Upload" description={`For: ${app.applicationNo}`} icon={Upload}>
                <div className="mb-3 rounded-md border border-info/30 bg-info/5 px-3 py-2 text-[11px] text-info">
                  <p className="font-medium">You are uploading to:</p>
                  <p className="font-mono">{app.applicationNo}</p>
                  <p>{app.project.name}</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Document Type</label>
                    <Select value={selectedDocCode} onValueChange={setSelectedDocCode}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select document type" /></SelectTrigger>
                      <SelectContent>
                        {app.documents.map((d) => (
                          <SelectItem key={d.code} value={d.code} className="text-xs">
                            {d.name} {d.required && <span className="text-destructive">*</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FileUploader
                    label="Drop document here"
                    hint="PDF, JPG, PNG · max 10 MB"
                    accept=".pdf,.jpg,.png"
                    uploadedFiles={files}
                    onUpload={(newFiles) => {
                      setFiles((prev) => {
                        const map = new Map(prev.map((f) => [f.id, f]));
                        newFiles.forEach((f) => map.set(f.id, f));
                        return Array.from(map.values());
                      });
                      // If a doc type is selected, auto-trigger upload
                      if (selectedDocCode) {
                        const doc = app.documents.find((d) => d.code === selectedDocCode);
                        if (doc) {
                          handleUploadDocument(doc);
                        }
                      }
                    }}
                    onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                  />
                  {!selectedDocCode && (
                    <p className="text-[11px] text-muted-foreground">Select a document type before uploading.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Verification Status" description={`For: ${app.applicationNo}`} icon={ShieldCheck}>
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verified</span>
                    <Badge className="bg-success/10 text-success">{verifiedDocs.length}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uploaded (pending verification)</span>
                    <Badge className="bg-info/10 text-info">{uploadedNotVerified.length}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Required (not uploaded)</span>
                    <Badge className="bg-muted text-muted-foreground">{requiredDocs.filter((d) => d.status === "REQUIRED").length}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shortfall</span>
                    <Badge className="bg-warning text-warning-foreground">{app.documents.filter((d) => d.status === "SHORTFALL").length}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rejected</span>
                    <Badge className="bg-destructive/10 text-destructive">{app.documents.filter((d) => d.status === "REJECTED").length}</Badge>
                  </li>
                  <li className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Optional</span>
                    <Badge variant="outline" className="text-muted-foreground">{optionalDocs.length}</Badge>
                  </li>
                </ul>
              </SectionCard>
            </div>
          </div>

          {/* Document Upload Confirmation Dialog */}
          <Dialog open={!!confirmDoc} onOpenChange={(o) => !o && setConfirmDoc(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document:</span>
                  <span className="font-medium">{confirmDoc?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{confirmDoc?.required ? "Required" : "Optional"}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDoc(null)}>Cancel</Button>
                <Button onClick={confirmDocumentUpload}>
                  <Upload className="size-4" /> Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function ComplianceCard({ label, value, icon: Icon, cls }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
