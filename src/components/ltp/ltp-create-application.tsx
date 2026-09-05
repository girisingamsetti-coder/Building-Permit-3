"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { PageHeader, SectionCard, InfoGrid } from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import { FileUploader, type UploadedFile } from "@/components/design-system/files";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Upload,
  FolderClosed,
  Save,
  AlertCircle,
  Eye,
  Download,
  X,
  FileCheck2,
  ChevronRight,
  Building,
  MapPinned,
} from "lucide-react";

// ============================================================
// WIZARD STEPS — 7 stages
// ============================================================
const STEPS = [
  { id: 0, label: "Application Type", icon: FileText },
  { id: 1, label: "Applicant Details", icon: User },
  { id: 2, label: "Project Information", icon: Building2 },
  { id: 3, label: "Property Location", icon: MapPin },
  { id: 4, label: "Drawing Upload", icon: Upload },
  { id: 5, label: "Required Documents", icon: FolderClosed },
  { id: 6, label: "Review & Submit", icon: Check },
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

const DOC_CHECKLIST = [
  { code: "DOC_712", name: "7/12 Land Extract", required: true },
  { code: "DOC_PROP_CARD", name: "Property Card / Mutation", required: true },
  { code: "DOC_ARCH", name: "Architectural Drawings (stamped)", required: true },
  { code: "DOC_STRUCT", name: "Structural Drawings & Stability Certificate", required: true },
  { code: "DOC_FIRE_NOC", name: "NOC from Fire Department", required: true },
  { code: "DOC_ENV", name: "Environmental Clearance", required: false },
  { code: "DOC_AUTH", name: "Society / Landowner Authorization", required: true },
  { code: "DOC_AFFIDAVIT", name: "Affidavit — Ownership", required: true },
];

export function LtpCreateApplication() {
  const { user, navigate, createApplication, openApplication } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedAppNo, setSubmittedAppNo] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    appType: "BUILDING_PERMISSION" as ApplicationType,
    applicantName: user?.name ?? "",
    applicantContact: user?.phone ?? "",
    applicantEmail: user?.email ?? "",
    ltpLicense: user?.licenseNo ?? "",
    applicantType: "INDIVIDUAL",
    applicantAddress: "",
    projectName: "",
    propertyType: "RESIDENTIAL" as PropertyType,
    builtUpArea: "",
    numFloors: "",
    numUnits: "",
    plotArea: "",
    surveyNo: "",
    plotNo: "",
    ward: "",
    zone: "",
    locality: "",
    district: "Pune",
    state: "Maharashtra",
    pincode: "",
  });

  // Drawing upload state
  const [drawingFiles, setDrawingFiles] = React.useState<UploadedFile[]>([]);
  // Document upload state: which doc codes have been "uploaded"
  const [uploadedDocs, setUploadedDocs] = React.useState<Record<string, { fileName: string; fileSize: string }>>({});

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function isStepValid(s: number): boolean {
    switch (s) {
      case 0: return !!form.appType;
      case 1: return !!form.applicantName && !!form.applicantContact;
      case 2: return !!form.projectName && !!form.builtUpArea && !!form.plotArea;
      case 3: return !!form.surveyNo && !!form.ward && !!form.zone;
      case 4: return drawingFiles.length > 0 && drawingFiles.every((f) => f.status === "done");
      case 5: return DOC_CHECKLIST.filter((d) => d.required).every((d) => !!uploadedDocs[d.code]);
      case 6: return true;
      default: return false;
    }
  }

  function handleSaveDraft() {
    toast({
      title: "Draft saved",
      description: "Your application progress has been saved. You can continue later from My Applications.",
    });
  }

  function handleSubmit() {
    setConfirmOpen(false);
    const newId = createApplication({
      applicationType: form.appType,
      propertyType: form.propertyType,
      projectName: form.projectName,
      applicantName: form.applicantName,
      applicantContact: form.applicantContact,
      applicantEmail: form.applicantEmail,
      applicantAddress: form.applicantAddress,
      plotArea: Number(form.plotArea) || 0,
      builtUpArea: Number(form.builtUpArea) || 0,
      landUse: form.propertyType === "COMMERCIAL" ? "Commercial (C1)" : "Residential (R1)",
      ward: form.ward,
      zone: form.zone,
      surveyNo: form.surveyNo,
      address: `${form.plotNo}, ${form.locality}, ${form.district}, ${form.state} — ${form.pincode}`,
      drawingFileName: drawingFiles[0]?.name,
      drawingFileSize: drawingFiles[0]?.size,
      uploadedDocCodes: Object.keys(uploadedDocs),
    });
    // Generate the app number for display
    const seq = String(useAppStore.getState().applications.length).padStart(4, "0");
    setSubmittedAppNo(`MC/BP/2026/04/${seq}`);
    setSubmitted(true);
    toast({
      title: "Application submitted",
      description: `Application ${submittedAppNo} has been created successfully.`,
    });
  }

  // ---- Success screen ----
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <SectionCard noPadding>
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
              <PartyPopper className="size-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Application Submitted Successfully</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Your application has been created and is now entering the drawing scrutiny stage.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-xl border border-border bg-muted/30 p-4">
              <InfoGrid
                items={[
                  { label: "Application No.", value: <span className="font-mono text-primary">{submittedAppNo}</span> },
                  { label: "Status", value: <Badge className="bg-info/10 text-info">Submitted</Badge> },
                  { label: "Next Step", value: "Drawing Scrutiny" },
                  { label: "Submitted On", value: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ]}
                columns={2}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate("ltp-applications")}>
                Go to My Applications
              </Button>
              <Button onClick={() => openApplication(useAppStore.getState().applications[0]?.id ?? "", "ltp-application-details")}>
                View Application <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="ltp-applications" fallbackLabel="My Applications" />
      <PageHeader
        title="New Application"
        description="Create a new building permit application"
        icon={FilePlus2}
        breadcrumbs={[
          { label: "LTP Portal", onClick: () => navigate("ltp-dashboard") },
          { label: "My Applications", onClick: () => navigate("ltp-applications") },
          { label: "New Application" },
        ]}
      />

      {/* Horizontal stepper */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
        <ol className="flex items-center justify-between overflow-x-auto">
          {STEPS.map((s, idx) => {
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <li key={s.id} className="flex flex-1 items-center min-w-0">
                <button
                  onClick={() => idx <= step && setStep(idx)}
                  disabled={idx > step}
                  className="flex items-center gap-2 text-left disabled:cursor-not-allowed"
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
                  <div className="hidden sm:block min-w-0">
                    <p className={cn("text-xs font-medium leading-tight truncate", isActive ? "text-foreground" : "text-muted-foreground")}>
                      <span className="text-muted-foreground">{String(idx + 1).padStart(2, "0")}.</span> {s.label}
                    </p>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cn("mx-2 h-0.5 flex-1 min-w-[12px] rounded-full", idx < step ? "bg-success" : "bg-border")} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Step content */}
      <SectionCard title={STEPS[step].label}>
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
              <div className="sm:col-span-2">
                <Field label="Property Type" required>
                  <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v as PropertyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Applicant / LTP Name" required>
                <Input value={form.applicantName} onChange={(e) => update("applicantName", e.target.value)} placeholder="e.g. Ar. Vikram Deshpande" />
              </Field>
              <Field label="Mobile Number" required>
                <Input value={form.applicantContact} onChange={(e) => update("applicantContact", e.target.value)} placeholder="+91 98XXX XXXXX" />
              </Field>
              <Field label="Email"><Input type="email" value={form.applicantEmail} onChange={(e) => update("applicantEmail", e.target.value)} placeholder="applicant@email.com" /></Field>
              <Field label="LTP License Number"><Input value={form.ltpLicense} onChange={(e) => update("ltpLicense", e.target.value)} placeholder="LTP-MC-XXXX-XXXX" /></Field>
              <Field label="Applicant Type">
                <Select value={form.applicantType} onValueChange={(v) => update("applicantType", v)}>
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
                <Field label="Address"><Textarea value={form.applicantAddress} onChange={(e) => update("applicantAddress", e.target.value)} placeholder="Complete postal address" rows={2} /></Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Project Name" required><Input value={form.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="e.g. Greenfield Residency" /></Field>
              </div>
              <Field label="Built-up Area (sq.m)" required><Input type="number" value={form.builtUpArea} onChange={(e) => update("builtUpArea", e.target.value)} placeholder="e.g. 1780" /></Field>
              <Field label="Plot Area (sq.m)" required><Input type="number" value={form.plotArea} onChange={(e) => update("plotArea", e.target.value)} placeholder="e.g. 1250" /></Field>
              <Field label="Number of Floors"><Input type="number" value={form.numFloors} onChange={(e) => update("numFloors", e.target.value)} placeholder="e.g. 7" /></Field>
              <Field label="Number of Units"><Input type="number" value={form.numUnits} onChange={(e) => update("numUnits", e.target.value)} placeholder="e.g. 14" /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Survey Number" required><Input value={form.surveyNo} onChange={(e) => update("surveyNo", e.target.value)} placeholder="e.g. Hissa 14/2" /></Field>
              <Field label="Plot Number"><Input value={form.plotNo} onChange={(e) => update("plotNo", e.target.value)} placeholder="e.g. Plot 14" /></Field>
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
              <Field label="Village / Locality"><Input value={form.locality} onChange={(e) => update("locality", e.target.value)} placeholder="e.g. Baner" /></Field>
              <Field label="District"><Input value={form.district} onChange={(e) => update("district", e.target.value)} /></Field>
              <Field label="State"><Input value={form.state} onChange={(e) => update("state", e.target.value)} /></Field>
              <Field label="PIN Code"><Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="e.g. 411045" /></Field>
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                  <MapPinned className="size-4 shrink-0" />
                  <span>Map integration (GIS) will be available here in a future update. Property coordinates will be captured automatically.</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-info">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>Upload your project drawings (DWG, DXF or PDF). Drawing scrutiny will run automatically after submission. Supported formats: DWG, DXF, PDF (max 50 MB).</p>
              </div>
              <FileUploader
                label="Drop drawing here"
                hint="Supported: DWG, DXF, PDF · max 50 MB"
                accept=".dwg,.dxf,.pdf"
                uploadedFiles={drawingFiles}
                onUpload={(newFiles) => {
                  setDrawingFiles((prev) => {
                    const map = new Map(prev.map((f) => [f.id, f]));
                    newFiles.forEach((f) => map.set(f.id, f));
                    return Array.from(map.values());
                  });
                }}
                onRemove={(id) => setDrawingFiles((prev) => prev.filter((f) => f.id !== id))}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Upload the required documents based on your application type. Documents will be verified by the TPA after submission.</p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Document</th>
                      <th className="px-4 py-2.5 font-medium w-20">Required</th>
                      <th className="px-4 py-2.5 font-medium w-28">Status</th>
                      <th className="px-4 py-2.5 font-medium text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {DOC_CHECKLIST.map((d) => {
                      const isUploaded = !!uploadedDocs[d.code];
                      return (
                        <tr key={d.code} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium">{d.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{d.code}</p>
                          </td>
                          <td className="px-4 py-3">
                            {d.required ? <Badge className="bg-destructive/10 text-destructive text-[9px]">Required</Badge> : <Badge variant="outline" className="text-[9px]">Optional</Badge>}
                          </td>
                          <td className="px-4 py-3">
                            {isUploaded ? <Badge className="bg-info/10 text-info text-[9px]">Uploaded</Badge> : <Badge variant="outline" className="text-[9px] text-muted-foreground">Pending</Badge>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isUploaded ? (
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {
                                setUploadedDocs((prev) => {
                                  const next = { ...prev };
                                  delete next[d.code];
                                  return next;
                                });
                              }}>
                                <X className="size-3" /> Remove
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                                setUploadedDocs((prev) => ({ ...prev, [d.code]: { fileName: `${d.code}_v1.pdf`, fileSize: "1.2 MB" } }));
                                toast({ title: "Document uploaded", description: d.name });
                              }}>
                                <Upload className="size-3" /> Upload
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Review all details before submitting. Click "Edit" on any section to go back.</p>
              {[
                { step: 0, title: "Application Type", items: [{ label: "Type", value: APP_TYPES.find((t) => t.value === form.appType)?.label }, { label: "Property Type", value: PROPERTY_TYPES.find((p) => p.value === form.propertyType)?.label }] },
                { step: 1, title: "Applicant Details", items: [{ label: "Name", value: form.applicantName }, { label: "Contact", value: form.applicantContact }, { label: "Email", value: form.applicantEmail }, { label: "License", value: form.ltpLicense }] },
                { step: 2, title: "Project Information", items: [{ label: "Project", value: form.projectName }, { label: "Built-up Area", value: form.builtUpArea ? `${form.builtUpArea} sq.m` : "—" }, { label: "Plot Area", value: form.plotArea ? `${form.plotArea} sq.m` : "—" }, { label: "Floors", value: form.numFloors || "—" }] },
                { step: 3, title: "Property Location", items: [{ label: "Survey No.", value: form.surveyNo }, { label: "Ward", value: form.ward }, { label: "Zone", value: form.zone }, { label: "PIN", value: form.pincode || "—" }] },
                { step: 4, title: "Drawing Upload", items: [{ label: "Drawing", value: drawingFiles[0]?.name ?? "—" }, { label: "Size", value: drawingFiles[0]?.size ?? "—" }] },
                { step: 5, title: "Documents", items: [{ label: "Uploaded", value: `${Object.keys(uploadedDocs).length} of ${DOC_CHECKLIST.length}` }] },
              ].map((section) => (
                <div key={section.step} className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">{section.title}</p>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setStep(section.step)}>
                      Edit <ChevronRight className="size-3" />
                    </Button>
                  </div>
                  <InfoGrid items={section.items} columns={2} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button variant="outline" onClick={() => step === 0 ? navigate("ltp-applications") : setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleSaveDraft}>
              <Save className="size-4" /> Save as Draft
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!isStepValid(step)}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={() => setConfirmOpen(true)} disabled={!isStepValid(step)}>
                <Check className="size-4" /> Submit Application
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Application?</DialogTitle>
            <DialogDescription>
              Please confirm that all the information provided is accurate. Once submitted, the application will enter the drawing scrutiny stage.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-info">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>An application number will be generated and an SMS confirmation will be sent to the applicant.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              <Check className="size-4" /> Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
