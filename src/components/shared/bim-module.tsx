"use client";

import * as React from "react";
import {
  Box,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  UploadCloud,
  Layers,
  Sparkles,
  BarChart3,
  Eye,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/design-system/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { BimWorkspaceContainer } from "@/components/bim/bim-workspace-container";
import { MOCK_BIM_MODELS } from "@/data/mock-bim-data";

export function BimModule() {
  const { applications, user, navigate, portal } = useAppStore();
  const [selectedAppId, setSelectedAppId] = React.useState<string>("MC/BP/2026/04/0001");
  const [searchQuery, setSearchQuery] = React.useState("");

  const drawings2DPortalView = portal === "SUPER_ADMIN" ? "admin-2d-drawings" : portal === "OFFICER" ? "officer-2d-drawings" : "ltp-2d-drawings";

  const bimAppsList = React.useMemo(() => {
    return applications.map((app) => {
      const bimData = MOCK_BIM_MODELS[app.applicationNo];
      const hasBim = !!bimData;
      const status = bimData ? bimData.status : "BIM_NOT_SUBMITTED";
      const violations = bimData ? bimData.rules.filter((r) => r.status === "FAIL").length : 0;
      return {
        ...app,
        hasBim,
        bimStatus: status,
        bimVersion: bimData?.currentVersion || 1,
        violationsCount: violations,
        activeFileName: bimData?.activeFileName || "Model_Pending.ifc",
      };
    });
  }, [applications]);

  const filteredApps = bimAppsList.filter(
    (a) =>
      a.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.applicant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="3D BIM Scrutiny & Digital Twin Module"
        description="Independent spatial engine for 3D IFC model validation, DCR compliance scrutiny, and digital twin analysis."
        icon={Box}
        badge={
          <Badge variant="outline" className="border-cyan-500/40 text-cyan-600 bg-cyan-50 dark:bg-cyan-950 dark:text-cyan-300">
            3D Spatial Twin
          </Badge>
        }
      />

      {/* Application Selector Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Application Reference:
            </span>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              {bimAppsList.map((app) => (
                <option key={app.id} value={app.applicationNo}>
                  {app.applicationNo} — {app.project.name} ({app.bimStatus === "BIM_SCRUTINY_PASSED" ? "PASS" : "FAIL"})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Selected Application ID: <span className="font-mono font-semibold text-cyan-600">{selectedAppId}</span>
          </div>
        </div>
      </div>

      {/* Embedded BIM Workspace for the Selected Application */}
      <BimWorkspaceContainer
        applicationId={selectedAppId}
        userRole={user?.role || "LTP"}
      />
    </div>
  );
}
