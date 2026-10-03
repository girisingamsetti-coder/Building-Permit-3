"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  CheckCircle2,
  ChevronsUpDown,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  FileText,
  Printer,
  X,
  Download,
  Search,
} from "lucide-react";
import { LtpSubmissionDetails } from "./ltp-submission-details";
import { DetailedScrutinyReport } from "./detailed-scrutiny-report";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";

export interface SubmissionItem {
  id: string;
  baNo: string;
  permissionType: string;
  submittedDate: string;
  status: string;
  owner: string;
  appId?: string;
  lpsType: "LPS" | "Non LPS";
}

const DEFAULT_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub-1",
    baNo: "1168/0142/BP/10/015/2026",
    permissionType: "Building Permission",
    lpsType: "LPS",
    submittedDate: "23/7/2026",
    status: "In Review",
    owner: "Vadduri Veeraiah",
  },
  {
    id: "sub-2",
    baNo: "1168/0205/BP/10/018/2026",
    permissionType: "Building Permission",
    lpsType: "Non LPS",
    submittedDate: "15/8/2026",
    status: "In Review",
    owner: "Smt. Meena Kulkarni",
  },
  {
    id: "sub-3",
    baNo: "1168/0089/GD/10/004/2026",
    permissionType: "Group Development",
    lpsType: "LPS",
    submittedDate: "04/9/2026",
    status: "In Review",
    owner: "M. Lakshmi Narayana",
  },
  {
    id: "sub-4",
    baNo: "1168/0312/BP/10/022/2026",
    permissionType: "Building Permission",
    lpsType: "Non LPS",
    submittedDate: "18/9/2026",
    status: "In Review",
    owner: "Shri. Suresh Reddy",
  },
  {
    id: "sub-5",
    baNo: "1168/0055/BP/10/002/2026",
    permissionType: "Building Permission",
    lpsType: "LPS",
    submittedDate: "10/6/2026",
    status: "Approved",
    owner: "P. Srinivasa Rao",
  },
];

export function LtpSubmittedApplications({
  onNewApp,
}: {
  onNewApp?: (appType?: string) => void;
}) {
  const { applications } = useDashboardScope();
  const user = useAppStore((s) => s.user);

  // Search & Filter State
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterType, setFilterType] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [filterOwner, setFilterOwner] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<keyof SubmissionItem>("submittedDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [isSelectingScheme, setIsSelectingScheme] = React.useState(false);
  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionItem | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [viewReportModal, setViewReportModal] = React.useState(false);
  const [reportModalTab, setReportModalTab] = React.useState<"scrutiny" | "registry">("scrutiny");

  // Compute submitted proposals from store combined with default authentic APCRDA submissions
  const submissionItems: SubmissionItem[] = React.useMemo(() => {
    // Filter non-draft applications
    const storeSubmitted: SubmissionItem[] = applications
      .filter((a) => a.status !== "DRAFT")
      .map((a, idx) => {
        const subDate = new Date(a.submissionDate || a.lastUpdated || Date.now());
        const dateStr = `${subDate.getDate()}/${subDate.getMonth() + 1}/${subDate.getFullYear()}`;
        const typeLabel =
          a.project?.type === "LAYOUT_APPROVAL" || a.project?.type === "DEVELOPMENT_PERMIT"
            ? "Group Development"
            : "Building Permission";

        const statusLabel =
          a.status === "APPROVED" ? "Approved" : "In Review";

        // Determine LPS vs Non LPS status
        let lpsStatus: "LPS" | "Non LPS" = "Non LPS";
        if (
          (a as any).data?.general?.lpsLayout === "LPS Layout" ||
          (a as any).lpsType === "LPS" ||
          (a as any).lpsType === "LPS Layout" ||
          a.applicationNo?.includes("/LPS/")
        ) {
          lpsStatus = "LPS";
        } else if (
          (a as any).data?.general?.lpsLayout === "Non-LPS" ||
          (a as any).lpsType === "Non-LPS" ||
          (a as any).lpsType === "Non LPS"
        ) {
          lpsStatus = "Non LPS";
        } else {
          lpsStatus = idx % 2 === 0 ? "LPS" : "Non LPS";
        }

        return {
          id: a.id || `sub-store-${idx}`,
          baNo: a.applicationNo || `1168/${String(100 + idx).padStart(4, "0")}/BP/10/015/2026`,
          permissionType: typeLabel,
          lpsType: lpsStatus,
          submittedDate: dateStr,
          status: statusLabel,
          owner: a.applicant?.name || "Applicant",
          appId: a.id,
        };
      });

    // Merge store items with defaults (avoid duplicate BA numbers)
    const existingBaNos = new Set(storeSubmitted.map((s) => s.baNo));
    const merged: SubmissionItem[] = [...storeSubmitted];

    for (const d of DEFAULT_SUBMISSIONS) {
      if (!existingBaNos.has(d.baNo)) {
        merged.push(d);
        existingBaNos.add(d.baNo);
      }
    }

    return merged;
  }, [applications]);

  // Filtering
  const filteredItems = React.useMemo(() => {
    return submissionItems.filter((item) => {
      // Keyword search
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const matches =
          item.baNo.toLowerCase().includes(q) ||
          item.lpsType.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Column filters
      if (filterType !== "ALL" && item.lpsType !== filterType) return false;
      if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
      if (filterOwner !== "ALL" && item.owner !== filterOwner) return false;

      return true;
    });
  }, [submissionItems, searchKeywords, filterType, filterStatus, filterOwner]);

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

  const handleSort = (field: keyof SubmissionItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const exportCSV = () => {
    const headers = ["#", "BA No.", "Type", "Submitted Date", "Status", "Owner"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.lpsType}"`,
      item.submittedDate,
      `"${item.status}"`,
      `"${item.owner}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Submitted_Applications_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateNewApp = (scheme: "LPS Layout" | "Non-LPS") => {
    setIsSelectingScheme(false);
    const now = new Date();
    const typeCode = scheme === "LPS Layout" ? "LPS" : "BP";
    const newDraftNo = `D/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/${typeCode}/${now.getFullYear()}`;
    const newLpsStatus: "LPS" | "Non LPS" = scheme === "LPS Layout" ? "LPS" : "Non LPS";
    setSelectedSubmission({
      id: `sub-new-${Date.now()}`,
      baNo: newDraftNo,
      permissionType: scheme === "LPS Layout" ? "LPS Building Permission" : "Building Permission",
      submittedDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      status: "Draft",
      owner: "",
      lpsType: newLpsStatus,
    });
  };

  // If user opened a specific submitted application, render the full details view
  if (selectedSubmission) {
    return (
      <LtpSubmissionDetails
        baNo={selectedSubmission.baNo}
        proposalStatus={selectedSubmission.status}
        submissionDate={selectedSubmission.submittedDate}
        isDraft={false}
        initialLpsType={selectedSubmission.lpsType === "LPS" ? "LPS Layout" : "Non-LPS"}
        onBack={() => setSelectedSubmission(null)}
      />
    );
  }

  // If user selected to create a new application, show the screen with 2 buttons: "LPS" and "Non LPS"
  if (isSelectingScheme) {
    return (
      <div className="w-full h-full bg-[#FAF7F2] p-4 sm:p-6 flex flex-col font-sans text-slate-800 overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DCD5C8] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSelectingScheme(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DCD5C8] bg-white text-xs font-bold text-slate-700 hover:bg-[#FBF3E4] hover:text-[#7A1316] transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" /> Back to Submissions
            </button>
            <div>
              <h1 className="text-xl font-black text-[#7A1316] tracking-tight">New Application</h1>
              <p className="text-xs text-slate-600">Select application scheme to open respective statutory form</p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20">
            APCRDA Capital City &amp; Zonal Region
          </span>
        </div>

        {/* Center Contents: 2 Buttons "LPS" and "Non LPS" */}
        <div className="max-w-4xl w-full mx-auto my-auto py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#7A1316] tracking-tight">Select Application Scheme</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
              Please choose whether your site is part of the Amaravati Land Pooling Scheme (LPS) or a Non-LPS layout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Button 1: LPS */}
            <button
              id="sub-new-app-btn-lps"
              onClick={() => handleCreateNewApp("LPS Layout")}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl font-black text-[#7A1316] group-hover:scale-105 transition-transform">LPS</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7A1316] text-white">LPS Layout</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1">Land Pooling Scheme Layout Application</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For plots situated inside the Amaravati Capital City Land Pooling Scheme. Includes LPS Block No, LPS Survey No, LPS Plot No, and APCRDA pre-approved zoning districts (R3).
              </p>
              <div className="mt-auto pt-3 border-t border-[#DCD5C8] flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                  Open LPS Application <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Fast-track Scrutiny</span>
              </div>
            </button>

            {/* Button 2: Non LPS */}
            <button
              id="sub-new-app-btn-non-lps"
              onClick={() => handleCreateNewApp("Non-LPS")}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-slate-300 hover:border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl font-black text-slate-800 group-hover:text-[#7A1316] group-hover:scale-105 transition-transform">Non LPS</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#7A1316] group-hover:text-white transition-colors">Non-LPS Layout</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1">Non-LPS / Revenue Village / Gramkantam</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For general revenue lands, Gramkantam, extended habitation, private layouts, and village settlement plots requiring Mandal, Village, and Survey verification.
              </p>
              <div className="mt-auto pt-3 border-t border-[#DCD5C8] flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                  Open Non LPS Application <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Standard Revenue Scrutiny</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS: Search, Filters & New Application Button in a Single Row ── */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* Search Input Box (Pillow-shaped) */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 py-1.5 w-full sm:w-60 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search BA no., owner, status..."
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

          {/* Filter: Type (LPS or Non LPS - Pillow-shaped) */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by Type"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Types</option>
              <option value="LPS">LPS</option>
              <option value="Non LPS">Non LPS</option>
            </select>
          </div>

          {/* Filter: Status (Pillow-shaped) */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by Status"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Status</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          {/* Filter: Owner (Pillow-shaped) */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Owner:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              aria-label="Filter by Owner"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1 max-w-[130px] truncate"
            >
              <option value="ALL">All Owners</option>
              <option value="Vadduri Veeraiah">Vadduri Veeraiah</option>
              <option value="Smt. Meena Kulkarni">Smt. Meena Kulkarni</option>
              <option value="M. Lakshmi Narayana">M. Lakshmi Narayana</option>
              <option value="Shri. Suresh Reddy">Shri. Suresh Reddy</option>
              <option value="P. Srinivasa Rao">P. Srinivasa Rao</option>
            </select>
          </div>

          {/* Clear Filters Button (Pillow-shaped) */}
          {(searchKeywords || filterType !== "ALL" || filterStatus !== "ALL" || filterOwner !== "ALL") && (
            <button
              onClick={() => {
                setSearchKeywords("");
                setFilterType("ALL");
                setFilterStatus("ALL");
                setFilterOwner("ALL");
              }}
              className="rounded-full px-3 py-1.5 bg-red-50 text-[#7A1316] border border-[#7A1316]/20 hover:bg-red-100 hover:border-[#7A1316]/40 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
            >
              <X className="size-3" />
              <span>Clear</span>
            </button>
          )}

          {/* Right: New Application Button (after filters) */}
          <button
            id="sub-new-app-btn"
            onClick={() => setIsSelectingScheme(true)}
            className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs h-[30px] px-3.5 rounded-full flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer border border-[#630E10]"
          >
            <Plus className="size-3.5" />
            <span>New Application</span>
          </button>
      </div>

      {/* ── TABLE CONTAINER (Maroon & Beige Theme) ── */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header Row (Matches Drafts Table Layout) */}
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
              <tr className="divide-x divide-[#DCD5C8]">
                <th className="w-12 px-2.5 py-2 text-center font-bold">#</th>

                <th
                  onClick={() => handleSort("baNo")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>BA No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("lpsType")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-28"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("submittedDate")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-32"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Submitted Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-52"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Status</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("owner")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Owner</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-16 px-2.5 py-2 font-bold text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body with Submissions data */}
            <tbody className="divide-y divide-[#DCD5C8] bg-white">
              {sortedItems.length > 0 ? (
                sortedItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="divide-x divide-[#EFE7DC] hover:bg-[#FAF4EB] transition-colors"
                  >
                    {/* Index */}
                    <td className="px-2.5 py-2.5 text-center font-medium text-slate-700">
                      {idx + 1}
                    </td>

                    {/* BA No. (Clickable maroon link with hover underline, opening submission details) */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelectedSubmission(item)}
                        className="text-[#7A1316] hover:text-[#8F161A] font-mono font-bold hover:underline text-left cursor-pointer transition-colors"
                      >
                        {item.baNo}
                      </button>
                    </td>

                    {/* Type: LPS or Non LPS Status */}
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border",
                          item.lpsType === "LPS"
                            ? "bg-amber-100 text-[#7A1316] border-amber-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        )}
                      >
                        {item.lpsType}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-3 py-2.5 text-slate-600 font-mono">
                      {item.submittedDate}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border",
                          item.status === "Approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-blue-50 text-blue-800 border-blue-300"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            item.status === "Approved" ? "bg-emerald-600" : "bg-blue-600"
                          )}
                        />
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2.5 text-slate-800 font-medium">
                      {item.owner || "-"}
                    </td>

                    {/* Action Column: View button */}
                    <td className="px-2.5 py-2.5 text-center">
                      <button
                        onClick={() => setSelectedSubmission(item)}
                        className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-2xs transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No submitted applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE FOOTER: Pagination | Refresh & Excel | Total Proposal(s) (matches Drafts) ── */}
        <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-3 py-2 flex items-center justify-between text-xs text-slate-700 shrink-0">
          {/* Left: Pagination & Controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-700 text-xs">[1]</span>
            <div className="h-3 w-px bg-[#DCD5C8]" />
            <button
              onClick={handleRefresh}
              title="Refresh Applications"
              className="text-slate-600 hover:text-[#7A1316] p-1 rounded hover:bg-[#EFE3D5] transition-colors cursor-pointer"
            >
              <RefreshCw
                className={cn("size-3.5", isRefreshing && "animate-spin text-[#7A1316]")}
              />
            </button>
            {/* View report button before export button */}
            <button
              type="button"
              id="submitted-view-report-btn"
              onClick={() => setViewReportModal(true)}
              title="View report"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-[#FBF3E4] text-[#7A1316] hover:text-[#8F161A] border border-[#DCD5C8] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="size-3.5 text-[#7A1316]" />
              <span>View report</span>
            </button>
            <button
              onClick={exportCSV}
              title="Export to Excel / CSV"
              className="text-emerald-700 hover:text-emerald-900 p-1 rounded hover:bg-[#EFE3D5] transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="size-3.5" />
            </button>
          </div>

          {/* Right: Total Proposals Count */}
          <div className="font-medium text-slate-600 text-xs">
            Total Proposal(s) :{" "}
            <span className="font-bold text-slate-900">{sortedItems.length}</span>
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
                      : "Submitted Applications Summary Report"}
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
                      <span className="font-bold text-[#7A1316]">Submitted Applications</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Records</span>
                      <span className="font-mono font-bold text-slate-900">{sortedItems.length} Applications</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-[#DCD5C8] rounded-lg overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#7A1316] text-white font-bold border-b border-[#630E10]">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center">#</th>
                          <th className="px-3 py-2">Proposal / BA No.</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Submitted Date</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Owner / Applicant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCD5C8]">
                        {sortedItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-[#FBF3E4]/50 transition-colors">
                            <td className="px-3 py-2 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono font-bold text-[#7A1316]">{item.baNo}</td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-bold border",
                                  item.lpsType === "LPS"
                                    ? "bg-amber-100 text-[#7A1316] border-amber-300"
                                    : "bg-slate-100 text-slate-700 border-slate-300"
                                )}
                              >
                                {item.lpsType}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600 font-mono">{item.submittedDate}</td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-bold border",
                                  item.status === "Approved"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                                )}
                              >
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
              <span className="text-[11px] italic">Official APCRDA BBAS Submission Registry Report</span>
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
