"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  FileImage,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "./workflow";
import type { Drawing } from "@/types";

// ---------- File Uploader (drag & drop) ----------
export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "done" | "error";
  file?: File;       // the actual File object — kept so callers can store the real binary
  error?: string;    // validation error message (when status === "error")
}

export function FileUploader({
  accept = ".pdf,.dwg,.dxf,.jpg,.png",
  maxSize = "50 MB",
  multiple = true,
  label = "Drag & drop files here",
  hint = "or click to browse — supported: PDF, DWG, DXF, JPG, PNG (max 50 MB)",
  onUpload,
  uploadedFiles = [],
  onRemove,
}: {
  accept?: string;
  maxSize?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  onUpload?: (files: UploadedFile[]) => void;
  uploadedFiles?: UploadedFile[];
  onRemove?: (id: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: formatBytes(f.size),
      progress: 0,
      status: "uploading",
      file: f,  // keep the real File object
    }));
    onUpload?.(files);
    // simulate upload progress
    files.forEach((file) => {
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          onUpload?.([{ ...file, progress: 100, status: "done" }]);
        } else {
          onUpload?.([{ ...file, progress: Math.floor(p) }]);
        }
      }, 250);
    });
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
        )}
      >
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          )}
        >
          <UploadCloud className="size-6" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <ul className="space-y-2">
          {uploadedFiles.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                  <div className="flex items-center gap-2">
                    {f.status === "done" && (
                      <CheckCircle2 className="size-4 text-success" />
                    )}
                    {f.status === "error" && (
                      <AlertCircle className="size-4 text-destructive" />
                    )}
                    {f.status === "uploading" && (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.(f.id);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={f.progress} className="h-1.5" />
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {f.size} · {f.progress}%
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ---------- Drawing Version Switcher + Viewer ----------
export function DrawingViewer({ drawings }: { drawings: Drawing[] }) {
  const [activeId, setActiveId] = React.useState(drawings[0]?.id ?? "");
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const active = drawings.find((d) => d.id === activeId) ?? drawings[0];

  if (!active) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        No drawings uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Layers className="size-4" />
              v{active.version}
              <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel className="text-xs">Drawing versions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {drawings.map((d) => (
              <DropdownMenuItem
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className="flex items-start gap-2 py-2"
              >
                <FileImage className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Version {d.version}</span>
                    <Badge variant="outline" className="text-[10px]">{d.fileType}</Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{d.fileName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(d.uploadedAt)}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="icon" className="size-8" onClick={() => setZoom((z) => Math.min(3, z + 0.2))}>
            <ZoomIn className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => setRotation((r) => r + 90)}>
            <RotateCw className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => { setZoom(1); setRotation(0); }}>
            <Maximize2 className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8">
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-auto rounded-xl border border-border bg-muted/20" style={{ height: 440 }}>
        <div className="absolute inset-0 bg-dotted opacity-40" />
        <div className="relative flex h-full items-center justify-center p-6">
          {/* Simulated drawing render */}
          <div
            className="relative aspect-[4/3] w-full max-w-2xl rounded-lg border border-border bg-white shadow-gov-lg transition-transform"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              {/* Plot boundary */}
              <rect x="20" y="20" width="360" height="260" fill="none" stroke="#0f5132" strokeWidth="2" />
              {/* Setback lines (dashed) */}
              <rect x="40" y="50" width="320" height="210" fill="none" stroke="#16a34a" strokeWidth="1" strokeDasharray="6 4" />
              {/* Building footprint */}
              <rect x="70" y="80" width="180" height="130" fill="#dcfce7" stroke="#15803d" strokeWidth="2" />
              {/* Wing */}
              <rect x="260" y="100" width="80" height="90" fill="#dcfce7" stroke="#15803d" strokeWidth="2" />
              {/* Entry */}
              <line x1="70" y1="145" x2="50" y2="145" stroke="#15803d" strokeWidth="2" />
              <polygon points="50,140 50,150 40,145" fill="#15803d" />
              {/* Dimensions */}
              <text x="160" y="35" textAnchor="middle" fontSize="9" fill="#475569">FRONT SETBACK 6.2 m</text>
              <text x="360" y="270" textAnchor="end" fontSize="9" fill="#475569" transform="rotate(90 360 270)">REAR 4.1 m</text>
              {/* North arrow */}
              <circle cx="360" cy="40" r="14" fill="none" stroke="#0f5132" strokeWidth="1" />
              <polygon points="360,30 356,48 360,44 364,48" fill="#0f5132" />
              <text x="360" y="62" textAnchor="middle" fontSize="8" fill="#0f5132" fontWeight="bold">N</text>
              {/* Title block */}
              <rect x="20" y="250" width="360" height="30" fill="#f0fdf4" stroke="#0f5132" strokeWidth="1" />
              <text x="30" y="269" fontSize="8" fill="#0f5132" fontWeight="bold">GREENFIELD RESIDENCY</text>
              <text x="200" y="269" fontSize="7" fill="#0f5132">Plot 14, Baner · G+7 · FAR 1.42</text>
              <text x="340" y="269" fontSize="7" fill="#0f5132">v{active.version}</text>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          <span className="font-medium text-foreground">{active.fileName}</span> · {active.fileSize} · v{active.version}
        </div>
      </div>
    </div>
  );
}

// ---------- Document File Row ----------
export function DocumentFileRow({
  name,
  size,
  uploadedAt,
  onView,
  onDownload,
}: {
  name: string;
  size?: string;
  uploadedAt?: string;
  onView?: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <FileText className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {size && <span>{size}</span>}
          {size && uploadedAt && <span> · </span>}
          {uploadedAt && <span>{formatDateTime(uploadedAt)}</span>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {onView && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onView}>
            <Eye className="size-4" />
          </Button>
        )}
        {onDownload && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onDownload}>
            <Download className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
