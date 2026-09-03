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
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  FileText,
  ImageIcon,
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
    // Generate a mock file for re-upload (demo mode)
    const newFileName = `${doc.code}_v${(doc.version ?? 1) + 1}_corrected.pdf`;
    const newSize = `${(0.5 + Math.random() * 2).toFixed(1)} MB`;
    uploadDocument(app.id, doc.code, newFileName, newSize);
    toast({
      title: "Document re-uploaded",
      description: `${newFileName} → ${app.applicationNo}. v${doc.version} kept in history. New version pending verification.`,
    });
    onOpenChange(false);
  }

  function handleDownload() {
    if (!doc) return;
    downloadDocument(doc);
  }

  function downloadDocument(d: DocumentRecord | DocumentVersion) {
    // Demo mode: generate a placeholder blob with the correct filename
    const fileName = "fileName" in d && d.fileName ? d.fileName : `${("code" in d ? d.code : "doc")}_v${d.version}.pdf`;
    const content = `LTP Approval — Building Permit Management System\n\nDocument: ${fileName}\nApplication: ${app.applicationNo}\nProject: ${app.project.name}\nApplicant: ${app.applicant.name}\nVersion: v${d.version}\n\n(Demo file — no real upload backend.)`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: fileName });
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
              <Button size="sm" onClick={handleReupload}>
                <Upload className="size-4" /> Upload New Version (v{(doc.version ?? 1) + 1})
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
// Shows PDF/image preview, or "preview unavailable" for unsupported types.
// ============================================================
function DocumentPreview({ doc }: { doc: DocumentRecord }) {
  const ext = doc.fileType?.toLowerCase() ?? doc.fileName?.split(".").pop()?.toLowerCase() ?? "";

  if (!doc.fileName) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-12 text-center">
        <FileWarning className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">No file uploaded</p>
        <p className="text-xs text-muted-foreground">Upload a document to see a preview here.</p>
      </div>
    );
  }

  // PDF preview (using browser native)
  if (ext === "pdf") {
    return (
      <div className="rounded-md border border-border bg-muted/20 p-2">
        <iframe
          title="PDF preview"
          srcDoc={`<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:system-ui;background:#f9fafb;color:#374151"><div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);padding:32px"><div style="text-align:center;border-bottom:2px solid #047857;padding-bottom:16px;margin-bottom:16px"><h2 style="color:#047857;margin:0">LTP Approval</h2><p style="color:#6b7280;font-size:12px;margin:4px 0 0">Building Permit Management System</p></div><h3 style="color:#1f2937">PDF Document Preview</h3><p style="font-size:13px;color:#6b7280"><strong>File:</strong> ${doc.fileName}<br/><strong>Size:</strong> ${doc.fileSize}<br/><strong>Version:</strong> v${doc.version}</p><div style="margin-top:16px;padding:16px;background:#f3f4f6;border-radius:4px;font-size:12px;color:#6b7280;text-align:center">Demo preview — PDF content would render here in production.</div></div></body></html>`}
          className="h-[300px] w-full rounded border-0"
        />
      </div>
    );
  }

  // Image preview (jpg, png, jpeg, gif)
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-muted/20 py-12">
        <ImageIcon className="size-12 text-muted-foreground" />
        <p className="text-sm font-medium">{doc.fileName}</p>
        <p className="text-xs text-muted-foreground">Image preview would render here.</p>
        <Button size="sm" variant="outline" className="mt-2">
          <Eye className="size-4" /> Open Image
        </Button>
      </div>
    );
  }

  // Unsupported type (DWG, DXF, etc.)
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-12 text-center">
      <FileWarning className="size-10 text-muted-foreground" />
      <p className="text-sm font-medium">Preview unavailable for this file type</p>
      <p className="text-xs text-muted-foreground">.{ext || "dwg"} files cannot be previewed in the browser.</p>
      <Button size="sm" variant="outline" className="mt-2">
        <Download className="size-4" /> Download to view
      </Button>
    </div>
  );
}
