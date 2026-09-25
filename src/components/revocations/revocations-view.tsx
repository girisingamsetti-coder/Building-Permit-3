"use client";

import * as React from "react";
import {
  Gavel,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  ClipboardList,
  SearchCheck,
  Ban,
  FileText,
  AlertOctagon,
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
import { MOCK_REVOCATIONS, type RevocationRecord } from "@/data/modules-data";

export function RevocationsView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedRevocation, setSelectedRevocation] = React.useState<RevocationRecord | null>(null);

  const revocations = MOCK_REVOCATIONS;

  const filtered = React.useMemo(() => {
    return revocations.filter((item) => {
      const matchSearch =
        item.proceedingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.approvalOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grounds.some((g) => g.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [revocations, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: revocations.length,
      proposed: revocations.filter((r) => r.status === "PROPOSED").length,
      underReview: revocations.filter((r) => r.status === "UNDER_REVIEW").length,
      revoked: revocations.filter((r) => r.status === "REVOKED").length,
    };
  }, [revocations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <Gavel className="size-6" />
            </div>
            Revoke Proceedings Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Proposals to revoke granted building permissions — Statutory inquiries, grounds of fraud or gross deviation, hearings, and orders.
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
            <CardDescription className="text-xs font-medium">All Proceedings</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total files under revocation review
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "PROPOSED" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("PROPOSED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <ClipboardList className="size-3.5" /> Proposed
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.proposed}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Awaiting preliminary review
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "UNDER_REVIEW" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("UNDER_REVIEW")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <SearchCheck className="size-3.5" /> Under Hearing Review
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.underReview}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Hearing notice in progress
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "REVOKED" ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("REVOKED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <ShieldX className="size-3.5" /> Orders Revoked
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.revoked}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Permission cancelled permanently
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search proceeding, approval #, owner, grounds…"
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
            <option value="PROPOSED">Proposed</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVOKED">Revoked</option>
            <option value="REJECTED">Rejected (Stands Valid)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Proceeding # / App #</th>
                <th className="py-3 px-4">Sanction Order #</th>
                <th className="py-3 px-4">Owner & Site</th>
                <th className="py-3 px-4">Grounds of Revocation</th>
                <th className="py-3 px-4">Hearing Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No revocation proceedings found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.proceedingNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-foreground font-medium">{item.approvalOrderNumber}</div>
                      <div className="text-muted-foreground text-[11px]">Sanction: {item.approvalDate}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.ownerName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{item.siteAddress}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="line-clamp-2 text-foreground font-medium">
                        {item.grounds[0]}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.hearingHeldDate ? (
                        <div className="text-[11px] font-medium text-foreground">{item.hearingHeldDate}</div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Awaiting hearing</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "REVOKED"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : item.status === "UNDER_REVIEW"
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
                        onClick={() => setSelectedRevocation(item)}
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
      {selectedRevocation && (
        <Dialog open={!!selectedRevocation} onOpenChange={(open) => !open && setSelectedRevocation(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <AlertOctagon className="size-5 text-red-500" />
                  Revocation Proceeding: {selectedRevocation.proceedingNumber}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedRevocation.status === "REVOKED"
                      ? "bg-red-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedRevocation.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Targeting Order #{selectedRevocation.approvalOrderNumber} (Granted {selectedRevocation.approvalDate})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner on Sanction:</span>
                  <span className="font-semibold text-foreground">{selectedRevocation.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site Address:</span>
                  <span className="text-foreground">{selectedRevocation.siteAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposed By:</span>
                  <span className="text-foreground">{selectedRevocation.proposedBy} on {selectedRevocation.proposedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preceding Show Cause Ref:</span>
                  <span className="font-mono text-primary">{selectedRevocation.showCauseNoticeRef}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <AlertTriangle className="size-3.5" /> Specific Statutory Grounds for Revocation:
                </h4>
                <div className="space-y-1.5">
                  {selectedRevocation.grounds.map((ground, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-foreground flex items-start gap-2">
                      <span className="font-bold text-red-500 shrink-0">{idx + 1}.</span>
                      <span>{ground}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRevocation.revocationOrderNumber && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-700 dark:text-red-300">Final Order Issued:</span>
                    <span className="font-mono font-bold text-red-700 dark:text-red-300">
                      {selectedRevocation.revocationOrderNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Revocation Date: {selectedRevocation.decisionDate} · Forfeited Fees: ₹{selectedRevocation.forfeitedFeeAmount?.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted/40 border text-[11px]">
                <strong>Case Notes:</strong> {selectedRevocation.remarks}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
