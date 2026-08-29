"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useVisibleApplications } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/design-system/badges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ChevronRight, ExternalLink } from "lucide-react";
import type { Application, ViewKey } from "@/types";

// ============================================================
// APPLICATION CONTEXT BAR
// Reusable component showing the currently selected application
// at the top of application-specific pages (Drawings, Documents, Fees, etc.)
// ============================================================

export function ApplicationContextBar({
  app,
  onChangeView,
  showViewButton = true,
}: {
  app: Application;
  onChangeView?: ViewKey;
  showViewButton?: boolean;
}) {
  const { openApplication, navigate } = useAppStore();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-gov sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-primary">{app.applicationNo}</span>
            <StatusBadge status={app.status} showIcon={false} />
          </div>
          <p className="text-sm font-medium truncate">{app.project.name}</p>
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
            <span>{app.project.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
            <span>·</span>
            <span>{app.project.propertyType.replace("_", " ").toLowerCase()}</span>
            <span>·</span>
            <span>Applicant: {app.applicant.name}</span>
            <span>·</span>
            <span>Stage: {app.currentStageLabel}</span>
          </div>
        </div>
      </div>
      {showViewButton && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => openApplication(app.id, "ltp-application-details")}
        >
          <ExternalLink className="size-3.5" /> View Application
        </Button>
      )}
    </div>
  );
}

// ============================================================
// APPLICATION SELECTOR
// Compact dropdown for switching between applications.
// Shows application number + project name + applicant.
// ============================================================

export function ApplicationSelector({
  currentApp,
  view,
  apps,
}: {
  currentApp: Application;
  view: ViewKey;
  apps?: Application[];
}) {
  const { openApplication, navigate } = useAppStore();
  const visibleApps = useVisibleApplications();
  const allApps = apps ?? visibleApps;

  return (
    <Select
      value={currentApp.id}
      onValueChange={(id) => openApplication(id, view)}
    >
      <SelectTrigger className="h-8 w-[200px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allApps.map((a) => (
          <SelectItem key={a.id} value={a.id} className="text-xs">
            <div className="flex flex-col">
              <span className="font-mono font-medium">{a.applicationNo}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                {a.project.name} · {a.applicant.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
