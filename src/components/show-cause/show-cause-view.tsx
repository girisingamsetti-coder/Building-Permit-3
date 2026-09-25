"use client";

import * as React from "react";
import {
  FileWarning,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Hourglass,
  MailCheck,
  Gavel,
  FileText,
  User,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MOCK_SHOW_CAUSES, type ShowCauseRecord } from "@/data/modules-data";

export function ShowCauseView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedNotice, setSelectedNotice] = React.useState<ShowCauseRecord | null>(null);

  const notices = MOCK_SHOW_CAUSES;

  const filtered = React.useMemo(() => {
    return notices.filter((item) => {
      const matchSearch =
        item.noticeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.violation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.siteAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [notices, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: notices.length,
      awaitingResponse: notices.filter((n) => n.status === "AWAITING_RESPONSE").length,
      awaitingDecision: notices.filter((n) => n.status === "OPEN").length,
      decided: notices.filter((n) => n.status === "CLOSED" || n.status === "REFERRED_REVOCATION").length,
    };
  }, [notices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FileWarning className="size-6" />
            </div>
            Show Cause Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Statutory notices under Section 53 — Departure observations, personal hearings, applicant explanations, and decisions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "ALL" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("ALL")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium">All Show Cause</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total Section 53 proceedings
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "AWAITING_RESPONSE" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("AWAITING_RESPONSE")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Hourglass className="size-3.5" /> Awaiting Response
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.awaitingResponse}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            With applicant to reply
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "OPEN" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("OPEN")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <MailCheck className="size-3.5" /> Awaiting Decision
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.awaitingDecision}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Answered, with review desk
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "CLOSED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("CLOSED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Gavel className="size-3.5" /> Decided / Orders
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.decided}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Closed or revoked
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notice #, owner, violation…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="size-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="AWAITING_RESPONSE">Awaiting Response</option>
            <option value="OPEN">Under Review (Answered)</option>
            <option value="CLOSED">Closed (Complied)</option>
            <option value="REFERRED_REVOCATION">Referred for Revocation</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Notice # / App #</th>
                <th className="py-3 px-4">Owner & Site</th>
                <th className="py-3 px-4">Alleged Violation</th>
                <th className="py-3 px-4">Issued / Due Date</th>
                <th className="py-3 px-4">Hearing Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No show cause notices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.noticeNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.ownerName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{item.siteAddress}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="line-clamp-2 text-foreground font-medium">{item.violation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-foreground font-medium">Issued: {item.issuedDate}</div>
                      <div className="text-[10px] text-amber-600 font-medium">Due: {item.responseDueDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      {item.hearingScheduledDate ? (
                        <div className="font-medium text-foreground text-[11px]">
                          {item.hearingScheduledDate}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">None scheduled</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "CLOSED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "OPEN"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : item.status === "AWAITING_RESPONSE"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedNotice(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> Notice View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedNotice && (
        <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <FileWarning className="size-5 text-amber-500" />
                  Show Cause Notice: {selectedNotice.noticeNumber}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedNotice.status === "CLOSED"
                      ? "bg-emerald-600 text-white"
                      : selectedNotice.status === "REFERRED_REVOCATION"
                      ? "bg-red-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedNotice.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Under {selectedNotice.section} · File #{selectedNotice.applicationNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner / Applicant:</span>
                  <span className="font-semibold text-foreground">{selectedNotice.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LTP on Record:</span>
                  <span className="text-foreground">{selectedNotice.ltpName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site Address:</span>
                  <span className="text-foreground">{selectedNotice.siteAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notice Issue Date:</span>
                  <span className="text-foreground">{selectedNotice.issuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Explanation Due Date:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedNotice.responseDueDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 space-y-1">
                <h4 className="font-semibold text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" /> Alleged Deviation / Violation:
                </h4>
                <p className="text-foreground font-medium text-xs leading-relaxed">{selectedNotice.violation}</p>
                <p className="text-muted-foreground text-[11px] pt-1"><strong>Reason:</strong> {selectedNotice.reason}</p>
              </div>

              {selectedNotice.applicantExplanation && (
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <MailCheck className="size-3.5 text-blue-500" /> Applicant Explanation
                    </h4>
                    <span className="text-muted-foreground text-[11px]">Submitted: {selectedNotice.responseDate}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed italic bg-muted/40 p-2.5 rounded border">
                    "{selectedNotice.applicantExplanation}"
                  </p>
                </div>
              )}

              {selectedNotice.decisionRemarks && (
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                  <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                    <Gavel className="size-3.5" /> Competent Authority Decision
                  </h4>
                  <p className="text-foreground text-xs">{selectedNotice.decisionRemarks}</p>
                  <div className="text-[10px] text-muted-foreground pt-1 flex justify-between">
                    <span>Decided By: {selectedNotice.decidedBy}</span>
                    <span>Date: {selectedNotice.decisionDate}</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
