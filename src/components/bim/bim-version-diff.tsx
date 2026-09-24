"use client";

import * as React from "react";
import {
  History,
  GitCompare,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileCode2,
  Calendar,
  User,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BimVersion } from "@/data/mock-bim-data";

interface BimVersionDiffProps {
  versions: BimVersion[];
  currentVersion: number;
}

export function BimVersionDiff({ versions, currentVersion }: BimVersionDiffProps) {
  const [selectedV1, setSelectedV1] = React.useState<number>(1);
  const [selectedV2, setSelectedV2] = React.useState<number>(versions.length > 1 ? versions.length : 1);

  return (
    <div className="space-y-6">
      {/* Version Selector Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <GitCompare className="size-4 text-cyan-600" />
            Model Version Comparison (BIM Diff Engine)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare geometric and regulatory delta between successive submissions.
          </p>
        </div>

        {versions.length > 1 ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Base:</span>
            <select
              value={selectedV1}
              onChange={(e) => setSelectedV1(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 font-semibold dark:border-slate-700 dark:bg-slate-800 text-xs"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} ({v.status === "BIM_SCRUTINY_PASSED" ? "Passed" : "Failed"})
                </option>
              ))}
            </select>

            <ArrowRight className="size-3.5 text-slate-400" />

            <span className="text-slate-500">Revised:</span>
            <select
              value={selectedV2}
              onChange={(e) => setSelectedV2(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 font-semibold dark:border-slate-700 dark:bg-slate-800 text-xs"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} ({v.status === "BIM_SCRUTINY_PASSED" ? "Passed" : "Failed"})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs text-slate-500">
            Initial version (v1) active
          </Badge>
        )}
      </div>

      {/* Comparison Delta Matrix */}
      {versions.length > 1 ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Regulatory Parameter</th>
                  <th className="px-4 py-3 font-mono">v{selectedV1} Baseline</th>
                  <th className="px-4 py-3 font-mono">v{selectedV2} Revised</th>
                  <th className="px-4 py-3">Geometric Variance</th>
                  <th className="px-4 py-3">Compliance Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-white">
                    Front Setback (Road Margin)
                  </td>
                  <td className="px-4 py-3 text-red-600 font-semibold">4.80 m (FAIL)</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">6.20 m (PASS)</td>
                  <td className="px-4 py-3 text-emerald-600 flex items-center gap-1 font-semibold">
                    <TrendingUp className="size-3.5" /> +1.40 m
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      RESOLVED
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-white">
                    Side Setback (East)
                  </td>
                  <td className="px-4 py-3 text-red-600 font-semibold">1.90 m (FAIL)</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">3.15 m (PASS)</td>
                  <td className="px-4 py-3 text-emerald-600 flex items-center gap-1 font-semibold">
                    <TrendingUp className="size-3.5" /> +1.25 m
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      RESOLVED
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-white">
                    Total Built-Up Area
                  </td>
                  <td className="px-4 py-3 text-slate-600">1,840.20 m²</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-semibold">1,780.45 m²</td>
                  <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                    <TrendingDown className="size-3.5" /> -59.75 m²
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="text-[11px] text-slate-500">Trimmed cantilever</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-white">
                    Ground Coverage Ratio
                  </td>
                  <td className="px-4 py-3 text-red-600">61.20 % (FAIL)</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">57.40 % (PASS)</td>
                  <td className="px-4 py-3 text-emerald-600 flex items-center gap-1">
                    <TrendingDown className="size-3.5" /> -3.80 %
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      RESOLVED
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-white">
                    Parking Provision
                  </td>
                  <td className="px-4 py-3 text-red-600">16 ECS (FAIL)</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">24 ECS (PASS)</td>
                  <td className="px-4 py-3 text-emerald-600 flex items-center gap-1 font-semibold">
                    <TrendingUp className="size-3.5" /> +8 ECS
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      RESOLVED
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Color Encoding Legend for 3D View */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950">
            <span className="font-semibold text-slate-700 dark:text-slate-300">3D Diff Color Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-emerald-500 ring-1 ring-emerald-400"></span>
              <span>Added in v{selectedV2}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-red-500 ring-1 ring-red-400"></span>
              <span>Removed from v{selectedV1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-amber-500 ring-1 ring-amber-400"></span>
              <span>Modified Geometry / Repositioned</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Version History Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="size-4 text-cyan-600" />
          Submission Audit Log & Revision History
        </h3>

        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver.version}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-100 font-bold font-mono text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-xs">
                    v{ver.version}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{ver.fileName}</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({(ver.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="size-3" /> {ver.uploadedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {new Date(ver.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {ver.status === "BIM_SCRUTINY_PASSED" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="size-3 mr-1" /> Scrutiny Passed
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      <XCircle className="size-3 mr-1" /> {ver.violationsCount} Violations
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">Submission Notes:</p>
                <p className="mt-0.5">{ver.summaryNotes}</p>
                <p className="mt-1 font-mono text-[10px] text-slate-400 truncate">
                  SHA-256: {ver.checksum}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
