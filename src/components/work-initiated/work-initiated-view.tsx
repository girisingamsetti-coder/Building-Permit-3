"use client";

import * as React from "react";
import {
  HardHat,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  Camera,
  FileClock,
  Hammer,
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
import { MOCK_WORK_COMMENCEMENTS, type WorkCommencementRecord } from "@/data/modules-data";

export function WorkInitiatedView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedRecord, setSelectedRecord] = React.useState<WorkCommencementRecord | null>(null);

  const commencements = MOCK_WORK_COMMENCEMENTS;

  const filtered = React.useMemo(() => {
    return commencements.filter((item) => {
      const matchSearch =
        item.commencementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.approvalOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contractor.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [commencements, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: commencements.length,
      proceedingIssued: commencements.filter((w) => w.status === "PROCEEDING_ISSUED").length,
      pendingCommencement: commencements.filter((w) => w.status === "PENDING_COMMENCEMENT").length,
      workInitiated: commencements.filter((w) => w.status === "WORK_INITIATED").length,
    };
  }, [commencements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <HardHat className="size-6" />
            </div>
            Work Initiated Register (Commencement)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Post-approval construction tracking — Sanction Order → Notice of Commencement → Ground Breaking & Contractor Undertakings.
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
            <CardDescription className="text-xs font-medium">All Files</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Approved files in commencement flow
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "PROCEEDING_ISSUED" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("PROCEEDING_ISSUED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="size-3.5" /> Order Issued
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.proceedingIssued}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Commencement not yet notified
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "PENDING_COMMENCEMENT" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("PENDING_COMMENCEMENT")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> Start Date Approaching
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.pendingCommencement}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Notice filed with advance date
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "WORK_INITIATED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("WORK_INITIATED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <HardHat className="size-3.5" /> Work Initiated
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.workInitiated}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Active construction on site
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search commencement #, contractor, owner…"
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
            <option value="WORK_INITIATED">Work Initiated</option>
            <option value="PENDING_COMMENCEMENT">Pending Commencement</option>
            <option value="PROCEEDING_ISSUED">Proceeding Issued (Awaiting Notice)</option>
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
                <th className="py-3 px-4">Order # & Issue Date</th>
                <th className="py-3 px-4">Owner & Site</th>
                <th className="py-3 px-4">Contractor</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No commencement notices found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.commencementNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-foreground font-medium">{item.approvalOrderNumber}</div>
                      <div className="text-muted-foreground text-[11px]">Issued: {item.orderIssuedDate}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.ownerName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{item.siteAddress}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.contractor.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{item.contractor.licenceNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      {item.commencementDate ? (
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <Calendar className="size-3 text-muted-foreground" />
                          {item.commencementDate}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Not notified</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "WORK_INITIATED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "PENDING_COMMENCEMENT"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRecord(item)}
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
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <HardHat className="size-5 text-amber-500" />
                  Work Commencement: {selectedRecord.commencementNumber}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedRecord.status === "WORK_INITIATED"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                  )}
                >
                  {selectedRecord.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Under BPO #{selectedRecord.approvalOrderNumber} · Site: {selectedRecord.siteAddress}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="font-semibold text-foreground">{selectedRecord.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LTP on Record:</span>
                  <span className="text-foreground">{selectedRecord.ltpName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sanction Order Issued:</span>
                  <span className="text-foreground">{selectedRecord.orderIssuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commencement Start Date:</span>
                  <span className="font-semibold text-foreground">{selectedRecord.commencementDate ?? "Pending"}</span>
                </div>
              </div>

              <Card className="p-3 border space-y-1.5 bg-card">
                <h4 className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                  <Hammer className="size-3.5 text-primary" /> Engaged Licensed Contractor:
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contractor Firm:</span>
                  <span className="font-semibold text-foreground">{selectedRecord.contractor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Licence Registration #:</span>
                  <span className="font-mono text-foreground">{selectedRecord.contractor.licenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contractor Phone:</span>
                  <span className="text-foreground">{selectedRecord.contractor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="text-foreground">{selectedRecord.contractor.address}</span>
                </div>
              </Card>

              <div className="p-3 rounded-lg border bg-muted/30 text-[11px] space-y-1">
                <strong>Progress & Remarks:</strong>
                <p className="text-muted-foreground">{selectedRecord.remarks}</p>
                <div className="pt-2 text-[10px] text-muted-foreground flex items-center gap-2">
                  <Camera className="size-3" /> Attached Site Photos: {selectedRecord.sitePhotosCount} verified on record
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
