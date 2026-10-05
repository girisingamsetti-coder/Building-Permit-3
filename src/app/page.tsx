"use client";

import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { canAccessView } from "@/lib/permissions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AppShell } from "@/components/layout/app-shell";

// LTP views
import { UnifiedDashboard } from "@/components/dashboard/unified-dashboard";
import { LtpApplications } from "@/components/ltp/ltp-applications";
import { LtpCreateApplication } from "@/components/ltp/ltp-create-application";
import { LtpApplicationDetails } from "@/components/ltp/ltp-application-details";
import { LtpDrawings, LtpScrutiny } from "@/components/ltp/ltp-drawings";
import { LtpDocuments } from "@/components/ltp/ltp-documents";
import { LtpFees, LtpPayment, LtpReceipt } from "@/components/ltp/ltp-fees";
import { LtpShortfalls } from "@/components/ltp/ltp-shortfalls";
import { LtpNotifications } from "@/components/ltp/ltp-notifications";
import { LtpProfile, LtpHelp } from "@/components/ltp/ltp-profile";
import { LtpPortalView } from "@/components/ltp/ltp-portal-view";

// Officer views
import { OfficerDashboard } from "@/components/officer/officer-dashboard";
import { OfficerApplications } from "@/components/officer/officer-applications";
import { OfficerReview } from "@/components/officer/officer-review";
import { OfficerTasks } from "@/components/officer/officer-tasks";
import { OfficerShortfalls } from "@/components/officer/officer-shortfalls";
import { OfficerPayments } from "@/components/officer/officer-payments";
import { OfficerDocuments } from "@/components/officer/officer-documents";
import { OfficerReports } from "@/components/officer/officer-reports";
import { OfficerSettings } from "@/components/officer/officer-settings";

// Admin views
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { BimModule } from "@/components/shared/bim-module";
import { AdminApplications } from "@/components/admin/admin-applications";
import { AdminShortfalls } from "@/components/admin/admin-shortfalls";
import { AdminPayments } from "@/components/admin/admin-payments";
import { AdminDocuments } from "@/components/admin/admin-documents";
import { AdminReports } from "@/components/admin/admin-reports";
import { AdminUsers } from "@/components/admin/admin-users";
import { AdminRoles } from "@/components/admin/admin-roles";
import { AdminApplicationTypes } from "@/components/admin/admin-application-types";
import { AdminFeeStructures } from "@/components/admin/admin-fee-structures";
import { AdminWorkflow } from "@/components/admin/admin-workflow";
import { AdminTemplates } from "@/components/admin/admin-templates";
import { AdminAudit } from "@/components/admin/admin-audit";
import { AdminSettings } from "@/components/admin/admin-settings";
import { AdminTasks } from "@/components/admin/admin-tasks";

// Project Manager views
import { PmDashboard } from "@/components/pm/pm-dashboard";
import { PmApplications } from "@/components/pm/pm-applications";
import { PmApplicationDetails } from "@/components/pm/pm-application-details";
import { PmWorkflow } from "@/components/pm/pm-workflow";
import { PmOfficers } from "@/components/pm/pm-officers";
import { PmOfficerDetails } from "@/components/pm/pm-officer-details";
import { PmSla } from "@/components/pm/pm-sla";
import { PmReports } from "@/components/pm/pm-reports";
import { PmShortfalls } from "@/components/pm/pm-shortfalls";
import { PmHelp } from "@/components/pm/pm-help";

import { OccupancyView } from "@/components/occupancy/occupancy-view";
import { InspectionsView } from "@/components/inspections/inspections-view";
import { NocsView } from "@/components/nocs/nocs-view";
import { ShowCauseView } from "@/components/show-cause/show-cause-view";
import { RevocationsView } from "@/components/revocations/revocations-view";
import { LtpChangesView } from "@/components/ltp-changes/ltp-changes-view";
import { WorkInitiatedView } from "@/components/work-initiated/work-initiated-view";
import { DevelopersView } from "@/components/developers/developers-view";
import { ProfessionalsView } from "@/components/professionals/professionals-view";
import { OutwardView } from "@/components/outward/outward-view";
import { TasksView } from "@/components/tasks/tasks-view";
import { ShortfallsView } from "@/components/shortfalls/shortfalls-view";
import { PaymentsView } from "@/components/payments/payments-view";
import { Drawings2DModule } from "@/components/shared/drawings-2d-module";

import type { ViewKey } from "@/types";

function BlankLtpView() {
  return <div className="min-h-[85vh] w-full" />;
}

const VIEW_REGISTRY: Record<ViewKey, React.ComponentType> = {
  // auth
  login: AuthScreen,
  "forgot-password": AuthScreen,
  otp: AuthScreen,
  // ltp
  "ltp-dashboard": BlankLtpView,
  "ltp-applications": BlankLtpView,
  "ltp-create-application": BlankLtpView,
  "ltp-application-details": BlankLtpView,
  "ltp-drawings": BlankLtpView,
  "ltp-scrutiny": BlankLtpView,
  "ltp-documents": BlankLtpView,
  "ltp-fees": BlankLtpView,
  "ltp-payment": BlankLtpView,
  "ltp-receipt": BlankLtpView,
  "ltp-shortfalls": BlankLtpView,
  "ltp-notifications": BlankLtpView,
  "ltp-profile": BlankLtpView,
  "ltp-help": BlankLtpView,
  "ltp-bim": BlankLtpView,
  "ltp-2d-drawings": BlankLtpView,
  "ltp-occupancy": BlankLtpView,
  "ltp-tasks": BlankLtpView,
  "ltp-inspections": BlankLtpView,
  "ltp-nocs": BlankLtpView,
  "ltp-show-cause": BlankLtpView,
  "ltp-revocations": BlankLtpView,
  "ltp-changes": BlankLtpView,
  "ltp-work-initiated": BlankLtpView,
  "ltp-developers": BlankLtpView,
  "ltp-professionals": BlankLtpView,
  "ltp-outward": BlankLtpView,
  "ltp-payments": BlankLtpView,
  // officer
  "officer-dashboard": OfficerDashboard,
  "officer-review": OfficerReview,
  "officer-applications": OfficerApplications,
  "officer-tasks": TasksView,
  "officer-shortfalls": ShortfallsView,
  "officer-payments": PaymentsView,
  "officer-inspections": InspectionsView,
  "officer-nocs": NocsView,
  "officer-show-cause": ShowCauseView,
  "officer-revocations": RevocationsView,
  "officer-ltp-changes": LtpChangesView,
  "officer-work-initiated": WorkInitiatedView,
  "officer-developers": DevelopersView,
  "officer-professionals": ProfessionalsView,
  "officer-outward": OutwardView,
  "officer-documents": OfficerDocuments,
  "officer-reports": OfficerReports,
  "officer-settings": OfficerSettings,
  "officer-bim": BimModule,
  "officer-2d-drawings": Drawings2DModule,
  "officer-occupancy": OccupancyView,
  // admin
  "admin-dashboard": AdminDashboard,
  "admin-applications": AdminApplications,
  "admin-occupancy": OccupancyView,
  "admin-shortfalls": ShortfallsView,
  "admin-payments": PaymentsView,
  "admin-tasks": TasksView,
  "admin-inspections": InspectionsView,
  "admin-nocs": NocsView,
  "admin-show-cause": ShowCauseView,
  "admin-revocations": RevocationsView,
  "admin-ltp-changes": LtpChangesView,
  "admin-work-initiated": WorkInitiatedView,
  "admin-developers": DevelopersView,
  "admin-professionals": ProfessionalsView,
  "admin-outward": OutwardView,
  "admin-documents": AdminDocuments,
  "admin-reports": AdminReports,
  "admin-users": AdminUsers,
  "admin-roles": AdminRoles,
  "admin-application-types": AdminApplicationTypes,
  "admin-fee-structures": AdminFeeStructures,
  "admin-workflow": AdminWorkflow,
  "admin-templates": AdminTemplates,
  "admin-audit": AdminAudit,
  "admin-settings": AdminSettings,
  "admin-bim": BimModule,
  "admin-2d-drawings": Drawings2DModule,
  // project manager (read-only monitoring)
  "pm-dashboard": PmDashboard,
  "pm-applications": PmApplications,
  "pm-application-details": PmApplicationDetails,
  "pm-workflow": PmWorkflow,
  "pm-officers": PmOfficers,
  "pm-officer-details": PmOfficerDetails,
  "pm-sla": PmSla,
  "pm-reports": PmReports,
  "pm-shortfalls": PmShortfalls,
  "pm-help": PmHelp,
};

export default function Home() {
  const { isAuthenticated, view, user, roles, navigate } = useAppStore();

  // Scroll to top on view change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const main = document.querySelector("main");
      if (main) main.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      else window.scrollTo({ top: 0 });
    }
  }, [view]);

  // Route guard — redirect unauthorized users to their default view
  React.useEffect(() => {
    if (isAuthenticated && user && !canAccessView(user, view, roles)) {
      navigate("ltp-dashboard");
    }
  }, [isAuthenticated, user, view, roles, navigate]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const ViewComponent =
    view === "admin-settings" && user?.role === "ADMIN"
      ? LtpPortalView
      : view.startsWith("admin-") && user?.role === "ADMIN"
        ? (VIEW_REGISTRY[view] ?? UnifiedDashboard)
        : (view === "ltp-application-details" ? LtpApplicationDetails : LtpPortalView);

  return (
    <AppShell>
      <ViewComponent />
    </AppShell>
  );
}

