"use client";

import * as React from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FileCheck2,
  Paperclip,
  Check,
  User,
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
import {
  MOCK_SHORTFALLS_REGISTER,
  type ShortfallRegisterRecord,
  type ShortfallItemDetail,
} from "@/data/modules-data";

export function ShortfallsView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedShortfall, setSelectedShortfall] = React.useState<ShortfallRegisterRecord | null>(null);

  const shortfalls = MOCK_SHORTFALLS_REGISTER;

  const filtered = React.useMemo(() => {
    return shortfalls.filter((item) => {
      const matchSearch =
        item.shortfallNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.items.some((i) => i.observation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [shortfalls, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: shortfalls.length,
      awaitingApplicant: shortfalls.filter((s) => s.status === "AWAITING_APPLICANT").length,
      awaitingOfficer: shortfalls.filter((s) => s.status === "AWAITING_OFFICER").length,
      resolved: shortfalls.filter((s) => s.status === "RESOLVED").length,
    };
  }, [shortfalls]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="size-6" />
            </div>
            Shortfall Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deficiency memos and shortfall cycles — Specific observation queries, required compliance documents, and verification trails.
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
            <CardDescription className="text-xs font-medium">All Shortfalls</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total active & settled deficiency cycles
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "AWAITING_APPLICANT" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("AWAITING_APPLICANT")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> With Applicant
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.awaitingApplicant}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Awaiting revised drawings or docs
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "AWAITING_OFFICER" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("AWAITING_OFFICER")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="size-3.5" /> With Department
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.awaitingOfficer}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Applicant responded, desk reviewing
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "RESOLVED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("RESOLVED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Settled / Resolved
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.resolved}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Complied and moved to next stage
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search shortfall #, application, observation…"
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
            <option value="AWAITING_APPLICANT">With Applicant</option>
            <option value="AWAITING_OFFICER">With Department</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Shortfall # / App #</th>
                <th className="py-3 px-4">Cycle & Stage</th>
                <th className="py-3 px-4">Owner & LTP</th>
                <th className="py-3 px-4">Raised By & Date</th>
                <th className="py-3 px-4">Compliance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No shortfalls found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.shortfallNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Cycle {item.cycle}
                      </Badge>
                      <div className="text-[11px] text-foreground font-medium mt-0.5">{item.stageName}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.ownerName}</div>
                      <div className="text-[11px] text-muted-foreground">{item.ltpName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.raisedBy}</div>
                      <div className="text-[10px] text-muted-foreground">{item.raisedDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{item.dueDate}</div>
                      {item.responseDate && (
                        <div className="text-[10px] text-blue-600">Replied: {item.responseDate}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "AWAITING_OFFICER"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {item.items.length} deficiency {item.items.length === 1 ? "item" : "items"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedShortfall(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> Queries ({item.items.length})
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
      {selectedShortfall && (
        <Dialog open={!!selectedShortfall} onOpenChange={(open) => !open && setSelectedShortfall(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-500" />
                  Shortfall Memo: {selectedShortfall.shortfallNumber}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedShortfall.status === "RESOLVED"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedShortfall.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Application #{selectedShortfall.applicationNumber} · Cycle {selectedShortfall.cycle} ({selectedShortfall.stageName})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Raised by Officer:</span>
                  <span className="font-semibold text-foreground">{selectedShortfall.raisedBy} ({selectedShortfall.raisedDate})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compliance Due Date:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{selectedShortfall.dueDate}</span>
                </div>
                {selectedShortfall.responseDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applicant Response Date:</span>
                    <span className="font-medium text-blue-600">{selectedShortfall.responseDate}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" /> Deficiencies & Required Rectifications:
                </h4>

                {selectedShortfall.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {item.category}
                      </span>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          item.resolved
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        {item.resolved ? "Resolved ✓" : "Outstanding"}
                      </Badge>
                    </div>

                    <div className="p-2 rounded bg-muted/30 text-muted-foreground text-[11px]">
                      <strong>Observation:</strong> {item.observation}
                    </div>

                    <div className="text-[11px] text-foreground">
                      <strong>Required Action:</strong> {item.requiredAction}
                    </div>

                    {item.resolutionRemarks && (
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px]">
                        <strong>Resolution Note:</strong> {item.resolutionRemarks}
                      </div>
                    )}

                    {item.attachedDocumentName && (
                      <div className="flex items-center gap-1.5 text-primary font-mono text-[11px] pt-1">
                        <Paperclip className="size-3" /> {item.attachedDocumentName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
