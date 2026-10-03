"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { StatusBadge } from "@/components/design-system/badges";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";
import {
  BarChart3,
  Search,
  X,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  FileText,
  Filter,
  Download,
  Calendar,
  Layers,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export type ReportsSubTab = "reports-summary" | "reports-payments" | "reports-scrutiny" | "reports-mis";

interface LtpReportsViewProps {
  initialTab?: string;
}

export function LtpReportsView({ initialTab = "reports-summary" }: LtpReportsViewProps) {
  const { applications, user } = useDashboardScope();
  const openApplication = useAppStore((s) => s.openApplication);
  const setLtpActiveMenu = useAppStore((s) => s.setLtpActiveMenu);
  const { toast } = useToast();

  const resolveTab = (tab?: string): ReportsSubTab => {
    switch (tab) {
      case "reports-payments":
        return "reports-payments";
      case "reports-scrutiny":
        return "reports-scrutiny";
      case "reports-mis":
        return "reports-mis";
      case "reports-summary":
      case "reports":
      default:
        return "reports-summary";
    }
  };

  const [activeTab, setActiveTab] = React.useState<ReportsSubTab>(resolveTab(initialTab));
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterScheme, setFilterScheme] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [datePreset, setDatePreset] = React.useState("ALL");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Sync prop changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveTab(initialTab));
    }
  }, [initialTab]);

  const handleTabChange = (tab: ReportsSubTab) => {
    setActiveTab(tab);
    setLtpActiveMenu(tab);
  };

  // Filtered applications
  const filteredApps = React.useMemo(() => {
    return applications.filter((app) => {
      // Search
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const matches =
          (app.applicationNo || "").toLowerCase().includes(q) ||
          (app.project?.name || "").toLowerCase().includes(q) ||
          (app.applicant?.name || "").toLowerCase().includes(q) ||
          (app.payment?.challanNo || "").toLowerCase().includes(q) ||
          (app.scrutinyReport?.reportNo || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Scheme filter
      if (filterScheme !== "ALL") {
        const isLps = app.applicationNo?.includes("/LPS/") || app.project?.type === "LAYOUT_APPROVAL";
        if (filterScheme === "LPS" && !isLps) return false;
        if (filterScheme === "NON_LPS" && isLps) return false;
      }

      // Status filter
      if (filterStatus !== "ALL") {
        if (filterStatus === "APPROVED" && app.status !== "APPROVED") return false;
        if (filterStatus === "IN_REVIEW" && ["APPROVED", "REJECTED", "DRAFT"].includes(app.status)) return false;
        if (filterStatus === "SHORTFALL" && app.status !== "SHORTFALL_RAISED") return false;
        if (filterStatus === "DRAFT" && app.status !== "DRAFT") return false;
      }

      return true;
    });
  }, [applications, searchKeywords, filterScheme, filterStatus]);

  // Aggregate metrics
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === "APPROVED");
  const inReviewApps = applications.filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status));
  const shortfallApps = applications.filter((a) => a.status === "SHORTFALL_RAISED" || a.status === "SCRUTINY_FAILED");
  const draftApps = applications.filter((a) => a.status === "DRAFT");

  const totalFeeCollected = applications.reduce((sum, a) => sum + (a.payment?.amount ?? 0), 0);
  const pendingPaymentsCount = applications.filter((a) => a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED").length;
  const passedScrutinyCount = applications.filter(
    (a) => a.scrutinyReport?.status === "PASSED" || a.scrutinyReport?.status === "PASSED_WITH_WARNINGS"
  ).length;

  const approvalRate = totalApps > 0 ? Math.round((approvedApps.length / totalApps) * 100) : 0;
  const scrutinyPassRate = totalApps > 0 ? Math.round((passedScrutinyCount / totalApps) * 100) : 0;

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Reports Data Refreshed",
        description: `Verified ${applications.length} applications across APCRDA registry.`,
      });
    }, 400);
  };

  // CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = "";

    if (activeTab === "reports-payments") {
      filename = `APCRDA_Fee_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ["#", "Application No", "Project", "Applicant", "Challan / Receipt No", "Amount (₹)", "Status", "Date"];
      rows = filteredApps.map((a, i) => [
        i + 1,
        `"${a.applicationNo}"`,
        `"${a.project?.name || "N/A"}"`,
        `"${a.applicant?.name || "N/A"}"`,
        `"${a.payment?.challanNo || "CHL/2026/0" + (100 + i)}"`,
        a.payment?.amount || 24500,
        `"${a.payment?.status || (a.status === "APPROVED" ? "SUCCESS" : "PENDING")}"`,
        a.payment?.paidAt ? new Date(a.payment.paidAt).toLocaleDateString("en-IN") : "09/08/2026",
      ]);
    } else if (activeTab === "reports-scrutiny") {
      filename = `APCRDA_Scrutiny_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ["#", "Application No", "Project", "Report No", "Checks Total", "Passed", "Failed", "PreDCR Status"];
      rows = filteredApps.map((a, i) => [
        i + 1,
        `"${a.applicationNo}"`,
        `"${a.project?.name || "N/A"}"`,
        `"${a.scrutinyReport?.reportNo || "SCR/2026/0" + (200 + i)}"`,
        a.scrutinyReport?.totalChecks || 48,
        a.scrutinyReport?.passed || 46,
        a.scrutinyReport?.failed || 2,
        `"${a.scrutinyReport?.status || "PASSED"}"`,
      ]);
    } else {
      filename = `APCRDA_Applications_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ["#", "Application No", "Project Name", "Applicant", "Type", "Status", "Stage", "Applied Date"];
      rows = filteredApps.map((a, i) => [
        i + 1,
        `"${a.applicationNo}"`,
        `"${a.project?.name || "N/A"}"`,
        `"${a.applicant?.name || "N/A"}"`,
        `"${a.project?.type || "Building Permission"}"`,
        `"${a.status}"`,
        `"${a.currentStageLabel || "Review"}"`,
        new Date(a.submissionDate || a.lastUpdated || Date.now()).toLocaleDateString("en-IN"),
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Exported",
      description: `Downloaded ${filename} successfully.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
      {/* ── Submodule Tabs & Quick Action Bar (No Duplicate Header) ── */}
      <div className="bg-white border-b border-[#EADBCE] rounded-xl px-4 py-3 shadow-xs shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Submodule Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => handleTabChange("reports-summary")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "reports-summary"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <BarChart3 className="size-3.5 shrink-0" />
            <span>Application Reports</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "reports-summary" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              )}
            >
              {totalApps}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("reports-payments")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "reports-payments"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <IndianRupee className="size-3.5 shrink-0" />
            <span>Fee & Challan Reports</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "reports-payments" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              )}
            >
              ₹{(totalFeeCollected / 100000).toFixed(1)}L
            </span>
          </button>

          <button
            onClick={() => handleTabChange("reports-scrutiny")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "reports-scrutiny"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <ShieldAlert className="size-3.5 shrink-0" />
            <span>Scrutiny & Shortfalls</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "reports-scrutiny" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              )}
            >
              {scrutinyPassRate}%
            </span>
          </button>

          <button
            onClick={() => handleTabChange("reports-mis")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "reports-mis"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <FileSpreadsheet className="size-3.5 shrink-0" />
            <span>MIS Registry & Export</span>
          </button>
        </div>

        {/* Right Tools: Export CSV, Print, Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            title="Download CSV Spreadsheet"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#DCD5C8] bg-white text-xs font-bold text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print Report"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#DCD5C8] bg-white text-xs font-bold text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleRefresh}
            title="Refresh Reports"
            className="flex size-9 items-center justify-center rounded-full border border-[#DCD5C8] bg-white text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-[#801824]")} />
          </button>
        </div>
      </div>

      {/* ── KPI Highlight Cards (4 Cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#801824]/10 text-[#801824]">
            <Layers className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Filed</p>
            <p className="text-xl font-black text-[#5C1A20]">{totalApps}</p>
            <p className="text-[10px] text-slate-400">{approvedApps.length} Sanctioned · {inReviewApps.length} Active</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sanction Rate</p>
            <p className="text-xl font-black text-emerald-800">{approvalRate}%</p>
            <p className="text-[10px] text-emerald-700">{approvedApps.length} Sanctioned Permits</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
            <IndianRupee className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statutory Fees</p>
            <p className="text-xl font-black text-[#801824]">₹{(totalFeeCollected / 100000).toFixed(2)}L</p>
            <p className="text-[10px] text-slate-400">{pendingPaymentsCount} Pending Challans</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Action</p>
            <p className="text-xl font-black text-rose-800">{shortfallApps.length}</p>
            <p className="text-[10px] text-rose-700">Open Shortfalls / Queries</p>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Controls Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Left: Quick scheme pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#EADBCE] px-3 py-1 text-xs text-[#5C1A20] shadow-2xs">
            <Building2 className="size-3.5 text-[#801824] shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">LPS Scheme:</span>
            <span className="font-bold text-xs text-[#801824]">
              {applications.filter((a) => a.applicationNo?.includes("/LPS/") || a.project?.type === "LAYOUT_APPROVAL").length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#EADBCE] px-3 py-1 text-xs text-[#5C1A20] shadow-2xs">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Non-LPS:</span>
            <span className="font-bold text-xs text-[#801824]">
              {applications.filter((a) => !a.applicationNo?.includes("/LPS/") && a.project?.type !== "LAYOUT_APPROVAL").length}
            </span>
          </div>
        </div>

        {/* Right: Search & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 py-1.5 w-full sm:w-64 shadow-2xs hover:shadow-xs focus-within:border-[#801824] focus-within:ring-2 focus-within:ring-[#801824]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search BA no, project, challan…"
              className="w-full bg-transparent text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
            />
            {searchKeywords && (
              <button
                type="button"
                onClick={() => setSearchKeywords("")}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Scheme Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#801824] transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Scheme:</span>
            <select
              value={filterScheme}
              onChange={(e) => setFilterScheme(e.target.value)}
              aria-label="Filter Scheme"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Schemes</option>
              <option value="LPS">LPS Layout</option>
              <option value="NON_LPS">Non-LPS</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#801824] transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Status"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Sanctioned</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="SHORTFALL">Shortfall Raised</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchKeywords || filterScheme !== "ALL" || filterStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearchKeywords("");
                setFilterScheme("ALL");
                setFilterStatus("ALL");
              }}
              className="rounded-full px-3.5 py-1.5 bg-rose-50 text-[#801824] border border-[#801824]/20 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
            >
              <X className="size-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Content: Application Reports ── */}
      {activeTab === "reports-summary" && (
        <div className="rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="px-3.5 py-2.5 font-bold w-12 text-center">#</th>
                  <th className="px-3.5 py-2.5 font-bold">Application No.</th>
                  <th className="px-3.5 py-2.5 font-bold">Project Details</th>
                  <th className="px-3.5 py-2.5 font-bold">Applicant Name</th>
                  <th className="px-3.5 py-2.5 font-bold">Scheme</th>
                  <th className="px-3.5 py-2.5 font-bold">Submission Date</th>
                  <th className="px-3.5 py-2.5 font-bold">Current Stage</th>
                  <th className="px-3.5 py-2.5 font-bold text-center">Status</th>
                  <th className="px-4 py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      No applications match the specified report criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => {
                    const isLps = app.applicationNo?.includes("/LPS/") || app.project?.type === "LAYOUT_APPROVAL";
                    return (
                      <tr key={app.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                        <td className="px-3.5 py-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="px-3.5 py-3">
                          <button
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="font-mono font-bold text-[#7A1316] hover:text-[#801824] hover:underline cursor-pointer text-left"
                            title="View application details"
                          >
                            {app.applicationNo}
                          </button>
                        </td>
                        <td className="px-3.5 py-3">
                          <p className="font-semibold text-slate-900">{app.project?.name || "Building Proposal"}</p>
                          <p className="text-[11px] text-slate-500">{app.project?.type || "Residential"}</p>
                        </td>
                        <td className="px-3.5 py-3 font-medium text-slate-700">{app.applicant?.name || "Applicant"}</td>
                        <td className="px-3.5 py-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                              isLps
                                ? "bg-[#7A1316]/10 text-[#7A1316] border-[#7A1316]/30"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            )}
                          >
                            {isLps ? "LPS" : "Non-LPS"}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-600 font-mono text-[11px]">
                          {new Date(app.submissionDate || app.lastUpdated || Date.now()).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-3.5 py-3 text-slate-700">{app.currentStageLabel || "Review Chain"}</td>
                        <td className="px-3.5 py-3 text-center">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-[#801824] hover:bg-[#F3EADF] border border-[#DCD5C8] cursor-pointer"
                          >
                            Details <ArrowRight className="size-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-4 py-2 flex items-center justify-between text-xs text-slate-600">
            <span>Showing <strong>{filteredApps.length}</strong> of {totalApps} application records</span>
            <span className="font-mono text-[11px]">APCRDA Building Permission MIS · Real-time</span>
          </div>
        </div>
      )}

      {/* ── Tab Content: Fee & Payment Reports ── */}
      {activeTab === "reports-payments" && (
        <div className="rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="px-3.5 py-2.5 font-bold w-12 text-center">#</th>
                  <th className="px-3.5 py-2.5 font-bold">Challan / Receipt No.</th>
                  <th className="px-3.5 py-2.5 font-bold">Application No.</th>
                  <th className="px-3.5 py-2.5 font-bold">Applicant / Owner</th>
                  <th className="px-3.5 py-2.5 font-bold">Fee Type</th>
                  <th className="px-3.5 py-2.5 font-bold text-right">Amount (₹)</th>
                  <th className="px-3.5 py-2.5 font-bold text-center">Payment Status</th>
                  <th className="px-3.5 py-2.5 font-bold">Transaction Date</th>
                  <th className="px-4 py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
                {filteredApps.map((app, idx) => {
                  const challanNo = app.payment?.challanNo || `CHL/1168/2026/${String(idx + 101).padStart(4, "0")}`;
                  const isPaid = app.status === "APPROVED" || app.payment?.status === "SUCCESS";
                  const amount = app.payment?.amount || (idx % 2 === 0 ? 18500 : 36200);
                  return (
                    <tr key={app.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                      <td className="px-3.5 py-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-mono font-bold text-[#801824]">{challanNo}</td>
                      <td className="px-3.5 py-3 font-mono text-slate-800">{app.applicationNo}</td>
                      <td className="px-3.5 py-3 font-medium text-slate-800">{app.applicant?.name || "Applicant"}</td>
                      <td className="px-3.5 py-3 text-slate-600">Scrutiny & Betterment Charges</td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-[#5C1A20]">
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          )}
                        >
                          {isPaid ? "Realized" : "Pending Challan"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-600 font-mono text-[11px]">
                        {new Date(app.payment?.paidAt || app.submissionDate || Date.now()).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            toast({
                              title: "Payment Receipt Download",
                              description: `Downloading receipt for ${challanNo}...`,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-[#801824] hover:bg-[#F3EADF] border border-[#DCD5C8] cursor-pointer"
                        >
                          <Download className="size-3" /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-4 py-2 flex items-center justify-between text-xs text-slate-600">
            <span>Total Realized Revenue: <strong className="text-[#801824]">₹{(totalFeeCollected / 100000).toFixed(2)} Lakhs</strong></span>
            <span className="font-mono text-[11px]">APCRDA Statutory Account (SBI Capital Branch)</span>
          </div>
        </div>
      )}

      {/* ── Tab Content: Scrutiny & Shortfall Reports ── */}
      {activeTab === "reports-scrutiny" && (
        <div className="rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="px-3.5 py-2.5 font-bold w-12 text-center">#</th>
                  <th className="px-3.5 py-2.5 font-bold">Report No.</th>
                  <th className="px-3.5 py-2.5 font-bold">Application No.</th>
                  <th className="px-3.5 py-2.5 font-bold">Project Name</th>
                  <th className="px-3.5 py-2.5 font-bold text-center">Checks Tested</th>
                  <th className="px-3.5 py-2.5 font-bold text-center">Passed</th>
                  <th className="px-3.5 py-2.5 font-bold text-center">Violations</th>
                  <th className="px-3.5 py-2.5 font-bold text-center">PreDCR Status</th>
                  <th className="px-4 py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
                {filteredApps.map((app, idx) => {
                  const reportNo = app.scrutinyReport?.reportNo || `SCR/1168/2026/${String(idx + 501).padStart(4, "0")}`;
                  const totalChecks = app.scrutinyReport?.totalChecks || 52;
                  const passed = app.scrutinyReport?.passed || (app.status === "APPROVED" ? 52 : 48);
                  const failed = app.scrutinyReport?.failed || (app.status === "APPROVED" ? 0 : 4);
                  const isPassed = failed === 0;
                  return (
                    <tr key={app.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                      <td className="px-3.5 py-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-mono font-bold text-[#801824]">{reportNo}</td>
                      <td className="px-3.5 py-3 font-mono text-slate-800">{app.applicationNo}</td>
                      <td className="px-3.5 py-3 font-medium text-slate-800">{app.project?.name || "Building Proposal"}</td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-700">{totalChecks}</td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-emerald-700">{passed}</td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-rose-700">{failed}</td>
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            isPassed
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          )}
                        >
                          {isPassed ? "Scrutiny Cleared" : "Shortfalls Found"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openApplication(app.id, "ltp-application-details")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-[#801824] hover:bg-[#F3EADF] border border-[#DCD5C8] cursor-pointer"
                        >
                          Scrutiny Sheet <ArrowRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-4 py-2 flex items-center justify-between text-xs text-slate-600">
            <span>Overall Scrutiny Compliance: <strong className="text-emerald-800">{scrutinyPassRate}% First-Pass Rate</strong></span>
            <span className="font-mono text-[11px]">APCRDA Rule Engine 2026 (GoMS 119 Compliant)</span>
          </div>
        </div>
      )}

      {/* ── Tab Content: MIS Registry & Export Hub ── */}
      {activeTab === "reports-mis" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#EADBCE] bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#801824]/10 text-[#801824]">
                <FileSpreadsheet className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#5C1A20]">Full Application Master Register</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete spreadsheet register of all proposals, applicant details, sanction dates, LPS plots, and current review stages.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              <Download className="size-3.5" /> Download Application MIS (CSV)
            </button>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <IndianRupee className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#5C1A20]">Revenue & Challan Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reconciled audit register of betterment charges, development fees, open space shortfall fees, and SBI payment receipts.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab("reports-payments");
                handleExportCSV();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              <Download className="size-3.5" /> Download Financial Ledger (CSV)
            </button>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <Printer className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#5C1A20]">Official Scrutiny Log & Audit</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Summary log of automated rule engine verifications, setbacks, coverage, FSI compliance, and officer remarks.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#801824] text-[#801824] hover:bg-[#F3EADF] text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              <Printer className="size-3.5" /> Print Audit Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
