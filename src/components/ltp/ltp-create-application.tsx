"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { PageBackButton } from "@/components/design-system/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Check,
  ArrowRight,
  ArrowLeft,
  Save,
  Info,
  PartyPopper,
  Building2,
  MapPin,
  User,
  Users,
  FileText,
  Home,
  HardHat,
  Eye,
  ShieldCheck,
  FilePlus2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hammer,
  ClipboardList,
  ChevronRight,
  FileCheck,
  Pencil,
  UploadCloud,
} from "lucide-react";

type AppTypeKey = "COMMERCIAL_BP" | "LAYOUT_APPROVAL" | "RESIDENTIAL_BP";

interface WizardData {
  appType: AppTypeKey | "";
  general: {
    caseType: string;
    permissionType: string;
    natureOfPermission: string;
    applicationType: string;
    lpsLayout: string;
    district: string;
    mandal: string;
    lpsVillage: string;
    gramPanchayat: string;
    township: string;
    sector: string;
    colony: string;
    natureOfSite: string;
    blockNo: string;
    surveyNo: string;
    plotNo: string;
    landUseZone: string;
    zoningDistrict: string;
    proposedUse: string;
    proposedActivity: string;
    roadStreet: string;
    buildingHeight: string;
  };
  applicant: {
    usagePurpose: string;
    ownerName: string;
    doorFlatNo: string;
    roadStreet: string;
    city: string;
    district: string;
    pinCode: string;
    email: string;
    mobile: string;
    aadhaar: string;
    structuralEngineer: string;
    licenceValidityDate: string;
  };
  plot: {
    proposedPlotArea: string;
    plotStructure: string;
    compoundWall: string;
    tdr: string;
    religiousStructures: string;
    aerodrome: string;
    waterBodiesRailwaysHTLines: string;
    marketValue: string;
    abutsIRR: string;
    boundaryNorth: string;
    boundarySouth: string;
    boundaryEast: string;
    boundaryWest: string;
  };
  checklist: {
    heightGt10: string; heightGt10Remark: string;
    monumentBuffer: string; monumentBufferRemark: string;
    railway30m: string; railway30mRemark: string;
    builtUpGt20k: string; builtUpGt20kRemark: string;
  };
  documents: {
    ownershipDoc: File | null;
    sitePlan: File | null;
    buildingPlan: File | null;
  };
  others: {
    contractorsRiskPolicyNo: string;
    contractorsDate: string;
    validUpto: string;
    mortgageDeedNo: string;
    mortgageDeedDate: string;
    floorHandedOver: string;
    subRegisterOffice: string;
    areaSqMtr: string;
    solarPanelsAvailable: string;
  };
  bimModel: {
    modelFile: File | null;
  };
}

const WIZARD_STEPS = [
  { id: 1, label: "General Information", short: "General", icon: Building2 },
  { id: 2, label: "Applicant Information", short: "Applicant", icon: Users },
  { id: 3, label: "Plot Details", short: "Plot", icon: MapPin },
  { id: 4, label: "Application Checklist", short: "Checklist", icon: ClipboardList },
  { id: 5, label: "Document Checklist", short: "Documents", icon: FileText },
  { id: 6, label: "Others", short: "Others", icon: HardHat },
  { id: 7, label: "BIM Model", short: "BIM", icon: Home },
  { id: 8, label: "Send to Scrutiny", short: "Submit", icon: ShieldCheck },
] as const;

const APP_TYPE_OPTIONS: {
  key: AppTypeKey;
  label: string;
  description: string;
  numberSeries: string;
  features: string[];
  icon: React.ElementType;
}[] = [
  {
    key: "COMMERCIAL_BP",
    label: "Commercial building permission",
    description: "Shop, office or commercial development",
    numberSeries: "BP/...",
    features: ["Drawing scrutiny required"],
    icon: Building2,
  },
  {
    key: "LAYOUT_APPROVAL",
    label: "Layout approval",
    description: "Sub-division of land into plots",
    numberSeries: "LP/...",
    features: ["Drawing scrutiny required"],
    icon: ClipboardList,
  },
  {
    key: "RESIDENTIAL_BP",
    label: "Residential building permission",
    description: "Individual residential building or apartment block",
    numberSeries: "BP/...",
    features: ["Drawing scrutiny required"],
    icon: Home,
  },
];

const INITIAL_DATA: WizardData = {
  appType: "",
  general: {
    caseType: "New", permissionType: "Building Permission", natureOfPermission: "General", applicationType: "Private",
    lpsLayout: "Non-LPS", district: "", mandal: "", lpsVillage: "", gramPanchayat: "", township: "", sector: "", colony: "",
    natureOfSite: "", blockNo: "", surveyNo: "", plotNo: "", landUseZone: "", zoningDistrict: "", proposedUse: "", proposedActivity: "",
    roadStreet: "", buildingHeight: ""
  },
  applicant: {
    usagePurpose: "Self Use", ownerName: "", doorFlatNo: "", roadStreet: "", city: "", district: "", pinCode: "", email: "", mobile: "", aadhaar: "", structuralEngineer: "", licenceValidityDate: ""
  },
  plot: {
    proposedPlotArea: "", plotStructure: "", compoundWall: "No", tdr: "No", religiousStructures: "No", aerodrome: "No", waterBodiesRailwaysHTLines: "No", marketValue: "", abutsIRR: "No",
    boundaryNorth: "", boundarySouth: "", boundaryEast: "", boundaryWest: ""
  },
  checklist: {
    heightGt10: "No", heightGt10Remark: "", monumentBuffer: "No", monumentBufferRemark: "", railway30m: "No", railway30mRemark: "", builtUpGt20k: "No", builtUpGt20kRemark: ""
  },
  documents: { ownershipDoc: null, sitePlan: null, buildingPlan: null },
  others: {
    contractorsRiskPolicyNo: "", contractorsDate: "", validUpto: "", mortgageDeedNo: "", mortgageDeedDate: "", floorHandedOver: "", subRegisterOffice: "", areaSqMtr: "", solarPanelsAvailable: "No"
  },
  bimModel: { modelFile: null }
};

function validateMobile(v: string) { return /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g, "")); }
function validateEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isNumber(v: string) { return !isNaN(Number(v)) && v.trim() !== ""; }

function validateStep(step: number, data: WizardData): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 1) {
    if (!data.general.district.trim()) e.generalDistrict = "Required";
  }
  if (step === 2) {
    if (!data.applicant.ownerName.trim()) e.ownerName = "Required";
  }
  if (step === 3) {
    if (!data.plot.proposedPlotArea.trim()) e.proposedPlotArea = "Required";
  }
  return e;
}

const DRAFT_KEY = "ltp_wizard_draft2";
function saveDraft(data: WizardData, step: number, draftNo: string) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, draftNo, savedAt: new Date().toISOString() })); } catch { }
}
function loadDraft(): { data: WizardData; step: number; draftNo: string; savedAt: string } | null {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { } }
function genDraftNo(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `Temp/1168/0014/BP/${year}/${seq}`;
}

function Field({ label, required, hint, error, children, className }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-600">
          <AlertCircle className="size-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function SectionDivider({ title, description }: { title: string; description?: string }) {
  return (
    <div className="col-span-full mt-6 mb-2">
      <div className="flex items-center gap-4">
        <h3 className="whitespace-nowrap text-sm font-bold text-[#7A1316]">{title}</h3>
        <div className="h-px w-full bg-[#DCD5C8]" />
      </div>
      {description && <p className="mt-1 text-[11px] text-slate-500">{description}</p>}
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#DCD5C8] bg-[#FBF3E4] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#DCD5C8] bg-[#F5EBE1] px-4 py-3">
        <h3 className="text-sm font-bold text-[#7A1316]">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 gap-1.5 text-xs text-[#7A1316] hover:text-[#8F161A] hover:bg-[#FAF4EB]">
          <Pencil className="size-3" />Edit
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-4 text-sm">{children}</div>
    </div>
  );
}

function RV({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

export function LtpCreateApplication({ onClose }: { onClose?: () => void } = {}) {
  const { user } = useAppStore();
  const { toast } = useToast();

  const [typeSelected, setTypeSelected] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<AppTypeKey | "">("");

  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<WizardData>(INITIAL_DATA);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [draftNo, setDraftNo] = React.useState("");
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedAppNo, setSubmittedAppNo] = React.useState("");

  React.useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.data) {
      setData(draft.data);
      setStep(draft.step || 1);
      setDraftNo(draft.draftNo);
      setSavedAt(draft.savedAt);
      if (draft.data.appType) {
        setSelectedType(draft.data.appType);
        setTypeSelected(true);
      }
      const cs = new Set<number>();
      for (let i = 1; i < (draft.step || 1); i++) cs.add(i);
      setCompletedSteps(cs);
    } else {
      setDraftNo(genDraftNo());
    }
  }, []);

  const triggerSave = React.useCallback(() => {
    setSaveStatus("saving");
    setTimeout(() => { saveDraft(data, step, draftNo); setSaveStatus("saved"); setSavedAt(new Date().toISOString()); setTimeout(() => setSaveStatus("idle"), 2000); }, 600);
  }, [data, step, draftNo]);

  React.useEffect(() => {
    if (typeSelected) {
      const t = setTimeout(triggerSave, 1500);
      return () => clearTimeout(t);
    }
  }, [data, step, typeSelected, triggerSave]);

  const upd = <K extends keyof WizardData>(section: K, updates: Partial<WizardData[K]>) => {
    setData((prev) => ({ ...prev, [section]: { ...(prev[section] as any), ...updates } }));
    setErrors({});
  };

  const handleNext = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast({ title: "Incomplete details", description: "Please fill all required fields correctly.", variant: "destructive" });
      return;
    }
    setCompletedSteps((prev) => new Set(prev).add(step));
    if (step < WIZARD_STEPS.length) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleBack = () => { if (step > 1) { setStep((s) => s - 1); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  
  const handleEditStep = (s: number) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSubmitting(false);
    setSubmitted(true);
    setSubmittedAppNo(`BA/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`);
    clearDraft();
  };

  const stepDescription = (step: number, data: WizardData): string => {
    return "Please provide all relevant details as per the checklist.";
  };

  const currentStepMeta = WIZARD_STEPS.find((s) => s.id === step) || WIZARD_STEPS[0];

  if (submitted) {
    return (
      <div className={cn("flex flex-col bg-slate-50", onClose ? "h-full" : "min-h-screen")}>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6"><PartyPopper className="size-8" /></div>
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
            <p className="mt-2 text-sm text-slate-500">Your application has been successfully submitted and forwarded to APCRDA for scrutiny.</p>
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Application Number</p>
              <p className="mt-1 text-xl font-mono font-bold text-slate-900">{submittedAppNo}</p>
            </div>
            <div className="mt-8 space-y-3">
              {onClose ? (
                <Button onClick={onClose} className="w-full h-11 text-base">Close</Button>
              ) : (
                <Button onClick={() => window.location.reload()} className="w-full h-11 text-base">Go to Dashboard</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!typeSelected) {
    return (
      <div className={cn("flex flex-col bg-[#FAF7F2]", onClose ? "h-full" : "min-h-screen")}>
        {!onClose && <div className="border-b-2 border-[#7A1316] bg-[#FBF3E4] px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-2xs"><PageBackButton fallbackLabel="Back to dashboard" /><div className="flex items-center gap-2"><div className="size-8 rounded-full bg-[#7A1316] text-white flex items-center justify-center font-bold text-sm">SP</div><span className="text-sm font-bold text-slate-800">Srinivas</span></div></div>}
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#7A1316]">New Application</h1>
            <p className="mt-1 text-xs text-slate-600">Select the type of application you want to submit.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APP_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSel = selectedType === opt.key;
              return (
                <div key={opt.key} onClick={() => setSelectedType(opt.key)} className={cn("group relative cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-xs", isSel ? "border-[#7A1316] bg-[#FBF3E4] ring-1 ring-[#7A1316]" : "border-[#DCD5C8] bg-white hover:border-[#7A1316]/60 hover:bg-[#FDF6ED]")}>
                  {isSel && <div className="absolute right-4 top-4 text-[#7A1316]"><CheckCircle2 className="size-5" /></div>}
                  <div className={cn("mb-4 inline-flex rounded-xl p-3", isSel ? "bg-[#7A1316] text-white" : "bg-[#F5EBE1] text-[#7A1316] group-hover:bg-[#7A1316] group-hover:text-white transition-colors")}><Icon className="size-6" /></div>
                  <h3 className={cn("font-bold", isSel ? "text-[#7A1316]" : "text-slate-900")}>{opt.label}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{opt.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end"><Button size="lg" disabled={!selectedType} onClick={() => { setTypeSelected(true); setData((prev) => ({ ...prev, appType: selectedType as AppTypeKey })); }} className="px-8 font-bold bg-[#7A1316] hover:bg-[#8F161A] text-white border border-[#630E10] cursor-pointer">Continue<ArrowRight className="ml-2 size-4" /></Button></div>
        </div>
      </div>
    );
  }

  const appTypeLabelShort = (key: AppTypeKey) => APP_TYPE_OPTIONS.find(o => o.key === key)?.label || "Application";

  return (
    <div className={cn("flex flex-col bg-[#FAF7F2]", onClose ? "h-full" : "min-h-screen")}>
      {!onClose && (
        <div className="border-b-2 border-[#7A1316] bg-[#FBF3E4] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <PageBackButton fallbackLabel="Exit wizard" />
            <div className="h-6 w-px bg-[#DCD5C8]" />
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-[#FAF7F2] border border-[#DCD5C8] px-2 py-1 text-xs font-semibold text-[#7A1316]">
                <FilePlus2 className="size-3.5" />Draft
              </span>
              <span className="text-sm font-bold text-slate-900">{draftNo}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              {saveStatus === "saving" ? <><Loader2 className="size-3.5 animate-spin" />Saving...</> : saveStatus === "saved" ? <><Check className="size-3.5 text-emerald-600" />Saved {savedAt ? new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "just now"}</> : <><Save className="size-3.5" />Unsaved changes</>}
            </div>
            <div className="flex items-center gap-2 border-l border-[#DCD5C8] pl-4">
              <div className="flex flex-col items-end hidden md:flex"><span className="text-sm font-bold text-slate-900">{user?.name || "LTP User"}</span><span className="text-[10px] uppercase tracking-wider text-slate-500">Registered LTP</span></div>
              <div className="flex size-9 items-center justify-center rounded-full bg-[#7A1316] font-bold text-white shadow-2xs">LTP</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-64 flex-col border-r border-[#DCD5C8] bg-[#FBF3E4] sm:flex shrink-0 z-20 overflow-y-auto">
          <div className="p-4 border-b border-[#DCD5C8]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A1316] mb-1">Creating</h2>
            <p className="text-sm font-bold text-slate-900 leading-snug">{appTypeLabelShort(data.appType as AppTypeKey)}</p>
          </div>
          <div className="flex-1 p-3">
            <ol className="space-y-1">
              {WIZARD_STEPS.map((s, idx) => {
                const isCurrent = s.id === step;
                const isDone = completedSteps.has(s.id);
                const isClickable = isDone || s.id === step || s.id === Math.max(0, ...Array.from(completedSteps)) + 1;
                const Icon = s.icon;
                return (
                  <li key={s.id} className="relative">
                    {idx < WIZARD_STEPS.length - 1 && (
                      <div className={cn("absolute left-5 top-8 h-full w-[2px] -ml-px", completedSteps.has(s.id) ? "bg-[#7A1316]" : "bg-[#DCD5C8]")} />
                    )}
                    <button onClick={() => isClickable && setStep(s.id)} disabled={!isClickable} className={cn("group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all", isCurrent ? "bg-[#F5EBE1] border-l-4 border-[#7A1316]" : isClickable ? "hover:bg-[#FAF4EB]" : "opacity-50 cursor-not-allowed")}>
                      <div className={cn("relative flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold z-10 bg-white transition-colors", isDone ? "border-emerald-600 bg-emerald-600 text-white" : isCurrent ? "border-[#7A1316] border-2 bg-[#7A1316] text-white" : "border-[#DCD5C8] text-slate-400")}>
                        {isDone ? <Check className="size-3" strokeWidth={3} /> : s.id}
                      </div>
                      <span className={cn("text-xs font-semibold transition-colors", isCurrent ? "text-[#7A1316] font-bold" : isDone ? "text-slate-900" : "text-slate-500")}>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-[#FAF7F2]">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8 flex flex-col min-h-full">
            <div className="rounded-xl border-2 border-[#7A1316] bg-[#FBF3E4] shadow-xs flex-1 mb-6 overflow-hidden">
              <div className="border-b border-[#DCD5C8] bg-[#F5EBE1] px-6 py-4">
                <h2 className="text-base font-black text-[#7A1316] uppercase tracking-wide">{currentStepMeta.label}</h2>
                <p className="mt-0.5 text-xs text-slate-600">{stepDescription(step, data)}</p>
              </div>

              <div className="px-6 py-6 space-y-6">

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Case Type" required><Input value={data.general.caseType} onChange={e => upd("general", {caseType: e.target.value})} /></Field>
                    <Field label="Permission Type" required><Input value={data.general.permissionType} onChange={e => upd("general", {permissionType: e.target.value})} /></Field>
                    <Field label="Nature of Permission"><Input value={data.general.natureOfPermission} onChange={e => upd("general", {natureOfPermission: e.target.value})} /></Field>
                    <Field label="Application Type">
                        <Select value={data.general.applicationType} onValueChange={v => upd("general", {applicationType: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Private">Private</SelectItem><SelectItem value="Govt land">Govt land</SelectItem><SelectItem value="CRDA land">CRDA land</SelectItem></SelectContent>
                        </Select>
                    </Field>
                    <Field label="LPS Layout or Non-LPS">
                        <Select value={data.general.lpsLayout} onValueChange={v => upd("general", {lpsLayout: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="LPS Layout">LPS Layout</SelectItem><SelectItem value="Non-LPS">Non-LPS</SelectItem></SelectContent>
                        </Select>
                    </Field>
                    <SectionDivider title="Location Details" />
                    <Field label="District" required error={errors.generalDistrict}><Input value={data.general.district} onChange={e => upd("general", {district: e.target.value})} /></Field>
                    <Field label="Mandal"><Input value={data.general.mandal} onChange={e => upd("general", {mandal: e.target.value})} /></Field>
                    <Field label="LPS Village"><Input value={data.general.lpsVillage} onChange={e => upd("general", {lpsVillage: e.target.value})} /></Field>
                    <Field label="Gram panchayat"><Input value={data.general.gramPanchayat} onChange={e => upd("general", {gramPanchayat: e.target.value})} /></Field>
                    <Field label="Township"><Input value={data.general.township} onChange={e => upd("general", {township: e.target.value})} /></Field>
                    <Field label="Sector"><Input value={data.general.sector} onChange={e => upd("general", {sector: e.target.value})} /></Field>
                    <Field label="Colony"><Input value={data.general.colony} onChange={e => upd("general", {colony: e.target.value})} /></Field>
                    <SectionDivider title="Site Identifiers" />
                    {data.general.lpsLayout === "Non-LPS" ? (
                      <Field label="Nature of Site" required>
                        <Input
                          value={data.general.natureOfSite}
                          onChange={e => upd("general", {natureOfSite: e.target.value})}
                          placeholder="e.g. Approved Layout / Gramkantam / LRS"
                        />
                      </Field>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 bg-[#FAF4EB] border border-[#E0D2BE] rounded p-2.5 text-xs text-slate-700">
                        <span className="font-bold text-[#7A1316]">LPS Layout:</span> Nature of Site classification is not required.
                      </div>
                    )}
                    <Field label="Block No."><Input value={data.general.blockNo} onChange={e => upd("general", {blockNo: e.target.value})} /></Field>
                    <Field label="Survey No / D.No / R.S.No"><Input value={data.general.surveyNo} onChange={e => upd("general", {surveyNo: e.target.value})} /></Field>
                    <Field label="Plot No."><Input value={data.general.plotNo} onChange={e => upd("general", {plotNo: e.target.value})} /></Field>
                    <Field label="Land Use Zone"><Input value={data.general.landUseZone} onChange={e => upd("general", {landUseZone: e.target.value})} /></Field>
                    <Field label="Zoning District"><Input value={data.general.zoningDistrict} onChange={e => upd("general", {zoningDistrict: e.target.value})} /></Field>
                    <Field label="Proposed Use"><Input value={data.general.proposedUse} onChange={e => upd("general", {proposedUse: e.target.value})} /></Field>
                    <Field label="Proposed Activity"><Input value={data.general.proposedActivity} onChange={e => upd("general", {proposedActivity: e.target.value})} /></Field>
                    <Field label="Road/Street"><Input value={data.general.roadStreet} onChange={e => upd("general", {roadStreet: e.target.value})} /></Field>
                    <Field label="Building Height"><Input value={data.general.buildingHeight} onChange={e => upd("general", {buildingHeight: e.target.value})} /></Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Usage Purpose">
                        <Select value={data.applicant.usagePurpose} onValueChange={v => upd("applicant", {usagePurpose: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Self Use">Self Use</SelectItem><SelectItem value="Selling">Selling</SelectItem></SelectContent>
                        </Select>
                    </Field>
                    <Field label={data.applicant.usagePurpose === "Selling" ? "Firm Name" : "Owner Name"} required error={errors.ownerName}>
                      <Input
                        value={data.applicant.ownerName}
                        onChange={e => upd("applicant", {ownerName: e.target.value})}
                        placeholder={data.applicant.usagePurpose === "Selling" ? "Enter Firm Name" : "Enter Owner Name"}
                      />
                    </Field>
                    <Field label="Door / Flat No."><Input value={data.applicant.doorFlatNo} onChange={e => upd("applicant", {doorFlatNo: e.target.value})} /></Field>
                    <Field label="Road/Street"><Input value={data.applicant.roadStreet} onChange={e => upd("applicant", {roadStreet: e.target.value})} /></Field>
                    <Field label="City"><Input value={data.applicant.city} onChange={e => upd("applicant", {city: e.target.value})} /></Field>
                    <Field label="District"><Input value={data.applicant.district} onChange={e => upd("applicant", {district: e.target.value})} /></Field>
                    <Field label="PinCode"><Input value={data.applicant.pinCode} onChange={e => upd("applicant", {pinCode: e.target.value})} /></Field>
                    <Field label="Email"><Input value={data.applicant.email} onChange={e => upd("applicant", {email: e.target.value})} /></Field>
                    <Field label="Mobile"><Input value={data.applicant.mobile} onChange={e => upd("applicant", {mobile: e.target.value})} /></Field>
                    <Field label="Aadhaar"><Input value={data.applicant.aadhaar} onChange={e => upd("applicant", {aadhaar: e.target.value})} /></Field>
                    <Field label="Structural Engineer (LTP)"><Input value={data.applicant.structuralEngineer} onChange={e => upd("applicant", {structuralEngineer: e.target.value})} placeholder={user?.name || "e.g. Architect Name"} /></Field>
                    <Field label="Licence Validity Date"><Input type="date" value={data.applicant.licenceValidityDate} onChange={e => upd("applicant", {licenceValidityDate: e.target.value})} /></Field>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Proposed Plot Area (sq. mtr.)" required error={errors.proposedPlotArea}><Input value={data.plot.proposedPlotArea} onChange={e => upd("plot", {proposedPlotArea: e.target.value})} /></Field>
                    <Field label="Plot Structure"><Input value={data.plot.plotStructure} onChange={e => upd("plot", {plotStructure: e.target.value})} /></Field>
                    <Field label="Compound Wall">
                        <Select value={data.plot.compoundWall} onValueChange={v => upd("plot", {compoundWall: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                    </Field>
                    <Field label="TDR">
                        <Select value={data.plot.tdr} onValueChange={v => upd("plot", {tdr: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                    </Field>
                    <SectionDivider title="Site Details" />
                    <Field label="Nearby religious structures"><Input value={data.plot.religiousStructures} onChange={e => upd("plot", {religiousStructures: e.target.value})} /></Field>
                    <Field label="Aerodrome nearby"><Input value={data.plot.aerodrome} onChange={e => upd("plot", {aerodrome: e.target.value})} /></Field>
                    <Field label="Water bodies / railways / HT lines nearby"><Input value={data.plot.waterBodiesRailwaysHTLines} onChange={e => upd("plot", {waterBodiesRailwaysHTLines: e.target.value})} /></Field>
                    <Field label="Market value (Rs per sq. yard)"><Input value={data.plot.marketValue} onChange={e => upd("plot", {marketValue: e.target.value})} /></Field>
                    <Field label="Abuts the IRR">
                        <Select value={data.plot.abutsIRR} onValueChange={v => upd("plot", {abutsIRR: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                    </Field>
                    <SectionDivider title="Schedule of Boundaries" />
                    <Field label="North"><Input value={data.plot.boundaryNorth} onChange={e => upd("plot", {boundaryNorth: e.target.value})} /></Field>
                    <Field label="South"><Input value={data.plot.boundarySouth} onChange={e => upd("plot", {boundarySouth: e.target.value})} /></Field>
                    <Field label="East"><Input value={data.plot.boundaryEast} onChange={e => upd("plot", {boundaryEast: e.target.value})} /></Field>
                    <Field label="West"><Input value={data.plot.boundaryWest} onChange={e => upd("plot", {boundaryWest: e.target.value})} /></Field>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-4 items-center">
                        <Label>Height greater than 10m / 15m / 18m?</Label>
                        <Select value={data.checklist.heightGt10} onValueChange={v => upd("checklist", {heightGt10: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                        <Input placeholder="Remark" value={data.checklist.heightGt10Remark} onChange={e => upd("checklist", {heightGt10Remark: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-4 items-center">
                        <Label>Monument buffer 100-200m?</Label>
                        <Select value={data.checklist.monumentBuffer} onValueChange={v => upd("checklist", {monumentBuffer: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                        <Input placeholder="Remark" value={data.checklist.monumentBufferRemark} onChange={e => upd("checklist", {monumentBufferRemark: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-4 items-center">
                        <Label>Railway 30m?</Label>
                        <Select value={data.checklist.railway30m} onValueChange={v => upd("checklist", {railway30m: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                        <Input placeholder="Remark" value={data.checklist.railway30mRemark} onChange={e => upd("checklist", {railway30mRemark: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-4 items-center">
                        <Label>Built-up area above 20,000 sq. m.?</Label>
                        <Select value={data.checklist.builtUpGt20k} onValueChange={v => upd("checklist", {builtUpGt20k: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                        <Input placeholder="Remark" value={data.checklist.builtUpGt20kRemark} onChange={e => upd("checklist", {builtUpGt20kRemark: e.target.value})} />
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <Field label="Ownership Document (Primary)">
                        <Input type="file" onChange={e => upd("documents", {ownershipDoc: e.target.files?.[0] || null})} />
                    </Field>
                    <Field label="Site Plan (Primary)">
                        <Input type="file" onChange={e => upd("documents", {sitePlan: e.target.files?.[0] || null})} />
                    </Field>
                    <Field label="Building Plan (Primary)">
                        <Input type="file" onChange={e => upd("documents", {buildingPlan: e.target.files?.[0] || null})} />
                    </Field>
                  </div>
                )}

                {step === 6 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Contractor's all Risk policy number"><Input value={data.others.contractorsRiskPolicyNo} onChange={e => upd("others", {contractorsRiskPolicyNo: e.target.value})} /></Field>
                    <Field label="Contractor's Date"><Input type="date" value={data.others.contractorsDate} onChange={e => upd("others", {contractorsDate: e.target.value})} /></Field>
                    <Field label="Valid Upto"><Input type="date" value={data.others.validUpto} onChange={e => upd("others", {validUpto: e.target.value})} /></Field>
                    <Field label="Mortgage Deed No. (mandatory)"><Input value={data.others.mortgageDeedNo} onChange={e => upd("others", {mortgageDeedNo: e.target.value})} /></Field>
                    <Field label="Mortgage Deed Date"><Input type="date" value={data.others.mortgageDeedDate} onChange={e => upd("others", {mortgageDeedDate: e.target.value})} /></Field>
                    <Field label="Floor handed Over"><Input value={data.others.floorHandedOver} onChange={e => upd("others", {floorHandedOver: e.target.value})} /></Field>
                    <Field label="Sub Register Office"><Input value={data.others.subRegisterOffice} onChange={e => upd("others", {subRegisterOffice: e.target.value})} /></Field>
                    <Field label="Area (sq. mtr.)"><Input value={data.others.areaSqMtr} onChange={e => upd("others", {areaSqMtr: e.target.value})} /></Field>
                    <Field label="Solar Panels are Available or Not?">
                        <Select value={data.others.solarPanelsAvailable} onValueChange={v => upd("others", {solarPanelsAvailable: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                    </Field>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-6">
                    <div className="rounded-xl border-2 border-dashed border-slate-300 p-12 text-center bg-slate-50">
                        <UploadCloud className="mx-auto size-12 text-slate-400 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-800">Attach BIM Model</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Please Attach only .rvt (Revit) files or AutoCAD .dwg</p>
                        <Input type="file" accept=".rvt,.dwg" onChange={e => upd("bimModel", {modelFile: e.target.files?.[0] || null})} className="max-w-xs mx-auto" />
                    </div>
                  </div>
                )}

                {step === 8 && (
                  <div className="space-y-6">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-2">
                        <Info className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                        <p className="text-sm text-emerald-800">Your application is ready to be sent to scrutiny. Please ensure all details are correct.</p>
                      </div>
                      <ReviewSection title="Application summary" onEdit={() => { setTypeSelected(false); setStep(1); }}>
                        <RV label="Type" value={appTypeLabelShort(data.appType as AppTypeKey)} />
                        <RV label="Draft number" value={draftNo} />
                        <RV label={data.applicant.usagePurpose === "Selling" ? "Firm Name" : "Owner Name"} value={data.applicant.ownerName} />
                        <RV label="Plot Area" value={data.plot.proposedPlotArea} />
                      </ReviewSection>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 flex items-center justify-between border-t border-[#DCD5C8] bg-[#FBF3E4] p-4 shadow-sm rounded-t-xl border-x">
              <Button variant="outline" onClick={handleBack} disabled={step === 1 || submitting} className="w-24 border-[#DCD5C8] text-slate-700 hover:bg-[#FAF4EB] font-bold text-xs">
                <ArrowLeft className="mr-1.5 size-4" />Back
              </Button>
              {step < WIZARD_STEPS.length ? (
                <Button onClick={handleNext} className="w-32 bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs shadow-2xs border border-[#630E10] cursor-pointer">
                  Continue<ArrowRight className="ml-1.5 size-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="w-auto bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs shadow-2xs px-6 border border-[#630E10] cursor-pointer">
                  {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Sending to Scrutiny...</> : <><ShieldCheck className="mr-2 size-4" />Send to Scrutiny</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
