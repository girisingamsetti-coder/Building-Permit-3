"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { WORKFLOW_STAGES } from "@/data/workflow-config";
import { PageHeader } from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workflow,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Layers,
  ListOrdered,
  Info,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GitCommit,
  UserCheck,
  MoveUp,
  MoveDown,
  Check,
  CornerDownRight,
  Sliders,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoleKey, WorkflowAction, WorkflowStage, ApprovalStepConfig } from "@/types";

// ============================================================
// Types & Presets for Approval Hierarchy
// ============================================================

const DEFAULT_APPROVAL_SEQUENCE: ApprovalStepConfig[] = [
  { id: "step-1", role: "ZONAL_HEAD", label: "Zonal Head Review", order: 1, canApprove: false, canReturn: true, canRaiseShortfall: true, nextRoleId: "step-2" },
  { id: "step-2", role: "DIRECTOR", label: "Director Review", order: 2, canApprove: true, canReturn: true, canRaiseShortfall: true, nextRoleId: "step-3" },
  { id: "step-3", role: "ADDITIONAL_COMMISSIONER", label: "Addl. Commissioner Review", order: 3, canApprove: true, canReturn: true, canRaiseShortfall: false, nextRoleId: "step-4" },
  { id: "step-4", role: "COMMISSIONER", label: "Commissioner Review", order: 4, canApprove: true, canReturn: true, canRaiseShortfall: false, nextRoleId: null },
];


// ============================================================
// Workflow Stage Configuration (Detailed Actions & Stages)
// ============================================================

const ACTION_LABELS: Record<WorkflowAction, string> = {
  APPROVE: "Approve",
  FORWARD: "Forward",
  RETURN: "Return",
  REJECT: "Reject",
  RAISE_SHORTFALL: "Raise Shortfall",
  ADD_REMARKS: "Add Remarks",
  SUBMIT_TECHNICAL_SCRUTINY: "Submit Technical Scrutiny",
  FINAL_DECISION: "Final Decision",
};

const ALL_ACTIONS: WorkflowAction[] = [
  "APPROVE",
  "FORWARD",
  "RETURN",
  "REJECT",
  "RAISE_SHORTFALL",
  "ADD_REMARKS",
  "SUBMIT_TECHNICAL_SCRUTINY",
  "FINAL_DECISION",
];

type StageOverride = {
  role?: RoleKey;
  allowedActions?: string[];
  canApprove?: boolean;
  canRaiseShortfall?: boolean;
};

type CategoryKey = "intake" | "scrutiny" | "approval" | "post";

const CATEGORIES: { key: CategoryKey; label: string; description: string; min: number; max: number }[] = [
  { key: "intake", label: "Application Intake", description: "Submission, drawing scrutiny, documents, fee & payment.", min: 0, max: 4 },
  { key: "scrutiny", label: "Technical Scrutiny", description: "TPS technical scrutiny and TPA document review.", min: 5, max: 6 },
  { key: "approval", label: "Approval Chain", description: "Zonal, Director, Addl. Commissioner and Commissioner reviews.", min: 7, max: 11 },
  { key: "post", label: "Post-Approval", description: "Final decision issue and closure.", min: 12, max: 99 },
];

function categoryForOrder(order: number): CategoryKey {
  const c = CATEGORIES.find((cat) => order >= cat.min && order <= cat.max);
  return c?.key ?? "intake";
}

function effectiveRole(s: WorkflowStage, override: StageOverride | undefined): RoleKey {
  return override?.role ?? s.role;
}

function effectiveActions(s: WorkflowStage, override: StageOverride | undefined): WorkflowAction[] {
  const raw: string[] = override?.allowedActions ?? s.allowedActions;
  return raw.filter((a): a is WorkflowAction => (ALL_ACTIONS as string[]).includes(a));
}

function effectiveCanApprove(s: WorkflowStage, override: StageOverride | undefined): boolean {
  return override?.canApprove ?? s.canApprove;
}

function effectiveCanRaiseShortfall(s: WorkflowStage, override: StageOverride | undefined): boolean {
  return override?.canRaiseShortfall ?? s.canRaiseShortfall;
}

function isCustomized(s: WorkflowStage, override: StageOverride | undefined): boolean {
  if (!override) return false;
  if (override.role !== undefined && override.role !== s.role) return true;
  if (override.allowedActions !== undefined) {
    const a = [...override.allowedActions].sort().join(",");
    const b = [...s.allowedActions].sort().join(",");
    if (a !== b) return true;
  }
  if (override.canApprove !== undefined && override.canApprove !== s.canApprove) return true;
  if (override.canRaiseShortfall !== undefined && override.canRaiseShortfall !== s.canRaiseShortfall) return true;
  return false;
}

interface DraftState {
  role: RoleKey;
  allowedActions: Set<WorkflowAction>;
  canApprove: boolean;
  canRaiseShortfall: boolean;
}

function buildDraft(s: WorkflowStage, override: StageOverride | undefined): DraftState {
  return {
    role: effectiveRole(s, override),
    allowedActions: new Set(effectiveActions(s, override)),
    canApprove: effectiveCanApprove(s, override),
    canRaiseShortfall: effectiveCanRaiseShortfall(s, override),
  };
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

// ============================================================
// Main AdminWorkflow Component
// ============================================================

export function AdminWorkflow({ embedded = false }: { embedded?: boolean } = {}) {
  const { toast } = useToast();
  const overrides = useAppStore((s) => s.workflowStageOverrides);
  const updateWorkflowStage = useAppStore((s) => s.updateWorkflowStage);
  const systemSettings = useAppStore((s) => s.systemSettings);
  const updateSystemSettings = useAppStore((s) => s.updateSystemSettings);
  const roles = useAppStore((s) => s.roles);
  const navigate = useAppStore((s) => s.navigate);

  // Available roles for officer review (excluding LTP & external users)
  const roleOptions = Object.values(roles).filter((r) => r.key !== "LTP");

  // --------------------------------------------------------------------------
  // Approval Hierarchy / Sequence State
  // --------------------------------------------------------------------------
  const initialSequence: ApprovalStepConfig[] = React.useMemo(() => {
    if (systemSettings?.approvalSequence && systemSettings.approvalSequence.length > 0) {
      return systemSettings.approvalSequence;
    }
    return DEFAULT_APPROVAL_SEQUENCE;
  }, [systemSettings?.approvalSequence]);

  const [sequence, setSequence] = React.useState<ApprovalStepConfig[]>(initialSequence);
  const [savedSequence, setSavedSequence] = React.useState<ApprovalStepConfig[]>(initialSequence);
  const [prevStoreSequence, setPrevStoreSequence] = React.useState(systemSettings?.approvalSequence);
  const [showAdvancedStages, setShowAdvancedStages] = React.useState(false);

  // Synchronize with store if external update occurs (React recommended pattern without useEffect)
  if (systemSettings?.approvalSequence !== prevStoreSequence) {
    setPrevStoreSequence(systemSettings?.approvalSequence);
    if (systemSettings?.approvalSequence && systemSettings.approvalSequence.length > 0) {
      setSequence(systemSettings.approvalSequence);
      setSavedSequence(systemSettings.approvalSequence);
    }
  }

  const isSequenceDirty = React.useMemo(() => {
    if (sequence.length !== savedSequence.length) return true;
    return JSON.stringify(sequence) !== JSON.stringify(savedSequence);
  }, [sequence, savedSequence]);

  // Move step up or down in approval hierarchy
  function moveStep(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sequence.length) return;

    setSequence((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      // Recalculate orders and next role linkage
      return copy.map((step, idx) => ({
        ...step,
        order: idx + 1,
        nextRoleId: idx < copy.length - 1 ? (copy[idx + 1].id || `step-${idx + 2}`) : null,
      }));
    });
  }

  // Update assigned role of a step
  function updateStepRole(index: number, newRole: RoleKey) {
    setSequence((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const roleDef = roles[newRole];
      const defaultLabel = roleDef ? `${roleDef.title} Review` : `${newRole} Review`;
      copy[index] = {
        ...cur,
        role: newRole,
        // Update label if it was matching old role's default pattern
        label: cur.label.includes("Review") ? defaultLabel : cur.label,
      };
      return copy;
    });
  }

  // Update a field on a step
  function updateStepField<K extends keyof ApprovalStepConfig>(index: number, field: K, value: ApprovalStepConfig[K]) {
    setSequence((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  // Add a new approval step
  function addStep() {
    const newId = `step-${Date.now()}`;
    const nextOrder = sequence.length + 1;
    // Default to an unused role if possible, else DIRECTOR
    const usedRoles = new Set(sequence.map((s) => s.role));
    const candidateRole: RoleKey =
      (roleOptions.find((r) => !usedRoles.has(r.key) && r.key !== "ADMIN")?.key as RoleKey) ?? "DIRECTOR";
    const roleDef = roles[candidateRole];
    const newStep: ApprovalStepConfig = {
      id: newId,
      role: candidateRole,
      label: roleDef ? `${roleDef.title} Review` : `${candidateRole} Review`,
      order: nextOrder,
      canApprove: true,
      canReturn: true,
      canRaiseShortfall: true,
      nextRoleId: null,
    };

    setSequence((prev) => {
      const copy = [...prev, newStep];
      return copy.map((step, idx) => ({
        ...step,
        order: idx + 1,
        nextRoleId: idx < copy.length - 1 ? (copy[idx + 1].id || `step-${idx + 2}`) : null,
      }));
    });

    toast({
      title: "Approval Level Added",
      description: `Added Level ${nextOrder}: ${roleDef?.title ?? candidateRole} to the approval hierarchy.`,
    });
  }

  // Delete an approval step
  function removeStep(index: number) {
    if (sequence.length <= 1) {
      toast({
        title: "Cannot Delete Level",
        description: "The approval mechanism requires at least one reviewing authority level.",
        variant: "destructive",
      });
      return;
    }

    const removed = sequence[index];
    setSequence((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((step, idx) => ({
        ...step,
        order: idx + 1,
        nextRoleId: idx < filtered.length - 1 ? (filtered[idx + 1].id || `step-${idx + 2}`) : null,
      }));
    });

    toast({
      title: "Approval Level Removed",
      description: `Removed ${removed.label} from the approval hierarchy.`,
    });
  }


  // Save the approval hierarchy to store & system settings
  function handleSaveSequence() {
    const normalized = sequence.map((step, idx) => ({
      ...step,
      order: idx + 1,
      nextRoleId: idx < sequence.length - 1 ? (sequence[idx + 1].id || `step-${idx + 2}`) : null,
    }));

    updateSystemSettings({ approvalSequence: normalized });
    setSequence(normalized);
    setSavedSequence(normalized);

    toast({
      title: "Approval Hierarchy Saved",
      description: `Configured ${normalized.length}-level approval sequence. Applications will route through this officer role hierarchy.`,
    });
  }

  // Reset to saved sequence
  function handleResetSequence() {
    setSequence(savedSequence);
    toast({
      title: "Workflow Sequence Reset",
      description: "Reverted changes to the last saved approval hierarchy.",
    });
  }

  // --------------------------------------------------------------------------
  // Granular Stage Overrides State (Existing System Stages)
  // --------------------------------------------------------------------------
  const [drafts, setDrafts] = React.useState<Record<string, DraftState>>(() => {
    const init: Record<string, DraftState> = {};
    for (const s of WORKFLOW_STAGES) {
      init[s.key] = buildDraft(s, overrides[s.key]);
    }
    return init;
  });

  function setDraftRole(key: string, role: RoleKey) {
    setDrafts((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], role } } : prev));
  }

  function toggleAction(key: string, action: WorkflowAction) {
    setDrafts((prev) => {
      const cur = prev[key];
      if (!cur) return prev;
      const next = new Set(cur.allowedActions);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return { ...prev, [key]: { ...cur, allowedActions: next } };
    });
  }

  function setDraftCanApprove(key: string, v: boolean) {
    setDrafts((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], canApprove: v } } : prev));
  }

  function setDraftCanRaiseShortfall(key: string, v: boolean) {
    setDrafts((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], canRaiseShortfall: v } } : prev));
  }

  function isStageDirty(s: WorkflowStage): boolean {
    const draft = drafts[s.key];
    if (!draft) return false;
    const eff = buildDraft(s, overrides[s.key]);
    return (
      draft.role !== eff.role ||
      !setsEqual(draft.allowedActions, eff.allowedActions) ||
      draft.canApprove !== eff.canApprove ||
      draft.canRaiseShortfall !== eff.canRaiseShortfall
    );
  }

  function handleSaveStage(s: WorkflowStage) {
    const draft = drafts[s.key];
    if (!draft) return;
    updateWorkflowStage(s.key, {
      role: draft.role,
      allowedActions: Array.from(draft.allowedActions),
      canApprove: draft.canApprove,
      canRaiseShortfall: draft.canRaiseShortfall,
    });
    toast({
      title: "Workflow stage updated",
      description: `${s.label} — overrides saved. Applies to new applications only.`,
    });
  }

  function handleResetStage(s: WorkflowStage) {
    updateWorkflowStage(s.key, {
      role: s.role,
      allowedActions: [...s.allowedActions],
      canApprove: s.canApprove,
      canRaiseShortfall: s.canRaiseShortfall,
    });
    setDrafts((prev) => (prev[s.key] ? { ...prev, [s.key]: buildDraft(s, undefined) } : prev));
    toast({
      title: "Workflow stage reset",
      description: `${s.label} — restored to default configuration.`,
    });
  }

  // KPIs
  const totalStages = WORKFLOW_STAGES.length;
  const customizedStages = WORKFLOW_STAGES.filter((s) => isCustomized(s, overrides[s.key])).length;
  const defaultStages = totalStages - customizedStages;
  const boundRoles = new Set(WORKFLOW_STAGES.map((s) => effectiveRole(s, overrides[s.key]))).size;

  // Group stages by category
  const grouped: Record<CategoryKey, WorkflowStage[]> = { intake: [], scrutiny: [], approval: [], post: [] };
  for (const s of WORKFLOW_STAGES) {
    grouped[categoryForOrder(s.order)].push(s);
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <PageHeader
          title="Workflow Configuration"
          description="Configure the end-to-end application approval mechanism — manage which role reviews the application after which role, reorder sequence levels, and grant approval authority."
          icon={Workflow}
          breadcrumbs={[{ label: "Administration", onClick: () => navigate("admin-dashboard") }, { label: "Workflow" }]}
          badge={<Badge variant="outline" className="bg-[#FAF4EB] text-[#801824] border-[#EADBCE] font-bold">Dynamic Flow</Badge>}
        />
      )}

      {/* ============================================================ */}
      {/* SECTION 1: APPLICATION APPROVAL MECHANISM (ROLE FLOW) */}
      {/* ============================================================ */}
      <div className="rounded-xl border-2 border-[#801824]/20 bg-white shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="bg-[#F5EBE1] border-b border-[#DCD5C8] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#801824] text-[#FDF6ED] shadow-xs">
              <Workflow className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#801824]">Application Approval Mechanism & Role Hierarchy</h2>
                <Badge className="bg-[#801824] text-[#FDF6ED] text-[10px] font-semibold">Active Pipeline</Badge>
              </div>
              <p className="text-xs text-[#5C1A20]">
                Configure which officer role will review and approve the application after which role in the departmental sequence.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetSequence}
              disabled={!isSequenceDirty}
              className="border-[#DCD5C8] text-[#801824] bg-white hover:bg-[#F3EADF] font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSequence}
              disabled={!isSequenceDirty}
              className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] font-bold text-xs h-8 px-3.5 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="size-3.5 mr-1" /> Save Workflow Hierarchy
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-6">

          {/* Live Visual Flowchart Diagram */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#801824] uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="size-3.5 text-[#801824]" /> Live Role-to-Role Approval Flow
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {sequence.length} Approval {sequence.length === 1 ? "Level" : "Levels"} Configured
              </span>
            </div>

            <div className="rounded-xl border border-[#EADBCE] bg-[#FAF4EB] p-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2.5 min-w-max py-1">
                {/* Initial Intake Step */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#DCD5C8] bg-white px-3.5 py-2.5 shadow-2xs text-center w-36 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Intake & Fees</span>
                  <span className="text-xs font-bold text-[#4A1017] truncate max-w-[130px]">LTP Submission</span>
                  <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-800 border-emerald-300 text-[9px] font-semibold">
                    Fee Paid
                  </Badge>
                </div>

                <ArrowRight className="size-4 shrink-0 text-[#801824]" />

                {/* Dynamic Sequence Steps */}
                {sequence.map((step, idx) => {
                  const roleDef = roles[step.role];
                  const isLast = idx === sequence.length - 1;
                  return (
                    <React.Fragment key={step.id || idx}>
                      <div
                        className={cn(
                          "relative flex flex-col items-center justify-center rounded-xl border-2 px-4 py-2.5 shadow-2xs text-center w-48 shrink-0 transition-all",
                          isLast
                            ? "border-[#801824] bg-white ring-2 ring-[#801824]/20"
                            : "border-[#EADBCE] bg-white hover:border-[#801824]"
                        )}
                      >
                        <span className="absolute -top-2.5 left-3 rounded-full bg-[#801824] px-2 py-0.5 text-[9px] font-bold text-[#FDF6ED] uppercase tracking-wider">
                          Level {idx + 1}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <RoleBadge role={step.role} label={roleDef?.title ?? step.role} />
                        </div>
                        <span className="text-xs font-bold text-[#4A1017] truncate max-w-[170px] mt-1" title={step.label}>
                          {step.label}
                        </span>
                        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                          {step.canApprove && (
                            <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-semibold text-emerald-800">
                              Approve
                            </span>
                          )}
                          {step.canRaiseShortfall && (
                            <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-semibold text-amber-800">
                              Shortfall
                            </span>
                          )}
                          {step.canReturn && (
                            <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-700">
                              Return
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow connecting to next step or final decision */}
                      <ArrowRight className="size-4 shrink-0 text-[#801824]" />
                    </React.Fragment>
                  );
                })}

                {/* Final Decision / Permit Issue */}
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-50/70 px-4 py-2.5 shadow-2xs text-center w-40 shrink-0">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Final Sanction</span>
                  <span className="text-xs font-bold text-emerald-950 truncate max-w-[140px]">Building Permit Issued</span>
                  <Badge variant="outline" className="mt-1 bg-emerald-600 text-white border-emerald-600 text-[9px] font-bold">
                    Sanction Order
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#EADBCE]" />

          {/* Sequential Step Cards with Reordering */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#801824]">Role Approval Chain Sequence</h3>
                <p className="text-xs text-[#5C1A20]">
                  Reorder levels with Move Up / Move Down to dictate which role comes after which role.
                </p>
              </div>
              <Button
                size="sm"
                onClick={addStep}
                className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] font-bold text-xs h-8 px-3 rounded-lg shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" /> Add Approval Level
              </Button>
            </div>

            <div className="space-y-4">
              {sequence.map((step, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sequence.length - 1;
                const nextStep = !isLast ? sequence[idx + 1] : null;
                const nextRoleDef = nextStep ? roles[nextStep.role] : null;
                const roleDef = roles[step.role];

                return (
                  <div
                    key={step.id || idx}
                    className="relative rounded-xl border-2 border-[#EADBCE] bg-[#FAF7F2] p-4 shadow-2xs hover:border-[#DCD5C8] transition-all"
                  >
                    {/* Level Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#EADBCE] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 items-center justify-center rounded-full bg-[#801824] text-xs font-bold text-[#FDF6ED] tabular-nums shadow-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#801824]">
                              Level {idx + 1} Approval Authority
                            </span>
                            <RoleBadge role={step.role} label={roleDef?.title ?? step.role} />
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {roleDef?.fullName ?? step.role} — {roleDef?.description ?? "Departmental reviewing officer"}
                          </p>
                        </div>
                      </div>

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveStep(idx, "up")}
                          disabled={isFirst}
                          className="h-8 px-2.5 text-xs font-semibold text-[#801824] border-[#DCD5C8] bg-white hover:bg-[#F3EADF] disabled:opacity-40 cursor-pointer"
                          title="Move earlier in approval sequence"
                          aria-label={`Move Level ${idx + 1} earlier`}
                        >
                          <MoveUp className="size-3.5 mr-1" /> Move Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveStep(idx, "down")}
                          disabled={isLast}
                          className="h-8 px-2.5 text-xs font-semibold text-[#801824] border-[#DCD5C8] bg-white hover:bg-[#F3EADF] disabled:opacity-40 cursor-pointer"
                          title="Move later in approval sequence"
                          aria-label={`Move Level ${idx + 1} later`}
                        >
                          <MoveDown className="size-3.5 mr-1" /> Move Down
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStep(idx)}
                          disabled={sequence.length <= 1}
                          className="h-8 px-2 text-rose-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-30 cursor-pointer"
                          title="Remove this approval level"
                          aria-label={`Remove Level ${idx + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Step Fields Grid */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
                      {/* Assigned Role Select */}
                      <div className="space-y-1.5 md:col-span-5">
                        <Label htmlFor={`role-sel-${idx}`} className="text-xs font-bold text-[#4A1017]">
                          Assigned Officer Role
                        </Label>
                        <Select value={step.role} onValueChange={(v) => updateStepRole(idx, v as RoleKey)}>
                          <SelectTrigger id={`role-sel-${idx}`} className="h-9 text-xs border-[#EADBCE] bg-white text-slate-800 focus:ring-[#801824] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-[#EADBCE] bg-white text-slate-800">
                            {roleOptions.map((r) => (
                              <SelectItem key={r.key} value={r.key} className="text-xs hover:bg-[#F3EADF] focus:bg-[#F3EADF] cursor-pointer">
                                {r.fullName} ({r.title})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-500">
                          Officer holding this role evaluates the application at Level {idx + 1}.
                        </p>
                      </div>

                      {/* Display Label Input */}
                      <div className="space-y-1.5 md:col-span-7">
                        <Label htmlFor={`label-inp-${idx}`} className="text-xs font-bold text-[#4A1017]">
                          Approval Level Display Title
                        </Label>
                        <Input
                          id={`label-inp-${idx}`}
                          value={step.label}
                          onChange={(e) => updateStepField(idx, "label", e.target.value)}
                          placeholder="e.g. Zonal Head Review"
                          className="h-9 text-xs border-[#EADBCE] bg-white focus-visible:ring-[#801824] rounded-lg"
                        />
                        <p className="text-[10px] text-slate-500">
                          Label displayed across application timelines, audit trails, and officer dashboards.
                        </p>
                      </div>

                      {/* "Forwards To" Sequence Connector Box */}
                      <div className="md:col-span-12 rounded-lg border border-[#EADBCE] bg-white p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="size-4 text-[#801824] shrink-0" />
                            <span className="text-xs font-bold text-[#801824]">Next In Sequence:</span>
                            {nextStep ? (
                              <div className="flex items-center gap-1.5 text-xs text-[#4A1017]">
                                <span className="font-semibold">Level {idx + 2}</span> ➔{" "}
                                <span className="font-bold underline decoration-[#801824]">{nextStep.label}</span>
                                <span className="text-[11px] text-slate-500">({nextRoleDef?.fullName ?? nextStep.role})</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                                <Check className="size-3.5 text-emerald-600" /> Final Approval Authority — Next action sanctions and issues the Building Permit
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EADBCE]">
                            {nextStep ? `Routes to ${nextRoleDef?.title ?? nextStep.role}` : "Workflow Completion"}
                          </span>
                        </div>
                      </div>

                      {/* Step Capabilities / Permission Switches */}
                      <div className="md:col-span-12 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <label
                          htmlFor={`appr-${idx}`}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#EADBCE] bg-white px-3 py-2 hover:bg-[#FAF4EB] transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#4A1017] block">Can Grant Approval</span>
                            <span className="text-[10px] text-slate-500 block">Pass forward or sanction</span>
                          </div>
                          <Switch
                            id={`appr-${idx}`}
                            checked={step.canApprove}
                            onCheckedChange={(v) => updateStepField(idx, "canApprove", v)}
                            className="data-[state=checked]:bg-[#801824]"
                            aria-label={`Allow approval at Level ${idx + 1}`}
                          />
                        </label>

                        <label
                          htmlFor={`shortfall-${idx}`}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#EADBCE] bg-white px-3 py-2 hover:bg-[#FAF4EB] transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#4A1017] block">Can Raise Shortfall</span>
                            <span className="text-[10px] text-slate-500 block">Issue notice to applicant</span>
                          </div>
                          <Switch
                            id={`shortfall-${idx}`}
                            checked={step.canRaiseShortfall}
                            onCheckedChange={(v) => updateStepField(idx, "canRaiseShortfall", v)}
                            className="data-[state=checked]:bg-[#801824]"
                            aria-label={`Allow shortfall at Level ${idx + 1}`}
                          />
                        </label>

                        <label
                          htmlFor={`return-${idx}`}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#EADBCE] bg-white px-3 py-2 hover:bg-[#FAF4EB] transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#4A1017] block">Can Return File</span>
                            <span className="text-[10px] text-slate-500 block">Send back to prior officer</span>
                          </div>
                          <Switch
                            id={`return-${idx}`}
                            checked={step.canReturn}
                            onCheckedChange={(v) => updateStepField(idx, "canReturn", v)}
                            className="data-[state=checked]:bg-[#801824]"
                            aria-label={`Allow returning file at Level ${idx + 1}`}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: ADVANCED STAGE CONFIGURATION & GRANULAR ACTIONS */}
      {/* ============================================================ */}
      <div className="rounded-xl border-2 border-[#801824]/20 bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedStages((prev) => !prev)}
          className="w-full bg-[#F5EBE1] border-b border-[#DCD5C8] px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#EFE3D6] transition-colors cursor-pointer"
          aria-expanded={showAdvancedStages}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#801824] text-[#FDF6ED] shadow-xs">
              <Sliders className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#801824]">Granular System Stages & Allowed Action Overrides</h3>
                <Badge variant="outline" className="bg-white text-[#801824] border-[#DCD5C8] text-[10px] font-semibold">
                  Advanced
                </Badge>
              </div>
              <p className="text-xs text-[#5C1A20]">
                Configure manual action toggles (Approve, Forward, Return, Technical Scrutiny) and system stage ownership.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#801824]">
              {showAdvancedStages ? "Hide Details" : "Show Details"}
            </span>
            {showAdvancedStages ? (
              <ChevronUp className="size-4 text-[#801824]" />
            ) : (
              <ChevronDown className="size-4 text-[#801824]" />
            )}
          </div>
        </button>

        {showAdvancedStages && (
          <div className="p-5 space-y-6">
            {/* KPI cards in Beige & Maroon Theme */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <KpiCard label="Total Stages" value={totalStages} icon={ListOrdered} hint="Configured pipeline" />
              <KpiCard label="Customized Stages" value={customizedStages} icon={ShieldCheck} hint="Overridden from default" />
              <KpiCard label="Default Stages" value={defaultStages} icon={CheckCircle2} hint="Using config defaults" />
              <KpiCard label="Bound Roles" value={boundRoles} icon={Layers} hint="Distinct owner roles" />
            </div>

            {/* Category Tabs */}
            <Tabs defaultValue="approval" className="w-full">
              <div className="border-b border-[#EADBCE] bg-[#FAF7F2] px-4 py-2.5 rounded-lg">
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl">
                  {CATEGORIES.map((c) => (
                    <TabsTrigger
                      key={c.key}
                      value={c.key}
                      className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3.5 py-1.5 hover:bg-[#F3EADF] transition-all cursor-pointer"
                    >
                      {c.label} ({grouped[c.key].length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {CATEGORIES.map((c) => (
                <TabsContent key={c.key} value={c.key} className="m-0 pt-4">
                  <p className="mb-4 text-xs font-semibold text-[#5C1A20]">{c.description}</p>
                  <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#DCD5C8] [&::-webkit-scrollbar-track]:bg-transparent">
                    {grouped[c.key].map((s) => {
                      const draft = drafts[s.key];
                      const override = overrides[s.key];
                      const customized = isCustomized(s, override);
                      const dirty = isStageDirty(s);
                      if (!draft) return null;
                      const defaultRoleLabel = roles[s.role]?.fullName ?? s.role;
                      return (
                        <div
                          key={s.key}
                          className={cn(
                            "rounded-xl border-2 p-4 transition-all",
                            customized
                              ? "border-[#801824] bg-[#FDFBF7] shadow-xs"
                              : "border-[#EADBCE] bg-white shadow-2xs hover:border-[#DCD5C8]"
                          )}
                        >
                          {/* Header */}
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex size-6 items-center justify-center rounded-full border-2 border-[#801824] bg-white text-[10px] font-bold text-[#801824] tabular-nums">
                                  {s.order}
                                </span>
                                <h4 className="text-sm font-bold text-[#801824]">{s.label}</h4>
                                <span className="font-mono text-[10px] text-slate-500 bg-[#FAF4EB] border border-[#EADBCE] px-1.5 py-0.5 rounded">{s.key}</span>
                                {customized && (
                                  <Badge variant="outline" className="gap-1 bg-[#801824] text-[#FDF6ED] border-[#801824] text-[10px] font-semibold">
                                    <ShieldCheck className="size-3" /> Customized
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">
                                Default role: <span className="font-bold text-[#4A1017]">{defaultRoleLabel}</span>
                                {s.nextStage && (
                                  <span className="ml-2 inline-flex items-center gap-1">
                                    · Next: <span className="font-semibold text-[#4A1017]">{WORKFLOW_STAGES.find((n) => n.key === s.nextStage)?.label}</span>
                                    <ArrowRight className="size-3 text-[#801824]" />
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetStage(s)}
                                disabled={!override}
                                className="border-[#DCD5C8] text-[#801824] bg-white hover:bg-[#F3EADF] font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer"
                                aria-label={`Reset ${s.label} to default configuration`}
                              >
                                <RotateCcw className="size-3.5 mr-1" /> Reset
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveStage(s)}
                                disabled={!dirty}
                                className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] font-bold text-xs h-8 px-3.5 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                                aria-label={`Save ${s.label} configuration`}
                              >
                                <Save className="size-3.5 mr-1" /> Save
                              </Button>
                            </div>
                          </div>

                          <Separator className="my-3 bg-[#EADBCE]" />

                          {/* Editable fields */}
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Assigned Role */}
                            <div className="space-y-1.5">
                              <Label htmlFor={`role-${s.key}`} className="text-xs font-bold text-[#4A1017]">Assigned Role</Label>
                              <Select value={draft.role} onValueChange={(v) => setDraftRole(s.key, v as RoleKey)}>
                                <SelectTrigger id={`role-${s.key}`} className="h-9 text-xs border-[#EADBCE] bg-white text-slate-800 focus:ring-[#801824] rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-[#EADBCE] bg-white text-slate-800">
                                  {roleOptions.map((r) => (
                                    <SelectItem key={r.key} value={r.key} className="text-xs hover:bg-[#F3EADF] focus:bg-[#F3EADF] cursor-pointer">
                                      {r.fullName} ({r.title})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Approval / Shortfall switches */}
                            <div className="grid grid-cols-2 gap-3">
                              <label
                                htmlFor={`approve-${s.key}`}
                                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#EADBCE] bg-[#FAF4EB] px-3 py-2 hover:bg-[#F3EADF] transition-colors"
                              >
                                <span className="text-xs font-bold text-[#4A1017]">Can Approve</span>
                                <Switch
                                  id={`approve-${s.key}`}
                                  checked={draft.canApprove}
                                  onCheckedChange={(v) => setDraftCanApprove(s.key, v)}
                                  className="data-[state=checked]:bg-[#801824]"
                                  aria-label={`Allow approval at ${s.label}`}
                                />
                              </label>
                              <label
                                htmlFor={`shortfall-${s.key}`}
                                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#EADBCE] bg-[#FAF4EB] px-3 py-2 hover:bg-[#F3EADF] transition-colors"
                              >
                                <span className="text-xs font-bold text-[#4A1017]">Can Raise Shortfall</span>
                                <Switch
                                  id={`shortfall-${s.key}`}
                                  checked={draft.canRaiseShortfall}
                                  onCheckedChange={(v) => setDraftCanRaiseShortfall(s.key, v)}
                                  className="data-[state=checked]:bg-[#801824]"
                                  aria-label={`Allow raising shortfall at ${s.label}`}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Allowed Actions */}
                          <div className="mt-4 space-y-2">
                            <Label className="text-xs font-bold text-[#4A1017]">Allowed Actions</Label>
                            <p className="text-[10px] text-slate-500">Toggle the manual actions an officer can perform at this stage.</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                              {ALL_ACTIONS.map((a) => {
                                const on = draft.allowedActions.has(a);
                                return (
                                  <label
                                    key={a}
                                    htmlFor={`act-${s.key}-${a}`}
                                    className={cn(
                                      "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-all",
                                      on
                                        ? "border-[#801824] bg-[#FDF6ED] text-[#801824] font-semibold shadow-2xs"
                                        : "border-[#EADBCE] bg-white text-slate-600 hover:bg-[#FAF4EB]"
                                    )}
                                  >
                                    <span className="text-xs leading-tight">{ACTION_LABELS[a]}</span>
                                    <Switch
                                      id={`act-${s.key}-${a}`}
                                      checked={on}
                                      onCheckedChange={() => toggleAction(s.key, a)}
                                      className="data-[state=checked]:bg-[#801824]"
                                      aria-label={`${ACTION_LABELS[a]} at ${s.label}`}
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Stage summary table (effective values) */}
            <div className="rounded-xl border border-[#EADBCE] bg-white shadow-2xs overflow-hidden">
              <div className="bg-[#FAF7F2] border-b border-[#EADBCE] px-4 py-3 flex items-center gap-2.5">
                <Layers className="size-4 text-[#801824]" />
                <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wide">System Stages Master Reference</h4>
              </div>
              <div className="max-h-80 overflow-x-auto overflow-y-auto">
                <table className="w-full text-xs border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8]">
                    <tr className="divide-x divide-[#DCD5C8] text-[11px] uppercase tracking-wide font-bold">
                      <th className="px-4 py-2.5">Order</th>
                      <th className="px-4 py-2.5">Stage</th>
                      <th className="px-4 py-2.5">Effective Role</th>
                      <th className="px-4 py-2.5">Allowed Actions</th>
                      <th className="px-4 py-2.5">Next Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
                    {WORKFLOW_STAGES.map((s) => {
                      const override = overrides[s.key];
                      const role = effectiveRole(s, override);
                      const actions = effectiveActions(s, override);
                      return (
                        <tr key={s.key} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE] align-top">
                          <td className="px-4 py-2.5 font-mono text-xs tabular-nums font-semibold text-[#801824]">{s.order}</td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-bold text-[#4A1017]">{s.label}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <RoleBadge role={role} label={roles[role]?.title ?? role} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {actions.slice(0, 3).map((a) => (
                                <Badge key={a} variant="outline" className="bg-[#FAF4EB] text-[#5C1A20] border-[#EADBCE] text-[10px]">
                                  {ACTION_LABELS[a]}
                                </Badge>
                              ))}
                              {actions.length > 3 && (
                                <Badge variant="outline" className="bg-[#FAF4EB] text-slate-500 border-[#EADBCE] text-[10px]">
                                  +{actions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-600">
                            {s.nextStage ? WORKFLOW_STAGES.find((n) => n.key === s.nextStage)?.label ?? s.nextStage : "Final Sanction"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3.5 rounded-xl border border-[#EADBCE] bg-[#FAF4EB] p-4 text-[#5C1A20]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FBF3E4] border border-[#EADBCE] text-[#801824]">
          <Info className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#801824]">Dynamic Approval Routing</p>
          <p className="text-xs leading-relaxed text-slate-600">
            When an officer marks an application as reviewed or forwarded, the system automatically checks the configured role hierarchy sequence and routes the application to the next designated officer role in line.
          </p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#EADBCE] bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FBF3E4] border border-[#EADBCE] text-[#801824]">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#5C1A20] uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-[#801824] tabular-nums">{value}</p>
          {hint && <p className="truncate text-[11px] text-slate-500" title={hint}>{hint}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminWorkflow;
