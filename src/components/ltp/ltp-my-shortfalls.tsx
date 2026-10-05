"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { ShortfallStatusBadge, ShortfallTypeBadge, RoleBadge } from "@/components/design-system/badges";
import { formatDate, formatDateTime } from "@/components/design-system/workflow";
import { FileUploader, type UploadedFile } from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  FileWarning,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Send,
  Download,
  ArrowRight,
  ShieldCheck,
  CalendarClock,
  AlertCircle,
  FileText,
  FileEdit,
  Eye,
  RefreshCw,
  Calendar,
  Layers,
  Building2,
  User,
  History,
  Check,
  CornerDownRight,
  Save,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  ExternalLink,
  Plus,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, Shortfall, ShortfallStatus, ShortfallSupportingDoc, ShortfallType } from "@/types";

type ShortfallWithApp = Shortfall & { application: Application };

const APCRDA_SHORTFALL_PRESETS = [
  {
    label: "Custom Deficiency / Query",
    type: "DOCUMENT" as ShortfallType,
    title: "",
    desc: "",
  },
  {
    label: "Structural Stability Certificate — Missing SE Stamp",
    type: "DOCUMENT" as ShortfallType,
    title: "Structural stability certificate missing Registered Structural Engineer stamp & signature",
    desc: "The structural drawings and stability declaration submitted lack the valid seal, registration number, and digital signature of an APCRDA-empaneled Structural Engineer.",
  },
  {
    label: "Rear Setback Non-Compliance (Table 8 DCR)",
    type: "TECHNICAL" as ShortfallType,
    title: "Rear setback provided (2.1m) is less than statutory requirement (3.0m) as per DCR Table 8",
    desc: "Drawing scrutiny reveals that the rear open setback provided in the layout plan is 2.1 meters, which is below the mandatory minimum of 3.0 meters for the given plot depth and building height.",
  },
  {
    label: "Plot Dimension Discrepancy with Registered Deed",
    type: "DOCUMENT" as ShortfallType,
    title: "Plot boundary & dimensions differ from Registered Sale Deed schedule",
    desc: "The boundary dimensions shown in the submitted site layout do not tally with the schedule of property in Registered Deed. Provide an authenticated surveyor sketch.",
  },
  {
    label: "Fire NOC Endorsement for Height > 15m",
    type: "TECHNICAL" as ShortfallType,
    title: "Provisional Fire NOC endorsement required for building height exceeding 15 meters",
    desc: "As the proposed total building height exceeds 15.0 meters, a Provisional No Objection Certificate from State Fire Services Department is mandatory.",
  },
  {
    label: "Statutory Betterment / Development Charges Shortfall",
    type: "FEE" as ShortfallType,
    title: "Shortfall in statutory development charges / Betterment fee calculation",
    desc: "A calculation variance has been noticed in the external infrastructure betterment levy. Remit balance towards revised scrutiny fees.",
  },
];

type QuickFilter = "ALL" | "PENDING_RESPONSE" | "RESPONDED" | "UNDER_REVIEW" | "CLARIFICATION_REQUIRED" | "CLOSED" | "OVERDUE";

// Helper to check if a shortfall is overdue
function isOverdue(sf: Shortfall): boolean {
  if (sf.status === "RESOLVED" || sf.status === "CLOSED" || sf.status === "RESPONSE_ACCEPTED") {
    return false;
  }
  const due = new Date(sf.dueDate).getTime();
  if (isNaN(due)) return false;
  return due < Date.now() && (sf.status === "OPEN" || sf.status === "RAISED" || sf.status === "PENDING_RESPONSE" || sf.status === "REOPENED" || sf.status === "CLARIFICATION_REQUIRED");
}

// Map shortfall to standard category
function getShortfallCategory(sf: Shortfall): "PENDING_RESPONSE" | "RESPONDED" | "UNDER_REVIEW" | "CLARIFICATION_REQUIRED" | "CLOSED" | "OVERDUE" {
  if (isOverdue(sf)) return "OVERDUE";
  if (sf.status === "RESOLVED" || sf.status === "CLOSED" || sf.status === "RESPONSE_ACCEPTED") return "CLOSED";
  if (sf.status === "REOPENED" || sf.status === "CLARIFICATION_REQUIRED") return "CLARIFICATION_REQUIRED";
  if (sf.status === "UNDER_REVIEW") return "UNDER_REVIEW";
  if (sf.status === "RESPONDED" || sf.status === "RESPONSE_SUBMITTED") return "RESPONDED";
  return "PENDING_RESPONSE";
}

export function LtpMyShortfalls() {
  const { openApplication, saveShortfallDraft, submitShortfallResponse, resolveShortfall, raiseShortfall, user } = useAppStore();
  const { applications } = useDashboardScope();
  const { toast } = useToast();
  const isLtp = user?.role === "LTP";

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState<QuickFilter>("ALL");
  const [sortField, setSortField] = React.useState<"raisedAt" | "dueDate" | "applicationNo">("raisedAt");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Modals & Details State
  const [selectedShortfall, setSelectedShortfall] = React.useState<ShortfallWithApp | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [respondOpen, setRespondOpen] = React.useState(false);

  // Raise Shortfall Modal State (for Non-LTP)
  const [raiseOpen, setRaiseOpen] = React.useState(false);
  const [raiseAppId, setRaiseAppId] = React.useState("");
  const [raiseTmplIdx, setRaiseTmplIdx] = React.useState("0");
  const [raiseType, setRaiseType] = React.useState<ShortfallType>("DOCUMENT");
  const [raiseTitle, setRaiseTitle] = React.useState("");
  const [raiseDesc, setRaiseDesc] = React.useState("");
  const [raiseDueDate, setRaiseDueDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Respond Form State
  const [responseText, setResponseText] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Scoped shortfalls belonging strictly to logged-in recipient
  const allShortfalls: ShortfallWithApp[] = React.useMemo(() => {
    return applications.flatMap((app) =>
      (app.shortfalls || []).map((sf) => ({
        ...sf,
        application: app,
      }))
    );
  }, [applications]);

  // Compute KPI counts across all 7 statuses
  const kpis = React.useMemo(() => {
    let total = allShortfalls.length;
    let pending = 0;
    let responded = 0;
    let underReview = 0;
    let clarification = 0;
    let closed = 0;
    let overdue = 0;

    for (const sf of allShortfalls) {
      const cat = getShortfallCategory(sf);
      if (cat === "OVERDUE") overdue++;
      else if (cat === "PENDING_RESPONSE") pending++;
      else if (cat === "RESPONDED") responded++;
      else if (cat === "UNDER_REVIEW") underReview++;
      else if (cat === "CLARIFICATION_REQUIRED") clarification++;
      else if (cat === "CLOSED") closed++;
    }

    return { total, pending, responded, underReview, clarification, closed, overdue };
  }, [allShortfalls]);

  // Filter & Sort
  const filteredShortfalls = React.useMemo(() => {
    return allShortfalls.filter((sf) => {
      // Type filter
      if (typeFilter !== "ALL" && sf.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== "ALL") {
        const cat = getShortfallCategory(sf);
        if (statusFilter !== cat) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAppNo = sf.applicationNo?.toLowerCase().includes(q);
        const matchesApplicant = sf.application?.applicant?.name?.toLowerCase().includes(q);
        const matchesSfId = (sf.shortfallId || "").toLowerCase().includes(q) || (sf.shortfallNumber || "").toLowerCase().includes(q);
        const matchesTitle = (sf.title || "").toLowerCase().includes(q);
        const matchesDesc = (sf.description || "").toLowerCase().includes(q);
        if (!matchesAppNo && !matchesApplicant && !matchesSfId && !matchesTitle && !matchesDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";
      if (sortField === "raisedAt" || sortField === "dueDate") {
        const timeA = new Date(valA).getTime() || 0;
        const timeB = new Date(valB).getTime() || 0;
        return sortAsc ? timeA - timeB : timeB - timeA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  }, [allShortfalls, typeFilter, statusFilter, searchQuery, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredShortfalls.length / pageSize));
  const paginatedShortfalls = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShortfalls.slice(start, start + pageSize);
  }, [filteredShortfalls, currentPage, pageSize]);

  // Reset pagination on filter change
  const [prevFilterFingerprint, setPrevFilterFingerprint] = React.useState("");
  const filterFingerprint = `${searchQuery}_${typeFilter}_${statusFilter}`;
  if (filterFingerprint !== prevFilterFingerprint) {
    setPrevFilterFingerprint(filterFingerprint);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }

  // Open details
  const handleOpenDetails = (sf: ShortfallWithApp) => {
    setSelectedShortfall(sf);
    setDetailsOpen(true);
  };

  // Open respond modal
  const handleOpenRespond = (sf: ShortfallWithApp) => {
    setSelectedShortfall(sf);
    // Pre-fill draft response if one exists
    if (sf.draftResponse) {
      setResponseText(sf.draftResponse.text || "");
      const restoredFiles: UploadedFile[] = (sf.draftResponse.files || []).map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size || "1.2 MB",
        progress: 100,
        status: "done" as const,
      }));
      setUploadedFiles(restoredFiles);
    } else {
      setResponseText("");
      setUploadedFiles([]);
    }
    setRespondOpen(true);
  };

  // Save Draft Response
  const handleSaveDraft = () => {
    if (!selectedShortfall) return;
    const docList: ShortfallSupportingDoc[] = uploadedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.file?.type || "application/pdf",
    }));

    saveShortfallDraft(selectedShortfall.applicationId, selectedShortfall.id, responseText, docList);
    toast({
      title: "Draft Saved",
      description: `Draft response for ${selectedShortfall.shortfallNumber || selectedShortfall.shortfallId} has been saved.`,
    });
    setRespondOpen(false);
  };

  // Submit Response
  const handleSubmitResponse = () => {
    if (!selectedShortfall) return;
    if (!responseText.trim()) {
      toast({
        title: "Response Remarks Required",
        description: "Please enter your explanation/remarks before submitting your response.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const docList: ShortfallSupportingDoc[] = uploadedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.file?.type || "application/pdf",
    }));

    setTimeout(() => {
      submitShortfallResponse(
        selectedShortfall.applicationId,
        selectedShortfall.id,
        responseText.trim(),
        docList
      );
      setIsSubmitting(false);
      setRespondOpen(false);
      setDetailsOpen(false);
      toast({
        title: "Shortfall Response Submitted",
        description: `Your response for ${selectedShortfall.shortfallNumber || selectedShortfall.shortfallId} has been submitted for scrutiny review.`,
      });
    }, 400);
  };

  const handleSort = (field: "raisedAt" | "dueDate" | "applicationNo") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
      {/* ── 5 KPI DASHBOARD SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 shrink-0">
        {/* 1. Total Shortfalls */}
        <button
          onClick={() => setStatusFilter("ALL")}
          className={cn(
            "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
            statusFilter === "ALL"
              ? "border-[#7A1316] ring-2 ring-[#7A1316]/20 shadow-xs"
              : "border-[#EADBCE] hover:border-[#7A1316]/50 hover:bg-[#FDFBF7]"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Total
            </span>
            <AlertTriangle className="size-3.5 text-[#7A1316]" />
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-black tabular-nums text-slate-900">
              {kpis.total}
            </p>
            <p className="text-[10px] mt-0.5 text-slate-500">
              All Shortfalls
            </p>
          </div>
        </button>

        {/* 2. Pending Response */}
        <button
          onClick={() => setStatusFilter("PENDING_RESPONSE")}
          className={cn(
            "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
            statusFilter === "PENDING_RESPONSE"
              ? "border-amber-600 ring-2 ring-amber-500/20 shadow-xs"
              : "border-[#EADBCE] hover:border-amber-600/50 hover:bg-[#FDFBF7]"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Pending
            </span>
            <Clock className="size-3.5 text-amber-600" />
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-black tabular-nums text-amber-700">
              {kpis.pending}
            </p>
            <p className="text-[10px] mt-0.5 text-slate-500">
              Awaiting Action
            </p>
          </div>
        </button>

        {/* 3. Response Submitted */}
        <button
          onClick={() => setStatusFilter("RESPONDED")}
          className={cn(
            "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
            statusFilter === "RESPONDED"
              ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
              : "border-[#EADBCE] hover:border-blue-600/50 hover:bg-[#FDFBF7]"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
              Submitted
            </span>
            <Send className="size-3.5 text-blue-600" />
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-black tabular-nums text-blue-700">
              {kpis.responded}
            </p>
            <p className="text-[10px] mt-0.5 text-slate-500">
              Response Sent
            </p>
          </div>
        </button>

        {/* 4. Closed */}
        <button
          onClick={() => setStatusFilter("CLOSED")}
          className={cn(
            "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
            statusFilter === "CLOSED"
              ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-[#EADBCE] hover:border-emerald-600/50 hover:bg-[#FDFBF7]"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Closed
            </span>
            <CheckCircle2 className="size-3.5 text-emerald-600" />
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-black tabular-nums text-emerald-700">
              {kpis.closed}
            </p>
            <p className="text-[10px] mt-0.5 text-slate-500">
              Resolved &amp; Accepted
            </p>
          </div>
        </button>

        {/* 5. Overdue */}
        <button
          onClick={() => setStatusFilter("OVERDUE")}
          className={cn(
            "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
            statusFilter === "OVERDUE"
              ? "border-rose-600 ring-2 ring-rose-500/20 shadow-xs"
              : "border-[#EADBCE] hover:border-rose-600/50 hover:bg-[#FDFBF7]"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Overdue
            </span>
            <CalendarClock className="size-3.5 text-rose-600" />
          </div>
          <div className="mt-1.5">
            <p className="text-2xl font-black tabular-nums text-rose-700">
              {kpis.overdue}
            </p>
            <p className="text-[10px] mt-0.5 text-slate-500">
              Due Date Passed
            </p>
          </div>
        </button>
      </div>

      {/* ── FILTER & SEARCH BAR (Pill shape consistent with APCRDA portal) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white border border-[#DCD5C8] p-2.5 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Application No, Applicant, Shortfall ID or Description..."
              className="h-8.5 pl-9 pr-3 text-xs rounded-full border-[#DCD5C8] bg-[#FAF7F2]/50 focus:bg-white"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Dropdown */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as QuickFilter)}>
            <SelectTrigger className="h-8.5 text-xs rounded-full border-[#DCD5C8] bg-[#FAF7F2]/50 w-[170px]">
              <Filter className="size-3 mr-1.5 text-[#7A1316]" />
              <span className="font-semibold text-slate-600 mr-1 text-[11px]">Status:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses ({kpis.total})</SelectItem>
              <SelectItem value="PENDING_RESPONSE">Pending Response ({kpis.pending})</SelectItem>
              <SelectItem value="RESPONDED">Response Submitted ({kpis.responded})</SelectItem>
              <SelectItem value="CLOSED">Closed ({kpis.closed})</SelectItem>
              <SelectItem value="OVERDUE">Overdue ({kpis.overdue})</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter Dropdown */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8.5 text-xs rounded-full border-[#DCD5C8] bg-[#FAF7F2]/50 w-[140px]">
              <span className="font-semibold text-slate-600 mr-1 text-[11px]">Type:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="DOCUMENT">Document</SelectItem>
              <SelectItem value="TECHNICAL">Technical</SelectItem>
              <SelectItem value="FEE">Fee</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortField} onValueChange={(v) => setSortField(v as any)}>
            <SelectTrigger className="h-8.5 text-xs rounded-full border-[#DCD5C8] bg-[#FAF7F2]/50 w-[160px]">
              <span className="font-semibold text-slate-600 mr-1 text-[11px]">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raisedAt">Raised Date</SelectItem>
              <SelectItem value="dueDate">Response Due Date</SelectItem>
              <SelectItem value="applicationNo">Application No.</SelectItem>
            </SelectContent>
          </Select>

          {!isLtp && (
            <Button
              size="sm"
              onClick={() => {
                if (applications.length > 0 && !raiseAppId) {
                  setRaiseAppId(applications[0].id);
                }
                setRaiseOpen(true);
              }}
              className="h-8.5 px-3.5 text-xs rounded-full bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <AlertTriangle className="size-3.5 text-amber-300" />
              <span>Raise Shortfall</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── SHORTFALL LIST TABLE ── */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header Row */}
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
              <tr className="divide-x divide-[#DCD5C8]">
                <th className="w-10 px-2 py-2.5 text-center font-bold">#</th>

                <th
                  onClick={() => handleSort("applicationNo")}
                  className="w-40 px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Application No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-44 px-3 py-2.5 font-bold whitespace-nowrap">
                  Applicant Name
                </th>

                <th className="w-32 px-3 py-2.5 font-bold whitespace-nowrap">
                  Shortfall No.
                </th>

                <th
                  onClick={() => handleSort("raisedAt")}
                  className="w-32 px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Raised Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("dueDate")}
                  className="w-32 px-3 py-2.5 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Due Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="px-3 py-2.5 font-bold min-w-[260px]">
                  Shortfall Description
                </th>

                <th className="w-32 px-3 py-2.5 font-bold text-center whitespace-nowrap">
                  Status
                </th>

                <th className="w-32 px-3 py-2.5 font-bold text-center whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DCD5C8] bg-white">
              {paginatedShortfalls.length > 0 ? (
                paginatedShortfalls.map((sf, idx) => {
                  const overdueFlag = isOverdue(sf);
                  const isClosed = sf.status === "RESOLVED" || sf.status === "CLOSED" || sf.status === "RESPONSE_ACCEPTED";
                  const canRespond = isLtp && !isClosed && sf.status !== "UNDER_REVIEW" && sf.status !== "RESPONDED" && sf.status !== "RESPONSE_SUBMITTED";
                  const canResolve = !isLtp && !isClosed && (sf.status === "RESPONDED" || sf.status === "UNDER_REVIEW" || sf.status === "RESPONSE_SUBMITTED");

                  return (
                    <tr
                      key={sf.id}
                      className="divide-x divide-[#EFE7DC] hover:bg-[#FAF4EB] transition-colors"
                    >
                      {/* Index */}
                      <td className="px-2 py-2.5 text-center font-medium text-slate-700">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* Application No. (clickable -> Application Details) */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => openApplication(sf.applicationId, "ltp-application-details")}
                          className="text-[#7A1316] hover:text-[#8F161A] font-mono font-bold hover:underline text-left cursor-pointer transition-colors"
                          title="Click to view full application details"
                        >
                          {sf.applicationNo}
                        </button>
                      </td>

                      {/* Applicant Name */}
                      <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                        <div className="truncate max-w-[170px]" title={sf.application?.applicant?.name}>
                          {sf.application?.applicant?.name || "—"}
                        </div>
                      </td>

                      {/* Shortfall No. */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {sf.shortfallNumber || `SF-${String(idx + 1).padStart(2, "0")}`}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {sf.shortfallId}
                          </span>
                        </div>
                      </td>

                      {/* Shortfall Raised Date */}
                      <td className="px-3 py-2.5 text-slate-600 font-mono text-center whitespace-nowrap">
                        {formatDate(sf.raisedAt)}
                      </td>

                      {/* Response Due Date */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap font-mono">
                        {overdueFlag ? (
                          <div className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <span>{formatDate(sf.dueDate)}</span>
                            <span className="text-[9px] uppercase tracking-wide bg-rose-600 text-white px-1 rounded">Overdue</span>
                          </div>
                        ) : (
                          <span className="text-slate-700 font-medium">{formatDate(sf.dueDate)}</span>
                        )}
                      </td>

                      {/* Shortfall Description */}
                      <td className="px-3 py-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">
                              {sf.title}
                            </span>
                            <ShortfallTypeBadge type={sf.type} />
                          </div>
                          <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                            {sf.description}
                          </p>
                          {sf.draftResponse && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <FileEdit className="size-3 text-amber-700" />
                              <span>Draft Saved ({formatDate(sf.draftResponse.savedAt)})</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {overdueFlag ? (
                          <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[11px] px-2 py-0.5">
                            Overdue
                          </Badge>
                        ) : (
                          <ShortfallStatusBadge status={sf.status} />
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {canRespond ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenRespond(sf)}
                              className="h-7 px-2.5 text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold gap-1 cursor-pointer shadow-2xs"
                              title="Submit response or save draft"
                            >
                              <Send className="size-3" />
                              <span>Respond</span>
                            </Button>
                          ) : canResolve ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenDetails(sf)}
                              className="h-7 px-2.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1 cursor-pointer shadow-2xs"
                              title="Verify and resolve shortfall"
                            >
                              <CheckCircle2 className="size-3" />
                              <span>Review</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDetails(sf)}
                              className="h-7 px-2.5 text-xs border-[#DCD5C8] text-[#7A1316] hover:bg-[#F3EADF] font-bold gap-1 cursor-pointer"
                              title="View full details and response history"
                            >
                              <Eye className="size-3" />
                              <span>View</span>
                            </Button>
                          )}

                          {(canRespond || canResolve) && (
                            <button
                              onClick={() => handleOpenDetails(sf)}
                              className="p-1 rounded text-slate-400 hover:text-[#7A1316] hover:bg-slate-100 cursor-pointer"
                              title="View details"
                            >
                              <Eye className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="size-8 text-emerald-600" />
                      <p className="font-bold text-slate-700 text-sm">No shortfalls match your criteria</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        All shortfalls on your proposals are currently compliant or no items match your active filters.
                      </p>
                      {(statusFilter !== "ALL" || typeFilter !== "ALL" || searchQuery) && (
                        <button
                          onClick={() => {
                            setStatusFilter("ALL");
                            setTypeFilter("ALL");
                            setSearchQuery("");
                          }}
                          className="mt-2 text-xs font-bold text-[#7A1316] hover:underline cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION BAR ── */}
        <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-3.5 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredShortfalls.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredShortfalls.length)}</span> of{" "}
            <span className="font-bold text-slate-900">{filteredShortfalls.length}</span> shortfalls
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-7 w-7 p-0 border-[#DCD5C8] bg-white cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-2 text-xs font-medium">
              Page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-7 w-7 p-0 border-[#DCD5C8] bg-white cursor-pointer disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── SHORTFALL DETAILS MODAL (Application Details + Shortfall Details + Timeline + Versions) ── */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF7F2] border-[#DCD5C8] p-0 font-sans">
          {selectedShortfall && (
            <div>
              {/* Header */}
              <div className="bg-[#F5EBE1] border-b border-[#DCD5C8] p-4 flex items-start justify-between gap-3 sticky top-0 z-20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#7A1316] bg-white px-2 py-0.5 rounded border border-[#DCD5C8]">
                      {selectedShortfall.shortfallNumber || "SF-01"}
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {selectedShortfall.shortfallId}
                    </span>
                    <ShortfallTypeBadge type={selectedShortfall.type} />
                    {isOverdue(selectedShortfall) ? (
                      <Badge className="bg-rose-600 text-white font-bold text-[10px]">Overdue</Badge>
                    ) : (
                      <ShortfallStatusBadge status={selectedShortfall.status} />
                    )}
                  </div>
                  <DialogTitle className="text-base font-bold text-slate-900 text-left">
                    {selectedShortfall.title}
                  </DialogTitle>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-5 text-xs text-slate-700">
                {/* 1. APPLICATION DETAILS */}
                <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-[#7A1316]" />
                      <h3 className="font-bold text-[#7A1316] text-xs">Application Details</h3>
                    </div>
                    <button
                      onClick={() => {
                        setDetailsOpen(false);
                        openApplication(selectedShortfall.applicationId, "ltp-application-details");
                      }}
                      className="text-[11px] font-bold text-[#7A1316] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Application</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Application No.</span>
                      <span className="font-mono font-bold text-[#7A1316]">{selectedShortfall.applicationNo}</span>
                    </div>

                    <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Applicant Name</span>
                      <span className="font-semibold text-slate-800">{selectedShortfall.application?.applicant?.name || "—"}</span>
                    </div>

                    <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Application Type</span>
                      <span className="font-semibold text-slate-800">{"Building Permission"}</span>
                    </div>

                    <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Submission Date</span>
                      <span className="font-semibold text-slate-800">{formatDate(selectedShortfall.application?.submissionDate)}</span>
                    </div>

                    <div className="col-span-2 rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Property Details</span>
                      <span className="font-semibold text-slate-800">
                        {selectedShortfall.application?.project?.name} · Zone: {selectedShortfall.application?.zone || "Zone 1"} · Plot Area: {selectedShortfall.application?.project?.plotArea} sq.m
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. SHORTFALL DETAILS */}
                <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2">
                    <FileWarning className="size-4 text-[#7A1316]" />
                    <h3 className="font-bold text-[#7A1316] text-xs">Shortfall Details</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Raised By Officer</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-800">{selectedShortfall.raisedBy.name}</span>
                          <RoleBadge role={selectedShortfall.raisedBy.role} />
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Department / Section</span>
                        <span className="font-semibold text-slate-800">{selectedShortfall.department || "Town Planning Cell"}</span>
                      </div>

                      <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Date Raised</span>
                        <span className="font-semibold text-slate-800">{formatDateTime(selectedShortfall.raisedAt)}</span>
                      </div>

                      <div className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Response Due Date</span>
                        <span className={cn("font-bold", isOverdue(selectedShortfall) ? "text-rose-700" : "text-slate-800")}>
                          {formatDate(selectedShortfall.dueDate)}
                        </span>
                      </div>

                      <div className="col-span-2 rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Current Status</span>
                        <div className="mt-0.5">
                          {isOverdue(selectedShortfall) ? (
                            <Badge className="bg-rose-600 text-white font-bold text-[11px]">Overdue</Badge>
                          ) : (
                            <ShortfallStatusBadge status={selectedShortfall.status} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shortfall Description */}
                    <div className="rounded-lg border border-[#EADBCE] bg-[#FAF7F2] p-3 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Shortfall Description</span>
                      <p className="text-xs text-slate-800 leading-relaxed">{selectedShortfall.description}</p>
                    </div>

                    {/* Required Action & Documents */}
                    {selectedShortfall.requiredAction && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3 space-y-1.5">
                        <span className="text-[10px] text-amber-900 uppercase font-bold block">Required Action</span>
                        <p className="text-xs text-amber-950 font-medium leading-relaxed">{selectedShortfall.requiredAction}</p>
                      </div>
                    )}

                    {selectedShortfall.requiredDocuments && selectedShortfall.requiredDocuments.length > 0 && (
                      <div className="rounded-lg border border-[#EADBCE] bg-white p-3 space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Required Documents</span>
                        <ul className="space-y-1">
                          {selectedShortfall.requiredDocuments.map((doc, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                              <FileText className="size-3.5 text-[#7A1316]" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. RESPONSE HISTORY & VERSIONING */}
                {selectedShortfall.responseVersions && selectedShortfall.responseVersions.length > 0 && (
                  <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
                      <div className="flex items-center gap-2">
                        <History className="size-4 text-[#7A1316]" />
                        <h3 className="font-bold text-[#7A1316] text-xs">Response History &amp; Versions</h3>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        {selectedShortfall.responseVersions.length} Version(s)
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {selectedShortfall.responseVersions.map((ver) => (
                        <div key={ver.version} className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-blue-900">
                              Response V{ver.version}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {formatDateTime(ver.respondedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {ver.text}
                          </p>

                          {/* Attached files */}
                          {ver.supportingDocuments && ver.supportingDocuments.length > 0 && (
                            <div className="pt-2 border-t border-blue-100 flex flex-wrap gap-2">
                              {ver.supportingDocuments.map((doc, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-blue-200 text-[11px] font-medium text-blue-800 shadow-2xs"
                                >
                                  <FileText className="size-3.5 text-blue-600" />
                                  <span>{doc.name}</span>
                                  {doc.size && <span className="text-[10px] text-slate-400">({doc.size})</span>}
                                  <Download className="size-3 text-slate-400 hover:text-blue-700 ml-1 cursor-pointer" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. WORKFLOW / TIMELINE */}
                <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2">
                    <Clock className="size-4 text-[#7A1316]" />
                    <h3 className="font-bold text-[#7A1316] text-xs">Shortfall Workflow Timeline</h3>
                  </div>

                  {selectedShortfall.timeline && selectedShortfall.timeline.length > 0 ? (
                    <ol className="relative space-y-0 pl-1 pt-1">
                      {selectedShortfall.timeline.map((evt, idx) => {
                        const isLast = idx === (selectedShortfall.timeline?.length ?? 1) - 1;
                        return (
                          <li key={evt.id || idx} className="relative flex gap-3 pb-5 last:pb-0">
                            {!isLast && (
                              <div className="absolute left-[13px] top-6 h-[calc(100%-0.5rem)] w-0.5 bg-[#DCD5C8]" />
                            )}
                            <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[#7A1316] bg-[#FAF7F2] text-[#7A1316]">
                              {evt.status === "RESOLVED" ? (
                                <Check className="size-3.5 text-emerald-700" />
                              ) : evt.status === "REOPENED" ? (
                                <CornerDownRight className="size-3.5 text-orange-600" />
                              ) : evt.status === "RESPONDED" ? (
                                <Send className="size-3.5 text-blue-600" />
                              ) : (
                                <AlertTriangle className="size-3.5 text-[#7A1316]" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">{evt.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{formatDateTime(evt.timestamp)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span>by {evt.actor.name}</span>
                                {evt.actor.role && <RoleBadge role={evt.actor.role as any} />}
                              </div>
                              {evt.remarks && (
                                <p className="text-xs text-slate-700 bg-[#FAF7F2] p-2 rounded border border-[#EADBCE] mt-1">
                                  {evt.remarks}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="text-slate-500 text-xs">No timeline events recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] p-3 flex items-center justify-between sticky bottom-0 z-20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailsOpen(false)}
                  className="border-[#DCD5C8] bg-white cursor-pointer"
                >
                  Close
                </Button>

                {isLtp &&
                  selectedShortfall.status !== "RESOLVED" &&
                  selectedShortfall.status !== "CLOSED" &&
                  selectedShortfall.status !== "RESPONSE_ACCEPTED" &&
                  selectedShortfall.status !== "UNDER_REVIEW" &&
                  selectedShortfall.status !== "RESPONDED" &&
                  selectedShortfall.status !== "RESPONSE_SUBMITTED" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setDetailsOpen(false);
                        handleOpenRespond(selectedShortfall);
                      }}
                      className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Send className="size-3.5" />
                      <span>Respond to Shortfall</span>
                    </Button>
                  )}

                {!isLtp &&
                  (selectedShortfall.status === "RESPONDED" ||
                    selectedShortfall.status === "UNDER_REVIEW" ||
                    selectedShortfall.status === "RESPONSE_SUBMITTED") && (
                    <Button
                      size="sm"
                      onClick={() => {
                        resolveShortfall(
                          selectedShortfall.applicationId,
                          selectedShortfall.id,
                          "Verified by reviewing officer. Rectification compliant."
                        );
                        setDetailsOpen(false);
                        toast({
                          title: "Shortfall Resolved",
                          description: `Shortfall ${selectedShortfall.shortfallNumber || selectedShortfall.shortfallId} marked as verified and resolved.`,
                        });
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Verify &amp; Resolve Shortfall</span>
                    </Button>
                  )}

                {!isLtp && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetailsOpen(false);
                      openApplication(selectedShortfall.applicationId, "ltp-application-details");
                    }}
                    className="border-[#7A1316] text-[#7A1316] hover:bg-[#FAF7F2] font-bold gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Open Application Details</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── SUBMIT / DRAFT RESPONSE DIALOG ── */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF7F2] border-[#DCD5C8] p-0 font-sans">
          {selectedShortfall && (
            <div>
              <DialogHeader className="bg-[#F5EBE1] border-b border-[#DCD5C8] p-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#7A1316] bg-white px-2 py-0.5 rounded border border-[#DCD5C8]">
                    {selectedShortfall.shortfallNumber || "SF-01"}
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    {selectedShortfall.shortfallId}
                  </span>
                </div>
                <DialogTitle className="text-base font-bold text-slate-900 mt-1">
                  Respond to Shortfall
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  {selectedShortfall.title} · Application: <span className="font-mono font-bold text-[#7A1316]">{selectedShortfall.applicationNo}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Shortfall Summary Box */}
                <div className="rounded-lg border border-[#EADBCE] bg-white p-3 space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Officer Observation</span>
                  <p className="text-xs text-slate-800 leading-relaxed">{selectedShortfall.description}</p>
                  {selectedShortfall.requiredAction && (
                    <p className="text-xs text-amber-900 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Action:</strong> {selectedShortfall.requiredAction}
                    </p>
                  )}
                </div>

                {/* Response / Remarks Textarea */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Response / Remarks <span className="text-rose-600">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Provide clear explanation</span>
                  </Label>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Explain how the shortfall has been rectified or provide compliance clarifications..."
                    rows={4}
                    className="text-xs bg-white border-[#DCD5C8] focus:border-[#7A1316] focus:ring-[#7A1316]"
                  />
                </div>

                {/* Supporting Documents Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Supporting Documents</span>
                    <span className="text-[10px] text-slate-400 font-normal">Revised drawings, NOCs, Certificates, etc.</span>
                  </Label>

                  <FileUploader
                    variant="maroon"
                    label="Upload supporting documents"
                    hint="PDF, DWG, DXF, JPG, PNG (max 50 MB)"
                    accept=".pdf,.dwg,.dxf,.jpg,.png"
                    multiple={true}
                    uploadedFiles={uploadedFiles}
                    onUpload={(files) =>
                      setUploadedFiles((prev) => {
                        const map = new Map(prev.map((f) => [f.id, f]));
                        files.forEach((f) => map.set(f.id, f));
                        return Array.from(map.values());
                      })
                    }
                    onRemove={(id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id))}
                  />
                </div>

                {selectedShortfall.draftResponse && (
                  <p className="text-[11px] text-amber-800 font-medium">
                    Note: A previously saved draft was restored for this shortfall.
                  </p>
                )}
              </div>

              {/* Action Buttons: Save Draft & Submit Response */}
              <DialogFooter className="bg-[#F5EBE1] border-t border-[#DCD5C8] p-3 flex flex-row items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRespondOpen(false)}
                  className="border-[#DCD5C8] bg-white cursor-pointer"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    className="border-[#7A1316] text-[#7A1316] hover:bg-[#F3EADF] font-bold gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Save className="size-3.5" />
                    <span>Save Draft</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting || !responseText.trim()}
                    className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                    <span>{isSubmitting ? "Submitting..." : "Submit Response"}</span>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── RAISE SHORTFALL DIALOG (FOR OFFICERS / NON-LTP) ── */}
      <Dialog open={raiseOpen} onOpenChange={setRaiseOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF7F2] border-[#DCD5C8] p-0 font-sans">
          <DialogHeader className="bg-[#F5EBE1] border-b border-[#DCD5C8] p-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#7A1316] text-white">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-[#7A1316]">
                  Raise Shortfall on Application
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Select an active application to issue a statutory shortfall notice.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5 space-y-4 text-xs">
            {/* Target Application Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Select Application <span className="text-rose-600">*</span>
              </Label>
              <Select value={raiseAppId} onValueChange={setRaiseAppId}>
                <SelectTrigger className="h-8.5 text-xs bg-white border-[#DCD5C8]">
                  <SelectValue placeholder="Select application..." />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id} className="text-xs">
                      {app.applicationNo} — {app.project.name} ({app.applicant.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="size-3 text-[#7A1316]" /> Common APCRDA Deficiency Presets
              </Label>
              <Select
                value={raiseTmplIdx}
                onValueChange={(val) => {
                  setRaiseTmplIdx(val);
                  const idx = parseInt(val, 10);
                  if (idx > 0 && APCRDA_SHORTFALL_PRESETS[idx]) {
                    const t = APCRDA_SHORTFALL_PRESETS[idx];
                    setRaiseType(t.type);
                    setRaiseTitle(t.title);
                    setRaiseDesc(t.desc);
                  }
                }}
              >
                <SelectTrigger className="h-8.5 text-xs bg-white border-[#DCD5C8]">
                  <SelectValue placeholder="Choose a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {APCRDA_SHORTFALL_PRESETS.map((p, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">
                  Category <span className="text-rose-600">*</span>
                </Label>
                <Select value={raiseType} onValueChange={(v) => setRaiseType(v as ShortfallType)}>
                  <SelectTrigger className="h-8.5 text-xs bg-white border-[#DCD5C8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="FEE">Fee</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">
                  Response Due Date <span className="text-rose-600">*</span>
                </Label>
                <Input
                  type="date"
                  value={raiseDueDate}
                  onChange={(e) => setRaiseDueDate(e.target.value)}
                  className="h-8.5 text-xs bg-white border-[#DCD5C8]"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Title / Deficiency Subject <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={raiseTitle}
                onChange={(e) => setRaiseTitle(e.target.value)}
                placeholder="e.g. Structural stability certificate missing SE seal"
                className="h-8.5 text-xs bg-white border-[#DCD5C8]"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Detailed Observation &amp; Directive <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                value={raiseDesc}
                onChange={(e) => setRaiseDesc(e.target.value)}
                placeholder="Explain the non-compliance and required applicant rectification..."
                rows={3}
                className="text-xs bg-white border-[#DCD5C8]"
              />
            </div>
          </div>

          <DialogFooter className="bg-[#F5EBE1] border-t border-[#DCD5C8] p-3 flex items-center justify-between sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRaiseOpen(false)}
              className="border-[#DCD5C8] bg-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!raiseAppId || !raiseTitle.trim() || !raiseDesc.trim()}
              onClick={() => {
                raiseShortfall(raiseAppId, {
                  type: raiseType,
                  title: raiseTitle.trim(),
                  description: raiseDesc.trim(),
                  dueDate: new Date(raiseDueDate).toISOString(),
                });
                setRaiseOpen(false);
                setRaiseTitle("");
                setRaiseDesc("");
                setRaiseTmplIdx("0");
                toast({
                  title: "Shortfall Raised",
                  description: "Shortfall notice has been issued to the applicant.",
                });
              }}
              className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold gap-1.5 cursor-pointer shadow-xs"
            >
              <AlertTriangle className="size-3.5" />
              <span>Issue Shortfall Notice</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
