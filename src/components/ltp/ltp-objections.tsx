"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  CheckCircle2,
  ChevronsUpDown,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Filter,
  Search,
  RotateCcw,
  ExternalLink,
  Eye,
  FileText,
  UploadCloud,
} from "lucide-react";
import { LtpSubmissionDetails } from "./ltp-submission-details";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";

export interface ObjectionItem {
  id: string;
  baNo: string;
  permissionType: string;
  createdDate: string;
  status: string;
  owner: string;
  caseType: string;
  shortfallReason?: string;
  raisedBy?: string;
  hearingDate?: string;
  appId?: string;
}

const DEFAULT_OBJECTIONS: ObjectionItem[] = [
  {
    id: "obj-1",
    baNo: "BA/2026/0892/BP",
    permissionType: "Building Permission",
    createdDate: "18/2/2026",
    status: "Shortfall Raised",
    owner: "K. Venkateshwara Rao",
    caseType: "Fresh",
    shortfallReason:
      "Front setback shortfall of 1.2m against Master Plan 12m road requirement. Revised architectural drawing required.",
    raisedBy: "TPS Technical Scrutiny (Shri. Suresh Kulkarni)",
    hearingDate: "05/10/2026",
  },
  {
    id: "obj-2",
    baNo: "BA/2026/0411/BP",
    permissionType: "Building Permission",
    createdDate: "22/1/2026",
    status: "Drawing Reupload Required",
    owner: "Smt. Meena Kulkarni",
    caseType: "Revision",
    shortfallReason:
      "PreDCR Auto-scrutiny layer error on Staircase Headroom and Fire Escape corridor width.",
    raisedBy: "PreDCR Scrutiny Engine v3.4",
    hearingDate: "03/10/2026",
  },
  {
    id: "obj-3",
    baNo: "BA/2026/0154/GD",
    permissionType: "Group Development",
    createdDate: "05/3/2026",
    status: "Objection Raised",
    owner: "M. Lakshmi Narayana",
    caseType: "Fresh",
    shortfallReason:
      "Fire NOC Provisional clearance pending from State Disaster Response and Fire Services.",
    raisedBy: "ZAD / ZDD Review (Smt. Radhika Verma)",
    hearingDate: "12/10/2026",
  },
  {
    id: "obj-4",
    baNo: "BA/2026/0920/BP",
    permissionType: "Building Permission",
    createdDate: "12/3/2026",
    status: "Shortfall Raised",
    owner: "Shri. Suresh Reddy",
    caseType: "Resubmission",
    shortfallReason:
      "Structural Stability Certificate missing signature of Registered Structural Engineer (Grade-I).",
    raisedBy: "Field Inspection (Shri. Rahul Gupta)",
    hearingDate: "08/10/2026",
  },
  {
    id: "obj-5",
    baNo: "BA/2026/1105/BP",
    permissionType: "Building Permission",
    createdDate: "24/9/2026",
    status: "Scrutiny Rejected",
    owner: "P. Srinivasa Rao",
    caseType: "Regularization",
    shortfallReason:
      "Plot depth does not conform to minimum statutory width for Commercial High-Rise under APCRDA Building Rules.",
    raisedBy: "Director DP Review (Dr. K. Chandrasekhar)",
    hearingDate: "15/10/2026",
  },
];

export function LtpObjections() {
  const { applications } = useDashboardScope();
  const user = useAppStore((s) => s.user);

  // Search & Filter State
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterType, setFilterType] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [filterCaseType, setFilterCaseType] = React.useState("ALL");
  const [showSubheaderFilters, setShowSubheaderFilters] = React.useState(true);
  const [sortField, setSortField] = React.useState<keyof ObjectionItem>("createdDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedObjection, setSelectedObjection] = React.useState<ObjectionItem | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Compute objections from store or combine with default authentic APCRDA data
  const objectionItems: ObjectionItem[] = React.useMemo(() => {
      const storeShortfalls: ObjectionItem[] = applications
      .filter(
        (a) =>
          a.status === "SHORTFALL_RAISED" ||
          a.status === "SCRUTINY_FAILED" ||
          a.status === "DRAWING_REUPLOAD_REQUIRED"
      )
      .map((a, idx) => {
        const created = new Date(a.submissionDate || a.lastUpdated || Date.now());
        const dateStr = `${created.getDate()}/${created.getMonth() + 1}/${created.getFullYear()}`;
        const typeLabel =
          a.project?.type === "LAYOUT_APPROVAL" || a.project?.type === "DEVELOPMENT_PERMIT"
            ? "Group Development"
            : "Building Permission";

        const statusLabel =
          a.status === "DRAWING_REUPLOAD_REQUIRED"
            ? "Drawing Reupload Required"
            : a.status === "SCRUTINY_FAILED"
            ? "Scrutiny Rejected"
            : "Shortfall Raised";

        return {
          id: a.id || `store-obj-${idx}`,
          baNo: a.applicationNo || `BA/2026/${1000 + idx}/BP`,
          permissionType: typeLabel,
          createdDate: dateStr,
          status: statusLabel,
          owner: a.applicant?.name || "Applicant",
          caseType: idx % 2 === 0 ? "Fresh" : "Revision",
          shortfallReason:
            a.shortfalls?.[0]?.description ??
            "Scrutiny Can Not Done / Revised Drawings Required",
          raisedBy: a.assignedOfficer?.name ?? "Technical Scrutiny Officer",
          appId: a.id,
        };
      });

    // Merge store items with standard defaults (avoid duplicate BA numbers)
    const existingBaNos = new Set(storeShortfalls.map((s) => s.baNo));
    const merged: ObjectionItem[] = [...storeShortfalls];

    for (const d of DEFAULT_OBJECTIONS) {
      if (!existingBaNos.has(d.baNo)) {
        merged.push(d);
        existingBaNos.add(d.baNo);
      }
    }

    return merged;
  }, [applications]);

  // Filtering
  const filteredItems = React.useMemo(() => {
    return objectionItems.filter((item) => {
      // Keyword search
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const matches =
          item.baNo.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.caseType.toLowerCase().includes(q) ||
          (item.shortfallReason && item.shortfallReason.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Column filters
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;
      if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
      if (filterCaseType !== "ALL" && item.caseType !== filterCaseType) return false;

      return true;
    });
  }, [objectionItems, searchKeywords, filterType, filterStatus, filterCaseType]);

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

  const handleSort = (field: keyof ObjectionItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleClear = () => {
    setSearchKeywords("");
    setFilterType("ALL");
    setFilterStatus("ALL");
    setFilterCaseType("ALL");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleFind = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const exportCSV = () => {
    const headers = [
      "#",
      "BA No.",
      "Permission Type",
      "Created Date",
      "Status",
      "Owner",
      "Case Type",
    ];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.permissionType}"`,
      item.createdDate,
      `"${item.status}"`,
      `"${item.owner}"`,
      `"${item.caseType}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Objection_Proposals_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user opened a specific objection proposal, render the details view
  if (selectedObjection) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Objection Alert Banner */}
        <div className="bg-[#7A1316] text-[#FBF3E4] px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shrink-0 border-b border-[#630E10]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-300 shrink-0" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                {selectedObjection.status}:
              </span>{" "}
              <span>{selectedObjection.shortfallReason}</span>
            </div>
          </div>
          {selectedObjection.hearingDate && (
            <div className="text-[11px] bg-[#8F161A] border border-[#A22025] px-2 py-0.5 rounded text-amber-200 font-semibold whitespace-nowrap">
              Compliance Due: {selectedObjection.hearingDate}
            </div>
          )}
        </div>

        {/* Full Details Component */}
        <div className="flex-1 min-h-0">
          <LtpSubmissionDetails
            baNo={selectedObjection.baNo}
            proposalStatus={selectedObjection.status}
            submissionDate={selectedObjection.createdDate}
            isDraft={false}
            onBack={() => setSelectedObjection(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS: Search on Left | Filter Find Clear on Right (matching screenshot) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        {/* Search Input Box */}
        <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded px-2.5 py-1.5 w-full sm:w-80 shadow-2xs focus-within:border-[#7A1316] transition-colors">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="Enter keywords to search for"
            className="w-full bg-transparent text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Action Links on Right: Filter | Find | Clear (matching screenshot) */}
        <div className="flex items-center justify-end gap-4 text-xs font-semibold px-1">
          <button
            onClick={() => setShowSubheaderFilters(!showSubheaderFilters)}
            className="text-slate-700 hover:text-[#7A1316] hover:underline cursor-pointer transition-colors"
          >
            Filter
          </button>
          <button
            onClick={handleFind}
            className="text-slate-700 hover:text-[#7A1316] hover:underline cursor-pointer transition-colors"
          >
            Find
          </button>
          <button
            onClick={handleClear}
            className="text-slate-700 hover:text-[#7A1316] hover:underline cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── TABLE CONTAINER (Maroon & Beige Theme) ── */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header Row (Exact fields: #, BA No., Permission Type, Created Date, Status, Owner, Case Type) */}
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
                  onClick={() => handleSort("createdDate")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-32"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Created Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-44"
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

                <th
                  onClick={() => handleSort("caseType")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-32"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Case Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-20 px-2.5 py-2 font-bold text-center">Action</th>
              </tr>

              {/* Sub-header Filter Row (matches screenshot dropdown selectors) */}
              {showSubheaderFilters && (
                <tr className="bg-[#FAF4EB] divide-x divide-[#DCD5C8] border-t border-[#E8DFD1]">
                  <th className="px-2 py-1 text-center font-normal text-slate-400">-</th>
                  <th className="px-2 py-1"></th>

                  {/* Filter: Permission Type */}
                  <th className="px-2 py-1">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      aria-label="Filter Permission Type"
                      className="w-full h-6 text-[11px] bg-white border border-[#DCD5C8] rounded-xs px-1.5 text-slate-700 outline-none focus:border-[#7A1316] font-normal cursor-pointer"
                    >
                      <option value="ALL">All Types</option>
                      <option value="Building Permission">Building Permission</option>
                      <option value="Group Development">Group Development</option>
                    </select>
                  </th>

                  <th className="px-2 py-1"></th>

                  {/* Filter: Status */}
                  <th className="px-2 py-1">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      aria-label="Filter Status"
                      className="w-full h-6 text-[11px] bg-white border border-[#DCD5C8] rounded-xs px-1.5 text-slate-700 outline-none focus:border-[#7A1316] font-normal cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Shortfall Raised">Shortfall Raised</option>
                      <option value="Objection Raised">Objection Raised</option>
                      <option value="Drawing Reupload Required">Drawing Reupload Required</option>
                      <option value="Scrutiny Rejected">Scrutiny Rejected</option>
                    </select>
                  </th>

                  <th className="px-2 py-1"></th>

                  {/* Filter: Case Type */}
                  <th className="px-2 py-1">
                    <select
                      value={filterCaseType}
                      onChange={(e) => setFilterCaseType(e.target.value)}
                      aria-label="Filter Case Type"
                      className="w-full h-6 text-[11px] bg-white border border-[#DCD5C8] rounded-xs px-1.5 text-slate-700 outline-none focus:border-[#7A1316] font-normal cursor-pointer"
                    >
                      <option value="ALL">All Case Types</option>
                      <option value="Fresh">Fresh</option>
                      <option value="Revision">Revision</option>
                      <option value="Resubmission">Resubmission</option>
                      <option value="Regularization">Regularization</option>
                    </select>
                  </th>

                  <th className="px-2 py-1"></th>
                </tr>
              )}
            </thead>

            {/* Table Body with data */}
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

                    {/* BA No. (Clickable blue link with hover underline) */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelectedObjection(item)}
                        className="text-blue-700 hover:text-blue-900 font-mono font-medium hover:underline text-left cursor-pointer transition-colors"
                      >
                        {item.baNo}
                      </button>
                    </td>

                    {/* Permission Type */}
                    <td className="px-3 py-2.5 text-slate-700 font-medium">
                      {item.permissionType}
                    </td>

                    {/* Created Date */}
                    <td className="px-3 py-2.5 text-slate-600 font-mono">
                      {item.createdDate}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border",
                          item.status === "Shortfall Raised" &&
                            "bg-amber-50 text-amber-900 border-amber-300",
                          item.status === "Objection Raised" &&
                            "bg-rose-50 text-[#7A1316] border-rose-300",
                          item.status === "Drawing Reupload Required" &&
                            "bg-blue-50 text-blue-900 border-blue-300",
                          item.status === "Scrutiny Rejected" &&
                            "bg-red-50 text-red-900 border-red-300"
                        )}
                      >
                        <AlertTriangle className="size-3 shrink-0" />
                        {item.status}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2.5 text-slate-800 font-medium">
                      {item.owner || "-"}
                    </td>

                    {/* Case Type */}
                    <td className="px-3 py-2.5 text-slate-700 font-medium">
                      <span className="inline-block bg-[#F5EBE1] text-[#7A1316] border border-[#E0D2BE] px-2 py-0.5 rounded text-[11px] font-bold">
                        {item.caseType}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-2.5 py-2.5 text-center">
                      <button
                        onClick={() => setSelectedObjection(item)}
                        className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-2xs transition-colors cursor-pointer"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE FOOTER: Pagination | Refresh & Excel | Total Proposal(s) (matches screenshot) ── */}
        <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-3 py-2 flex items-center justify-between text-xs text-slate-700 shrink-0 select-none">
          {/* Left: Pagination & Controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-700 text-xs">[1]</span>
            <div className="h-3 w-px bg-[#DCD5C8]" />
            <button
              onClick={handleRefresh}
              title="Refresh Objections"
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
