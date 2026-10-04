"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { useAppStore } from "@/store/app-store";
import {
  Clock,
  Search,
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  FileText,
  ChevronsUpDown,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  AlertCircle,
  Printer,
} from "lucide-react";
import { DetailedScrutinyReport } from "./detailed-scrutiny-report";

export type ReviewStageKey =
  | "predcr"
  | "documentation"
  | "site-inspection"
  | "fire-noc"
  | "accounts"
  | "zonal-head"
  | "director"
  | "commissioner";

export interface InReviewItem {
  id: string;
  baNo: string;
  projectName: string;
  permissionType: string;
  stageKey: ReviewStageKey;
  stageLabel: string;
  assignedOfficer: string;
  officerRole: string;
  slaDays: number;
  slaStatus: "On track" | "Due soon" | "Overdue";
  owner: string;
  caseType: string;
  submissionDate: string;
  lpsType?: "LPS" | "Non LPS";
  village?: string;
  district?: string;
  appId?: string;
}

const DEFAULT_IN_REVIEW_ITEMS: InReviewItem[] = [
  {
    id: "rev-1",
    baNo: "BA/2026/0142/BP",
    projectName: "Amaravati Residency (G+4)",
    permissionType: "Building Permission",
    stageKey: "predcr",
    stageLabel: "Technical Scrutiny (PreDCR CAD)",
    assignedOfficer: "Er. K. Suresh",
    officerRole: "TPS",
    slaDays: 2,
    slaStatus: "Due soon",
    owner: "V. Ramamurthy",
    caseType: "Fresh",
    submissionDate: "28/09/2026",
    lpsType: "LPS",
    village: "Inavolu",
    district: "Guntur",
  },
  {
    id: "rev-2",
    baNo: "BA/2026/0215/BP",
    projectName: "Green Valley High-Rise Complex",
    permissionType: "Building Permission",
    stageKey: "documentation",
    stageLabel: "Document Verification Desk",
    assignedOfficer: "Dr. P. Chandrasekhar",
    officerRole: "Legal & Revenue",
    slaDays: 4,
    slaStatus: "On track",
    owner: "M. Nageswara Rao",
    caseType: "Revision",
    submissionDate: "25/09/2026",
    lpsType: "Non LPS",
    village: "Mandadam",
    district: "Guntur",
  },
  {
    id: "rev-3",
    baNo: "BA/2026/0388/GD",
    projectName: "Capital Heights Group Housing (B+G+12)",
    permissionType: "Group Development",
    stageKey: "director",
    stageLabel: "Director DP Review Desk",
    assignedOfficer: "Dr. K. Chandrasekhar",
    officerRole: "Director DP",
    slaDays: 1,
    slaStatus: "Due soon",
    owner: "Apex Builders Pvt Ltd",
    caseType: "Fresh",
    submissionDate: "21/09/2026",
    lpsType: "LPS",
    village: "Venkatapalem",
    district: "Guntur",
  },
  {
    id: "rev-4",
    baNo: "BA/2026/0491/BP",
    projectName: "Surya Teja Commercial Complex",
    permissionType: "Commercial",
    stageKey: "zonal-head",
    stageLabel: "Zonal Head Review Desk (ZJD)",
    assignedOfficer: "Sri. K. Venkateshwara Rao",
    officerRole: "ZJD",
    slaDays: 5,
    slaStatus: "On track",
    owner: "K. Satyanarayana",
    caseType: "Regularization",
    submissionDate: "22/09/2026",
    lpsType: "LPS",
    village: "Borupalem",
    district: "Guntur",
  },
  {
    id: "rev-5",
    baNo: "BA/2026/0512/BP",
    projectName: "Sri Sai Enclave (G+2 Residential)",
    permissionType: "Building Permission",
    stageKey: "site-inspection",
    stageLabel: "Site Inspection & Demarcation",
    assignedOfficer: "Er. M. Ravi Teja",
    officerRole: "ATP",
    slaDays: 3,
    slaStatus: "On track",
    owner: "Smt. G. Sarada",
    caseType: "Fresh",
    submissionDate: "29/09/2026",
    lpsType: "Non LPS",
    village: "Thullur",
    district: "Guntur",
  },
  {
    id: "rev-6",
    baNo: "BA/2026/0634/BP",
    projectName: "Padmavathi Towers (G+5 Apartment)",
    permissionType: "Building Permission",
    stageKey: "fire-noc",
    stageLabel: "Fire & Emergency NOC Clearance",
    assignedOfficer: "Divisional Fire Officer",
    officerRole: "SDRF Wing",
    slaDays: 5,
    slaStatus: "On track",
    owner: "Ch. Venkatadri Naidu",
    caseType: "Resubmission",
    submissionDate: "18/09/2026",
    lpsType: "LPS",
    village: "Nelapadu",
    district: "Guntur",
  },
  {
    id: "rev-7",
    baNo: "BA/2026/0721/GD",
    projectName: "Amaravati IT Logistics Park",
    permissionType: "Group Development",
    stageKey: "commissioner",
    stageLabel: "Commissioner Final Approval",
    assignedOfficer: "Commissioner APCRDA",
    officerRole: "Commissioner",
    slaDays: 6,
    slaStatus: "On track",
    owner: "Amaravati Infra Consortium",
    caseType: "Fresh",
    submissionDate: "15/09/2026",
    lpsType: "LPS",
    village: "Navuluru",
    district: "Guntur",
  },
  {
    id: "rev-8",
    baNo: "BA/2026/0805/BP",
    projectName: "Bhavani Nilayam (G+3 Commercial)",
    permissionType: "Commercial",
    stageKey: "accounts",
    stageLabel: "Accounts & Fee Reconciliation",
    assignedOfficer: "Accounts Officer",
    officerRole: "Accounts Wing",
    slaDays: 2,
    slaStatus: "Due soon",
    owner: "B. Venkateswarlu",
    caseType: "Fresh",
    submissionDate: "01/10/2026",
    lpsType: "LPS",
    village: "Inavolu",
    district: "Guntur",
  },
];

export function LtpInReview() {
  const { applications } = useDashboardScope();
  const openApplication = useAppStore((s) => s.openApplication);

  // Search & Filter State
  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterStage, setFilterStage] = React.useState<string>("ALL");
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [filterCaseType, setFilterCaseType] = React.useState<string>("ALL");
  const [sortField, setSortField] = React.useState<keyof InReviewItem>("submissionDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [viewReportModal, setViewReportModal] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Combine store applications with standard APCRDA review items
  const inReviewItems: InReviewItem[] = React.useMemo(() => {
    const storeItems: InReviewItem[] = [];

    applications
      .filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status))
      .forEach((a, idx) => {
        const d = new Date(a.submissionDate || a.lastUpdated || Date.now());
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        const rawType = a.project?.type as string | undefined;
        const pType =
          rawType === "LAYOUT_APPROVAL" || rawType === "DEVELOPMENT_PERMIT"
            ? "Group Development"
            : rawType === "COMMERCIAL"
            ? "Commercial"
            : "Building Permission";

        let stageKey: ReviewStageKey = "predcr";
        let stageLabel = a.currentStageLabel || "Technical Scrutiny (PreDCR CAD)";
        const lowerStatus = (a.status || "").toLowerCase();
        const lowerStage = (a.currentStage || "").toLowerCase();

        if (lowerStatus.includes("doc") || lowerStage.includes("doc")) {
          stageKey = "documentation";
          stageLabel = "Document Verification Desk";
        } else if (lowerStage.includes("zonal") || lowerStage.includes("zjd")) {
          stageKey = "zonal-head";
          stageLabel = "Zonal Head Review Desk (ZJD)";
        } else if (lowerStage.includes("director")) {
          stageKey = "director";
          stageLabel = "Director DP Review Desk";
        } else if (lowerStage.includes("commissioner")) {
          stageKey = "commissioner";
          stageLabel = "Commissioner Final Approval";
        } else if (lowerStage.includes("inspect")) {
          stageKey = "site-inspection";
          stageLabel = "Site Inspection Desk";
        } else if (lowerStatus.includes("pay") || lowerStage.includes("fee")) {
          stageKey = "accounts";
          stageLabel = "Accounts & Fee Clearance";
        }

        storeItems.push({
          id: a.id || `rev-store-${idx}`,
          baNo: a.applicationNo || `BA/2026/${1500 + idx}/BP`,
          projectName: a.project?.name || "Proposed Construction",
          permissionType: pType,
          stageKey,
          stageLabel,
          assignedOfficer: a.assignedOfficer?.name ?? "Under Scrutiny",
          officerRole: a.assignedOfficer?.role ?? "Review Officer",
          slaDays: 3,
          slaStatus: "On track",
          owner: a.applicant?.name || "Applicant",
          caseType: idx % 2 === 0 ? "Fresh" : "Revision",
          submissionDate: dateStr,
          lpsType: a.applicationNo?.includes("/LPS/") ? "LPS" : "Non LPS",
          village: (a.project as any)?.village || "Borupalem",
          district: (a.project as any)?.district || "Guntur",
          appId: a.id,
        });
      });

    return storeItems;
  }, [applications]);

  // Stage breakdown counts
  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      predcr: 0,
      documentation: 0,
      "site-inspection": 0,
      "fire-noc": 0,
      accounts: 0,
      "zonal-head": 0,
      director: 0,
      commissioner: 0,
    };
    inReviewItems.forEach((item) => {
      if (counts[item.stageKey] !== undefined) {
        counts[item.stageKey]++;
      }
    });
    return counts;
  }, [inReviewItems]);

  // Filtering
  const filteredItems = React.useMemo(() => {
    return inReviewItems.filter((item) => {
      // 1. Filter by Stage
      if (filterStage !== "ALL" && item.stageKey !== filterStage) return false;

      // 2. Filter by Permission Type
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;

      // 3. Filter by Case Type
      if (filterCaseType !== "ALL" && item.caseType !== filterCaseType) return false;

      // 4. Keyword search
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const matches =
          item.baNo.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q) ||
          item.stageLabel.toLowerCase().includes(q) ||
          item.assignedOfficer.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.caseType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [inReviewItems, filterStage, filterType, filterCaseType, searchKeywords]);

  // Sorting
  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortAsc]);

  const handleSort = (field: keyof InReviewItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleClear = () => {
    setSearchKeywords("");
    setFilterStage("ALL");
    setFilterType("ALL");
    setFilterCaseType("ALL");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "#",
      "Application No.",
      "Project Name",
      "Permission Type",
      "Review Stage",
      "Assigned Officer",
      "Officer Role",
      "SLA Days",
      "Applicant",
      "Case Type",
      "Submission Date",
    ];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.projectName}"`,
      `"${item.permissionType}"`,
      `"${item.stageLabel}"`,
      `"${item.assignedOfficer}"`,
      `"${item.officerRole}"`,
      item.slaDays,
      `"${item.owner}"`,
      `"${item.caseType}"`,
      `"${item.submissionDate}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `In_Review_Proposals_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stage Badge Helper
  const getStageBadge = (stageKey: ReviewStageKey, label: string) => {
    switch (stageKey) {
      case "predcr":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-purple-50 text-purple-900 border-purple-300">
            <span className="size-1.5 rounded-full bg-purple-600 inline-block" />
            <span>{label}</span>
          </span>
        );
      case "documentation":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-900 border-blue-300">
            <span className="size-1.5 rounded-full bg-blue-600 inline-block" />
            <span>{label}</span>
          </span>
        );
      case "site-inspection":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-900 border-amber-300">
            <span className="size-1.5 rounded-full bg-amber-600 inline-block" />
            <span>{label}</span>
          </span>
        );
      case "fire-noc":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-indigo-50 text-indigo-900 border-indigo-300">
            <span className="size-1.5 rounded-full bg-indigo-600 inline-block" />
            <span>{label}</span>
          </span>
        );
      case "accounts":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-900 border-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-600 inline-block" />
            <span>{label}</span>
          </span>
        );
      case "zonal-head":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-rose-50 text-[#7A1316] border-rose-300">
            <span className="size-1.5 rounded-full bg-[#7A1316] inline-block" />
            <span>{label}</span>
          </span>
        );
      case "director":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-950 border-amber-400">
            <span className="size-1.5 rounded-full bg-amber-700 inline-block" />
            <span>{label}</span>
          </span>
        );
      case "commissioner":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-[#FDF6ED] text-[#7A1316] border-[#801824]">
            <span className="size-1.5 rounded-full bg-[#801824] inline-block" />
            <span>{label}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-50 text-slate-800 border-slate-300">
            <span className="size-1.5 rounded-full bg-slate-600 inline-block" />
            <span>{label}</span>
          </span>
        );
    }
  };

  const handleOpenApplication = (item: InReviewItem) => {
    const targetApp =
      (item.appId ? applications.find((a) => a.id === item.appId) : null) ||
      applications.find((a) => a.applicationNo === item.baNo || a.id === item.id) ||
      applications[0];

    if (targetApp) {
      openApplication(targetApp.id, "ltp-application-details");
    }
  };

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS: Search, Filters & Action Buttons in a Single Row (Beige & Maroon) ── */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        {/* Search Input Box (Pillow-shaped) */}
        <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 h-[34px] w-full sm:w-56 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
          <Search className="size-3.5 text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="Search proposals..."
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

        {/* Filter: Review Stage */}
        <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
          <span className="text-[11px] font-bold text-[#7A1316] shrink-0">Stage:</span>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            aria-label="Filter Review Stage"
            className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
          >
            <option value="ALL">All</option>
            <option value="predcr">PreDCR Scrutiny ({stageCounts.predcr})</option>
            <option value="documentation">Document Verification ({stageCounts.documentation})</option>
            <option value="site-inspection">Site Inspection ({stageCounts["site-inspection"]})</option>
            <option value="fire-noc">Fire &amp; NOC ({stageCounts["fire-noc"]})</option>
            <option value="accounts">Accounts Clearance ({stageCounts.accounts})</option>
            <option value="zonal-head">Zonal Head (ZJD) ({stageCounts["zonal-head"]})</option>
            <option value="director">Director DP Review ({stageCounts.director})</option>
            <option value="commissioner">Commissioner Approval ({stageCounts.commissioner})</option>
          </select>
        </div>

        {/* Filter: Permission Type */}
        <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
          <span className="text-[11px] font-bold text-slate-600 shrink-0">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter Permission Type"
            className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
          >
            <option value="ALL">All</option>
            <option value="Building Permission">Building Permission</option>
            <option value="Group Development">Group Development</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        {/* Filter: Case Type */}
        <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
          <span className="text-[11px] font-bold text-slate-600 shrink-0">Case:</span>
          <select
            value={filterCaseType}
            onChange={(e) => setFilterCaseType(e.target.value)}
            aria-label="Filter Case Type"
            className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
          >
            <option value="ALL">All</option>
            <option value="Fresh">Fresh</option>
            <option value="Revision">Revision</option>
            <option value="Resubmission">Resubmission</option>
            <option value="Regularization">Regularization</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchKeywords ||
          filterStage !== "ALL" ||
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

        {/* Scrutiny Report Modal Trigger */}
        <button
          type="button"
          id="in-review-view-report-btn"
          onClick={() => setViewReportModal(true)}
          title="View Scrutiny & Status Report"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FBF3E4] text-[#7A1316] hover:text-[#8F161A] border border-[#DCD5C8] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <FileText className="size-3.5 text-[#7A1316]" />
          <span>Audit Report</span>
        </button>

        {/* Export to Excel / CSV */}
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
                <th className="w-10 px-2 py-2 text-center font-bold">#</th>

                <th
                  onClick={() => handleSort("baNo")}
                  className="w-36 px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Application No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("projectName")}
                  className="w-56 max-w-[220px] px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Project Name</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("permissionType")}
                  className="w-36 px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Permission Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("stageLabel")}
                  className="w-36 px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Current Review Stage</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("assignedOfficer")}
                  className="w-36 px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Assigned Officer</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("slaDays")}
                  className="w-20 px-2 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>SLA Days</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("owner")}
                  className="px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Applicant</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("caseType")}
                  className="w-24 px-2 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Case Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("submissionDate")}
                  className="w-24 px-2.5 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-20 px-2 py-2 font-bold text-center">Action</th>
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
                    <td className="px-2 py-2 text-center font-medium text-slate-700">
                      {idx + 1}
                    </td>

                    {/* Application No. */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenApplication(item)}
                        className="inline-flex items-center gap-1.5 text-[#7A1316] hover:text-[#8F161A] font-mono font-bold hover:underline text-left cursor-pointer transition-colors"
                        title="Click to view application details"
                      >
                        <span>{item.baNo}</span>
                        <ExternalLink className="size-3 text-[#7A1316]/50 hover:text-[#7A1316]" />
                      </button>
                      {item.lpsType && (
                        <div className="text-[10px] text-amber-900 font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="size-2.5 shrink-0 text-amber-700" />
                          <span>{item.lpsType}</span>
                          {item.village && <span>• {item.village}</span>}
                        </div>
                      )}
                    </td>

                    {/* Project Name */}
                    <td className="px-3 py-2">
                      <p className="font-semibold text-slate-800 line-clamp-1" title={item.projectName}>
                        {item.projectName}
                      </p>
                    </td>

                    {/* Permission Type */}
                    <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">
                      {item.permissionType}
                    </td>

                    {/* Current Review Stage */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStageBadge(item.stageKey, item.stageLabel)}
                    </td>

                    {/* Assigned Officer */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{item.assignedOfficer}</div>
                      <span className="text-[10.5px] text-[#7A1316] font-medium block">
                        {item.officerRole}
                      </span>
                    </td>

                    {/* SLA Days */}
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF4EB] text-slate-700 border border-[#DCD5C8]">
                        <Clock className="size-2.5 text-[#7A1316]" />
                        <span>{item.slaDays}d</span>
                      </div>
                    </td>

                    {/* Owner / Applicant */}
                    <td className="px-3 py-2 text-slate-800 font-medium whitespace-nowrap">
                      {item.owner || "-"}
                    </td>

                    {/* Case Type */}
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <span className="inline-block bg-[#F5EBE1] text-[#7A1316] border border-[#E0D2BE] px-2 py-0.5 rounded text-[11px] font-bold">
                        {item.caseType}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-2.5 py-2 text-slate-600 font-mono text-[11px] text-center whitespace-nowrap">
                      {item.submissionDate}
                    </td>

                    {/* Action Button: View proposal in Beige and Maroon */}
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenApplication(item)}
                        title="View application details"
                        className="text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 bg-[#7A1316] hover:bg-[#8F161A]"
                      >
                        <span>View</span>
                        <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 italic">
                    No in-review proposals found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE FOOTER: Pagination | Refresh | Stage Breakdown & Total In Review ── */}
        <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-700 shrink-0 flex-wrap gap-2">
          {/* Left: Pagination & Controls */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-slate-700 text-xs">[1]</span>
            <div className="h-3 w-px bg-[#DCD5C8]" />
            <button
              onClick={handleRefresh}
              title="Refresh In-Review Queue"
              className="text-slate-600 hover:text-[#7A1316] px-2 py-1 rounded-full hover:bg-[#EFE3D5] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw
                className={cn("size-3.5", isRefreshing && "animate-spin text-[#7A1316]")}
              />
              <span className="text-[11px]">Refresh</span>
            </button>
          </div>

          {/* Right: Stage Breakdown & Total Proposals Count */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="text-slate-600">
              PreDCR: <strong className="text-purple-800 font-bold">{stageCounts.predcr}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Documents: <strong className="text-blue-800 font-bold">{stageCounts.documentation}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Inspection: <strong className="text-amber-800 font-bold">{stageCounts["site-inspection"]}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Zonal Head: <strong className="text-[#7A1316] font-bold">{stageCounts["zonal-head"]}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Director/Comm: <strong className="text-amber-950 font-bold">{stageCounts.director + stageCounts.commissioner}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">
              Total In Review: <span className="font-bold text-[#7A1316]">{sortedItems.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── VIEW REPORT MODAL (Beige & Maroon) ── */}
      {viewReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            <div className="bg-[#7A1316] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="size-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    In-Review Scrutiny &amp; Workflow Audit Report
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
                proposalNo={sortedItems[0]?.baNo || "BA/2026/0142/BP"}
                projectTitle={sortedItems[0]?.projectName || "Amaravati Residency (G+4)"}
                zone="R3-Medium to High density zone"
                typology="AP1-Apartment"
                scrutinyStatus="PASSED"
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
              <span className="text-[11px] italic">Official APCRDA In-Review Workflow Audit</span>
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#7A1316] px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
