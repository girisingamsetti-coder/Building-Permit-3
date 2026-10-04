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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Clock, CheckCircle2, Send, Gavel, TriangleAlert, FileText, History, CornerDownRight, CircleDollarSign, Eye, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, ShowCause, ShowCauseStatus, ShowCauseSeverity, ShowCauseViolationType } from "@/types";

type ShowCauseWithApp = ShowCause & { application: Application };
type QuickFilter = "ALL" | "REPLY_PENDING" | "REPLY_SUBMITTED" | "HEARING_SCHEDULED" | "ORDER_PASSED" | "PENALTY_IMPOSED" | "CLOSED" | "OVERDUE";

function isOverdue(sc: ShowCause): boolean {
  if (["COMPLIED","CLOSED","ORDER_PASSED","PENALTY_IMPOSED"].includes(sc.status)) return false;
  const due = new Date(sc.replyDueDate).getTime();
  if (isNaN(due)) return false;
  return due < Date.now() && ["ISSUED","REPLY_PENDING"].includes(sc.status);
}

function getCategory(sc: ShowCause): QuickFilter {
  if (isOverdue(sc)) return "OVERDUE";
  if (sc.status === "COMPLIED" || sc.status === "CLOSED") return "CLOSED";
  if (sc.status === "PENALTY_IMPOSED") return "PENALTY_IMPOSED";
  if (sc.status === "ORDER_PASSED") return "ORDER_PASSED";
  if (sc.status === "HEARING_SCHEDULED") return "HEARING_SCHEDULED";
  if (sc.status === "REPLY_SUBMITTED") return "REPLY_SUBMITTED";
  return "REPLY_PENDING";
}

const SC_STATUS_MAP: Record<ShowCauseStatus, { label: string; cls: string }> = {
  ISSUED:            { label: "Issued",            cls: "bg-slate-100 text-slate-700 border border-slate-300" },
  REPLY_PENDING:     { label: "Reply Pending",     cls: "bg-amber-100 text-amber-800 border border-amber-300" },
  REPLY_SUBMITTED:   { label: "Reply Submitted",   cls: "bg-blue-100 text-blue-800 border border-blue-300" },
  HEARING_SCHEDULED: { label: "Hearing Scheduled", cls: "bg-purple-100 text-purple-800 border border-purple-300" },
  ORDER_PASSED:      { label: "Order Passed",      cls: "bg-orange-100 text-orange-800 border border-orange-300" },
  COMPLIED:          { label: "Complied",          cls: "bg-emerald-100 text-emerald-800 border border-emerald-300" },
  PENALTY_IMPOSED:   { label: "Penalty Imposed",   cls: "bg-red-100 text-red-800 border border-red-300" },
  CLOSED:            { label: "Closed",            cls: "bg-emerald-100 text-emerald-800 border border-emerald-300" },
  OVERDUE:           { label: "Overdue",           cls: "bg-red-100 text-red-800 border border-red-300" },
};

function ShowCauseStatusBadge({ status, isOverdue: ov }: { status: ShowCauseStatus; isOverdue?: boolean }) {
  const s = ov ? SC_STATUS_MAP["OVERDUE"] : (SC_STATUS_MAP[status] ?? SC_STATUS_MAP["ISSUED"]);
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold", s.cls)}>{s.label}</span>;
}

const VIOLATION_MAP: Record<ShowCauseViolationType, { label: string; cls: string }> = {
  STRUCTURAL_DEVIATION:      { label: "Structural Deviation",      cls: "bg-rose-100 text-rose-800 border border-rose-200" },
  UNAUTHORIZED_CONSTRUCTION: { label: "Unauthorized Construction", cls: "bg-red-100 text-red-800 border border-red-200" },
  SETBACK_VIOLATION:         { label: "Setback Violation",         cls: "bg-orange-100 text-orange-800 border border-orange-200" },
  HEIGHT_VIOLATION:          { label: "Height Violation",          cls: "bg-orange-100 text-orange-800 border border-orange-200" },
  USE_CHANGE:                { label: "Use Change",                cls: "bg-violet-100 text-violet-800 border border-violet-200" },
  ENCROACHMENT:              { label: "Encroachment",              cls: "bg-amber-100 text-amber-800 border border-amber-200" },
  FIRE_SAFETY_VIOLATION:     { label: "Fire Safety Violation",     cls: "bg-rose-100 text-rose-800 border border-rose-200" },
  ENVIRONMENTAL_VIOLATION:   { label: "Environmental Violation",   cls: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
};

function ViolationBadge({ type }: { type: ShowCauseViolationType }) {
  const v = VIOLATION_MAP[type] ?? { label: type, cls: "bg-slate-100 text-slate-700" };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold", v.cls)}>{v.label}</span>;
}

function SeverityBadge({ severity }: { severity: ShowCauseSeverity }) {
  const map: Record<ShowCauseSeverity, string> = { CRITICAL: "bg-red-600 text-white", HIGH: "bg-orange-500 text-white", MEDIUM: "bg-amber-400 text-amber-900" };
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", map[severity])}>{severity}</span>;
}

export function LtpMyShowCause() {
  const { openApplication } = useAppStore();
  const { applications } = useDashboardScope();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState<QuickFilter>("ALL");
  const [sortField, setSortField] = React.useState<"issuedAt" | "replyDueDate">("issuedAt");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const [selectedNotice, setSelectedNotice] = React.useState<ShowCauseWithApp | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const allNotices: ShowCauseWithApp[] = React.useMemo(() =>
    applications.flatMap((app) => (app.showCauses || []).map((sc) => ({ ...sc, application: app }))),
    [applications]
  );

  const kpis = React.useMemo(() => {
    let pending = 0, submitted = 0, hearing = 0, order = 0, penalty = 0, closed = 0, overdue = 0;
    for (const sc of allNotices) {
      const cat = getCategory(sc);
      if (cat === "OVERDUE") overdue++;
      else if (cat === "REPLY_PENDING") pending++;
      else if (cat === "REPLY_SUBMITTED") submitted++;
      else if (cat === "HEARING_SCHEDULED") hearing++;
      else if (cat === "ORDER_PASSED") order++;
      else if (cat === "PENALTY_IMPOSED") penalty++;
      else if (cat === "CLOSED") closed++;
    }
    return { total: allNotices.length, pending, submitted, hearing, order, penalty, closed, overdue };
  }, [allNotices]);

  const filtered = React.useMemo(() =>
    allNotices
      .filter((sc) => {
        if (typeFilter !== "ALL" && sc.violationType !== typeFilter) return false;
        if (statusFilter !== "ALL" && getCategory(sc) !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return sc.showCauseId.toLowerCase().includes(q) || sc.title.toLowerCase().includes(q) || sc.applicationNo.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const va = sortField === "issuedAt" ? a.issuedAt : a.replyDueDate;
        const vb = sortField === "issuedAt" ? b.issuedAt : b.replyDueDate;
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }),
    [allNotices, typeFilter, statusFilter, searchQuery, sortField, sortAsc]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const canReply = (sc: ShowCause) => sc.status === "ISSUED" || sc.status === "REPLY_PENDING" || isOverdue(sc);

  function openDetails(sc: ShowCauseWithApp) { setSelectedNotice(sc); setDetailsOpen(true); }
  function openReply(sc: ShowCauseWithApp) {
    setSelectedNotice(sc);
    const last = sc.responseVersions?.[sc.responseVersions.length - 1];
    setReplyText(last?.text ?? "");
    setUploadedFiles([]);
    setReplyOpen(true);
  }
  function handleSubmitReply() {
    if (!selectedNotice || !replyText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false); setReplyOpen(false);
      toast({ title: "Reply Submitted", description: `Your reply to ${selectedNotice.showCauseId} has been submitted.` });
      setReplyText("");
    }, 1200);
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
      {/* KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 shrink-0">
          {[
            { filter: "ALL" as QuickFilter,              count: kpis.total,     label: "Total",   sub: "All Notices",         activeBorder: "border-[#7A1316] ring-2 ring-[#7A1316]/20", labelColor: "text-slate-600", numColor: "text-slate-900", iconColor: "text-[#7A1316]", Icon: Scale },
            { filter: "REPLY_PENDING" as QuickFilter,    count: kpis.pending,   label: "Pending", sub: "Awaiting Reply",      activeBorder: "border-amber-600 ring-2 ring-amber-500/20", labelColor: "text-amber-800", numColor: "text-amber-700", iconColor: "text-amber-600", Icon: Clock },
            { filter: "REPLY_SUBMITTED" as QuickFilter,  count: kpis.submitted, label: "Replied", sub: "Reply Sent",          activeBorder: "border-blue-600 ring-2 ring-blue-500/20",   labelColor: "text-blue-800", numColor: "text-blue-700", iconColor: "text-blue-600", Icon: Send },
            { filter: "CLOSED" as QuickFilter,           count: kpis.closed,    label: "Closed",  sub: "Complied & Resolved", activeBorder: "border-emerald-600 ring-2 ring-emerald-500/20", labelColor: "text-emerald-800", numColor: "text-emerald-700", iconColor: "text-emerald-600", Icon: CheckCircle2 },
            { filter: "OVERDUE" as QuickFilter,          count: kpis.overdue,   label: "Overdue", sub: "Reply Overdue",       activeBorder: "border-rose-600 ring-2 ring-rose-500/20",   labelColor: "text-rose-800", numColor: "text-rose-700", iconColor: "text-rose-600", Icon: TriangleAlert },
          ].map(({ filter, count, label, sub, activeBorder, labelColor, numColor, iconColor, Icon }) => {
            const active = statusFilter === filter;
            return (
              <button key={filter} onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all shadow-2xs flex flex-col justify-between cursor-pointer bg-white",
                  active
                    ? `${activeBorder} shadow-xs`
                    : "border-[#EADBCE] hover:border-slate-400 hover:bg-[#FDFBF7]"
                )}>
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

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 items-center shrink-0">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <Input placeholder="Search notice, application..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 h-8 text-xs border-[#EADBCE] bg-white" />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white w-48 cursor-pointer">
              <Filter className="size-3 mr-1 text-[#7A1316]" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Violation Types</SelectItem>
              <SelectItem value="STRUCTURAL_DEVIATION">Structural Deviation</SelectItem>
              <SelectItem value="UNAUTHORIZED_CONSTRUCTION">Unauthorized Construction</SelectItem>
              <SelectItem value="SETBACK_VIOLATION">Setback Violation</SelectItem>
              <SelectItem value="HEIGHT_VIOLATION">Height Violation</SelectItem>
              <SelectItem value="USE_CHANGE">Use Change</SelectItem>
              <SelectItem value="ENCROACHMENT">Encroachment</SelectItem>
              <SelectItem value="FIRE_SAFETY_VIOLATION">Fire Safety Violation</SelectItem>
              <SelectItem value="ENVIRONMENTAL_VIOLATION">Environmental Violation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as QuickFilter); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 text-xs border-[#EADBCE] bg-white w-44 cursor-pointer">
              <Filter className="size-3 mr-1 text-[#7A1316]" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses ({kpis.total})</SelectItem>
              <SelectItem value="REPLY_PENDING">Reply Pending ({kpis.pending})</SelectItem>
              <SelectItem value="REPLY_SUBMITTED">Reply Submitted ({kpis.submitted})</SelectItem>
              <SelectItem value="HEARING_SCHEDULED">Hearing Scheduled ({kpis.hearing})</SelectItem>
              <SelectItem value="PENALTY_IMPOSED">Penalty Imposed ({kpis.penalty})</SelectItem>
              <SelectItem value="CLOSED">Closed ({kpis.closed})</SelectItem>
              <SelectItem value="OVERDUE">Overdue ({kpis.overdue})</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-[10px] text-slate-400">{filtered.length} {filtered.length === 1 ? "notice" : "notices"}</div>
        </div>

        {/* TABLE */}
        <div className="flex-1 rounded-xl border border-[#EADBCE] overflow-hidden bg-white shadow-2xs">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center"><Scale className="size-7 text-slate-400" /></div>
              <div>
                <p className="text-sm font-semibold text-slate-600">No Show Cause Notices</p>
                <p className="text-xs text-slate-400 mt-1">No notices match your current filters.</p>
              </div>
              {statusFilter !== "ALL" && <Button variant="outline" size="sm" className="text-xs h-7 cursor-pointer" onClick={() => setStatusFilter("ALL")}>Clear Filter</Button>}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] text-[11px] font-bold">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="px-3 py-2 w-36 whitespace-nowrap">Notice No.</th>
                  <th className="px-3 py-2 w-32 whitespace-nowrap">App. No.</th>
                  <th className="px-3 py-2">Violation / Title</th>
                  <th className="px-3 py-2 w-24 text-center">Severity</th>
                  <th className="px-3 py-2 w-32 text-center">Status</th>
                  <th className="px-3 py-2 w-28 text-center cursor-pointer select-none whitespace-nowrap" onClick={() => { setSortField("replyDueDate"); setSortAsc(s => !s); }}>
                    Reply Due {sortField === "replyDueDate" ? (sortAsc ? "up" : "dn") : ""}
                  </th>
                  <th className="px-3 py-2 w-28 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {paginated.map((sc) => {
                  const ov = isOverdue(sc);
                  return (
                    <tr key={sc.id} className={cn("hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]", ov && "bg-red-50/60")}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button onClick={() => openDetails(sc)} className="font-mono font-bold text-red-800 hover:underline cursor-pointer text-left">{sc.showCauseId}</button>
                        {sc.showCauseNumber && <span className="block text-[9px] text-slate-400">{sc.showCauseNumber}</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button onClick={() => openApplication(sc.applicationId, "ltp-application-details")} className="font-mono text-[#7A1316] hover:underline cursor-pointer">{sc.applicationNo}</button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800 line-clamp-1">{sc.title}</span>
                          <ViolationBadge type={sc.violationType} />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center"><SeverityBadge severity={sc.severity} /></td>
                      <td className="px-3 py-2 text-center"><ShowCauseStatusBadge status={sc.status} isOverdue={ov} /></td>
                      <td className={cn("px-3 py-2 text-center whitespace-nowrap", ov ? "text-red-700 font-bold" : "text-slate-600")}>
                        {ov && <TriangleAlert className="inline size-3 mr-0.5 text-red-600" />}
                        {formatDate(sc.replyDueDate)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(sc)} className="h-6 px-2 text-[10px] cursor-pointer gap-1"><Eye className="size-3" /> View</Button>
                          {canReply(sc) && <Button size="sm" onClick={() => openReply(sc)} className="h-6 px-2 text-[10px] bg-red-800 hover:bg-red-900 text-white cursor-pointer gap-1"><Send className="size-3" /> Reply</Button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between shrink-0 text-xs text-slate-500">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="h-7 px-2 cursor-pointer"><ChevronLeft className="size-3.5" /></Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-7 px-2 cursor-pointer"><ChevronRight className="size-3.5" /></Button>
            </div>
          </div>
        )}

      {/* DETAIL DIALOG */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNotice && (<>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-800 flex items-center justify-center shrink-0"><Scale className="size-5 text-white" /></div>
                <div>
                  <DialogTitle className="text-sm font-bold text-slate-800">{selectedNotice.showCauseId} — Show Cause Notice</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">{selectedNotice.title}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap gap-2">
                <ShowCauseStatusBadge status={selectedNotice.status} isOverdue={isOverdue(selectedNotice)} />
                <SeverityBadge severity={selectedNotice.severity} />
                <ViolationBadge type={selectedNotice.violationType} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Notice No.", value: selectedNotice.showCauseId },
                  { label: "Application No.", value: selectedNotice.applicationNo },
                  { label: "Issued By", value: `${selectedNotice.issuedBy.name} (${selectedNotice.issuedBy.role})` },
                  { label: "Department", value: selectedNotice.department || "—" },
                  { label: "Issued On", value: formatDate(selectedNotice.issuedAt) },
                  { label: "Reply Due", value: formatDate(selectedNotice.replyDueDate) },
                  ...(selectedNotice.hearingDate ? [{ label: "Hearing Date", value: formatDateTime(selectedNotice.hearingDate) }] : []),
                  ...(selectedNotice.penaltyAmount ? [{ label: "Penalty Amount", value: `Rs.${selectedNotice.penaltyAmount.toLocaleString("en-IN")}` }] : []),
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-[#FAF7F2] p-2 border border-[#EADBCE]">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">{item.label}</span>
                    <span className="font-semibold text-slate-800 text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Notice Details</p>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedNotice.description}</p>
              </div>
              {selectedNotice.violationDetails && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                  <p className="text-[10px] font-bold text-orange-800 uppercase mb-1">Specific Violation</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedNotice.violationDetails}</p>
                </div>
              )}
              {selectedNotice.requiredAction && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">Required Action</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedNotice.requiredAction}</p>
                </div>
              )}
              {selectedNotice.orderDetails && (
                <div className="rounded-lg bg-slate-100 border border-slate-200 p-3">
                  <p className="text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1"><Gavel className="size-3" /> Order / Penalty Details</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedNotice.orderDetails}</p>
                </div>
              )}
              {selectedNotice.responseVersions && selectedNotice.responseVersions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1"><History className="size-3" /> Reply History</p>
                  <div className="space-y-2">
                    {selectedNotice.responseVersions.map((rv) => (
                      <div key={rv.version} className="rounded-lg border border-[#EADBCE] bg-white p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-blue-700">Reply v{rv.version}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTime(rv.respondedAt)}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{rv.text}</p>
                        {rv.supportingDocuments && rv.supportingDocuments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {rv.supportingDocuments.map((d) => (
                              <span key={d.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                                <FileText className="size-2.5" /> {d.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedNotice.timeline && selectedNotice.timeline.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1"><History className="size-3" /> Notice Timeline</p>
                  <div className="relative pl-4">
                    <div className="absolute left-1.5 top-0 bottom-0 w-px bg-[#EADBCE]" />
                    {selectedNotice.timeline.map((ev) => (
                      <div key={ev.id} className="relative mb-3 last:mb-0">
                        <div className="absolute -left-[11px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-red-800 shadow-sm" />
                        <div className="ml-2 rounded-lg bg-white border border-[#EADBCE] p-2">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-[11px] text-slate-800">{ev.title}</span>
                            <span className="text-[9px] text-slate-400 whitespace-nowrap">{formatDateTime(ev.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <CornerDownRight className="size-2.5 text-slate-400" />
                            <span className="text-[10px] text-slate-500">{ev.actor.name}</span>
                            <ShowCauseStatusBadge status={ev.status} />
                          </div>
                          {(ev.remarks || ev.description) && <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">{ev.remarks || ev.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)} className="text-xs cursor-pointer">Close</Button>
              {canReply(selectedNotice) && (
                <Button size="sm" onClick={() => { setDetailsOpen(false); openReply(selectedNotice); }} className="text-xs bg-red-800 hover:bg-red-900 text-white cursor-pointer gap-1">
                  <Send className="size-3" /> Submit Reply
                </Button>
              )}
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      {/* REPLY DIALOG */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          {selectedNotice && (<>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Submit Reply — {selectedNotice.showCauseId}</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Official reply to notice issued by {selectedNotice.issuedBy.name}.
                {selectedNotice.hearingDate && <span className="ml-1 font-semibold text-purple-700">Hearing: {formatDateTime(selectedNotice.hearingDate)}</span>}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
              <span className="font-bold block mb-0.5">{selectedNotice.title}</span>
              <span className="text-[10px] text-red-700">{selectedNotice.description.slice(0, 140)}...</span>
            </div>
            <div className="space-y-3 mt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Reply / Explanation <span className="text-red-600">*</span></label>
                <Textarea rows={6} value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide a detailed explanation of the violation, corrective actions taken, or grounds for regularisation..."
                  className="text-xs resize-none border-[#EADBCE]" />
                <p className="text-[10px] text-slate-400 mt-1">{replyText.length} characters</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Supporting Documents</label>
                <FileUploader
                  accept=".pdf,.jpg,.jpeg,.png"
                  uploadedFiles={uploadedFiles}
                  onUpload={(files) => setUploadedFiles((prev) => [...prev, ...files])}
                  onRemove={(id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id))}
                />
                <p className="text-[10px] text-slate-400 mt-1">Attach compliance photographs, survey reports, affidavits (PDF/JPG, max 5 files)</p>
              </div>
              {selectedNotice.penaltyAmount && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-2 flex items-start gap-2">
                  <TriangleAlert className="size-4 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-800">
                    A penalty of <strong>Rs.{selectedNotice.penaltyAmount.toLocaleString("en-IN")}</strong> has been imposed. Submitting this reply does not waive the penalty.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => setReplyOpen(false)} className="text-xs cursor-pointer">Cancel</Button>
              <Button size="sm" onClick={handleSubmitReply} disabled={!replyText.trim() || isSubmitting}
                className="text-xs bg-red-800 hover:bg-red-900 text-white cursor-pointer gap-1">
                {isSubmitting
                  ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Submitting...</>
                  : <><Send className="size-3" /> Submit Reply</>}
              </Button>
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
