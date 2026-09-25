"use client";

import * as React from "react";
import {
  UserRoundCog,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck,
  FileCheck2,
  XCircle,
  Building,
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
import { MOCK_LTP_CHANGES, type LtpChangeRecord } from "@/data/modules-data";

export function LtpChangesView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedChange, setSelectedChange] = React.useState<LtpChangeRecord | null>(null);

  const changes = MOCK_LTP_CHANGES;

  const filtered = React.useMemo(() => {
    return changes.filter((item) => {
      const matchSearch =
        item.changeRequestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currentLtp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.proposedLtp.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [changes, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: changes.length,
      pending: changes.filter((c) => c.status === "PENDING_VERIFICATION").length,
      underReview: changes.filter((c) => c.status === "OPEN").length,
      approved: changes.filter((c) => c.status === "APPROVED").length,
    };
  }, [changes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <UserRoundCog className="size-6" />
            </div>
            Change of LTP Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Owners' requests to replace the Licensed Technical Person on record — Handover protocol, indemnity bonds, and credential verification.
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
            <CardDescription className="text-xs font-medium">All Requests</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total LTP transfer requests
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "PENDING_VERIFICATION" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("PENDING_VERIFICATION")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> Pending Docs
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.pending}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Awaiting NOC or indemnity
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "OPEN" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("OPEN")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <UserRoundCog className="size-3.5" /> Under Review
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.underReview}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Verified, with Zonal Head
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "APPROVED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("APPROVED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Transferred
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.approved}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            LTP change executed
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search request #, application, owner, LTP…"
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
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="OPEN">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Request # / App #</th>
                <th className="py-3 px-4">Owner & Site</th>
                <th className="py-3 px-4">Current LTP</th>
                <th className="py-3 px-4">Proposed New LTP</th>
                <th className="py-3 px-4">Clearance Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No LTP change requests found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.changeRequestNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.ownerName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{item.siteAddress}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.currentLtp.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{item.currentLtp.licenceNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-primary flex items-center gap-1">
                        <ArrowRight className="size-3" /> {item.proposedLtp.name}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground pl-4">{item.proposedLtp.licenceNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span title="Owner Consent" className={item.hasOwnerConsent ? "text-emerald-600" : "text-red-500"}>
                          Owner: {item.hasOwnerConsent ? "✓" : "✗"}
                        </span>
                        <span title="New Consent" className={item.hasNewLtpConsent ? "text-emerald-600" : "text-red-500"}>
                          New: {item.hasNewLtpConsent ? "✓" : "✗"}
                        </span>
                        <span title="Outgoing NOC" className={item.hasOutgoingLtpNoc ? "text-emerald-600" : "text-amber-500"}>
                          NOC: {item.hasOutgoingLtpNoc ? "✓" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "OPEN"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedChange(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> Details
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
      {selectedChange && (
        <Dialog open={!!selectedChange} onOpenChange={(open) => !open && setSelectedChange(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <UserRoundCog className="size-5 text-purple-600" />
                  LTP Transfer Request: {selectedChange.changeRequestNumber}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedChange.status === "APPROVED"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedChange.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Application #{selectedChange.applicationNumber} · Owner: {selectedChange.ownerName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              {/* Side-by-side LTP comparison */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 border bg-muted/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Outgoing LTP
                  </span>
                  <div className="font-semibold text-sm text-foreground">{selectedChange.currentLtp.name}</div>
                  <div className="text-[11px] text-muted-foreground">{selectedChange.currentLtp.role}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-2">{selectedChange.currentLtp.licenceNo}</div>
                  {selectedChange.currentLtp.organization && (
                    <div className="text-[11px] text-muted-foreground">{selectedChange.currentLtp.organization}</div>
                  )}
                </Card>

                <Card className="p-3 border border-primary/30 bg-primary/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                    Incoming New LTP
                  </span>
                  <div className="font-semibold text-sm text-foreground">{selectedChange.proposedLtp.name}</div>
                  <div className="text-[11px] text-muted-foreground">{selectedChange.proposedLtp.role}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-2">{selectedChange.proposedLtp.licenceNo}</div>
                  <div className="text-[11px] text-muted-foreground">{selectedChange.proposedLtp.phone}</div>
                </Card>
              </div>

              <div className="p-3 rounded-lg border bg-card space-y-1">
                <span className="font-semibold text-muted-foreground text-[11px]">Reason for Change:</span>
                <p className="text-foreground leading-relaxed">{selectedChange.reason}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-foreground">Required Clearance Documentation:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded border bg-muted/40 text-center">
                    <span className="text-[10px] text-muted-foreground block">Owner Letter</span>
                    <span className="font-bold text-emerald-600">Attached ✓</span>
                  </div>
                  <div className="p-2 rounded border bg-muted/40 text-center">
                    <span className="text-[10px] text-muted-foreground block">New LTP Consent</span>
                    <span className="font-bold text-emerald-600">Attached ✓</span>
                  </div>
                  <div className="p-2 rounded border bg-muted/40 text-center">
                    <span className="text-[10px] text-muted-foreground block">Outgoing LTP NOC</span>
                    <span className={selectedChange.hasOutgoingLtpNoc ? "font-bold text-emerald-600" : "font-bold text-amber-500"}>
                      {selectedChange.hasOutgoingLtpNoc ? "Verified ✓" : "Pending Notice"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedChange.decisionRemarks && (
                <div className="p-3 rounded-lg border border-muted bg-muted/50 text-[11px]">
                  <strong>Desk Determination:</strong> {selectedChange.decisionRemarks}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
