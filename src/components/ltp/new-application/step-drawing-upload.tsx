"use client";

import * as React from "react";
import { FileUploader, type UploadedFile } from "@/components/design-system/files";
import { Info, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function DrawingUploadStep({
  files,
  onUpload,
  onRemove,
  error,
}: {
  files: UploadedFile[];
  onUpload: (files: UploadedFile[]) => void;
  onRemove: (id: string) => void;
  error?: string;
}) {
  const latestFile = files[files.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Upload your project drawings (DWG, DXF or PDF). Drawing scrutiny will run
          automatically after submission. Supported formats: DWG, DXF, PDF (max 50 MB).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* LEFT: Upload zone */}
        <div>
          <FileUploader
            label="Drag & drop drawing here"
            hint="or click to browse — DWG, DXF, PDF · max 50 MB"
            accept=".dwg,.dxf,.pdf"
            uploadedFiles={files}
            onUpload={onUpload}
            onRemove={onRemove}
          />
          {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
        </div>

        {/* RIGHT: File information */}
        {latestFile && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <p className="text-xs font-semibold">File Information</p>
            </div>
            <Separator />
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">File</dt>
                <dd className="font-medium truncate max-w-[160px]">{latestFile.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">{latestFile.size}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-medium">v1</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">
                  {latestFile.status === "done" && <span className="text-success">Uploaded</span>}
                  {latestFile.status === "uploading" && <span className="text-info">Uploading…</span>}
                  {latestFile.status === "error" && <span className="text-destructive">Error</span>}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
