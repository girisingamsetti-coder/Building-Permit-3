"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAllShortfalls } from "@/store/app-store";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import {
  ShieldAlert,
  AlertTriangle,
  FileWarning,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Eye,
  Download,
  Search,
  Filter,
  ArrowRight,
  UploadCloud,
  Gavel,
  FileText,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers,
  MapPin,
  X,
  FileCheck,
  AlertCircle,
  FolderOpen,
  MessageSquare,
  BadgeCheck,
  CalendarClock,
  User,
  Phone,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SHOW_CAUSES, type ShowCauseRecord } from "@/data/modules-data";
import type { Application, Shortfall } from "@/types";

export type ComplianceTabKey =
  | "verified"
  | "shortfall"
  | "review-shortfall-submission"
  | "show-cause"
  | "review-show-cause-submission";

interface LtpComplianceViewProps {
  initialTab?: string;
}

export function LtpComplianceView({ initialTab }: LtpComplianceViewProps) {
  const { navigate, openApplication, respondToShortfall, setLtpActiveMenu } = useAppStore();
  const { applications } = useDashboardScope();
  const { toast } = useToast();

  // Normalize initialTab to a valid tab or default to 'verified'
  const resolveTab = (tab?: string): ComplianceTabKey => {
    switch (tab) {
      case "shortfall":
        return "shortfall";
      case "review-shortfall-submission":
        return "review-shortfall-submission";
      case "show-cause":
        return "show-cause";
      case "review-show-cause-submission":
        return "review-show-cause-submission";
      case "verified":
      case "proceeding-status":
      default:
        return "verified";
    }
  };

  const [activeTab, setActiveTab] = React.useState<ComplianceTabKey>(resolveTab(initialTab));

  // Sync when prop changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveTab(initialTab));
    }
  }, [initialTab]);

  const handleTabChange = (tab: ComplianceTabKey) => {
    setActiveTab(tab);
    setLtpActiveMenu(tab);
  };

  // ── Global Search & Filter state ──
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  // ── Shortfalls data & state ──
  const storeShortfalls = useAllShortfalls();
  const [selectedShortfall, setSelectedShortfall] = React.useState<(Shortfall & { application?: Application }) | null>(null);
  const [shortfallModalOpen, setShortfallModalOpen] = React.useState(false);
  const [shortfallReplyText, setShortfallReplyText] = React.useState("");
  const [shortfallAttachedFile, setShortfallAttachedFile] = React.useState<string | null>(null);
  const [submissionDrawerItem, setSubmissionDrawerItem] = React.useState<any | null>(null);

  // ── Show Cause data & state ──
  const [showCauses, setShowCauses] = React.useState<ShowCauseRecord[]>(MOCK_SHOW_CAUSES);
  const [selectedShowCause, setSelectedShowCause] = React.useState<ShowCauseRecord | null>(null);
  const [showCauseReplyOpen, setShowCauseReplyOpen] = React.useState(false);
  const [showCauseViewDirectiveOpen, setShowCauseViewDirectiveOpen] = React.useState(false);
  const [showCauseExplanationText, setShowCauseExplanationText] = React.useState("");
  const [showCauseEvidenceFile, setShowCauseEvidenceFile] = React.useState<string | null>(null);
  const [viewExplanationRecord, setViewExplanationRecord] = React.useState<ShowCauseRecord | null>(null);

  // ── Verified files data & modal ──
  const [selectedVerifiedApp, setSelectedVerifiedApp] = React.useState<Application | null>(null);
  const [scrutinySheetOpen, setScrutinySheetOpen] = React.useState(false);

  // Compute Verified applications from store + seed
  const verifiedApps = React.useMemo(() => {
    return applications.filter((app) => {
      // Eligible if scrutiny passed or documents verified or review stage cleared
      const hasPassedScrutiny =
        app.scrutinyReport?.status === "PASSED" ||
        app.scrutinyReport?.status === "PASSED_WITH_WARNINGS";
      const isAdvancedStatus = [
        "SCRUTINY_PASSED",
        "DOCUMENT_VERIFICATION",
        "FEE_GENERATED",
        "PAYMENT_PENDING",
        "PAYMENT_SUCCESS",
        "ZONAL_HEAD_REVIEW",
        "DIRECTOR_REVIEW",
        "APPROVED",
      ].includes(app.status);
      const hasVerifiedDocs = app.documents?.some((d) => d.status === "VERIFIED");
      return (
        (hasPassedScrutiny || isAdvancedStatus || hasVerifiedDocs) &&
        app.status !== "DRAFT" &&
        app.status !== "SCRUTINY_FAILED"
      );
    });
  }, [applications]);

  // Compute stats
  const stats = React.useMemo(() => {
    const totalVerified = verifiedApps.length;
    const openShortfalls = storeShortfalls.filter(
      (s) => s.status === "OPEN" || s.status === "REOPENED" || s.status === "OVERDUE"
    ).length;
    const submittedShortfalls = storeShortfalls.filter(
      (s) => s.status === "RESPONDED" || s.status === "UNDER_REVIEW" || !!s.response
    ).length;
    const activeShowCauses = showCauses.filter(
      (s) => s.status === "AWAITING_RESPONSE" || s.status === "OPEN"
    ).length;
    const submittedShowCauses = showCauses.filter(
      (s) => !!s.applicantExplanation || s.status === "CLOSED"
    ).length;

    return {
      totalVerified,
      openShortfalls,
      submittedShortfalls,
      activeShowCauses,
      submittedShowCauses,
    };
  }, [verifiedApps, storeShortfalls, showCauses]);

  // Handle Shortfall Reply Submission
  const handleSubmitShortfallReply = () => {
    if (!selectedShortfall) return;
    if (!shortfallReplyText.trim()) {
      toast({
        title: "Explanation required",
        description: "Please enter your compliance reply text before submitting.",
        variant: "destructive",
      });
      return;
    }

    const docName = shortfallAttachedFile || "Compliance_Document.pdf";
    respondToShortfall(
      selectedShortfall.applicationId,
      selectedShortfall.id,
      shortfallReplyText,
      docName
    );

    toast({
      title: "Shortfall Compliance Submitted",
      description: `Your response for ${selectedShortfall.shortfallId} has been submitted for scrutiny review.`,
    });

    setShortfallModalOpen(false);
    setShortfallReplyText("");
    setShortfallAttachedFile(null);
    setSelectedShortfall(null);
  };

  // Handle Show Cause Reply Submission
  const handleSubmitShowCauseReply = () => {
    if (!selectedShowCause) return;
    if (!showCauseExplanationText.trim()) {
      toast({
        title: "Explanation required",
        description: "Please enter your formal written explanation before submitting.",
        variant: "destructive",
      });
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const updated = showCauses.map((item) => {
      if (item.id === selectedShowCause.id) {
        return {
          ...item,
          status: "OPEN" as const,
          responseDate: todayStr,
          applicantExplanation: showCauseExplanationText,
        };
      }
      return item;
    });

    setShowCauses(updated);
    toast({
      title: "Show Cause Explanation Filed",
      description: `Formal explanation filed against ${selectedShowCause.noticeNumber}. Hearing schedule will be notified.`,
    });

    setShowCauseReplyOpen(false);
    setShowCauseExplanationText("");
    setShowCauseEvidenceFile(null);
    setSelectedShowCause(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAF7F2] text-slate-800 overflow-y-auto">
      {/* ── Submodule Tabs Navigation & Quick Metrics (No Duplicate Header) ── */}
      <div className="bg-white border-b border-[#EADBCE] px-4 sm:px-6 py-3 shadow-xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Submodule Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => handleTabChange("verified")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "verified"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <FileCheck className="size-3.5 shrink-0" />
            <span>DCR & Document Verified</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "verified" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {stats.totalVerified}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("shortfall")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "shortfall"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Shortfall Notices</span>
            {stats.openShortfalls > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  activeTab === "shortfall" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                )}
              >
                {stats.openShortfalls}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("review-shortfall-submission")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "review-shortfall-submission"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <Send className="size-3.5 shrink-0" />
            <span>Shortfall Compliance Submissions</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "review-shortfall-submission" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
              )}
            >
              {stats.submittedShortfalls}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("show-cause")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "show-cause"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <Gavel className="size-3.5 shrink-0" />
            <span>Show Cause Directives</span>
            {stats.activeShowCauses > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  activeTab === "show-cause" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
                )}
              >
                {stats.activeShowCauses}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("review-show-cause-submission")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === "review-show-cause-submission"
                ? "bg-[#801824] text-[#FDF6ED] shadow-xs"
                : "bg-white text-slate-600 hover:bg-[#F3EADF] hover:text-[#801824] border border-[#EADBCE]"
            )}
          >
            <FileText className="size-3.5 shrink-0" />
            <span>Show Cause Explanations</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "review-show-cause-submission" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              )}
            >
              {stats.submittedShowCauses}
            </span>
          </button>
        </div>
      </div>

      {/* ── Main Tab Content ── */}
      <div className="p-6 space-y-6">
        {/* ─── TAB 1: DCR & Document Verified Files ─── */}
        {activeTab === "verified" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#EADBCE] shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder=""
                  className="h-9 pl-9 text-xs border-[#EADBCE] focus-visible:ring-[#801824]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-slate-500">
                  Showing {verifiedApps.length} verified applications
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[#EADBCE] bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#801824]/5 border-b border-[#EADBCE] text-[#5C1A20] font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Proposal / BA No.</th>
                      <th className="px-4 py-3.5">Project & Type</th>
                      <th className="px-4 py-3.5">Applicant Name</th>
                      <th className="px-4 py-3.5">DCR Automated Scrutiny</th>
                      <th className="px-4 py-3.5">Document Verification</th>
                      <th className="px-4 py-3.5">Current Stage</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verifiedApps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <FolderOpen className="size-8 mx-auto mb-2 text-slate-300" />
                          No verified files found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      verifiedApps.map((app) => (
                        <tr key={app.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => openApplication(app.id, "ltp-application-details")}
                              className="font-mono font-bold text-[#801824] hover:text-[#941C2B] hover:underline cursor-pointer text-left block"
                              title="Click to view file details"
                            >
                              {app.applicationNo}
                            </button>
                            <span className="text-[11px] text-slate-400">
                              {new Date(app.lastUpdated).toLocaleDateString("en-IN")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800">{app.project.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal border-slate-200">
                                {app.project.propertyType}
                              </Badge>
                              <span className="text-[11px] text-slate-500">{app.project.plotArea} sq.m</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            <div className="font-medium">{app.applicant.name}</div>
                            <div className="text-[11px] text-slate-400">{app.applicant.contact}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                              <BadgeCheck className="size-4 text-emerald-600 shrink-0" />
                              <span>Rules Passed (DCR)</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              FAR, Setbacks, Height Verified
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              <span>Docs Cleared</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Title, Geo & Structural NOC Clear
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className="bg-[#801824]/10 text-[#801824] hover:bg-[#801824]/15 border-0 font-semibold text-[10px]">
                              {app.currentStageLabel ?? "In Review Proceeding"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVerifiedApp(app);
                                setScrutinySheetOpen(true);
                              }}
                              className="h-7 text-xs border-[#EADBCE] text-slate-700 hover:bg-[#F3EADF] gap-1"
                            >
                              <FileText className="size-3" /> Scrutiny Sheet
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openApplication(app.id, "ltp-application-details")}
                              className="h-7 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1"
                            >
                              View <ArrowRight className="size-3" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Shortfall Notices ─── */}
        {activeTab === "shortfall" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#EADBCE] shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder=""
                  className="h-9 pl-9 text-xs border-[#EADBCE] focus-visible:ring-[#801824]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs w-36 border-[#EADBCE]">
                    <Filter className="size-3.5 mr-1.5 text-slate-400" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="OPEN">Open (Action Needed)</SelectItem>
                    <SelectItem value="RESPONDED">Responded</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shortfalls List / Cards */}
            <div className="space-y-3">
              {storeShortfalls
                .filter((sf) => {
                  const matchQuery =
                    !searchQuery ||
                    sf.shortfallId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sf.applicationNo.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchStatus = statusFilter === "ALL" || sf.status === statusFilter;
                  return matchQuery && matchStatus;
                })
                .map((sf) => {
                  const isOpen = sf.status === "OPEN" || sf.status === "REOPENED" || sf.status === "OVERDUE";
                  return (
                    <div
                      key={sf.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all bg-white shadow-2xs hover:shadow-sm",
                        isOpen ? "border-amber-200 bg-amber-50/15" : "border-[#EADBCE]"
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#801824] bg-[#801824]/10 px-2 py-0.5 rounded">
                              {sf.shortfallId}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              File: <strong className="text-slate-700">{sf.applicationNo}</strong>
                            </span>
                            <Badge
                              className={cn(
                                "text-[10px] uppercase font-bold",
                                sf.status === "OPEN"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : sf.status === "RESOLVED"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-blue-100 text-blue-900 border-blue-300"
                              )}
                            >
                              {sf.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] text-slate-600">
                              {sf.type} SHORTFALL
                            </Badge>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900">{sf.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EADBCE]/80">
                            {sf.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <User className="size-3 text-slate-400" />
                              Raised by: <strong className="text-slate-700">{sf.raisedBy.name}</strong> ({sf.raisedBy.role})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-slate-400" />
                              Notice Date: {new Date(sf.raisedAt).toLocaleDateString("en-IN")}
                            </span>
                            <span className="flex items-center gap-1 text-amber-700 font-medium">
                              <Clock className="size-3" />
                              Compliance Due: {new Date(sf.dueDate).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                          {isOpen ? (
                            <Button
                              onClick={() => {
                                setSelectedShortfall(sf);
                                setShortfallModalOpen(true);
                              }}
                              className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-8 px-4 gap-1.5 shadow-xs"
                            >
                              <Send className="size-3" /> Submit Compliance
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSubmissionDrawerItem(sf);
                              }}
                              className="border-[#EADBCE] text-slate-700 hover:bg-[#F3EADF] text-xs h-8 px-3 gap-1.5"
                            >
                              <Eye className="size-3" /> View Response
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openApplication(sf.applicationId, "ltp-application-details")}
                            className="text-xs text-slate-500 hover:text-slate-800 h-7"
                          >
                            Open File <ExternalLink className="size-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {storeShortfalls.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-[#EADBCE]">
                  <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No active shortfall notices found</p>
                  <p className="text-xs text-slate-400 mt-1">All applications are clear of pending deficiencies.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: Shortfall Compliance Submissions ─── */}
        {activeTab === "review-shortfall-submission" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-2xs">
              <h2 className="text-sm font-bold text-[#5C1A20] mb-1">
                Compliance Submissions Awaiting Scrutiny Officer Verification
              </h2>
              <p className="text-xs text-slate-500">
                Responses and rectified documents submitted by LTP/Applicant currently in queue for officer clearance.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#EADBCE] bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#801824]/5 border-b border-[#EADBCE] text-[#5C1A20] font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3.5">Shortfall Ref & File</th>
                      <th className="px-4 py-3.5">Deficiency Subject</th>
                      <th className="px-4 py-3.5">LTP Compliance Statement</th>
                      <th className="px-4 py-3.5">Attached Evidence</th>
                      <th className="px-4 py-3.5">Reviewing Officer</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeShortfalls
                      .filter((s) => s.status === "RESPONDED" || s.status === "UNDER_REVIEW" || !!s.response || s.status === "RESOLVED")
                      .map((sf) => (
                        <tr key={sf.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-[#801824] block">{sf.shortfallId}</span>
                            <span className="font-mono text-[11px] text-slate-500">{sf.applicationNo}</span>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-800 max-w-[200px] truncate" title={sf.title}>
                            {sf.title}
                          </td>
                          <td className="px-4 py-3.5 max-w-[260px]">
                            <p className="text-slate-600 line-clamp-2 text-[11px]">
                              {sf.response?.text ?? "Rectification plan and signed documentation uploaded as instructed."}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Submitted: {sf.response?.respondedAt ? new Date(sf.response.respondedAt).toLocaleDateString("en-IN") : "Recent"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#FAF7F2] border border-[#EADBCE] text-[11px] text-slate-700">
                              <FileText className="size-3 text-[#801824]" />
                              <span className="font-mono">{sf.response?.supportingDocument ?? "Revised_Drawing_v2.dwg"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            <div className="font-medium">{sf.raisedBy.name}</div>
                            <div className="text-[10px] text-slate-400">{sf.raisedBy.role}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              className={cn(
                                "text-[10px] font-bold uppercase",
                                sf.status === "RESOLVED"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-blue-100 text-blue-900 border-blue-300"
                              )}
                            >
                              {sf.status === "RESOLVED" ? "Cleared & Resolved" : "Under Officer Review"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSubmissionDrawerItem(sf)}
                              className="h-7 text-xs border-[#EADBCE] text-slate-700 hover:bg-[#F3EADF] gap-1"
                            >
                              <Eye className="size-3" /> View Log
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: Show Cause Directives ─── */}
        {activeTab === "show-cause" && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
                  <Gavel className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-rose-950">Statutory Section 53 Directives</h2>
                  <p className="text-xs text-rose-700/80">
                    Formal directives requiring immediate written explanation or personal hearing representation.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-rose-300 text-rose-800 text-xs px-2.5 py-1">
                {showCauses.length} Directives on Record
              </Badge>
            </div>

            {/* Directives Cards */}
            <div className="space-y-3">
              {showCauses.map((sc) => {
                const isAwaiting = sc.status === "AWAITING_RESPONSE" || sc.status === "OPEN";
                return (
                  <div
                    key={sc.id}
                    className={cn(
                      "rounded-xl border p-4 bg-white shadow-2xs transition-all",
                      isAwaiting ? "border-rose-200 ring-1 ring-rose-200/50" : "border-[#EADBCE]"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            {sc.noticeNumber}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            App No: <strong className="text-slate-800">{sc.applicationNumber}</strong>
                          </span>
                          <Badge
                            className={cn(
                              "text-[10px] font-bold uppercase",
                              sc.status === "AWAITING_RESPONSE"
                                ? "bg-rose-100 text-rose-900 border-rose-300"
                                : sc.status === "CLOSED"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-amber-100 text-amber-900 border-amber-300"
                            )}
                          >
                            {sc.status.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {sc.section}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Alleged Statutory Violation:</h3>
                          <p className="text-xs text-rose-950 font-medium bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 mt-1">
                            {sc.violation}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-slate-400" />
                            Site: {sc.siteAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-slate-400" />
                            Issued: {sc.issuedDate}
                          </span>
                          <span className="flex items-center gap-1 text-rose-700 font-semibold">
                            <CalendarClock className="size-3" />
                            Due Date: {sc.responseDueDate}
                          </span>
                          {sc.hearingScheduledDate && (
                            <span className="flex items-center gap-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              <Gavel className="size-3" />
                              Hearing: {sc.hearingScheduledDate}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                        {isAwaiting ? (
                          <Button
                            onClick={() => {
                              setSelectedShowCause(sc);
                              setShowCauseReplyOpen(true);
                            }}
                            className="bg-rose-800 hover:bg-rose-900 text-white text-xs h-8 px-4 gap-1.5 shadow-xs"
                          >
                            <Send className="size-3" /> File Explanation
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setViewExplanationRecord(sc)}
                            className="border-[#EADBCE] text-slate-700 hover:bg-[#F3EADF] text-xs h-8 px-3 gap-1.5"
                          >
                            <Eye className="size-3" /> View Record
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedShowCause(sc);
                            setShowCauseViewDirectiveOpen(true);
                          }}
                          className="text-xs border-[#EADBCE] text-slate-600 hover:bg-slate-50 h-7"
                        >
                          <FileText className="size-3 mr-1" /> View Directive
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 5: Show Cause Explanations ─── */}
        {activeTab === "review-show-cause-submission" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-2xs">
              <h2 className="text-sm font-bold text-[#5C1A20] mb-1">
                Filed Explanations & Hearing Minutes Registry
              </h2>
              <p className="text-xs text-slate-500">
                Permanent legal record of replies, affidavits, site photographs and hearing outcomes filed under Section 53.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#EADBCE] bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#801824]/5 border-b border-[#EADBCE] text-[#5C1A20] font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3.5">Directive Ref & File</th>
                      <th className="px-4 py-3.5">Applicant / Owner</th>
                      <th className="px-4 py-3.5">Filed Explanation</th>
                      <th className="px-4 py-3.5">Hearing Date</th>
                      <th className="px-4 py-3.5">Competent Authority Decision</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Proceedings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {showCauses
                      .filter((n) => !!n.applicantExplanation || n.status === "CLOSED" || n.responseDate)
                      .map((sc) => (
                        <tr key={sc.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-rose-900 block">{sc.noticeNumber}</span>
                            <span className="font-mono text-[11px] text-slate-500">{sc.applicationNumber}</span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            <div className="font-medium">{sc.ownerName}</div>
                            <div className="text-[10px] text-slate-400">LTP: {sc.ltpName}</div>
                          </td>
                          <td className="px-4 py-3.5 max-w-[280px]">
                            <p className="text-slate-700 line-clamp-2 text-[11px]">
                              {sc.applicantExplanation ?? "Explanation and photographic evidence submitted for review."}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Filed: {sc.responseDate ?? "Submitted"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {sc.hearingScheduledDate ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                                <Calendar className="size-3" /> {sc.hearingScheduledDate}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No personal hearing</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 max-w-[220px]">
                            {sc.decisionRemarks ? (
                              <p className="text-emerald-800 text-[11px] font-medium line-clamp-2">
                                {sc.decisionRemarks}
                              </p>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Pending Hearing Officer Review</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              className={cn(
                                "text-[10px] font-bold uppercase",
                                sc.status === "CLOSED"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-amber-100 text-amber-900 border-amber-300"
                              )}
                            >
                              {sc.status === "CLOSED" ? "Notice Closed" : "Under Hearing"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewExplanationRecord(sc)}
                              className="h-7 text-xs border-[#EADBCE] text-slate-700 hover:bg-[#F3EADF] gap-1"
                            >
                              <FileText className="size-3" /> View Record
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: Submit Shortfall Compliance ─── */}
      <Dialog open={shortfallModalOpen} onOpenChange={setShortfallModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-[#EADBCE]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <AlertTriangle className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Shortfall Rectification</span>
            </div>
            <DialogTitle className="text-[#5C1A20] text-base">
              Submit Compliance for {selectedShortfall?.shortfallId}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide your written explanation and attach the rectified document / drawing as required by the scrutiny officer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EADBCE]">
              <span className="text-[11px] font-bold text-slate-700 block">Deficiency Notice:</span>
              <p className="text-xs text-slate-600 mt-0.5">{selectedShortfall?.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 italic">{selectedShortfall?.description}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Compliance Statement / Rectification Explanation <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={4}
                value={shortfallReplyText}
                onChange={(e) => setShortfallReplyText(e.target.value)}
                placeholder="Detail the corrections made, revised drawing versions, or statutory clarifications…"
                className="text-xs border-[#EADBCE] focus-visible:ring-[#801824]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Attach Rectified Document / Drawing</label>
              <div className="border-2 border-dashed border-[#EADBCE] rounded-lg p-4 text-center hover:bg-[#FAF7F2] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setShortfallAttachedFile(e.target.files[0].name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="size-6 text-[#801824] mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-700">
                  {shortfallAttachedFile ? shortfallAttachedFile : "Click to select or drag & drop file"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, DWG, DXF up to 25MB</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShortfallModalOpen(false)}
              className="text-xs border-[#EADBCE]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitShortfallReply}
              className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs gap-1.5"
            >
              <Send className="size-3" /> Submit to Officer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: Submit Show Cause Explanation ─── */}
      <Dialog open={showCauseReplyOpen} onOpenChange={setShowCauseReplyOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-[#EADBCE]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-800 mb-1">
              <Gavel className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Statutory Explanation</span>
            </div>
            <DialogTitle className="text-[#5C1A20] text-base">
              File Explanation for {selectedShowCause?.noticeNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit your formal representation regarding the alleged contravention under Section 53.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200">
              <span className="text-[11px] font-bold text-rose-950 block">Allegation:</span>
              <p className="text-xs text-rose-900 mt-0.5">{selectedShowCause?.violation}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Formal Written Explanation <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={4}
                value={showCauseExplanationText}
                onChange={(e) => setShowCauseExplanationText(e.target.value)}
                placeholder="State the facts, building bye-law conformity, site chronology, or request for personal hearing…"
                className="text-xs border-[#EADBCE] focus-visible:ring-[#801824]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Attach Affidavit / Geotagged Site Evidence</label>
              <div className="border-2 border-dashed border-[#EADBCE] rounded-lg p-4 text-center hover:bg-[#FAF7F2] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setShowCauseEvidenceFile(e.target.files[0].name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="size-6 text-[#801824] mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-700">
                  {showCauseEvidenceFile ? showCauseEvidenceFile : "Click to select photos or affidavit PDF"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF or ZIP with geotagged JPEG images</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCauseReplyOpen(false)}
              className="text-xs border-[#EADBCE]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitShowCauseReply}
              className="bg-rose-800 hover:bg-rose-900 text-white text-xs gap-1.5"
            >
              <Send className="size-3" /> File Legal Explanation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: View Official Directive (Notice) ─── */}
      <Dialog open={showCauseViewDirectiveOpen} onOpenChange={setShowCauseViewDirectiveOpen}>
        <DialogContent className="sm:max-w-xl bg-white border-[#EADBCE]">
          <DialogHeader>
            <DialogTitle className="text-[#5C1A20] text-base font-bold flex items-center justify-between">
              <span>Andhra Pradesh CRDA — Statutory Notice</span>
              <Badge variant="outline" className="text-xs font-mono">FORM 53</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedShowCause && (
            <div className="space-y-4 py-2 border-t border-b border-[#EADBCE] text-xs text-slate-800 leading-relaxed font-serif">
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-slate-200">
                <p className="font-bold text-sm tracking-wide text-[#801824] uppercase">
                  Andhra Pradesh Capital Region Development Authority
                </p>
                <p className="text-[11px] text-slate-500 font-sans">
                  Town Planning Enforcement & Regulatory Compliance Wing
                </p>
              </div>

              <div className="flex justify-between font-sans text-[11px]">
                <div>
                  <p><strong>Notice No:</strong> {selectedShowCause.noticeNumber}</p>
                  <p><strong>File Ref:</strong> {selectedShowCause.applicationNumber}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {selectedShowCause.issuedDate}</p>
                  <p><strong>Due:</strong> {selectedShowCause.responseDueDate}</p>
                </div>
              </div>

              <p>
                <strong>To:</strong><br />
                {selectedShowCause.ownerName} (Owner / Applicant)<br />
                c/o {selectedShowCause.ltpName} (Licensed Technical Person)<br />
                Site: {selectedShowCause.siteAddress}
              </p>

              <div className="bg-amber-50/80 p-3 rounded border border-amber-200 font-sans text-xs">
                <p className="font-bold text-amber-950">SUB: {selectedShowCause.section}</p>
                <p className="mt-1 text-slate-700">{selectedShowCause.violation}</p>
              </div>

              <p className="font-sans text-[11px] text-slate-600">
                Whereas upon physical verification/inspection of the subject site, the above non-conformity has been observed.
                You are hereby called upon to show cause within 15 days why action under Section 53 of the APCRDA Act
                shall not be initiated, including stoppage of work and revocation of permission.
              </p>

              {selectedShowCause.hearingScheduledDate && (
                <div className="p-2.5 bg-purple-50 rounded border border-purple-200 font-sans text-xs text-purple-950 font-medium">
                  Personal Hearing Scheduled: <strong>{selectedShowCause.hearingScheduledDate}</strong> at Zonal Planning Office.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCauseViewDirectiveOpen(false)}
              className="text-xs border-[#EADBCE]"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowCauseViewDirectiveOpen(false);
                setShowCauseReplyOpen(true);
              }}
              className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs gap-1"
            >
              <Send className="size-3" /> Respond Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: Scrutiny Sheet ─── */}
      <Dialog open={scrutinySheetOpen} onOpenChange={setScrutinySheetOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-[#EADBCE]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <BadgeCheck className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Automated Scrutiny Sheet</span>
            </div>
            <DialogTitle className="text-[#5C1A20] text-base">
              Verification Clearance — {selectedVerifiedApp?.applicationNo}
            </DialogTitle>
          </DialogHeader>

          {selectedVerifiedApp && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-lg border border-[#EADBCE]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Project Title</span>
                  <span className="font-semibold text-slate-800">{selectedVerifiedApp.project.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Plot Area & Use</span>
                  <span className="font-semibold text-slate-800">
                    {selectedVerifiedApp.project.plotArea} sq.m ({selectedVerifiedApp.project.propertyType})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">DCR Rule Scrutiny Results:</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                    <span>Front Setback Clearance (3.0m required)</span>
                    <span className="font-bold text-emerald-700">COMPLIANT (3.2m)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                    <span>Floor Area Ratio (FAR 1.75 limit)</span>
                    <span className="font-bold text-emerald-700">COMPLIANT (1.68)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                    <span>Ground Coverage (50% max)</span>
                    <span className="font-bold text-emerald-700">COMPLIANT (44%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                    <span>Rainwater Harvesting Pit Provision</span>
                    <span className="font-bold text-emerald-700">VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EADBCE]">
                <span className="font-bold text-slate-800 block text-xs">Statutory Documents Cleared:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="size-3" /> Registered Sale Deed
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="size-3" /> Encumbrance Certificate
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="size-3" /> Structural Stability Certificate
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="size-3" /> Geotagged Site Plan
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setScrutinySheetOpen(false)}
              className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: View Submission Record / Log ─── */}
      <Dialog open={!!submissionDrawerItem} onOpenChange={(o) => !o && setSubmissionDrawerItem(null)}>
        <DialogContent className="sm:max-w-md bg-white border-[#EADBCE]">
          <DialogHeader>
            <DialogTitle className="text-[#5C1A20] text-base">Compliance Submission Record</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-mono">
              {submissionDrawerItem?.shortfallId} • {submissionDrawerItem?.applicationNo}
            </DialogDescription>
          </DialogHeader>

          {submissionDrawerItem && (
            <div className="space-y-3 py-2 text-xs text-slate-700">
              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EADBCE]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Original Notice</span>
                <p className="font-semibold text-slate-900 mt-0.5">{submissionDrawerItem.title}</p>
                <p className="text-[11px] text-slate-600 mt-1">{submissionDrawerItem.description}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted Compliance Statement</span>
                <p className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 mt-1 leading-relaxed">
                  {submissionDrawerItem.response?.text ?? "All requested modifications incorporated and verified drawing re-submitted."}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Uploaded Evidence Document</span>
                <div className="flex items-center justify-between p-2 rounded bg-emerald-50/50 border border-emerald-200 mt-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="size-4 text-emerald-700" />
                    <span className="font-mono text-emerald-950 font-medium">
                      {submissionDrawerItem.response?.supportingDocument ?? "Rectification_Evidence.pdf"}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-[11px] text-emerald-800">
                    <Download className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Reviewer: <strong>{submissionDrawerItem.raisedBy?.name}</strong>
                </span>
                <Badge className="bg-blue-100 text-blue-900 border-0 text-[10px]">
                  {submissionDrawerItem.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubmissionDrawerItem(null)}
              className="text-xs border-[#EADBCE]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: View Show Cause Record ─── */}
      <Dialog open={!!viewExplanationRecord} onOpenChange={(o) => !o && setViewExplanationRecord(null)}>
        <DialogContent className="sm:max-w-lg bg-white border-[#EADBCE]">
          <DialogHeader>
            <DialogTitle className="text-[#5C1A20] text-base">Show Cause Proceedings Record</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-mono">
              {viewExplanationRecord?.noticeNumber}
            </DialogDescription>
          </DialogHeader>

          {viewExplanationRecord && (
            <div className="space-y-3 py-2 text-xs text-slate-700">
              <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold uppercase block">Statutory Contravention</span>
                <p className="font-semibold text-rose-950 mt-0.5">{viewExplanationRecord.violation}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Filed Explanation</span>
                <p className="p-2.5 rounded bg-[#FAF7F2] border border-[#EADBCE] text-slate-800 mt-1 leading-relaxed">
                  {viewExplanationRecord.applicantExplanation ?? "Explanation and site acknowledgment submitted on record."}
                </p>
              </div>

              {viewExplanationRecord.decisionRemarks && (
                <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Competent Authority Decision</span>
                  <p className="font-medium text-emerald-950 mt-0.5">{viewExplanationRecord.decisionRemarks}</p>
                  {viewExplanationRecord.decidedBy && (
                    <span className="text-[10px] text-emerald-700 block mt-1">
                      By: {viewExplanationRecord.decidedBy} ({viewExplanationRecord.decisionDate})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewExplanationRecord(null)}
              className="text-xs border-[#EADBCE]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
