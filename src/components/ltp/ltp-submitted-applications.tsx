"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { LtpSubmissionDetails } from "./ltp-submission-details";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";

export interface SubmissionItem {
  id: string;
  baNo: string;
  permissionType: string;
  submittedDate: string;
  status: string;
  owner: string;
  appId?: string;
  lpsType?: "LPS Layout" | "Non-LPS";
}

const DEFAULT_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub-1",
    baNo: "1168/0142/BP/10/015/2026",
    permissionType: "Building Permission",
    submittedDate: "23/7/2026",
    status: "Scrutiny Done/Proceeding Pending",
    owner: "Vadduri Veeraiah",
  },
  {
    id: "sub-2",
    baNo: "1168/0205/BP/10/018/2026",
    permissionType: "Building Permission",
    submittedDate: "15/8/2026",
    status: "Under Scrutiny",
    owner: "Smt. Meena Kulkarni",
  },
  {
    id: "sub-3",
    baNo: "1168/0089/GD/10/004/2026",
    permissionType: "Group Development",
    submittedDate: "04/9/2026",
    status: "Fee Generated",
    owner: "M. Lakshmi Narayana",
  },
  {
    id: "sub-4",
    baNo: "1168/0312/BP/10/022/2026",
    permissionType: "Building Permission",
    submittedDate: "18/9/2026",
    status: "Payment Pending",
    owner: "Shri. Suresh Reddy",
  },
  {
    id: "sub-5",
    baNo: "1168/0055/BP/10/002/2026",
    permissionType: "Building Permission",
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
  const [createDropdownOpen, setCreateDropdownOpen] = React.useState(false);
  const [isSelectingScheme, setIsSelectingScheme] = React.useState(false);
  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionItem | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCreateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        const statusMap: Record<string, string> = {
          SUBMITTED: "Under Scrutiny",
          IN_SCRUTINY: "Under Scrutiny",
          DOCUMENT_VERIFICATION: "Document Verification",
          SITE_INSPECTION_SCHEDULED: "Site Inspection Scheduled",
          FEE_GENERATED: "Fee Generated",
          PAYMENT_PENDING: "Payment Pending",
          APPROVED: "Approved",
          REJECTED: "Rejected",
          SHORTFALL_RAISED: "Shortfall Raised",
          DRAWING_REUPLOAD_REQUIRED: "Drawing Reupload Required",
        };

        const statusLabel =
          statusMap[a.status] || a.currentStageLabel || "Under Scrutiny";

        return {
          id: a.id || `sub-store-${idx}`,
          baNo: a.applicationNo || `1168/${String(100 + idx).padStart(4, "0")}/BP/10/015/2026`,
          permissionType: typeLabel,
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
          item.permissionType.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Column filters
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;
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
    const headers = ["#", "BA No.", "Permission Type", "Submitted Date", "Status", "Owner"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.permissionType}"`,
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
    const newDraftNo = `Temp/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/${typeCode}/${now.getFullYear()}`;
    setSelectedSubmission({
      id: `sub-new-${Date.now()}`,
      baNo: newDraftNo,
      permissionType: scheme === "LPS Layout" ? "LPS Building Permission" : "Building Permission",
      submittedDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      status: "Draft",
      owner: "",
      lpsType: scheme,
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
        initialLpsType={selectedSubmission.lpsType || (selectedSubmission.baNo.includes("/LPS/") ? "LPS Layout" : "Non-LPS")}
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
      {/* ── TOP CONTROLS: Search & Filters on Left | Create New Dropdown on Right (like Drafts) ── */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 shrink-0">
        {/* Left: Search Bar & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input Box */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded px-2.5 py-1.5 w-full sm:w-64 shadow-2xs focus-within:border-[#7A1316] transition-colors">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Enter keywords to search for"
              className="w-full bg-transparent text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
            />
          </div>

          {/* Filter: Permission Type */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded px-2.5 py-1.5 shadow-2xs focus-within:border-[#7A1316] transition-colors">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by Permission Type"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="Building Permission">Building Permission</option>
              <option value="Group Development">Group Development</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded px-2.5 py-1.5 shadow-2xs focus-within:border-[#7A1316] transition-colors">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by Status"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Scrutiny Done/Proceeding Pending">Scrutiny Done/Proceeding Pending</option>
              <option value="Under Scrutiny">Under Scrutiny</option>
              <option value="Fee Generated">Fee Generated</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          {/* Filter: Owner */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded px-2.5 py-1.5 shadow-2xs focus-within:border-[#7A1316] transition-colors">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Owner:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              aria-label="Filter by Owner"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Owners</option>
              <option value="Vadduri Veeraiah">Vadduri Veeraiah</option>
              <option value="Smt. Meena Kulkarni">Smt. Meena Kulkarni</option>
              <option value="M. Lakshmi Narayana">M. Lakshmi Narayana</option>
              <option value="Shri. Suresh Reddy">Shri. Suresh Reddy</option>
              <option value="P. Srinivasa Rao">P. Srinivasa Rao</option>
            </select>
          </div>

          {/* Clear Filters Button (shown when any filter is active) */}
          {(searchKeywords || filterType !== "ALL" || filterStatus !== "ALL" || filterOwner !== "ALL") && (
            <button
              onClick={() => {
                setSearchKeywords("");
                setFilterType("ALL");
                setFilterStatus("ALL");
                setFilterOwner("ALL");
              }}
              className="text-xs font-semibold text-[#7A1316] hover:text-[#8F161A] hover:underline px-2 py-1 cursor-pointer transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Create New / New Application Button (Maroon & Beige Theme) */}
        <div className="relative shrink-0 self-start xl:self-auto" ref={dropdownRef}>
          <div className="flex items-center">
            <button
              onClick={() => setIsSelectingScheme(true)}
              className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs h-[34px] px-3.5 rounded-l flex items-center gap-2 shadow-xs transition-colors cursor-pointer border border-[#630E10]"
            >
              <Plus className="size-3.5" />
              <span>New Application</span>
            </button>
            <button
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              title="Quick select scheme"
              className="bg-[#630E10] hover:bg-[#7A1316] text-white font-bold text-xs h-[34px] px-2 rounded-r flex items-center justify-center shadow-xs transition-colors cursor-pointer border-t border-r border-b border-[#630E10]"
            >
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", createDropdownOpen && "rotate-180")} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {createDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-60 rounded border-2 border-[#7A1316] bg-[#FBF3E4] shadow-lg py-1 overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-xs font-black text-[#7A1316] border-b border-[#E0D2BE] bg-[#F5EBE1]/80">
                Select Scheme Type
              </div>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  handleCreateNewApp("LPS Layout");
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-[#7A1316] hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
              >
                <span>LPS Application</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 group-hover:bg-white group-hover:text-[#7A1316]">LPS</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  handleCreateNewApp("Non-LPS");
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-[#7A1316] hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
              >
                <span>Non-LPS Application</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 group-hover:bg-white group-hover:text-[#7A1316]">Non-LPS</span>
              </button>
            </div>
          )}
        </div>
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
                  onClick={() => handleSort("permissionType")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Permission Type</span>
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

                    {/* BA No. (Clickable blue link with hover underline, opening submission details) */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelectedSubmission(item)}
                        className="text-blue-700 hover:text-blue-900 font-mono font-medium hover:underline text-left cursor-pointer transition-colors"
                      >
                        {item.baNo}
                      </button>
                    </td>

                    {/* Permission Type */}
                    <td className="px-3 py-2.5 text-slate-700 font-medium">
                      {item.permissionType}
                    </td>

                    {/* Submitted Date */}
                    <td className="px-3 py-2.5 text-slate-600 font-mono">
                      {item.submittedDate}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border",
                          item.status.includes("Pending") &&
                            "bg-amber-50 text-amber-900 border-amber-300",
                          item.status === "Approved" &&
                            "bg-emerald-50 text-emerald-900 border-emerald-300",
                          item.status === "Under Scrutiny" &&
                            "bg-blue-50 text-blue-900 border-blue-300",
                          !item.status.includes("Pending") &&
                            item.status !== "Approved" &&
                            item.status !== "Under Scrutiny" &&
                            "bg-[#FAF4EB] text-[#7A1316] border-[#E8DFD1]"
                        )}
                      >
                        {item.status}
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
        <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-3 py-2 flex items-center justify-between text-xs text-slate-700 shrink-0 select-none">
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
    </div>
  );
}
