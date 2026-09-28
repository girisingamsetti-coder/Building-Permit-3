"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  FileSpreadsheet,
  Table as TableIcon,
  Plus,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { Application } from "@/types";
import { LtpSubmissionDetails } from "./ltp-submission-details";

interface DraftItem {
  id: string;
  baNo: string;
  permissionType: string;
  createdDate: string;
  status: string;
  owner: string;
  appId?: string;
}

export function LtpDraftApplications({
  onNewApp,
}: {
  onNewApp: (appType?: string) => void;
}) {
  const applications = useAppStore((s) => s.applications);
  const user = useAppStore((s) => s.user);
  const openApplication = useAppStore((s) => s.openApplication);

  // Search & Filter State
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterType, setFilterType] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [filterOwner, setFilterOwner] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<keyof DraftItem>("createdDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = React.useState(false);
  const [selectedDraft, setSelectedDraft] = React.useState<DraftItem | null>(null);

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

  // Compute draft proposals from store or include the standard APCRDA demo draft
  const draftItems: DraftItem[] = React.useMemo(() => {
    const userDrafts = applications.filter(
      (a) => (a.ltpId === user?.id || a.ltpId === "u-ltp-01") && a.status === "DRAFT"
    );

    // Format draft items
    const items: DraftItem[] = userDrafts.map((a, idx) => {
      // Format BA No: if not already Temp, format as APCRDA temporary draft number
      const ba = a.applicationNo.startsWith("Temp/")
        ? a.applicationNo
        : `Temp/1168/0267/BP/${new Date(a.submissionDate || Date.now()).getFullYear()}`;

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
    const hasDefaultProposal = items.some((i) => i.baNo === "Temp/1168/0267/BP/2026");
    if (!hasDefaultProposal) {
      items.unshift({
        id: "draft-sample-1",
        baNo: "Temp/1168/0267/BP/2026",
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
      if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
      if (filterOwner !== "ALL" && item.owner !== filterOwner) return false;

      return true;
    });
  }, [draftItems, searchKeywords, filterType, filterStatus, filterOwner]);

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
    const headers = ["#", "BA No.", "Permission Type", "Created Date", "Status", "Owner"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.permissionType}"`,
      item.createdDate,
      item.status,
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

  // If user opened a specific draft, render the comprehensive details view (Image 2)
  if (selectedDraft) {
    return (
      <LtpSubmissionDetails
        baNo={selectedDraft.baNo}
        proposalStatus={selectedDraft.status}
        submissionDate={selectedDraft.createdDate}
        isDraft={true}
        onBack={() => setSelectedDraft(null)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS: Search & Filters on Left | Create New Dropdown on Right ── */}
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
              <option value="Draft">Draft</option>
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
              <option value="New">New</option>
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

        {/* Create New Dropdown (Maroon & Beige Theme) */}
        <div className="relative shrink-0 self-start xl:self-auto" ref={dropdownRef}>
          <button
            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
            className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs h-[34px] px-3.5 rounded flex items-center justify-between gap-2.5 shadow-xs transition-colors cursor-pointer border border-[#630E10]"
          >
            <span>Create New</span>
            <ChevronDown className={cn("size-3.5 transition-transform duration-200", createDropdownOpen && "rotate-180")} />
          </button>

          {/* Dropdown Menu */}
          {createDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded border-2 border-[#7A1316] bg-[#FBF3E4] shadow-lg py-1 overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-xs font-black text-[#7A1316] border-b border-[#E0D2BE] bg-[#F5EBE1]/80">
                Create New
              </div>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  const now = new Date();
                  const newDraftNo = `Temp/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/BP/${now.getFullYear()}`;
                  setSelectedDraft({
                    id: `draft-new-${Date.now()}`,
                    baNo: newDraftNo,
                    permissionType: "Building Permission",
                    createdDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
                    status: "Draft",
                    owner: "",
                  });
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-[#7A1316] hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
              >
                <span>Building Permission</span>
                <Plus className="size-3 text-slate-400 group-hover:text-white" />
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  const now = new Date();
                  const newDraftNo = `Temp/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/GD/${now.getFullYear()}`;
                  setSelectedDraft({
                    id: `draft-new-${Date.now()}`,
                    baNo: newDraftNo,
                    permissionType: "Group Development",
                    createdDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
                    status: "Draft",
                    owner: "",
                  });
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-[#7A1316] hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
              >
                <span>Group Development</span>
                <Plus className="size-3 text-slate-400 group-hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TABLE CONTAINER (Maroon & Beige Theme) ── */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header Row */}
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
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-28"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Status</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("owner")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-36"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Owner</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>
                <th className="w-16 px-2.5 py-2 font-bold text-center">Action</th>
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

                    {/* BA No. (Clickable blue link with hover underline, opening proposal) */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => handleOpenDraft(item)}
                        className="inline-flex items-center gap-1.5 text-blue-700 hover:text-[#7A1316] font-medium underline cursor-pointer text-left font-mono"
                        title="Click to view and continue this draft"
                      >
                        <span>{item.baNo}</span>
                        <ExternalLink className="size-3 text-blue-500 opacity-60 hover:opacity-100" />
                      </button>
                    </td>

                    {/* Permission Type */}
                    <td className="px-3 py-2.5 text-slate-800 font-medium">{item.permissionType}</td>

                    {/* Created Date */}
                    <td className="px-3 py-2.5 text-slate-700 tabular-nums">{item.createdDate}</td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-slate-800">{item.status}</span>
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2.5 text-slate-700 font-medium">{item.owner}</td>

                    {/* Action: New */}
                    <td className="px-2.5 py-2.5 text-center">
                      <button
                        onClick={() => handleOpenDraft(item)}
                        className="text-xs font-semibold text-blue-700 hover:text-[#7A1316] hover:underline cursor-pointer"
                      >
                        New
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No proposals found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE FOOTER: Pagination / Export on Left | Total Proposal(s) on Right ── */}
        <div className="border-t-2 border-[#DCD5C8] bg-[#F5EBE1] px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
          {/* Left: Page Navigator & Export Controls */}
          <div className="flex items-center gap-3">
            {/* Page number */}
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center size-6 bg-white border border-[#DCD5C8] text-slate-800 font-bold text-xs rounded-xs shadow-2xs">
                1
              </span>
            </div>

            {/* Export & Refresh buttons */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#DCD5C8]">
              <button
                onClick={() => {
                  setSearchKeywords("");
                  setFilterType("ALL");
                  setFilterStatus("ALL");
                  setFilterOwner("ALL");
                }}
                title="Refresh Table"
                className="p-1 hover:bg-white rounded transition-colors text-emerald-700 cursor-pointer"
              >
                <RefreshCw className="size-4" />
              </button>
              <button
                onClick={exportCSV}
                title="Export to Excel"
                className="p-1 hover:bg-white rounded transition-colors text-emerald-700 cursor-pointer"
              >
                <FileSpreadsheet className="size-4.5" />
              </button>
              <button
                onClick={exportCSV}
                title="Export Table Data"
                className="p-1 hover:bg-white rounded transition-colors text-slate-700 cursor-pointer"
              >
                <TableIcon className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Right: Total Proposals (Matches Screenshot) */}
          <div className="font-bold text-slate-900 text-xs">
            <span>Total Proposal(s) : </span>
            <span className="text-[#7A1316] font-black">{sortedItems.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
