"use client";

import * as React from "react";
import {
  Building2,
  Award,
  Check,
  ClipboardCheck,
  FileWarning,
  Gavel,
  Info,
  Ruler,
  Send,
  Eye,
  Download,
  Calendar,
  User,
  Clock,
  FileText,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Printer,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AS_BUILT_PARAMETERS,
  OCCUPANCY_DOCUMENTS,
  OCCUPANCY_DOCUMENT_LABEL,
  OCCUPANCY_PHOTO_LABEL,
  OCCUPANCY_STATE_LABEL,
  compareAsBuilt,
  type AsBuiltKey,
  type OccupancyPhotoView,
  type OccupancyRegisterState,
} from "@/lib/occupancy";
import {
  type OccupancyApplicationRecord,
  type InspectionRecord,
  PHOTO_SVGS,
  updateOccupancyRecord,
} from "@/data/occupancy-data";
import { OccupancyCertificateModal } from "./occupancy-certificate-modal";

export function OccupancyPanel({
  initialRecord,
  onBack,
  showBackButton = true,
}: {
  initialRecord: OccupancyApplicationRecord;
  onBack?: () => void;
  showBackButton?: boolean;
}) {
  const [record, setRecord] = React.useState<OccupancyApplicationRecord>(initialRecord);
  const [selectedInspectionRound, setSelectedInspectionRound] = React.useState<number>(
    initialRecord.inspections.length > 0 ? initialRecord.inspections.at(-1)!.round : 1
  );
  const [certModalOpen, setCertModalOpen] = React.useState(false);
  const [previewPhoto, setPreviewPhoto] = React.useState<{ view: OccupancyPhotoView; label: string } | null>(null);
  const [previewDoc, setPreviewDoc] = React.useState<{ name: string; kind: string } | null>(null);

  // Dialog states for lifecycle actions
  const [activeDialog, setActiveDialog] = React.useState<
    "schedule" | "inspect" | "recommend" | "shortfall" | "respond" | "decide" | "issue" | null
  >(null);

  // Sync state if initialRecord changes
  React.useEffect(() => {
    setRecord(initialRecord);
    if (initialRecord.inspections.length > 0) {
      setSelectedInspectionRound(initialRecord.inspections.at(-1)!.round);
    }
  }, [initialRecord]);

  const currentInspection = record.inspections.find((i) => i.round === selectedInspectionRound) ?? record.inspections.at(-1);

  // Helper to re-render updated data from cache
  const refresh = (updated: OccupancyApplicationRecord) => {
    setRecord({ ...updated });
    if (updated.inspections.length > 0) {
      setSelectedInspectionRound(updated.inspections.at(-1)!.round);
    }
    setActiveDialog(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {showBackButton && onBack && (
                <Button variant="outline" size="sm" onClick={onBack} className="h-8 gap-1 text-xs">
                  ← Back to Register
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Occupancy — {record.occupancyNumber}
                </h1>
              </div>
              <StateBadge state={record.state} />
              {record.round > 1 && (
                <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/50">
                  Round {record.round}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs flex flex-wrap items-center gap-x-2 text-muted-foreground">
              <span>App: <strong className="font-semibold text-foreground">{record.applicationNumber}</strong></span>
              <span>·</span>
              <span>{record.project.name}</span>
              <span>·</span>
              <span>{record.project.zone}</span>
              <span>·</span>
              <span className="text-primary font-medium">Current Desk: {record.currentDesk}</span>
            </CardDescription>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {record.state === "SUBMITTED" && (
              <Button size="sm" onClick={() => setActiveDialog("schedule")} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm">
                <ClipboardCheck className="size-3.5" /> Schedule Final Inspection
              </Button>
            )}

            {record.state === "INSPECTION_PENDING" && (
              <Button size="sm" onClick={() => setActiveDialog("inspect")} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm">
                <ClipboardCheck className="size-3.5" /> Record Final Inspection
              </Button>
            )}

            {record.state === "INSPECTION_COMPLETED" && (
              <>
                <Button size="sm" onClick={() => setActiveDialog("recommend")} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
                  <Ruler className="size-3.5" /> Recommend
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveDialog("shortfall")} className="text-amber-700 border-amber-300 hover:bg-amber-50 gap-1.5">
                  <FileWarning className="size-3.5" /> Raise Shortfall
                </Button>
              </>
            )}

            {record.state === "SHORTFALL" && (
              <Button size="sm" onClick={() => setActiveDialog("respond")} className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-sm">
                <Send className="size-3.5" /> Answer Shortfall
              </Button>
            )}

            {record.state === "RECOMMENDED" && (
              <Button size="sm" onClick={() => setActiveDialog("decide")} className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-sm">
                <Gavel className="size-3.5" /> Decide (Approve / Reject)
              </Button>
            )}

            {record.state === "APPROVED" && (
              <Button size="sm" onClick={() => setActiveDialog("issue")} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm">
                <Award className="size-3.5" /> Issue Occupancy Certificate
              </Button>
            )}

            {record.certificate && (
              <Button size="sm" variant="default" onClick={() => setCertModalOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white gap-1.5 shadow-sm">
                <Award className="size-3.5" /> View Official Certificate
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-0">
          {/* 6-Stage Progress Stepper */}
          <ProcessStepper state={record.state} />

          {/* Quick Key Metrics Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-4 rounded-xl bg-muted/40 border border-border text-xs">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">Building Permission Order</span>
              <span className="font-semibold text-foreground">{record.orderNumber}</span>
              <span className="text-[10px] text-muted-foreground block">
                Issued {new Date(record.orderIssuedAt).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">Work Commenced Notice</span>
              <span className="font-semibold text-foreground">{record.commencementNumber || "COMM/2026/012"}</span>
              <span className="text-[10px] text-muted-foreground block">
                Commenced {new Date(record.commencementDate).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">Owner / Applicant</span>
              <span className="font-semibold text-foreground">{record.owner.name}</span>
              <span className="text-[10px] text-muted-foreground block">{record.owner.contact}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">Licensed Technical Person (LTP)</span>
              <span className="font-semibold text-foreground">{record.ltp.name}</span>
              <span className="text-[10px] text-muted-foreground block">Licence: {record.ltp.licenceNo}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION CARD 1: Completion Intimation & Documents */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="size-4 text-primary" /> Completion Intimation &amp; Statutory Documents
          </CardTitle>
          <CardDescription className="text-xs">
            Formally submitted by the Licensed Technical Person on the owner's behalf upon physical completion of the building.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-muted-foreground block">Completion Date</span>
              <span className="font-semibold text-foreground text-sm">{new Date(record.completionDate).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-muted-foreground block">Submitted At</span>
              <span className="font-semibold text-foreground text-sm">{new Date(record.submittedAt).toLocaleDateString("en-IN")}</span>
              <span className="text-[10px] text-muted-foreground block">by {record.submittedByName}</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-muted-foreground block">Sanctioned Area</span>
              <span className="font-semibold text-foreground text-sm">{record.project.approvedAreaSqm.toLocaleString()} sq m</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-muted-foreground block">Building Use</span>
              <span className="font-semibold text-foreground text-sm">{record.project.type}</span>
            </div>
          </div>

          {record.completionRemarks && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wide text-[10px] block mb-1">Applicant Completion Remarks:</span>
              <p className="text-muted-foreground leading-relaxed">{record.completionRemarks}</p>
            </div>
          )}

          {/* Document Register */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Enclosed Statutory Occupancy Documents ({record.documents.length})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {OCCUPANCY_DOCUMENTS.map((kind) => {
                const doc = record.documents.find((d) => d.kind === kind);
                return (
                  <div
                    key={kind}
                    className="flex flex-col justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-foreground line-clamp-1">
                          {OCCUPANCY_DOCUMENT_LABEL[kind]}
                        </span>
                        {doc ? (
                          <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                            Attached
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Not Attached
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {doc ? doc.fileName : "Pending submission"}
                      </p>
                    </div>

                    {doc && (
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-border text-[11px]">
                        <span className="text-muted-foreground">
                          {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB · Rd {doc.round}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-primary hover:text-primary/80 gap-1"
                          onClick={() => setPreviewDoc({ name: doc.fileName, kind: OCCUPANCY_DOCUMENT_LABEL[kind] })}
                        >
                          <Eye className="size-3" /> View
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION CARD 2: Final Site Inspection Reports */}
      {record.inspections.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="size-4 text-emerald-600" /> Final Site Inspection Report
              </CardTitle>
              <CardDescription className="text-xs">
                Physical on-site scrutiny conducted by Town Planning Assistant.
              </CardDescription>
            </div>

            {/* Round switcher */}
            {record.inspections.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Rounds:</span>
                {record.inspections.map((insp) => (
                  <Button
                    key={insp.round}
                    variant={selectedInspectionRound === insp.round ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setSelectedInspectionRound(insp.round)}
                  >
                    Round {insp.round}
                  </Button>
                ))}
              </div>
            )}
          </CardHeader>

          {currentInspection && (
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-muted/40 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-foreground">{currentInspection.inspectorName}</span>
                    <span className="text-muted-foreground"> ({currentInspection.inspectorDesignation})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    Inspected on: <strong className="text-foreground">{currentInspection.inspectedAt ? new Date(currentInspection.inspectedAt).toLocaleDateString("en-IN") : "Scheduled"}</strong>
                  </span>
                  {currentInspection.recommendation && (
                    <Badge
                      className={
                        currentInspection.recommendation === "RECOMMENDED"
                          ? "bg-emerald-600 text-white"
                          : currentInspection.recommendation === "SHORTFALL"
                          ? "bg-amber-600 text-white"
                          : "bg-red-600 text-white"
                      }
                    >
                      {currentInspection.recommendation}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Inspection Findings Details */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Site Condition
                  </span>
                  <p className="text-foreground leading-relaxed">{currentInspection.siteCondition}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Actual Construction Observed
                  </span>
                  <p className="text-foreground leading-relaxed">{currentInspection.actualConstruction}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Sanctioned Construction Comparison
                  </span>
                  <p className="text-foreground leading-relaxed">{currentInspection.approvedConstruction}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Recorded Deviations
                  </span>
                  <p className={cn("leading-relaxed", currentInspection.deviations ? "text-amber-700 font-medium" : "text-emerald-700")}>
                    {currentInspection.deviations || "No deviations recorded — fully compliant."}
                  </p>
                </div>
              </div>

              {currentInspection.remarks && (
                <div className="p-3 rounded-lg bg-card border border-border text-xs">
                  <span className="font-semibold text-foreground uppercase tracking-wide text-[10px] block mb-1">
                    Inspector Technical Remarks:
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{currentInspection.remarks}</p>
                </div>
              )}

              {/* Photo Gallery with Lightbox trigger */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Geotagged Site Inspection Photographs ({currentInspection.photos.length || 6})</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Click any photo to enlarge</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(["FRONT_ELEVATION", "REAR_ELEVATION", "SIDE_SETBACK", "PARKING", "INTERIOR", "TERRACE"] as OccupancyPhotoView[]).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setPreviewPhoto({ view, label: OCCUPANCY_PHOTO_LABEL[view] })}
                      className="group relative flex flex-col rounded-lg border border-border overflow-hidden bg-muted/20 hover:border-primary transition-all text-left shadow-xs"
                    >
                      <div className="aspect-[16/11] w-full overflow-hidden bg-slate-900 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={PHOTO_SVGS[view]}
                          alt={OCCUPANCY_PHOTO_LABEL[view]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="size-5 text-white" />
                        </div>
                      </div>
                      <div className="p-1.5 bg-card">
                        <span className="text-[11px] font-medium text-foreground block truncate">
                          {OCCUPANCY_PHOTO_LABEL[view]}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">Verified</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* SECTION CARD 3: As-Built Review & Parameter Comparison */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="size-4 text-blue-600" /> As-Built Review &amp; Parameter Comparison
            </CardTitle>
            <CardDescription className="text-xs">
              Sanctioned figures from Building Permission Order compared against physical field measurements.
            </CardDescription>
          </div>
          <div>
            {record.comparison.some((r) => r.verdict === "DEVIATION") ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" /> Deviations Found
              </Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white gap-1">
                <CheckCircle2 className="size-3" /> Within Permissible Tolerance
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-2.5">Parameter</th>
                  <th className="px-4 py-2.5">Sanctioned (BPO)</th>
                  <th className="px-4 py-2.5">As-Built Measured</th>
                  <th className="px-4 py-2.5">Difference</th>
                  <th className="px-4 py-2.5">Permissible Limit</th>
                  <th className="px-4 py-2.5 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {record.comparison.map((row) => (
                  <tr key={row.key} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{row.label}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                      {row.approved != null ? `${row.approved} ${row.unit}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-semibold text-foreground">
                      {row.asBuilt != null ? `${row.asBuilt} ${row.unit}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {row.difference != null ? (
                        <span className={row.verdict === "DEVIATION" ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                          {row.difference > 0 ? `+${row.difference}` : row.difference} {row.unit}
                          {row.differencePercent != null && ` (${row.differencePercent > 0 ? `+${row.differencePercent}` : row.differencePercent}%)`}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-[11px]">
                      {row.key === "floors" ? "Exact (0%)" : "±2.0% maximum"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.verdict === "DEVIATION" ? (
                        <Badge variant="destructive" className="text-[10px] h-5">
                          Deviation
                        </Badge>
                      ) : row.verdict === "WITHIN" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] h-5 hover:bg-emerald-200">
                          Within
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Not measured</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground italic">
            * Statutory note: Under APCRDA / Pune Municipal Building Rules, permissible construction deviation is capped at 2.0% for built-up area and ground coverage. Number of floors must exactly match sanctioned layout.
          </p>
        </CardContent>
      </Card>

      {/* SECTION CARD 4: Recommendation, Shortfall & Decision */}
      {(record.recommendation || record.shortfall || record.decision) && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gavel className="size-4 text-purple-600" /> Scrutiny Recommendation &amp; Final Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Shortfall Box */}
            {record.shortfall && (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 text-amber-600" /> Shortfall Notice Issued
                  </span>
                  <span className="text-[11px] text-amber-700">
                    By {record.shortfall.raisedByName} · {new Date(record.shortfall.raisedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-950 dark:text-amber-100">
                  {record.shortfall.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
                {record.shortfall.remarks && (
                  <p className="text-muted-foreground text-[11px] pt-1">
                    <em>Officer instructions:</em> {record.shortfall.remarks}
                  </p>
                )}
                {record.shortfall.response && (
                  <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200">
                    <span className="font-semibold text-foreground text-[11px] block">
                      Applicant Answer (Submitted {new Date(record.shortfall.respondedAt!).toLocaleDateString("en-IN")}):
                    </span>
                    <p className="text-muted-foreground mt-0.5">{record.shortfall.response}</p>
                  </div>
                )}
              </div>
            )}

            {/* Technical Recommendation */}
            {record.recommendation && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                    <Ruler className="size-3.5 text-blue-600" /> {record.recommendation.label}
                  </span>
                  <span className="text-[11px] text-blue-700">
                    Reviewed by {record.recommendation.reviewedByName} · {new Date(record.recommendation.reviewedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{record.recommendation.notes}</p>
              </div>
            )}

            {/* Final Decision */}
            {record.decision && (
              <div
                className={cn(
                  "p-4 rounded-xl border space-y-1.5",
                  record.decision.decision === "APPROVED"
                    ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-red-300 bg-red-50/50 dark:bg-red-950/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-semibold flex items-center gap-1.5",
                      record.decision.decision === "APPROVED" ? "text-emerald-900 dark:text-emerald-200" : "text-red-900 dark:text-red-200"
                    )}
                  >
                    {record.decision.decision === "APPROVED" ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="size-3.5 text-red-600" />
                    )}
                    Competent Authority Order: {record.decision.decision}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Decided by {record.decision.decidedByName} · {new Date(record.decision.decidedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{record.decision.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION CARD 5: Official Certificate Card */}
      {record.certificate && (
        <Card className="border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Award className="size-5 text-emerald-600" /> Occupancy Certificate — {record.certificate.certificateNumber}
              </CardTitle>
              <CardDescription className="text-xs text-emerald-700">
                Issued on {new Date(record.certificate.issuedAt).toLocaleDateString("en-IN")} by {record.certificate.issuedByName}. Dispatched via Outward No: {record.certificate.outwardNumber}.
              </CardDescription>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setCertModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
            >
              <Printer className="size-3.5" /> View Official Certificate PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-3 rounded-lg bg-card border border-emerald-200">
              <div>
                <span className="text-muted-foreground block text-[11px]">Certificate Number</span>
                <span className="font-mono font-bold text-foreground">{record.certificate.certificateNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Issue Date</span>
                <span className="font-semibold text-foreground">{new Date(record.certificate.issuedAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Sanctioned Area</span>
                <span className="font-semibold text-foreground">{record.certificate.approvedAreaSqm.toLocaleString()} sq m</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Certified Completed Area</span>
                <span className="font-bold text-emerald-700 text-sm">{record.certificate.completedAreaSqm.toLocaleString()} sq m</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] block">
                Certificate Conditions:
              </span>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground text-[11px]">
                {record.certificate.conditions.slice(0, 4).map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION CARD 6: Event History & Audit Log */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="size-4 text-primary" /> Lifecycle Proceedings &amp; Audit Trail
          </CardTitle>
          <CardDescription className="text-xs">
            Complete sequential log of all statutory proceedings, inspections and orders on this file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3.5 relative border-l-2 border-border ml-2 pl-4 text-xs">
            {record.events.map((ev) => (
              <li key={ev.id} className="relative group">
                <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary border-2 border-background" />
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="font-semibold text-foreground">
                    {ev.action.replace(/_/g, " ")}
                    {ev.toStatus && <span className="font-normal text-muted-foreground"> → {ev.toStatus}</span>}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(ev.occurredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>
                <div className="text-muted-foreground text-[11px] flex items-center gap-2 mt-0.5">
                  <span className="font-medium text-foreground">{ev.actorName}</span>
                  {ev.actorRoleKey && <span>({ev.actorRoleKey})</span>}
                  {ev.stageName && <span>· {ev.stageName}</span>}
                </div>
                {ev.remarks && (
                  <p className="mt-1 p-2 rounded bg-muted/40 text-foreground text-[11px]">
                    {ev.remarks}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Certificate Modal */}
      <OccupancyCertificateModal
        record={record}
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
      />

      {/* Photo Lightbox Dialog */}
      {previewPhoto && (
        <Dialog open onOpenChange={(o) => !o && setPreviewPhoto(null)}>
          <DialogContent className="max-w-3xl p-4">
            <DialogHeader>
              <DialogTitle className="text-base">{previewPhoto.label}</DialogTitle>
              <DialogDescription className="text-xs">
                Site scrutiny photograph captured during inspection. Geotag verified.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg overflow-hidden border border-border bg-slate-950 aspect-[16/10] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTO_SVGS[previewPhoto.view]}
                alt={previewPhoto.label}
                className="w-full h-full object-contain"
              />
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setPreviewPhoto(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Preview Dialog */}
      {previewDoc && (
        <Dialog open onOpenChange={(o) => !o && setPreviewDoc(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" /> {previewDoc.kind}
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">{previewDoc.name}</DialogDescription>
            </DialogHeader>
            <div className="p-8 rounded-lg border border-dashed border-border bg-muted/30 text-center space-y-3">
              <FileText className="size-12 text-primary mx-auto opacity-70" />
              <div>
                <p className="text-sm font-semibold text-foreground">{previewDoc.name}</p>
                <p className="text-xs text-muted-foreground">Certified copy uploaded with application.</p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                Verified Document
              </Badge>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
              <Button size="sm" className="bg-primary" onClick={() => setPreviewDoc(null)}>
                <Download className="size-3.5 mr-1" /> Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Interactive Step Dialogs */}
      {activeDialog === "schedule" && (
        <ScheduleDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
      {activeDialog === "inspect" && (
        <InspectDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
      {activeDialog === "recommend" && (
        <RecommendDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
      {activeDialog === "shortfall" && (
        <ShortfallDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
      {activeDialog === "respond" && (
        <RespondDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
      {activeDialog === "decide" && (
        <DecideDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
      {activeDialog === "issue" && (
        <IssueDialog
          record={record}
          onClose={() => setActiveDialog(null)}
          onSuccess={(up) => refresh(up)}
        />
      )}
    </div>
  );
}

// ── State Badges ─────────────────────────────────────────────────────────────
function StateBadge({ state }: { state: OccupancyRegisterState }) {
  const label = OCCUPANCY_STATE_LABEL[state] ?? state;
  switch (state) {
    case "CERTIFICATE_ISSUED":
      return <Badge className="bg-emerald-600 text-white font-semibold">{label}</Badge>;
    case "APPROVED":
      return <Badge className="bg-emerald-500 text-white font-semibold">{label}</Badge>;
    case "RECOMMENDED":
      return <Badge className="bg-blue-600 text-white font-semibold">{label}</Badge>;
    case "INSPECTION_COMPLETED":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">{label}</Badge>;
    case "INSPECTION_PENDING":
      return <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 font-semibold">{label}</Badge>;
    case "SHORTFALL":
      return <Badge variant="destructive" className="font-semibold">{label}</Badge>;
    case "REJECTED":
      return <Badge variant="destructive" className="bg-red-800 text-white font-semibold">{label}</Badge>;
    case "SUBMITTED":
    default:
      return <Badge variant="outline" className="font-semibold">{label}</Badge>;
  }
}

// ── 6-Stage Process Stepper ──────────────────────────────────────────────────
function ProcessStepper({ state }: { state: OccupancyRegisterState }) {
  const steps = [
    { label: "Completion Intimation", done: state !== "COMPLETION_PENDING" },
    { label: "Occupancy Submission", done: state !== "COMPLETION_PENDING" },
    {
      label: "Final Inspection",
      done: ["INSPECTION_COMPLETED", "RECOMMENDED", "APPROVED", "CERTIFICATE_ISSUED"].includes(state),
    },
    {
      label: "As-Built Review",
      done: ["RECOMMENDED", "APPROVED", "CERTIFICATE_ISSUED"].includes(state),
    },
    {
      label: "Recommendation & Decision",
      done: ["APPROVED", "CERTIFICATE_ISSUED"].includes(state),
    },
    {
      label: "Occupancy Certificate",
      done: state === "CERTIFICATE_ISSUED",
    },
  ];

  return (
    <ol className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {steps.map((st, i) => (
        <li
          key={st.label}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
            st.done
              ? "border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200"
              : "border-border bg-muted/20 text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
              st.done
                ? "bg-emerald-600 text-white"
                : "border border-border text-muted-foreground"
            )}
          >
            {st.done ? <Check className="size-3" /> : i + 1}
          </span>
          <span className="text-[11px] font-medium leading-tight truncate">{st.label}</span>
        </li>
      ))}
    </ol>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ACTION MODALS
// ═════════════════════════════════════════════════════════════════════════════

function ScheduleDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [date, setDate] = React.useState("2026-03-28");
  const [inspector, setInspector] = React.useState("Shri. Suresh Kulkarni — Town Planning Assistant");
  const [remarks, setRemarks] = React.useState("Final on-site measurement inspection scheduled.");

  const handleSubmit = () => {
    const updated = updateOccupancyRecord(record.id, (prev) => {
      const newInsp: InspectionRecord = {
        id: `insp-${Date.now()}`,
        round: prev.round,
        status: "SCHEDULED",
        scheduledFor: new Date(date).toISOString(),
        inspectorName: inspector.split("—")[0].trim(),
        inspectorDesignation: inspector.split("—")[1]?.trim() || "TPA",
        scheduledByName: "Shri. Suresh Kulkarni",
        inspectedAt: null,
        siteCondition: "Awaiting inspection",
        actualConstruction: "Pending field measurement",
        approvedConstruction: "As per sanctioned BPO",
        deviations: "",
        remarks,
        photos: [],
        recommendation: "",
        asBuiltFigures: {},
      };
      return {
        ...prev,
        status: "INSPECTION_PENDING",
        state: "INSPECTION_PENDING",
        currentDesk: "TPA Field Inspection",
        inspections: [...prev.inspections, newInsp],
        events: [
          {
            id: `ev-${Date.now()}`,
            action: "INSPECTION_SCHEDULED",
            fromStatus: prev.status,
            toStatus: "INSPECTION_PENDING",
            actorName: inspector.split("—")[0].trim(),
            actorRoleKey: "TPA",
            stageName: "Inspection Scheduling",
            remarks,
            occurredAt: new Date().toISOString(),
          },
          ...prev.events,
        ],
      };
    });
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="size-4 text-blue-600" /> Schedule Final Site Inspection
          </DialogTitle>
          <DialogDescription className="text-xs">
            Assign an authorized inspecting officer and date for physical verification of {record.occupancyNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-medium text-foreground block mb-1">Inspection Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Assigned Inspector</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
            >
              <option value="Shri. Suresh Kulkarni — Town Planning Assistant">Shri. Suresh Kulkarni (Town Planning Assistant)</option>
              <option value="Smt. Anita Sharma — Town Planning Assistant">Smt. Anita Sharma (Town Planning Assistant)</option>
              <option value="Shri. Rahul Gupta — Town Planning Assistant">Shri. Rahul Gupta (Town Planning Assistant)</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Scheduling Remarks</label>
            <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Confirm Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InspectDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [siteCondition, setSiteCondition] = React.useState("Construction complete, site cleared of all debris. Drainage and approach road in place.");
  const [actualConstruction, setActualConstruction] = React.useState("Building constructed in accordance with the sanctioned drawings. Setbacks open to sky.");
  const [recommendation, setRecommendation] = React.useState<"RECOMMENDED" | "SHORTFALL" | "REJECT">("RECOMMENDED");
  const [deviations, setDeviations] = React.useState("");
  const [remarks, setRemarks] = React.useState("On-site scrutiny satisfactory. Recommended for Occupancy Certificate.");

  const handleSubmit = () => {
    const updated = updateOccupancyRecord(record.id, (prev) => {
      const nextStatus = recommendation === "SHORTFALL" ? "SHORTFALL" : "INSPECTION_COMPLETED";
      return {
        ...prev,
        status: nextStatus,
        state: nextStatus,
        currentDesk: recommendation === "SHORTFALL" ? "Applicant / LTP" : "ZDD As-Built Review",
        inspections: prev.inspections.map((insp, idx) =>
          idx === prev.inspections.length - 1
            ? {
                ...insp,
                status: "COMPLETED",
                inspectedAt: new Date().toISOString(),
                siteCondition,
                actualConstruction,
                deviations,
                remarks,
                recommendation,
              }
            : insp
        ),
        events: [
          {
            id: `ev-${Date.now()}`,
            action: "INSPECTED",
            fromStatus: prev.status,
            toStatus: nextStatus,
            actorName: "Shri. Suresh Kulkarni",
            actorRoleKey: "TPA",
            stageName: "Field Inspection",
            remarks: `Inspection recorded with finding: ${recommendation}. ${remarks}`,
            occurredAt: new Date().toISOString(),
          },
          ...prev.events,
        ],
      };
    });
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="size-4 text-emerald-600" /> Record Final Site Inspection Findings
          </DialogTitle>
          <DialogDescription className="text-xs">
            Enter field observations and findings for {record.occupancyNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-medium text-foreground block mb-1">Site Condition</label>
            <Textarea rows={2} value={siteCondition} onChange={(e) => setSiteCondition(e.target.value)} />
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Actual Construction Observed</label>
            <Textarea rows={2} value={actualConstruction} onChange={(e) => setActualConstruction(e.target.value)} />
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Deviations (leave blank if none)</label>
            <Input placeholder="None recorded" value={deviations} onChange={(e) => setDeviations(e.target.value)} />
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Inspector Recommendation</label>
            <div className="flex gap-2">
              {(["RECOMMENDED", "SHORTFALL", "REJECT"] as const).map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant={recommendation === r ? "default" : "outline"}
                  size="sm"
                  className={cn("text-xs flex-1", recommendation === r && r === "RECOMMENDED" && "bg-emerald-600 hover:bg-emerald-700")}
                  onClick={() => setRecommendation(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Technical Remarks</label>
            <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
            Submit Inspection Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecommendDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [outcome, setOutcome] = React.useState<"APPROVE" | "REJECT">("APPROVE");
  const [notes, setNotes] = React.useState(
    "As-built scrutiny complete. All parameters within statutory 2% tolerance. Structural stability, fire NOC, and parking bays verified. Recommended for Commissioner's approval."
  );

  const handleSubmit = () => {
    const updated = updateOccupancyRecord(record.id, (prev) => ({
      ...prev,
      status: "RECOMMENDED",
      state: "RECOMMENDED",
      currentDesk: "Commissioner / Decision Desk",
      recommendation: {
        recommendation: outcome,
        label: outcome === "APPROVE" ? "Recommended for Approval" : "Recommended for Rejection",
        notes,
        reviewedByName: "Smt. Meena Kulkarni (ZDD)",
        reviewedAt: new Date().toISOString(),
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "RECOMMENDED",
          fromStatus: prev.status,
          toStatus: "RECOMMENDED",
          actorName: "Smt. Meena Kulkarni",
          actorRoleKey: "ZDD",
          stageName: "As-Built Review",
          remarks: notes,
          occurredAt: new Date().toISOString(),
        },
        ...prev.events,
      ],
    }));
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Ruler className="size-4 text-indigo-600" /> Review As-Built Drawings &amp; Recommend
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review the final inspection findings and submit technical recommendation to the deciding authority.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-medium text-foreground block mb-1">Recommendation</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={outcome === "APPROVE" ? "default" : "outline"}
                size="sm"
                className={cn("flex-1 text-xs", outcome === "APPROVE" && "bg-emerald-600 hover:bg-emerald-700")}
                onClick={() => setOutcome("APPROVE")}
              >
                Recommend for Approval
              </Button>
              <Button
                type="button"
                variant={outcome === "REJECT" ? "destructive" : "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setOutcome("REJECT")}
              >
                Recommend for Rejection
              </Button>
            </div>
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Technical Review Notes</label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
            Submit Recommendation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShortfallDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [itemsText, setItemsText] = React.useState("Clear eastern setback of all debris and obstructions.\nProvide photographic proof of operational rainwater harvesting pit.");
  const [remarks, setRemarks] = React.useState("Please rectify these observations and upload compliance within 15 days.");

  const handleSubmit = () => {
    const items = itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const updated = updateOccupancyRecord(record.id, (prev) => ({
      ...prev,
      status: "SHORTFALL",
      state: "SHORTFALL",
      currentDesk: "Applicant / LTP Action",
      shortfall: {
        items,
        remarks,
        raisedByName: "Smt. Meena Kulkarni (ZDD)",
        raisedAt: new Date().toISOString(),
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "SHORTFALL_RAISED",
          fromStatus: prev.status,
          toStatus: "SHORTFALL",
          actorName: "Smt. Meena Kulkarni",
          actorRoleKey: "ZDD",
          stageName: "Review",
          remarks: `Shortfall raised with ${items.length} items.`,
          occurredAt: new Date().toISOString(),
        },
        ...prev.events,
      ],
    }));
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <FileWarning className="size-4 text-amber-600" /> Raise Occupancy Shortfall Notice
          </DialogTitle>
          <DialogDescription className="text-xs">
            Return the application to the applicant for rectification of site deviations or documentation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-medium text-foreground block mb-1">Shortfall Items (one per line)</label>
            <Textarea rows={4} value={itemsText} onChange={(e) => setItemsText(e.target.value)} />
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Officer Instructions</label>
            <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="destructive" onClick={handleSubmit}>
            Raise Shortfall
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RespondDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [response, setResponse] = React.useState(
    "All identified issues have been rectified. Setback cleared and paved, RWH pit cleaned. Site photographs attached."
  );

  const handleSubmit = () => {
    const updated = updateOccupancyRecord(record.id, (prev) => ({
      ...prev,
      status: "SUBMITTED",
      state: "SUBMITTED",
      round: prev.round + 1,
      currentDesk: "TPA Re-Inspection",
      shortfall: prev.shortfall
        ? {
            ...prev.shortfall,
            response,
            respondedAt: new Date().toISOString(),
          }
        : undefined,
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "SHORTFALL_ANSWERED",
          fromStatus: "SHORTFALL",
          toStatus: "SUBMITTED",
          actorName: record.ltp.name,
          actorRoleKey: "LTP",
          stageName: "Applicant",
          remarks: response,
          occurredAt: new Date().toISOString(),
        },
        ...prev.events,
      ],
    }));
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Send className="size-4 text-primary" /> Submit Shortfall Rectification
          </DialogTitle>
          <DialogDescription className="text-xs">
            Explain what actions were taken to resolve the shortfall items and request re-inspection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          {record.shortfall?.items && (
            <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-900 dark:text-amber-100">
              <span className="font-semibold block mb-1">Department Requirements:</span>
              <ul className="list-disc pl-5 space-y-0.5">
                {record.shortfall.items.map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="font-medium text-foreground block mb-1">Applicant Compliance Response</label>
            <Textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="bg-primary">
            Submit Compliance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DecideDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [decision, setDecision] = React.useState<"APPROVED" | "REJECTED">("APPROVED");
  const [remarks, setRemarks] = React.useState(
    "Occupancy approved. Construction verified within sanctioned limits. Issued subject to standard statutory maintenance conditions."
  );

  const handleSubmit = () => {
    const updated = updateOccupancyRecord(record.id, (prev) => ({
      ...prev,
      status: decision,
      state: decision,
      currentDesk: decision === "APPROVED" ? "Joint Director / Dispatch" : "Closed — Rejected",
      decision: {
        decision,
        remarks,
        decidedByName: "Dr. Pratap Reddy (Commissioner)",
        decidedAt: new Date().toISOString(),
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: decision === "APPROVED" ? "APPROVED" : "REJECTED",
          fromStatus: prev.status,
          toStatus: decision,
          actorName: "Dr. Pratap Reddy",
          actorRoleKey: "COMMISSIONER",
          stageName: "Decision Desk",
          remarks,
          occurredAt: new Date().toISOString(),
        },
        ...prev.events,
      ],
    }));
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Gavel className="size-4 text-purple-600" /> Decide Occupancy Application
          </DialogTitle>
          <DialogDescription className="text-xs">
            Final statutory determination by the Competent Authority for {record.occupancyNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-medium text-foreground block mb-1">Decision</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={decision === "APPROVED" ? "default" : "outline"}
                size="sm"
                className={cn("flex-1 text-xs", decision === "APPROVED" && "bg-emerald-600 hover:bg-emerald-700")}
                onClick={() => {
                  setDecision("APPROVED");
                  setRemarks("Occupancy approved. Construction verified within sanctioned limits. Issued subject to standard statutory maintenance conditions.");
                }}
              >
                Approve Occupancy
              </Button>
              <Button
                type="button"
                variant={decision === "REJECTED" ? "destructive" : "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  setDecision("REJECTED");
                  setRemarks("Occupancy rejected due to substantial deviations beyond allowable tolerance.");
                }}
              >
                Reject Occupancy
              </Button>
            </div>
          </div>
          <div>
            <label className="font-medium text-foreground block mb-1">Official Decision Orders &amp; Remarks</label>
            <Textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className={decision === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-700 hover:bg-red-800"}
          >
            Confirm Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IssueDialog({
  record,
  onClose,
  onSuccess,
}: {
  record: OccupancyApplicationRecord;
  onClose: () => void;
  onSuccess: (up: OccupancyApplicationRecord) => void;
}) {
  const [outwardNumber] = React.useState(`OUT/2026/04/${Math.floor(100 + Math.random() * 900)}`);

  const handleSubmit = () => {
    const certNo = `OCC-CERT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const updated = updateOccupancyRecord(record.id, (prev) => ({
      ...prev,
      status: "CERTIFICATE_ISSUED",
      state: "CERTIFICATE_ISSUED",
      currentDesk: "Closed — Certificate Issued",
      certificate: {
        certificateNumber: certNo,
        issuedAt: new Date().toISOString(),
        issuedByName: "Dr. Pratap Reddy (Commissioner)",
        approvedAreaSqm: prev.project.approvedAreaSqm,
        completedAreaSqm: prev.project.completedAreaSqm,
        conditions: [
          "The building shall be used only for the purpose for which permission was granted. Any change of use requires fresh permission.",
          "The parking area shall be kept free and used only for parking, and shall not be enclosed or converted.",
          "The setbacks shall be kept open to the sky and free of any permanent or temporary structure.",
          "Rainwater harvesting and fire safety provisions shall be maintained in working order for the life of the building.",
          "No addition or alteration shall be made to the building without prior written sanction.",
          "This certificate is liable to be withdrawn if obtained by misrepresentation or violation of bylaws.",
        ],
        outwardNumber,
        verificationCode: `OCC-${Math.floor(1000 + Math.random() * 9000)}-VRF`,
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          action: "CERTIFICATE_ISSUED",
          fromStatus: "APPROVED",
          toStatus: "CERTIFICATE_ISSUED",
          actorName: "Dr. Pratap Reddy",
          actorRoleKey: "COMMISSIONER",
          stageName: "Dispatch",
          remarks: `Occupancy certificate ${certNo} issued and placed in Outward register (${outwardNumber}).`,
          occurredAt: new Date().toISOString(),
        },
        ...prev.events,
      ],
    }));
    if (updated) onSuccess(updated);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Award className="size-4 text-emerald-600" /> Issue Occupancy Certificate
          </DialogTitle>
          <DialogDescription className="text-xs">
            Number the certificate, apply cryptographic authentication seal, and log entry into Outward register for dispatch.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
            <p className="font-semibold">Ready for Official Issue</p>
            <p className="text-[11px] text-emerald-800 mt-1">
              Once issued, the certificate snapshot is frozen and an Outward tracking number ({outwardNumber}) is generated.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Issue Certificate Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
