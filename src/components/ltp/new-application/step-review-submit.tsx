"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { AppDetailsData } from "./step-app-details";
import type { ProjectPropertyData } from "./step-project-property";
import type { UploadedFile } from "@/components/design-system/files";

const APP_TYPE_LABELS: Record<string, string> = {
  BUILDING_PERMISSION: "Building Permission",
  LAYOUT_APPROVAL: "Layout Approval",
  OCCUPANCY_CERTIFICATE: "Occupancy Certificate",
  REVISION_PERMISSION: "Revision Permission",
  DEVELOPMENT_PERMIT: "Development Permit",
  DEMOLITION_PERMIT: "Demolition Permit",
};

export function ReviewSubmitStep({
  appData,
  projectData,
  drawingFiles,
  uploadedDocs,
  docCount,
  onEdit,
}: {
  appData: AppDetailsData;
  projectData: ProjectPropertyData;
  drawingFiles: UploadedFile[];
  uploadedDocs: Record<string, { fileName: string; fileSize: string }>;
  docCount: number;
  onEdit: (step: number) => void;
}) {
  const sections = [
    {
      step: 0,
      title: "Application Type",
      items: [
        { label: "Type", value: APP_TYPE_LABELS[appData.appType] ?? appData.appType },
        { label: "Property Type", value: appData.propertyType.replace("_", " ").toLowerCase() },
      ],
    },
    {
      step: 0,
      title: "Applicant Details",
      items: [
        { label: "Name", value: appData.applicantName || "—" },
        { label: "Mobile", value: appData.applicantContact || "—" },
        { label: "Email", value: appData.applicantEmail || "—" },
        { label: "License", value: appData.ltpLicense || "—" },
      ],
    },
    {
      step: 1,
      title: "Project & Property",
      items: [
        { label: "Project", value: projectData.projectName || "—" },
        { label: "Built-up Area", value: projectData.builtUpArea ? `${projectData.builtUpArea} sq.m` : "—" },
        { label: "Plot Area", value: projectData.plotArea ? `${projectData.plotArea} sq.m` : "—" },
        { label: "Survey No.", value: projectData.surveyNo || "—" },
        { label: "Ward", value: projectData.ward || "—" },
        { label: "Zone", value: projectData.zone || "—" },
      ],
    },
    {
      step: 2,
      title: "Drawing Upload",
      items: [
        { label: "File", value: drawingFiles[0]?.name ?? "—" },
        { label: "Size", value: drawingFiles[0]?.size ?? "—" },
      ],
    },
    {
      step: 3,
      title: "Documents",
      items: [
        { label: "Uploaded", value: `${Object.keys(uploadedDocs).length} of ${docCount}` },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Review all details before submitting. Click "Edit" on any section to go back.
      </p>
      {sections.map((section, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold">{section.title}</p>
            <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => onEdit(section.step)}>
              Edit <ChevronRight className="size-3" />
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {section.items.map((item, i) => (
              <div key={i} className="space-y-0.5">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="text-xs font-medium text-foreground truncate">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
