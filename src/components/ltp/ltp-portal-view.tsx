"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/design-system/badges";
import { NewApplicationDialog } from "@/components/ltp/new-application-dialog";
import { UnifiedDashboard } from "@/components/dashboard/unified-dashboard";
import { LtpDraftApplications } from "@/components/ltp/ltp-draft-applications";
import { LtpSubmittedApplications } from "@/components/ltp/ltp-submitted-applications";
import { LtpSubmissionDetails } from "@/components/ltp/ltp-submission-details";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import { LtpObjections } from "@/components/ltp/ltp-objections";
import { LtpComplianceView } from "@/components/ltp/ltp-compliance-view";
import { LtpApprovedFiles } from "@/components/ltp/ltp-approved-files";
import { LtpInReview } from "@/components/ltp/ltp-in-review";
import { LtpReportsView } from "@/components/ltp/ltp-reports-view";
import { AdminSettings } from "@/components/admin/admin-settings";
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
  const setLtpActiveMenu = useAppStore((s) => s.setLtpActiveMenu);
  const view = useAppStore((s) => s.view);
  const { applications } = useDashboardScope();
  const user = useAppStore((s) => s.user);
  const openApplication = useAppStore((s) => s.openApplication);
  const [newAppOpen, setNewAppOpen] = React.useState(false);
  const [activeNewApp, setActiveNewApp] = React.useState<{
    baNo: string;
    scheme: "LPS Layout" | "Non-LPS";
  } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const userApps = applications;

  // Sync activeMenu to dashboard ONLY when top-level view transitions to ltp-dashboard, or settings when admin-settings
  React.useEffect(() => {
    if (view === "ltp-dashboard") {
      setLtpActiveMenu("dashboard");
    } else if (view === "admin-settings") {
      setLtpActiveMenu("settings");
    }
  }, [view, setLtpActiveMenu]);

  // Dynamic content based on selected menu
  const renderContent = () => {
    const activeKey = (view === "admin-settings" || ltpActiveMenu === "admin-settings") ? "settings" : ltpActiveMenu;
    switch (activeKey) {
      case "dashboard": {
        return <UnifiedDashboard />;
      }

      case "draft-application": {
        return <LtpDraftApplications />;
      }

      case "submitted-applications":
      case "all-ltp-in-process": {
        return (
          <LtpSubmittedApplications
            onNewApp={(_type) => {
              setNewAppOpen(true);
            }}
          />
        );
      }

      case "review-proceeding": {
        return <LtpInReview />;
      }

      case "objected-files": {
        return <LtpObjections />;
      }

      case "proceeding-status":
      case "verified":
      case "shortfall":
      case "review-shortfall-submission":
      case "show-cause":
      case "review-show-cause-submission": {
        return <LtpComplianceView initialTab={ltpActiveMenu} />;
      }

      case "approved-files":
      case "proceeding-issued": {
        return <LtpApprovedFiles />;
      }

      case "change-ltp": {
        return (
          <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Enter File No. / Application No.</label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. BA 1168/0001/BP/..." className="h-9 text-xs" />
                  <Button className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-9 px-4 cursor-pointer">
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
          <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
            <div className="overflow-hidden rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs">
                  <tr className="divide-x divide-[#DCD5C8]">
                    <th className="px-4 py-2.5">Application No.</th>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-4 py-2.5">Approval Date</th>
                    <th className="px-4 py-2.5">Commencement Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE] bg-white">
                  {readyForCC.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No approved files available for commencement notification.
                      </td>
                    </tr>
                  ) : (
                    readyForCC.map((app) => (
                      <tr key={app.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="font-mono font-bold text-[#7A1316] hover:text-[#8F161A] hover:underline cursor-pointer text-left"
                            title="Click to view application details"
                          >
                            {app.applicationNo}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{app.project.name}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(app.lastUpdated).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                            Ready for Initiation
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="h-7 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1 cursor-pointer"
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
          <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
            <div className="overflow-hidden rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs">
                  <tr className="divide-x divide-[#DCD5C8]">
                    <th className="px-4 py-2.5">Permit No.</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Applicant</th>
                    <th className="px-4 py-2.5">Occupancy Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE] bg-white">
                  {approvedApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No completed buildings ready for occupancy intimation.
                      </td>
                    </tr>
                  ) : (
                    approvedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openApplication(app.id, "ltp-application-details")}
                            className="font-mono font-bold text-[#7A1316] hover:text-[#8F161A] hover:underline cursor-pointer text-left"
                            title="Click to view application details"
                          >
                            {app.applicationNo}
                          </button>
                        </td>
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
                            className="h-7 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1 cursor-pointer"
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

      case "reports":
      case "reports-summary":
      case "reports-payments":
      case "reports-scrutiny":
      case "reports-mis": {
        return <LtpReportsView initialTab={ltpActiveMenu} />;
      }

      case "settings":
      case "admin-settings": {
        if (user?.role !== "ADMIN") {
          return <UnifiedDashboard />;
        }
        return (
          <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col min-h-0 overflow-hidden">
            <AdminSettings />
          </div>
        );
      }

      default: {
        return (
          <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
              No records found for this section.
            </div>
          </div>
        );
      }
    }
  };

  if (activeNewApp) {
    return (
      <div className="h-full w-full overflow-hidden p-0 bg-[#FAF7F2]">
        <LtpSubmissionDetails
          baNo={activeNewApp.baNo}
          proposalStatus="Draft"
          submissionDate={`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
          isDraft={true}
          initialLpsType={activeNewApp.scheme}
          onBack={() => setActiveNewApp(null)}
        />
      </div>
    );
  }

  const isEdgeToEdge =
    ltpActiveMenu === "dashboard" ||
    ltpActiveMenu === "draft-application" ||
    ltpActiveMenu === "submitted-applications" ||
    ltpActiveMenu === "approved-files" ||
    ltpActiveMenu === "proceeding-issued" ||
    ltpActiveMenu === "review-proceeding" ||
    ltpActiveMenu === "objected-files" ||
    ltpActiveMenu === "proceeding-status" ||
    ltpActiveMenu === "verified" ||
    ltpActiveMenu === "shortfall" ||
    ltpActiveMenu === "review-shortfall-submission" ||
    ltpActiveMenu === "show-cause" ||
    ltpActiveMenu === "review-show-cause-submission" ||
    ltpActiveMenu === "reports" ||
    ltpActiveMenu === "reports-summary" ||
    ltpActiveMenu === "reports-payments" ||
    ltpActiveMenu === "reports-scrutiny" ||
    ltpActiveMenu === "reports-mis" ||
    ltpActiveMenu === "settings" ||
    ltpActiveMenu === "admin-settings";

  return (
    <div className={cn("h-full w-full", isEdgeToEdge ? "overflow-hidden p-0 bg-[#FAF7F2]" : "overflow-y-auto p-4 bg-[#F8F9FA]")}>
      {renderContent()}

      {/* New Application Dialog */}
      <NewApplicationDialog
        open={newAppOpen}
        onOpenChange={setNewAppOpen}
        onSelectScheme={(scheme) => {
          setNewAppOpen(false);
          const now = new Date();
          const typeCode = scheme === "LPS Layout" ? "LPS" : "BP";
          const newDraftNo = `D/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/${typeCode}/${now.getFullYear()}`;
          setActiveNewApp({
            baNo: newDraftNo,
            scheme,
          });
        }}
      />
    </div>
  );
}
