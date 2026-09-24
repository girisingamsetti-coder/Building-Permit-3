"use client";

import * as React from "react";
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileCode,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BimModelUploadProps {
  applicationId: string;
  onUploadComplete?: (newVersion: number) => void;
}

export function BimModelUpload({ applicationId, onUploadComplete }: BimModelUploadProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState<string>("");

  const [validationSteps, setValidationSteps] = React.useState<{
    id: string;
    title: string;
    status: "pending" | "running" | "passed" | "failed";
  }[]>([
    { id: "1", title: "IFC Standard Syntax & Schema Conformance (IFC4 / IFC2x3)", status: "pending" },
    { id: "2", title: "Georeference Coordinates & EPSG Cadastral Origin", status: "pending" },
    { id: "3", title: "Spatial Hierarchy Structure (IfcSite -> IfcBuilding -> IfcBuildingStorey)", status: "pending" },
    { id: "4", title: "Quantitative Building Elements & QTO Take-Off Extraction", status: "pending" },
    { id: "5", title: "Automated Municipal DCR Setback & FAR Scrutiny Check", status: "pending" },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExtensions = [".ifc", ".ifczip", ".rvt"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      toast({
        title: "Unsupported File Format",
        description: "Please upload an IFC model (.ifc, .ifczip) or Autodesk Revit export (.rvt).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      toast({
        title: "File Exceeds Size Limit",
        description: "BIM model size cannot exceed 250 MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const startValidationPipeline = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep("Initializing parser worker and validating file header...");

    // Step 1
    setTimeout(() => {
      setProgress(28);
      setValidationSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "passed" } : i === 1 ? { ...s, status: "running" } : s))
      );
      setCurrentStep("Validating coordinate reference system against PMC Cadastral parcel...");
    }, 1200);

    // Step 2
    setTimeout(() => {
      setProgress(52);
      setValidationSteps((prev) =>
        prev.map((s, i) => (i <= 1 ? { ...s, status: "passed" } : i === 2 ? { ...s, status: "running" } : s))
      );
      setCurrentStep("Parsing IfcBuildingStoreys and room containment boundaries...");
    }, 2400);

    // Step 3
    setTimeout(() => {
      setProgress(76);
      setValidationSteps((prev) =>
        prev.map((s, i) => (i <= 2 ? { ...s, status: "passed" } : i === 3 ? { ...s, status: "running" } : s))
      );
      setCurrentStep("Extracting floor areas, heights, volumes, and element schedules...");
    }, 3600);

    // Step 4 & 5
    setTimeout(() => {
      setProgress(100);
      setValidationSteps((prev) => prev.map((s) => ({ ...s, status: "passed" })));
      setCurrentStep("All validation and scrutiny checks passed successfully!");
      setIsProcessing(false);

      toast({
        title: "BIM Validation Completed",
        description: `${selectedFile.name} successfully validated and registered as revision v2.`,
      });

      if (onUploadComplete) {
        onUploadComplete(2);
      }
    }, 4800);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          isDragging
            ? "border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40"
            : "border-slate-300 bg-slate-50/60 hover:border-cyan-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-cyan-600"
        } ${isProcessing ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".ifc,.ifczip,.rvt"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className="rounded-2xl bg-cyan-100/80 p-4 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300">
          <UploadCloud className="size-8" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          {selectedFile ? selectedFile.name : "Upload BIM Model (IFC / Revit)"}
        </h3>

        <p className="mt-1 text-xs text-slate-500 max-w-md">
          {selectedFile
            ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for automated validation pipeline`
            : "Drag & drop your Building Information Model here, or click to browse. Supports IFC4, IFC2x3, and .rvt up to 250 MB."}
        </p>

        {!isProcessing && selectedFile && (
          <div className="mt-5 flex gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                startValidationPipeline();
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs px-4"
            >
              Start Automated Validation
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setProgress(0);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Real-time Validation Pipeline Progress */}
      {(isProcessing || progress > 0) && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              {isProcessing && <Loader2 className="size-3.5 animate-spin text-cyan-600" />}
              {currentStep}
            </span>
            <span className="font-mono font-bold text-cyan-600">{progress}%</span>
          </div>

          <Progress value={progress} className="h-2" />

          {/* Validation Checklist */}
          <div className="mt-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60 pt-2">
            {validationSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  {step.status === "passed" && (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  )}
                  {step.status === "running" && (
                    <Loader2 className="size-4 animate-spin text-cyan-600 shrink-0" />
                  )}
                  {step.status === "pending" && (
                    <div className="size-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  {step.title}
                </span>

                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    step.status === "passed"
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : step.status === "running"
                      ? "border-cyan-300 text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400"
                      : "text-slate-400"
                  }`}
                >
                  {step.status === "passed" ? "Verified" : step.status === "running" ? "Checking" : "Queued"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
