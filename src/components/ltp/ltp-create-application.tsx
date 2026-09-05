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
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
type AppTypeKey = "COMMERCIAL_BP" | "LAYOUT_APPROVAL" | "RESIDENTIAL_BP";

interface ApplicantData {
  fullName: string;
  fathersName: string;
  mobile: string;
  email: string;
  aadhaarLast4: string;
  pan: string;
  address: string;
}
interface OwnerData {
  sameAsApplicant: boolean;
  fullName: string;
  mobile: string;
  address: string;
}
interface PropertyData {
  district: string;
  mandal: string;
  village: string;
  locality: string;
  wardNumber: string;
}
interface LocationData {
  zone: string;
  doorNumber: string;
  streetName: string;
  pinCode: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
  latitude: string;
  longitude: string;
}
interface SurveyData {
  surveyNumbers: string;
  plotNumber: string;
  layoutName: string;
  lpNumber: string;
  plotArea: string;
  abuttingRoadWidth: string;
  landUse: string;
  tenure: string;
}
interface DevelopmentData {
  buildingUse: string;
  subUse: string;
  occupancyType: string;
  structureType: string;
  floorsAboveGround: string;
  basements: string;
  dwellingUnits: string;
  buildingHeight: string;
}
interface BuildingData {
  builtUpArea: string;
  totalFloorArea: string;
  groundCoverage: string;
  parkingArea: string;
  setbackFront: string;
  setbackRear: string;
  setbackLeft: string;
  setbackRight: string;
}
interface LtpData {
  remarks: string;
  declarationAccepted: boolean;
}
interface WizardData {
  appType: AppTypeKey | "";
  applicant: ApplicantData;
  owner: OwnerData;
  property: PropertyData;
  location: LocationData;
  survey: SurveyData;
  development: DevelopmentData;
  building: BuildingData;
  ltp: LtpData;
}

// ============================================================
// CONSTANTS
// ============================================================
const WIZARD_STEPS = [
  { id: 1, label: "Applicant details", short: "Applicant", icon: User },
  { id: 2, label: "Owner details", short: "Owner", icon: Users },
  { id: 3, label: "Property details", short: "Property", icon: Building2 },
  { id: 4, label: "Location", short: "Location", icon: MapPin },
  { id: 5, label: "Survey and plot", short: "Survey", icon: FileText },
  { id: 6, label: "Development", short: "Development", icon: Hammer },
  { id: 7, label: "Building", short: "Building", icon: Home },
  { id: 8, label: "Licensed technical person", short: "LTP", icon: HardHat },
  { id: 9, label: "Review application", short: "Review", icon: Eye },
  { id: 10, label: "Submit application", short: "Submit", icon: ShieldCheck },
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
  applicant: { fullName: "", fathersName: "", mobile: "", email: "", aadhaarLast4: "", pan: "", address: "" },
  owner: { sameAsApplicant: false, fullName: "", mobile: "", address: "" },
  property: { district: "", mandal: "", village: "", locality: "", wardNumber: "" },
  location: { zone: "", doorNumber: "", streetName: "", pinCode: "", boundaryNorth: "", boundarySouth: "", boundaryEast: "", boundaryWest: "", latitude: "", longitude: "" },
  survey: { surveyNumbers: "", plotNumber: "", layoutName: "", lpNumber: "", plotArea: "", abuttingRoadWidth: "", landUse: "", tenure: "" },
  development: { buildingUse: "", subUse: "", occupancyType: "", structureType: "", floorsAboveGround: "", basements: "", dwellingUnits: "", buildingHeight: "" },
  building: { builtUpArea: "", totalFloorArea: "", groundCoverage: "", parkingArea: "", setbackFront: "", setbackRear: "", setbackLeft: "", setbackRight: "" },
  ltp: { remarks: "", declarationAccepted: false },
};

// ============================================================
// VALIDATION
// ============================================================
function validateMobile(v: string) { return /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g, "")); }
function validateEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePin(v: string) { return /^\d{6}$/.test(v.trim()); }
function isNumber(v: string) { return !isNaN(Number(v)) && v.trim() !== ""; }
function isNonNeg(v: string) { return !v.trim() || (!isNaN(Number(v)) && Number(v) >= 0); }

function validateStep(step: number, data: WizardData): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 1) {
    if (!data.applicant.fullName.trim()) e.fullName = "Full name is required.";
    if (!data.applicant.mobile.trim()) e.mobile = "Mobile number is required.";
    else if (!validateMobile(data.applicant.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (data.applicant.email && !validateEmail(data.applicant.email)) e.email = "Enter a valid email address.";
    if (data.applicant.aadhaarLast4 && !/^\d{4}$/.test(data.applicant.aadhaarLast4)) e.aadhaarLast4 = "Enter exactly the last 4 digits.";
    if (data.applicant.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.applicant.pan.toUpperCase())) e.pan = "Enter a valid 10-character PAN.";
    if (!data.applicant.address.trim()) e.address = "Address is required.";
  }
  if (step === 2 && !data.owner.sameAsApplicant) {
    if (!data.owner.fullName.trim()) e.ownerFullName = "Owner's full name is required.";
    if (!data.owner.mobile.trim()) e.ownerMobile = "Mobile number is required.";
    else if (!validateMobile(data.owner.mobile)) e.ownerMobile = "Enter a valid 10-digit Indian mobile number.";
    if (!data.owner.address.trim()) e.ownerAddress = "Owner's address is required.";
  }
  if (step === 3) {
    if (!data.property.district.trim()) e.district = "District is required.";
  }
  if (step === 4) {
    if (!data.location.zone.trim()) e.zone = "Zone is required.";
    if (!data.location.streetName.trim()) e.streetName = "Street name is required.";
    if (data.location.pinCode && !validatePin(data.location.pinCode)) e.pinCode = "Enter a valid 6-digit PIN code.";
    if (data.location.latitude && !isNumber(data.location.latitude)) e.latitude = "Enter a valid decimal number.";
    if (data.location.longitude && !isNumber(data.location.longitude)) e.longitude = "Enter a valid decimal number.";
  }
  if (step === 5) {
    if (!data.survey.surveyNumbers.trim()) e.surveyNumbers = "Survey number(s) are required.";
    if (!data.survey.plotArea.trim()) e.plotArea = "Plot area is required.";
    else if (!isNumber(data.survey.plotArea) || Number(data.survey.plotArea) <= 0) e.plotArea = "Enter a valid positive area.";
    if (!isNonNeg(data.survey.abuttingRoadWidth)) e.abuttingRoadWidth = "Enter a valid non-negative number.";
  }
  if (step === 6) {
    if (!data.development.buildingUse.trim()) e.buildingUse = "Building use is required.";
    if (!data.development.occupancyType.trim()) e.occupancyType = "Occupancy type is required.";
    if (!isNonNeg(data.development.floorsAboveGround)) e.floorsAboveGround = "Must be zero or positive.";
    if (!isNonNeg(data.development.basements)) e.basements = "Must be zero or positive.";
    if (!isNonNeg(data.development.dwellingUnits)) e.dwellingUnits = "Must be zero or positive.";
    if (!isNonNeg(data.development.buildingHeight)) e.buildingHeight = "Must be a valid positive number.";
  }
  if (step === 7) {
    if (!data.building.builtUpArea.trim()) e.builtUpArea = "Built-up area is required.";
    else if (!isNumber(data.building.builtUpArea) || Number(data.building.builtUpArea) <= 0) e.builtUpArea = "Enter a valid positive area.";
    if (!isNonNeg(data.building.totalFloorArea)) e.totalFloorArea = "Enter a valid non-negative area.";
    if (!isNonNeg(data.building.groundCoverage)) e.groundCoverage = "Enter a valid non-negative area.";
    if (!isNonNeg(data.building.parkingArea)) e.parkingArea = "Enter a valid non-negative area.";
    if (!isNonNeg(data.building.setbackFront)) e.setbackFront = "Must be zero or positive.";
    if (!isNonNeg(data.building.setbackRear)) e.setbackRear = "Must be zero or positive.";
    if (!isNonNeg(data.building.setbackLeft)) e.setbackLeft = "Must be zero or positive.";
    if (!isNonNeg(data.building.setbackRight)) e.setbackRight = "Must be zero or positive.";
  }
  if (step === 8) {
    if (!data.ltp.declarationAccepted) e.declarationAccepted = "You must accept the declaration to proceed.";
  }
  return e;
}

// ============================================================
// AUTOSAVE
// ============================================================
const DRAFT_KEY = "ltp_wizard_draft";
function saveDraft(data: WizardData, step: number, draftNo: string) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, draftNo, savedAt: new Date().toISOString() })); } catch { /* ignore */ }
}
function loadDraft(): { data: WizardData; step: number; draftNo: string; savedAt: string } | null {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }
function genDraftNo(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `DRAFT/${year}/${seq}`;
}

// ============================================================
// HELPER COMPONENTS
// ============================================================
function Field({ label, required, hint, error, children, className }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500" aria-label="required">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-600" role="alert">
          <AlertCircle className="size-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function SectionDivider({ title, description }: { title: string; description?: string }) {
  return (
    <div className="col-span-full border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
    </div>
  );
}

function CalcCard({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-blue-700">{value}</p>
      {description && <p className="mt-1 text-[11px] text-blue-500/80">{description}</p>}
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{title}</p>
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 gap-1 text-xs text-blue-600 hover:bg-blue-50">
          <Pencil className="size-3" /> Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 sm:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function RV({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value?.trim() || "—"}</p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function LtpCreateApplication({ onClose }: { onClose?: () => void } = {}) {
  const { user, navigate, createApplication, openApplication } = useAppStore();
  const { toast } = useToast();
  const isModal = !!onClose;

  // ---- Pre-wizard: type selection ----
  const [typeSelected, setTypeSelected] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<AppTypeKey | "">("");

  // ---- Wizard state ----
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<WizardData>(INITIAL_DATA);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [draftNo, setDraftNo] = React.useState("");
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedAppId, setSubmittedAppId] = React.useState("");
  const [submittedAppNo, setSubmittedAppNo] = React.useState("");
  const [confirmSubmit, setConfirmSubmit] = React.useState(false);
  // When editing from review, track where to return
  const [editingFromReview, setEditingFromReview] = React.useState(false);

  // Load draft on mount
  React.useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setData({ ...INITIAL_DATA, ...draft.data, appType: draft.data.appType });
      setStep(draft.step);
      setDraftNo(draft.draftNo);
      setSavedAt(draft.savedAt);
      setTypeSelected(true);
      setSelectedType(draft.data.appType as AppTypeKey);
      // Reconstruct completed steps
      const completed = new Set<number>();
      for (let s = 1; s < draft.step; s++) completed.add(s);
      setCompletedSteps(completed);
      toast({ title: "Draft restored", description: `Continuing draft ${draft.draftNo}` });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave on data/step changes (debounced)
  const autosaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!typeSelected || !draftNo) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      try {
        saveDraft(data, step, draftNo);
        setSavedAt(new Date().toISOString());
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 800);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [data, step, typeSelected, draftNo]);

  // ---- Helpers ----
  function upd<S extends keyof WizardData>(section: S, patch: Partial<WizardData[S]>) {
    setData((d) => ({ ...d, [section]: { ...(d[section] as object), ...patch } }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(patch as object).forEach((k) => delete next[k]);
      return next;
    });
  }

  function handleStartApplication() {
    if (!selectedType) return;
    const dn = genDraftNo();
    setDraftNo(dn);
    setData({ ...INITIAL_DATA, appType: selectedType });
    setStep(1);
    setTypeSelected(true);
    setErrors({});
    setCompletedSteps(new Set());
  }

  function handleNext() {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      setTimeout(() => {
        document.querySelector("[role='alert']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setErrors({});
    setCompletedSteps((c) => new Set([...c, step]));
    saveDraft(data, step + 1, draftNo);
    setSavedAt(new Date().toISOString());
    setSaveStatus("saved");
    if (editingFromReview && step < 9) {
      setEditingFromReview(false);
      setStep(9);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handlePrev() {
    setErrors({});
    setStep((s) => s - 1);
  }

  function handleSaveDraft() {
    saveDraft(data, step, draftNo);
    setSavedAt(new Date().toISOString());
    setSaveStatus("saved");
    toast({ title: "Draft saved", description: `Application ${draftNo} saved. You can continue later.` });
  }

  function handleEditStep(targetStep: number) {
    setErrors({});
    setEditingFromReview(true);
    setStep(targetStep);
  }

  function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      try {
        const typeMap: Record<AppTypeKey, ApplicationType> = {
          COMMERCIAL_BP: "BUILDING_PERMISSION",
          LAYOUT_APPROVAL: "LAYOUT_APPROVAL",
          RESIDENTIAL_BP: "BUILDING_PERMISSION",
        };
        const propMap: Record<AppTypeKey, ProjectInfo_propertyType> = {
          COMMERCIAL_BP: "COMMERCIAL",
          LAYOUT_APPROVAL: "RESIDENTIAL",
          RESIDENTIAL_BP: "RESIDENTIAL",
        };
        const appId = createApplication({
          applicationType: typeMap[data.appType as AppTypeKey],
          propertyType: propMap[data.appType as AppTypeKey] as any,
          projectName: data.survey.layoutName || `${appTypeLabelShort(data.appType as AppTypeKey)} — ${data.property.locality || data.property.district}`,
          applicantName: data.applicant.fullName,
          applicantContact: data.applicant.mobile,
          applicantEmail: data.applicant.email,
          applicantAddress: data.applicant.address,
          plotArea: Number(data.survey.plotArea) || 0,
          builtUpArea: Number(data.building.builtUpArea) || 0,
          landUse: data.survey.landUse || (data.appType === "COMMERCIAL_BP" ? "Commercial (C1)" : "Residential (R1)"),
          ward: data.property.wardNumber,
          zone: data.location.zone,
          surveyNo: data.survey.surveyNumbers,
          address: [data.location.doorNumber, data.location.streetName, data.property.locality, data.property.district].filter(Boolean).join(", "),
        });
        const appNo = useAppStore.getState().applications.find((a) => a.id === appId)?.applicationNo ?? draftNo;
        setSubmittedAppId(appId);
        setSubmittedAppNo(appNo);
        clearDraft();
        setSubmitted(true);
      } catch (err) {
        toast({ title: "Submission failed", description: "An error occurred. Your draft has been preserved.", variant: "destructive" });
      } finally {
        setSubmitting(false);
        setConfirmSubmit(false);
      }
    }, 1200);
  }

  // ---- Computed values ----
  const plotAreaNum = Number(data.survey.plotArea) || 0;
  const totalFloorAreaNum = Number(data.building.totalFloorArea) || 0;
  const groundCoverageNum = Number(data.building.groundCoverage) || 0;
  const achievedFAR = plotAreaNum > 0 ? (totalFloorAreaNum / plotAreaNum).toFixed(2) : "—";
  const achievedCoverage = plotAreaNum > 0 ? ((groundCoverageNum / plotAreaNum) * 100).toFixed(1) + "%" : "—";

  const stepValidationSummary = React.useMemo(() => {
    return WIZARD_STEPS.slice(0, 8).map((s) => ({
      step: s.id,
      label: s.label,
      complete: Object.keys(validateStep(s.id, data)).length === 0,
    }));
  }, [data]);
  const allComplete = stepValidationSummary.every((s) => s.complete);

  function savedAtFormatted() {
    if (!savedAt) return null;
    return new Date(savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================
  if (submitted) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="size-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application submitted successfully!</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              Your application has been formally submitted and is now entering the drawing scrutiny stage.
            </p>
          </div>
          <div className="px-8 py-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 gap-4">
              <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Application No.</p><p className="mt-0.5 font-mono text-base font-semibold text-blue-700">{submittedAppNo}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Application type</p><p className="mt-0.5 text-sm font-medium text-slate-800">{appTypeLabelShort(data.appType as AppTypeKey)}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Applicant</p><p className="mt-0.5 text-sm text-slate-800">{data.applicant.fullName}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Submitted on</p><p className="mt-0.5 text-sm text-slate-800">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
              <div className="col-span-2"><p className="text-[10px] uppercase tracking-wider text-slate-400">Status</p><span className="mt-0.5 inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">Submitted — Awaiting scrutiny</span></div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => navigate("ltp-applications")}>Go to My Applications</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => openApplication(submittedAppId, "ltp-application-details")}>
                View Application <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // TYPE SELECTION SCREEN
  // ============================================================
  if (!typeSelected) {
    return (
      <div className="space-y-6">
        {!isModal && <PageBackButton fallbackView="ltp-applications" fallbackLabel="My Applications" />}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white"><FilePlus2 className="size-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">New application</h1>
            <p className="text-sm text-slate-500">Select the type of application you wish to submit</p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex gap-3">
            <Info className="size-4 shrink-0 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-medium">Before you begin</p>
              <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                <li>An application number is issued as soon as you begin filling the form.</li>
                <li>Your application is automatically saved as a draft as you progress.</li>
                <li>You can leave and continue later — your progress will not be lost.</li>
                <li>The application is only formally submitted when you complete the submission process.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {APP_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = selectedType === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelectedType(opt.key)}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all duration-150",
                  selected
                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                )}
              >
                <div className={cn("flex size-11 items-center justify-center rounded-xl", selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-semibold leading-snug", selected ? "text-blue-900" : "text-slate-800")}>{opt.label}</p>
                    {selected && <CheckCircle2 className="size-4 shrink-0 text-blue-600 mt-0.5" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{opt.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-600">{opt.numberSeries}</span>
                    {opt.features.map((f) => (
                      <span key={f} className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">{f}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            disabled={!selectedType}
            className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-full px-8 disabled:opacity-50"
            onClick={handleStartApplication}
          >
            Start Application <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  const currentStepMeta = WIZARD_STEPS.find((s) => s.id === step)!;

  // ============================================================
  // WIZARD LAYOUT
  // ============================================================
  return (
    <div className={cn("space-y-5 animate-in fade-in duration-200", isModal && "space-y-3")}>
      {!isModal && <PageBackButton fallbackView="ltp-applications" fallbackLabel="My Applications" />}

      {/* Application header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-bold text-blue-700">{draftNo}</span>
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Draft</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{appTypeLabelShort(data.appType as AppTypeKey)}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {saveStatus === "saved" && savedAtFormatted() && (
            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="size-3" />Saved at {savedAtFormatted()}</span>
          )}
          {saveStatus === "saving" && <span className="flex items-center gap-1 text-slate-400"><Loader2 className="size-3 animate-spin" />Saving…</span>}
          {saveStatus === "error" && <span className="flex items-center gap-1 text-red-500"><AlertCircle className="size-3" />Unable to save</span>}
          <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={() => navigate("ltp-applications")}>All Applications</Button>
        </div>
      </div>

      {/* Horizontal stepper */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="overflow-x-auto pb-1">
          <ol className="flex items-center min-w-max" aria-label="Application progress">
            {WIZARD_STEPS.map((s, idx) => {
              const isDone = completedSteps.has(s.id);
              const isCurrent = s.id === step;
              const isReachable = isDone || isCurrent || (s.id < step);
              const Icon = s.icon;
              return (
                <li key={s.id} className="flex items-center">
                  <button
                    onClick={() => isReachable && !isCurrent && setStep(s.id)}
                    disabled={!isReachable || isCurrent}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn("group flex flex-col items-center gap-1 px-1 transition-all", isReachable && !isCurrent ? "cursor-pointer" : "cursor-default")}
                    title={s.label}
                  >
                    <div className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      isDone && "border-emerald-500 bg-emerald-500 text-white",
                      isCurrent && "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100",
                      !isDone && !isCurrent && "border-slate-200 bg-white text-slate-400"
                    )}>
                      {isDone ? <Check className="size-3.5" /> : isCurrent ? <Icon className="size-3.5" /> : <span>{s.id}</span>}
                    </div>
                    <span className={cn("text-[10px] font-medium whitespace-nowrap leading-none", isCurrent ? "text-blue-700" : isDone ? "text-emerald-600" : "text-slate-400")}>
                      {s.short}
                    </span>
                  </button>
                  {idx < WIZARD_STEPS.length - 1 && (
                    <div className={cn("mx-1 h-0.5 w-8 shrink-0 rounded-full transition-colors", completedSteps.has(s.id) ? "bg-emerald-400" : "bg-slate-100")} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 px-1">Step {step} of {WIZARD_STEPS.length}</div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">{currentStepMeta.label}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{stepDescription(step, data)}</p>
        </div>

        <div className="px-6 py-6">
          {/* ── STEP 1: APPLICANT ── */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.fullName} className="sm:col-span-2">
                <Input value={data.applicant.fullName} onChange={(e) => upd("applicant", { fullName: e.target.value })} placeholder="e.g. Smt. Kavitha Reddy" />
              </Field>
              <Field label="Father's / husband's name" error={errors.fathersName}>
                <Input value={data.applicant.fathersName} onChange={(e) => upd("applicant", { fathersName: e.target.value })} placeholder="e.g. Shri. Ravi Reddy" />
              </Field>
              <Field label="Mobile number" required error={errors.mobile} hint="10-digit Indian mobile number">
                <Input value={data.applicant.mobile} onChange={(e) => upd("applicant", { mobile: e.target.value })} placeholder="e.g. 9876543210" inputMode="tel" maxLength={13} />
              </Field>
              <Field label="Email address" error={errors.email}>
                <Input type="email" value={data.applicant.email} onChange={(e) => upd("applicant", { email: e.target.value })} placeholder="e.g. applicant@email.com" />
              </Field>
              <Field label="Aadhaar — last 4 digits" error={errors.aadhaarLast4} hint="Only the last 4 digits. Do not enter the full Aadhaar number.">
                <Input value={data.applicant.aadhaarLast4} onChange={(e) => upd("applicant", { aadhaarLast4: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="e.g. 4567" inputMode="numeric" maxLength={4} />
              </Field>
              <Field label="PAN" error={errors.pan} hint="10-character Permanent Account Number">
                <Input value={data.applicant.pan} onChange={(e) => upd("applicant", { pan: e.target.value.toUpperCase().slice(0, 10) })} placeholder="e.g. ABCDE1234F" maxLength={10} />
              </Field>
              <Field label="Address" required error={errors.address} className="sm:col-span-2">
                <Textarea rows={3} value={data.applicant.address} onChange={(e) => upd("applicant", { address: e.target.value })} placeholder="Complete postal address of the applicant" />
              </Field>
            </div>
          )}

          {/* ── STEP 2: OWNER ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Checkbox
                  id="sameAsApplicant"
                  checked={data.owner.sameAsApplicant}
                  onCheckedChange={(v) => upd("owner", { sameAsApplicant: !!v })}
                />
                <div>
                  <Label htmlFor="sameAsApplicant" className="cursor-pointer font-medium text-sm text-slate-800">The applicant is the owner of the land</Label>
                  <p className="mt-0.5 text-xs text-slate-500">If the applicant is the owner, these particulars form part of the record.</p>
                </div>
              </div>
              {data.owner.sameAsApplicant ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-3">
                    <CheckCircle2 className="size-4" />
                    <p className="text-sm font-medium">Owner details are the same as the applicant</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Name</p><p className="font-medium text-slate-700">{data.applicant.fullName || "—"}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Mobile</p><p className="font-medium text-slate-700">{data.applicant.mobile || "—"}</p></div>
                    <div className="col-span-2"><p className="text-[10px] text-slate-400 uppercase tracking-wider">Address</p><p className="font-medium text-slate-700">{data.applicant.address || "—"}</p></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Owner's full name" required error={errors.ownerFullName} className="sm:col-span-2">
                    <Input value={data.owner.fullName} onChange={(e) => upd("owner", { fullName: e.target.value })} placeholder="e.g. Shri. Rajesh Kumar" />
                  </Field>
                  <Field label="Owner's mobile number" required error={errors.ownerMobile}>
                    <Input value={data.owner.mobile} onChange={(e) => upd("owner", { mobile: e.target.value })} placeholder="10-digit mobile number" inputMode="tel" />
                  </Field>
                  <Field label="Owner's address" required error={errors.ownerAddress} className="sm:col-span-2">
                    <Textarea rows={3} value={data.owner.address} onChange={(e) => upd("owner", { address: e.target.value })} placeholder="Complete postal address of the owner" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: PROPERTY DETAILS ── */}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="District" required error={errors.district}>
                <Input value={data.property.district} onChange={(e) => upd("property", { district: e.target.value })} placeholder="e.g. Hyderabad" />
              </Field>
              <Field label="Mandal" error={errors.mandal}>
                <Input value={data.property.mandal} onChange={(e) => upd("property", { mandal: e.target.value })} placeholder="e.g. Serilingampally" />
              </Field>
              <Field label="Village">
                <Input value={data.property.village} onChange={(e) => upd("property", { village: e.target.value })} placeholder="e.g. Kondapur" />
              </Field>
              <Field label="Locality">
                <Input value={data.property.locality} onChange={(e) => upd("property", { locality: e.target.value })} placeholder="e.g. Gachibowli" />
              </Field>
              <Field label="Ward number">
                <Input value={data.property.wardNumber} onChange={(e) => upd("property", { wardNumber: e.target.value })} placeholder="e.g. Ward 14" />
              </Field>
            </div>
          )}

          {/* ── STEP 4: LOCATION ── */}
          {step === 4 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Zone" required error={errors.zone}>
                <Select value={data.location.zone} onValueChange={(v) => upd("location", { zone: v })}>
                  <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                  <SelectContent>
                    {["Zone I — East", "Zone II — South", "Zone III — North", "Zone IV — West", "Zone V — Central"].map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Door number" error={errors.doorNumber}>
                <Input value={data.location.doorNumber} onChange={(e) => upd("location", { doorNumber: e.target.value })} placeholder="e.g. 4-6-78" />
              </Field>
              <Field label="Street name" required error={errors.streetName} className="sm:col-span-2">
                <Input value={data.location.streetName} onChange={(e) => upd("location", { streetName: e.target.value })} placeholder="e.g. Jubilee Hills Road No. 45" />
              </Field>
              <Field label="PIN code" error={errors.pinCode} hint="6-digit postal code">
                <Input value={data.location.pinCode} onChange={(e) => upd("location", { pinCode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="e.g. 500032" inputMode="numeric" maxLength={6} />
              </Field>

              <SectionDivider title="Site boundaries" description="What adjoins the plot on each side — a road, a plot number, or a neighbour's name." />
              <Field label="North" error={errors.boundaryNorth}>
                <Input value={data.location.boundaryNorth} onChange={(e) => upd("location", { boundaryNorth: e.target.value })} placeholder="e.g. Road 45" />
              </Field>
              <Field label="South" error={errors.boundarySouth}>
                <Input value={data.location.boundarySouth} onChange={(e) => upd("location", { boundarySouth: e.target.value })} placeholder="e.g. Plot No. 23" />
              </Field>
              <Field label="East" error={errors.boundaryEast}>
                <Input value={data.location.boundaryEast} onChange={(e) => upd("location", { boundaryEast: e.target.value })} placeholder="e.g. Shri. A. Kumar's property" />
              </Field>
              <Field label="West" error={errors.boundaryWest}>
                <Input value={data.location.boundaryWest} onChange={(e) => upd("location", { boundaryWest: e.target.value })} placeholder="e.g. Government land" />
              </Field>

              <SectionDivider title="Coordinates" description="Optional. Leave blank if the site has not been surveyed to a coordinate." />
              <Field label="Latitude" error={errors.latitude} hint="Decimal degrees, e.g. 17.4350">
                <Input value={data.location.latitude} onChange={(e) => upd("location", { latitude: e.target.value })} placeholder="e.g. 17.4350" inputMode="decimal" />
              </Field>
              <Field label="Longitude" error={errors.longitude} hint="Decimal degrees, e.g. 78.3867">
                <Input value={data.location.longitude} onChange={(e) => upd("location", { longitude: e.target.value })} placeholder="e.g. 78.3867" inputMode="decimal" />
              </Field>
            </div>
          )}

          {/* ── STEP 5: SURVEY AND PLOT ── */}
          {step === 5 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Survey number(s)" required error={errors.surveyNumbers} hint="Separate multiple numbers with a comma." className="sm:col-span-2">
                <Input value={data.survey.surveyNumbers} onChange={(e) => upd("survey", { surveyNumbers: e.target.value })} placeholder="e.g. Sy. 144/B2, Sy. 145/A1" />
              </Field>
              <Field label="Plot number" error={errors.plotNumber}>
                <Input value={data.survey.plotNumber} onChange={(e) => upd("survey", { plotNumber: e.target.value })} placeholder="e.g. Plot 14" />
              </Field>
              <Field label="Layout name">
                <Input value={data.survey.layoutName} onChange={(e) => upd("survey", { layoutName: e.target.value })} placeholder="e.g. Greenfield Enclave" />
              </Field>
              <Field label="LP number" hint="Layout Plan number, if applicable">
                <Input value={data.survey.lpNumber} onChange={(e) => upd("survey", { lpNumber: e.target.value })} placeholder="e.g. LP/2023/0045" />
              </Field>
              <Field label="Plot area (sq m)" required error={errors.plotArea}>
                <Input type="number" min={0} value={data.survey.plotArea} onChange={(e) => upd("survey", { plotArea: e.target.value })} placeholder="e.g. 250" inputMode="decimal" />
              </Field>
              <Field label="Abutting road width (m)" error={errors.abuttingRoadWidth}>
                <Input type="number" min={0} value={data.survey.abuttingRoadWidth} onChange={(e) => upd("survey", { abuttingRoadWidth: e.target.value })} placeholder="e.g. 9" inputMode="decimal" />
              </Field>
              <Field label="Land use">
                <Select value={data.survey.landUse} onValueChange={(v) => upd("survey", { landUse: v })}>
                  <SelectTrigger><SelectValue placeholder="Select land use" /></SelectTrigger>
                  <SelectContent>
                    {["Residential (R1)", "Residential (R2)", "Commercial (C1)", "Commercial (C2)", "Industrial (I)", "Agriculture", "Mixed Use"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tenure">
                <Select value={data.survey.tenure} onValueChange={(v) => upd("survey", { tenure: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tenure" /></SelectTrigger>
                  <SelectContent>
                    {["Freehold", "Leasehold", "Government lease", "GPA", "Other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {/* ── STEP 6: DEVELOPMENT ── */}
          {step === 6 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Building use" required error={errors.buildingUse}>
                <Select value={data.development.buildingUse} onValueChange={(v) => upd("development", { buildingUse: v })}>
                  <SelectTrigger><SelectValue placeholder="Select building use" /></SelectTrigger>
                  <SelectContent>
                    {["Residential", "Commercial", "Industrial", "Institutional", "Mixed use", "Assembly", "Hazardous"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Sub-use">
                <Input value={data.development.subUse} onChange={(e) => upd("development", { subUse: e.target.value })} placeholder="e.g. Apartment, Shop, Office" />
              </Field>
              <Field label="Occupancy type" required error={errors.occupancyType}>
                <Select value={data.development.occupancyType} onValueChange={(v) => upd("development", { occupancyType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select occupancy type" /></SelectTrigger>
                  <SelectContent>
                    {["Group A — Residential", "Group B — Educational", "Group C — Institutional", "Group D — Assembly", "Group E — Business", "Group F — Mercantile", "Group G — Industrial", "Group H — Storage", "Group I — Hazardous"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Structure type">
                <Select value={data.development.structureType} onValueChange={(v) => upd("development", { structureType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select structure type" /></SelectTrigger>
                  <SelectContent>
                    {["RCC Framed", "Load bearing", "Steel frame", "Composite", "Prefabricated"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Floors above ground" error={errors.floorsAboveGround}>
                <Input type="number" min={0} value={data.development.floorsAboveGround} onChange={(e) => upd("development", { floorsAboveGround: e.target.value })} placeholder="e.g. 7" inputMode="numeric" />
              </Field>
              <Field label="Basements" error={errors.basements}>
                <Input type="number" min={0} value={data.development.basements} onChange={(e) => upd("development", { basements: e.target.value })} placeholder="e.g. 1" inputMode="numeric" />
              </Field>
              <Field label="Dwelling units" error={errors.dwellingUnits}>
                <Input type="number" min={0} value={data.development.dwellingUnits} onChange={(e) => upd("development", { dwellingUnits: e.target.value })} placeholder="e.g. 24" inputMode="numeric" />
              </Field>
              <Field label="Building height (m)" error={errors.buildingHeight}>
                <Input type="number" min={0} step={0.1} value={data.development.buildingHeight} onChange={(e) => upd("development", { buildingHeight: e.target.value })} placeholder="e.g. 24.5" inputMode="decimal" />
              </Field>
            </div>
          )}

          {/* ── STEP 7: BUILDING ── */}
          {step === 7 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Plot area (sq m)" hint="Carried forward from Survey and plot — read only.">
                <Input value={data.survey.plotArea || "—"} readOnly className="bg-slate-50 text-slate-600 cursor-default" />
              </Field>
              <Field label="Built-up area (sq m)" required error={errors.builtUpArea}>
                <Input type="number" min={0} value={data.building.builtUpArea} onChange={(e) => upd("building", { builtUpArea: e.target.value })} placeholder="e.g. 1780" inputMode="decimal" />
              </Field>
              <Field label="Total floor area (sq m)" error={errors.totalFloorArea}>
                <Input type="number" min={0} value={data.building.totalFloorArea} onChange={(e) => upd("building", { totalFloorArea: e.target.value })} placeholder="e.g. 5600" inputMode="decimal" />
              </Field>
              <Field label="Ground coverage (sq m)" error={errors.groundCoverage}>
                <Input type="number" min={0} value={data.building.groundCoverage} onChange={(e) => upd("building", { groundCoverage: e.target.value })} placeholder="e.g. 125" inputMode="decimal" />
              </Field>
              <Field label="Parking area (sq m)" error={errors.parkingArea}>
                <Input type="number" min={0} value={data.building.parkingArea} onChange={(e) => upd("building", { parkingArea: e.target.value })} placeholder="e.g. 200" inputMode="decimal" />
              </Field>

              {/* Calculated values */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 mt-1">
                <CalcCard label="Achieved FAR" value={achievedFAR} />
                <CalcCard label="Achieved coverage" value={achievedCoverage} />
              </div>
              <div className="sm:col-span-2 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                <Info className="size-3.5 shrink-0 mt-0.5" />
                Calculated from the areas above. Whether these are permissible is decided by scrutiny against the applicable rules/byelaws.
              </div>

              <SectionDivider title="Setbacks" description="Minimum clear distance from the plot boundary, in metres." />
              <Field label="Front (m)" error={errors.setbackFront}>
                <Input type="number" min={0} step={0.1} value={data.building.setbackFront} onChange={(e) => upd("building", { setbackFront: e.target.value })} placeholder="e.g. 3.0" inputMode="decimal" />
              </Field>
              <Field label="Rear (m)" error={errors.setbackRear}>
                <Input type="number" min={0} step={0.1} value={data.building.setbackRear} onChange={(e) => upd("building", { setbackRear: e.target.value })} placeholder="e.g. 1.5" inputMode="decimal" />
              </Field>
              <Field label="Left (m)" error={errors.setbackLeft}>
                <Input type="number" min={0} step={0.1} value={data.building.setbackLeft} onChange={(e) => upd("building", { setbackLeft: e.target.value })} placeholder="e.g. 1.5" inputMode="decimal" />
              </Field>
              <Field label="Right (m)" error={errors.setbackRight}>
                <Input type="number" min={0} step={0.1} value={data.building.setbackRight} onChange={(e) => upd("building", { setbackRight: e.target.value })} placeholder="e.g. 1.5" inputMode="decimal" />
              </Field>
            </div>
          )}

          {/* ── STEP 8: LTP ── */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">LTP on record</p>
                <p className="font-medium text-slate-800">{user?.name ?? "—"}</p>
                {user?.licenseNo && <p className="text-xs text-slate-500 mt-0.5">Licence no: {user.licenseNo}</p>}
              </div>
              <Field label="Remarks" hint="Optional. Add any observations, notes, or deviations you wish to record.">
                <Textarea rows={4} value={data.ltp.remarks} onChange={(e) => upd("ltp", { remarks: e.target.value })} placeholder="Any remarks or observations (optional)" />
              </Field>
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-800">Declaration</h4>
                <blockquote className="border-l-2 border-blue-400 pl-4 text-sm text-slate-700 leading-relaxed">
                  I certify that the particulars given above are true to the best of my knowledge, that the drawings to be submitted conform to the applicable building rules, and that I hold a valid licence to prepare and submit them.
                </blockquote>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="declaration"
                    checked={data.ltp.declarationAccepted}
                    onCheckedChange={(v) => { upd("ltp", { declarationAccepted: !!v }); if (v) setErrors((e) => { const n = { ...e }; delete n.declarationAccepted; return n; }); }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="declaration" className="cursor-pointer font-semibold text-sm text-slate-800">I make this declaration</Label>
                    {errors.declarationAccepted && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600" role="alert">
                        <AlertCircle className="size-3 shrink-0" />{errors.declarationAccepted}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 9: REVIEW ── */}
          {step === 9 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">Please review all details carefully before submitting. Click <strong>Edit</strong> on any section to make changes.</p>
              </div>

              {/* Validation summary */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Completion status</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {stepValidationSummary.map((s) => (
                    <div key={s.step} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border", s.complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
                      {s.complete ? <CheckCircle2 className="size-3.5 shrink-0" /> : <AlertCircle className="size-3.5 shrink-0" />}
                      <span className="truncate">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ReviewSection title="Application type" onEdit={() => { setTypeSelected(false); setStep(1); }}>
                <RV label="Type" value={appTypeLabelShort(data.appType as AppTypeKey)} />
                <RV label="Draft number" value={draftNo} />
              </ReviewSection>

              <ReviewSection title="Applicant details" onEdit={() => handleEditStep(1)}>
                <RV label="Full name" value={data.applicant.fullName} />
                <RV label="Father's / husband's name" value={data.applicant.fathersName} />
                <RV label="Mobile" value={data.applicant.mobile} />
                <RV label="Email" value={data.applicant.email} />
                <RV label="Aadhaar (last 4)" value={data.applicant.aadhaarLast4 ? `****${data.applicant.aadhaarLast4}` : undefined} />
                <RV label="PAN" value={data.applicant.pan} />
                <div className="col-span-full"><RV label="Address" value={data.applicant.address} /></div>
              </ReviewSection>

              <ReviewSection title="Owner details" onEdit={() => handleEditStep(2)}>
                {data.owner.sameAsApplicant ? (
                  <div className="col-span-full flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-4" />Same as applicant</div>
                ) : (
                  <>
                    <RV label="Full name" value={data.owner.fullName} />
                    <RV label="Mobile" value={data.owner.mobile} />
                    <div className="col-span-full"><RV label="Address" value={data.owner.address} /></div>
                  </>
                )}
              </ReviewSection>

              <ReviewSection title="Property details" onEdit={() => handleEditStep(3)}>
                <RV label="District" value={data.property.district} />
                <RV label="Mandal" value={data.property.mandal} />
                <RV label="Village" value={data.property.village} />
                <RV label="Locality" value={data.property.locality} />
                <RV label="Ward number" value={data.property.wardNumber} />
              </ReviewSection>

              <ReviewSection title="Location" onEdit={() => handleEditStep(4)}>
                <RV label="Zone" value={data.location.zone} />
                <RV label="Door number" value={data.location.doorNumber} />
                <RV label="Street name" value={data.location.streetName} />
                <RV label="PIN code" value={data.location.pinCode} />
                <RV label="North" value={data.location.boundaryNorth} />
                <RV label="South" value={data.location.boundarySouth} />
                <RV label="East" value={data.location.boundaryEast} />
                <RV label="West" value={data.location.boundaryWest} />
                {(data.location.latitude || data.location.longitude) && (
                  <RV label="Coordinates" value={`${data.location.latitude}, ${data.location.longitude}`} />
                )}
              </ReviewSection>

              <ReviewSection title="Survey and plot" onEdit={() => handleEditStep(5)}>
                <RV label="Survey number(s)" value={data.survey.surveyNumbers} />
                <RV label="Plot number" value={data.survey.plotNumber} />
                <RV label="Layout name" value={data.survey.layoutName} />
                <RV label="LP number" value={data.survey.lpNumber} />
                <RV label="Plot area (sq m)" value={data.survey.plotArea} />
                <RV label="Road width (m)" value={data.survey.abuttingRoadWidth} />
                <RV label="Land use" value={data.survey.landUse} />
                <RV label="Tenure" value={data.survey.tenure} />
              </ReviewSection>

              <ReviewSection title="Development" onEdit={() => handleEditStep(6)}>
                <RV label="Building use" value={data.development.buildingUse} />
                <RV label="Sub-use" value={data.development.subUse} />
                <RV label="Occupancy type" value={data.development.occupancyType} />
                <RV label="Structure type" value={data.development.structureType} />
                <RV label="Floors above ground" value={data.development.floorsAboveGround} />
                <RV label="Basements" value={data.development.basements} />
                <RV label="Dwelling units" value={data.development.dwellingUnits} />
                <RV label="Building height (m)" value={data.development.buildingHeight} />
              </ReviewSection>

              <ReviewSection title="Building" onEdit={() => handleEditStep(7)}>
                <RV label="Plot area (sq m)" value={data.survey.plotArea} />
                <RV label="Built-up area (sq m)" value={data.building.builtUpArea} />
                <RV label="Total floor area (sq m)" value={data.building.totalFloorArea} />
                <RV label="Ground coverage (sq m)" value={data.building.groundCoverage} />
                <RV label="Parking area (sq m)" value={data.building.parkingArea} />
                <RV label="Achieved FAR" value={achievedFAR} />
                <RV label="Achieved coverage" value={achievedCoverage} />
                <RV label="Setback — front (m)" value={data.building.setbackFront} />
                <RV label="Setback — rear (m)" value={data.building.setbackRear} />
                <RV label="Setback — left (m)" value={data.building.setbackLeft} />
                <RV label="Setback — right (m)" value={data.building.setbackRight} />
              </ReviewSection>

              <ReviewSection title="Licensed technical person" onEdit={() => handleEditStep(8)}>
                <RV label="LTP" value={user?.name} />
                <RV label="Licence no." value={user?.licenseNo} />
                <div className="col-span-full"><RV label="Remarks" value={data.ltp.remarks} /></div>
                <div className="col-span-full">
                  <div className={cn("flex items-center gap-2 text-sm", data.ltp.declarationAccepted ? "text-emerald-700" : "text-red-600")}>
                    {data.ltp.declarationAccepted ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                    {data.ltp.declarationAccepted ? "Declaration accepted" : "Declaration not accepted"}
                  </div>
                </div>
              </ReviewSection>
            </div>
          )}

          {/* ── STEP 10: SUBMIT ── */}
          {step === 10 && (
            <div className="space-y-5">
              {!allComplete && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Some sections are incomplete.</p>
                    <p className="text-xs mt-0.5">Please go back to the Review step and complete all required sections before submitting.</p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Application summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <RV label="Draft number" value={draftNo} />
                  <RV label="Application type" value={appTypeLabelShort(data.appType as AppTypeKey)} />
                  <RV label="Applicant" value={data.applicant.fullName} />
                  <RV label="Mobile" value={data.applicant.mobile} />
                  <RV label="Survey number(s)" value={data.survey.surveyNumbers} />
                  <RV label="Plot area (sq m)" value={data.survey.plotArea} />
                  <div className="col-span-2"><RV label="Location" value={[data.location.doorNumber, data.location.streetName, data.property.locality, data.property.district, data.location.pinCode].filter(Boolean).join(", ")} /></div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Status</p>
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">Draft — ready for submission</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
                <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Please confirm</strong> that all information provided in this application is correct.
                  Once submitted, the application will be formally submitted for processing and cannot be edited.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Checkbox id="finalConfirm" checked={confirmSubmit} onCheckedChange={(v) => setConfirmSubmit(!!v)} className="mt-0.5" />
                <Label htmlFor="finalConfirm" className="cursor-pointer text-sm text-slate-800 leading-relaxed">
                  I confirm that the information provided in this application is true and correct, and I want to submit the application.
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev} className="gap-2 rounded-full">
                <ArrowLeft className="size-4" /> Previous
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step < 10 && (
              <Button variant="ghost" onClick={handleSaveDraft} className="gap-2 text-slate-600 rounded-full">
                <Save className="size-4" /> Save draft
              </Button>
            )}
            {step < 10 ? (
              <Button onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-full px-6">
                {editingFromReview && step < 9 ? "Back to review" : "Next"} <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!confirmSubmit || !allComplete || submitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-full px-8 disabled:opacity-50"
              >
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Submitting…</> : <><FileCheck className="size-4" /> Submit Application</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PURE HELPERS (outside component)
// ============================================================
// Needed to avoid TypeScript circular reference in the component
type ProjectInfo_propertyType = "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "INSTITUTIONAL" | "MIXED_USE";

function appTypeLabelShort(key: AppTypeKey | ""): string {
  switch (key) {
    case "COMMERCIAL_BP": return "Commercial building permission";
    case "LAYOUT_APPROVAL": return "Layout approval";
    case "RESIDENTIAL_BP": return "Residential building permission";
    default: return "";
  }
}

function stepDescription(step: number, data: WizardData): string {
  switch (step) {
    case 1: return "The person applying for permission.";
    case 2: return "The owner of the land, where that is not the applicant.";
    case 3: return "Where the property sits administratively.";
    case 4: return "Street address, zone and site boundaries.";
    case 5: return "Survey numbers, plot extent and the abutting road.";
    case 6: return "What is proposed to be built, and of what kind.";
    case 7: return "Areas, coverage and setbacks.";
    case 8: return "Your licensed technical person's declaration.";
    case 9: return "Review all details before submitting.";
    case 10: return "Final submission of the application.";
    default: return "";
  }
}
