"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/design-system/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, RoleBadge } from "@/components/design-system/badges";
import { formatDate } from "@/components/design-system/workflow";
import { Search, Filter, MoreHorizontal, Clock, ArrowRight, FilePlus2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewApplicationDialog } from "@/components/ltp/new-application-dialog";

const TABS = [
  "Total applications",
  "Draft",
  "Scrutiny",
  "Documents Submission",
  "Payment pending",
  "Under review",
  "Shortfall",
  "Approved"
];

function daysRemaining(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

// Build a human-readable shortfall label from stage + type
function shortfallLabel(stageKey: string, type: string): string {
  const stageMap: Record<string, string> = {
    ZONAL_HEAD_REVIEW: "ZJD",
    DIRECTOR_REVIEW: "Director",
    ADDITIONAL_COMMISSIONER_REVIEW: "ZAD/ZDD",
    COMMISSIONER_REVIEW: "Commissioner",
  };
  const stage = stageMap[stageKey] ?? stageKey.replace(/_/g, " ");
  const typeLabel = type === "FEE" ? "fee shortfall" : type === "DOCUMENT" ? "document shortfall" : "shortfall";
  return `${stage} — ${typeLabel}`;
}

function slaBadgeProps(days: number | null): { cls: string; label: string } {
  if (days === null) return { cls: "bg-slate-100 text-slate-500", label: "Not started" };
  if (days < 0) return { cls: "bg-red-100 text-red-700", label: `Overdue ${Math.abs(days)}d` };
  if (days <= 3) return { cls: "bg-red-100 text-red-700", label: `${days}d left` };
  if (days <= 7) return { cls: "bg-amber-100 text-amber-700", label: `${days}d left` };
  return { cls: "bg-emerald-100 text-emerald-700", label: "On track" };
}

export function AdminApplications() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { applications, openApplication } = useAppStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  const filtered = useMemo(() => {
    let list = [...applications];
    if (activeTab === "Draft") list = list.filter(a => a.status === "DRAFT");
    else if (activeTab === "Scrutiny") list = list.filter(a => a.status === "SCRUTINY_FAILED" || a.status === "SCRUTINY_PASSED");
    else if (activeTab === "Documents Submission") list = list.filter(a => a.status === "DOCUMENT_UPLOAD_PENDING");
    else if (activeTab === "Payment pending") list = list.filter(a => a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED" || a.status === "PAYMENT_FAILED");
    else if (activeTab === "Under review") list = list.filter(a => ["ZONAL_HEAD_REVIEW", "DIRECTOR_REVIEW", "ADDITIONAL_COMMISSIONER_REVIEW", "COMMISSIONER_REVIEW", "DOCUMENT_VERIFICATION", "SCRUTINY_IN_PROGRESS"].includes(a.status));
    else if (activeTab === "Shortfall") list = list.filter(a => a.status === "SHORTFALL_RAISED");
    else if (activeTab === "Approved") list = list.filter(a => a.status === "APPROVED");

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.applicationNo.toLowerCase().includes(q) ||
          a.project.surveyNo?.toLowerCase().includes(q) ||
          a.applicant.name.toLowerCase().includes(q) ||
          a.project.address?.toLowerCase().includes(q)
      );
    }
    if (status !== "ALL") list = list.filter((a) => a.status === status);
    // In a real app, type filtering would happen here
    return list;
  }, [applications, query, status, activeTab]);

  return (
    <div className="flex h-full flex-col space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Applications" 
          description="" 
        />
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1.5"
          onClick={() => setDialogOpen(true)}
        >
          <FilePlus2 className="size-4" /> New application
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className={cn("rounded-full shadow-sm text-xs px-4 h-8", activeTab === tab ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50")}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-3 border-b border-slate-100 p-3 bg-white">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search number, applicant, survey no. or locality"
                className="h-9 pl-9 rounded-full bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-[140px] rounded-full border-slate-200">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9 w-[130px] rounded-full border-slate-200">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 rounded-full border-slate-200">
                <Filter className="size-4 mr-2" /> More
              </Button>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-xs font-medium text-slate-500">
            {filtered.length} applications
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Application</th>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold">Filed By</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Current Stage</th>
                  <th className="px-4 py-3 font-semibold">With</th>
                  <th className="px-4 py-3 font-semibold">Fee / Payment</th>
                  <th className="px-4 py-3 font-semibold">Last updated</th>
                  <th className="px-4 py-3 font-semibold">SLA</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => {
                  const days = daysRemaining(a.expectedSLA);
                  const sla = slaBadgeProps(days);
                  // Mock payment status formatting
                  const isPaid = a.status === "APPROVED" || a.status === "REJECTED" || (a.payment?.status as string) === "PAID";
                  const openShortfalls = a.shortfalls?.filter((s) => s.status === "OPEN" || s.status === "REOPENED" || s.status === "OVERDUE") ?? [];
                  const firstShortfall = openShortfalls[0];
                  
                  return (
                    <tr key={a.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-900 text-[13px]">{a.applicationNo}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{a.project.type === "LAYOUT_APPROVAL" ? "Layout approval" : "Commercial building permission"}</div>
                      </td>
                      <td className="px-4 py-3 align-top max-w-[160px]">
                        <div className="font-medium text-slate-900 text-xs truncate">{a.applicant.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{a.applicant.contact}</div>
                      </td>
                      <td className="px-4 py-3 align-top max-w-[200px]">
                        <div className="text-xs text-slate-600 truncate" title={a.project.address}>
                          {a.project.address || `Plot 171, Sy. 144/B2, Nalla...`}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top max-w-[160px]">
                        <div className="font-medium text-slate-900 text-xs truncate">{a.ltpName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">Skyline Design Studio</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {a.status === "SHORTFALL_RAISED" && firstShortfall ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
                              {shortfallLabel(firstShortfall.stageRaisedAt, firstShortfall.type)}
                            </span>
                            {openShortfalls.length > 0 && (
                              <span className="inline-flex items-center rounded-full bg-amber-400 text-white px-2 py-0.5 text-[10px] font-bold">
                                {openShortfalls.length} open
                              </span>
                            )}
                          </div>
                        ) : (
                          <StatusBadge status={a.status} showIcon={false} />
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-[12px] text-slate-700">
                          {a.status === "DRAFT" ? "Filing" : a.status === "APPROVED" ? "Closed approved" : a.status === "REJECTED" ? "Closed rejected" : a.currentStageLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {a.assignedOfficer ? (
                          <div className="text-[11px] text-slate-600 font-medium uppercase tracking-wider">
                            {a.assignedOfficer.role.replace(/_/g, " ")} QUEUE
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {isPaid ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Paid</span>
                        ) : a.status === "PAYMENT_FAILED" ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Payable</span>
                            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">Failed</span>
                          </div>
                        ) : a.status === "PAYMENT_PENDING" ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Payable</span>
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Awaiting payment</span>
                          </div>
                        ) : a.status === "FEE_GENERATED" ? (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Payable</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">No demand</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-[12px] text-slate-500">6h ago</span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", sla.cls)}>
                            {sla.label.split(" ")[0]} {sla.label.split(" ")[1] === "track" && "track"}
                          </span>
                          {days !== null && days >= 0 && (
                            <span className="text-[10px] text-slate-500">{days}d left</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          {a.status === "DRAFT" ? (
                             <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 rounded-full px-4 text-white">
                               Continue
                             </Button>
                          ) : a.status === "SCRUTINY_FAILED" ? (
                             <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 rounded-full px-4 text-white">
                               Upload drawing
                             </Button>
                          ) : ["PAYMENT_PENDING", "FEE_GENERATED", "PAYMENT_FAILED"].includes(a.status) ? (
                             <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 rounded-full px-4 text-white">
                               Pay
                             </Button>
                          ) : a.status === "SHORTFALL_RAISED" ? (
                             <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 rounded-full">
                               Answer shortfall
                             </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] rounded-full px-3"
                              onClick={() => openApplication(a.id, "admin-dashboard")}
                            >
                              View
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="size-7 rounded-full text-slate-400">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      <NewApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
