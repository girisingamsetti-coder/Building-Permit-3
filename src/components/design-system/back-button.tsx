"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ViewKey } from "@/types";

// ============================================================
// HIERARCHICAL NAVIGATION CONFIG
// Each view has an explicit parent view (module hierarchy).
// The Back button navigates to the parent, NOT browser history.
// ============================================================

const VIEW_LABELS: Record<ViewKey, string> = {
  login: "Login",
  "forgot-password": "Login",
  otp: "Login",
  "ltp-dashboard": "Dashboard",
  "ltp-applications": "My Applications",
  "ltp-application-details": "Application",
  "ltp-create-application": "New Application",
  "ltp-drawings": "Drawings & Scrutiny",
  "ltp-scrutiny": "Scrutiny Report",
  "ltp-documents": "Documents",
  "ltp-fees": "Fees",
  "ltp-payment": "Payments",
  "ltp-receipt": "Receipt",
  "ltp-shortfalls": "Shortfalls",
  "ltp-notifications": "Notifications",
  "ltp-profile": "Profile",
  "ltp-help": "Help & Support",
  "officer-dashboard": "Dashboard",
  "officer-review": "Application Review",
  "officer-applications": "Assigned Queue",
  "officer-documents": "Document Review",
  "admin-dashboard": "Dashboard",
  "admin-users": "Users",
  "admin-roles": "Roles & Permissions",
  "admin-application-types": "Application Types",
  "admin-fee-structures": "Fee Structures",
  "admin-workflow": "Workflow Stages",
  "admin-templates": "Notification / SMS",
  "admin-audit": "Audit Logs",
  "admin-settings": "System Settings",
};

// Explicit parent hierarchy — NOT browser history
const PARENT_VIEW: Partial<Record<ViewKey, ViewKey>> = {
  // Drawings module hierarchy
  "ltp-scrutiny": "ltp-drawings",         // Scrutiny Report → Drawings & Scrutiny
  "ltp-drawings": "ltp-application-details", // Drawings → Application Details (if app selected)

  // Documents module hierarchy
  "ltp-documents": "ltp-application-details", // Documents → Application Details

  // Fees module hierarchy
  "ltp-fees": "ltp-application-details",       // Fees → Application Details

  // Payments module hierarchy
  "ltp-payment": "ltp-fees",               // Payment → Fees
  "ltp-receipt": "ltp-payment",            // Receipt → Payment

  // Shortfalls module hierarchy
  "ltp-shortfalls": "ltp-application-details", // Shortfalls → Application Details

  // Application Details → My Applications
  "ltp-application-details": "ltp-applications",

  // Create Application → My Applications
  "ltp-create-application": "ltp-applications",

  // Officer review → Assigned Queue
  "officer-review": "officer-applications",
};

// ============================================================
// PAGE BACK BUTTON — compact circular icon button
// Navigates to the explicit parent view, NOT browser history.
// ============================================================

export function PageBackButton({
  fallbackView,
  fallbackLabel,
  className,
  compact = false,
}: {
  fallbackView?: ViewKey;
  fallbackLabel?: string;
  className?: string;
  compact?: boolean;
}) {
  const { view, navigate, selectedApplicationId, openApplication } = useAppStore();

  // Determine parent: use explicit hierarchy, or fallback
  const parentView = PARENT_VIEW[view] ?? fallbackView ?? "ltp-dashboard";
  const label = fallbackLabel ?? VIEW_LABELS[parentView] ?? "Dashboard";

  function handleBack() {
    // If parent is application details, check if we have a selected app
    if (parentView === "ltp-application-details" && selectedApplicationId) {
      openApplication(selectedApplicationId, "ltp-application-details");
    } else if (parentView === "ltp-application-details" && !selectedApplicationId) {
      // No app selected — fall back to My Applications
      navigate("ltp-applications");
    } else {
      navigate(parentView);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleBack}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          className
        )}
        aria-label="Go back"
        title={`Go back to ${label}`}
      >
        <ArrowLeft className="size-4" />
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn(
        "group -ml-2 mb-1 h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      aria-label={`Back to ${label}`}
    >
      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      <span>Back to {label}</span>
    </Button>
  );
}

// ============================================================
// PAGE BREADCRUMB — compact breadcrumb with circular back icon
// Shows the module hierarchy as clickable breadcrumbs.
// ============================================================

export interface BreadcrumbItem {
  label: string;
  view?: ViewKey;
  applicationId?: string;
}

export function PageBreadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const { navigate, openApplication } = useAppStore();

  // Determine parent for the back button: the second-to-last item
  const parentItem = items.length >= 2 ? items[items.length - 2] : null;

  function handleBack() {
    if (!parentItem) return;
    if (parentItem.applicationId) {
      openApplication(parentItem.applicationId, parentItem.view ?? "ltp-application-details");
    } else if (parentItem.view) {
      navigate(parentItem.view);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Compact circular back button */}
      {parentItem && (
        <button
          onClick={handleBack}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Go back"
          title={`Go back to ${parentItem.label}`}
        >
          <ArrowLeft className="size-4" />
        </button>
      )}

      {/* Breadcrumb trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isClickable = !isLast && (item.view || item.applicationId);

          function handleClick() {
            if (item.applicationId) {
              openApplication(item.applicationId, item.view ?? "ltp-application-details");
            } else if (item.view) {
              navigate(item.view);
            }
          }

          return (
            <React.Fragment key={idx}>
              {isClickable ? (
                <button
                  onClick={handleClick}
                  className="hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ) : (
                <span className={cn("whitespace-nowrap", isLast && "text-foreground font-medium")}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3 shrink-0" />}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
