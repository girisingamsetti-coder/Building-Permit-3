"use client";

import * as React from "react";
import {
  Building2,
  Search,
  Filter,
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  ArrowLeft,
  FileText,
  SlidersHorizontal,
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
import { useAppStore } from "@/store/app-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getOccupancyRecords,
  getOccupancyRecordById,
  type OccupancyApplicationRecord,
} from "@/data/occupancy-data";
import { OccupancyPanel } from "./occupancy-panel";

export function OccupancyView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStateFilter, setSelectedStateFilter] = React.useState<string>("ALL");
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);

  const records = getOccupancyRecords();

  const filteredData = React.useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.occupancyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState =
        selectedStateFilter === "ALL" ||
        item.state === selectedStateFilter;

      return matchesSearch && matchesState;
    });
  }, [records, searchTerm, selectedStateFilter]);

  // Derived KPIs
  const stats = React.useMemo(() => {
    return {
      total: records.length,
      issued: records.filter((r) => r.state === "CERTIFICATE_ISSUED").length,
      approved: records.filter((r) => r.state === "APPROVED").length,
      recommended: records.filter((r) => r.state === "RECOMMENDED").length,
      inspected: records.filter((r) => r.state === "INSPECTION_COMPLETED").length,
      pending: records.filter((r) => r.state === "INSPECTION_PENDING").length,
      shortfall: records.filter((r) => r.state === "SHORTFALL").length,
      submitted: records.filter((r) => r.state === "SUBMITTED").length,
      rejected: records.filter((r) => r.state === "REJECTED").length,
    };
  }, [records]);

  // If a record is selected, show its full detailed OccupancyPanel
  if (selectedRecordId) {
    const selectedRecord = getOccupancyRecordById(selectedRecordId) ?? records[0];
    return (
      <div className="space-y-4">
        {/* Quick jump navigation toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRecordId(null)}
              className="gap-1.5 text-xs h-8"
            >
              <ArrowLeft className="size-3.5" /> Back to Register
            </Button>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="font-semibold text-xs text-foreground font-mono">
              {selectedRecord.occupancyNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground text-[11px] hidden sm:inline">Jump to another application:</span>
            <Select value={selectedRecord.id} onValueChange={setSelectedRecordId}>
              <SelectTrigger className="h-8 w-[280px] text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {records.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="font-mono text-xs">
                    {r.occupancyNumber} — {r.owner.name} ({r.state})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Master Occupancy Panel */}
        <OccupancyPanel
          initialRecord={selectedRecord}
          onBack={() => setSelectedRecordId(null)}
          showBackButton={false}
        />
      </div>
    );
  }

  // Otherwise, render the main Register View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Building2 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Occupancy Register</h1>
              <p className="text-xs text-muted-foreground">
                Track completion intimations, site inspections, as-built comparisons, and occupancy certificates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            selectedStateFilter === "ALL" && "ring-2 ring-primary"
          )}
          onClick={() => setSelectedStateFilter("ALL")}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Files</span>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-emerald-500",
            selectedStateFilter === "CERTIFICATE_ISSUED" && "ring-2 ring-emerald-500"
          )}
          onClick={() => setSelectedStateFilter("CERTIFICATE_ISSUED")}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <Award className="size-3" /> Issued
            </span>
            <p className="text-2xl font-bold text-emerald-700">{stats.issued}</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-blue-500",
            selectedStateFilter === "RECOMMENDED" && "ring-2 ring-blue-500"
          )}
          onClick={() => setSelectedStateFilter("RECOMMENDED")}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-blue-600 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Recommended
            </span>
            <p className="text-2xl font-bold text-blue-700">{stats.recommended}</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-amber-500",
            selectedStateFilter === "INSPECTION_PENDING" && "ring-2 ring-amber-500"
          )}
          onClick={() => setSelectedStateFilter("INSPECTION_PENDING")}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
              <Clock className="size-3" /> Pending Insp
            </span>
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-red-500",
            selectedStateFilter === "SHORTFALL" && "ring-2 ring-red-500"
          )}
          onClick={() => setSelectedStateFilter("SHORTFALL")}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-red-600 flex items-center gap-1">
              <AlertTriangle className="size-3" /> Shortfall
            </span>
            <p className="text-2xl font-bold text-red-700">{stats.shortfall}</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-slate-500",
            selectedStateFilter === "SUBMITTED" && "ring-2 ring-slate-500"
          )}
          onClick={() => setSelectedStateFilter("SUBMITTED")}
        >
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="size-3" /> Submitted
            </span>
            <p className="text-2xl font-bold text-foreground">{stats.submitted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Register Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Applications Register</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredData.length} of {records.length} occupancy applications
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder=""
                  className="pl-8 text-xs h-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedStateFilter} onValueChange={setSelectedStateFilter}>
                <SelectTrigger className="h-8 w-[190px] text-xs">
                  <span className="text-[11px] font-bold text-slate-600 mr-1 shrink-0">Status:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="CERTIFICATE_ISSUED">Certificate Issued</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="RECOMMENDED">Recommended</SelectItem>
                  <SelectItem value="INSPECTION_COMPLETED">Inspection Completed</SelectItem>
                  <SelectItem value="INSPECTION_PENDING">Inspection Pending</SelectItem>
                  <SelectItem value="SHORTFALL">Shortfall</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                title="Reset filters"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStateFilter("ALL");
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="w-36 py-2 px-3 whitespace-nowrap">Occupancy Ref</th>
                  <th className="w-36 py-2 px-3 whitespace-nowrap">Application / BPO</th>
                  <th className="w-52 max-w-[220px] py-2 px-3">Owner / Applicant</th>
                  <th className="w-28 py-2 px-2.5 whitespace-nowrap">Timeline Dates</th>
                  <th className="w-32 py-2 px-2.5 whitespace-nowrap">Current Status &amp; Desk</th>
                  <th className="w-28 py-2 px-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No matching occupancy records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedRecordId(row.id)}
                    >
                      <td className="w-36 py-2 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-primary group-hover:underline">
                          {row.occupancyNumber}
                        </div>
                        {row.certificate && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-300 text-emerald-700 bg-emerald-50">
                              CERT
                            </Badge>
                            <span className="font-mono">{row.certificate.certificateNumber}</span>
                          </div>
                        )}
                      </td>
                      <td className="w-36 py-2 px-3 whitespace-nowrap">
                        <div className="font-medium text-foreground">{row.applicationNumber}</div>
                        <div className="text-[11px] text-muted-foreground">{row.orderNumber}</div>
                      </td>
                      <td className="w-52 max-w-[220px] py-2 px-3">
                        <div className="font-medium text-foreground truncate">{row.owner.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                          {row.project.name}
                        </div>
                      </td>
                      <td className="w-28 py-2 px-2.5 whitespace-nowrap">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Comp:</span>
                            <span className="font-medium text-foreground">
                              {new Date(row.completionDate).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Subm:</span>
                            <span className="text-foreground">
                              {new Date(row.submittedAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="w-32 py-2 px-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <RowStateBadge state={row.state} />
                          <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                            Desk: <strong className="text-foreground">{row.currentDesk}</strong>
                          </span>
                        </div>
                      </td>
                      <td className="w-28 py-2 px-3 text-center whitespace-nowrap">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs bg-primary hover:bg-primary/90 text-white gap-1 px-3 shadow-2xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecordId(row.id);
                          }}
                        >
                          <Eye className="size-3" /> View All Data
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RowStateBadge({ state }: { state: OccupancyApplicationRecord["state"] }) {
  switch (state) {
    case "CERTIFICATE_ISSUED":
      return <Badge className="bg-emerald-600 text-white text-[10px] h-5">Certificate Issued</Badge>;
    case "APPROVED":
      return <Badge className="bg-emerald-500 text-white text-[10px] h-5">Approved</Badge>;
    case "RECOMMENDED":
      return <Badge className="bg-blue-600 text-white text-[10px] h-5">Recommended</Badge>;
    case "INSPECTION_COMPLETED":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] h-5">Inspected</Badge>;
    case "INSPECTION_PENDING":
      return <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 text-[10px] h-5">Insp. Pending</Badge>;
    case "SHORTFALL":
      return <Badge variant="destructive" className="text-[10px] h-5">Shortfall</Badge>;
    case "REJECTED":
      return <Badge variant="destructive" className="bg-red-800 text-white text-[10px] h-5">Rejected</Badge>;
    case "SUBMITTED":
    default:
      return <Badge variant="outline" className="text-[10px] h-5">Submitted</Badge>;
  }
}
