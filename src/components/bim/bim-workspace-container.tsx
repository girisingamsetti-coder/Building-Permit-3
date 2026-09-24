"use client";

import * as React from "react";
import {
  Box,
  Eye,
  ScrollText,
  Layers,
  GitCompare,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getBimModelByAppId,
  type BimModelData,
  type BimScrutinyRule,
} from "@/data/mock-bim-data";
import { BimViewer3D } from "./bim-viewer-3d";
import { BimScrutinyMatrix } from "./bim-scrutiny-matrix";
import { BimExtractedData } from "./bim-extracted-data";
import { BimVersionDiff } from "./bim-version-diff";
import { BimModelUpload } from "./bim-model-upload";
import { BimReportsView } from "./bim-reports-view";

interface BimWorkspaceContainerProps {
  applicationId: string;
  projectData?: any;
  userRole?: string;
  className?: string;
}

export function BimWorkspaceContainer({
  applicationId,
  projectData,
  userRole = "LTP",
  className = "",
}: BimWorkspaceContainerProps) {
  // 1. Failure isolation / Error Boundary state
  const [hasError, setHasError] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>("viewer");

  // 2. Fetch or initialize BIM model
  const [model, setModel] = React.useState<BimModelData | null>(() =>
    getBimModelByAppId(applicationId)
  );

  // 3. Violation targeting link state
  const [activeViolation, setActiveViolation] = React.useState<BimScrutinyRule | null>(null);

  React.useEffect(() => {
    setModel(getBimModelByAppId(applicationId));
  }, [applicationId]);

  // Graceful fallback if error boundary triggers
  if (hasError || !model) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-6 text-center dark:border-amber-900/60 dark:bg-amber-950/20">
        <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          BIM Service Temporarily Operating in Safe Mode
        </h3>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-md mx-auto">
          The 3D BIM visualization engine encountered an isolated notice. Your core building permission application, documents, and payments remain unaffected.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setHasError(false);
            setModel(getBimModelByAppId(applicationId));
          }}
          className="mt-3 text-xs"
        >
          <RefreshCw className="size-3.5 mr-1" /> Retry BIM Engine
        </Button>
      </div>
    );
  }

  const handleSelectViolation = (rule: BimScrutinyRule) => {
    setActiveViolation(rule);
    setActiveTab("viewer");
  };

  const handleUploadComplete = (newVersion: number) => {
    // Refresh model data
    setModel({
      ...model,
      currentVersion: newVersion,
      status: "BIM_SCRUTINY_PASSED",
      lastUpdated: new Date().toISOString(),
      activeFileName: `${applicationId.replace(/\//g, "_")}_v${newVersion}_Compliant.ifc`,
    });
    setActiveTab("viewer");
  };

  const isScrutinyPass = model.status === "BIM_SCRUTINY_PASSED";
  const failCount = model.rules.filter((r) => r.status === "FAIL").length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* BIM Module Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            <Box className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                BIM Digital Permit Workspace
              </h2>
              <Badge
                className={
                  isScrutinyPass
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]"
                    : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 text-[10px]"
                }
              >
                {isScrutinyPass ? (
                  <CheckCircle2 className="size-3 mr-1" />
                ) : (
                  <XCircle className="size-3 mr-1" />
                )}
                {isScrutinyPass ? "BIM Scrutiny Passed" : `${failCount} DCR Shortfalls Flagged`}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ref: <span className="font-mono font-medium">{applicationId}</span> • Active:{" "}
              <span className="font-mono">{model.activeFileName}</span> (v{model.currentVersion})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal text-slate-500 py-1">
            <Clock className="size-3 mr-1" /> Updated: {new Date(model.lastUpdated).toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {/* BIM Internal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100/80 p-1 dark:bg-slate-800/60 rounded-xl">
          <TabsTrigger value="viewer" className="gap-1.5 text-xs">
            <Eye className="size-3.5" /> 3D Viewer & Scrutiny
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5 text-xs">
            <ScrollText className="size-3.5" /> Scrutiny Matrix
            {failCount > 0 && (
              <Badge className="ml-1 bg-red-600 text-white text-[9px] px-1 py-0">{failCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5 text-xs">
            <Layers className="size-3.5" /> Extracted Schedules
          </TabsTrigger>
          <TabsTrigger value="versions" className="gap-1.5 text-xs">
            <GitCompare className="size-3.5" /> Versions & Diff
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <UploadCloud className="size-3.5" /> Upload Revision
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5 text-xs">
            <FileText className="size-3.5" /> Reports & Certificate
          </TabsTrigger>
        </TabsList>

        {/* 1. 3D Viewer Tab (with split scrutiny summary) */}
        <TabsContent value="viewer" className="space-y-4">
          <BimViewer3D
            model={model}
            activeViolation={activeViolation}
            onClearViolation={() => setActiveViolation(null)}
          />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Automated DCR Rule Checks (Click "Locate 3D" to focus violation)
              </h3>
              <Button
                variant="link"
                size="sm"
                className="text-xs text-cyan-600 p-0 h-auto"
                onClick={() => setActiveTab("matrix")}
              >
                View Full Matrix →
              </Button>
            </div>
            <BimScrutinyMatrix
              rules={model.rules}
              activeViolationId={activeViolation?.id}
              onSelectViolation={handleSelectViolation}
              userRole={userRole}
            />
          </div>
        </TabsContent>

        {/* 2. Full Scrutiny Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <BimScrutinyMatrix
            rules={model.rules}
            activeViolationId={activeViolation?.id}
            onSelectViolation={handleSelectViolation}
            userRole={userRole}
          />
        </TabsContent>

        {/* 3. Extracted Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <BimExtractedData metrics={model.metrics} storeys={model.storeys} />
        </TabsContent>

        {/* 4. Versions and Comparison Tab */}
        <TabsContent value="versions" className="space-y-4">
          <BimVersionDiff versions={model.versions} currentVersion={model.currentVersion} />
        </TabsContent>

        {/* 5. Upload Revision Tab */}
        <TabsContent value="upload" className="space-y-4">
          <BimModelUpload applicationId={applicationId} onUploadComplete={handleUploadComplete} />
        </TabsContent>

        {/* 6. Reports View Tab */}
        <TabsContent value="reports" className="space-y-4">
          <BimReportsView model={model} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
