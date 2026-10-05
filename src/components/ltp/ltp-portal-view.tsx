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
import { LtpMyShortfalls } from "@/components/ltp/ltp-my-shortfalls";
import { LtpMyShowCause } from "@/components/ltp/ltp-my-showcause";
import { LtpWorkCommencement } from "@/components/ltp/ltp-work-commencement";
import { AdminSettings } from "@/components/admin/admin-settings";
import { RegistrationApprovalsView } from "@/components/registration/registration-approvals-view";
import { OutwardView } from "@/components/outward/outward-view";
import { OccupancyModuleView } from "@/components/occupancy/occupancy-module-view";
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

  // Registration module is strictly visible to all EXCEPT LTP and TPA
  React.useEffect(() => {
    if (user?.role === "LTP" || user?.role === "TPA") {
      const regMenus = [
        "registration",
        "registration-all",
        "registration-pending",
        "registration-ltp",
        "registration-developer",
        "registration-approved",
        "registration-rejected",
        "developer-verification",
        "all-ltp-approved",
        "approved-registration",
        "rejected-registration",
        "all-ltp-in-process",
      ];
      if (regMenus.includes(ltpActiveMenu)) {
        setLtpActiveMenu("dashboard");
      }
    }
  }, [user?.role, ltpActiveMenu, setLtpActiveMenu]);

  // Dynamic content based on selected menu
  const renderContent = () => {
    const activeKey = (view === "admin-settings" || ltpActiveMenu === "admin-settings") ? "settings" : ltpActiveMenu;
    switch (activeKey) {
      case "dashboard": {
        return <UnifiedDashboard />;
      }

      case "registration":
      case "registration-all":
      case "registration-pending":
      case "registration-ltp":
      case "registration-developer":
      case "registration-approved":
      case "registration-rejected":
      case "developer-verification":
      case "all-ltp-approved":
      case "approved-registration":
      case "rejected-registration": {
        if (user?.role === "LTP" || user?.role === "TPA") return <UnifiedDashboard />;
        return <RegistrationApprovalsView initialTab={activeKey} />;
      }

      case "draft-application": {
        if (user?.role !== "LTP") return <UnifiedDashboard />;
        return <LtpDraftApplications />;
      }

      case "submitted-applications": {
        if (user?.role !== "LTP") return <UnifiedDashboard />;
        return <LtpSubmittedApplications />;
      }

      case "all-ltp-in-process": {
        if (user?.role !== "LTP") return <UnifiedDashboard />;
        return <LtpSubmittedApplications />;
      }

      case "review-proceeding": {
        return <LtpInReview />;
      }

      case "objected-files": {
        if (user?.role !== "LTP") return <UnifiedDashboard />;
        return <LtpObjections />;
      }

      case "compliance":
      case "my-shortfalls": {
        return <LtpMyShortfalls />;
      }

      case "my-show-cause": {
        return <LtpMyShowCause />;
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
                  <Input placeholder="e.g. 1168/0001/BP/..." className="h-9 text-xs" />
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

      case "commencement":
      case "cc-issued":
      case "work-initiated": {
        return (
          <LtpWorkCommencement
            initialTab={ltpActiveMenu === "work-initiated" ? "work-initiated" : "cc-issued"}
          />
        );
      }

      case "occupancy":
      case "occupancy-dashboard":
      case "occupancy-list":
      case "occupancy-apply":
      case "occupancy-certificates":
      case "submitted-application": {
        return <OccupancyModuleView initialTab={ltpActiveMenu} />;
      }

      case "reports":
      case "reports-summary":
      case "reports-payments":
      case "reports-scrutiny":
      case "reports-mis": {
        return <LtpReportsView initialTab={ltpActiveMenu} />;
      }

      case "outward":
      case "ltp-outward":
      case "officer-outward":
      case "admin-outward": {
        return <OutwardView />;
      }

      case "settings":
      case "admin-settings": {
        if (user?.role !== "ADMIN" && user?.role !== "COMMISSIONER" && user?.role !== "ADDITIONAL_COMMISSIONER") {
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
    ltpActiveMenu === "compliance" ||
    ltpActiveMenu === "my-shortfalls" ||
    ltpActiveMenu === "my-show-cause" ||
    ltpActiveMenu === "proceeding-status" ||
    ltpActiveMenu === "verified" ||
    ltpActiveMenu === "shortfall" ||
    ltpActiveMenu === "review-shortfall-submission" ||
    ltpActiveMenu === "show-cause" ||
    ltpActiveMenu === "review-show-cause-submission" ||
    ltpActiveMenu === "commencement" ||
    ltpActiveMenu === "cc-issued" ||
    ltpActiveMenu === "work-initiated" ||
    ltpActiveMenu === "reports" ||
    ltpActiveMenu === "reports-summary" ||
    ltpActiveMenu === "reports-payments" ||
    ltpActiveMenu === "reports-scrutiny" ||
    ltpActiveMenu === "reports-mis" ||
    ltpActiveMenu === "registration" ||
    ltpActiveMenu === "registration-all" ||
    ltpActiveMenu === "registration-pending" ||
    ltpActiveMenu === "registration-ltp" ||
    ltpActiveMenu === "registration-developer" ||
    ltpActiveMenu === "registration-approved" ||
    ltpActiveMenu === "registration-rejected" ||
    ltpActiveMenu === "developer-verification" ||
    ltpActiveMenu === "all-ltp-approved" ||
    ltpActiveMenu === "approved-registration" ||
    ltpActiveMenu === "rejected-registration" ||
    ltpActiveMenu === "outward" ||
    ltpActiveMenu === "ltp-outward" ||
    ltpActiveMenu === "officer-outward" ||
    ltpActiveMenu === "admin-outward" ||
    ltpActiveMenu === "occupancy" ||
    ltpActiveMenu === "occupancy-dashboard" ||
    ltpActiveMenu === "occupancy-list" ||
    ltpActiveMenu === "occupancy-apply" ||
    ltpActiveMenu === "occupancy-certificates" ||
    ltpActiveMenu === "submitted-application" ||
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
