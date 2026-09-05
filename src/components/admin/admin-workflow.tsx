"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { WORKFLOW_STAGES } from "@/data/workflow-config";
import {
  PageHeader,
  SectionCard,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoleKey, WorkflowAction, WorkflowStage } from "@/types";

// ============================================================
// Workflow Stage Configuration
// Reads canonical stage definitions from WORKFLOW_STAGES (config)
// and per-stage overrides from the Zustand store. Each stage is
// edited inline; Save writes overrides back to the store via
// updateWorkflowStage; Reset writes config defaults so the
// stage no longer differs from defaults.
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

// ---------- Effective value helpers (config + override) ----------

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

// A stage is "Customized" only when at least one override field differs from config defaults.
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

export function AdminWorkflow() {
  const { toast } = useToast();
  const overrides = useAppStore((s) => s.workflowStageOverrides);
  const updateWorkflowStage = useAppStore((s) => s.updateWorkflowStage);
  const roles = useAppStore((s) => s.roles);
  const navigate = useAppStore((s) => s.navigate);

  // Per-stage local draft state, initialized from the effective values
  // (config defaults overridden by any persisted store overrides).
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

  // Dirty when the draft differs from the currently-effective (saved) value.
  function isDirty(s: WorkflowStage): boolean {
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

  function handleSave(s: WorkflowStage) {
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

  function handleReset(s: WorkflowStage) {
    // The store does not expose a "clear override" action, so we write the
    // config defaults back into the override. The effective values then match
    // the defaults and isCustomized() returns false, hiding the badge.
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

  // ---------- KPIs ----------
  const totalStages = WORKFLOW_STAGES.length;
  const customizedStages = WORKFLOW_STAGES.filter((s) => isCustomized(s, overrides[s.key])).length;
  const defaultStages = totalStages - customizedStages;
  const boundRoles = new Set(WORKFLOW_STAGES.map((s) => effectiveRole(s, overrides[s.key]))).size;

  const roleOptions = Object.values(roles).filter((r) => r.key !== "SUPER_ADMIN");

  // Group stages by category
  const grouped: Record<CategoryKey, WorkflowStage[]> = { intake: [], scrutiny: [], approval: [], post: [] };
  for (const s of WORKFLOW_STAGES) {
    grouped[categoryForOrder(s.order)].push(s);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Stages"
        description="Configure the end-to-end approval pipeline — stage ownership, allowed actions, and approval/shortfall flags. The workflow is fully data-driven; changes apply to new applications only."
        icon={Workflow}
        breadcrumbs={[{ label: "Administration", onClick: () => navigate("admin-dashboard") }, { label: "Workflow Stages" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">Configurable</Badge>}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Total Stages" value={totalStages} icon={ListOrdered} hint="Configured pipeline" cls="bg-primary/10 text-primary" />
        <KpiCard label="Customized Stages" value={customizedStages} icon={ShieldCheck} hint="Overridden from default" cls="bg-warning/15 text-warning-foreground" />
        <KpiCard label="Default Stages" value={defaultStages} icon={CheckCircle2} hint="Using config defaults" cls="bg-success/10 text-success" />
        <KpiCard label="Bound Roles" value={boundRoles} icon={Layers} hint="Distinct owner roles" cls="bg-info/10 text-info" />
      </div>

      {/* Tabs by category — inline editing */}
      <SectionCard
        title="Approval Pipeline"
        description="Edit each stage's owner role, allowed actions and approval flags. Customized stages show a badge and a warning border."
        icon={Workflow}
        noPadding
      >
        <Tabs defaultValue="intake" className="w-full">
          <div className="border-b border-border px-4 pt-3">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.key} value={c.key} className="text-xs">
                  {c.label} ({grouped[c.key].length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.key} value={c.key} className="m-0 p-4">
              <p className="mb-3 text-xs text-muted-foreground">{c.description}</p>
              <div className="max-h-96 space-y-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                {grouped[c.key].map((s) => {
                  const draft = drafts[s.key];
                  const override = overrides[s.key];
                  const customized = isCustomized(s, override);
                  const dirty = isDirty(s);
                  if (!draft) return null;
                  const defaultRoleLabel = roles[s.role]?.fullName ?? s.role;
                  return (
                    <div key={s.key} className={cn("rounded-xl border bg-card p-4 shadow-gov", customized ? "border-warning/40" : "border-border")}>
                      {/* Header */}
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full border-2 border-primary bg-card text-[10px] font-semibold text-primary tabular-nums">
                              {s.order}
                            </span>
                            <h3 className="text-sm font-semibold text-foreground">{s.label}</h3>
                            <span className="font-mono text-[10px] text-muted-foreground">{s.key}</span>
                            {customized && (
                              <Badge variant="outline" className="gap-1 bg-warning/15 text-warning-foreground border-warning/40 text-[10px]">
                                <ShieldCheck className="size-3" /> Customized
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Default role: <span className="font-medium text-foreground">{defaultRoleLabel}</span>
                            {s.nextStage && (
                              <span className="ml-2 inline-flex items-center gap-1">
                                · Next: <span className="font-medium text-foreground">{WORKFLOW_STAGES.find((n) => n.key === s.nextStage)?.label}</span>
                                <ArrowRight className="size-3" />
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReset(s)}
                            disabled={!override}
                            aria-label={`Reset ${s.label} to default configuration`}
                          >
                            <RotateCcw className="size-3.5" /> Reset
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSave(s)}
                            disabled={!dirty}
                            aria-label={`Save ${s.label} configuration`}
                          >
                            <Save className="size-3.5" /> Save
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      {/* Editable fields */}
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Assigned Role */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`role-${s.key}`} className="text-xs font-medium">Assigned Role</Label>
                          <Select value={draft.role} onValueChange={(v) => setDraftRole(s.key, v as RoleKey)}>
                            <SelectTrigger id={`role-${s.key}`} className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((r) => (
                                <SelectItem key={r.key} value={r.key} className="text-xs">
                                  {r.fullName} ({r.title})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground">
                            Default: {defaultRoleLabel}
                            {draft.role !== s.role && <span className="ml-1 text-warning-foreground">· changed</span>}
                          </p>
                        </div>

                        {/* Approval / Shortfall switches */}
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            htmlFor={`approve-${s.key}`}
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                          >
                            <span className="text-xs font-medium text-foreground">Can Approve</span>
                            <Switch
                              id={`approve-${s.key}`}
                              checked={draft.canApprove}
                              onCheckedChange={(v) => setDraftCanApprove(s.key, v)}
                              aria-label={`Allow approval at ${s.label}`}
                            />
                          </label>
                          <label
                            htmlFor={`shortfall-${s.key}`}
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                          >
                            <span className="text-xs font-medium text-foreground">Can Raise Shortfall</span>
                            <Switch
                              id={`shortfall-${s.key}`}
                              checked={draft.canRaiseShortfall}
                              onCheckedChange={(v) => setDraftCanRaiseShortfall(s.key, v)}
                              aria-label={`Allow raising shortfall at ${s.label}`}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Allowed Actions */}
                      <div className="mt-4 space-y-2">
                        <Label className="text-xs font-medium">Allowed Actions</Label>
                        <p className="text-[10px] text-muted-foreground">Toggle the manual actions an officer can perform at this stage.</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                          {ALL_ACTIONS.map((a) => {
                            const on = draft.allowedActions.has(a);
                            return (
                              <label
                                key={a}
                                htmlFor={`act-${s.key}-${a}`}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors",
                                  on ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent/40"
                                )}
                              >
                                <span className="text-xs font-medium text-foreground">{ACTION_LABELS[a]}</span>
                                <Switch
                                  id={`act-${s.key}-${a}`}
                                  checked={on}
                                  onCheckedChange={() => toggleAction(s.key, a)}
                                  aria-label={`${ACTION_LABELS[a]} at ${s.label}`}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Effective flags + dirty indicator */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs">
                        {draft.canApprove && (
                          <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30 text-[10px]">
                            <CheckCircle2 className="size-3" /> Can approve
                          </Badge>
                        )}
                        {draft.canRaiseShortfall && (
                          <Badge variant="outline" className="gap-1 bg-warning/15 text-warning-foreground border-warning/40 text-[10px]">
                            <AlertTriangle className="size-3" /> Can raise shortfall
                          </Badge>
                        )}
                        {draft.allowedActions.size === 0 && !draft.canApprove && !draft.canRaiseShortfall && (
                          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">System / passive stage</Badge>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {dirty ? "Unsaved changes" : customized ? "Saved" : "Default"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SectionCard>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
          <Info className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Configurable workflow — no hard-coded behaviour</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Every stage, role binding, action grant and forward-target is data-driven. Changes are audit-logged and applied to <span className="font-medium text-foreground">new applications only</span> — applications already in the pipeline continue on the workflow version under which they were submitted.
          </p>
        </div>
      </div>

      {/* Stage summary table (effective values) */}
      <SectionCard
        title="Stage Summary"
        description="Tabular reference of every stage with effective bindings (override applied)."
        icon={Layers}
        noPadding
      >
        <div className="max-h-96 overflow-x-auto overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              <tr className="text-left text-[11px] uppercase tracking-wide text-foreground">
                <th className="px-4 py-2.5 font-bold">Order</th>
                <th className="px-4 py-2.5 font-bold">Stage</th>
                <th className="px-4 py-2.5 font-bold">Effective Role</th>
                <th className="px-4 py-2.5 font-bold">Allowed Actions</th>
                <th className="px-4 py-2.5 font-bold">Flags</th>
                <th className="px-4 py-2.5 font-bold">Next</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {WORKFLOW_STAGES.map((s) => {
                const override = overrides[s.key];
                const customized = isCustomized(s, override);
                const role = effectiveRole(s, override);
                const actions = effectiveActions(s, override);
                const canApprove = effectiveCanApprove(s, override);
                const canRaiseShortfall = effectiveCanRaiseShortfall(s, override);
                return (
                  <tr key={s.key} className="hover:bg-muted/30 align-top">
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{s.order}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{s.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{s.key}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={role} label={roles[role]?.title ?? role} />
                        {customized && (
                          <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/40 text-[9px]">Custom</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {actions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          actions.map((a) => (
                            <Badge key={a} variant="outline" className="bg-muted/60 text-muted-foreground text-[10px]">
                              {ACTION_LABELS[a]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {canApprove && <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[9px]">Approve</Badge>}
                        {canRaiseShortfall && <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/40 text-[9px]">Shortfall</Badge>}
                        {!canApprove && !canRaiseShortfall && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {s.nextStage ? (
                        <span className="inline-flex items-center gap-1">
                          {WORKFLOW_STAGES.find((n) => n.key === s.nextStage)?.label}
                          <ArrowDown className="size-3" />
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, hint, cls }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; hint?: string; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}>
        <Icon className="size-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default AdminWorkflow;
