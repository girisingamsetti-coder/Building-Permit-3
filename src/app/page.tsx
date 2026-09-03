"use client";

import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { canAccessView } from "@/lib/permissions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AppShell } from "@/components/layout/app-shell";

// LTP views
import { LtpDashboard } from "@/components/ltp/ltp-dashboard";
import { LtpApplications } from "@/components/ltp/ltp-applications";
import { LtpCreateApplication } from "@/components/ltp/ltp-create-application";
import { LtpApplicationDetails } from "@/components/ltp/ltp-application-details";
import { LtpDrawings, LtpScrutiny } from "@/components/ltp/ltp-drawings";
import { LtpDocuments } from "@/components/ltp/ltp-documents";
import { LtpFees, LtpPayment, LtpReceipt } from "@/components/ltp/ltp-fees";
import { LtpShortfalls } from "@/components/ltp/ltp-shortfalls";
import { LtpNotifications } from "@/components/ltp/ltp-notifications";
import { LtpProfile, LtpHelp } from "@/components/ltp/ltp-profile";

// Officer views
import { OfficerDashboard } from "@/components/officer/officer-dashboard";
import { OfficerApplications } from "@/components/officer/officer-applications";
import { OfficerReview } from "@/components/officer/officer-review";
import { OfficerDocuments } from "@/components/officer/officer-documents";

// Admin views
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminUsers } from "@/components/admin/admin-users";
import { AdminRoles } from "@/components/admin/admin-roles";
import { AdminApplicationTypes } from "@/components/admin/admin-application-types";
import { AdminFeeStructures } from "@/components/admin/admin-fee-structures";
import { AdminWorkflow } from "@/components/admin/admin-workflow";
import { AdminTemplates } from "@/components/admin/admin-templates";
import { AdminAudit } from "@/components/admin/admin-audit";
import { AdminSettings } from "@/components/admin/admin-settings";

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

import type { ViewKey } from "@/types";

const VIEW_REGISTRY: Record<ViewKey, React.ComponentType> = {
  // auth
  login: AuthScreen,
  "forgot-password": AuthScreen,
  otp: AuthScreen,
  // ltp
  "ltp-dashboard": LtpDashboard,
  "ltp-applications": LtpApplications,
  "ltp-create-application": LtpCreateApplication,
  "ltp-application-details": LtpApplicationDetails,
  "ltp-drawings": LtpDrawings,
  "ltp-scrutiny": LtpScrutiny,
  "ltp-documents": LtpDocuments,
  "ltp-fees": LtpFees,
  "ltp-payment": LtpPayment,
  "ltp-receipt": LtpReceipt,
  "ltp-shortfalls": LtpShortfalls,
  "ltp-notifications": LtpNotifications,
  "ltp-profile": LtpProfile,
  "ltp-help": LtpHelp,
  // officer
  "officer-dashboard": OfficerDashboard,
  "officer-review": OfficerReview,
  "officer-applications": OfficerApplications,
  "officer-documents": OfficerDocuments,
  // admin
  "admin-dashboard": AdminDashboard,
  "admin-users": AdminUsers,
  "admin-roles": AdminRoles,
  "admin-application-types": AdminApplicationTypes,
  "admin-fee-structures": AdminFeeStructures,
  "admin-workflow": AdminWorkflow,
  "admin-templates": AdminTemplates,
  "admin-audit": AdminAudit,
  "admin-settings": AdminSettings,
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
      const portal = user.role === "ADMIN" ? "admin-dashboard"
        : user.role === "LTP" ? "ltp-dashboard"
        : user.role === "PROJECT_MANAGER" ? "pm-dashboard"
        : "officer-dashboard";
      navigate(portal);
    }
  }, [isAuthenticated, user, view, roles, navigate]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const ViewComponent = VIEW_REGISTRY[view] ?? LtpDashboard;

  return (
    <AppShell>
      <ViewComponent />
    </AppShell>
  );
}
