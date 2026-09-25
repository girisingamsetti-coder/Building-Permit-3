"use client";

import * as React from "react";
import {
  MapPin,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  ShieldCheck,
  FileText,
  UserCheck,
  X,
  Compass,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  MOCK_INSPECTIONS,
  type SiteInspectionRecord,
  type InspectionChecklistItem,
} from "@/data/modules-data";

export function InspectionsView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedInspection, setSelectedInspection] = React.useState<SiteInspectionRecord | null>(null);

  const inspections = MOCK_INSPECTIONS;

  const filtered = React.useMemo(() => {
    return inspections.filter((item) => {
      const matchSearch =
        item.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [inspections, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: inspections.length,
      pending: inspections.filter((i) => i.status === "SCHEDULED" || i.status === "IN_PROGRESS").length,
      completed: inspections.filter((i) => i.status === "COMPLETED").length,
      shortfall: inspections.filter((i) => i.status === "SHORTFALL").length,
      overdue: inspections.filter((i) => i.overdue).length,
    };
  }, [inspections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-6" />
            </div>
            Site Inspections Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Statutory site inspections — 27 questions checklist, geo-tagged survey photos, physical setbacks, and officer recommendations.
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
            <CardDescription className="text-xs font-medium">All Inspections</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total scheduled & past rounds
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "SCHEDULED" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("SCHEDULED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> Pending Visits
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.pending}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Scheduled on calendar
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "COMPLETED" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("COMPLETED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Completed
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.completed}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Signed inspection reports
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
              <AlertTriangle className="size-3.5" /> Shortfalls / Issues
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.shortfall}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Requires field rectification
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search application, inspector, site…"
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="SHORTFALL">Shortfall Raised</option>
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
                <th className="py-3 px-4">Inspection # / App #</th>
                <th className="py-3 px-4">Site & Owner</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Scheduled / Done</th>
                <th className="py-3 px-4">Round</th>
                <th className="py-3 px-4">Status & Rec.</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No inspections found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.inspectionNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate font-medium text-foreground">{item.siteAddress}</div>
                      <div className="text-[11px] text-muted-foreground">Owner: {item.ownerName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.inspectorName}</div>
                      <div className="text-[11px] text-muted-foreground">{item.inspectorDesignation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="size-3 text-muted-foreground" />
                        {item.scheduledDate}
                      </div>
                      {item.inspectedDate && (
                        <div className="text-[11px] text-muted-foreground">Done: {item.inspectedDate}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Round {item.round}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Camera className="size-2.5" /> {item.photos.length} photos
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          className={cn(
                            "text-[10px] uppercase font-semibold",
                            item.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : item.status === "SCHEDULED"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : item.status === "SHORTFALL"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Rec: <strong className="text-foreground">{item.recommendation}</strong>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInspection(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> View Report
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
      {selectedInspection && (
        <Dialog open={!!selectedInspection} onOpenChange={(open) => !open && setSelectedInspection(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="size-5 text-primary" />
                    Inspection Report: {selectedInspection.inspectionNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                    Application #{selectedInspection.applicationNumber} · Round {selectedInspection.round} · {selectedInspection.siteAddress}
                  </DialogDescription>
                </div>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedInspection.status === "COMPLETED"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedInspection.status}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs defaultValue="checklist" className="mt-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="checklist" className="text-xs">
                  27-Point Checklist ({selectedInspection.checklist.length})
                </TabsTrigger>
                <TabsTrigger value="photos" className="text-xs">
                  Site Photos ({selectedInspection.photos.length})
                </TabsTrigger>
                <TabsTrigger value="recommendation" className="text-xs">
                  Recommendation & Sign
                </TabsTrigger>
              </TabsList>

              {/* Checklist tab */}
              <TabsContent value="checklist" className="space-y-3 mt-3">
                <div className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/50 border">
                  Statutory 27-point physical inspection checklist under TPA Manual §5.8. Observations recorded on site.
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {selectedInspection.checklist.map((c) => (
                    <div
                      key={c.itemNumber}
                      className="p-3 rounded-lg border border-border bg-card/60 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-muted rounded">
                            Q{c.itemNumber}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {c.category}
                          </span>
                          {c.affectsRisk && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                              Risk Factor
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground font-medium">{c.question}</p>
                        {c.observation && (
                          <p className="text-[11px] text-muted-foreground italic">
                            Observation: {c.observation}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0 font-mono text-xs px-2.5 py-1",
                          c.response === "Yes"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : c.response === "No"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        {c.response}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Photos tab */}
              <TabsContent value="photos" className="space-y-3 mt-3">
                {selectedInspection.photos.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    No geotagged site photographs attached to this inspection yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedInspection.photos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden border border-border">
                        <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                          <Compass className="size-8 mb-2 opacity-60 text-primary" />
                          <span className="text-xs font-semibold text-white">{photo.category}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1">
                            Lat: {photo.latitude.toFixed(4)}, Long: {photo.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="p-2.5 text-[11px] bg-card space-y-1">
                          <div className="font-mono text-xs font-semibold truncate text-foreground">{photo.fileName}</div>
                          <div className="text-muted-foreground text-[10px] flex items-center justify-between">
                            <span>{photo.capturedAt}</span>
                            <span>{photo.uploadedBy}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Recommendation & Sign tab */}
              <TabsContent value="recommendation" className="space-y-4 mt-3">
                <Card className="p-4 border">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" /> Officer Findings & Recommendation
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">Measured Plot Area:</span>{" "}
                      <strong className="text-foreground">{selectedInspection.plotAreaMeasured} sq.m</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Measured Abutting Road:</span>{" "}
                      <strong className="text-foreground">{selectedInspection.roadWidthMeasured} m</strong>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/60 border text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Final Recommendation:</span>
                      <Badge
                        className={cn(
                          "font-bold",
                          selectedInspection.recommendation === "RECOMMENDED"
                            ? "bg-emerald-600 text-white"
                            : selectedInspection.recommendation === "SHORTFALL"
                            ? "bg-amber-600 text-white"
                            : "bg-red-600 text-white"
                        )}
                      >
                        {selectedInspection.recommendation}
                      </Badge>
                    </div>
                    {selectedInspection.recommendationRemarks && (
                      <p className="text-foreground">{selectedInspection.recommendationRemarks}</p>
                    )}
                  </div>
                  {selectedInspection.signedByName && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-4 text-emerald-600" />
                        <span>Digitally Signed by: <strong className="text-foreground">{selectedInspection.signedByName}</strong></span>
                      </div>
                      <span>{selectedInspection.signedAt}</span>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
