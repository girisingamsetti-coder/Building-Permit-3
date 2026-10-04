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
  ArrowRight,
  ArrowLeft,
  Plus,
} from "lucide-react";
import type { Application } from "@/types";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { LtpSubmissionDetails } from "./ltp-submission-details";
import { DetailedScrutinyReport } from "./detailed-scrutiny-report";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type DraftStageKey = "form" | "drawing" | "documentation" | "payments" | "nocs";

export interface DraftStageConfig {
  key: DraftStageKey;
  label: string;
  badgeCls: string;
  stepNumber: number;
}

export const DRAFT_STAGES: Record<DraftStageKey, DraftStageConfig> = {
  form: {
    key: "form",
    label: "Application Form",
    stepNumber: 1,
    badgeCls: "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100",
  },
  drawing: {
    key: "drawing",
    label: "Drawings",
    stepNumber: 2,
    badgeCls: "bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100",
  },
  documentation: {
    key: "documentation",
    label: "Documentation",
    stepNumber: 3,
    badgeCls: "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100",
  },
  payments: {
    key: "payments",
    label: "Payments",
    stepNumber: 4,
    badgeCls: "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100",
  },
  nocs: {
    key: "nocs",
    label: "Apply for NOCs",
    stepNumber: 5,
    badgeCls: "bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100",
  },
};

interface DraftItem {
  id: string;
  baNo: string;
  permissionType: string;
  createdDate: string;
  status: string;
  owner: string;
  appId?: string;
  lpsType?: "LPS Layout" | "Non-LPS";
  type: "LPS" | "Non LPS";
  stage: DraftStageKey;
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
  const [filterScheme, setFilterScheme] = React.useState("ALL");
  const [filterStage, setFilterStage] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<keyof DraftItem>("createdDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedDraft, setSelectedDraft] = React.useState<DraftItem | null>(null);
  const [isSelectingScheme, setIsSelectingScheme] = React.useState(false);
  const [newApplicationDraft, setNewApplicationDraft] = React.useState<{
    baNo: string;
    permissionType: string;
    submittedDate: string;
    status: string;
    lpsType: "LPS" | "Non LPS";
  } | null>(null);
  const [viewReportModal, setViewReportModal] = React.useState(false);
  const [reportModalTab, setReportModalTab] = React.useState<"scrutiny" | "registry">("scrutiny");
  // Per-row type overrides (LPS / Non LPS)
  const [typeOverrides, setTypeOverrides] = React.useState<Record<string, "LPS" | "Non LPS">>({}); 
  const getItemType = (item: DraftItem): "LPS" | "Non LPS" =>
    typeOverrides[item.id] ?? item.type;
  // Per-row stage overrides
  const [stageOverrides, setStageOverrides] = React.useState<Record<string, DraftStageKey>>({});
  const getItemStage = (item: DraftItem): DraftStageKey =>
    stageOverrides[item.id] ?? item.stage;

  // Compute draft proposals from store or include realistic APCRDA demo drafts
  const draftItems: DraftItem[] = React.useMemo(() => {
    const userDrafts = applications.filter(
      (a) => a.status === "DRAFT"
    );

    const stageSequence: DraftStageKey[] = [
      "form",
      "drawing",
      "documentation",
      "payments",
      "nocs",
    ];

    // Format draft items
    const items: DraftItem[] = userDrafts.map((a, idx) => {
      // Format Application No: if not already D or Temp, format as APCRDA draft number starting with D/
      const ba = a.applicationNo.startsWith("D/")
        ? a.applicationNo
        : a.applicationNo.startsWith("Temp/")
        ? a.applicationNo.replace(/^Temp\//, "D/")
        : `D/1168/${String(260 + idx).padStart(4, "0")}/BP/${new Date(a.submissionDate || Date.now()).getFullYear()}`;

      const created = new Date(a.submissionDate || a.lastUpdated || Date.now());
      const dateStr = `${created.getDate()}/${created.getMonth() + 1}/${created.getFullYear()}`;

      const typeLabel =
        a.project?.type === "LAYOUT_APPROVAL" || a.project?.type === "DEVELOPMENT_PERMIT"
          ? "Group Development"
          : "Building Permission";

      const isLps = a.applicationNo.includes("/LPS/") || a.project?.type === "LAYOUT_APPROVAL";
      const stage: DraftStageKey = stageSequence[idx % stageSequence.length];

      return {
        id: a.id || `draft-${idx}`,
        baNo: ba,
        permissionType: typeLabel,
        createdDate: dateStr,
        status: "Draft",
        owner: a.applicant?.name || "",
        appId: a.id,
        type: isLps ? "LPS" : "Non LPS",
        stage,
      };
    });

    // If user has fewer drafts (e.g. 0 to 2), supply realistic APCRDA demo drafts
    // so all 5 drafting stages are represented and easily testable
    if (items.length < 5) {
      const demoDrafts: DraftItem[] = [
        {
          id: "demo-draft-form",
          baNo: "D/1168/0189/BP/2026",
          permissionType: "Building Permission",
          createdDate: "02/10/2026",
          status: "Draft",
          owner: "K. Ramamurthy",
          type: "Non LPS",
          stage: "form",
        },
        {
          id: "demo-draft-drawing",
          baNo: "D/1168/0234/BP/2026",
          permissionType: "Building Permission",
          createdDate: "28/09/2026",
          status: "Draft",
          owner: "P. Venkata Rao",
          type: "Non LPS",
          stage: "drawing",
        },
        {
          id: "demo-draft-doc",
          baNo: "D/1168/0312/GD/2026",
          permissionType: "Group Development",
          createdDate: "24/09/2026",
          status: "Draft",
          owner: "M/s Amaravati Estates",
          type: "LPS",
          stage: "documentation",
        },
        {
          id: "demo-draft-pay",
          baNo: "D/1168/0405/BP/2026",
          permissionType: "Building Permission",
          createdDate: "20/09/2026",
          status: "Draft",
          owner: "Ch. Nageswara Rao",
          type: "Non LPS",
          stage: "payments",
        },
        {
          id: "demo-draft-noc",
          baNo: "D/1168/0521/BP/2026",
          permissionType: "Building Permission",
          createdDate: "15/09/2026",
          status: "Draft",
          owner: "T. Balaram Krishna",
          type: "LPS",
          stage: "nocs",
        },
      ];

      for (const demo of demoDrafts) {
        if (!items.some((it) => it.baNo === demo.baNo || it.stage === demo.stage)) {
          items.push(demo);
        }
      }
    }

    return items;
  }, [applications]);

  const uniqueOwners = React.useMemo(() => {
    const set = new Set<string>();
    draftItems.forEach((item) => {
      if (item.owner) set.add(item.owner);
    });
    return Array.from(set);
  }, [draftItems]);

  const activeFilterCount =
    (filterType !== "ALL" ? 1 : 0) +
    (filterOwner !== "ALL" ? 1 : 0) +
    (filterScheme !== "ALL" ? 1 : 0) +
    (filterStage !== "ALL" ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchKeywords("");
    setFilterType("ALL");
    setFilterOwner("ALL");
    setFilterScheme("ALL");
    setFilterStage("ALL");
  };

  // Filtering
  const filteredItems = React.useMemo(() => {
    return draftItems.filter((item) => {
      const currentStage = getItemStage(item);
      const currentType = getItemType(item);

      // Keyword search
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const stageLabel = DRAFT_STAGES[currentStage]?.label?.toLowerCase() || "";
        const matches =
          item.baNo.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          currentType.toLowerCase().includes(q) ||
          stageLabel.includes(q);
        if (!matches) return false;
      }

      // Column filters
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;
      if (filterOwner !== "ALL" && item.owner !== filterOwner) return false;
      if (filterScheme !== "ALL") {
        const isLps = currentType === "LPS";
        if (filterScheme === "LPS" && !isLps) return false;
        if (filterScheme === "Non LPS" && isLps) return false;
      }
      if (filterStage !== "ALL" && currentStage !== filterStage) return false;

      return true;
    });
  }, [draftItems, searchKeywords, filterType, filterOwner, filterScheme, filterStage, stageOverrides, typeOverrides]);

  // Sorting
  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA: string = "";
      let valB: string = "";
      if (sortField === "type") {
        valA = getItemType(a);
        valB = getItemType(b);
      } else if (sortField === "stage") {
        valA = DRAFT_STAGES[getItemStage(a)]?.label || getItemStage(a);
        valB = DRAFT_STAGES[getItemStage(b)]?.label || getItemStage(b);
      } else {
        valA = (a[sortField] as string) || "";
        valB = (b[sortField] as string) || "";
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortAsc, typeOverrides, stageOverrides]);

  const handleSort = (field: keyof DraftItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenDraft = (item: DraftItem) => {
    const currentStage = getItemStage(item);
    const currentType = getItemType(item);
    setSelectedDraft({
      ...item,
      stage: currentStage,
      type: currentType,
      lpsType: currentType === "LPS" ? "LPS Layout" : "Non-LPS",
    });
  };

  const exportCSV = () => {
    const headers = ["#", "Draft No.", "Permission Type", "Type", "Stage", "Created Date", "Owner"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.permissionType}"`,
      `"${getItemType(item)}"`,
      `"${DRAFT_STAGES[getItemStage(item)]?.label || item.stage}"`,
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

  const handleCreateNewApp = (scheme: "LPS Layout" | "Non-LPS") => {
    setIsSelectingScheme(false);
    const now = new Date();
    const typeCode = scheme === "LPS Layout" ? "LPS" : "BP";
    const newDraftNo = `D/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/${typeCode}/${now.getFullYear()}`;
    const newLpsStatus: "LPS" | "Non LPS" = scheme === "LPS Layout" ? "LPS" : "Non LPS";
    setNewApplicationDraft({
      baNo: newDraftNo,
      permissionType: scheme === "LPS Layout" ? "LPS Building Permission" : "Building Permission",
      submittedDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      status: "Draft",
      lpsType: newLpsStatus,
    });
  };

  // If user selected to create a new application draft directly, render the statutory form
  if (newApplicationDraft) {
    return (
      <LtpSubmissionDetails
        baNo={newApplicationDraft.baNo}
        proposalStatus="Draft"
        submissionDate={newApplicationDraft.submittedDate}
        isDraft={true}
        initialLpsType={newApplicationDraft.lpsType === "LPS" ? "LPS Layout" : "Non-LPS"}
        onBack={() => setNewApplicationDraft(null)}
      />
    );
  }

  if (isSelectingScheme) {
    return (
      <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col font-sans text-slate-800 overflow-hidden">
        {/* Main Card / Outlined Container fitting across contents area */}
        <div className="w-full h-full rounded-xl border-2 border-[#7A1316] bg-white shadow-xs overflow-y-auto flex flex-col flex-1 min-h-0 p-6 sm:p-8 lg:p-10 justify-between gap-6">
          <div className="text-center space-y-2 border-b border-[#DCD5C8] pb-4">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20 uppercase tracking-wider">
              APCRDA Building Permission
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#7A1316] tracking-tight">Select Application Scheme</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Please choose whether your site is part of the Amaravati Land Pooling Scheme (LPS) or a Non-LPS layout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto my-auto items-stretch">
            {/* Button 1: LPS */}
            <button
              id="draft-new-app-btn-lps"
              onClick={() => handleCreateNewApp("LPS Layout")}
              className="group relative flex flex-col p-6 sm:p-8 rounded-xl border-2 border-[#7A1316] bg-[#FAF7F2] hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl font-black text-[#7A1316] group-hover:scale-105 transition-transform">LPS</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7A1316] text-white">LPS Layout</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1.5">Land Pooling Scheme Layout Application</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                For plots situated inside the Amaravati Capital City Land Pooling Scheme. Includes LPS Block No, LPS Survey No, LPS Plot No, and APCRDA pre-approved zoning districts (R3).
              </p>
              <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                  Open LPS Application <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Fast-track Scrutiny</span>
              </div>
            </button>

            {/* Button 2: Non LPS */}
            <button
              id="draft-new-app-btn-non-lps"
              onClick={() => handleCreateNewApp("Non-LPS")}
              className="group relative flex flex-col p-6 sm:p-8 rounded-xl border-2 border-slate-300 hover:border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl font-black text-slate-800 group-hover:text-[#7A1316] group-hover:scale-105 transition-transform">Non LPS</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#7A1316] group-hover:text-white transition-colors">Non-LPS Layout</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1.5">Non-LPS / Revenue Village / Gramkantam</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                For general revenue lands, Gramkantam, extended habitation, private layouts, and village settlement plots requiring Mandal, Village, and Survey verification.
              </p>
              <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                  Open Non LPS Application <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Standard Revenue Scrutiny</span>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="w-full max-w-5xl mx-auto rounded-lg border border-[#DCD5C8] bg-[#FBF3E4] p-3.5 text-xs text-slate-700 leading-relaxed shadow-2xs">
            An application number is issued as soon as you begin, and the file is saved as a draft. You can leave at any point and pick up where you left off — nothing is filed until you submit it.
          </div>

          {/* Cancel button */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => setIsSelectingScheme(false)}
              className="text-xs font-semibold text-slate-500 hover:text-[#7A1316] hover:underline cursor-pointer"
            >
              Cancel and return to Drafts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user opened a specific draft, render the comprehensive details view
  if (selectedDraft) {
    return (
      <LtpSubmissionDetails
        baNo={selectedDraft.baNo}
        proposalStatus={selectedDraft.status}
        submissionDate={selectedDraft.createdDate}
        isDraft={true}
        initialLpsType={selectedDraft.lpsType || (selectedDraft.type === "LPS" ? "LPS Layout" : "Non-LPS")}
        initialTab={selectedDraft.stage}
        onBack={() => setSelectedDraft(null)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS: Search, Filters & Export in a Single Row ── */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* Search Input Box (Pillow-shaped) */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 h-8 w-full sm:w-60 shadow-2xs hover:shadow-xs focus-within:border-[#7A1316] focus-within:ring-2 focus-within:ring-[#7A1316]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder=""
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

          {/* Filter: Permission Type */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 rounded-full border-[#DCD5C8] bg-white text-xs font-medium px-3.5 shadow-2xs hover:shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Type:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="Building Permission">Building Permission</SelectItem>
              <SelectItem value="Group Development">Group Development</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter: Scheme Layout */}
          <Select value={filterScheme} onValueChange={setFilterScheme}>
            <SelectTrigger className="h-8 rounded-full border-[#DCD5C8] bg-white text-xs font-medium px-3.5 shadow-2xs hover:shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Scheme:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="LPS">LPS Layout</SelectItem>
              <SelectItem value="Non LPS">Non-LPS</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter: Draft Stage */}
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="h-8 rounded-full border-[#DCD5C8] bg-white text-xs font-medium px-3.5 shadow-2xs hover:shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Stage:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="form">Application Form</SelectItem>
              <SelectItem value="drawing">Drawings</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
              <SelectItem value="nocs">Apply for NOCs</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter: Owner / Applicant */}
          <Select value={filterOwner} onValueChange={setFilterOwner}>
            <SelectTrigger className="h-8 rounded-full border-[#DCD5C8] bg-white text-xs font-medium px-3.5 shadow-2xs hover:shadow-xs max-w-[200px]">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Owner:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="New">New</SelectItem>
              {uniqueOwners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner || "New Proposal"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(searchKeywords || activeFilterCount > 0) && (
            <button
              onClick={handleClearAllFilters}
              className="rounded-full px-3 py-1.5 bg-red-50 text-[#7A1316] border border-[#7A1316]/20 hover:bg-red-100 hover:border-[#7A1316]/40 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
            >
              <X className="size-3" />
              <span>Clear</span>
            </button>
          )}

          {/* Export Action Button */}
          <button
            onClick={exportCSV}
            title="Export to Excel / CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 border border-[#DCD5C8] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Export</span>
          </button>

          {/* New Application Button */}
          <button
            id="draft-new-app-btn"
            onClick={() => setIsSelectingScheme(true)}
            className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs h-[30px] px-3.5 rounded-full flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer border border-[#630E10]"
          >
            <Plus className="size-3.5" />
            <span>New Application</span>
          </button>
      </div>

      {/* ── TABLE CONTAINER (Maroon & Beige Theme) ── */}
      <div className="w-full rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
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
                    <span>Draft No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("permissionType")}
                  className="w-44 px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Permission Type</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                {/* Type column */}
                <th className="px-2 py-2 font-bold select-none w-20 text-center whitespace-nowrap">
                  Type
                </th>

                {/* Stage column */}
                <th
                  onClick={() => handleSort("stage")}
                  className="px-2.5 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-36 text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stage</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("owner")}
                  className="w-56 max-w-[240px] px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Owner / Applicant</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("createdDate")}
                  className="px-2.5 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none w-28 text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Created Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-24 px-2.5 py-2 font-bold text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DCD5C8] bg-white">
              {sortedItems.length > 0 ? (
                sortedItems.map((item, idx) => {
                  const currentType = getItemType(item);
                  const currentStage = getItemStage(item);
                  return (
                    <tr
                      key={item.id}
                      className="divide-x divide-[#EFE7DC] hover:bg-[#FAF4EB] transition-colors"
                    >
                      {/* Index */}
                      <td className="px-2 py-2 text-center font-medium text-slate-700">{idx + 1}</td>

                      {/* Draft No. */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDraft(item)}
                          className="inline-flex items-center gap-1.5 text-[#7A1316] hover:text-[#8F161A] font-bold hover:underline cursor-pointer text-left font-mono"
                          title={`Click to continue draft at ${DRAFT_STAGES[currentStage]?.label || currentStage} stage`}
                        >
                          <span>{item.baNo}</span>
                          <ExternalLink className="size-3 text-[#7A1316]/60 hover:text-[#7A1316]" />
                        </button>
                      </td>

                      {/* Permission Type */}
                      <td className="px-3 py-2 text-slate-800 font-medium whitespace-nowrap">{item.permissionType}</td>

                      {/* Type: LPS / Non LPS */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <select
                          value={currentType}
                          onChange={(e) =>
                            setTypeOverrides((prev) => ({
                              ...prev,
                              [item.id]: e.target.value as "LPS" | "Non LPS",
                            }))
                          }
                          aria-label="Select type"
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-bold border cursor-pointer outline-none appearance-none text-center",
                            currentType === "LPS"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                          )}
                        >
                          <option value="LPS">LPS</option>
                          <option value="Non LPS">Non LPS</option>
                        </select>
                      </td>

                      {/* Current Stage */}
                      <td className="px-2.5 py-2 text-center whitespace-nowrap">
                        <select
                          value={currentStage}
                          onChange={(e) => {
                            e.stopPropagation();
                            setStageOverrides((prev) => ({
                              ...prev,
                              [item.id]: e.target.value as DraftStageKey,
                            }));
                          }}
                          aria-label="Select draft stage"
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-bold border cursor-pointer outline-none appearance-none text-center shadow-2xs transition-colors",
                            DRAFT_STAGES[currentStage]?.badgeCls
                          )}
                          title="Current stage of proposal preparation. Click to change stage."
                        >
                          <option value="form">1. Application Form</option>
                          <option value="drawing">2. Drawings</option>
                          <option value="documentation">3. Documentation</option>
                          <option value="payments">4. Payments</option>
                          <option value="nocs">5. Apply for NOCs</option>
                        </select>
                      </td>

                      {/* Owner / Applicant */}
                      <td className="px-3 py-2 text-slate-700 font-medium">{item.owner || "New Proposal"}</td>

                      {/* Created Date */}
                      <td className="px-2.5 py-2 text-slate-700 tabular-nums whitespace-nowrap text-center">{item.createdDate}</td>

                      {/* Action: Resume */}
                      <td className="px-2.5 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDraft(item)}
                          className="rounded-full px-3 py-1 bg-[#7A1316]/10 hover:bg-[#7A1316] text-[#7A1316] hover:text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                          title={`Resume proposal at ${DRAFT_STAGES[currentStage]?.label || currentStage} stage`}
                        >
                          <span>Resume</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
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
                  setFilterScheme("ALL");
                  setFilterStage("ALL");
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
                          <th className="px-3 py-2">Proposal / Application No.</th>
                          <th className="px-3 py-2">Permission Type</th>
                          <th className="px-3 py-2 text-center">Type</th>
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
                            <td className="px-3 py-2 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border",
                                getItemType(item) === "LPS"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-blue-100 text-blue-800 border-blue-300"
                              )}>
                                {getItemType(item)}
                              </span>
                            </td>
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
