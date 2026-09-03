"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DocumentStatusBadge } from "@/components/design-system/badges";
import { formatDateTime } from "@/components/design-system/workflow";
import { downloadStoredFile, getStoredFileObjectURL } from "@/lib/file-store";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  FileText,
  FileWarning,
  Building2,
  User,
  Calendar,
  Clock,
  Upload,
  History,
  Loader2,
} from "lucide-react";
import type { Application, DocumentRecord, DocumentVersion } from "@/types";

// ============================================================
// DOCUMENT VIEWER / REVIEW MODAL
// Reusable for both LTP (view/download/re-upload) and reviewer (verify/reject/shortfall).
// Shows application context, document metadata, preview, version history, and
// role-aware review actions.
// ============================================================

export function DocumentViewerModal({
  app,
  doc,
  open,
  onOpenChange,
}: {
  app: Application;
  doc: DocumentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, verifyDocument, rejectDocument, raiseDocumentShortfall, uploadDocument, roles } = useAppStore();
  const { toast } = useToast();
  const [reviewMode, setReviewMode] = React.useState<"none" | "verify" | "reject" | "shortfall">("none");
  const [verifyRemarks, setVerifyRemarks] = React.useState("");
  const [rejectReason, setRejectReason] = React.useState("");
  const [shortfallReason, setShortfallReason] = React.useState("");
  const [shortfallAction, setShortfallAction] = React.useState("");
  const [shortfallRemarks, setShortfallRemarks] = React.useState("");
  const [acting, setActing] = React.useState(false);

  // Permission checks
  const canVerify = user ? hasPermission(user, "document:verify", roles) : false;
  const canReject = user ? hasPermission(user, "document:reject", roles) : false;
  const canRaiseShortfall = user ? hasPermission(user, "shortfall:raise", roles) : false;
  const canUpload = user ? hasPermission(user, "document:upload", roles) : false;

  // Reset state when doc changes
  React.useEffect(() => {
    if (!open) {
      setReviewMode("none");
      setVerifyRemarks("");
      setRejectReason("");
      setShortfallReason("");
      setShortfallAction("");
      setShortfallRemarks("");
    }
  }, [open]);

  const reuploadInputRef = React.useRef<HTMLInputElement>(null);

  if (!doc) return null;

  const isReviewable = doc.status === "PENDING_VERIFICATION";
  const canReupload = canUpload && (doc.status === "REJECTED" || doc.status === "SHORTFALL");

  function handleVerify() {
    if (!doc) return;
    setActing(true);
    const res = verifyDocument(app.id, doc.id, verifyRemarks.trim() || undefined);
    setActing(false);
    if (res.ok) {
      toast({ title: "Document verified", description: `${doc.name} v${doc.version} has been verified.` });
      setReviewMode("none");
      setVerifyRemarks("");
      onOpenChange(false);
    } else {
      toast({ title: "Verification failed", description: res.error, variant: "destructive" });
    }
  }

  function handleReject() {
    if (!doc) return;
    if (!rejectReason.trim()) {
      toast({ title: "Rejection reason required", variant: "destructive" });
      return;
    }
    setActing(true);
    const res = rejectDocument(app.id, doc.id, rejectReason.trim());
    setActing(false);
    if (res.ok) {
      toast({ title: "Document rejected", description: `${doc.name} v${doc.version} has been rejected. LTP notified.` });
      setReviewMode("none");
      setRejectReason("");
      onOpenChange(false);
    } else {
      toast({ title: "Rejection failed", description: res.error, variant: "destructive" });
    }
  }

  function handleShortfall() {
    if (!doc) return;
    if (!shortfallReason.trim() || !shortfallAction.trim()) {
      toast({ title: "Reason and required action are required", variant: "destructive" });
      return;
    }
    setActing(true);
    const res = raiseDocumentShortfall(app.id, doc.id, {
      reason: shortfallReason.trim(),
      requiredAction: shortfallAction.trim(),
      remarks: shortfallRemarks.trim() || undefined,
    });
    setActing(false);
    if (res.ok) {
      toast({ title: "Shortfall raised", description: `Shortfall raised on ${doc.name} v${doc.version}. LTP notified.` });
      setReviewMode("none");
      setShortfallReason("");
      setShortfallAction("");
      setShortfallRemarks("");
      onOpenChange(false);
    } else {
      toast({ title: "Shortfall failed", description: res.error, variant: "destructive" });
    }
  }

  function handleReupload() {
    if (!doc) return;
    // Trigger a real file input — the actual File is passed to uploadDocument.
    reuploadInputRef.current?.click();
  }

  async function handleReuploadFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    if (!doc) return;
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    setActing(true);
    const res = await uploadDocument(app.id, doc.code, f);
    setActing(false);
    if (res.ok) {
      toast({
        title: "Document re-uploaded",
        description: `${f.name} → ${app.applicationNo}. v${doc.version} kept in history. New version pending verification.`,
      });
      onOpenChange(false);
    } else {
      toast({ title: "Re-upload failed", description: res.error ?? "Please try again.", variant: "destructive" });
    }
  }

  function handleDownload() {
    if (!doc) return;
    downloadDocument(doc);
  }

  function downloadDocument(d: DocumentRecord | DocumentVersion) {
    // Download the ACTUAL stored file content from the file store.
    const fileReference = "fileReference" in d ? d.fileReference : undefined;
    if (fileReference && downloadStoredFile(fileReference)) {
      toast({ title: "Download started", description: d.fileName ?? `${d.version}` });
      return;
    }
    // No real file in the store (seed/demo data) — honest error, no fake PDF.
    toast({
      title: "Download unavailable",
      description: "This document's file content is not available. It may be a seed/demo record that was never actually uploaded in this session.",
      variant: "destructive",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Document Review
          </DialogTitle>
          <DialogDescription>
            {doc.name} · {app.applicationNo}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Application context */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Application</p>
                <p className="font-mono text-xs font-medium text-primary">{app.applicationNo}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Project</p>
                <p className="truncate text-xs font-medium">{app.project.name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Applicant</p>
                <p className="truncate text-xs font-medium">{app.applicant.name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Document Type</p>
                <p className="font-mono text-xs font-medium">{doc.code}</p>
              </div>
            </div>
          </div>

          {/* Document metadata */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document Information</p>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">File Name</p>
                <p className="truncate font-medium">{doc.fileName ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">v{doc.version ?? 1}</p>
              </div>
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-medium">{doc.fileSize ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uploaded By</p>
                <p className="font-medium">{doc.uploadedBy ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uploaded Date</p>
                <p className="font-medium">{doc.uploadedAt ? formatDateTime(doc.uploadedAt) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <DocumentStatusBadge status={doc.status} />
              </div>
              {doc.reviewedBy && (
                <div>
                  <p className="text-muted-foreground">Reviewed By</p>
                  <p className="font-medium">{doc.reviewedBy}</p>
                </div>
              )}
              {doc.reviewedAt && (
                <div>
                  <p className="text-muted-foreground">Reviewed Date</p>
                  <p className="font-medium">{formatDateTime(doc.reviewedAt)}</p>
                </div>
              )}
            </div>
            {doc.rejectionReason && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs">
                <p className="font-semibold text-destructive">Rejection Reason:</p>
                <p className="text-destructive/90">{doc.rejectionReason}</p>
              </div>
            )}
            {doc.shortfallReason && (
              <div className="rounded-md border border-warning/30 bg-warning/5 p-2 text-xs">
                <p className="font-semibold text-warning-foreground">Shortfall Reason:</p>
                <p className="text-warning-foreground/90">{doc.shortfallReason}</p>
              </div>
            )}
          </div>

          {/* Document preview */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document Preview</p>
            <DocumentPreview doc={doc} />
          </div>

          {/* Version history */}
          {doc.history && doc.history.length > 0 && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <History className="size-3.5" /> Document History
              </p>
              <div className="space-y-2">
                {/* Current version */}
                <div className="flex items-start justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 p-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground text-[9px]">Current</Badge>
                      <span className="font-mono text-xs font-semibold">v{doc.version}</span>
                      <DocumentStatusBadge status={doc.status} />
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{doc.fileName}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={handleDownload}>
                    <Download className="size-3" /> v{doc.version}
                  </Button>
                </div>
                {/* Older versions */}
                {[...doc.history].reverse().map((h, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/20 p-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">v{h.version}</span>
                        <DocumentStatusBadge status={h.status} />
                      </div>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{h.fileName}</p>
                      {h.rejectionReason && <p className="mt-0.5 text-[10px] text-destructive">Reason: {h.rejectionReason}</p>}
                      {h.shortfallReason && <p className="mt-0.5 text-[10px] text-warning-foreground">Shortfall: {h.shortfallReason}</p>}
                      {h.reviewedBy && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Reviewed by {h.reviewedBy} · {h.reviewedAt ? formatDateTime(h.reviewedAt) : "—"}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={() => downloadDocument(h)}>
                      <Download className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review actions — only for PENDING_VERIFICATION + reviewer permissions */}
          {isReviewable && (canVerify || canReject || canRaiseShortfall) && reviewMode === "none" && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Review Actions</p>
              <div className="flex flex-wrap gap-2">
                {canVerify && (
                  <Button size="sm" variant="default" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setReviewMode("verify")}>
                    <CheckCircle2 className="size-4" /> Verify
                  </Button>
                )}
                {canReject && (
                  <Button size="sm" variant="default" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => setReviewMode("reject")}>
                    <XCircle className="size-4" /> Reject
                  </Button>
                )}
                {canRaiseShortfall && (
                  <Button size="sm" variant="default" className="bg-warning text-warning-foreground hover:bg-warning/90" onClick={() => setReviewMode("shortfall")}>
                    <AlertTriangle className="size-4" /> Raise Shortfall
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Verify form */}
          {reviewMode === "verify" && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 space-y-2">
              <p className="text-sm font-semibold text-success">Verify this document?</p>
              <div className="space-y-1.5">
                <Label htmlFor="verify-remarks" className="text-xs">Remarks (optional)</Label>
                <Textarea id="verify-remarks" value={verifyRemarks} onChange={(e) => setVerifyRemarks(e.target.value)} placeholder="Optional remarks…" rows={2} className="text-xs" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReviewMode("none")} disabled={acting}>Cancel</Button>
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={handleVerify} disabled={acting}>
                  {acting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Verify
                </Button>
              </div>
            </div>
          )}

          {/* Reject form */}
          {reviewMode === "reject" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm font-semibold text-destructive">Reject this document</p>
              <div className="space-y-1.5">
                <Label htmlFor="reject-reason" className="text-xs">Rejection Reason *</Label>
                <Textarea id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Document is not legible…" rows={3} className="text-xs" required />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReviewMode("none")} disabled={acting}>Cancel</Button>
                <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleReject} disabled={acting || !rejectReason.trim()}>
                  {acting ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />} Reject Document
                </Button>
              </div>
            </div>
          )}

          {/* Shortfall form */}
          {reviewMode === "shortfall" && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
              <p className="text-sm font-semibold text-warning-foreground">Raise a shortfall on this document</p>
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sf-reason" className="text-xs">Shortfall Reason *</Label>
                  <Textarea id="sf-reason" value={shortfallReason} onChange={(e) => setShortfallReason(e.target.value)} placeholder="e.g. Missing authorized signature…" rows={2} className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sf-action" className="text-xs">Required Action *</Label>
                  <Textarea id="sf-action" value={shortfallAction} onChange={(e) => setShortfallAction(e.target.value)} placeholder="e.g. Re-upload with SE stamp…" rows={2} className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sf-remarks" className="text-xs">Optional Remarks</Label>
                  <Textarea id="sf-remarks" value={shortfallRemarks} onChange={(e) => setShortfallRemarks(e.target.value)} placeholder="Additional context…" rows={2} className="text-xs" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReviewMode("none")} disabled={acting}>Cancel</Button>
                <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90" onClick={handleShortfall} disabled={acting || !shortfallReason.trim() || !shortfallAction.trim()}>
                  {acting ? <Loader2 className="size-4 animate-spin" /> : <AlertTriangle className="size-4" />} Raise Shortfall
                </Button>
              </div>
            </div>
          )}

          {/* LTP re-upload action */}
          {canReupload && reviewMode === "none" && (
            <div className="rounded-lg border border-info/30 bg-info/5 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-info">Action Required</p>
              <p className="text-xs text-info/90">
                This document was {doc.status === "REJECTED" ? "rejected" : "raised as a shortfall"}. Upload a corrected version to continue.
              </p>
              <input
                ref={reuploadInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.dwg,.dxf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleReuploadFilePicked}
              />
              <Button size="sm" onClick={handleReupload} disabled={acting}>
                {acting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload New Version (v{(doc.version ?? 1) + 1})
              </Button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!doc.fileName}>
            <Download className="size-4" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// DOCUMENT PREVIEW
// Shows the ACTUAL stored file: PDF via object URL iframe, image via
// object URL img, or "preview unavailable" for unsupported types / seed data.
// ============================================================
function DocumentPreview({ doc }: { doc: DocumentRecord }) {
  const ext = doc.fileType?.toLowerCase() ?? doc.fileName?.split(".").pop()?.toLowerCase() ?? "";
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [unavailable, setUnavailable] = React.useState(false);

  // Fetch the real binary from the file store and create an object URL.
  React.useEffect(() => {
    let url: string | null = null;
    if (doc.fileReference) {
      url = getStoredFileObjectURL(doc.fileReference);
      if (url) {
        setObjectUrl(url);
      } else {
        setUnavailable(true);
      }
    } else {
      setUnavailable(true);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [doc.fileReference]);

  if (!doc.fileName) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-12 text-center">
        <FileWarning className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">No file uploaded</p>
        <p className="text-xs text-muted-foreground">Upload a document to see a preview here.</p>
      </div>
    );
  }

  // Seed/demo file with no real binary in the store
  if (unavailable) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-12 text-center">
        <FileWarning className="size-10 text-muted-foreground" />
        <p className="text-sm font-medium">Preview unavailable</p>
        <p className="text-xs text-muted-foreground">
          This is a seed/demo document whose file content was not actually uploaded in this session.
        </p>
      </div>
    );
  }

  // Unsupported type (DWG, DXF, DOC, DOCX, XLS, XLSX, etc.)
  if (!["pdf", "jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-12 text-center">
        <FileWarning className="size-10 text-muted-foreground" />
        <p className="text-sm font-medium">Preview unavailable for this file type</p>
        <p className="text-xs text-muted-foreground">.{ext || "dwg"} files cannot be previewed in the browser.</p>
      </div>
    );
  }

  // Loading state
  if (!objectUrl) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-muted/20 py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading preview…</p>
      </div>
    );
  }

  // PDF preview — real PDF via object URL
  if (ext === "pdf") {
    return (
      <div className="rounded-md border border-border bg-muted/20 p-2">
        <iframe
          title="PDF preview"
          src={objectUrl}
          className="h-[400px] w-full rounded border-0"
        />
      </div>
    );
  }

  // Image preview — real image via object URL
  return (
    <div className="flex items-center justify-center rounded-md border border-border bg-muted/20 p-4">
      <img src={objectUrl} alt={doc.fileName} className="max-h-[400px] max-w-full rounded border border-border" />
    </div>
  );
}
