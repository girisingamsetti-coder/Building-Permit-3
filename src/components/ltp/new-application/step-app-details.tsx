"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, FileText } from "lucide-react";
import type { ApplicationType, PropertyType } from "@/types";

const APP_TYPES: { value: ApplicationType; label: string; desc: string }[] = [
  { value: "BUILDING_PERMISSION", label: "Building Permission", desc: "New construction, addition/alteration" },
  { value: "LAYOUT_APPROVAL", label: "Layout Approval", desc: "Group housing & layout sanction" },
  { value: "OCCUPANCY_CERTIFICATE", label: "Occupancy Certificate", desc: "Post-construction occupancy" },
  { value: "REVISION_PERMISSION", label: "Revision Permission", desc: "Modify approved plan" },
  { value: "DEVELOPMENT_PERMIT", label: "Development Permit", desc: "Land development" },
  { value: "DEMOLITION_PERMIT", label: "Demolition Permit", desc: "Structure demolition" },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "INSTITUTIONAL", label: "Institutional" },
  { value: "MIXED_USE", label: "Mixed Use" },
];

export interface AppDetailsData {
  appType: ApplicationType;
  propertyType: PropertyType;
  applicantName: string;
  applicantContact: string;
  applicantEmail: string;
  ltpLicense: string;
}

export function ApplicationDetailsStep({
  data,
  update,
  errors,
}: {
  data: AppDetailsData;
  update: <K extends keyof AppDetailsData>(k: K, v: AppDetailsData[K]) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      {/* Application Type */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Application Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {APP_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update("appType", t.value)}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border-2 p-3 text-left transition-all",
                data.appType === t.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", data.appType === t.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                <FileText className="size-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </div>
              {data.appType === t.value && <CheckCircle2 className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
        {errors.appType && <p className="text-[11px] text-destructive">{errors.appType}</p>}
      </div>

      {/* Property Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Property Type <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update("propertyType", p.value)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                data.propertyType === p.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicant fields — strict 2-column grid */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Applicant Name" required error={errors.applicantName}>
          <Input className="h-11" value={data.applicantName} onChange={(e) => update("applicantName", e.target.value)} placeholder="e.g. Ar. Vikram Deshpande" />
        </Field>
        <Field label="Mobile Number" required error={errors.applicantContact}>
          <Input className="h-11" value={data.applicantContact} onChange={(e) => update("applicantContact", e.target.value)} placeholder="+91 98XXX XXXXX" />
        </Field>
        <Field label="Email Address" error={errors.applicantEmail}>
          <Input className="h-11" type="email" value={data.applicantEmail} onChange={(e) => update("applicantEmail", e.target.value)} placeholder="applicant@email.com" />
        </Field>
        <Field label="LTP License Number">
          <Input className="h-11" value={data.ltpLicense} onChange={(e) => update("ltpLicense", e.target.value)} placeholder="LTP-MC-XXXX-XXXX" />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      <div className="min-h-[16px]">
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
