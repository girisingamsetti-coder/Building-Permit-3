"use client";

import * as React from "react";
import {
  Send,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  CheckCheck,
  Undo2,
  Inbox,
  Mail,
  FileText,
  MapPin,
  Barcode,
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
import { MOCK_OUTWARD, type OutwardRecord } from "@/data/modules-data";

export function OutwardView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [selectedOutward, setSelectedOutward] = React.useState<OutwardRecord | null>(null);

  const dispatches = MOCK_OUTWARD;

  const filtered = React.useMemo(() => {
    return dispatches.filter((item) => {
      const matchSearch =
        item.dispatchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchType = typeFilter === "ALL" || item.documentType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [dispatches, searchTerm, statusFilter, typeFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: dispatches.length,
      pending: dispatches.filter((d) => d.status === "PENDING").length,
      inTransit: dispatches.filter((d) => d.status === "DISPATCHED").length,
      delivered: dispatches.filter((d) => d.status === "DELIVERED" || d.status === "ACKNOWLEDGED").length,
      returned: dispatches.filter((d) => d.status === "RETURNED").length,
    };
  }, [dispatches]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Send className="size-6" />
            </div>
            Outward Dispatch Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every document leaving the ULB office — Building Permission Orders, Occupancy Certificates, Show Cause Notices & Revocations.
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
            <CardDescription className="text-xs font-medium">All Dispatches</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total outward consignments
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "DISPATCHED" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("DISPATCHED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Truck className="size-3.5" /> In Transit
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.inTransit}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Dispatched via postal / courier
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "ACKNOWLEDGED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("ACKNOWLEDGED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCheck className="size-3.5" /> Acknowledged / Done
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.delivered}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Postal receipt acknowledged
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "RETURNED" ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("RETURNED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Undo2 className="size-3.5" /> Returned Undelivered
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.returned}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Door locked / incorrect address
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search dispatch #, tracking #, recipient…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Document Types</option>
            <option value="BUILDING_PERMIT_ORDER">Building Permit Order</option>
            <option value="OCCUPANCY_CERTIFICATE">Occupancy Certificate</option>
            <option value="SHOW_CAUSE_NOTICE">Show Cause Notice</option>
            <option value="REVOCATION_ORDER">Revocation Order</option>
            <option value="HEARING_NOTICE">Hearing Notice</option>
            <option value="SHORTFALL_MEMO">Shortfall Memo</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="DISPATCHED">In Transit / Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="PENDING">Pending Dispatch</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Dispatch # / App #</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Mode & Tracking #</th>
                <th className="py-3 px-4">Recipient & Address</th>
                <th className="py-3 px-4">Dispatch Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No outward dispatch entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.dispatchNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {item.documentType.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Truck className="size-3 text-primary" /> {item.dispatchMode.replace(/_/g, " ")}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{item.trackingNumber}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.recipientName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{item.recipientAddress}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] font-medium text-foreground">{item.dispatchDate}</div>
                      {item.deliveryDate && (
                        <div className="text-[10px] text-emerald-600">Delivered: {item.deliveryDate}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "ACKNOWLEDGED" || item.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "DISPATCHED"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : item.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOutward(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> Consignment
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
      {selectedOutward && (
        <Dialog open={!!selectedOutward} onOpenChange={(open) => !open && setSelectedOutward(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Barcode className="size-5 text-indigo-600" />
                  Consignment #{selectedOutward.trackingNumber}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedOutward.status === "ACKNOWLEDGED"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                  )}
                >
                  {selectedOutward.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs font-mono">
                Dispatch Record: {selectedOutward.dispatchNumber} · File #{selectedOutward.applicationNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Type:</span>
                  <span className="font-semibold text-foreground">{selectedOutward.documentType.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatch Mode:</span>
                  <span className="font-medium text-foreground">{selectedOutward.dispatchMode.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatched By Officer:</span>
                  <span className="text-foreground">{selectedOutward.senderOfficer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatched At:</span>
                  <span className="text-foreground">{selectedOutward.dispatchDate}</span>
                </div>
                {selectedOutward.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery / Acknowledged At:</span>
                    <span className="font-bold text-emerald-600">{selectedOutward.deliveryDate}</span>
                  </div>
                )}
              </div>

              <Card className="p-3 border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Recipient Address & Acknowledgement
                </span>
                <div className="font-semibold text-foreground text-sm">{selectedOutward.recipientName}</div>
                <div className="text-muted-foreground mt-1">{selectedOutward.recipientAddress}</div>
              </Card>

              {selectedOutward.remarks && (
                <div className="p-2.5 rounded-lg border bg-muted/30 text-[11px]">
                  <strong>Dispatch Note:</strong> {selectedOutward.remarks}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
