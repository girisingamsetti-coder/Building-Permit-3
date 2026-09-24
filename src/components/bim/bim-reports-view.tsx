"use client";

import * as React from "react";
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  QrCode,
  Building,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { BimModelData } from "@/data/mock-bim-data";

interface BimReportsViewProps {
  model: BimModelData;
}

export function BimReportsView({ model }: BimReportsViewProps) {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = React.useState<"scrutiny" | "fsi" | "violations" | "diff">("scrutiny");

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "Downloading Report",
      description: `BIM_Scrutiny_Certificate_${model.applicationId.replace(/\//g, "_")}.pdf generated.`,
    });
  };

  const passedChecks = model.rules.filter((r) => r.status === "PASS").length;
  const failedChecks = model.rules.filter((r) => r.status === "FAIL").length;

  return (
    <div className="space-y-6">
      {/* Report Selector Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={selectedReport === "scrutiny" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setSelectedReport("scrutiny")}
          >
            Auto-Scrutiny Certificate
          </Button>
          <Button
            size="sm"
            variant={selectedReport === "fsi" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setSelectedReport("fsi")}
          >
            FSI & Area Schedule
          </Button>
          <Button
            size="sm"
            variant={selectedReport === "violations" ? "default" : "outline"}
            className="text-xs h-8"
            onClick={() => setSelectedReport("violations")}
          >
            Violation Matrix
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={handlePrint}>
            <Printer className="size-3.5 mr-1" /> Print Report
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8" onClick={handleDownload}>
            <Download className="size-3.5 mr-1" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Official Government Printable Document Template */}
      <div className="rounded-xl border border-slate-300 bg-white p-8 text-slate-900 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 max-w-4xl mx-auto">
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center dark:border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Building className="size-4 text-cyan-600" />
            MUNICIPAL CORPORATION BUILDING PERMISSION AUTHORITY
          </div>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight">
            BIM AUTO-SCRUTINY COMPLIANCE CERTIFICATE
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generated pursuant to Section 44 of the Municipal Town Planning & Development Act
          </p>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <span className="text-slate-500 block">Application No:</span>
            <span className="font-mono font-bold text-sm">{model.applicationId}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Project Name:</span>
            <span className="font-semibold">{model.projectName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">BIM File & Version:</span>
            <span className="font-mono">{model.activeFileName} (v{model.currentVersion})</span>
          </div>
          <div>
            <span className="text-slate-500 block">Evaluation Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="my-6 rounded-xl border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {model.status === "BIM_SCRUTINY_PASSED" ? (
              <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-950">
                <CheckCircle2 className="size-6" />
              </div>
            ) : (
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-950">
                <XCircle className="size-6" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-sm">
                Overall Result: {model.status === "BIM_SCRUTINY_PASSED" ? "APPROVED / COMPLIANT" : "REVISION REQUIRED (FAILED)"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {passedChecks} checks compliant • {failedChecks} violations recorded
              </p>
            </div>
          </div>

          <Badge className={model.status === "BIM_SCRUTINY_PASSED" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}>
            {model.status === "BIM_SCRUTINY_PASSED" ? "DCR PASSED" : "DCR SHORTFALL"}
          </Badge>
        </div>

        {/* Detailed Evaluation Table */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Detailed Parameter Findings
          </h4>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-2.5">Rule ID</th>
                <th className="p-2.5">Parameter Description</th>
                <th className="p-2.5">DCR Required</th>
                <th className="p-2.5">BIM Extracted</th>
                <th className="p-2.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              {model.rules.map((r) => (
                <tr key={r.id}>
                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">{r.id}</td>
                  <td className="p-2.5 font-sans">{r.title}</td>
                  <td className="p-2.5">{r.requiredValue}</td>
                  <td className="p-2.5 font-bold">{r.observedValue}</td>
                  <td className="p-2.5 font-sans">
                    {r.status === "PASS" ? (
                      <span className="text-emerald-600 font-bold">PASS</span>
                    ) : (
                      <span className="text-red-600 font-bold">FAIL ({r.delta})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Endorsement & Verification Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="p-1 border border-slate-300 rounded bg-white text-slate-900">
              <QrCode className="size-12" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Scan to Verify Digital Signature</p>
              <p className="text-[10px]">Auth Hash: {model.applicationId}-SCRUTINY-OK</p>
            </div>
          </div>

          <div className="text-right">
            <div className="h-10"></div>
            <p className="font-bold text-slate-800 dark:text-slate-200">Municipal Town Planning Authority</p>
            <p className="text-[10px]">Automated Scrutiny Seal • Government of Maharashtra</p>
          </div>
        </div>
      </div>
    </div>
  );
}
