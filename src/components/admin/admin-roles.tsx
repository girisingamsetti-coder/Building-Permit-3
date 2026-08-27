"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ROLES, USERS, WORKFLOW_STAGES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  Check,
  X,
  Layers,
  Users as UsersIcon,
  KeyRound,
  ShieldAlert,
  Workflow,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Permission, Role, RoleKey, WorkflowAction } from "@/types";

// All distinct permissions across roles — for the matrix
const ALL_PERMISSIONS: Permission[] = Array.from(
  new Set(Object.values(ROLES).flatMap((r) => r.permissions))
);

const PERMISSION_LABELS: Record<Permission, string> = {
  "application:create": "Create application",
  "application:view_own": "View own applications",
  "application:view_all": "View all applications",
  "drawing:upload": "Upload drawings",
  "drawing:scrutinize": "Scrutinize drawings",
  "document:upload": "Upload documents",
  "document:verify": "Verify documents",
  "fee:calculate": "Calculate fees",
  "fee:manage": "Manage fee structures",
  "payment:initiate": "Initiate payment",
  "payment:verify": "Verify payments",
  "workflow:approve": "Approve at stage",
  "workflow:forward": "Forward to next stage",
  "workflow:return": "Return to previous",
  "workflow:reject": "Reject application",
  "shortfall:raise": "Raise shortfall",
  "shortfall:resolve": "Resolve shortfall",
  "remarks:add": "Add remarks",
  "user:manage": "Manage users",
  "role:manage": "Manage roles",
  "config:manage": "Manage configuration",
  "audit:view": "View audit logs",
  "notifications:manage": "Manage notifications",
};

const WORKFLOW_ACTION_LABELS: Record<WorkflowAction, string> = {
  APPROVE: "Approve",
  FORWARD: "Forward",
  RETURN: "Return",
  REJECT: "Reject",
  RAISE_SHORTFALL: "Raise Shortfall",
  ADD_REMARKS: "Add Remarks",
  SUBMIT_TECHNICAL_SCRUTINY: "Submit Technical Scrutiny",
  FINAL_DECISION: "Final Decision",
};

function roleUserCount(roleKey: RoleKey) {
  return USERS.filter((u) => u.role === roleKey).length;
}

function roleWorkflowActions(role: Role) {
  const stages = WORKFLOW_STAGES.filter((s) => s.role === role.key);
  const actions = new Set<WorkflowAction>();
  stages.forEach((s) => s.allowedActions.forEach((a) => actions.add(a)));
  return Array.from(actions);
}

export function AdminRoles() {
  const { navigate } = useAppStore();
  const { toast } = useToast();
  const roleList = Object.values(ROLES);
  const matrixCols = roleList.filter((r) => r.key !== "ADMIN");
  const matrixRows = ALL_PERMISSIONS;

  const stats = {
    roles: roleList.length,
    permissions: ALL_PERMISSIONS.length,
    adminUsers: roleUserCount("ADMIN"),
    workflows: WORKFLOW_STAGES.length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Inspect and govern the role-based access control (RBAC) matrix that powers every action across the LTP approval workflow."
        icon={ShieldCheck}
        breadcrumbs={[{ label: "Administration" }, { label: "Roles & Permissions" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">RBAC matrix</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit mode", description: "Permission editing is restricted to system administrators with elevation." })}>
            <Pencil className="size-4" /> Edit matrix
          </Button>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Roles Defined" value={stats.roles} icon={ShieldCheck} accent="primary" />
        <StatCard label="Distinct Permissions" value={stats.permissions} icon={KeyRound} accent="info" />
        <StatCard label="Workflow Stages" value={stats.workflows} icon={Workflow} accent="amber" />
        <StatCard label="Admin Users" value={stats.adminUsers} icon={UsersIcon} accent="success" />
      </div>

      {/* Role cards grid */}
      <SectionCard
        title="Roles"
        description="Each role has a defined level, permission set and workflow responsibility."
        icon={Layers}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roleList.map((r) => {
            const count = roleUserCount(r.key);
            const wfActions = roleWorkflowActions(r);
            return (
              <div key={r.key} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-gov transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary")}>
                      <ShieldCheck className="size-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{r.fullName}</h3>
                        <RoleBadge role={r.key} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Level {r.level}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-muted/60 text-muted-foreground gap-1">
                    <UsersIcon className="size-3" /> {count}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{r.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions.slice(0, 5).map((p) => (
                    <Badge key={p} variant="outline" className="bg-muted/60 text-muted-foreground text-[10px]">
                      {PERMISSION_LABELS[p]}
                    </Badge>
                  ))}
                  {r.permissions.length > 5 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] cursor-help">
                            +{r.permissions.length - 5} more
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="w-56">
                          <ul className="space-y-0.5">
                            {r.permissions.slice(5).map((p) => (
                              <li key={p} className="text-xs">{PERMISSION_LABELS[p]}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {wfActions.length > 0 && (
                  <div className="mt-auto border-t border-border/60 pt-2.5">
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Allowed workflow actions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wfActions.map((a) => (
                        <Badge key={a} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 text-[10px]">
                          {WORKFLOW_ACTION_LABELS[a]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Permission matrix */}
      <SectionCard
        title="Permission Matrix"
        description="Granular permission grants per role — green tick indicates the permission is granted."
        icon={KeyRound}
        noPadding
      >
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="min-w-[260px] pl-4">Permission</TableHead>
                {matrixCols.map((r) => (
                  <TableHead key={r.key} className="text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <RoleBadge role={r.key} label={r.title} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrixRows.map((p) => (
                <TableRow key={p}>
                  <TableCell className="pl-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{PERMISSION_LABELS[p]}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{p}</span>
                    </div>
                  </TableCell>
                  {matrixCols.map((r) => {
                    const has = r.permissions.includes(p);
                    return (
                      <TableCell key={r.key} className="text-center">
                        {has ? (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <X className="size-3.5" />
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Expandable role details */}
      <SectionCard
        title="Role Workflow Bindings"
        description="Each role may be the responsible owner of one or more workflow stages. Expand to inspect."
        icon={Workflow}
      >
        <Accordion type="single" collapsible className="w-full">
          {roleList.filter((r) => r.key !== "ADMIN").map((r) => {
            const stages = WORKFLOW_STAGES.filter((s) => s.role === r.key);
            return (
              <AccordionItem key={r.key} value={r.key} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-3 pr-3">
                    <RoleBadge role={r.key} label={r.title} />
                    <span className="text-sm font-medium text-foreground">{r.fullName}</span>
                    <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
                      {stages.length} stage{stages.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {stages.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <ShieldAlert className="size-4" /> This role does not own any workflow stage directly.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stages.map((s) => (
                        <div key={s.key} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">{s.order}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{s.label}</p>
                              <p className="text-[11px] text-muted-foreground">Next: {s.nextStage ?? "—"}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {s.allowedActions.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground">No manual actions</span>
                            ) : (
                              s.allowedActions.map((a) => (
                                <Badge key={a} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 text-[10px]">
                                  {WORKFLOW_ACTION_LABELS[a]}
                                </Badge>
                              ))
                            )}
                            <ChevronRight className="size-3.5 text-muted-foreground" />
                            {s.canRaiseShortfall && <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/40 text-[10px]">Can raise shortfall</Badge>}
                            {s.canApprove && <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">Can approve</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        RBAC changes are versioned and audit-logged. To request a new role or permission grant, raise a ticket with the IT &amp; e-Governance Cell.
      </p>
    </div>
  );
}

export default AdminRoles;
