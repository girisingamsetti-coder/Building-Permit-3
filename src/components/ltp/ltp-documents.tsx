"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useSelectedApplication } from "@/store/app-store";
import { APPLICATIONS } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import {
  StatusBadge,
  DocumentStatusBadge,
} from "@/components/design-system/badges";
import { formatDateTime, formatDate, timeAgo } from "@/components/design-system/workflow";
import {
  FileUploader,
  DocumentFileRow,
  type UploadedFile,
} from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  Filter,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, DocumentRecord } from "@/types";

function useAppOrDefault(): Application | null {
  const sel = useSelectedApplication();
  const apps = useAppStore((s) => s.applications);
  return sel ?? apps.find((a) => a.documents.length > 0) ?? apps[0] ?? null;
}

export function LtpDocuments() {
  const { navigate, applications, openApplication } = useAppStore();
  const app = useAppOrDefault();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader title="Documents" icon={FolderClosed} breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Documents" }]} />
        <EmptyState icon={FileWarning} title="No applications" />
      </div>
    );
  }

  const docs = app.documents.filter((d) => {
    if (query && !d.name.toLowerCase().includes(query.toLowerCase()) && !d.code.toLowerCase().includes(query.toLowerCase())) return false;
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    return true;
  });
  const required = app.documents.filter((d) => d.required);
  const verified = app.documents.filter((d) => d.status === "VERIFIED");
  const pending = app.documents.filter((d) => d.status === "REQUIRED" || d.status === "SHORTFALL");
  const pct = required.length ? Math.round((verified.length / required.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Upload, verify and track all required documents for your application."
        icon={FolderClosed}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Documents" }]}
        actions={
          <select value={app.id} onChange={(e) => openApplication(e.target.value, "ltp-documents")} className="h-8 rounded-md border border-input bg-background px-2 text-xs font-mono">
            {applications.map((a) => <option key={a.id} value={a.id}>{a.applicationNo}</option>)}
          </select>
        }
      />

      {/* Compliance summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ComplianceCard label="Required" value={required.length} icon={FileText} cls="bg-muted text-muted-foreground" />
        <ComplianceCard label="Verified" value={verified.length} icon={CheckCircle2} cls="bg-success/10 text-success" />
        <ComplianceCard label="Pending" value={pending.length} icon={Clock} cls="bg-warning/15 text-warning-foreground" />
        <ComplianceCard label="Compliance" value={`${pct}%`} icon={ShieldCheck} cls="bg-primary/10 text-primary" />
      </div>

      <SectionCard title="Document Compliance Progress" icon={ShieldCheck}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">{verified.length} of {required.length} required documents verified</p>
            <p className="text-xs text-muted-foreground">{pending.length} pending · {app.documents.filter((d) => d.status === "SHORTFALL").length} shortfalls</p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-2.5 w-40" />
            <span className="text-sm font-semibold tabular-nums">{pct}%</span>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Required Documents" description="Upload, preview and track verification" icon={FileText} noPadding
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
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SHORTFALL">Shortfall</option>
                </select>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Document</th>
                    <th className="px-4 py-2.5 font-medium">Req.</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Version</th>
                    <th className="px-4 py-2.5 font-medium">Verified By</th>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {docs.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{d.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{d.code}</p>
                        {d.remarks && <p className="mt-0.5 text-[10px] text-destructive">{d.remarks}</p>}
                      </td>
                      <td className="px-4 py-3">{d.required ? <Badge className="bg-destructive/10 text-destructive text-[9px]">Req.</Badge> : <Badge variant="outline" className="text-[9px]">Opt.</Badge>}</td>
                      <td className="px-4 py-3"><DocumentStatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 text-xs">{d.version ? `v${d.version}` : "—"}</td>
                      <td className="px-4 py-3 text-xs">{d.verifiedBy ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.verifiedAt ? formatDate(d.verifiedAt) : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {d.status === "REQUIRED" || d.status === "SHORTFALL" ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast({ title: "Upload dialog", description: `Upload ${d.name}` })}><Upload className="size-3" /> Upload</Button>
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

        <div className="space-y-6">
          <SectionCard title="Quick Upload" description="Upload a document for verification" icon={Upload}>
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
              }}
              onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
          </SectionCard>

          <SectionCard title="Verification Status" icon={ShieldCheck}>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Verified</span><Badge className="bg-success/10 text-success">{verified.length}</Badge></li>
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Uploaded (pending)</span><Badge className="bg-info/10 text-info">{app.documents.filter((d) => d.status === "UPLOADED").length}</Badge></li>
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Required</span><Badge className="bg-muted text-muted-foreground">{app.documents.filter((d) => d.status === "REQUIRED").length}</Badge></li>
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Shortfall</span><Badge className="bg-warning text-warning-foreground">{app.documents.filter((d) => d.status === "SHORTFALL").length}</Badge></li>
              <li className="flex items-center justify-between"><span className="text-muted-foreground">Rejected</span><Badge className="bg-destructive/10 text-destructive">{app.documents.filter((d) => d.status === "REJECTED").length}</Badge></li>
            </ul>
          </SectionCard>
        </div>
      </div>
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
