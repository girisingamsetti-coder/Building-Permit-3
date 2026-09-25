"use client";

import * as React from "react";
import {
  FileBadge2,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  Plane,
  Train,
  Trees,
  Waves,
  Landmark,
  FileText,
  ShieldAlert,
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
import { MOCK_NOCS, type NocRecord } from "@/data/modules-data";

const NOC_ICONS: Record<string, React.ReactNode> = {
  FIRE: <Flame className="size-4 text-orange-500" />,
  AIRPORT: <Plane className="size-4 text-sky-500" />,
  RAILWAY: <Train className="size-4 text-indigo-500" />,
  ENVIRONMENT: <Trees className="size-4 text-emerald-500" />,
  WATER_RESOURCES: <Waves className="size-4 text-blue-500" />,
  HERITAGE: <Landmark className="size-4 text-amber-500" />,
  OTHER: <Building className="size-4 text-slate-500" />,
};

export function NocsView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [selectedNoc, setSelectedNoc] = React.useState<NocRecord | null>(null);

  const nocs = MOCK_NOCS;

  const filtered = React.useMemo(() => {
    return nocs.filter((item) => {
      const matchSearch =
        item.nocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchType = typeFilter === "ALL" || item.nocType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [nocs, searchTerm, statusFilter, typeFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: nocs.length,
      pending: nocs.filter((n) => n.status === "PENDING" || n.status === "RECEIVED").length,
      verified: nocs.filter((n) => n.status === "VERIFIED").length,
      shortfall: nocs.filter((n) => n.status === "SHORTFALL" || n.status === "REJECTED").length,
    };
  }, [nocs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <FileBadge2 className="size-6" />
            </div>
            NOCs Register (No-Objection Certificates)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Departmental & External Authority Clearances — Fire Services, Airports Authority, Environment, Railways & Heritage.
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
            <CardDescription className="text-xs font-medium">All NOCs</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Clearance requirements on files
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "PENDING" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> Pending / Awaiting
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.pending}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Awaiting certificate upload
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "VERIFIED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("VERIFIED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Verified Valid
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.verified}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Inspected & cleared by officer
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "SHORTFALL" ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("SHORTFALL")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="size-3.5" /> Shortfalls / Rejected
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.shortfall}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Requires authority re-clearance
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search NOC #, application, authority…"
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
            <option value="ALL">All NOC Types</option>
            <option value="FIRE">Fire NOC</option>
            <option value="AIRPORT">Airport Authority</option>
            <option value="RAILWAY">Railway</option>
            <option value="ENVIRONMENT">Environmental</option>
            <option value="WATER_RESOURCES">Water Resources</option>
            <option value="HERITAGE">Heritage</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="RECEIVED">Received</option>
            <option value="PENDING">Pending</option>
            <option value="SHORTFALL">Shortfall</option>
            <option value="REJECTED">Rejected</option>
            <option value="NOT_REQUIRED">Not Required</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">NOC # / App #</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Issuing Authority</th>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No NOC records found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.nocNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        {NOC_ICONS[item.nocType]}
                        {item.nocTypeName}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate font-medium text-foreground">{item.authority}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {item.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      {item.issuedDate ? (
                        <div>
                          <div className="text-[11px] font-medium text-foreground">Issued: {item.issuedDate}</div>
                          {item.expiryDate && (
                            <div className="text-[10px] text-muted-foreground">Expires: {item.expiryDate}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic">Not issued yet</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "RECEIVED"
                            ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                            : item.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : item.status === "SHORTFALL"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedNoc(item)}
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
      {selectedNoc && (
        <Dialog open={!!selectedNoc} onOpenChange={(open) => !open && setSelectedNoc(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  {NOC_ICONS[selectedNoc.nocType]}
                  {selectedNoc.nocTypeName} Details
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedNoc.status === "VERIFIED"
                      ? "bg-emerald-600 text-white"
                      : selectedNoc.status === "SHORTFALL"
                      ? "bg-red-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedNoc.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                NOC #{selectedNoc.nocNumber} · Application #{selectedNoc.applicationNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issuing Authority:</span>
                  <span className="font-semibold text-foreground text-right">{selectedNoc.authority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authority Ref #:</span>
                  <span className="font-mono text-foreground">{selectedNoc.referenceNumber}</span>
                </div>
                {selectedNoc.issuedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Issuance:</span>
                    <span className="font-medium text-foreground">{selectedNoc.issuedDate}</span>
                  </div>
                )}
                {selectedNoc.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validity Expiry:</span>
                    <span className="font-medium text-foreground">{selectedNoc.expiryDate}</span>
                  </div>
                )}
                {selectedNoc.verifiedBy && (
                  <div className="flex justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Verified by Desk:</span>
                    <span className="font-medium text-foreground">{selectedNoc.verifiedBy} ({selectedNoc.verifiedAt})</span>
                  </div>
                )}
              </div>

              {selectedNoc.conditions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                    <FileText className="size-3.5 text-primary" /> Authority Conditions & Stated Clearances:
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-muted-foreground text-[11px]">
                    {selectedNoc.conditions.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNoc.remarks && (
                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300 text-[11px]">
                  <strong>Desk Note:</strong> {selectedNoc.remarks}
                </div>
              )}

              {selectedNoc.hasDocument && (
                <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <div>
                      <div className="font-semibold text-xs">{selectedNoc.fileName}</div>
                      <div className="text-[10px] text-muted-foreground">Signed Digital Certificate Document</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Download
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
