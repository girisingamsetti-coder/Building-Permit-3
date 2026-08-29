"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { ViewKey } from "@/types";

// ============================================================
// PAGE BACK BUTTON — reusable smart back navigation
// Uses the store's viewHistory for context-aware back navigation.
// Falls back to a provided fallbackView if no history exists (deep-link case).
// ============================================================

const VIEW_LABELS: Record<ViewKey, string> = {
  login: "Login",
  "forgot-password": "Login",
  otp: "Login",
  "ltp-dashboard": "Dashboard",
  "ltp-applications": "Applications",
  "ltp-application-details": "Applications",
  "ltp-create-application": "Applications",
  "ltp-drawings": "Drawings",
  "ltp-scrutiny": "Scrutiny",
  "ltp-documents": "Documents",
  "ltp-fees": "Fees",
  "ltp-payment": "Payments",
  "ltp-receipt": "Payments",
  "ltp-shortfalls": "Shortfalls",
  "ltp-notifications": "Notifications",
  "ltp-profile": "Profile",
  "ltp-help": "Help",
  "officer-dashboard": "Dashboard",
  "officer-review": "Assigned Queue",
  "officer-applications": "Assigned Queue",
  "admin-dashboard": "Dashboard",
  "admin-users": "Users",
  "admin-roles": "Roles",
  "admin-application-types": "Application Types",
  "admin-fee-structures": "Fee Structures",
  "admin-workflow": "Workflow",
  "admin-templates": "Templates",
  "admin-audit": "Audit Logs",
  "admin-settings": "Settings",
};

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
  const { viewHistory, goBack, navigate } = useAppStore();

  // Determine label and action
  const hasHistory = viewHistory.length > 0;
  const previousView = hasHistory ? viewHistory[viewHistory.length - 1] : fallbackView;
  const label = hasHistory
    ? VIEW_LABELS[previousView ?? "ltp-dashboard"] ?? "Dashboard"
    : fallbackLabel ?? (fallbackView ? VIEW_LABELS[fallbackView] ?? "Dashboard" : "Dashboard");

  function handleBack() {
    if (hasHistory) {
      goBack();
    } else if (fallbackView) {
      navigate(fallbackView);
    }
  }

  // Don't render if no history and no fallback
  if (!hasHistory && !fallbackView) return null;

  if (compact) {
    return (
      <button
        onClick={handleBack}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          className
        )}
        aria-label={`Go back to ${label}`}
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
