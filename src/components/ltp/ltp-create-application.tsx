"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { PageHeader, SectionCard, InfoGrid } from "@/components/design-system/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ApplicationType, PropertyType } from "@/types";
import {
  FilePlus2,
  User,
  Building2,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  PartyPopper,
  FileText,
} from "lucide-react";

const STEPS = [
  { id: 0, label: "Application Type", description: "Select type of approval", icon: FileText },
  { id: 1, label: "Applicant Details", description: "Applicant & contact", icon: User },
  { id: 2, label: "Project Information", description: "Project & property", icon: Building2 },
  { id: 3, label: "Property Location", description: "Plot & survey details", icon: MapPin },
  { id: 4, label: "Review & Submit", description: "Confirm and create", icon: Check },
];

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

export function LtpCreateApplication() {
  const { navigate } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    appType: "BUILDING_PERMISSION" as ApplicationType,
    applicantName: "",
    applicantContact: "",
    applicantEmail: "",
    applicantAddress: "",
    projectName: "",
    propertyType: "RESIDENTIAL" as PropertyType,
    plotArea: "",
    builtUpArea: "",
    landUse: "",
    ward: "",
    zone: "",
    surveyNo: "",
    address: "",
    remarks: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit() {
    setSubmitted(true);
    toast({
      title: "Application created",
      description: "Your draft application has been saved. Proceed to upload drawings.",
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <SectionCard noPadding>
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
              <PartyPopper className="size-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Application Created Successfully</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Your draft application has been registered. An application number has been
                generated and an SMS confirmation will be sent to the applicant.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-xl border border-border bg-muted/30 p-4">
              <InfoGrid
                items={[
                  { label: "Application No.", value: <span className="font-mono text-primary">MC/BP/2025/04/0241</span> },
                  { label: "Type", value: APP_TYPES.find((t) => t.value === form.appType)?.label },
                  { label: "Project", value: form.projectName || "—" },
                  { label: "Status", value: <Badge className="bg-muted text-muted-foreground">Draft</Badge> },
                ]}
                columns={2}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate("ltp-applications")}>
                Go to applications
              </Button>
              <Button onClick={() => navigate("ltp-drawings")}>
                Upload drawings <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Application"
        description="Create a new building/project approval application. You can save as draft and continue later."
        icon={FilePlus2}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Applications", onClick: () => navigate("ltp-applications") }, { label: "New" }]}
      />

      {/* Stepper */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
        <ol className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <li key={s.id} className="flex flex-1 items-center">
                <button
                  onClick={() => idx <= step && setStep(idx)}
                  disabled={idx > step}
                  className="flex items-center gap-2.5 text-left disabled:cursor-not-allowed"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isDone && "border-success bg-success text-success-foreground",
                      isActive && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
                      !isDone && !isActive && "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {isDone ? <Check className="size-4" /> : <s.icon className="size-4" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn("text-xs font-medium leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.description}</p>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cn("mx-2 h-0.5 flex-1 rounded-full", idx < step ? "bg-success" : "bg-border")} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <SectionCard title={STEPS[step].label} description={STEPS[step].description}>
        <div className="space-y-5">
          {step === 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {APP_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => update("appType", t.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    form.appType === t.value
                      ? "border-primary bg-primary/5 shadow-gov"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className={cn("flex size-9 items-center justify-center rounded-lg", form.appType === t.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  {form.appType === t.value && <CheckCircle2 className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Applicant Name" required>
                <Input value={form.applicantName} onChange={(e) => update("applicantName", e.target.value)} placeholder="e.g. Shri. Anand Joshi" />
              </Field>
              <Field label="Contact Number" required>
                <Input value={form.applicantContact} onChange={(e) => update("applicantContact", e.target.value)} placeholder="+91 98XXX XXXXX" />
              </Field>
              <Field label="Email Address">
                <Input type="email" value={form.applicantEmail} onChange={(e) => update("applicantEmail", e.target.value)} placeholder="applicant@email.com" />
              </Field>
              <Field label="Applicant Type">
                <Select defaultValue="INDIVIDUAL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="PARTNERSHIP">Partnership Firm</SelectItem>
                    <SelectItem value="COMPANY">Company / LLP</SelectItem>
                    <SelectItem value="SOCIETY">Society / Association</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Applicant Address">
                  <Textarea value={form.applicantAddress} onChange={(e) => update("applicantAddress", e.target.value)} placeholder="Complete postal address" rows={2} />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Project Name" required>
                  <Input value={form.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="e.g. Greenfield Residency" />
                </Field>
              </div>
              <Field label="Property Type" required>
                <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v as PropertyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Proposed Land Use">
                <Input value={form.landUse} onChange={(e) => update("landUse", e.target.value)} placeholder="e.g. Residential (R1)" />
              </Field>
              <Field label="Plot Area (sq.m)" required>
                <Input type="number" value={form.plotArea} onChange={(e) => update("plotArea", e.target.value)} placeholder="e.g. 1250" />
              </Field>
              <Field label="Proposed Built-up Area (sq.m)" required>
                <Input type="number" value={form.builtUpArea} onChange={(e) => update("builtUpArea", e.target.value)} placeholder="e.g. 1780" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Project Description / Remarks">
                  <Textarea value={form.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Any additional information about the project" rows={3} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ward" required>
                <Select value={form.ward} onValueChange={(v) => update("ward", v)}>
                  <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                  <SelectContent>
                    {["Ward 09 — Aundh", "Ward 14 — Baner", "Ward 11 — Kalyani Nagar", "Ward 19 — Bavdhan", "Ward 22 — Kothrud", "Ward 27 — Wakad", "Ward 31 — Hadapsar"].map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Zone" required>
                <Select value={form.zone} onValueChange={(v) => update("zone", v)}>
                  <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                  <SelectContent>
                    {["Zone I — East", "Zone II — South", "Zone III — North", "Zone IV — West"].map((z) => (
                      <SelectItem key={z} value={z}>{z}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Survey No. / Hissa" required>
                <Input value={form.surveyNo} onChange={(e) => update("surveyNo", e.target.value)} placeholder="e.g. Hissa 14/2, Baner" />
              </Field>
              <Field label="CTS / Property No.">
                <Input placeholder="e.g. 14/2" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Property Address">
                  <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Complete site address" rows={2} />
                </Field>
              </div>
              <div className="sm:col-span-2 flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-info">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>After submission, you will be prompted to upload drawings. The auto-scrutiny engine will validate your drawing against the Development Control Regulations (DCR).</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <InfoGrid
                  items={[
                    { label: "Application Type", value: APP_TYPES.find((t) => t.value === form.appType)?.label },
                    { label: "Property Type", value: PROPERTY_TYPES.find((p) => p.value === form.propertyType)?.label },
                    { label: "Applicant", value: form.applicantName || "—" },
                    { label: "Contact", value: form.applicantContact || "—" },
                    { label: "Project Name", value: form.projectName || "—" },
                    { label: "Plot Area", value: form.plotArea ? `${form.plotArea} sq.m` : "—" },
                    { label: "Built-up Area", value: form.builtUpArea ? `${form.builtUpArea} sq.m` : "—" },
                    { label: "Ward / Zone", value: form.ward && form.zone ? `${form.ward} · ${form.zone}` : "—" },
                    { label: "Survey No.", value: form.surveyNo || "—" },
                    { label: "Address", value: form.address || "—" },
                  ]}
                  columns={2}
                />
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning-foreground">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>By submitting, you confirm that the information provided is accurate. A draft application will be created and an SMS sent to the applicant. You can edit details until drawings are uploaded.</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button variant="outline" onClick={() => step === 0 ? navigate("ltp-applications") : setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check className="size-4" /> Create Application
            </Button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
