"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, type PendingRegistration } from "@/store/app-store";
import { useToast } from "@/hooks/use-toast";
import {
  UserCheck,
  UserX,
  Building2,
  HardHat,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  RotateCcw,
  Download,
  Printer,
  RefreshCw,
  Eye,
  ShieldCheck,
  Layers,
  X,
  FileCheck2,
  BadgeCheck,
  ChevronRight,
  ArrowRight,
  Send,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RegistrationSubTab =
  | "all"
  | "pending"
  | "ltp"
  | "developer"
  | "approved"
  | "rejected";

interface RegistrationApprovalsViewProps {
  initialTab?: string;
}

export function RegistrationApprovalsView({ initialTab }: RegistrationApprovalsViewProps) {
  const pendingRegistrations = useAppStore((s) => s.pendingRegistrations);
  const approveRegistration = useAppStore((s) => s.approveRegistration);
  const rejectRegistration = useAppStore((s) => s.rejectRegistration);
  const undoRegistrationAction = useAppStore((s) => s.undoRegistrationAction);
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();

  // Tab mapping
  const resolveInitialTab = (tab?: string): RegistrationSubTab => {
    if (!tab) return "all";
    if (tab === "registration-pending" || tab === "developer-verification") return "pending";
    if (tab === "registration-ltp" || tab === "all-ltp-approved" || tab === "all-ltp-in-process") return "ltp";
    if (tab === "registration-developer") return "developer";
    if (tab === "registration-approved" || tab === "approved-registration") return "approved";
    if (tab === "registration-rejected" || tab === "rejected-registration") return "rejected";
    return "all";
  };

  const [activeTab, setActiveTab] = React.useState<RegistrationSubTab>(() => resolveInitialTab(initialTab));
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [zoneFilter, setZoneFilter] = React.useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Modals state
  const [selectedRecord, setSelectedRecord] = React.useState<PendingRegistration | null>(null);
  const [approvingRecord, setApprovingRecord] = React.useState<PendingRegistration | null>(null);
  const [rejectingRecord, setRejectingRecord] = React.useState<PendingRegistration | null>(null);

  // Form states for approval / rejection
  const [approvalRemarks, setApprovalRemarks] = React.useState("");
  const [customRegNumber, setCustomRegNumber] = React.useState("");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [selectedQuickGround, setSelectedQuickGround] = React.useState("");

  // Sync initialTab when props change
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveInitialTab(initialTab));
    }
  }, [initialTab]);

  // Derived counts
  const totalCount = pendingRegistrations.length;
  const pendingCount = pendingRegistrations.filter((r) => r.status === "PENDING").length;
  const ltpCount = pendingRegistrations.filter((r) => r.type === "LTP").length;
  const devCount = pendingRegistrations.filter((r) => r.type === "DEVELOPER").length;
  const approvedCount = pendingRegistrations.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = pendingRegistrations.filter((r) => r.status === "REJECTED").length;

  // Filtered registrations
  const filteredRecords = React.useMemo(() => {
    return pendingRegistrations.filter((r) => {
      // Tab filter
      if (activeTab === "pending" && r.status !== "PENDING") return false;
      if (activeTab === "ltp" && r.type !== "LTP") return false;
      if (activeTab === "developer" && r.type !== "DEVELOPER") return false;
      if (activeTab === "approved" && r.status !== "APPROVED") return false;
      if (activeTab === "rejected" && r.status !== "REJECTED") return false;

      // Dropdown type filter
      if (typeFilter !== "ALL" && r.type !== typeFilter) return false;

      // Zone filter
      if (zoneFilter !== "ALL" && r.zone && !r.zone.toLowerCase().includes(zoneFilter.toLowerCase())) {
        return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.name?.toLowerCase().includes(q);
        const matchEmail = r.email?.toLowerCase().includes(q);
        const matchPhone = r.phone?.toLowerCase().includes(q);
        const matchCompany = r.companyName?.toLowerCase().includes(q);
        const matchLicense = r.licenseNo?.toLowerCase().includes(q);
        const matchRera = r.reraNumber?.toLowerCase().includes(q);
        const matchPan = r.pan?.toLowerCase().includes(q);
        const matchId = r.id?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q);

        if (!matchName && !matchEmail && !matchPhone && !matchCompany && !matchLicense && !matchRera && !matchPan && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [pendingRegistrations, activeTab, typeFilter, zoneFilter, searchQuery]);

  // Actions
  const handleOpenApprove = (record: PendingRegistration) => {
    setApprovingRecord(record);
    setApprovalRemarks("Documents and credentials verified. Authorized for APCRDA jurisdiction.");
    setCustomRegNumber(
      record.type === "LTP"
        ? `APCRDA/LTP/2026/${Math.floor(1000 + Math.random() * 9000)}`
        : `APCRDA/DEV/2026/${Math.floor(1000 + Math.random() * 9000)}`
    );
  };

  const handleConfirmApprove = () => {
    if (!approvingRecord) return;
    const officerName = `${user?.name || "Competent Authority"} (${user?.role || "Reviewer"})`;
    approveRegistration(approvingRecord.id, officerName, approvalRemarks, customRegNumber);
    toast({
      title: "Registration Approved",
      description: `${approvingRecord.name} (${approvingRecord.type}) has been approved with Reg ID ${customRegNumber}.`,
    });
    setApprovingRecord(null);
    if (selectedRecord?.id === approvingRecord.id) {
      setSelectedRecord(null);
    }
  };

  const handleOpenReject = (record: PendingRegistration) => {
    setRejectingRecord(record);
    setRejectionReason("");
    setSelectedQuickGround("");
  };

  const handleConfirmReject = () => {
    if (!rejectingRecord) return;
    const finalReason = selectedQuickGround
      ? `${selectedQuickGround}. ${rejectionReason}`.trim()
      : rejectionReason.trim() || "Deficient documentation / unverified credentials.";

    const officerName = `${user?.name || "Competent Authority"} (${user?.role || "Reviewer"})`;
    rejectRegistration(rejectingRecord.id, finalReason, officerName);
    toast({
      title: "Registration Rejected",
      description: `Registration for ${rejectingRecord.name} was rejected. Notice recorded.`,
      variant: "destructive",
    });
    setRejectingRecord(null);
    if (selectedRecord?.id === rejectingRecord.id) {
      setSelectedRecord(null);
    }
  };

  const handleUndo = (record: PendingRegistration) => {
    undoRegistrationAction(record.id);
    toast({
      title: "Status Reopened",
      description: `Registration for ${record.name} was reset to PENDING status.`,
    });
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Registrations Refreshed",
        description: `Loaded ${pendingRegistrations.length} registration applications.`,
      });
    }, 400);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Registration No",
      "Type",
      "Applicant Name",
      "Company Name",
      "Email",
      "Phone",
      "License / RERA",
      "PAN",
      "Zone",
      "Status",
      "Submitted At",
      "Approved By",
      "Rejection Reason",
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      r.registrationNumber || "—",
      r.type,
      r.name,
      r.companyName || "—",
      r.email,
      r.phone,
      r.licenseNo || r.reraNumber || "—",
      r.pan || "—",
      r.zone || "—",
      r.status,
      r.submittedAt,
      r.approvedBy || "—",
      r.rejectionReason || "—",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `APCRDA_Registrations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredRecords.length} registration records to CSV.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
      {/* ── Submodule Tabs (Spread across the screen) ── */}
      <div className="bg-white border-b border-[#EADBCE] rounded-xl px-3 sm:px-4 py-2.5 shadow-xs shrink-0 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
          <button
            onClick={() => setActiveTab("all")}
            title="All Registrations"
            className={cn(
              "w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all cursor-pointer text-center min-w-0",
              activeTab === "all"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-800 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <Layers className="size-4 shrink-0" />
            <span className="truncate font-bold">All</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-black shrink-0",
                activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              )}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            title="Pending Verification"
            className={cn(
              "w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all cursor-pointer text-center min-w-0",
              activeTab === "pending"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-800 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <Clock className="size-4 shrink-0" />
            <span className="truncate font-bold">Pending</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-black shrink-0",
                activeTab === "pending" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              )}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ltp")}
            title="LTP Registrations"
            className={cn(
              "w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all cursor-pointer text-center min-w-0",
              activeTab === "ltp"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-800 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <HardHat className="size-4 shrink-0" />
            <span className="truncate font-bold">LTP</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-black shrink-0",
                activeTab === "ltp" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
              )}
            >
              {ltpCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("developer")}
            title="Developer Registrations"
            className={cn(
              "w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all cursor-pointer text-center min-w-0",
              activeTab === "developer"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-800 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <Building2 className="size-4 shrink-0" />
            <span className="truncate font-bold">Developers</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-black shrink-0",
                activeTab === "developer" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
              )}
            >
              {devCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            title="Approved Empanelments"
            className={cn(
              "w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all cursor-pointer text-center min-w-0",
              activeTab === "approved"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-800 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="truncate font-bold">Approved</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-black shrink-0",
                activeTab === "approved" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            title="Rejected Submissions"
            className={cn(
              "w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all cursor-pointer text-center min-w-0",
              activeTab === "rejected"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-800 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <XCircle className="size-4 shrink-0" />
            <span className="truncate font-bold">Rejected</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-black shrink-0",
                activeTab === "rejected" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
              )}
            >
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── KPI Highlight Cards (4 Cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Decisions</p>
            <p className="text-xl font-black text-amber-900">{pendingCount}</p>
            <p className="text-[10px] text-slate-400">Awaiting official approval/rejection</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <BadgeCheck className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sanctioned Empanelments</p>
            <p className="text-xl font-black text-emerald-800">{approvedCount}</p>
            <p className="text-[10px] text-emerald-700">Active Licensed Professionals & Developers</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
            <HardHat className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LTP Applicants</p>
            <p className="text-xl font-black text-purple-900">{ltpCount}</p>
            <p className="text-[10px] text-slate-400">Architects, Engineers & Planners</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#EADBCE] bg-white p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Developer Applicants</p>
            <p className="text-xl font-black text-blue-900">{devCount}</p>
            <p className="text-[10px] text-slate-400">Corporate & Partnership Entities</p>
          </div>
        </div>
      </div>

      {/* ── Filters, Search & Action Buttons (Single Row) ── */}
      <div className="flex items-center justify-between gap-2.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
        {/* Left: Quick scheme pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#EADBCE] px-3 py-1 text-xs text-[#5C1A20] shadow-2xs">
            <HardHat className="size-3.5 text-purple-700 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">LTP:</span>
            <span className="font-bold text-xs text-[#801824]">{ltpCount}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#EADBCE] px-3 py-1 text-xs text-[#5C1A20] shadow-2xs">
            <Building2 className="size-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Developers:</span>
            <span className="font-bold text-xs text-[#801824]">{devCount}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#EADBCE] px-3 py-1 text-xs text-[#5C1A20] shadow-2xs">
            <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Authorized Roles:</span>
            <span className="font-bold text-[11px] text-emerald-800">ZJD · ZDD · Comm. · Admin</span>
          </div>
        </div>

        {/* Right: Search, Filters & Action Buttons in a Single Row */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Box */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 h-8 w-44 sm:w-56 shadow-2xs hover:shadow-xs focus-within:border-[#801824] focus-within:ring-2 focus-within:ring-[#801824]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant / ID..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 rounded-full border-[#DCD5C8] bg-white text-xs font-medium px-3.5 shadow-2xs hover:shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Type:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="LTP">Licensed Technical Person (LTP)</SelectItem>
              <SelectItem value="DEVELOPER">Developer Firm</SelectItem>
            </SelectContent>
          </Select>

          {/* Zone Filter */}
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="h-8 rounded-full border-[#DCD5C8] bg-white text-xs font-medium px-3.5 shadow-2xs hover:shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Zone:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Zones</SelectItem>
              <SelectItem value="Amaravati">Amaravati Capital City</SelectItem>
              <SelectItem value="Mangalagiri">Mangalagiri</SelectItem>
              <SelectItem value="Vijayawada">Vijayawada</SelectItem>
              <SelectItem value="Guntur">Guntur</SelectItem>
              <SelectItem value="Tenali">Tenali</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(searchQuery || typeFilter !== "ALL" || zoneFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("ALL");
                setZoneFilter("ALL");
              }}
              className="rounded-full px-3 py-1 bg-rose-50 text-[#801824] border border-[#801824]/20 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1 shrink-0"
              title="Reset all filters"
            >
              <X className="size-3" />
              <span>Clear</span>
            </button>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-[#DCD5C8] mx-0.5 shrink-0" />

          {/* Export CSV, Print, Refresh */}
          <button
            onClick={handleExportCSV}
            title="Download CSV Spreadsheet"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-full border border-[#DCD5C8] bg-white text-xs font-bold text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print Report"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-full border border-[#DCD5C8] bg-white text-xs font-bold text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
          >
            <Printer className="size-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleRefresh}
            title="Refresh Registrations"
            className="flex size-8 items-center justify-center rounded-full border border-[#DCD5C8] bg-white text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-[#801824]")} />
          </button>
        </div>
      </div>

      {/* ── Table Content ── */}
      <div className="rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
              <tr className="divide-x divide-[#DCD5C8]">
                <th className="w-10 px-2 py-2.5 font-bold text-center">#</th>
                <th className="w-36 px-3 py-2.5 font-bold whitespace-nowrap">Registration ID</th>
                <th className="w-56 max-w-[220px] px-3 py-2.5 font-bold">Applicant / Entity</th>
                <th className="w-28 px-2 py-2.5 font-bold text-center whitespace-nowrap">Type</th>
                <th className="w-40 px-3 py-2.5 font-bold whitespace-nowrap">License / RERA & PAN</th>
                <th className="w-44 px-3 py-2.5 font-bold whitespace-nowrap">Contact Details</th>
                <th className="w-28 px-2.5 py-2.5 font-bold text-center whitespace-nowrap">Zone</th>
                <th className="w-24 px-2 py-2.5 font-bold text-center whitespace-nowrap">Submitted</th>
                <th className="w-28 px-2 py-2.5 font-bold text-center whitespace-nowrap">Status</th>
                <th className="w-40 px-3 py-2.5 font-bold text-center">Authority Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <UserCheck className="size-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-semibold text-slate-600">No registration records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your active tab or search filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, idx) => {
                  const isPending = record.status === "PENDING";
                  const isApproved = record.status === "APPROVED";
                  const isRejected = record.status === "REJECTED";

                  return (
                    <tr key={record.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                      <td className="px-2 py-2 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#7A1316]">
                          {record.registrationNumber || record.id}
                        </span>
                        {record.registrationNumber && (
                          <p className="text-[10px] text-slate-400 font-mono">App #{record.id}</p>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <div className="font-bold text-slate-900 leading-tight">{record.name}</div>
                        {record.companyName && record.companyName !== record.name && (
                          <div className="text-[11px] text-slate-600 font-medium truncate">{record.companyName}</div>
                        )}
                        {record.designation && (
                          <div className="text-[10px] text-slate-500">{record.designation}</div>
                        )}
                      </td>

                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1",
                            record.type === "LTP"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          )}
                        >
                          {record.type === "LTP" ? <HardHat className="size-3" /> : <Building2 className="size-3" />}
                          {record.type}
                        </span>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                        <div className="text-slate-800 font-semibold">{record.licenseNo || record.reraNumber || "Pending"}</div>
                        {record.pan && <div className="text-slate-500 text-[10px]">PAN: {record.pan}</div>}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-slate-800 font-medium truncate max-w-[180px]">{record.email}</div>
                        <div className="text-slate-500 text-[11px] font-mono">{record.phone}</div>
                      </td>

                      <td className="px-2.5 py-2 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <MapPin className="size-3 text-slate-500" />
                          {record.zone || "Amaravati"}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {new Date(record.submittedAt).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {isApproved && (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              Approved
                            </span>
                            {record.approvedBy && (
                              <span className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[110px]" title={record.approvedBy}>
                                by {record.approvedBy.split("(")[0]}
                              </span>
                            )}
                          </div>
                        )}
                        {isRejected && (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                              <XCircle className="size-3 text-rose-600" />
                              Rejected
                            </span>
                            {record.rejectionReason && (
                              <span className="text-[9px] text-rose-700 mt-0.5 truncate max-w-[110px]" title={record.rejectionReason}>
                                {record.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            title="View Full Registration Dossier"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-[#801824] hover:bg-[#F3EADF] border border-[#DCD5C8] cursor-pointer"
                          >
                            <Eye className="size-3" />
                            <span>Details</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenApprove(record)}
                                title="Approve Registration"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="size-3" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => handleOpenReject(record)}
                                title="Reject Registration"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 cursor-pointer shadow-2xs"
                              >
                                <XCircle className="size-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {!isPending && (
                            <button
                              onClick={() => handleUndo(record)}
                              title="Reopen for Review"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 cursor-pointer"
                            >
                              <RotateCcw className="size-3" />
                              <span>Reopen</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of {totalCount} registration applications
          </span>
          <span className="font-mono text-[11px]">
            Authorized Signatory Panel · APCRDA Building Rules 2026
          </span>
        </div>
      </div>

      {/* ── Dossier Details Modal ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#7A1316] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#7A1316] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  {selectedRecord.type === "LTP" ? <HardHat className="size-6" /> : <Building2 className="size-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">{selectedRecord.name}</h3>
                  <p className="text-xs text-white/80 font-mono">
                    {selectedRecord.type === "LTP" ? "Licensed Technical Person (LTP)" : "Registered Developer Firm"} · App #{selectedRecord.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* Status Banner */}
              <div
                className={cn(
                  "p-3 rounded-lg border flex items-center justify-between",
                  selectedRecord.status === "PENDING"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : selectedRecord.status === "APPROVED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedRecord.status === "PENDING" && <Clock className="size-4 text-amber-600" />}
                  {selectedRecord.status === "APPROVED" && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {selectedRecord.status === "REJECTED" && <XCircle className="size-4 text-rose-600" />}
                  <span className="font-bold text-sm">
                    Status: {selectedRecord.status}
                  </span>
                  {selectedRecord.registrationNumber && (
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border ml-2">
                      Reg ID: {selectedRecord.registrationNumber}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono">
                  Submitted: {new Date(selectedRecord.submittedAt).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact & Identity */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EADBCE] space-y-2.5">
                  <h4 className="font-bold text-xs text-[#7A1316] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#EADBCE] pb-1.5">
                    <Mail className="size-3.5" /> Contact & Location
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="col-span-2 font-mono font-semibold">{selectedRecord.email}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-medium">Phone:</span>
                    <span className="col-span-2 font-mono font-semibold">{selectedRecord.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-medium">Zone:</span>
                    <span className="col-span-2 font-semibold">{selectedRecord.zone || "Amaravati"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-medium">Address:</span>
                    <span className="col-span-2 font-medium">{selectedRecord.address || "Andhra Pradesh"}</span>
                  </div>
                </div>

                {/* Professional / Firm Credentials */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EADBCE] space-y-2.5">
                  <h4 className="font-bold text-xs text-[#7A1316] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#EADBCE] pb-1.5">
                    <Briefcase className="size-3.5" /> Technical / Corporate Standing
                  </h4>
                  {selectedRecord.type === "LTP" ? (
                    <>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">License No:</span>
                        <span className="col-span-2 font-mono font-bold text-[#801824]">
                          {selectedRecord.licenseNo || "—"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">Council:</span>
                        <span className="col-span-2 font-semibold">{selectedRecord.council || "Council of Architecture / IEI"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">Qualification:</span>
                        <span className="col-span-2">{selectedRecord.qualification || "B.Arch / B.Tech"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">Experience:</span>
                        <span className="col-span-2 font-semibold">{selectedRecord.experienceYears || 5} Years</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">Company:</span>
                        <span className="col-span-2 font-bold">{selectedRecord.companyName || selectedRecord.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">RERA No:</span>
                        <span className="col-span-2 font-mono font-bold text-[#801824]">
                          {selectedRecord.reraNumber || "AP-RERA Pending"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">PAN:</span>
                        <span className="col-span-2 font-mono font-semibold">{selectedRecord.pan || "—"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-medium">Auth Person:</span>
                        <span className="col-span-2">{selectedRecord.authorizedPerson || selectedRecord.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Document Checklist */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="size-4 text-emerald-700" /> Mandatory Registration Proofs Verified
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-[#EADBCE] rounded-lg flex items-center justify-between">
                    <span className="font-medium text-slate-700">Identity & Address Proof (Aadhaar / Passport)</span>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Authenticated
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EADBCE] rounded-lg flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      {selectedRecord.type === "LTP" ? "Council Certificate / Degree Certificate" : "AP-RERA Certificate & GSTIN"}
                    </span>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Authenticated
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EADBCE] rounded-lg flex items-center justify-between">
                    <span className="font-medium text-slate-700">PAN Card Copy & Verification</span>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Authenticated
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EADBCE] rounded-lg flex items-center justify-between">
                    <span className="font-medium text-slate-700">Code of Conduct & Affidavit</span>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Signed
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Remarks History */}
              {selectedRecord.status !== "PENDING" && (
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <p className="font-bold text-slate-700">Official Decision Details:</p>
                  {selectedRecord.approvedBy && (
                    <p className="text-slate-600">
                      Approved By: <strong>{selectedRecord.approvedBy}</strong> on{" "}
                      {selectedRecord.approvedAt ? new Date(selectedRecord.approvedAt).toLocaleDateString("en-IN") : "—"}
                    </p>
                  )}
                  {selectedRecord.rejectedBy && (
                    <p className="text-slate-600">
                      Rejected By: <strong>{selectedRecord.rejectedBy}</strong> on{" "}
                      {selectedRecord.rejectedAt ? new Date(selectedRecord.rejectedAt).toLocaleDateString("en-IN") : "—"}
                    </p>
                  )}
                  {selectedRecord.rejectionReason && (
                    <p className="text-rose-700 font-medium">Grounds: {selectedRecord.rejectionReason}</p>
                  )}
                  {selectedRecord.officerRemarks && (
                    <p className="text-slate-600">Remarks: {selectedRecord.officerRemarks}</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-[#FAF7F2] border-t border-[#EADBCE] px-6 py-3.5 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-semibold"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedRecord.status === "PENDING" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleOpenReject(selectedRecord);
                      }}
                      className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                    >
                      <XCircle className="size-3.5 mr-1" />
                      Reject Application
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        handleOpenApprove(selectedRecord);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" />
                      Approve & Grant Empanelment
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUndo(selectedRecord)}
                    className="text-xs font-semibold"
                  >
                    <RotateCcw className="size-3.5 mr-1" />
                    Reopen for Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Approval Modal ── */}
      {approvingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-emerald-700 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Approve Empanelment Registration</h3>
                <p className="text-xs text-slate-500">
                  Authority sanction for {approvingRecord.name} ({approvingRecord.type})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Generated License / Registration Number</label>
                <input
                  type="text"
                  value={customRegNumber}
                  onChange={(e) => setCustomRegNumber(e.target.value)}
                  className="w-full h-8 px-3 rounded border border-emerald-300 font-mono font-bold text-slate-900 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Approving Officer Designation</label>
                <div className="p-2 rounded bg-white border border-slate-200 text-slate-800 font-semibold font-mono text-[11px]">
                  {user?.name || "Competent Authority"} · {user?.role || "Reviewer"}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Sanction Remarks & Validity Terms</label>
                <textarea
                  rows={3}
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="Enter officer verification remarks..."
                  className="w-full p-2.5 rounded border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApprovingRecord(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApprove}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                <BadgeCheck className="size-3.5 mr-1" />
                Confirm & Issue Sanction
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Modal ── */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-rose-700 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                <XCircle className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Reject Registration Application</h3>
                <p className="text-xs text-slate-500">
                  {rejectingRecord.name} ({rejectingRecord.type})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Select Grounds for Rejection</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Council / RERA registration mismatch",
                    "PAN / GSTIN verification failed",
                    "Incomplete technical credentials",
                    "Missing firm authorization resolution",
                    "Invalid qualification certificate",
                  ].map((ground) => (
                    <button
                      key={ground}
                      type="button"
                      onClick={() => {
                        setSelectedQuickGround(ground);
                        if (!rejectionReason) setRejectionReason(ground);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-all",
                        selectedQuickGround === ground
                          ? "bg-rose-100 text-rose-900 border-rose-400 font-bold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {ground}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Detailed Official Rejection Notice <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State the formal reasons for rejection..."
                  className="w-full p-2.5 rounded border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingRecord(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
              >
                <XCircle className="size-3.5 mr-1" />
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
