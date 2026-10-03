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
  CreditCard,
  Printer,
  X,
  Clock,
} from "lucide-react";
import { LtpSubmissionDetails } from "./ltp-submission-details";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { DetailedScrutinyReport } from "./detailed-scrutiny-report";

export interface ObjectionItem {
  id: string;
  baNo: string;
  permissionType: string;
  createdDate: string;
  status: "Scrutiny Failed" | "Payment Failed" | "Payment Incomplete";
  category: "scrutiny-failed" | "payment-incomplete";
  owner: string;
  caseType: string;
  shortfallReason?: string;
  amount?: string;
  raisedBy?: string;
  hearingDate?: string;
  appId?: string;
}

const DEFAULT_OBJECTIONS: ObjectionItem[] = [
  // ── 1. Scrutiny Failed Proposals ──
  {
    id: "obj-1",
    baNo: "BA/2026/0892/BP",
    permissionType: "Building Permission",
    createdDate: "18/2/2026",
    status: "Scrutiny Failed",
    category: "scrutiny-failed",
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
    status: "Scrutiny Failed",
    category: "scrutiny-failed",
    owner: "Smt. Meena Kulkarni",
    caseType: "Revision",
    shortfallReason:
      "PreDCR Auto-scrutiny layer error on Staircase Headroom and Fire Escape corridor width.",
    raisedBy: "PreDCR Scrutiny Engine v3.4",
    hearingDate: "03/10/2026",
  },
  {
    id: "obj-3",
    baNo: "BA/2026/1105/BP",
    permissionType: "Building Permission",
    createdDate: "24/9/2026",
    status: "Scrutiny Failed",
    category: "scrutiny-failed",
    owner: "P. Srinivasa Rao",
    caseType: "Regularization",
    shortfallReason:
      "Plot depth does not conform to minimum statutory width for Commercial High-Rise under APCRDA Building Rules.",
    raisedBy: "Director DP Review (Dr. K. Chandrasekhar)",
    hearingDate: "15/10/2026",
  },
  {
    id: "obj-4",
    baNo: "BA/2026/0920/BP",
    permissionType: "Building Permission",
    createdDate: "12/3/2026",
    status: "Scrutiny Failed",
    category: "scrutiny-failed",
    owner: "Shri. Suresh Reddy",
    caseType: "Resubmission",
    shortfallReason:
      "Green coverage 11.4% below statutory minimum 15.00%. Auto-rule validation rejected.",
    raisedBy: "BBAS CAD Rule Engine",
    hearingDate: "08/10/2026",
  },

  // ── 2. Payment Incomplete / Failed Proposals ──
  {
    id: "obj-5",
    baNo: "BA/2026/0312/BP",
    permissionType: "Building Permission",
    createdDate: "18/9/2026",
    status: "Payment Failed",
    category: "payment-incomplete",
    owner: "Shri. Suresh Reddy",
    caseType: "Fresh",
    amount: "₹14,500",
    shortfallReason:
      "Building Permit Scrutiny Fee payment incomplete. Transaction timed out at SBI ePay gateway.",
    raisedBy: "APCRDA Payment Gateway (Auto Reconciliation)",
    hearingDate: "08/10/2026",
  },
  {
    id: "obj-6",
    baNo: "BA/2026/0154/GD",
    permissionType: "Group Development",
    createdDate: "05/3/2026",
    status: "Payment Failed",
    category: "payment-incomplete",
    owner: "M. Lakshmi Narayana",
    caseType: "Fresh",
    amount: "₹2,45,000",
    shortfallReason:
      "Development Charges installment-1 payment incomplete. Payment link active for LTP retry.",
    raisedBy: "Accounts Officer (Fee Assessment Cell)",
    hearingDate: "12/10/2026",
  },
  {
    id: "obj-7",
    baNo: "BA/2026/0678/BP",
    permissionType: "Building Permission",
    createdDate: "29/8/2026",
    status: "Payment Failed",
    category: "payment-incomplete",
    owner: "Ch. Venkatadri Naidu",
    caseType: "Revision",
    amount: "₹38,200",
    shortfallReason:
      "Labour Cess and Betterment Charges payment incomplete at Payment Gateway. Challan pending.",
    raisedBy: "Finance & Accounts Wing",
    hearingDate: "14/10/2026",
  },
  {
    id: "obj-8",
    baNo: "BA/2026/0844/BP",
    permissionType: "Building Permission",
    createdDate: "14/9/2026",
    status: "Payment Failed",
    category: "payment-incomplete",
    owner: "K. Rama Rao",
    caseType: "Fresh",
    amount: "₹21,000",
    shortfallReason:
      "LPS Infrastructure Assessment fee payment timed out. Receipt generation pending payment completion.",
    raisedBy: "Payment Processing Gateway",
    hearingDate: "11/10/2026",
  },
];

export function LtpObjections() {
  const { applications } = useDashboardScope();
  const user = useAppStore((s) => s.user);

  // Filter State (Unified Single Table)
  const [filterCategory, setFilterCategory] = React.useState<"ALL" | "scrutiny-failed" | "payment-incomplete">("ALL");
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterType, setFilterType] = React.useState("ALL");
  const [filterCaseType, setFilterCaseType] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<keyof ObjectionItem>("createdDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedObjection, setSelectedObjection] = React.useState<ObjectionItem | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [viewReportModal, setViewReportModal] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Compute objections from store or combine with default authentic APCRDA data
  const objectionItems: ObjectionItem[] = React.useMemo(() => {
    const storeShortfalls: ObjectionItem[] = [];

    applications.forEach((a, idx) => {
      const created = new Date(a.submissionDate || a.lastUpdated || Date.now());
      const dateStr = `${created.getDate()}/${created.getMonth() + 1}/${created.getFullYear()}`;
      const typeLabel =
        a.project?.type === "LAYOUT_APPROVAL" || a.project?.type === "DEVELOPMENT_PERMIT"
          ? "Group Development"
          : "Building Permission";

      // 1. Scrutiny failed applications
      if (
        a.status === "SHORTFALL_RAISED" ||
        a.status === "SCRUTINY_FAILED" ||
        a.status === "DRAWING_REUPLOAD_REQUIRED"
      ) {
        storeShortfalls.push({
          id: a.id || `store-obj-sf-${idx}`,
          baNo: a.applicationNo || `BA/2026/${1000 + idx}/BP`,
          permissionType: typeLabel,
          createdDate: dateStr,
          status: "Scrutiny Failed",
          category: "scrutiny-failed",
          owner: a.applicant?.name || "Applicant",
          caseType: idx % 2 === 0 ? "Fresh" : "Revision",
          shortfallReason:
            a.shortfalls?.[0]?.description ??
            "PreDCR / BBAS Rule Scrutiny Failed. Revised Drawing required.",
          raisedBy: a.assignedOfficer?.name ?? "Technical Scrutiny Officer",
          appId: a.id,
        });
      }

      // 2. Payment incomplete applications
      if (a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED") {
        storeShortfalls.push({
          id: a.id || `store-obj-pay-${idx}`,
          baNo: a.applicationNo || `BA/2026/${2000 + idx}/BP`,
          permissionType: typeLabel,
          createdDate: dateStr,
          status: "Payment Failed",
          category: "payment-incomplete",
          owner: a.applicant?.name || "Applicant",
          caseType: idx % 2 === 0 ? "Fresh" : "Resubmission",
          amount: "₹18,500",
          shortfallReason:
            "Statutory scrutiny & betterment fee payment incomplete. Payment gateway session timed out.",
          raisedBy: "APCRDA Payment Gateway (Auto Reconciliation)",
          appId: a.id,
        });
      }
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

  // Tab counts
  const scrutinyFailedCount = React.useMemo(() => {
    return objectionItems.filter((i) => i.category === "scrutiny-failed").length;
  }, [objectionItems]);

  const paymentIncompleteCount = React.useMemo(() => {
    return objectionItems.filter((i) => i.category === "payment-incomplete").length;
  }, [objectionItems]);

  // Filtering by category and search/filters (unified single table)
  const filteredItems = React.useMemo(() => {
    return objectionItems.filter((item) => {
      // 1. Filter by category / objection type
      if (filterCategory !== "ALL" && item.category !== filterCategory) return false;

      // 2. Keyword search
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

      // 3. Column filters
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;
      if (filterCaseType !== "ALL" && item.caseType !== filterCaseType) return false;

      return true;
    });
  }, [objectionItems, filterCategory, searchKeywords, filterType, filterCaseType]);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleClear = () => {
    setSearchKeywords("");
    setFilterCategory("ALL");
    setFilterType("ALL");
    setFilterCaseType("ALL");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleFind = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Export Table Data to CSV
  const exportCSV = () => {
    const headers = ["#", "BA No.", "Permission Type", "Created Date", "Status", "Owner", "Case Type", "Shortfall Reason"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.permissionType}"`,
      `"${item.createdDate}"`,
      `"${item.status}"`,
      `"${item.owner}"`,
      `"${item.caseType}"`,
      `"${(item.shortfallReason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Objected_Proposals_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user opened a specific objection proposal, render the details view
  if (selectedObjection) {
    return (
      <div className="w-full h-full flex flex-col font-sans text-slate-800 overflow-hidden">
        {/* Objection Alert Banner */}
        <div
          className={cn(
            "px-4 py-2.5 flex items-center justify-between text-xs font-semibold shrink-0 border-b",
            selectedObjection.category === "scrutiny-failed"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "size-4 shrink-0",
                selectedObjection.category === "scrutiny-failed"
                  ? "text-rose-600"
                  : "text-amber-600"
              )}
            />
            <span>
              <strong>{selectedObjection.status}:</strong>{" "}
              {selectedObjection.shortfallReason}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {selectedObjection.amount && (
              <span className="font-mono font-bold bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 text-[11px]">
                Pending: {selectedObjection.amount}
              </span>
            )}
            {selectedObjection.hearingDate && (
              <span className="text-[11px] font-mono shrink-0">
                Action Due: {selectedObjection.hearingDate}
              </span>
            )}
          </div>
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
      {/* ── TOP CONTROLS: Search (before filters), Filters & Action Buttons in a Single Row ── */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* Search Input Box (Pillow-shaped) - BEFORE FILTERS */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 py-1.5 w-full sm:w-60 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search BA no., owner, reason..."
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

          {/* Filter: Objection Type / Status (Pillow-shaped) */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Objection:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              aria-label="Filter Objection Type"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Objections ({objectionItems.length})</option>
              <option value="scrutiny-failed">Scrutiny Failed ({scrutinyFailedCount})</option>
              <option value="payment-incomplete">Payment Failed ({paymentIncompleteCount})</option>
            </select>
          </div>

          {/* Filter: Permission Type (Pillow-shaped) */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter Permission Type"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Types</option>
              <option value="Building Permission">Building Permission</option>
              <option value="Group Development">Group Development</option>
            </select>
          </div>

          {/* Filter: Case Type (Pillow-shaped) */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">Case Type:</span>
            <select
              value={filterCaseType}
              onChange={(e) => setFilterCaseType(e.target.value)}
              aria-label="Filter Case Type"
              className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
            >
              <option value="ALL">All Case Types</option>
              <option value="Fresh">Fresh</option>
              <option value="Revision">Revision</option>
              <option value="Resubmission">Resubmission</option>
              <option value="Regularization">Regularization</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchKeywords ||
            filterCategory !== "ALL" ||
            filterType !== "ALL" ||
            filterCaseType !== "ALL") && (
            <button
              onClick={handleClear}
              className="rounded-full px-3 py-1.5 bg-red-50 text-[#7A1316] border border-[#7A1316]/20 hover:bg-red-100 hover:border-[#7A1316]/40 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
            >
              <X className="size-3" />
              <span>Clear</span>
            </button>
          )}

          {/* Other Action Buttons (Scrutiny Report & Export) */}
          <button
            type="button"
            id="objections-view-report-btn"
            onClick={() => setViewReportModal(true)}
            title="View Scrutiny Report"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FBF3E4] text-[#7A1316] hover:text-[#8F161A] border border-[#DCD5C8] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <FileText className="size-3.5 text-[#7A1316]" />
            <span>Scrutiny Report</span>
          </button>

          <button
            onClick={exportCSV}
            title="Export to Excel / CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 border border-[#DCD5C8] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Export</span>
          </button>
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
                  className="px-3.5 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-44"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>BA No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("permissionType")}
                  className="px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-36"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Permission Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-36"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Objection Status</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("shortfallReason")}
                  className="px-3.5 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none min-w-[280px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Objection / Shortfall Details</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("owner")}
                  className="px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-36"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Owner</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("caseType")}
                  className="px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-28"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Case Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("createdDate")}
                  className="px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-28"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-24 px-2.5 py-2.5 font-bold text-center">Action</th>
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
                    <td className="px-2.5 py-2.5 text-center font-medium text-slate-700">
                      {idx + 1}
                    </td>

                    {/* BA No. */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedObjection(item)}
                        className="inline-flex items-center gap-1.5 text-[#7A1316] hover:text-[#8F161A] font-mono font-bold hover:underline text-left cursor-pointer transition-colors"
                        title="Click to view proposal objection details"
                      >
                        <span>{item.baNo}</span>
                        <ExternalLink className="size-3 text-[#7A1316]/50 hover:text-[#7A1316]" />
                      </button>
                      {item.hearingDate && (
                        <div className="text-[10px] text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="size-2.5 shrink-0" />
                          <span>Hearing: {item.hearingDate}</span>
                        </div>
                      )}
                      {item.amount && (
                        <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                          Pending: {item.amount}
                        </div>
                      )}
                    </td>

                    {/* Permission Type */}
                    <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                      {item.permissionType}
                    </td>

                    {/* Status Badge: Type of Objection */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {item.category === "scrutiny-failed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-rose-50 text-rose-800 border-rose-300">
                          <span className="size-1.5 rounded-full bg-rose-600 inline-block" />
                          <span>Scrutiny Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-900 border-amber-300">
                          <span className="size-1.5 rounded-full bg-amber-600 inline-block" />
                          <span>Payment Failed</span>
                        </span>
                      )}
                    </td>

                    {/* Objection / Shortfall Details */}
                    <td className="px-3.5 py-2.5">
                      <p className="text-[11.5px] text-slate-800 leading-snug line-clamp-2" title={item.shortfallReason}>
                        {item.shortfallReason || "No specific shortfall recorded."}
                      </p>
                      {item.raisedBy && (
                        <span className="text-[10.5px] text-slate-500 block mt-0.5">
                          Officer: {item.raisedBy}
                        </span>
                      )}
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2.5 text-slate-800 font-medium whitespace-nowrap">
                      {item.owner || "-"}
                    </td>

                    {/* Case Type */}
                    <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                      <span className="inline-block bg-[#F5EBE1] text-[#7A1316] border border-[#E0D2BE] px-2 py-0.5 rounded text-[11px] font-bold">
                        {item.caseType}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {item.createdDate}
                    </td>

                    {/* Action Button */}
                    <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedObjection(item)}
                        className={cn(
                          "text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-2xs transition-colors cursor-pointer",
                          item.category === "scrutiny-failed"
                            ? "bg-[#7A1316] hover:bg-[#8F161A]"
                            : "bg-amber-700 hover:bg-amber-800"
                        )}
                      >
                        {item.category === "scrutiny-failed" ? "Rectify" : "Pay Now"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                    No objected proposals found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE FOOTER: Pagination | Refresh | Category Breakdown & Total Proposals ── */}
        <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-700 shrink-0">
          {/* Left: Pagination & Controls */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-slate-700 text-xs">[1]</span>
            <div className="h-3 w-px bg-[#DCD5C8]" />
            <button
              onClick={handleRefresh}
              title="Refresh Table"
              className="text-slate-600 hover:text-[#7A1316] px-2 py-1 rounded-full hover:bg-[#EFE3D5] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw
                className={cn("size-3.5", isRefreshing && "animate-spin text-[#7A1316]")}
              />
              <span className="text-[11px]">Refresh</span>
            </button>
          </div>

          {/* Right: Category Breakdown & Total Proposals Count */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              Scrutiny Failed: <strong className="text-rose-700 font-bold">{scrutinyFailedCount}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Payment Failed: <strong className="text-amber-800 font-bold">{paymentIncompleteCount}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">
              Total Objection(s): <span className="font-bold text-[#7A1316]">{sortedItems.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── VIEW REPORT MODAL ── */}
      {viewReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            <div className="bg-[#7A1316] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="size-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    Objection &amp; Compliance Report
                  </h3>
                  <p className="text-[10px] text-amber-200/90 font-mono">
                    APCRDA Building Permission Management System
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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

            <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-xs">
              <DetailedScrutinyReport
                proposalNo={sortedItems[0]?.baNo || "BA/2026/0892/BP"}
                projectTitle={sortedItems[0]?.owner ? `${sortedItems[0].owner} (1)` : "VADDURI VEERAIAH GARU (1)"}
                zone="R3-Medium to High density zone"
                typology="AP1-Apartment"
                scrutinyStatus={sortedItems[0]?.category === "payment-incomplete" ? "PASSED" : "FAILED"}
                onProceedToDocumentation={() => {
                  setViewReportModal(false);
                  showToast("Proceeding to statutory documentation checklist...");
                }}
                onReuploadForScrutiny={() => {
                  setViewReportModal(false);
                  showToast("Opening drawing re-upload module for CAD objection clearance...");
                }}
                onClose={() => setViewReportModal(false)}
              />
            </div>

            <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-5 py-2.5 flex items-center justify-between text-slate-600 text-xs shrink-0">
              <span className="text-[11px] italic">Official APCRDA BBAS Scrutiny &amp; Fee Status Audit</span>
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
