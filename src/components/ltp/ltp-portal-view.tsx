"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/design-system/badges";
import { NewApplicationDialog } from "@/components/ltp/new-application-dialog";
import { UnifiedDashboard } from "@/components/dashboard/unified-dashboard";
import {
  FilePlus2,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Building2,
  Calendar,
  Layers,
  Send,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import type { Application } from "@/types";

export function LtpPortalView() {
  const ltpActiveMenu = useAppStore((s) => s.ltpActiveMenu) ?? "dashboard";
  const applications = useAppStore((s) => s.applications);
  const user = useAppStore((s) => s.user);
  const openApplication = useAppStore((s) => s.openApplication);
  const [newAppOpen, setNewAppOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get LTP's applications or mock applications assigned to LTP
  const userApps = React.useMemo(() => {
    return applications.filter((a) => a.ltpId === user?.id || a.ltpId === "u-ltp-01");
  }, [applications, user]);

  // Dynamic content based on selected menu
  const renderContent = () => {
    switch (ltpActiveMenu) {
      case "dashboard": {
        return <UnifiedDashboard />;
      }

      case "draft-application": {
        const drafts = userApps.filter((a) => a.status === "DRAFT");
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Draft Applications</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prepare, edit, and lodge new building permission applications before formal submission.
                </p>
              </div>
              <Button
                onClick={() => setNewAppOpen(true)}
                className="bg-[#801824] hover:bg-[#941C2B] text-white gap-1.5 text-xs h-9 px-4 rounded-md shadow-sm"
              >
                <FilePlus2 className="size-4" /> Draft New Application
              </Button>
            </div>

            {drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <FileText className="size-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No Draft Applications</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  You do not have any pending drafts. Click &quot;Draft New Application&quot; to begin filling in the APCRDA BBAS application.
                </p>
                <Button
                  onClick={() => setNewAppOpen(true)}
                  className="mt-4 bg-[#801824] hover:bg-[#941C2B] text-white gap-1.5 text-xs h-8 px-3 rounded-md"
                >
                  <FilePlus2 className="size-3.5" /> Start New Application
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#801824]/5 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Application No.</th>
                      <th className="px-4 py-3">Project Name</th>
                      <th className="px-4 py-3">Applicant</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Updated</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drafts.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-slate-600">{app.applicant.name}</td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-slate-500">{new Date(app.lastUpdated).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="h-7 text-xs gap-1 border-slate-300"
                          >
                            Continue <ArrowRight className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }

      case "submitted-applications": {
        const submitted = userApps.filter((a) => a.status !== "DRAFT");
        const filtered = searchQuery
          ? submitted.filter(
              (a) =>
                a.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.project.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : submitted;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Submitted Permission Files</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track and monitor all formally submitted building permit applications.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search application no..."
                  className="h-8 pl-8 text-xs bg-white"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#801824]/5 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3"># Application No.</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No submitted applications found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{app.project.name}</div>
                          <div className="text-[10px] text-slate-400">{app.project.ward}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{app.applicant.name}</td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{app.currentStageLabel}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(app.submissionDate).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="h-7 text-xs text-blue-600 hover:text-blue-800 gap-1"
                          >
                            Open <ArrowRight className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "review-proceeding": {
        const reviewApps = userApps.filter(
          (a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status)
        );
        return (
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">In-Review Proceedings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applications currently under departmental review and scrutiny chain.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#801824]/5 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Application No.</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Current Review Stage</th>
                    <th className="px-4 py-3">Assigned Officer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviewApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No applications currently in review proceeding.
                      </td>
                    </tr>
                  ) : (
                    reviewApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-slate-700">{app.currentStageLabel}</td>
                        <td className="px-4 py-3 text-slate-600">{app.assignedOfficer?.name ?? "Under Scrutiny"}</td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="h-7 text-xs text-blue-600 hover:text-blue-800 gap-1"
                          >
                            View <ArrowRight className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "objected-files":
      case "shortfall": {
        const objectedApps = userApps.filter(
          (a) => a.status === "SHORTFALL_RAISED" || a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED"
        );
        return (
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {ltpActiveMenu === "objected-files" ? "Objections" : "Shortfall Notices"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ltpActiveMenu === "objected-files"
                  ? "Files flagged with scrutiny objections or compliance queries that need your response."
                  : "Requirements and shortfalls raised by officers that need your response."}
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50 border-b border-amber-200 text-amber-900 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Application No.</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Objection / Shortfall Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {objectedApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No objected files or active shortfalls.
                      </td>
                    </tr>
                  ) : (
                    objectedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-amber-800">
                          {app.shortfalls?.[0]?.description ?? "Scrutiny Can Not Done / Revised Drawings Required"}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                          >
                            Correct &amp; Resubmit <ArrowRight className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "approved-files":
      case "proceeding-issued": {
        const approvedApps = userApps.filter((a) => a.status === "APPROVED");
        return (
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Sanctioned &amp; Approved Files</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sanctioned building permits with approved Building Permit Orders (BPO) and proceedings.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Application No.</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Approval Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Permit Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No approved building permits found.
                      </td>
                    </tr>
                  ) : (
                    approvedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-slate-600">{app.applicant.name}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(app.lastUpdated).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="h-7 text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-50 gap-1"
                          >
                            <Download className="size-3" /> View BPO Order
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "change-ltp": {
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Change of LTP / Handover</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transfer licensed technical person on an existing building permission file.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Enter File No. / Application No.</label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. BA 1168/0001/BP/..." className="h-9 text-xs" />
                  <Button className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-9 px-4">
                    Search File
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Enter the approved or in-process application number to submit a Change of LTP consent form and replacement request.
              </p>
            </div>
          </div>
        );
      }

      case "cc-issued":
      case "work-initiated": {
        const readyForCC = userApps.filter((a) => a.status === "APPROVED");
        return (
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {ltpActiveMenu === "cc-issued" ? "Commencement Certificates" : "Site Initiation Notices"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Notify commencement date for approved files to obtain the Commencement Certificate.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#801824]/5 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Application No.</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Approval Date</th>
                    <th className="px-4 py-3">Commencement Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readyForCC.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No approved files available for commencement notification.
                      </td>
                    </tr>
                  ) : (
                    readyForCC.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(app.lastUpdated).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                            Ready for Initiation
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1"
                          >
                            <Calendar className="size-3" /> Notify Commencement
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case "occupancy-list":
      case "submitted-application": {
        const approvedApps = userApps.filter((a) => a.status === "APPROVED");
        return (
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {ltpActiveMenu === "occupancy-list" ? "Completion & OC Registry" : "Submitted OC Applications"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Intimate building completion and submit applications for Occupancy Certificate.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#801824]/5 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Permit No.</th>
                    <th className="px-4 py-3">Project Name</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Occupancy Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No completed buildings ready for occupancy intimation.
                      </td>
                    </tr>
                  ) : (
                    approvedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{app.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-slate-600">{app.applicant.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            Construction Complete
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1"
                          >
                            Intimate Completion
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 capitalize">
                {ltpActiveMenu.replace(/-/g, " ")}
              </h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
              No records found for this section.
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-[85vh] p-4 bg-[#F8F9FA]">
      {renderContent()}

      {/* New Application Dialog */}
      <NewApplicationDialog open={newAppOpen} onOpenChange={setNewAppOpen} />
    </div>
  );
}
