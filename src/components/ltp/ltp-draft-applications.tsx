"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  CheckCircle2,
  ChevronsUpDown,
  FileSpreadsheet,
  Table as TableIcon,
  ExternalLink,
  RefreshCw,
  FileText,
  Printer,
  X,
  Download,
  Search,
  Plus,
} from "lucide-react";
import type { Application } from "@/types";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { LtpSubmissionDetails } from "./ltp-submission-details";
import { DetailedScrutinyReport } from "./detailed-scrutiny-report";

interface DraftItem {
  id: string;
  baNo: string;
  permissionType: string;
  createdDate: string;
  status: string;
  owner: string;
  appId?: string;
  lpsType?: "LPS Layout" | "Non-LPS";
}

export function LtpDraftApplications({
  onNewApp,
}: {
  onNewApp?: (appType?: string) => void;
}) {
  const { applications } = useDashboardScope();
  const user = useAppStore((s) => s.user);
  const openApplication = useAppStore((s) => s.openApplication);

  // Search & Filter State
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterType, setFilterType] = React.useState("ALL");
  const [filterOwner, setFilterOwner] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<keyof DraftItem>("createdDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedDraft, setSelectedDraft] = React.useState<DraftItem | null>(null);
  const [viewReportModal, setViewReportModal] = React.useState(false);
  const [reportModalTab, setReportModalTab] = React.useState<"scrutiny" | "registry">("scrutiny");

  // Compute draft proposals from store or include the standard APCRDA demo draft
  const draftItems: DraftItem[] = React.useMemo(() => {
    const userDrafts = applications.filter(
      (a) => a.status === "DRAFT"
    );

    // Format draft items
    const items: DraftItem[] = userDrafts.map((a, idx) => {
      // Format BA No: if not already D or Temp, format as APCRDA draft number starting with D/
      const ba = a.applicationNo.startsWith("D/")
        ? a.applicationNo
        : a.applicationNo.startsWith("Temp/")
        ? a.applicationNo.replace(/^Temp\//, "D/")
        : `D/1168/0267/BP/${new Date(a.submissionDate || Date.now()).getFullYear()}`;

      const created = new Date(a.submissionDate || a.lastUpdated || Date.now());
      const dateStr = `${created.getDate()}/${created.getMonth() + 1}/${created.getFullYear()}`;

      const typeLabel =
        a.project?.type === "LAYOUT_APPROVAL" || a.project?.type === "DEVELOPMENT_PERMIT"
          ? "Group Development"
          : "Building Permission";

      return {
        id: a.id || `draft-${idx}`,
        baNo: ba,
        permissionType: typeLabel,
        createdDate: dateStr,
        status: "Draft",
        owner: a.applicant?.name || "",
        appId: a.id,
      };
    });

    // Ensure the proposal shown in the screenshot is present if no matching draft exists
    const hasDefaultProposal = items.some((i) => i.baNo === "D/1168/0267/BP/2026");
    if (!hasDefaultProposal) {
      items.unshift({
        id: "draft-sample-1",
        baNo: "D/1168/0267/BP/2026",
        permissionType: "Building Permission",
        createdDate: "26/9/2026",
        status: "Draft",
        owner: "",
        appId: userDrafts[0]?.id || applications[0]?.id,
      });
    }

    return items;
  }, [applications, user]);

  // Filtering
  const filteredItems = React.useMemo(() => {
    return draftItems.filter((item) => {
      // Keyword search
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const matches =
          item.baNo.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Column filters
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;
      if (filterOwner !== "ALL" && item.owner !== filterOwner) return false;

      return true;
    });
  }, [draftItems, searchKeywords, filterType, filterOwner]);

  // Sorting
  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortAsc]);

  const handleSort = (field: keyof DraftItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenDraft = (item: DraftItem) => {
    setSelectedDraft(item);
  };

  const exportCSV = () => {
    const headers = ["#", "BA No.", "Permission Type", "Created Date", "Owner"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.permissionType}"`,
      item.createdDate,
      `"${item.owner}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Draft_Proposals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user opened a specific draft, render the comprehensive details view
  if (selectedDraft) {
    return (
      <LtpSubmissionDetails
        baNo={selectedDraft.baNo}
        proposalStatus={selectedDraft.status}
        submissionDate={selectedDraft.createdDate}
        isDraft={true}
        initialLpsType={selectedDraft.lpsType || (selectedDraft.baNo.includes("/LPS/") ? "LPS Layout" : "Non-LPS")}
        onBack={() => setSelectedDraft(null)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS: Search & Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        {/* Left: Search Bar & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input Box (Pillow-shaped) */}
          <div className="flex items-center gap-2.5 border border-[#DCD5C8] bg-white rounded-full px-4 py-2 w-full sm:w-80 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search by draft no, owner, permission type..."
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

          {/* Filter: Permission Type (Pillow-shaped) */}
          <div className="flex items-center gap-2.5 bg-white border border-[#DCD5C8] rounded-full px-4 py-2 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by Permission Type"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-2"
            >
              <option value="ALL">All Types</option>
              <option value="Building Permission">Building Permission</option>
              <option value="Group Development">Group Development</option>
            </select>
          </div>

          {/* Filter: Owner (Pillow-shaped) */}
          <div className="flex items-center gap-2.5 bg-white border border-[#DCD5C8] rounded-full px-4 py-2 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Owner:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              aria-label="Filter by Owner"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-2"
            >
              <option value="ALL">All Owners</option>
              <option value="New">New</option>
            </select>
          </div>

          {/* Clear Filters Button (Pillow-shaped) */}
          {(searchKeywords || filterType !== "ALL" || filterOwner !== "ALL") && (
            <button
              onClick={() => {
                setSearchKeywords("");
                setFilterType("ALL");
                setFilterOwner("ALL");
              }}
              className="rounded-full px-3.5 py-1.5 bg-red-50 text-[#7A1316] border border-[#7A1316]/20 hover:bg-red-100 hover:border-[#7A1316]/40 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
            >
              <X className="size-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Right side: New Application Button */}
        {onNewApp && (
          <div className="relative shrink-0 self-start sm:self-auto">
            <button
              id="draft-new-app-btn"
              onClick={() => onNewApp()}
              className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs h-[34px] px-4 rounded-full flex items-center gap-2 shadow-xs transition-colors cursor-pointer border border-[#630E10]"
            >
              <Plus className="size-3.5" />
              <span>New Application</span>
            </button>
          </div>
        )}
      </div>

      {/* ── TABLE CONTAINER (Maroon & Beige Theme) ── */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header Row */}
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
              <tr className="divide-x divide-[#DCD5C8]">
                <th className="w-12 px-2.5 py-2.5 text-center font-bold">#</th>

                <th
                  onClick={() => handleSort("baNo")}
                  className="px-4 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-64 min-w-[220px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Draft No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("permissionType")}
                  className="px-4 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-56 min-w-[180px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Permission Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("owner")}
                  className="px-4 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none flex-1 min-w-[240px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Owner / Applicant</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("createdDate")}
                  className="px-4 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-44 min-w-[140px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Created Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-28 min-w-[100px] px-3.5 py-2.5 font-bold text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DCD5C8] bg-white">
              {sortedItems.length > 0 ? (
                sortedItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="divide-x divide-[#EFE7DC] hover:bg-[#FAF4EB] transition-colors"
                  >
                    {/* Index */}
                    <td className="px-2.5 py-2.5 text-center font-medium text-slate-700">{idx + 1}</td>

                    {/* Draft No. */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDraft(item)}
                        className="inline-flex items-center gap-1.5 text-[#7A1316] hover:text-[#8F161A] font-bold hover:underline cursor-pointer text-left font-mono"
                        title="Click to view and continue this draft"
                      >
                        <span>{item.baNo}</span>
                        <ExternalLink className="size-3 text-[#7A1316]/60 hover:text-[#7A1316]" />
                      </button>
                    </td>

                    {/* Permission Type */}
                    <td className="px-4 py-2.5 text-slate-800 font-medium whitespace-nowrap">{item.permissionType}</td>

                    {/* Owner / Applicant */}
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{item.owner || "New Proposal"}</td>

                    {/* Created Date */}
                    <td className="px-4 py-2.5 text-slate-700 tabular-nums whitespace-nowrap">{item.createdDate}</td>

                    {/* Action: Resume */}
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDraft(item)}
                        className="rounded-full px-4 py-1.5 bg-[#7A1316]/10 hover:bg-[#7A1316] text-[#7A1316] hover:text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Resume
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No draft proposals found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE FOOTER: Pagination / Export on Left | Total Proposal(s) on Right ── */}
        <div className="border-t-2 border-[#DCD5C8] bg-[#F5EBE1] px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
          {/* Left: Page Navigator & Export Controls */}
          <div className="flex items-center gap-3">
            {/* Page number */}
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center size-6 bg-white border border-[#DCD5C8] text-slate-800 font-bold text-xs rounded-full shadow-2xs">
                1
              </span>
            </div>

            {/* Export & Refresh buttons */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#DCD5C8]">
              <button
                onClick={() => {
                  setSearchKeywords("");
                  setFilterType("ALL");
                  setFilterOwner("ALL");
                }}
                title="Refresh Table"
                className="px-2.5 py-1 hover:bg-white rounded-full transition-colors text-slate-700 hover:text-[#7A1316] cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                <span className="text-[11px] font-medium">Refresh</span>
              </button>

              <button
                type="button"
                id="drafts-view-report-btn"
                onClick={() => setViewReportModal(true)}
                title="View report"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#FBF3E4] text-[#7A1316] hover:text-[#8F161A] border border-[#DCD5C8] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="size-3.5 text-[#7A1316]" />
                <span>View report</span>
              </button>

              <button
                onClick={exportCSV}
                title="Export to Excel / CSV"
                className="px-2.5 py-1 hover:bg-white rounded-full transition-colors text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="size-3.5" />
                <span className="text-[11px] font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Right: Total Proposals Count */}
          <div className="font-medium text-slate-700 text-xs">
            <span>Total Draft(s): </span>
            <span className="font-bold text-[#7A1316]">{sortedItems.length}</span>
          </div>
        </div>
      </div>

      {/* ── VIEW REPORT MODAL ── */}
      {viewReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#7A1316] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    {reportModalTab === "scrutiny"
                      ? "Detailed Scrutiny Report"
                      : "Draft Proposals Summary Report"}
                  </h3>
                  <p className="text-[10px] text-amber-200/90 font-mono">
                    APCRDA Building Permission Management System
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2">
                <div className="bg-black/25 rounded p-0.5 flex items-center text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setReportModalTab("scrutiny")}
                    className={cn(
                      "px-2.5 py-1 rounded transition-colors cursor-pointer",
                      reportModalTab === "scrutiny"
                        ? "bg-white text-[#7A1316] shadow-2xs"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    Detailed Scrutiny Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalTab("registry")}
                    className={cn(
                      "px-2.5 py-1 rounded transition-colors cursor-pointer",
                      reportModalTab === "registry"
                        ? "bg-white text-[#7A1316] shadow-2xs"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    Registry Summary
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Print Report"
                >
                  <Printer className="size-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewReportModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer ml-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {reportModalTab === "scrutiny" ? (
                <DetailedScrutinyReport
                  proposalNo={sortedItems[0]?.baNo || "N/A"}
                  projectTitle={sortedItems[0]?.owner ? `${sortedItems[0].owner} (1)` : "VADDURI VEERAIAH GARU (1)"}
                  zone="R3-Medium to High density zone"
                  typology="AP1-Apartment"
                  onClose={() => setViewReportModal(false)}
                />
              ) : (
                <>
                  {/* Report Metadata Strip */}
                  <div className="bg-white border border-[#DCD5C8] rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Generated On</span>
                      <span className="font-mono font-bold text-slate-900">{new Date().toLocaleDateString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Generated By</span>
                      <span className="font-bold text-slate-900">{user?.name || "Licensed Technical Personnel"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Report Scope</span>
                      <span className="font-bold text-[#7A1316]">Draft Applications</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Records</span>
                      <span className="font-mono font-bold text-slate-900">{sortedItems.length} Proposals</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-[#DCD5C8] rounded-lg overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#7A1316] text-white font-bold border-b border-[#630E10]">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center">#</th>
                          <th className="px-3 py-2">Proposal / BA No.</th>
                          <th className="px-3 py-2">Permission Type</th>
                          <th className="px-3 py-2">Created Date</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Owner / Applicant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCD5C8]">
                        {sortedItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-[#FBF3E4]/50 transition-colors">
                            <td className="px-3 py-2 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono font-bold text-[#7A1316]">{item.baNo}</td>
                            <td className="px-3 py-2 text-slate-800">{item.permissionType}</td>
                            <td className="px-3 py-2 text-slate-600 font-mono">{item.createdDate}</td>
                            <td className="px-3 py-2">
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-700">{item.owner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-5 py-2.5 flex items-center justify-between text-slate-600 text-xs shrink-0">
              <span className="text-[11px] italic">Official APCRDA BBAS Draft Proposal Registry Report</span>
              <button
                type="button"
                onClick={() => setViewReportModal(false)}
                className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold px-4 py-1.5 rounded transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
