"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ApplicationType } from "@/types";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  FilePlus2,
  Info,
  Building2,
  MapPin,
  User,
  Users,
  FileText,
  Home,
  HardHat,
  Eye,
  ShieldCheck,
  Hammer,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileCheck,
  X,
  Pencil,
  PartyPopper,
  Save,
  Clock,
  CreditCard,
  Activity,
  PieChart,
  Upload,
} from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────
type AppTypeKey = "COMMERCIAL_BP" | "LAYOUT_APPROVAL" | "RESIDENTIAL_BP";

interface WizardData {
  appType: AppTypeKey | "";
  applicant: { fullName: string; fathersName: string; mobile: string; email: string; aadhaarLast4: string; pan: string; address: string };
  owner: { sameAsApplicant: boolean; fullName: string; mobile: string; address: string };
  property: { district: string; mandal: string; village: string; locality: string; wardNumber: string };
  location: { zone: string; doorNumber: string; streetName: string; pinCode: string; boundaryNorth: string; boundarySouth: string; boundaryEast: string; boundaryWest: string; latitude: string; longitude: string };
  survey: { surveyNumbers: string; plotNumber: string; layoutName: string; lpNumber: string; plotArea: string; abuttingRoadWidth: string; landUse: string; tenure: string };
  development: { buildingUse: string; subUse: string; occupancyType: string; structureType: string; floorsAboveGround: string; basements: string; dwellingUnits: string; buildingHeight: string };
  building: { builtUpArea: string; totalFloorArea: string; groundCoverage: string; parkingArea: string; setbackFront: string; setbackRear: string; setbackLeft: string; setbackRight: string };
  ltp: { remarks: string; declarationAccepted: boolean };
}

const INIT: WizardData = {
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

// ─── STEPS ──────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Applicant", short: "Applicant", icon: User },
  { id: 2, label: "Owner", short: "Owner", icon: Users },
  { id: 3, label: "Property", short: "Property", icon: Building2 },
  { id: 4, label: "Location", short: "Location", icon: MapPin },
  { id: 5, label: "Survey and Plot", short: "Survey", icon: FileText },
  { id: 6, label: "Development", short: "Development", icon: Hammer },
  { id: 7, label: "Building", short: "Building", icon: Home },
  { id: 8, label: "LTP", short: "LTP", icon: HardHat },
  { id: 9, label: "Review", short: "Review", icon: Eye },
  { id: 10, label: "Submit", short: "Submit", icon: ShieldCheck },
] as const;

const APP_TYPES: { key: AppTypeKey; label: string; desc: string; icon: React.ElementType }[] = [
  { key: "COMMERCIAL_BP", label: "Commercial building permission", desc: "Shop, office or commercial development", icon: Building2 },
  { key: "LAYOUT_APPROVAL", label: "Layout approval", desc: "Sub-division of land into plots", icon: ClipboardList },
  { key: "RESIDENTIAL_BP", label: "Residential building permission", desc: "Individual house or apartment block", icon: Home },
];

// ─── VALIDATION ──────────────────────────────────────────────────────────────
function mob(v: string) { return /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g, "")); }
function email(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function pin(v: string) { return /^\d{6}$/.test(v.trim()); }
function num(v: string) { return !isNaN(Number(v)) && v.trim() !== ""; }
function nonNeg(v: string) { return !v.trim() || (!isNaN(Number(v)) && Number(v) >= 0); }

function validate(step: number, d: WizardData): Record<string, string> {
  const e: Record<string, string> = {};
  return e;
}

// ─── AUTOSAVE ────────────────────────────────────────────────────────────────
const DRAFT_KEY = "ltp_wizard_dialog_draft";
function saveDraft(d: WizardData, step: number, dno: string) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ d, step, dno, at: new Date().toISOString() })); } catch { /**/ }
}
function loadDraft(): { d: WizardData; step: number; dno: string; at: string } | null {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /**/ } }
function genDraftNo() { return `DRAFT/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`; }
function appLabel(k: AppTypeKey | "") { return k === "COMMERCIAL_BP" ? "Commercial BP" : k === "LAYOUT_APPROVAL" ? "Layout Approval" : k === "RESIDENTIAL_BP" ? "Residential BP" : ""; }

// ─── SMALL HELPERS ──────────────────────────────────────────────────────────
function F({ label, required, error, hint, children, full }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("space-y-1.5", full && "col-span-3")}>
      <Label className="text-[11px] font-semibold text-slate-800">{label}</Label>
      <div className="[&_input]:h-[36px] [&_input]:rounded-[8px] [&_input]:border-[#DCD5C8] [&_input]:bg-white [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:placeholder-[#9CA3AF] [&_input]:focus-visible:border-[#7A1316] [&_input]:focus-visible:ring-0 [&_input]:focus-visible:shadow-[0_0_0_2px_rgba(122,19,22,0.15)] [&_textarea]:min-h-[80px] [&_textarea]:rounded-[8px] [&_textarea]:border-[#DCD5C8] [&_textarea]:bg-white [&_textarea]:text-[13px] [&_textarea]:text-slate-800 [&_textarea]:focus-visible:border-[#7A1316] [&_textarea]:focus-visible:ring-0 [&_textarea]:focus-visible:shadow-[0_0_0_2px_rgba(122,19,22,0.15)] [&_button[role='combobox']]:h-[36px] [&_button[role='combobox']]:rounded-[8px] [&_button[role='combobox']]:border-[#DCD5C8] [&_button[role='combobox']]:bg-white [&_button[role='combobox']]:text-[13px] [&_button[role='combobox']]:text-slate-800 [&_button[role='combobox']]:focus:border-[#7A1316] [&_button[role='combobox']]:focus:ring-0 [&_button[role='combobox']]:focus:shadow-[0_0_0_2px_rgba(122,19,22,0.15)]">
        {children}
      </div>
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="flex items-center gap-1 text-[11px] text-red-600" role="alert"><AlertCircle className="size-3 shrink-0" />{error}</p>}
    </div>
  );
}
function Divider({ title }: { title: string }) {
  return <div className="col-span-3 border-t border-[#DCD5C8] pt-4 pb-0"><p className="text-xs font-bold text-[#7A1316]">{title}</p></div>;
}
function RV({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p><p className="mt-0.5 text-sm text-slate-900 font-medium">{value?.trim() || "—"}</p></div>;
}
function ReviewCard({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#DCD5C8] bg-[#FBF3E4] overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between bg-[#F5EBE1] px-4 py-2 border-b border-[#DCD5C8]">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#7A1316]">{title}</p>
        <Button variant="ghost" size="sm" className="h-6 gap-1 text-[11px] text-[#7A1316] hover:bg-[#FAF4EB] font-bold px-2 cursor-pointer" onClick={() => onEdit(step)}><Pencil className="size-3" />Edit</Button>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export function NewApplicationDialog({
  open,
  onOpenChange,
  onSelectScheme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectScheme?: (scheme: "LPS Layout" | "Non-LPS") => void;
}) {
  const { user, createApplication, openApplication, navigate } = useAppStore();
  const { toast } = useToast();

  // State
  const [typeSelected, setTypeSelected] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<AppTypeKey | "">("");
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<WizardData>(INIT);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [completed, setCompleted] = React.useState(new Set<number>());
  const [draftNo, setDraftNo] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedAppId, setSubmittedAppId] = React.useState("");
  const [submittedAppNo, setSubmittedAppNo] = React.useState("");
  const [finalConfirm, setFinalConfirm] = React.useState(false);
  const [editFromReview, setEditFromReview] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  // Load draft when dialog opens
  React.useEffect(() => {
    if (!open) return;
    const dr = loadDraft();
    if (dr) {
      setData({ ...INIT, ...dr.d });
      setStep(dr.step);
      setDraftNo(dr.dno);
      setTypeSelected(true);
      setSelectedType(dr.d.appType as AppTypeKey);
      const c = new Set<number>();
      for (let s = 1; s < dr.step; s++) c.add(s);
      setCompleted(c);
      setSavedAt(dr.at);
      toast({ title: "Draft restored", description: `Continuing draft ${dr.dno}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Autosave
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!typeSelected || !draftNo) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveDraft(data, step, draftNo);
      setSavedAt(new Date().toISOString());
    }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [data, step, typeSelected, draftNo]);

  // Scroll content to top when step changes
  React.useEffect(() => { bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  function reset() {
    setTypeSelected(false); setSelectedType(""); setStep(1);
    setData(INIT); setErrors({}); setCompleted(new Set()); setDraftNo("");
    setSubmitted(false); setSubmittedAppId(""); setSubmittedAppNo(""); setFinalConfirm(false);
    setEditFromReview(false); setSavedAt(null);
  }

  function handleClose() { onOpenChange(false); }

  function upd<S extends keyof WizardData>(sec: S, patch: Partial<WizardData[S]>) {
    setData((d) => ({ ...d, [sec]: { ...(d[sec] as object), ...patch } }));
    setErrors((e) => { const n = { ...e }; Object.keys(patch as object).forEach((k) => delete n[k]); return n; });
  }

  function handleStart() {
    if (!selectedType) return;
    const dn = genDraftNo();
    setDraftNo(dn);
    setData({ ...INIT, appType: selectedType });
    setStep(1);
    setTypeSelected(true);
    setErrors({});
    setCompleted(new Set());
  }

  function handleNext() {
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTimeout(() => bodyRef.current?.querySelector("[role='alert']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setErrors({});
    setCompleted((c) => new Set([...c, step]));
    if (editFromReview && step < 9) { setEditFromReview(false); setStep(9); } else { setStep((s) => s + 1); }
  }

  function handlePrev() { setErrors({}); setStep((s) => s - 1); }

  function editStep(s: number) { setErrors({}); setEditFromReview(true); setStep(s); }

  function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      try {
        const tmap: Record<AppTypeKey, ApplicationType> = { COMMERCIAL_BP: "BUILDING_PERMISSION", LAYOUT_APPROVAL: "LAYOUT_APPROVAL", RESIDENTIAL_BP: "BUILDING_PERMISSION" };
        const appId = createApplication({
          applicationType: tmap[data.appType as AppTypeKey],
          propertyType: data.appType === "COMMERCIAL_BP" ? "COMMERCIAL" : "RESIDENTIAL" as any,
          projectName: data.survey.layoutName || `${appLabel(data.appType)} — ${data.property.locality || data.property.district}`,
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
      } catch {
        toast({ title: "Submission failed", description: "Your draft has been preserved.", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    }, 1200);
  }

  // Computed
  const plotN = Number(data.survey.plotArea) || 0;
  const floorN = Number(data.building.totalFloorArea) || 0;
  const covN = Number(data.building.groundCoverage) || 0;
  const far = plotN > 0 ? (floorN / plotN).toFixed(2) : "—";
  const cov = plotN > 0 ? ((covN / plotN) * 100).toFixed(1) + "%" : "—";
  const allOk = STEPS.slice(0, 8).every((s) => Object.keys(validate(s.id, data)).length === 0);

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onOpenChange(false); } }}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-2xl">
          <DialogTitle className="sr-only">Application submitted</DialogTitle>
          <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-8 py-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#7A1316] text-white shadow-sm"><PartyPopper className="size-7" /></div>
            <h2 className="text-xl font-black text-[#7A1316]">Application submitted!</h2>
            <p className="mt-1 text-xs text-slate-600">Now entering automatic drawing scrutiny.</p>
          </div>
          <div className="px-8 py-6 space-y-4">
            <div className="col-span-3 grid grid-cols-2 gap-3 rounded-xl border border-[#DCD5C8] bg-white p-4 text-xs">
              <RV label="Application No." value={submittedAppNo} />
              <RV label="Type" value={appLabel(data.appType as AppTypeKey)} />
              <RV label="Applicant" value={data.applicant.fullName} />
              <RV label="Date" value={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" className="flex-1 border-[#DCD5C8] text-slate-700 hover:bg-[#FBF3E4]" onClick={() => { reset(); onOpenChange(false); }}>Close</Button>
              <Button className="flex-1 bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold" onClick={() => { reset(); onOpenChange(false); openApplication(submittedAppId, "ltp-application-details"); }}>
                View Application <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── TYPE SELECTION SCREEN (LPS vs Non-LPS) ────────────────────────────────
  if (!typeSelected) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onOpenChange(false); } }}>
        <DialogContent className="w-[95vw] max-w-4xl p-6 sm:p-8 gap-6 bg-[#FAF7F2] border-2 border-[#7A1316] rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">Select application scheme</DialogTitle>
          
          {/* Header */}
          <div className="space-y-1.5 text-left border-b border-[#DCD5C8] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20">
                APCRDA Capital City &amp; Zonal Region
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#7A1316]">New application</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Choose the scheme for your application. Clicking on either option will immediately load the statutory form, drawings, and scrutiny rules for that application type.
            </p>
          </div>

          {/* 2 Buttons: LPS and Non LPS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Button 1: LPS */}
            <button 
              id="dialog-btn-lps" 
              onClick={() => {
                if (onSelectScheme) {
                  onSelectScheme("LPS Layout");
                } else {
                  setSelectedType("RESIDENTIAL_BP");
                  setData((d) => ({
                    ...d,
                    survey: { ...d.survey, layoutName: "LPS Layout" },
                  }));
                  setTypeSelected(true);
                }
              }}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl font-black text-[#7A1316] group-hover:scale-105 transition-transform">LPS</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7A1316] text-white">LPS Layout</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Land Pooling Scheme Layout Application</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For plots situated inside the Amaravati Capital City Land Pooling Scheme. Includes LPS Block No, LPS Survey No, LPS Plot No, and APCRDA pre-approved zoning districts (R3).
              </p>
              <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                  Open LPS Application <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Fast-track Scrutiny</span>
              </div>
            </button>

            {/* Button 2: Non LPS */}
            <button 
              id="dialog-btn-non-lps" 
              onClick={() => {
                if (onSelectScheme) {
                  onSelectScheme("Non-LPS");
                } else {
                  setSelectedType("RESIDENTIAL_BP");
                  setData((d) => ({
                    ...d,
                    survey: { ...d.survey, layoutName: "Non-LPS" },
                  }));
                  setTypeSelected(true);
                }
              }}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-slate-300 hover:border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl font-black text-slate-800 group-hover:text-[#7A1316] group-hover:scale-105 transition-transform">Non LPS</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#7A1316] group-hover:text-white transition-colors">Non-LPS Layout</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Non-LPS / Revenue Village / Gramkantam</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For general revenue lands, Gramkantam, extended habitation, private layouts, and village settlement plots requiring Mandal, Village, and Survey verification.
              </p>
              <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                  Open Non LPS Application <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Standard Revenue Scrutiny</span>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="rounded-lg border border-[#DCD5C8] bg-[#FBF3E4] p-3 text-xs text-slate-700 leading-relaxed shadow-2xs">
            An application number is issued as soon as you begin, and the file is saved as a draft. You can leave at any point and pick up where you left off — nothing is filed until you submit it.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const cur = STEPS.find((s) => s.id === step)!;

  // ── WIZARD DIALOG ─────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onOpenChange(false); } }}>
      <DialogContent
        showCloseButton={false}
        className="w-[85vw] max-w-5xl sm:max-w-5xl p-0 gap-0 flex flex-col overflow-hidden bg-[#FAF7F2] border-2 border-[#7A1316] shadow-2xl rounded-2xl"
        style={{ height: "85vh", maxHeight: "85vh" }}
      >
        <DialogTitle className="sr-only">New Application — {cur.label}</DialogTitle>

        {/* ── HEADER (fixed) ─────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between border-b-2 border-[#7A1316] bg-[#FBF3E4] px-6 py-3.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#7A1316] text-white shadow-2xs"><FilePlus2 className="size-5" /></div>
            <div>
              <p className="text-base font-black text-[#7A1316]">New Application</p>
              <p className="text-xs text-slate-600">Submit a new building permission application to APCRDA</p>
            </div>
          </div>
        </div>

        {/* ── HORIZONTAL STEPPER (fixed) ──────────────────────────────── */}
        <div className="shrink-0 border-b border-[#DCD5C8] bg-[#FAF7F2] px-6 py-3.5">
          <div className="flex items-center overflow-x-auto justify-between" style={{ scrollbarWidth: "none" }}>
            {STEPS.map((s, idx) => {
              const done = completed.has(s.id);
              const active = s.id === step;
              const reachable = done || active || s.id < step;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => reachable && !active && setStep(s.id)}
                    disabled={!reachable || active}
                    aria-current={active ? "step" : undefined}
                    className={cn("flex flex-col items-center gap-1.5 shrink-0 transition-all", reachable && !active ? "cursor-pointer" : "cursor-default")}
                  >
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-2xs",
                      active && "border-[#7A1316] bg-[#7A1316] text-white",
                      done && !active && "border-[#7A1316] bg-[#FBF3E4] text-[#7A1316]",
                      !done && !active && "border-[#DCD5C8] bg-white text-slate-400"
                    )}>
                      {done && !active ? <Check className="size-3.5 text-[#7A1316] font-black" /> : <Icon className="size-4" />}
                    </div>
                    <span className={cn("text-[11px] font-semibold whitespace-nowrap", active ? "text-[#7A1316] font-black" : done ? "text-[#7A1316]" : "text-slate-500")}>
                      {s.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={cn("mx-2 h-0.5 flex-1 min-w-[20px] transition-colors", done ? "bg-[#7A1316]" : "bg-[#DCD5C8]")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────────────── */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto bg-[#FAF7F2]">
          <div className="px-6 py-6 w-full max-w-4xl mx-auto bg-[#FBF3E4] border border-[#DCD5C8] rounded-xl my-4 shadow-xs">
            <h3 className="text-base font-black text-[#7A1316] border-b border-[#DCD5C8] pb-2 mb-5 uppercase tracking-wide">{cur.label}</h3>

            {/* ── STEP 1: APPLICANT ── */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <F label="Full name" required error={errors.fullName} full><Input value={data.applicant.fullName} onChange={(e) => upd("applicant", { fullName: e.target.value })} placeholder="e.g. Smt. Kavitha Reddy" /></F>
                <F label="Father's / husband's name" error={errors.fathersName}><Input value={data.applicant.fathersName} onChange={(e) => upd("applicant", { fathersName: e.target.value })} placeholder="e.g. Shri. Ravi Reddy" /></F>
                <F label="Mobile number" required error={errors.mobile} hint="10-digit Indian number"><Input value={data.applicant.mobile} onChange={(e) => upd("applicant", { mobile: e.target.value })} placeholder="e.g. 9876543210" inputMode="tel" /></F>
                <F label="Email address" error={errors.email}><Input type="email" value={data.applicant.email} onChange={(e) => upd("applicant", { email: e.target.value })} placeholder="applicant@email.com" /></F>
                <F label="Aadhaar — last 4 digits" error={errors.aadhaarLast4} hint="Do not enter the full number."><Input value={data.applicant.aadhaarLast4} onChange={(e) => upd("applicant", { aadhaarLast4: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="e.g. 4567" inputMode="numeric" maxLength={4} /></F>
                <F label="PAN" error={errors.pan} hint="10-character Permanent Account Number"><Input value={data.applicant.pan} onChange={(e) => upd("applicant", { pan: e.target.value.toUpperCase().slice(0, 10) })} placeholder="e.g. ABCDE1234F" /></F>
                <F label="Address" required error={errors.address} full><Textarea rows={3} value={data.applicant.address} onChange={(e) => upd("applicant", { address: e.target.value })} placeholder="Complete postal address" /></F>
              </div>
            )}

            {/* ── STEP 2: OWNER ── */}
            {step === 2 && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Checkbox id="same" checked={data.owner.sameAsApplicant} onCheckedChange={(v) => upd("owner", { sameAsApplicant: !!v })} />
                  <div><Label htmlFor="same" className="cursor-pointer text-sm font-medium">The applicant is the owner of the land</Label><p className="text-xs text-slate-500 mt-0.5">Check this if the applicant and the land owner are the same person.</p></div>
                </div>
                {data.owner.sameAsApplicant ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700 mb-3"><CheckCircle2 className="size-4" /><p className="text-sm font-medium">Owner details copied from applicant</p></div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                      <RV label="Name" value={data.applicant.fullName} />
                      <RV label="Mobile" value={data.applicant.mobile} />
                      <div className="col-span-full"><RV label="Address" value={data.applicant.address} /></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <F label="Owner's full name" required error={errors.ownerFullName} full><Input value={data.owner.fullName} onChange={(e) => upd("owner", { fullName: e.target.value })} placeholder="e.g. Shri. Rajesh Kumar" /></F>
                    <F label="Owner's mobile number" required error={errors.ownerMobile}><Input value={data.owner.mobile} onChange={(e) => upd("owner", { mobile: e.target.value })} placeholder="10-digit mobile" /></F>
                    <F label="Owner's address" required error={errors.ownerAddress} full><Textarea rows={3} value={data.owner.address} onChange={(e) => upd("owner", { address: e.target.value })} placeholder="Complete postal address" /></F>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: PROPERTY ── */}
            {step === 3 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <F label="District" required error={errors.district}><Input value={data.property.district} onChange={(e) => upd("property", { district: e.target.value })} placeholder="e.g. Hyderabad" /></F>
                <F label="Mandal"><Input value={data.property.mandal} onChange={(e) => upd("property", { mandal: e.target.value })} placeholder="e.g. Serilingampally" /></F>
                <F label="Village"><Input value={data.property.village} onChange={(e) => upd("property", { village: e.target.value })} placeholder="e.g. Kondapur" /></F>
                <F label="Locality"><Input value={data.property.locality} onChange={(e) => upd("property", { locality: e.target.value })} placeholder="e.g. Gachibowli" /></F>
                <F label="Ward number"><Input value={data.property.wardNumber} onChange={(e) => upd("property", { wardNumber: e.target.value })} placeholder="e.g. Ward 14" /></F>
              </div>
            )}

            {/* ── STEP 4: LOCATION ── */}
            {step === 4 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <F label="Zone" required error={errors.zone}>
                  <Select value={data.location.zone} onValueChange={(v) => upd("location", { zone: v })}>
                    <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                    <SelectContent>{["Zone I — East", "Zone II — South", "Zone III — North", "Zone IV — West", "Zone V — Central"].map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Door number"><Input value={data.location.doorNumber} onChange={(e) => upd("location", { doorNumber: e.target.value })} placeholder="e.g. 4-6-78" /></F>
                <F label="Street name" required error={errors.streetName} full><Input value={data.location.streetName} onChange={(e) => upd("location", { streetName: e.target.value })} placeholder="e.g. Jubilee Hills Road No. 45" /></F>
                <F label="PIN code" error={errors.pinCode} hint="6-digit postal code"><Input value={data.location.pinCode} onChange={(e) => upd("location", { pinCode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="e.g. 500032" inputMode="numeric" /></F>
                <Divider title="Site boundaries" />
                <F label="North"><Input value={data.location.boundaryNorth} onChange={(e) => upd("location", { boundaryNorth: e.target.value })} placeholder="e.g. Road 45" /></F>
                <F label="South"><Input value={data.location.boundarySouth} onChange={(e) => upd("location", { boundarySouth: e.target.value })} placeholder="e.g. Plot No. 23" /></F>
                <F label="East"><Input value={data.location.boundaryEast} onChange={(e) => upd("location", { boundaryEast: e.target.value })} placeholder="e.g. Neighbour property" /></F>
                <F label="West"><Input value={data.location.boundaryWest} onChange={(e) => upd("location", { boundaryWest: e.target.value })} placeholder="e.g. Government land" /></F>
                <Divider title="Coordinates (optional)" />
                <F label="Latitude" error={errors.latitude} hint="Decimal degrees, e.g. 17.4350"><Input value={data.location.latitude} onChange={(e) => upd("location", { latitude: e.target.value })} placeholder="17.4350" inputMode="decimal" /></F>
                <F label="Longitude" error={errors.longitude} hint="Decimal degrees, e.g. 78.3867"><Input value={data.location.longitude} onChange={(e) => upd("location", { longitude: e.target.value })} placeholder="78.3867" inputMode="decimal" /></F>
              </div>
            )}

            {/* ── STEP 5: SURVEY ── */}
            {step === 5 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <F label="Survey number(s)" required error={errors.surveyNumbers} hint="Separate multiple with a comma." full><Input value={data.survey.surveyNumbers} onChange={(e) => upd("survey", { surveyNumbers: e.target.value })} placeholder="e.g. Sy. 144/B2, Sy. 145/A1" /></F>
                <F label="Plot number"><Input value={data.survey.plotNumber} onChange={(e) => upd("survey", { plotNumber: e.target.value })} placeholder="e.g. Plot 14" /></F>
                <F label="Layout name"><Input value={data.survey.layoutName} onChange={(e) => upd("survey", { layoutName: e.target.value })} placeholder="e.g. Greenfield Enclave" /></F>
                <F label="LP number" hint="Layout Plan number, if applicable"><Input value={data.survey.lpNumber} onChange={(e) => upd("survey", { lpNumber: e.target.value })} placeholder="e.g. LP/2023/0045" /></F>
                <F label="Plot area (sq m)" required error={errors.plotArea}><Input type="number" min={0} value={data.survey.plotArea} onChange={(e) => upd("survey", { plotArea: e.target.value })} placeholder="e.g. 250" /></F>
                <F label="Abutting road width (m)" error={errors.abuttingRoadWidth}><Input type="number" min={0} value={data.survey.abuttingRoadWidth} onChange={(e) => upd("survey", { abuttingRoadWidth: e.target.value })} placeholder="e.g. 9" /></F>
                <F label="Land use">
                  <Select value={data.survey.landUse} onValueChange={(v) => upd("survey", { landUse: v })}>
                    <SelectTrigger><SelectValue placeholder="Select land use" /></SelectTrigger>
                    <SelectContent>{["Residential (R1)", "Residential (R2)", "Commercial (C1)", "Commercial (C2)", "Industrial (I)", "Agriculture", "Mixed Use"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Tenure">
                  <Select value={data.survey.tenure} onValueChange={(v) => upd("survey", { tenure: v })}>
                    <SelectTrigger><SelectValue placeholder="Select tenure" /></SelectTrigger>
                    <SelectContent>{["Freehold", "Leasehold", "Government lease", "GPA", "Other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
              </div>
            )}

            {/* ── STEP 6: DEVELOPMENT ── */}
            {step === 6 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <F label="Building use" required error={errors.buildingUse}>
                  <Select value={data.development.buildingUse} onValueChange={(v) => upd("development", { buildingUse: v })}>
                    <SelectTrigger><SelectValue placeholder="Select building use" /></SelectTrigger>
                    <SelectContent>{["Residential", "Commercial", "Industrial", "Institutional", "Mixed use", "Assembly", "Hazardous"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Sub-use"><Input value={data.development.subUse} onChange={(e) => upd("development", { subUse: e.target.value })} placeholder="e.g. Apartment, Shop" /></F>
                <F label="Occupancy type" required error={errors.occupancyType}>
                  <Select value={data.development.occupancyType} onValueChange={(v) => upd("development", { occupancyType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select occupancy" /></SelectTrigger>
                    <SelectContent>{["Group A — Residential", "Group B — Educational", "Group C — Institutional", "Group D — Assembly", "Group E — Business", "Group F — Mercantile", "Group G — Industrial", "Group H — Storage", "Group I — Hazardous"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Structure type">
                  <Select value={data.development.structureType} onValueChange={(v) => upd("development", { structureType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                    <SelectContent>{["RCC Framed", "Load bearing", "Steel frame", "Composite", "Prefabricated"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Floors above ground" error={errors.floorsAboveGround}><Input type="number" min={0} value={data.development.floorsAboveGround} onChange={(e) => upd("development", { floorsAboveGround: e.target.value })} placeholder="e.g. 7" /></F>
                <F label="Basements" error={errors.basements}><Input type="number" min={0} value={data.development.basements} onChange={(e) => upd("development", { basements: e.target.value })} placeholder="e.g. 1" /></F>
                <F label="Dwelling units" error={errors.dwellingUnits}><Input type="number" min={0} value={data.development.dwellingUnits} onChange={(e) => upd("development", { dwellingUnits: e.target.value })} placeholder="e.g. 24" /></F>
                <F label="Building height (m)" error={errors.buildingHeight}><Input type="number" min={0} step={0.1} value={data.development.buildingHeight} onChange={(e) => upd("development", { buildingHeight: e.target.value })} placeholder="e.g. 24.5" /></F>
              </div>
            )}

            {/* ── STEP 7: BUILDING ── */}
            {step === 7 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <F label="Plot area (sq m)" hint="Carried forward from Survey — read only."><Input value={data.survey.plotArea || "—"} readOnly className="bg-slate-50 cursor-default" /></F>
                <F label="Built-up area (sq m)" required error={errors.builtUpArea}><Input type="number" min={0} value={data.building.builtUpArea} onChange={(e) => upd("building", { builtUpArea: e.target.value })} placeholder="e.g. 1780" /></F>
                <F label="Total floor area (sq m)" error={errors.totalFloorArea}><Input type="number" min={0} value={data.building.totalFloorArea} onChange={(e) => upd("building", { totalFloorArea: e.target.value })} placeholder="e.g. 5600" /></F>
                <F label="Ground coverage (sq m)" error={errors.groundCoverage}><Input type="number" min={0} value={data.building.groundCoverage} onChange={(e) => upd("building", { groundCoverage: e.target.value })} placeholder="e.g. 125" /></F>
                <F label="Parking area (sq m)"><Input type="number" min={0} value={data.building.parkingArea} onChange={(e) => upd("building", { parkingArea: e.target.value })} placeholder="e.g. 200" /></F>
                {/* Calculated */}
                <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500">Achieved FAR</p><p className="mt-1 text-2xl font-bold text-blue-700">{far}</p></div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500">Achieved coverage</p><p className="mt-1 text-2xl font-bold text-blue-700">{cov}</p></div>
                </div>
                <Divider title="Setbacks (metres)" />
                <F label="Front (m)" error={errors.setbackFront}><Input type="number" min={0} step={0.1} value={data.building.setbackFront} onChange={(e) => upd("building", { setbackFront: e.target.value })} placeholder="e.g. 3.0" /></F>
                <F label="Rear (m)" error={errors.setbackRear}><Input type="number" min={0} step={0.1} value={data.building.setbackRear} onChange={(e) => upd("building", { setbackRear: e.target.value })} placeholder="e.g. 1.5" /></F>
                <F label="Left (m)" error={errors.setbackLeft}><Input type="number" min={0} step={0.1} value={data.building.setbackLeft} onChange={(e) => upd("building", { setbackLeft: e.target.value })} placeholder="e.g. 1.5" /></F>
                <F label="Right (m)" error={errors.setbackRight}><Input type="number" min={0} step={0.1} value={data.building.setbackRight} onChange={(e) => upd("building", { setbackRight: e.target.value })} placeholder="e.g. 1.5" /></F>
              </div>
            )}

            {/* ── STEP 8: LTP ── */}
            {step === 8 && (
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">LTP on record</p><p className="font-medium text-slate-800">{user?.name ?? "—"}</p>{user?.licenseNo && <p className="text-xs text-slate-500 mt-0.5">Licence: {user.licenseNo}</p>}</div>
                <F label="Remarks" hint="Optional notes or observations."><Textarea rows={3} value={data.ltp.remarks} onChange={(e) => upd("ltp", { remarks: e.target.value })} placeholder="Any remarks (optional)" /></F>
                <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                  <h4 className="text-sm font-semibold">Declaration</h4>
                  <blockquote className="border-l-2 border-blue-400 pl-4 text-sm text-slate-700 leading-relaxed">I certify that the particulars given above are true to the best of my knowledge, the drawings conform to applicable building rules, and I hold a valid licence to prepare and submit them.</blockquote>
                  <div className="flex items-start gap-3">
                    <Checkbox id="decl" checked={data.ltp.declarationAccepted} onCheckedChange={(v) => { upd("ltp", { declarationAccepted: !!v }); if (v) setErrors((e) => { const n = { ...e }; delete n.declarationAccepted; return n; }); }} className="mt-0.5" />
                    <div>
                      <Label htmlFor="decl" className="cursor-pointer font-semibold text-sm">I make this declaration</Label>
                      {errors.declarationAccepted && <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600" role="alert"><AlertCircle className="size-3 shrink-0" />{errors.declarationAccepted}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 9: REVIEW ── */}
            {step === 9 && (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2"><Info className="size-4 shrink-0 text-amber-600 mt-0.5" /><p className="text-sm text-amber-800">Review all details carefully. Click <strong>Edit</strong> on any section to go back and make changes.</p></div>
                <div className="grid grid-cols-8 gap-2">
                  {STEPS.slice(0, 8).map((s) => { const ok = Object.keys(validate(s.id, data)).length === 0; return <div key={s.id} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-medium border", ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>{ok ? <CheckCircle2 className="size-3 shrink-0" /> : <AlertCircle className="size-3 shrink-0" />}<span className="truncate">{s.short}</span></div>; })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ReviewCard title="Applicant details" step={1} onEdit={editStep}><RV label="Full name" value={data.applicant.fullName} /><RV label="Mobile" value={data.applicant.mobile} /><RV label="Email" value={data.applicant.email} /><div className="col-span-full"><RV label="Address" value={data.applicant.address} /></div></ReviewCard>
                  <ReviewCard title="Owner details" step={2} onEdit={editStep}>{data.owner.sameAsApplicant ? <div className="col-span-full flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-4" />Same as applicant</div> : <><RV label="Full name" value={data.owner.fullName} /><RV label="Mobile" value={data.owner.mobile} /><div className="col-span-full"><RV label="Address" value={data.owner.address} /></div></>}</ReviewCard>
                  <ReviewCard title="Property" step={3} onEdit={editStep}><RV label="District" value={data.property.district} /><RV label="Mandal" value={data.property.mandal} /><RV label="Village" value={data.property.village} /><RV label="Locality" value={data.property.locality} /><RV label="Ward" value={data.property.wardNumber} /></ReviewCard>
                  <ReviewCard title="Location" step={4} onEdit={editStep}><RV label="Zone" value={data.location.zone} /><RV label="Street" value={data.location.streetName} /><RV label="PIN" value={data.location.pinCode} /><RV label="N boundary" value={data.location.boundaryNorth} /><RV label="S boundary" value={data.location.boundarySouth} /></ReviewCard>
                  <ReviewCard title="Survey and plot" step={5} onEdit={editStep}><RV label="Survey nos." value={data.survey.surveyNumbers} /><RV label="Plot no." value={data.survey.plotNumber} /><RV label="Plot area (sq m)" value={data.survey.plotArea} /><RV label="Land use" value={data.survey.landUse} /><RV label="Tenure" value={data.survey.tenure} /></ReviewCard>
                  <ReviewCard title="Development" step={6} onEdit={editStep}><RV label="Building use" value={data.development.buildingUse} /><RV label="Occupancy" value={data.development.occupancyType} /><RV label="Floors" value={data.development.floorsAboveGround} /><RV label="Height (m)" value={data.development.buildingHeight} /></ReviewCard>
                  <ReviewCard title="Building" step={7} onEdit={editStep}><RV label="Built-up (sq m)" value={data.building.builtUpArea} /><RV label="FAR" value={far} /><RV label="Coverage" value={cov} /><RV label="Setback F/R" value={`${data.building.setbackFront || "—"} / ${data.building.setbackRear || "—"} m`} /></ReviewCard>
                  <ReviewCard title="LTP" step={8} onEdit={editStep}><RV label="LTP" value={user?.name} /><RV label="Licence" value={user?.licenseNo} /><div className="col-span-full"><div className={cn("flex items-center gap-2 text-sm", data.ltp.declarationAccepted ? "text-emerald-700" : "text-red-600")}>{data.ltp.declarationAccepted ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}{data.ltp.declarationAccepted ? "Declaration accepted" : "Declaration not yet accepted"}</div></div></ReviewCard>
                </div>
              </div>
            )}

            {/* ── STEP 10: SUBMIT ── */}
            {step === 10 && (
              <div className="space-y-4">
                {!allOk && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2"><AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" /><p className="text-sm text-red-800 font-medium">Some sections are incomplete. Return to Review and fix them before submitting.</p></div>}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 gap-3">
                  <RV label="Draft number" value={draftNo} />
                  <RV label="Application type" value={appLabel(data.appType as AppTypeKey)} />
                  <RV label="Applicant" value={data.applicant.fullName} />
                  <RV label="Plot area (sq m)" value={data.survey.plotArea} />
                  <div className="col-span-2"><RV label="Location" value={[data.location.doorNumber, data.location.streetName, data.property.locality, data.property.district].filter(Boolean).join(", ")} /></div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-2"><Info className="size-4 shrink-0 text-amber-600 mt-0.5" /><p className="text-sm text-amber-800">Once submitted this application cannot be edited. Please confirm you wish to proceed.</p></div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <Checkbox id="fc" checked={finalConfirm} onCheckedChange={(v) => setFinalConfirm(!!v)} className="mt-0.5" />
                  <Label htmlFor="fc" className="cursor-pointer text-sm text-slate-800 leading-relaxed">I confirm all information is true and correct, and I wish to submit this application.</Label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER (fixed) ──────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between border-t border-[#DCD5C8] bg-[#FBF3E4] px-6 py-3.5 sticky bottom-0">
          {/* Left: Close */}
          <div className="flex items-center">
            <Button variant="outline" onClick={handleClose} className="border-rose-600 text-rose-700 hover:bg-rose-50 font-bold text-xs h-[34px] px-4 rounded-lg cursor-pointer">Close</Button>
          </div>

          {/* Right: step count + Next/Submit */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Step {step} of {STEPS.length}</span>
            {step > 1 && <Button variant="outline" onClick={handlePrev} className="gap-1.5 rounded-lg h-[34px] font-bold text-xs border-[#DCD5C8] bg-white text-slate-700 shadow-2xs px-4 cursor-pointer hover:bg-[#FAF4EB]"><ArrowLeft className="size-4" /> Previous</Button>}
            <Button variant="outline" onClick={() => { saveDraft(data, step, draftNo); setSavedAt(new Date().toISOString()); toast({ title: "Draft saved" }); }} className="gap-1.5 rounded-lg h-[34px] font-bold text-xs border-[#DCD5C8] bg-white text-slate-700 shadow-2xs px-4 cursor-pointer hover:bg-[#FAF4EB]">
              <Save className="size-4" /> Save
            </Button>
            {step < 10 ? (
              <Button onClick={handleNext} className="gap-1.5 bg-[#7A1316] hover:bg-[#8F161A] text-white rounded-lg h-[34px] px-5 font-bold text-xs shadow-2xs cursor-pointer border border-[#630E10]">
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!finalConfirm || !allOk || submitting} className="gap-2 bg-[#7A1316] hover:bg-[#8F161A] text-white rounded-lg h-[34px] px-5 font-bold text-xs shadow-2xs disabled:opacity-50 cursor-pointer border border-[#630E10]">
                {submitting ? <><Loader2 className="size-4 animate-spin" />Submitting…</> : <><FileCheck className="size-4" />Submit</>}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function stepDesc(step: number): string {
  const m: Record<number, string> = {
    1: "Details of the person applying for permission.",
    2: "The owner of the land, if different from the applicant.",
    3: "Administrative location of the property.",
    4: "Street address, zone and site boundaries.",
    5: "Survey numbers, plot area and the abutting road.",
    6: "Proposed building use, type and extent.",
    7: "Floor areas, coverage and setbacks.",
    8: "Your declaration as the licensed technical person.",
    9: "Review all sections before final submission.",
    10: "Confirm and submit your application.",
  };
  return m[step] ?? "";
}
