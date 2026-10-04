"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { formatDate, formatDateTime } from "@/components/design-system/workflow";
import { FileUploader, type UploadedFile } from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Filter,
  Plus,
  Eye,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Printer,
  Download,
  FileText,
  RotateCcw,
  Check,
  X,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  MapPin,
  User,
  Phone,
  Mail,
  Camera,
  QrCode,
  FileCheck2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getOccupancyRecords,
  getOccupancyRecordById,
  updateOccupancyRecord,
  type OccupancyApplicationRecord,
  type HistoryEvent,
  type InspectionRecord,
  PHOTO_SVGS,
} from "@/data/occupancy-data";
import { compareAsBuilt, type AsBuiltFigures, type ComparisonRow } from "@/lib/occupancy";
import { OccupancyCertificateModal } from "./occupancy-certificate-modal";

// ── STATUS DEFINITION & BADGES ──────────────────────────────────────────────
export const OCCUPANCY_STATUS_CONFIG: Record<
  string,
  { label: string; badgeCls: string; dotCls: string }
> = {
  ELIGIBLE_FOR_OCCUPANCY:     { label: "Eligible for Occupancy",     badgeCls: "bg-slate-100 text-slate-700 border-slate-300",  dotCls: "bg-slate-400" },
  OCCUPANCY_APPLIED:          { label: "Occupancy Applied",          badgeCls: "bg-blue-100 text-blue-800 border-blue-300",      dotCls: "bg-blue-600" },
  SUBMITTED:                  { label: "Occupancy Applied",          badgeCls: "bg-blue-100 text-blue-800 border-blue-300",      dotCls: "bg-blue-600" },
  UNDER_VERIFICATION:         { label: "Under Verification",         badgeCls: "bg-indigo-100 text-indigo-800 border-indigo-300",dotCls: "bg-indigo-600" },
  INSPECTION_PENDING:         { label: "Inspection Pending",         badgeCls: "bg-amber-100 text-amber-800 border-amber-300",   dotCls: "bg-amber-600" },
  INSPECTION_COMPLETED:       { label: "Inspection Completed",       badgeCls: "bg-cyan-100 text-cyan-800 border-cyan-300",      dotCls: "bg-cyan-600" },
  SHORTFALL_RAISED:           { label: "Shortfall Raised",           badgeCls: "bg-rose-100 text-rose-800 border-rose-300",      dotCls: "bg-rose-600" },
  SHORTFALL:                  { label: "Shortfall Raised",           badgeCls: "bg-rose-100 text-rose-800 border-rose-300",      dotCls: "bg-rose-600" },
  APPLICANT_RESPONSE_PENDING: { label: "Applicant Response Pending", badgeCls: "bg-orange-100 text-orange-800 border-orange-300",dotCls: "bg-orange-600" },
  RESPONSE_SUBMITTED:         { label: "Response Submitted",         badgeCls: "bg-sky-100 text-sky-800 border-sky-300",        dotCls: "bg-sky-600" },
  RE_INSPECTION_REQUIRED:     { label: "Re-inspection Required",     badgeCls: "bg-purple-100 text-purple-800 border-purple-300",dotCls: "bg-purple-600" },
  RECOMMENDED:                { label: "Recommended for Approval",  badgeCls: "bg-teal-100 text-teal-800 border-teal-300",      dotCls: "bg-teal-600" },
  APPROVED:                   { label: "Approved",                   badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300", dotCls: "bg-emerald-600" },
  CERTIFICATE_ISSUED:         { label: "Occupancy Certificate Issued", badgeCls: "bg-emerald-700 text-white border-emerald-800 font-semibold", dotCls: "bg-white" },
  REJECTED:                   { label: "Rejected",                   badgeCls: "bg-red-100 text-red-800 border-red-300",        dotCls: "bg-red-600" },
};

function OccupancyStatusBadge({ status }: { status: string }) {
  const cfg = OCCUPANCY_STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, " "),
    badgeCls: "bg-slate-100 text-slate-700 border-slate-300",
    dotCls: "bg-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap",
        cfg.badgeCls
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", cfg.dotCls)} />
      {cfg.label}
    </span>
  );
}

// ── MAIN OCCUPANCY MODULE VIEW ──────────────────────────────────────────────
export function OccupancyModuleView({ initialTab }: { initialTab?: string }) {
  const { openApplication, user } = useAppStore();
  const { applications } = useDashboardScope();
  const { toast } = useToast();

  // Records state from data cache
  const [records, setRecords] = React.useState<OccupancyApplicationRecord[]>(() => getOccupancyRecords());

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(() => {
    if (initialTab === "occupancy-certificates") return "CERTIFICATE_ISSUED";
    return "ALL";
  });
  const [usageFilter, setUsageFilter] = React.useState("ALL");
  const [zoneFilter, setZoneFilter] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<"submittedAt" | "occupancyNumber" | "project">("submittedAt");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Selected Record & Modals
  const [selectedRecord, setSelectedRecord] = React.useState<OccupancyApplicationRecord | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [activeDetailTab, setActiveDetailTab] = React.useState<
    "overview" | "inspection" | "shortfall" | "certificate" | "history"
  >("overview");
  const [applyModalOpen, setApplyModalOpen] = React.useState(() => initialTab === "occupancy-apply");
  const [certModalOpen, setCertModalOpen] = React.useState(false);

  // Synchronize when initialTab changes
  React.useEffect(() => {
    if (initialTab === "occupancy-apply") {
      setApplyModalOpen(true);
    } else if (initialTab === "occupancy-certificates") {
      setStatusFilter("CERTIFICATE_ISSUED");
    }
  }, [initialTab]);

  // Derived KPI Counts
  const kpis = React.useMemo(() => {
    let pendingVerification = 0;
    let inspectionPending = 0;
    let shortfallPending = 0;
    let approved = 0;
    let certIssued = 0;

    for (const r of records) {
      const s = r.state || r.status;
      if (["SUBMITTED", "UNDER_VERIFICATION", "OCCUPANCY_APPLIED"].includes(s)) pendingVerification++;
      else if (["INSPECTION_PENDING", "RE_INSPECTION_REQUIRED"].includes(s)) inspectionPending++;
      else if (["SHORTFALL", "SHORTFALL_RAISED", "APPLICANT_RESPONSE_PENDING", "RESPONSE_SUBMITTED"].includes(s)) shortfallPending++;
      else if (["APPROVED", "RECOMMENDED"].includes(s)) approved++;
      else if (s === "CERTIFICATE_ISSUED") certIssued++;
    }

    return {
      total: records.length,
      pendingVerification,
      inspectionPending,
      shortfallPending,
      approved,
      certIssued,
    };
  }, [records]);

  // Filtered & Sorted Applications
  const filteredRecords = React.useMemo(() => {
    return records
      .filter((r) => {
        // Status filter
        if (statusFilter !== "ALL") {
          const s = r.state || r.status;
          if (statusFilter === "PENDING_VERIFICATION") {
            if (!["SUBMITTED", "UNDER_VERIFICATION", "OCCUPANCY_APPLIED"].includes(s)) return false;
          } else if (statusFilter === "INSPECTION_PENDING") {
            if (!["INSPECTION_PENDING", "RE_INSPECTION_REQUIRED"].includes(s)) return false;
          } else if (statusFilter === "SHORTFALL_PENDING") {
            if (!["SHORTFALL", "SHORTFALL_RAISED", "APPLICANT_RESPONSE_PENDING", "RESPONSE_SUBMITTED"].includes(s)) return false;
          } else if (statusFilter === "APPROVED") {
            if (!["APPROVED", "RECOMMENDED"].includes(s)) return false;
          } else if (statusFilter === "CERTIFICATE_ISSUED") {
            if (s !== "CERTIFICATE_ISSUED") return false;
          } else if (s !== statusFilter) {
            return false;
          }
        }

        // Usage filter
        if (usageFilter !== "ALL" && r.project.type.toUpperCase() !== usageFilter.toUpperCase()) {
          return false;
        }

        // Zone filter
        if (zoneFilter !== "ALL" && !r.project.zone.toLowerCase().includes(zoneFilter.toLowerCase())) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNo = r.occupancyNumber.toLowerCase().includes(q);
          const matchPermit = (r.orderNumber || "").toLowerCase().includes(q) || r.applicationNumber.toLowerCase().includes(q);
          const matchApplicant = r.owner.name.toLowerCase().includes(q);
          const matchProject = r.project.name.toLowerCase().includes(q) || r.project.address.toLowerCase().includes(q);
          if (!matchNo && !matchPermit && !matchApplicant && !matchProject) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a.submittedAt || "";
        let valB = b.submittedAt || "";
        if (sortField === "occupancyNumber") {
          valA = a.occupancyNumber;
          valB = b.occupancyNumber;
        } else if (sortField === "project") {
          valA = a.project.name;
          valB = b.project.name;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [records, statusFilter, usageFilter, zoneFilter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Quick Action Handler
  const handleOpenDetails = (rec: OccupancyApplicationRecord, tab: "overview" | "inspection" | "shortfall" | "certificate" | "history" = "overview") => {
    setSelectedRecord(rec);
    setActiveDetailTab(tab);
    setDetailsModalOpen(true);
  };

  const handleOpenCertificate = (rec: OccupancyApplicationRecord) => {
    setSelectedRecord(rec);
    setCertModalOpen(true);
  };

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
      {/* ── 1. OCCUPANCY DASHBOARD: 6 KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 shrink-0">
        {[
          {
            key: "ALL",
            count: kpis.total,
            label: "Total Occupancy",
            sub: "All Applications",
            activeBorder: "border-[#7A1316] ring-2 ring-[#7A1316]/20",
            labelColor: "text-slate-600",
            numColor: "text-slate-900",
            iconColor: "text-[#7A1316]",
            Icon: Building2,
          },
          {
            key: "PENDING_VERIFICATION",
            count: kpis.pendingVerification,
            label: "Pending Verification",
            sub: "Desk Scrutiny",
            activeBorder: "border-indigo-600 ring-2 ring-indigo-500/20",
            labelColor: "text-indigo-800",
            numColor: "text-indigo-700",
            iconColor: "text-indigo-600",
            Icon: Clock,
          },
          {
            key: "INSPECTION_PENDING",
            count: kpis.inspectionPending,
            label: "Inspection Pending",
            sub: "Field Visit Awaited",
            activeBorder: "border-amber-600 ring-2 ring-amber-500/20",
            labelColor: "text-amber-800",
            numColor: "text-amber-700",
            iconColor: "text-amber-600",
            Icon: ClipboardCheck,
          },
          {
            key: "SHORTFALL_PENDING",
            count: kpis.shortfallPending,
            label: "Shortfall / Compliance",
            sub: "Awaiting Action",
            activeBorder: "border-rose-600 ring-2 ring-rose-500/20",
            labelColor: "text-rose-800",
            numColor: "text-rose-700",
            iconColor: "text-rose-600",
            Icon: AlertTriangle,
          },
          {
            key: "APPROVED",
            count: kpis.approved,
            label: "Approved",
            sub: "Ready for Certificate",
            activeBorder: "border-teal-600 ring-2 ring-teal-500/20",
            labelColor: "text-teal-800",
            numColor: "text-teal-700",
            iconColor: "text-teal-600",
            Icon: CheckCircle2,
          },
          {
            key: "CERTIFICATE_ISSUED",
            count: kpis.certIssued,
            label: "Certificates Issued",
            sub: "Final OC Dispatched",
            activeBorder: "border-emerald-600 ring-2 ring-emerald-500/20",
            labelColor: "text-emerald-800",
            numColor: "text-emerald-700",
            iconColor: "text-emerald-600",
            Icon: Award,
          },
        ].map(({ key, count, label, sub, activeBorder, labelColor, numColor, iconColor, Icon }) => {
          const active = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
                active ? `${activeBorder} shadow-xs` : "border-[#EADBCE] hover:border-slate-400 hover:bg-[#FDFBF7]"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", labelColor)}>{label}</span>
                <Icon className={cn("size-3.5", iconColor)} />
              </div>
              <div className="mt-1.5">
                <p className={cn("text-2xl font-black tabular-nums", numColor)}>{count}</p>
                <p className="text-[10px] mt-0.5 text-slate-500">{sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 9. SEARCH & FILTER TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white border border-[#DCD5C8] p-2.5 rounded-xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <Input
              placeholder="Search by OC No, BPO No, Applicant, Property..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-8 text-xs border-[#EADBCE] bg-white rounded-lg focus-visible:ring-[#7A1316]"
            />
          </div>

          {/* Status Select */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white w-44 cursor-pointer">
              <Filter className="size-3 mr-1 text-[#7A1316]" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses ({kpis.total})</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Pending Verification ({kpis.pendingVerification})</SelectItem>
              <SelectItem value="INSPECTION_PENDING">Inspection Pending ({kpis.inspectionPending})</SelectItem>
              <SelectItem value="SHORTFALL_PENDING">Shortfall / Compliance ({kpis.shortfallPending})</SelectItem>
              <SelectItem value="APPROVED">Approved ({kpis.approved})</SelectItem>
              <SelectItem value="CERTIFICATE_ISSUED">Certificate Issued ({kpis.certIssued})</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Usage Type Select */}
          <Select
            value={usageFilter}
            onValueChange={(val) => {
              setUsageFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white w-36 cursor-pointer">
              <Building2 className="size-3 mr-1 text-[#7A1316]" />
              <SelectValue placeholder="All Usages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Usages</SelectItem>
              <SelectItem value="RESIDENTIAL">Residential</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              <SelectItem value="GROUP HOUSING">Group Housing</SelectItem>
              <SelectItem value="INSTITUTIONAL">Institutional</SelectItem>
            </SelectContent>
          </Select>

          {/* Zone Select */}
          <Select
            value={zoneFilter}
            onValueChange={(val) => {
              setZoneFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white w-32 cursor-pointer">
              <MapPin className="size-3 mr-1 text-[#7A1316]" />
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Zones</SelectItem>
              <SelectItem value="Zone 1">Zone 1 (Central)</SelectItem>
              <SelectItem value="Zone 2">Zone 2 (East)</SelectItem>
              <SelectItem value="Zone 3">Zone 3 (West)</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== "ALL" || usageFilter !== "ALL" || zoneFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setUsageFilter("ALL");
                setZoneFilter("ALL");
                setCurrentPage(1);
              }}
              className="h-8 text-xs text-[#7A1316] hover:bg-[#7A1316]/10 px-2.5 gap-1"
            >
              <RotateCcw className="size-3" /> Reset
            </Button>
          )}
        </div>

        {/* Apply Occupancy Button */}
        <Button
          onClick={() => setApplyModalOpen(true)}
          className="h-8 text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white gap-1.5 shadow-2xs font-semibold cursor-pointer shrink-0"
        >
          <Plus className="size-3.5" /> Apply for Occupancy
        </Button>
      </div>

      {/* ── 1. OCCUPANCY APPLICATIONS TABLE ── */}
      <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-[380px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] text-[11px] font-bold">
              <tr className="divide-x divide-[#DCD5C8]">
                <th className="px-3 py-2 w-36 whitespace-nowrap cursor-pointer select-none" onClick={() => { setSortField("occupancyNumber"); setSortAsc(!sortAsc); }}>
                  Occupancy App No. {sortField === "occupancyNumber" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="px-3 py-2 w-36 whitespace-nowrap">Building Permission No.</th>
                <th className="px-3 py-2 w-48 whitespace-nowrap">Applicant / Owner</th>
                <th className="px-3 py-2">Building / Property Name</th>
                <th className="px-3 py-2 w-28 text-center whitespace-nowrap">Usage Type</th>
                <th className="px-3 py-2 w-28 text-center whitespace-nowrap cursor-pointer select-none" onClick={() => { setSortField("submittedAt"); setSortAsc(!sortAsc); }}>
                  Request Date {sortField === "submittedAt" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="px-3 py-2 w-40 text-center whitespace-nowrap">Status</th>
                <th className="px-3 py-2 w-36 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] bg-white">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Building2 className="size-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No Occupancy Applications Found</p>
                      <p className="text-[11px] text-slate-400">No records matched your search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const s = r.state || r.status;
                  const isCertIssued = s === "CERTIFICATE_ISSUED";
                  const isShortfall = ["SHORTFALL", "SHORTFALL_RAISED", "APPLICANT_RESPONSE_PENDING", "RESPONSE_SUBMITTED"].includes(s);
                  const isInspection = ["INSPECTION_PENDING", "RE_INSPECTION_REQUIRED", "INSPECTION_COMPLETED"].includes(s);

                  return (
                    <tr key={r.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                      {/* Occupancy Application No */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(r, "overview")}
                          className="font-mono font-bold text-[#7A1316] hover:text-[#8F161A] hover:underline cursor-pointer text-left"
                          title="Click to view occupancy lifecycle details"
                        >
                          {r.occupancyNumber}
                        </button>
                      </td>

                      {/* Building Permission No */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-slate-700 font-medium">
                          {r.orderNumber || r.applicationNumber}
                        </span>
                      </td>

                      {/* Applicant / Owner */}
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-800 leading-tight">{r.owner.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.owner.contact}</div>
                      </td>

                      {/* Building / Property Name */}
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-800 line-clamp-1">{r.project.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{r.project.address}</div>
                      </td>

                      {/* Usage Type */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {r.project.type}
                        </span>
                      </td>

                      {/* Request Date */}
                      <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {formatDate(r.submittedAt)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <OccupancyStatusBadge status={s} />
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetails(r, "overview")}
                            className="h-6 px-2 text-[11px] border-[#DCD5C8] hover:bg-[#FAF7F2] text-slate-700 cursor-pointer gap-1"
                          >
                            <Eye className="size-3" /> View
                          </Button>

                          {isCertIssued ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCertificate(r)}
                              className="h-6 px-2 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer gap-1 shadow-2xs"
                            >
                              <Award className="size-3" /> Certificate
                            </Button>
                          ) : isShortfall ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenDetails(r, "shortfall")}
                              className="h-6 px-2 text-[11px] bg-rose-700 hover:bg-rose-800 text-white cursor-pointer gap-1 shadow-2xs"
                            >
                              <AlertTriangle className="size-3" /> Shortfall
                            </Button>
                          ) : isInspection ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenDetails(r, "inspection")}
                              className="h-6 px-2 text-[11px] bg-[#7A1316] hover:bg-[#8F161A] text-white cursor-pointer gap-1 shadow-2xs"
                            >
                              <ClipboardCheck className="size-3" /> Inspect
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="shrink-0 bg-[#F5EBE1] border-t border-[#DCD5C8] px-3 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="text-[11px]">
            Showing <span className="font-bold text-slate-900">{filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of{" "}
            <span className="font-bold text-slate-900">{filteredRecords.length}</span> applications
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-6 w-6 p-0 border-[#DCD5C8] bg-white cursor-pointer"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <span className="text-[11px] font-bold px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-6 w-6 p-0 border-[#DCD5C8] bg-white cursor-pointer"
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2 & 3. APPLY FOR OCCUPANCY MODAL ── */}
      <ApplyOccupancyModal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onCreated={(newRecord) => {
          setRecords((prev) => [newRecord, ...prev]);
          toast({
            title: "Occupancy Application Submitted",
            description: `Application ${newRecord.occupancyNumber} filed successfully and queued for verification.`,
          });
        }}
      />

      {/* ── 4, 5, 8, 10. OCCUPANCY DETAILS & INSPECTION MODAL ── */}
      {selectedRecord && (
        <OccupancyDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          record={selectedRecord}
          activeTab={activeDetailTab}
          setActiveTab={setActiveDetailTab}
          onUpdated={(updated) => {
            setSelectedRecord(updated);
            setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          }}
          onViewCertificate={() => {
            setDetailsModalOpen(false);
            setCertModalOpen(true);
          }}
        />
      )}

      {/* ── 7. OCCUPANCY CERTIFICATE MODAL ── */}
      {selectedRecord && (
        <OccupancyCertificateModal
          record={selectedRecord}
          open={certModalOpen}
          onClose={() => setCertModalOpen(false)}
        />
      )}
    </div>
  );
}

// ── 2 & 3. APPLY OCCUPANCY MODAL COMPONENT ──────────────────────────────────
function ApplyOccupancyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (rec: OccupancyApplicationRecord) => void;
}) {
  const { applications, user } = useAppStore();
  const approvedPermissions = React.useMemo(() => {
    return applications.filter((a) => a.status === "APPROVED");
  }, [applications]);

  // Selected linked building permission
  const [selectedAppId, setSelectedAppId] = React.useState<string>(approvedPermissions[0]?.id || "");
  const selectedApp = approvedPermissions.find((a) => a.id === selectedAppId) || approvedPermissions[0];

  // Request Form Fields
  const [requestDate, setRequestDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [completionDate, setCompletionDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [actualBuiltUpArea, setActualBuiltUpArea] = React.useState("9850");
  const [actualFloors, setActualFloors] = React.useState("G+4");
  const [actualUsage, setActualUsage] = React.useState("Residential");
  const [actualUnits, setActualUnits] = React.useState("20");
  const [occupancyCapacity, setOccupancyCapacity] = React.useState("120");
  const [applicantRemarks, setApplicantRemarks] = React.useState(
    "Construction fully completed as per sanctioned building permission order. Fire NOC compliance, lifts certified, and rainwater harvesting operational."
  );
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update defaults when selected app changes
  React.useEffect(() => {
    if (selectedApp) {
      setActualBuiltUpArea(String(selectedApp.project.builtUpArea || 10000));
      setActualUsage(selectedApp.project.propertyType || "Residential");
    }
  }, [selectedApp]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const newId = `occ-${Date.now()}`;
      const newOccupancyNo = `OC/APCRDA/2026/${String(Math.floor(Math.random() * 9000) + 1000)}`;

      const newRecord: OccupancyApplicationRecord = {
        id: newId,
        occupancyNumber: newOccupancyNo,
        applicationId: selectedApp?.id || "app-new",
        applicationNumber: selectedApp?.applicationNo || "AP/BP/2026/04/0099",
        status: "SUBMITTED",
        state: "SUBMITTED",
        round: 1,
        currentDesk: "Town Planning Assistant — Verification",
        orderNumber: `BPO/2026/${String(Math.floor(Math.random() * 900) + 100)}`,
        orderIssuedAt: "2026-01-10T10:00:00Z",
        commencementNumber: `WIC/2026/${String(Math.floor(Math.random() * 900) + 100)}`,
        commencementDate: "2026-01-15T00:00:00Z",
        completionDate: completionDate,
        completionRemarks: applicantRemarks,
        submittedAt: now.toISOString(),
        submittedByName: `${user?.name || "Licensed Technical Person"} (LTP)`,
        owner: {
          name: selectedApp?.applicant.name || "Sri. K. Venkateswara Rao",
          contact: selectedApp?.applicant.contact || "+91 98480 22334",
          email: selectedApp?.applicant.email || "applicant@example.com",
          address: selectedApp?.project.address || "Plot 42, Amaravati",
        },
        ltp: {
          name: user?.name || "Venu Kotte",
          licenceNo: user?.licenseNo || "COA/2018/89412",
          contact: "+91 98220 99881",
          email: "ltp@architects.in",
        },
        project: {
          name: selectedApp?.project.name || "Amaravati Heights",
          type: actualUsage.toUpperCase(),
          zone: selectedApp?.project.zone || "Amaravati Capital City Zone",
          ward: selectedApp?.project.ward || "Ward 04",
          surveyNo: selectedApp?.project.surveyNo || "S.No. 142/2A",
          address: selectedApp?.project.address || "Amaravati, Andhra Pradesh",
          approvedAreaSqm: Number(selectedApp?.project.builtUpArea || 1000),
          completedAreaSqm: Number(actualBuiltUpArea) / 10.764 || 980,
          plotNo: "Plot No. 42",
          approvedFloors: "G+4",
          actualFloors: actualFloors,
          approvedUnits: Number(actualUnits),
          actualUnits: Number(actualUnits),
          occupancyCapacity: Number(occupancyCapacity),
        },
        documents: [
          {
            kind: "COMPLETION_LETTER",
            fileObjectId: "doc-new-1",
            fileName: "Completion_Intimation_Certificate.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1540000,
            isDemo: false,
            addedAt: now.toISOString(),
            addedByName: user?.name || "LTP",
            round: 1,
          },
          {
            kind: "AS_BUILT_DRAWING",
            fileObjectId: "doc-new-2",
            fileName: "As_Built_Architectural_Floorplans.dwg",
            mimeType: "application/acad",
            sizeBytes: 9400000,
            isDemo: false,
            addedAt: now.toISOString(),
            addedByName: user?.name || "LTP",
            round: 1,
          },
        ],
        approvedFigures: {
          plotAreaSqm: 1200,
          builtUpAreaSqm: Number(selectedApp?.project.builtUpArea || 1000),
          coveragePercent: 45,
          fsi: 2.2,
          heightM: 15.0,
          floors: 5,
          setbackMinM: 6.0,
          parkingAreaSqm: 380,
        },
        comparison: compareAsBuilt(
          {
            plotAreaSqm: 1200,
            builtUpAreaSqm: Number(selectedApp?.project.builtUpArea || 1000),
            coveragePercent: 45,
            fsi: 2.2,
            heightM: 15.0,
            floors: 5,
            setbackMinM: 6.0,
            parkingAreaSqm: 380,
          },
          {
            plotAreaSqm: 1200,
            builtUpAreaSqm: Number(actualBuiltUpArea) / 10.764 || 980,
            coveragePercent: 44.5,
            fsi: 2.18,
            heightM: 14.8,
            floors: 5,
            setbackMinM: 5.95,
            parkingAreaSqm: 380,
          }
        ),
        inspections: [],
        events: [
          {
            id: `ev-${Date.now()}`,
            action: "SUBMITTED",
            toStatus: "SUBMITTED",
            actorName: user?.name || "Licensed Technical Person",
            actorRoleKey: "LTP",
            stageName: "Application Submission",
            remarks: "Completion intimated and occupancy application filed.",
            occurredAt: now.toISOString(),
          },
        ],
        history: [],
      };

      setIsSubmitting(false);
      onCreated(newRecord);
      onClose();
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-2 border-[#7A1316] bg-[#FAF7F2]">
        <div className="p-4 bg-white border-b border-[#DCD5C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#7A1316] text-white flex items-center justify-center font-bold">
              <Building2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#7A1316]">
                Application for Occupancy Certificate
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Link to approved building permission, verify auto-loaded parameters, and submit actual completion details.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* ── 2. AUTO-LINKED BUILDING PERMISSION & WORK INITIATION DETAILS ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> 1. Linked Approved Building Permission
              </h3>
              <span className="text-[10px] text-slate-500">Auto-populated from Permission Registry</span>
            </div>

            {approvedPermissions.length > 1 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Approved Building Permission File:
                </label>
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedPermissions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.applicationNo} — {a.project.name} ({a.applicant.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Auto-Loaded Read-Only Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl border border-[#DCD5C8] bg-white shadow-2xs text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Building Permission No.</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedApp ? `BPO/2026/${selectedApp.applicationNo.slice(-4)}` : "BPO/2026/0412"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposal App No.</span>
                <span className="font-mono font-bold text-slate-800">{selectedApp?.applicationNo || "AP/BP/2026/0412"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant / Owner</span>
                <span className="font-medium text-slate-800">{selectedApp?.applicant.name || "Sri. K. Venkateswara Rao"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Zone</span>
                <span className="text-slate-700">{selectedApp?.project.zone || "Amaravati Capital City Zone"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Survey No. / Plot No.</span>
                <span className="font-mono text-slate-800">
                  {selectedApp?.project.surveyNo || "S.No. 142/2A"}, Plot 42
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Building Usage</span>
                <span className="font-medium text-slate-800">{selectedApp?.project.propertyType || "Residential"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Floors</span>
                <span className="font-semibold text-slate-800">Ground + 4 Floors</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Built-up Area</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedApp?.project.builtUpArea?.toLocaleString("en-IN") || "10,000"} sq.ft
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Initiation No.</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedApp ? `WIC/2026/${selectedApp.applicationNo.slice(-4)}` : "WIC/2026/0088"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Initiation Date</span>
                <span className="text-slate-800 font-medium">12-Jan-2026 (Verified on site)</span>
              </div>
            </div>
          </div>

          {/* ── 3. OCCUPANCY REQUEST (APPLICANT SUBMISSION DETAILS) ── */}
          <div className="space-y-3 pt-2 border-t border-[#DCD5C8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
              <FileCheck2 className="size-3.5" /> 2. Actual Completion &amp; Occupancy Request
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Occupancy Request Date <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="h-8 text-xs border-[#EADBCE] bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Actual Completion Date <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="h-8 text-xs border-[#EADBCE] bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Actual Built-up Area (sq.ft) <span className="text-red-600">*</span>
                </label>
                <Input
                  value={actualBuiltUpArea}
                  onChange={(e) => setActualBuiltUpArea(e.target.value)}
                  placeholder="e.g. 9850"
                  className="h-8 text-xs border-[#EADBCE] bg-white font-mono"
                />
                <span className="text-[10px] text-slate-400">Tolerance permissible: within ±2% of sanction</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Actual Number of Floors <span className="text-red-600">*</span>
                </label>
                <Input
                  value={actualFloors}
                  onChange={(e) => setActualFloors(e.target.value)}
                  placeholder="e.g. G+4"
                  className="h-8 text-xs border-[#EADBCE] bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Actual Usage <span className="text-red-600">*</span>
                </label>
                <Select value={actualUsage} onValueChange={setActualUsage}>
                  <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                    <SelectItem value="Institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Number of Units (if applicable)
                </label>
                <Input
                  value={actualUnits}
                  onChange={(e) => setActualUnits(e.target.value)}
                  placeholder="e.g. 20 apartments"
                  className="h-8 text-xs border-[#EADBCE] bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Occupancy Capacity (if applicable)
                </label>
                <Input
                  value={occupancyCapacity}
                  onChange={(e) => setOccupancyCapacity(e.target.value)}
                  placeholder="e.g. 120 persons"
                  className="h-8 text-xs border-[#EADBCE] bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Applicant Remarks &amp; Completion Notes
                </label>
                <Textarea
                  rows={3}
                  value={applicantRemarks}
                  onChange={(e) => setApplicantRemarks(e.target.value)}
                  placeholder="Notes on completion, clearances obtained, parking provisions..."
                  className="text-xs border-[#EADBCE] bg-white"
                />
              </div>
            </div>
          </div>

          {/* ── REQUIRED OCCUPANCY DOCUMENTS UPLOAD ── */}
          <div className="space-y-3 pt-2 border-t border-[#DCD5C8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
              <Download className="size-3.5" /> 3. Required Occupancy / Completion Documents
            </h3>
            <p className="text-[11px] text-slate-500">
              Attach As-Built Drawings, Structural Stability Certificate, Fire NOC Compliance, Lift License, and Completion Photographs.
            </p>

            <FileUploader
              accept=".pdf,.dwg,.dxf,.jpg,.png"
              uploadedFiles={uploadedFiles}
              onUpload={(files) => setUploadedFiles((prev) => [...prev, ...files])}
              onRemove={(id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id))}
              label="Drop completion drawings & certificates here"
              hint="PDF, DWG, JPG (max 25 MB each)"
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-white border-t border-[#DCD5C8] gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !actualBuiltUpArea}
            className="text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white cursor-pointer gap-1.5 font-semibold"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Submitting Application...
              </>
            ) : (
              <>
                <Check className="size-3.5" /> Submit Occupancy Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 4, 5, 8, 10. OCCUPANCY DETAILS, INSPECTION & SHORTFALL MODAL ─────────────
function OccupancyDetailsModal({
  open,
  onClose,
  record,
  activeTab,
  setActiveTab,
  onUpdated,
  onViewCertificate,
}: {
  open: boolean;
  onClose: () => void;
  record: OccupancyApplicationRecord;
  activeTab: "overview" | "inspection" | "shortfall" | "certificate" | "history";
  setActiveTab: (t: "overview" | "inspection" | "shortfall" | "certificate" | "history") => void;
  onUpdated: (rec: OccupancyApplicationRecord) => void;
  onViewCertificate: () => void;
}) {
  const { user } = useAppStore();
  const { toast } = useToast();

  // Officer Inspection Form State
  const [inspectionDate, setInspectionDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [inspectionOfficer, setInspectionOfficer] = React.useState("Soumith (TPA)");
  const [inspectionRemarks, setInspectionRemarks] = React.useState(
    "Physical inspection conducted. As-built structural measurements verified against sanctioned BPO plans."
  );
  const [observations, setObservations] = React.useState(
    "Setbacks clear and unobstructed. Fire driveway accessible. Rainwater recharge pit operational. Parking spaces demarcated."
  );
  const [inspectionResult, setInspectionResult] = React.useState<"PASS" | "SHORTFALL" | "REJECT">("PASS");

  // Shortfall Form State (Officer)
  const [newShortfallText, setNewShortfallText] = React.useState("");

  // Shortfall Response State (Applicant)
  const [shortfallReplyText, setShortfallReplyText] = React.useState("");
  const [shortfallFiles, setShortfallFiles] = React.useState<UploadedFile[]>([]);

  // Quick jump scrolling
  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  React.useEffect(() => {
    if (open && activeTab) {
      const targetId = `sec-${activeTab}`;
      const timer = setTimeout(() => {
        scrollToSection(targetId);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, activeTab]);

  // ── Action Handlers ──
  const handleApproveInspection = () => {
    const updated: OccupancyApplicationRecord = {
      ...record,
      status: "APPROVED",
      state: "APPROVED",
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "APPROVED",
          fromStatus: record.status,
          toStatus: "APPROVED",
          actorName: user?.name || "Zonal Head / Commissioner",
          actorRoleKey: "COMMISSIONER",
          stageName: "Decision Desk",
          remarks: "Inspection satisfactory. Application approved for Occupancy Certificate issuance.",
          occurredAt: new Date().toISOString(),
        },
        ...record.events,
      ],
    };
    onUpdated(updated);
    toast({
      title: "Inspection Approved",
      description: "Occupancy application marked as Approved. Certificate is ready to be generated.",
    });
  };

  const handleRaiseShortfall = () => {
    if (!newShortfallText.trim()) return;
    const updated: OccupancyApplicationRecord = {
      ...record,
      status: "SHORTFALL",
      state: "SHORTFALL",
      shortfall: {
        items: [newShortfallText.trim()],
        remarks: "Deficiencies identified during inspection. Rectify and submit compliance.",
        raisedByName: `${user?.name || "Field Officer"} (TPA)`,
        raisedAt: new Date().toISOString(),
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "SHORTFALL_RAISED",
          fromStatus: record.status,
          toStatus: "SHORTFALL",
          actorName: user?.name || "Field Officer",
          actorRoleKey: "TPA",
          stageName: "Field Inspection",
          remarks: newShortfallText.trim(),
          occurredAt: new Date().toISOString(),
        },
        ...record.events,
      ],
    };
    onUpdated(updated);
    setNewShortfallText("");
    toast({
      title: "Shortfall Raised",
      description: "Shortfall notice issued to applicant for rectification.",
    });
  };

  const handleApplicantReplyShortfall = () => {
    if (!shortfallReplyText.trim()) return;
    const updated: OccupancyApplicationRecord = {
      ...record,
      status: "RESPONSE_SUBMITTED" as any,
      state: "SUBMITTED",
      shortfall: {
        ...record.shortfall!,
        response: shortfallReplyText.trim(),
        respondedAt: new Date().toISOString(),
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "RESPONSE_SUBMITTED",
          fromStatus: "SHORTFALL",
          toStatus: "RESPONSE_SUBMITTED",
          actorName: `${user?.name || "Licensed Technical Person"} (LTP)`,
          actorRoleKey: "LTP",
          stageName: "Shortfall Compliance",
          remarks: shortfallReplyText.trim(),
          occurredAt: new Date().toISOString(),
        },
        ...record.events,
      ],
    };
    onUpdated(updated);
    setShortfallReplyText("");
    toast({
      title: "Compliance Reply Submitted",
      description: "Your response and compliance documents have been submitted to the officer.",
    });
  };

  const handleResolveShortfall = () => {
    const updated: OccupancyApplicationRecord = {
      ...record,
      status: "INSPECTION_COMPLETED",
      state: "INSPECTION_COMPLETED",
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "SHORTFALL_RESOLVED",
          fromStatus: "SHORTFALL",
          toStatus: "INSPECTION_COMPLETED",
          actorName: user?.name || "Field Officer",
          actorRoleKey: "TPA",
          stageName: "Field Inspection",
          remarks: "Shortfall compliance accepted. Deficiencies rectified.",
          occurredAt: new Date().toISOString(),
        },
        ...record.events,
      ],
    };
    onUpdated(updated);
    toast({
      title: "Shortfall Resolved",
      description: "Compliance verified and accepted. Ready for final recommendation.",
    });
  };

  const handleGenerateCertificate = () => {
    const certNo = `OCC-CERT-2026-${record.occupancyNumber.slice(-4)}`;
    const updated: OccupancyApplicationRecord = {
      ...record,
      status: "CERTIFICATE_ISSUED",
      state: "CERTIFICATE_ISSUED",
      certificate: {
        certificateNumber: certNo,
        issuedAt: new Date().toISOString(),
        issuedByName: "A Jyotheeswar Reddy (Commissioner)",
        approvedAreaSqm: record.project.approvedAreaSqm || 1800,
        completedAreaSqm: record.project.completedAreaSqm || 1792.5,
        conditions: [
          "The building shall be used strictly for the sanctioned purpose without unauthorized alterations.",
          "The designated parking area shall remain un-encumbered and strictly used for vehicle parking only.",
          "The peripheral setbacks shall be maintained permanently open to sky.",
          "Rainwater harvesting pits and roof runoff recharge system shall be maintained in clean operating condition.",
        ],
        outwardNumber: `OUT/2026/04/${String(Math.floor(Math.random() * 900) + 100)}`,
        verificationCode: `OCC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-APCRDA`,
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "CERTIFICATE_ISSUED",
          fromStatus: "APPROVED",
          toStatus: "CERTIFICATE_ISSUED",
          actorName: "A Jyotheeswar Reddy",
          actorRoleKey: "COMMISSIONER",
          stageName: "Occupancy Certificate Issuance",
          remarks: `Occupancy Certificate ${certNo} generated and signed.`,
          occurredAt: new Date().toISOString(),
        },
        ...record.events,
      ],
    };
    onUpdated(updated);
    toast({
      title: "Occupancy Certificate Generated",
      description: `Certificate ${certNo} is now issued and ready for print/download.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden p-0 border-2 border-[#7A1316] bg-[#FAF7F2] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-white border-b border-[#DCD5C8] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-[#7A1316] text-white flex items-center justify-center font-bold">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-[#7A1316] font-mono">
                  {record.occupancyNumber}
                </DialogTitle>
                <OccupancyStatusBadge status={record.state || record.status} />
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {record.project.name} · {record.owner.name} · Sanction: {record.orderNumber || record.applicationNumber}
              </DialogDescription>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2">
            {record.state === "APPROVED" && (
              <Button
                size="sm"
                onClick={handleGenerateCertificate}
                className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white gap-1 font-semibold cursor-pointer shadow-2xs"
              >
                <Award className="size-3.5" /> Generate Certificate
              </Button>
            )}
            {record.certificate && (
              <Button
                size="sm"
                onClick={onViewCertificate}
                className="h-7 text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white gap-1 font-semibold cursor-pointer shadow-2xs"
              >
                <Printer className="size-3.5" /> View / Print Certificate
              </Button>
            )}
          </div>
        </div>

        {/* Quick Jump Navigation Strip */}
        <div className="bg-[#F5EBE1] border-b border-[#DCD5C8] px-4 py-2 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1316] mr-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> Quick Jump:
          </span>
          {[
            { id: "sec-overview", label: "1. Linked Permission & Details", icon: Building2 },
            { id: "sec-inspection", label: "2. Approved vs Actual Inspection", icon: ClipboardCheck },
            { id: "sec-shortfall", label: "3. Shortfall & Compliance", icon: AlertTriangle },
            { id: "sec-certificate", label: "4. Occupancy Certificate", icon: Award },
            { id: "sec-history", label: "5. Audit Timeline", icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#DCD5C8] bg-white text-slate-700 hover:text-[#7A1316] hover:border-[#7A1316] hover:bg-[#FAF7F2] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Icon className="size-3 text-[#7A1316]" />
              {label}
            </button>
          ))}
        </div>

        {/* Unified All-in-One Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ── SECTION 1: OVERVIEW & LINKED PERMISSION ── */}
          <div id="sec-overview" className="space-y-4">
              {/* Linked Permission Strip */}
              <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                    <ShieldCheck className="size-4" /> Linked Building Permission &amp; Work Initiation
                  </h4>
                  <Badge variant="outline" className="border-emerald-600 text-emerald-800 text-[10px] font-bold">
                    SANCTIONED &amp; VERIFIED
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanction BPO No.</span>
                    <span className="font-mono font-bold text-slate-900">{record.orderNumber || "BPO/2026/04/0012"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Initiation No.</span>
                    <span className="font-mono font-bold text-slate-900">{record.commencementNumber || "COMM/2026/0012"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Initiation Date</span>
                    <span className="text-slate-800">{formatDate(record.commencementDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">LTP On Record</span>
                    <span className="font-medium text-slate-800">{record.ltp.name} ({record.ltp.licenceNo})</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Plot No. &amp; Survey No.</span>
                    <span className="font-mono text-slate-800">{record.project.surveyNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Zone &amp; Ward</span>
                    <span className="text-slate-800">{record.project.zone}, {record.project.ward}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctioned Floors</span>
                    <span className="font-semibold text-slate-800">Ground + {(record.approvedFigures.floors ?? 5) - 1} Floors</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Built-up Area</span>
                    <span className="font-mono font-bold text-slate-800">{record.project.approvedAreaSqm.toLocaleString()} sq.m</span>
                  </div>
                </div>
              </div>

              {/* Occupancy Request Details */}
              <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                    <FileText className="size-4" /> Intimated Completion Details
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Filed on {formatDate(record.submittedAt)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Completion Date</span>
                    <span className="font-bold text-slate-900">{formatDate(record.completionDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Built-up Area</span>
                    <span className="font-mono font-bold text-slate-900">{record.project.completedAreaSqm.toLocaleString()} sq.m</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Floors</span>
                    <span className="font-medium text-slate-800">Ground + {(record.approvedFigures.floors ?? 5) - 1} Floors</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Usage</span>
                    <span className="font-medium text-slate-800">{record.project.type}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Applicant Completion Remarks:</span>
                  <p>{record.completionRemarks}</p>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                  <Download className="size-4" /> Submitted Occupancy Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {record.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-[#EADBCE] bg-[#FDFBF7]">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="size-4 text-[#7A1316] shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400">{doc.kind.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-[#7A1316]">
                        <Download className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          {/* ── SECTION 2: 4. OFFICER INSPECTION (APPROVED VS ACTUAL) ── */}
          <div id="sec-inspection" className="space-y-5 pt-4 border-t-2 border-[#DCD5C8]">
              {/* Approved vs Actual Comparison Table */}
              <div className="rounded-xl border border-[#DCD5C8] bg-white overflow-hidden shadow-2xs">
                <div className="bg-[#F5EBE1] border-b border-[#DCD5C8] px-3 py-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                    <ClipboardCheck className="size-4" /> 4. Parameter Verification: Approved vs Actual
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">Statutory Tolerance: ±2%</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] font-bold">
                    <tr className="divide-x divide-slate-200">
                      <th className="px-3 py-2">Parameter</th>
                      <th className="px-3 py-2 text-center w-32">Approved (Sanctioned)</th>
                      <th className="px-3 py-2 text-center w-32">Actual (As-Built)</th>
                      <th className="px-3 py-2 text-center w-24">Deviation</th>
                      <th className="px-3 py-2 text-center w-24">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      {
                        param: "Built-up Area",
                        approved: `${record.project.approvedAreaSqm.toLocaleString()} sq.m`,
                        actual: `${record.project.completedAreaSqm.toLocaleString()} sq.m`,
                        diff: `${Math.round(((record.project.completedAreaSqm - record.project.approvedAreaSqm) / record.project.approvedAreaSqm) * 100)}%`,
                        pass: record.project.completedAreaSqm <= record.project.approvedAreaSqm * 1.02,
                      },
                      {
                        param: "Floors",
                        approved: `G+${(record.approvedFigures.floors ?? 5) - 1}`,
                        actual: `G+${(record.approvedFigures.floors ?? 5) - 1}`,
                        diff: "0",
                        pass: true,
                      },
                      {
                        param: "Building Usage",
                        approved: record.project.type,
                        actual: record.project.type,
                        diff: "Match",
                        pass: true,
                      },
                      {
                        param: "Units Count",
                        approved: "20",
                        actual: "20",
                        diff: "0",
                        pass: true,
                      },
                      {
                        param: "Front Setback",
                        approved: `${(record.approvedFigures.setbackMinM ?? 6.0).toFixed(2)} m`,
                        actual: `${((record.approvedFigures.setbackMinM ?? 6.0) - 0.05).toFixed(2)} m`,
                        diff: "-0.05 m",
                        pass: true,
                      },
                      {
                        param: "Building Height",
                        approved: `${(record.approvedFigures.heightM ?? 15.0).toFixed(1)} m`,
                        actual: `${((record.approvedFigures.heightM ?? 15.0) - 0.2).toFixed(1)} m`,
                        diff: "-0.2 m",
                        pass: true,
                      },
                      {
                        param: "Parking Provision",
                        approved: `${record.approvedFigures.parkingAreaSqm} sq.m`,
                        actual: `${record.approvedFigures.parkingAreaSqm} sq.m`,
                        diff: "0",
                        pass: true,
                      },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#FDFBF7] divide-x divide-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-800">{row.param}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-700">{row.approved}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-900 font-semibold">{row.actual}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500">{row.diff}</td>
                        <td className="px-3 py-2 text-center">
                          {row.pass ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="size-3" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              <X className="size-3" /> Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inspection Photos Gallery */}
              <div className="rounded-xl border border-[#DCD5C8] bg-white p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                  <Camera className="size-4" /> Geo-tagged Inspection Photos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { title: "Front Elevation", svg: PHOTO_SVGS.FRONT_ELEVATION },
                    { title: "Rear Setback", svg: PHOTO_SVGS.REAR_ELEVATION },
                    { title: "Side Setback (3.2m)", svg: PHOTO_SVGS.SIDE_SETBACK },
                    { title: "Basement Parking", svg: PHOTO_SVGS.PARKING },
                  ].map((p, i) => (
                    <div key={i} className="rounded-lg border border-[#EADBCE] overflow-hidden bg-slate-50 shadow-2xs group">
                      <div className="h-28 overflow-hidden bg-slate-200">
                        <img src={p.svg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-2 text-center bg-white border-t border-[#EADBCE]">
                        <p className="text-[11px] font-bold text-slate-800">{p.title}</p>
                        <p className="text-[9px] text-slate-400">Geo: 18.5204° N, 73.8567° E</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Inspection Action Box */}
              <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316]">
                  Record Field Inspection Findings &amp; Decision
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Inspection Date</label>
                    <Input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="h-8 text-xs border-[#EADBCE] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Inspection Officer</label>
                    <Input
                      value={inspectionOfficer}
                      onChange={(e) => setInspectionOfficer(e.target.value)}
                      className="h-8 text-xs border-[#EADBCE] bg-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Observations</label>
                    <Input
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      className="h-8 text-xs border-[#EADBCE] bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Inspection Remarks</label>
                    <Textarea
                      rows={2}
                      value={inspectionRemarks}
                      onChange={(e) => setInspectionRemarks(e.target.value)}
                      className="text-xs border-[#EADBCE] bg-white"
                    />
                  </div>
                </div>

                {/* Inspection Decision Buttons */}
                <div className="pt-2 border-t border-[#EADBCE] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600 font-medium">Select statutory outcome:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => scrollToSection("sec-shortfall")}
                      className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white gap-1 font-semibold cursor-pointer shadow-2xs"
                    >
                      <AlertTriangle className="size-3" /> Raise Shortfall
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApproveInspection}
                      className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white gap-1 font-semibold cursor-pointer shadow-2xs"
                    >
                      <Check className="size-3.5" /> Approve Occupancy
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          {/* ── SECTION 3: 5. OCCUPANCY SHORTFALL & COMPLIANCE ── */}
          <div id="sec-shortfall" className="space-y-4 pt-4 border-t-2 border-[#DCD5C8]">
              {/* Shortfall Status Banner */}
              {record.shortfall ? (
                <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-rose-700" />
                      <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                        Active Shortfall Notice
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-rose-700">
                      Raised on {formatDate(record.shortfall.raisedAt)} by {record.shortfall.raisedByName}
                    </span>
                  </div>

                  {/* Deficiencies List */}
                  <div className="space-y-1.5 text-xs text-rose-950">
                    <span className="font-bold block">Deficiencies Cited by Officer:</span>
                    <ul className="list-disc pl-5 space-y-1">
                      {record.shortfall.items.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Applicant Response Form or View */}
                  {record.shortfall.response ? (
                    <div className="rounded-lg bg-white border border-rose-200 p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Applicant Compliance Response:</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Submitted on {formatDate(record.shortfall.respondedAt || record.shortfall.raisedAt)}
                        </span>
                      </div>
                      <p className="text-slate-700">{record.shortfall.response}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-white border border-rose-200 p-3 space-y-2 text-xs">
                      <span className="font-bold text-slate-900 block">Submit Applicant Compliance Response:</span>
                      <Textarea
                        rows={3}
                        value={shortfallReplyText}
                        onChange={(e) => setShortfallReplyText(e.target.value)}
                        placeholder="Provide details on corrective actions taken, removed obstructions, or revised as-built drawings..."
                        className="text-xs border-[#EADBCE]"
                      />
                      <FileUploader
                        accept=".pdf,.dwg,.jpg,.png"
                        uploadedFiles={shortfallFiles}
                        onUpload={(files) => setShortfallFiles((prev) => [...prev, ...files])}
                        onRemove={(id) => setShortfallFiles((prev) => prev.filter((f) => f.id !== id))}
                        label="Upload compliance photos or revised drawings"
                      />
                      <Button
                        size="sm"
                        onClick={handleApplicantReplyShortfall}
                        disabled={!shortfallReplyText.trim()}
                        className="h-7 text-xs bg-rose-800 hover:bg-rose-900 text-white font-semibold cursor-pointer gap-1"
                      >
                        <Check className="size-3" /> Submit Compliance Response
                      </Button>
                    </div>
                  )}

                  {/* Officer Actions on Shortfall */}
                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                    <span className="text-[11px] text-rose-800 font-medium">Officer Review of Response:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast({ title: "Re-inspection Booked", description: "Follow-up field inspection scheduled." });
                        }}
                        className="h-7 text-xs border-rose-300 text-rose-800 hover:bg-rose-100"
                      >
                        Order Re-inspection
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleResolveShortfall}
                        className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1"
                      >
                        <Check className="size-3" /> Mark Shortfall Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#DCD5C8] p-6 text-center bg-white space-y-3">
                  <div className="size-10 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">No Active Shortfalls</p>
                    <p className="text-[11px] text-slate-500">All building parameters conform to sanctioned bylaws.</p>
                  </div>

                  {/* Raise Shortfall Form */}
                  <div className="max-w-md mx-auto text-left pt-3 border-t border-[#DCD5C8] space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Raise New Shortfall Notice (Field Officer Action):
                    </label>
                    <Textarea
                      rows={3}
                      value={newShortfallText}
                      onChange={(e) => setNewShortfallText(e.target.value)}
                      placeholder="Specify unauthorized extension, setback deviation, or missing fire certificate..."
                      className="text-xs border-[#EADBCE]"
                    />
                    <Button
                      size="sm"
                      onClick={handleRaiseShortfall}
                      disabled={!newShortfallText.trim()}
                      className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white font-semibold cursor-pointer gap-1"
                    >
                      <AlertTriangle className="size-3" /> Issue Shortfall Notice
                    </Button>
                  </div>
                </div>
              )}
            </div>

          {/* ── SECTION 4: 7. OCCUPANCY CERTIFICATE ── */}
          <div id="sec-certificate" className="space-y-4 pt-4 border-t-2 border-[#DCD5C8]">
              {record.certificate ? (
                <div className="rounded-xl border border-[#DCD5C8] bg-white p-6 shadow-sm space-y-6">
                  {/* Certificate Header Banner */}
                  <div className="flex items-center justify-between border-b-2 border-[#7A1316] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-[#7A1316] text-white flex items-center justify-center">
                        <Award className="size-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#7A1316] uppercase tracking-wide">
                          Certificate of Occupancy
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          Certificate No: <span className="font-bold text-slate-900">{record.certificate.certificateNumber}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={onViewCertificate}
                        className="h-8 text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white gap-1.5 font-semibold cursor-pointer shadow-2xs"
                      >
                        <Printer className="size-3.5" /> Full Printable Certificate
                      </Button>
                    </div>
                  </div>

                  {/* Certificate Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD5C8] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate No.</span>
                      <span className="font-mono font-bold text-slate-900">{record.certificate.certificateNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Approval Date</span>
                      <span className="font-semibold text-slate-900">{formatDate(record.certificate.issuedAt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Issuing Authority</span>
                      <span className="font-medium text-slate-900">{record.certificate.issuedByName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Outward No.</span>
                      <span className="font-mono font-bold text-slate-900">{record.certificate.outwardNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Permit BPO No.</span>
                      <span className="font-mono text-slate-800">{record.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant / Owner</span>
                      <span className="text-slate-800 font-medium">{record.owner.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctioned Area</span>
                      <span className="font-mono font-bold text-slate-800">{record.certificate.approvedAreaSqm} sq.m</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">As-Built Certified Area</span>
                      <span className="font-mono font-bold text-emerald-800">{record.certificate.completedAreaSqm} sq.m</span>
                    </div>
                  </div>

                  {/* Conditions List */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block">
                      Mandatory Endorsed Conditions:
                    </span>
                    <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                      {record.certificate.conditions.map((cond, i) => (
                        <li key={i}>{cond}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#DCD5C8] p-8 text-center bg-white space-y-4">
                  <div className="size-12 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-600">
                    <Award className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Occupancy Certificate Not Yet Issued</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Final certificate is issued after verification, satisfactory site inspection, and officer approval.
                    </p>
                  </div>
                  {record.state === "APPROVED" && (
                    <Button
                      onClick={handleGenerateCertificate}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Award className="size-4" /> Issue Occupancy Certificate Now
                    </Button>
                  )}
                </div>
              )}
            </div>

          {/* ── SECTION 5: 8. OCCUPANCY HISTORY & LIFECYCLE TIMELINE ── */}
          <div id="sec-history" className="pt-4 border-t-2 border-[#DCD5C8]">
            <div className="rounded-xl border border-[#DCD5C8] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] flex items-center gap-1.5">
                  <History className="size-4" /> 8. Occupancy Lifecycle Audit History
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {record.events.length} Recorded Milestones
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCD5C8]">
                {record.events.map((ev, i) => (
                  <div key={ev.id || i} className="relative group">
                    <div className="absolute -left-6 top-0.5 size-4 rounded-full border-2 border-[#7A1316] bg-white flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-[#7A1316]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{ev.action.replace(/_/g, " ")}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{formatDateTime(ev.occurredAt)}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        Actor: <span className="font-semibold text-slate-800">{ev.actorName}</span>
                        {ev.stageName && <> · Stage: <span className="text-slate-800">{ev.stageName}</span></>}
                      </div>
                      {ev.remarks && (
                        <p className="text-xs text-slate-600 mt-1 bg-[#FAF7F2] p-2 rounded-lg border border-[#EADBCE]">
                          {ev.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-[#DCD5C8] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            ID: {record.id} · Stage: {record.currentDesk}
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="h-7 text-xs cursor-pointer">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
