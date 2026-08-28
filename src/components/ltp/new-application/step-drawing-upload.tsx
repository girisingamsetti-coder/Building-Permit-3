"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileUploader, type UploadedFile } from "@/components/design-system/files";
import { Info, Upload } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Upload your project drawings (DWG, DXF or PDF). Drawing scrutiny will run
          automatically after submission. Supported formats: DWG, DXF, PDF (max 50 MB).
        </p>
      </div>
      <FileUploader
        label="Drag & drop drawing here"
        hint="or click to browse — DWG, DXF, PDF · max 50 MB"
        accept=".dwg,.dxf,.pdf"
        uploadedFiles={files}
        onUpload={onUpload}
        onRemove={onRemove}
      />
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
