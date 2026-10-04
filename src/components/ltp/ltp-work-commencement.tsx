"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { useToast } from "@/hooks/use-toast";
import {
  HardHat,
  FileCheck2,
  Calendar,
  CalendarClock,
  Building2,
  Printer,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Camera,
  Award,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Check,
} from "lucide-react";
import { MOCK_WORK_COMMENCEMENTS, type WorkCommencementRecord } from "@/data/modules-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type WorkCommencementTabKey = "cc-issued" | "work-initiated";

export interface WorkCommencementItem {
  id: string;
  commencementNumber?: string;
  applicationId: string;
  applicationNumber: string;
  approvalOrderNumber: string;
  orderIssuedDate: string;
  status: "PENDING_CC" | "CC_ISSUED" | "WORK_INITIATED";
  ownerName: string;
  siteAddress: string;
  ltpName: string;
  ccIssueDate?: string;
  commencementDate?: string; // Work Initiation Date
  contractor: {
    name: string;
    licenceNo: string;
    phone: string;
    address: string;
  };
  siteSupervisor?: string;
  workStage?: string;
  sitePhotosCount: number;
  commencementNoticeUploaded: boolean;
  remarks: string;
}

interface LtpWorkCommencementProps {
  initialTab?: WorkCommencementTabKey;
}

export function LtpWorkCommencement({ initialTab = "cc-issued" }: LtpWorkCommencementProps) {
  const { openApplication } = useAppStore();
  const { applications } = useDashboardScope();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<WorkCommencementTabKey>(initialTab);

  // Sync tab if prop changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search and filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState("ALL");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Initialize records from MOCK_WORK_COMMENCEMENTS and approved applications
  const [records, setRecords] = React.useState<WorkCommencementItem[]>(() => {
    const baseItems: WorkCommencementItem[] = MOCK_WORK_COMMENCEMENTS.map((m) => {
      let mappedStatus: "PENDING_CC" | "CC_ISSUED" | "WORK_INITIATED" = "CC_ISSUED";
      if (m.status === "WORK_INITIATED" && m.commencementDate) {
        mappedStatus = "WORK_INITIATED";
      } else if (m.status === "PROCEEDING_ISSUED" && !m.commencementNumber) {
        mappedStatus = "PENDING_CC";
      } else {
        mappedStatus = "CC_ISSUED";
      }

      return {
        id: m.id,
        commencementNumber: m.commencementNumber || undefined,
        applicationId: m.applicationId,
        applicationNumber: m.applicationNumber,
        approvalOrderNumber: m.approvalOrderNumber,
        orderIssuedDate: m.orderIssuedDate,
        status: mappedStatus,
        ownerName: m.ownerName,
        siteAddress: m.siteAddress,
        ltpName: m.ltpName,
        ccIssueDate: m.orderIssuedDate,
        commencementDate: mappedStatus === "WORK_INITIATED" ? m.commencementDate : undefined,
        contractor: m.contractor || { name: "Unassigned", licenceNo: "-", phone: "-", address: "-" },
        siteSupervisor: "Er. M. Narayana (Site Engg)",
        workStage: mappedStatus === "WORK_INITIATED" ? "Foundation & Excavation" : "Site Clearance",
        sitePhotosCount: m.sitePhotosCount ?? 0,
        commencementNoticeUploaded: m.commencementNoticeUploaded ?? false,
        remarks: m.remarks ?? "",
      };
    });

    // Supplement with approved applications from store that are not yet in mock
    const approvedStoreApps = applications.filter((a) => a.status === "APPROVED");
    approvedStoreApps.forEach((app, idx) => {
      if (!baseItems.some((b) => b.applicationId === app.id || b.applicationNumber === app.applicationNo)) {
        const hasCC = idx % 2 === 0;
        baseItems.push({
          id: `wc-store-${app.id}`,
          commencementNumber: hasCC ? `COMM/2026/000${String(40 + idx).padStart(2, "0")}` : undefined,
          applicationId: app.id,
          applicationNumber: app.applicationNo,
          approvalOrderNumber: `BPO/2026/${app.applicationNo.replace(/[^0-9]/g, "").slice(-5) || "00188"}`,
          orderIssuedDate: new Date(app.lastUpdated || Date.now()).toISOString().slice(0, 10),
          status: hasCC ? "CC_ISSUED" : "PENDING_CC",
          ownerName: app.applicant?.name || "Applicant",
          siteAddress: app.project?.address || "Amaravati Capital City Area",
          ltpName: app.ltpName || "Licensed Technical Personnel",
          ccIssueDate: hasCC ? new Date(app.lastUpdated || Date.now()).toISOString().slice(0, 10) : undefined,
          commencementDate: undefined, // No work initiation date yet -> stays in CC tab
          contractor: {
            name: "Sri Venkateswara Infra & Builders",
            licenceNo: "CL/APCRDA/2024/0882",
            phone: "+91 98480 12345",
            address: "Ring Road, Vijayawada",
          },
          siteSupervisor: "K. Ranga Rao",
          workStage: "Awaiting Work Initiation",
          sitePhotosCount: 0,
          commencementNoticeUploaded: false,
          remarks: "Building permission order sanctioned. Ready for site work commencement.",
        });
      }
    });

    return baseItems;
  });

  // Modals state
  const [selectedCertificateRecord, setSelectedCertificateRecord] = React.useState<WorkCommencementItem | null>(null);
  const [selectedInitiationRecord, setSelectedInitiationRecord] = React.useState<WorkCommencementItem | null>(null);
  const [issueConfirmRecord, setIssueConfirmRecord] = React.useState<WorkCommencementItem | null>(null);
  const [progressUpdateRecord, setProgressUpdateRecord] = React.useState<WorkCommencementItem | null>(null);

  // Work Initiation Form state
  const [initiationDate, setInitiationDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [contractorName, setContractorName] = React.useState("");
  const [contractorLicence, setContractorLicence] = React.useState("");
  const [contractorPhone, setContractorPhone] = React.useState("");
  const [siteSupervisor, setSiteSupervisor] = React.useState("");
  const [workStageSelect, setWorkStageSelect] = React.useState("Excavation & Ground Breaking");
  const [siteRemarks, setSiteRemarks] = React.useState("");
  const [declarationAgreed, setDeclarationAgreed] = React.useState(true);

  // Open "Add Work Initiation Date" modal
  const handleOpenInitiationModal = (item: WorkCommencementItem) => {
    setSelectedInitiationRecord(item);
    setInitiationDate(new Date().toISOString().slice(0, 10));
    setContractorName(item.contractor?.name !== "Unassigned" ? item.contractor?.name : "Sri Venkateswara Infra & Builders");
    setContractorLicence(item.contractor?.licenceNo !== "-" ? item.contractor?.licenceNo : "CL/APCRDA/2024/0882");
    setContractorPhone(item.contractor?.phone !== "-" ? item.contractor?.phone : "+91 98480 12345");
    setSiteSupervisor(item.siteSupervisor || "Er. M. Narayana (Site Supervisor)");
    setWorkStageSelect("Excavation & Ground Breaking");
    setSiteRemarks("Notice of construction commencement filed. Site leveling and security fence completed. Ready for excavation.");
    setDeclarationAgreed(true);
  };

  // Submit Work Initiation Date -> MOVES RECORD TO WORK INITIATION TAB
  const handleSaveWorkInitiation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInitiationRecord) return;
    if (!declarationAgreed) {
      toast({
        title: "Declaration Required",
        description: "Please confirm the declaration of site commencement.",
        variant: "destructive",
      });
      return;
    }

    const updatedDate = initiationDate || new Date().toISOString().slice(0, 10);

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === selectedInitiationRecord.id) {
          return {
            ...rec,
            status: "WORK_INITIATED",
            commencementDate: updatedDate,
            contractor: {
              name: contractorName || rec.contractor.name,
              licenceNo: contractorLicence || rec.contractor.licenceNo,
              phone: contractorPhone || rec.contractor.phone,
              address: rec.contractor.address || "Vijayawada / Guntur",
            },
            siteSupervisor,
            workStage: workStageSelect,
            sitePhotosCount: Math.max(rec.sitePhotosCount, 2),
            commencementNoticeUploaded: true,
            remarks: siteRemarks || "Work officially initiated on site.",
          };
        }
        return rec;
      })
    );

    toast({
      title: "Work Initiation Date Recorded",
      description: `Permit ${selectedInitiationRecord.applicationNumber} has been updated with Initiation Date (${updatedDate}) and moved to Work Initiation.`,
    });

    setSelectedInitiationRecord(null);
    // Switch to Work Initiation tab so user sees the moved record!
    setActiveTab("work-initiated");
  };

  // Issue Commencement Certificate
  const handleIssueCertificate = (record: WorkCommencementItem) => {
    const today = new Date().toISOString().slice(0, 10);
    const newCCNo = record.commencementNumber || `COMM/2026/00${String(Math.floor(Math.random() * 800) + 100).padStart(3, "0")}`;

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === record.id) {
          return {
            ...rec,
            commencementNumber: newCCNo,
            ccIssueDate: today,
            status: "CC_ISSUED",
          };
        }
        return rec;
      })
    );

    toast({
      title: "Commencement Certificate Issued",
      description: `Certificate ${newCCNo} has been officially issued for ${record.applicationNumber}.`,
    });

    setIssueConfirmRecord(null);
  };

  // Split records into the two distinct tabs as specified by the user:
  // Tab 1 (cc-issued): Records awaiting work initiation date (status !== "WORK_INITIATED" or without commencementDate)
  // Tab 2 (work-initiated): Records with work initiation date added (status === "WORK_INITIATED" and commencementDate present)
  const ccRecords = React.useMemo(() => {
    return records.filter((r) => r.status !== "WORK_INITIATED" || !r.commencementDate);
  }, [records]);

  const initiatedRecords = React.useMemo(() => {
    return records.filter((r) => r.status === "WORK_INITIATED" && !!r.commencementDate);
  }, [records]);

  // Current tab items with search & stage filter applied
  const currentTabItems = React.useMemo(() => {
    const list = activeTab === "cc-issued" ? ccRecords : initiatedRecords;
    return list.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.applicationNumber.toLowerCase().includes(q) ||
        item.approvalOrderNumber.toLowerCase().includes(q) ||
        (item.commencementNumber && item.commencementNumber.toLowerCase().includes(q)) ||
        item.ownerName.toLowerCase().includes(q) ||
        item.siteAddress.toLowerCase().includes(q) ||
        item.contractor.name.toLowerCase().includes(q);

      const matchStage =
        stageFilter === "ALL" ||
        (stageFilter === "CC_ISSUED" && item.status === "CC_ISSUED") ||
        (stageFilter === "PENDING_CC" && item.status === "PENDING_CC") ||
        (stageFilter === "WORK_INITIATED" && item.status === "WORK_INITIATED");

      return matchQuery && matchStage;
    });
  }, [activeTab, ccRecords, initiatedRecords, searchQuery, stageFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Work Commencement Synced", description: "Registry data is up to date." });
    }, 400);
  };

  // Export CSV
  const exportCSV = () => {
    const isCC = activeTab === "cc-issued";
    const headers = isCC
      ? ["#", "Application No.", "BPO Sanction No.", "Commencement Cert No.", "Sanction Date", "CC Status", "Applicant", "Site Address"]
      : ["#", "Application No.", "BPO Sanction No.", "Commencement Cert No.", "Work Initiation Date", "Contractor", "Construction Stage", "Applicant", "Site Address"];

    const rows = currentTabItems.map((item, idx) =>
      isCC
        ? [
            idx + 1,
            `"${item.applicationNumber}"`,
            `"${item.approvalOrderNumber}"`,
            `"${item.commencementNumber || "Pending"}"`,
            item.orderIssuedDate,
            item.status === "CC_ISSUED" ? "CC Issued" : "Pending CC",
            `"${item.ownerName}"`,
            `"${item.siteAddress}"`,
          ]
        : [
            idx + 1,
            `"${item.applicationNumber}"`,
            `"${item.approvalOrderNumber}"`,
            `"${item.commencementNumber || "-"}"`,
            item.commencementDate || "-",
            `"${item.contractor.name}"`,
            `"${item.workStage || "Active"}"`,
            `"${item.ownerName}"`,
            `"${item.siteAddress}"`,
          ]
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Work_Commencement_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAF7F2] text-slate-800 overflow-hidden font-sans">
      {/* ── Submodule Tabs Navigation Bar (Spread across the screen) ── */}
      <div className="bg-white border-b border-[#EADBCE] px-3 sm:px-4 md:px-6 py-2.5 shadow-xs shrink-0 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-4xl mx-auto">
          {/* Tab 1: Commencement Certificate */}
          <button
            id="tab-cc-issued"
            onClick={() => {
              setActiveTab("cc-issued");
              setStageFilter("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-xs",
              activeTab === "cc-issued"
                ? "bg-[#801824] text-[#FDF6ED] ring-2 ring-[#801824]/20 shadow-md"
                : "bg-white text-slate-700 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <FileCheck2 className="size-4 shrink-0 text-amber-300" />
            <span className="text-sm">Commencement Certificate</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ml-1.5",
                activeTab === "cc-issued" ? "bg-white/20 text-white" : "bg-amber-100 text-[#801824] border border-amber-200"
              )}
            >
              {ccRecords.length}
            </span>
          </button>

          {/* Tab 2: Work Initiation */}
          <button
            id="tab-work-initiated"
            onClick={() => {
              setActiveTab("work-initiated");
              setStageFilter("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-xs",
              activeTab === "work-initiated"
                ? "bg-[#801824] text-[#FDF6ED] ring-2 ring-[#801824]/20 shadow-md"
                : "bg-white text-slate-700 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <HardHat className="size-4 shrink-0 text-amber-300" />
            <span className="text-sm">Work Initiation</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ml-1.5",
                activeTab === "work-initiated" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              )}
            >
              {initiatedRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-h-0 p-3 sm:p-4 md:p-5 flex flex-col gap-3 overflow-hidden">
        {/* Top Controls: Search, Filters & Action Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white p-3 rounded-xl border border-[#DCD5C8] shadow-2xs">
          {/* Left: Search input */}
          <div className="flex items-center gap-2 border border-[#DCD5C8] bg-[#FAF7F2]/60 rounded-full px-3.5 h-[34px] w-full sm:w-72 shadow-2xs focus-within:border-[#801824] focus-within:ring-2 focus-within:ring-[#801824]/10 transition-all">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "cc-issued" ? "Search proposal, CC No., owner..." : "Search initiated works, contractor..."}
              className="w-full bg-transparent text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Right: Quick Action Banner & Excel Export */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAF4EB] border border-[#DCD5C8] text-xs text-slate-700">
              <span className="font-semibold text-[#801824]">
                {activeTab === "cc-issued" ? "Certificate Issuance & Setup:" : "Active Works:"}
              </span>
              <span className="font-mono font-bold">{currentTabItems.length} Files</span>
            </div>

            <button
              onClick={handleRefresh}
              title="Refresh"
              className="p-2 rounded-lg border border-[#DCD5C8] bg-white hover:bg-[#F3EADF] text-[#801824] transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            </button>

            <button
              onClick={exportCSV}
              title="Export to CSV"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD5C8] bg-white hover:bg-[#F3EADF] text-emerald-800 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ── TABLE CONTAINER ── */}
        <div className="flex-1 min-h-0 rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#F5EBE1] text-[#801824] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="w-10 px-2.5 py-2.5 text-center font-bold">#</th>
                  <th className="w-40 px-3 py-2.5 whitespace-nowrap">Application No.</th>
                  <th className="w-36 px-3 py-2.5 whitespace-nowrap">Sanction (BPO) No.</th>
                  <th className="w-40 px-3 py-2.5 whitespace-nowrap">Commencement No.</th>

                  {activeTab === "cc-issued" ? (
                    <>
                      <th className="w-32 px-3 py-2.5 text-center whitespace-nowrap">Sanction Date</th>
                      <th className="w-32 px-3 py-2.5 text-center whitespace-nowrap">CC Status</th>
                      <th className="w-52 px-3 py-2.5">Owner &amp; Site Address</th>
                      <th className="w-48 px-3 py-2.5 text-center whitespace-nowrap">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="w-36 px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="size-3 text-[#801824]" />
                          <span>Work Initiation Date</span>
                        </div>
                      </th>
                      <th className="w-48 px-3 py-2.5">Contractor Details</th>
                      <th className="w-36 px-3 py-2.5 text-center whitespace-nowrap">Construction Stage</th>
                      <th className="w-44 px-3 py-2.5">Owner &amp; Site</th>
                      <th className="w-48 px-3 py-2.5 text-center whitespace-nowrap">Action</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DCD5C8] bg-white">
                {currentTabItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {activeTab === "cc-issued" ? (
                          <>
                            <FileCheck2 className="size-8 text-slate-300" />
                            <p className="font-semibold text-slate-600">No pending commencement certificates</p>
                            <p className="text-xs text-slate-400">All certificates have had their work initiation dates added and moved to Work Initiation.</p>
                          </>
                        ) : (
                          <>
                            <HardHat className="size-8 text-slate-300" />
                            <p className="font-semibold text-slate-600">No active works initiated yet</p>
                            <p className="text-xs text-slate-400">Add the Work Initiation Date on any file in the Commencement Certificate tab to move it here.</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTabItems.map((item, idx) => (
                    <tr key={item.id} className="divide-x divide-[#EFE7DC] hover:bg-[#FAF4EB] transition-colors">
                      <td className="px-2.5 py-2.5 text-center font-bold text-slate-500">{idx + 1}</td>

                      {/* Application No */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => openApplication(item.applicationId, "ltp-application-details")}
                          className="font-mono font-bold text-[#801824] hover:text-[#941C2B] hover:underline cursor-pointer text-left"
                          title="Click to view full application details"
                        >
                          {item.applicationNumber}
                        </button>
                      </td>

                      {/* Sanction BPO No */}
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap font-medium">
                        {item.approvalOrderNumber}
                      </td>

                      {/* Commencement Certificate No */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {item.commencementNumber ? (
                          <button
                            onClick={() => setSelectedCertificateRecord(item)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                            title="Click to view Official Certificate"
                          >
                            <Award className="size-3 text-emerald-600 shrink-0" />
                            <span>{item.commencementNumber}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Issue
                          </span>
                        )}
                      </td>

                      {/* Dynamic Columns based on active tab */}
                      {activeTab === "cc-issued" ? (
                        <>
                          {/* Order Date */}
                          <td className="px-3 py-2.5 text-center text-slate-600 font-mono whitespace-nowrap">
                            {item.orderIssuedDate}
                          </td>

                          {/* CC Status */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            {item.status === "CC_ISSUED" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                <span className="size-1.5 rounded-full bg-emerald-600" />
                                Certificate Issued
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                <span className="size-1.5 rounded-full bg-amber-500" />
                                Ready for Issue
                              </span>
                            )}
                          </td>

                          {/* Owner & Address */}
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-slate-800 leading-tight">{item.ownerName}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={item.siteAddress}>
                              {item.siteAddress}
                            </div>
                          </td>

                          {/* Actions: View Certificate / Issue CC / Add Work Initiation Date */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {item.status === "PENDING_CC" ? (
                                <button
                                  onClick={() => handleIssueCertificate(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                                  title="Issue Commencement Certificate"
                                >
                                  <Award className="size-3 text-amber-300" />
                                  <span>Issue CC</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setSelectedCertificateRecord(item)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#DCD5C8] bg-white hover:bg-[#F3EADF] text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                    title="View Certificate"
                                  >
                                    <Eye className="size-3 text-[#801824]" />
                                    <span>View CC</span>
                                  </button>

                                  {/* THE CORE ACTION: ADD WORK INITIATION DATE -> MOVES TO WORK INITIATION */}
                                  <button
                                    onClick={() => handleOpenInitiationModal(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                                    title="Add Work Initiation Date & Move to Work Initiation"
                                  >
                                    <CalendarClock className="size-3 text-amber-300" />
                                    <span>Add Initiation Date</span>
                                    <ArrowRight className="size-3 ml-0.5 text-amber-300" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Work Initiation Date Column */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                              <Calendar className="size-3 text-emerald-700" />
                              <span>{item.commencementDate}</span>
                            </span>
                          </td>

                          {/* Contractor Details */}
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-slate-800 leading-tight">{item.contractor.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.contractor.phone || item.contractor.licenceNo}
                            </div>
                          </td>

                          {/* Construction Stage */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <HardHat className="size-3 text-blue-600" />
                              <span>{item.workStage || "Active Construction"}</span>
                            </span>
                          </td>

                          {/* Owner & Site */}
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-slate-800 leading-tight">{item.ownerName}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={item.siteAddress}>
                              {item.siteAddress}
                            </div>
                          </td>

                          {/* Actions: View Certificate / Update Progress / View Details */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedCertificateRecord(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#DCD5C8] bg-white hover:bg-[#F3EADF] text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                title="View Commencement Certificate"
                              >
                                <Award className="size-3 text-emerald-700" />
                                <span>CC</span>
                              </button>

                              <button
                                onClick={() => setProgressUpdateRecord(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAF4EB] hover:bg-[#EFE3D5] text-[#801824] border border-[#DCD5C8] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                                title="Update Construction Milestone & Site Photos"
                              >
                                <Camera className="size-3 text-[#801824]" />
                                <span>Progress ({item.sitePhotosCount})</span>
                              </button>

                              <button
                                onClick={() => openApplication(item.applicationId, "ltp-application-details")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                                title="Open Application Details"
                              >
                                <span>Details</span>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-700 font-bold">[1]</span>
              <span className="text-slate-500">
                {activeTab === "cc-issued" ? "Commencement Certificates Register" : "Active Construction Kickoff Register"}
              </span>
            </div>
            <div className="font-medium text-slate-600">
              Total Proposals : <strong className="text-slate-900">{currentTabItems.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: ADD WORK INITIATION DATE (THE CORE TRANSITION) ── */}
      {selectedInitiationRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#801824] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#801824] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <CalendarClock className="size-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    Add Work Initiation Date
                  </h3>
                  <p className="text-[11px] text-amber-200/90 font-mono">
                    Record construction kickoff &amp; move to Work Initiation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInitiationRecord(null)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveWorkInitiation} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Reference Info Card */}
              <div className="bg-white border border-[#DCD5C8] rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Application No.</span>
                  <span className="font-mono font-bold text-[#801824]">{selectedInitiationRecord.applicationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">BPO Sanction No.</span>
                  <span className="font-mono font-bold text-slate-800">{selectedInitiationRecord.approvalOrderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Commencement Cert.</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedInitiationRecord.commencementNumber || "Issued"}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Site Location</span>
                  <span className="text-slate-700 font-medium">{selectedInitiationRecord.siteAddress}</span>
                </div>
              </div>

              {/* Work Initiation Date (Mandatory) */}
              <div className="bg-[#FFFDF9] border-2 border-emerald-600/40 rounded-lg p-4 space-y-2">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="size-4 text-emerald-700" />
                  <span>Work Initiation Date (Date of Breaking Ground / Construction Kickoff) *</span>
                </label>
                <p className="text-[11px] text-slate-600">
                  Enter the actual date construction operations commenced or are scheduled to begin on site.
                </p>
                <input
                  type="date"
                  required
                  value={initiationDate}
                  onChange={(e) => setInitiationDate(e.target.value)}
                  className="w-full sm:w-64 h-9 px-3 bg-white border border-[#DCD5C8] rounded-lg font-mono font-bold text-sm text-[#801824] focus:outline-none focus:ring-2 focus:ring-[#801824]"
                />
              </div>

              {/* Contractor & Supervision Details */}
              <div className="bg-white border border-[#DCD5C8] rounded-lg p-4 space-y-3 shadow-2xs">
                <h4 className="font-bold text-xs text-[#801824] uppercase tracking-wide flex items-center gap-1.5">
                  <HardHat className="size-3.5" />
                  <span>Appointed Contractor &amp; Supervision Agency</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contractor / Agency Name</label>
                    <input
                      type="text"
                      value={contractorName}
                      onChange={(e) => setContractorName(e.target.value)}
                      placeholder="e.g. Sri Venkateswara Infra"
                      className="w-full h-8 px-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contractor Registration / Licence No.</label>
                    <input
                      type="text"
                      value={contractorLicence}
                      onChange={(e) => setContractorLicence(e.target.value)}
                      placeholder="e.g. CL/APCRDA/2024/0882"
                      className="w-full h-8 px-2.5 bg-white border border-[#DCD5C8] rounded font-mono text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contractor Phone Contact</label>
                    <input
                      type="text"
                      value={contractorPhone}
                      onChange={(e) => setContractorPhone(e.target.value)}
                      placeholder="+91 98480 12345"
                      className="w-full h-8 px-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Initial Work Stage</label>
                    <select
                      value={workStageSelect}
                      onChange={(e) => setWorkStageSelect(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-slate-800"
                    >
                      <option value="Site Clearing & Mobilization">Site Clearing &amp; Mobilization</option>
                      <option value="Excavation & Ground Breaking">Excavation &amp; Ground Breaking</option>
                      <option value="Foundation & Footing Works">Foundation &amp; Footing Works</option>
                      <option value="Plinth Beam Construction">Plinth Beam Construction</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Site Remarks / Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Site Commencement Remarks
                </label>
                <textarea
                  rows={2}
                  value={siteRemarks}
                  onChange={(e) => setSiteRemarks(e.target.value)}
                  placeholder="Notes on boundary demarcations, display board erection, soil investigation..."
                  className="w-full p-2.5 bg-white border border-[#DCD5C8] rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#801824]"
                />
              </div>

              {/* Declaration Checkbox */}
              <div className="bg-[#FAF4EB] border border-[#DCD5C8] rounded-lg p-3 flex items-start gap-2.5">
                <input
                  id="dec-commence"
                  type="checkbox"
                  checked={declarationAgreed}
                  onChange={(e) => setDeclarationAgreed(e.target.checked)}
                  className="mt-0.5 size-4 accent-[#801824] rounded cursor-pointer"
                />
                <label htmlFor="dec-commence" className="text-[11px] text-slate-700 leading-relaxed cursor-pointer select-none">
                  <strong>Declaration:</strong> I hereby certify that construction operations on this plot are being commenced in strict adherence to the APCRDA Sanctioned Building Plans and statutory building bye-law conditions.
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCD5C8]">
                <button
                  type="button"
                  onClick={() => setSelectedInitiationRecord(null)}
                  className="px-4 py-2 rounded-lg border border-[#DCD5C8] bg-white hover:bg-[#F3EADF] text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Check className="size-4" />
                  <span>Save &amp; Move to Work Initiation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: OFFICIAL APCRDA COMMENCEMENT CERTIFICATE ── */}
      {selectedCertificateRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#801824] rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#801824] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Award className="size-5 text-amber-300" />
                <span className="font-bold text-sm tracking-wide">Official APCRDA Commencement Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedCertificateRecord(null)}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Certificate Body (Official Document Styling) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-800 bg-[#FFFDF9]">
              {/* Document Header with APCRDA Seal */}
              <div className="text-center pb-4 border-b-2 border-[#801824] space-y-1">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-[#801824]/10 border-2 border-[#801824] mb-1">
                  <Building2 className="size-7 text-[#801824]" />
                </div>
                <h2 className="text-base font-black uppercase text-[#801824] tracking-wider">
                  Andhra Pradesh Capital Region Development Authority
                </h2>
                <p className="text-[11px] text-slate-600 font-serif italic">
                  Government of Andhra Pradesh • Vijayawada
                </p>
                <div className="inline-block px-3 py-1 mt-2 rounded bg-[#FAF4EB] border border-[#DCD5C8] font-mono font-bold text-xs text-[#801824]">
                  FORM - VI: COMMENCEMENT CERTIFICATE
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  [Issued under Section 85 of APCRDA Act 2014 &amp; AP Building Rules]
                </p>
              </div>

              {/* Certificate Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-3.5 rounded-lg border border-[#DCD5C8] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Certificate No.</span>
                  <span className="font-bold text-[#801824]">{selectedCertificateRecord.commencementNumber || "COMM/2026/00028"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Date of Issue</span>
                  <span className="font-bold text-slate-800">{selectedCertificateRecord.ccIssueDate || selectedCertificateRecord.orderIssuedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Sanction Order</span>
                  <span className="font-bold text-slate-800">{selectedCertificateRecord.approvalOrderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Proposal No.</span>
                  <span className="font-bold text-slate-800">{selectedCertificateRecord.applicationNumber}</span>
                </div>
              </div>

              {/* Certificate Authorization Text */}
              <div className="space-y-3 leading-relaxed text-slate-700 bg-white p-4 rounded-lg border border-[#DCD5C8]">
                <p>
                  Permission is hereby granted to <strong>{selectedCertificateRecord.ownerName}</strong> to commence erection / construction of the building situated at:
                </p>
                <p className="bg-[#FAF7F2] p-2.5 rounded font-medium border border-[#EADBCE] text-[#801824]">
                  <MapPin className="size-3.5 inline mr-1 text-[#801824]" />
                  {selectedCertificateRecord.siteAddress}
                </p>
                <p>
                  In accordance with the plans sanctioned vide Building Permission Order No. <strong>{selectedCertificateRecord.approvalOrderNumber}</strong> dated <strong>{selectedCertificateRecord.orderIssuedDate}</strong>, under the technical supervision of Licensed Technical Personnel <strong>{selectedCertificateRecord.ltpName}</strong>.
                </p>
              </div>

              {/* Statutory Conditions Box */}
              <div className="bg-[#FFFDF9] border border-[#DCD5C8] rounded-lg p-4 space-y-2 text-[11px] text-slate-600">
                <h4 className="font-bold text-xs text-[#801824] uppercase tracking-wide">
                  Statutory Conditions of Work Commencement:
                </h4>
                <ol className="list-decimal list-inside space-y-1 leading-normal">
                  <li>Display Board (3ft x 2ft) indicating the BPO number, CC number, date, and plot boundaries must be erected at site.</li>
                  <li>Notice of Plinth Casting must be sent to APCRDA Town Planning section upon reaching plinth level prior to casting concrete.</li>
                  <li>Front, rear, and side setback spaces must be maintained without any unauthorized deviations or projections.</li>
                  <li>Rainwater harvesting pit and soak pit structures must be executed as per sanctioned cross-sections.</li>
                  <li>Safety barricades and protective mesh must be installed around open excavation pits to ensure public safety.</li>
                </ol>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-6 border-t border-[#DCD5C8] flex items-end justify-between">
                <div className="space-y-1">
                  <div className="size-16 rounded border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    [QR CODE]
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">Digitally Verified Document</span>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic font-bold text-[#801824] text-sm">A Jyotheeswar Reddy</div>
                  <div className="font-bold text-slate-900 text-xs">Commissioner / Competent Authority</div>
                  <div className="text-[10px] text-slate-500">Andhra Pradesh Capital Region Development Authority</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#FAF4EB] border-t border-[#DCD5C8] px-5 py-3 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-mono">Official APCRDA Digital Record</span>
              <button
                type="button"
                onClick={() => setSelectedCertificateRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PROGRESS UPDATE ON INITIATED WORK ── */}
      {progressUpdateRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#801824] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            <div className="bg-[#801824] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="size-4 text-amber-300" />
                <span className="font-bold text-sm">Update Site Progress &amp; Photos</span>
              </div>
              <button
                onClick={() => setProgressUpdateRecord(null)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#DCD5C8]">
                <div className="font-mono font-bold text-[#801824]">{progressUpdateRecord.applicationNumber}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{progressUpdateRecord.siteAddress}</div>
                <div className="text-slate-500 text-[11px] mt-1 font-mono">
                  Initiated On: <strong className="text-slate-800">{progressUpdateRecord.commencementDate}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Construction Milestone</label>
                <select
                  defaultValue={progressUpdateRecord.workStage || "Excavation & Ground Breaking"}
                  className="w-full h-8 px-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-slate-800"
                >
                  <option value="Excavation & Ground Breaking">Excavation &amp; Ground Breaking</option>
                  <option value="Foundation & Footing Works">Foundation &amp; Footing Works</option>
                  <option value="Plinth Beam Construction">Plinth Beam Construction</option>
                  <option value="Ground Floor Column Casting">Ground Floor Column Casting</option>
                  <option value="First Floor Slab Complete">First Floor Slab Complete</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Site Progress Photos</label>
                <div className="border-2 border-dashed border-[#DCD5C8] rounded-lg p-4 text-center bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] cursor-pointer">
                  <Camera className="size-6 mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-slate-700 text-xs">Click to upload geo-tagged site photos</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG up to 10MB</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCD5C8]">
                <button
                  type="button"
                  onClick={() => setProgressUpdateRecord(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#DCD5C8] text-slate-700 font-bold text-xs hover:bg-[#FAF4EB] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Progress Updated",
                      description: `Construction progress updated for ${progressUpdateRecord.applicationNumber}.`,
                    });
                    setProgressUpdateRecord(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs shadow-2xs cursor-pointer"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
