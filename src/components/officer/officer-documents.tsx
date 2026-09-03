"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAllReviewableApplications } from "@/store/app-store";
import { hasPermission } from "@/lib/permissions";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import {
  StatusBadge,
  DocumentStatusBadge,
} from "@/components/design-system/badges";
import { formatDate, formatDateTime } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileCheck2,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileWarning,
  Eye,
  FolderClosed,
} from "lucide-react";
import type { Application, DocumentRecord } from "@/types";
import { DocumentViewerModal } from "@/components/ltp/document-viewer-modal";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// OFFICER DOCUMENT REVIEW QUEUE
// Shows all uploaded documents (PENDING_VERIFICATION) across applications
// assigned to the reviewer's role. Uses the shared application dataset.
// Reviewer can open each document and Verify / Reject / Raise Shortfall.
// ============================================================

export function OfficerDocuments() {
  const { user, roles, openApplication } = useAppStore();
  const allApps = useAllReviewableApplications();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [viewerApp, setViewerApp] = React.useState<Application | null>(null);
  const [viewerDoc, setViewerDoc] = React.useState<DocumentRecord | null>(null);

  const canVerify = user ? hasPermission(user, "document:verify", roles) : false;
  const canReject = user ? hasPermission(user, "document:reject", roles) : false;
  const canRaiseShortfall = user ? hasPermission(user, "shortfall:raise", roles) : false;

  // Build a flat list of (app, doc) pairs for documents requiring verification
  const pendingDocs = React.useMemo(() => {
    const pairs: { app: Application; doc: DocumentRecord }[] = [];
    for (const app of allApps) {
      for (const doc of app.documents) {
        if (doc.status === "PENDING_VERIFICATION") {
          pairs.push({ app, doc });
        }
      }
    }
    return pairs;
  }, [allApps]);

  // Also include rejected + shortfall for visibility (LTP needs to re-upload — reviewer can view)
  const allReviewableDocs = React.useMemo(() => {
    const pairs: { app: Application; doc: DocumentRecord }[] = [];
    for (const app of allApps) {
      for (const doc of app.documents) {
        if (doc.status === "PENDING_VERIFICATION" || doc.status === "REJECTED" || doc.status === "SHORTFALL" || doc.status === "VERIFIED") {
          pairs.push({ app, doc });
        }
      }
    }
    return pairs;
  }, [allApps]);

  // Filter by search query
  const filtered = React.useMemo(() => {
    if (!query.trim()) return allReviewableDocs;
    const q = query.toLowerCase();
    return allReviewableDocs.filter(({ app, doc }) =>
      app.applicationNo.toLowerCase().includes(q) ||
      app.project.name.toLowerCase().includes(q) ||
      app.applicant.name.toLowerCase().includes(q) ||
      doc.name.toLowerCase().includes(q) ||
      doc.code.toLowerCase().includes(q)
    );
  }, [allReviewableDocs, query]);

  // KPI counts
  const pendingCount = pendingDocs.length;
  const verifiedCount = allReviewableDocs.filter(({ doc }) => doc.status === "VERIFIED").length;
  const rejectedCount = allReviewableDocs.filter(({ doc }) => doc.status === "REJECTED").length;
  const shortfallCount = allReviewableDocs.filter(({ doc }) => doc.status === "SHORTFALL").length;

  function handleReview(app: Application, doc: DocumentRecord) {
    setViewerApp(app);
    setViewerDoc(doc);
    // Ensure the store's selectedApplicationId is set so the modal can use it
    openApplication(app.id, "officer-documents");
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="officer-dashboard" />
      <PageHeader
        title="Document Review"
        description="Verify, reject, or raise shortfalls on uploaded documents across all assigned applications."
        icon={FileCheck2}
        breadcrumbs={[{ label: "Officer Portal", onClick: () => useAppStore.getState().navigate("officer-dashboard") }, { label: "Document Review" }]}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Pending Verification" value={pendingCount} icon={Clock} cls="bg-info/10 text-info" />
        <KpiCard label="Verified" value={verifiedCount} icon={CheckCircle2} cls="bg-success/10 text-success" />
        <KpiCard label="Rejected" value={rejectedCount} icon={XCircle} cls="bg-destructive/10 text-destructive" />
        <KpiCard label="Shortfall" value={shortfallCount} icon={AlertTriangle} cls="bg-warning/15 text-warning-foreground" />
      </div>

      {/* Search */}
      <SectionCard title="Documents Pending Verification" description={`${pendingCount} document${pendingCount === 1 ? "" : "s"} awaiting your review`} icon={FileCheck2} noPadding
        action={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by application, project, applicant, document…" className="h-8 w-64 pl-8 text-xs" aria-label="Search documents" />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={query.trim() ? FileWarning : FileCheck2}
              title={query.trim() ? "No documents match your search" : "No documents pending verification"}
              description={query.trim() ? "Try another application number, project, or document." : "All assigned documents have been reviewed. New uploads will appear here."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-muted/40">
                <tr className="border-b-2 border-border text-left text-[11px] uppercase tracking-wide text-foreground">
                  <th className="px-4 py-2.5 font-bold">Application No.</th>
                  <th className="px-4 py-2.5 font-bold">Project</th>
                  <th className="px-4 py-2.5 font-bold">Applicant</th>
                  <th className="px-4 py-2.5 font-bold">Document</th>
                  <th className="px-4 py-2.5 font-bold">Version</th>
                  <th className="px-4 py-2.5 font-bold">Uploaded By</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(({ app, doc }) => (
                  <tr key={`${app.id}-${doc.id}`} className="hover:bg-muted/30 h-14">
                    <td className="px-4 py-2">
                      <button onClick={() => openApplication(app.id, "officer-review")} className="font-mono text-xs font-semibold text-primary hover:underline">
                        {app.applicationNo}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-xs truncate max-w-[180px]">{app.project.name}</td>
                    <td className="px-4 py-2 text-xs truncate max-w-[140px]">{app.applicant.name}</td>
                    <td className="px-4 py-2">
                      <p className="text-xs font-medium leading-tight">{doc.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{doc.code}</p>
                    </td>
                    <td className="px-4 py-2 text-xs">v{doc.version ?? 1}</td>
                    <td className="px-4 py-2 text-xs truncate">{doc.uploadedBy ?? "—"}</td>
                    <td className="px-4 py-2"><DocumentStatusBadge status={doc.status} /></td>
                    <td className="px-4 py-2 text-right">
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleReview(app, doc)}>
                        <Eye className="size-3" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Document Viewer Modal (reused — shows Verify/Reject/Shortfall for reviewers) */}
      <DocumentViewerModal
        app={viewerApp ?? allApps[0] ?? null as unknown as Application}
        doc={viewerDoc}
        open={!!viewerDoc}
        onOpenChange={(o) => !o && setViewerDoc(null)}
      />
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, cls }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
