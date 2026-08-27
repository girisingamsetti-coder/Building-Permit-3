"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { WORKFLOW_STAGES, ROLES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
  InfoGrid,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Pencil,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  Layers,
  ListOrdered,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoleKey, WorkflowAction, WorkflowStage } from "@/types";

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

const ALL_ACTIONS: WorkflowAction[] = ["APPROVE", "FORWARD", "RETURN", "REJECT", "RAISE_SHORTFALL", "ADD_REMARKS", "SUBMIT_TECHNICAL_SCRUTINY", "FINAL_DECISION"];

export function AdminWorkflow() {
  const { toast } = useToast();
  const [editStage, setEditStage] = React.useState<WorkflowStage | null>(null);
  const [draftActions, setDraftActions] = React.useState<Set<WorkflowAction>>(new Set());
  const [draftRole, setDraftRole] = React.useState<RoleKey | "">("");

  function openEdit(s: WorkflowStage) {
    setEditStage(s);
    setDraftActions(new Set(s.allowedActions));
    setDraftRole(s.role);
  }

  function toggleAction(a: WorkflowAction) {
    setDraftActions((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  function saveStage(e: React.FormEvent) {
    e.preventDefault();
    if (!editStage) return;
    toast({
      title: "Workflow stage updated",
      description: `${editStage.label} — role & allowed actions saved. Changes apply to new applications only.`,
    });
    setEditStage(null);
  }

  const stats = {
    stages: WORKFLOW_STAGES.length,
    approvers: WORKFLOW_STAGES.filter((s) => s.canApprove).length,
    shortfallStages: WORKFLOW_STAGES.filter((s) => s.canRaiseShortfall).length,
    roles: Object.values(ROLES).filter((r) => r.key !== "ADMIN").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Stages"
        description="Configure the end-to-end approval pipeline — stage ordering, responsible roles, and the actions allowed at each step. The workflow is fully configurable; no behaviour is hardcoded."
        icon={Workflow}
        breadcrumbs={[{ label: "Administration" }, { label: "Workflow Stages" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">Configurable</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Workflow versioned", description: "A new draft version of the workflow has been created." })}>
            <GitBranch className="size-4" /> Version
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Workflow Stages" value={stats.stages} icon={ListOrdered} accent="primary" />
        <StatCard label="Approval Stages" value={stats.approvers} icon={CheckCircle2} accent="success" />
        <StatCard label="Shortfall Stages" value={stats.shortfallStages} icon={AlertTriangle} accent="amber" />
        <StatCard label="Bound Roles" value={stats.roles} icon={ShieldCheck} accent="info" />
      </div>

      {/* Vertical workflow */}
      <SectionCard
        title="Approval Pipeline"
        description="Vertical visualisation of the application journey from creation to final decision."
        icon={Workflow}
      >
        <ol className="relative space-y-0">
          {WORKFLOW_STAGES.map((s, idx) => {
            const isLast = idx === WORKFLOW_STAGES.length - 1;
            const role = ROLES[s.role];
            return (
              <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Connector */}
                {!isLast && (
                  <div className="absolute left-[18px] top-12 h-[calc(100%-1.5rem)] w-0.5 bg-gradient-to-b from-primary/40 to-border" />
                )}
                {/* Order circle */}
                <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-sm font-semibold text-primary tabular-nums shadow-sm">
                  {s.order}
                </div>

                {/* Stage card */}
                <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-gov">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{s.label}</h3>
                        <span className="font-mono text-[10px] text-muted-foreground">{s.key}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Responsible role:</span>
                        <RoleBadge role={s.role} label={role.title} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {s.allowedActions.length === 0 ? (
                          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">No manual actions</Badge>
                        ) : (
                          s.allowedActions.map((a) => (
                            <Badge key={a} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 text-[10px]">
                              {ACTION_LABELS[a]}
                            </Badge>
                          ))
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                        <Pencil className="size-3.5" /> Edit
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs">
                    {s.canApprove && (
                      <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30 text-[10px]">
                        <CheckCircle2 className="size-3" /> Can approve
                      </Badge>
                    )}
                    {s.canRaiseShortfall && (
                      <Badge variant="outline" className="gap-1 bg-warning/15 text-warning-foreground border-warning/40 text-[10px]">
                        <AlertTriangle className="size-3" /> Can raise shortfall
                      </Badge>
                    )}
                    {!s.canApprove && !s.canRaiseShortfall && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">System / passive stage</Badge>
                    )}
                    {s.nextStage && (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground">
                        Next:
                        <span className="font-medium text-foreground">{WORKFLOW_STAGES.find((n) => n.key === s.nextStage)?.label}</span>
                        <ArrowRight className="size-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </SectionCard>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
          <Info className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Configurable workflow — no hard-coded behaviour</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Every stage, role binding, action grant and forward-target is data-driven. Changes are versioned, audit-logged and applied to <span className="font-medium text-foreground">new applications only</span> — applications already in the pipeline continue on the workflow version under which they were submitted.
          </p>
        </div>
      </div>

      {/* Stage summary table */}
      <SectionCard
        title="Stage Summary"
        description="Tabular reference of every stage with its bindings."
        icon={Layers}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Order</th>
                <th className="px-4 py-2.5 text-left font-medium">Stage</th>
                <th className="px-4 py-2.5 text-left font-medium">Responsible Role</th>
                <th className="px-4 py-2.5 text-left font-medium">Actions</th>
                <th className="px-4 py-2.5 text-left font-medium">Next</th>
              </tr>
            </thead>
            <tbody>
              {WORKFLOW_STAGES.map((s) => (
                <tr key={s.key} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{s.order}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{s.key}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><RoleBadge role={s.role} label={ROLES[s.role].title} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {s.allowedActions.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        s.allowedActions.map((a) => (
                          <Badge key={a} variant="outline" className="bg-muted/60 text-muted-foreground text-[10px]">
                            {ACTION_LABELS[a]}
                          </Badge>
                        ))
                      )}
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
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Edit dialog */}
      <Dialog open={!!editStage} onOpenChange={(o) => !o && setEditStage(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit workflow stage</DialogTitle>
            <DialogDescription>
              {editStage && (
                <>
                  Configure <span className="font-medium text-foreground">{editStage.label}</span> — order {editStage.order}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {editStage && (
            <form onSubmit={saveStage} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role">Responsible role</Label>
                <Select value={draftRole} onValueChange={(v) => setDraftRole(v as RoleKey)}>
                  <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ROLES).filter((r) => r.key !== "ADMIN").map((r) => (
                      <SelectItem key={r.key} value={r.key}>{r.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Allowed actions</Label>
                <p className="text-[11px] text-muted-foreground">Toggle the manual actions an officer can perform at this stage.</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ACTIONS.map((a) => {
                    const on = draftActions.has(a);
                    return (
                      <label
                        key={a}
                        htmlFor={`act-${a}`}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors",
                          on ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent/40"
                        )}
                      >
                        <span className="text-xs font-medium text-foreground">{ACTION_LABELS[a]}</span>
                        <Switch id={`act-${a}`} checked={on} onCheckedChange={() => toggleAction(a)} />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-3">
                <label htmlFor="canApprove" className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">Can approve</span>
                  <Switch id="canApprove" defaultChecked={editStage.canApprove} />
                </label>
                <label htmlFor="canShortfall" className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">Can raise shortfall</span>
                  <Switch id="canShortfall" defaultChecked={editStage.canRaiseShortfall} />
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditStage(null)}>Cancel</Button>
                <Button type="submit"><CheckCircle2 className="size-4" /> Save stage</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminWorkflow;
