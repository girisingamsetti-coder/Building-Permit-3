"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ROLES, WORKFLOW_STAGES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
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

// ---- Static ordering & labelling ----
// Permissions here are deliberately declared statically (not derived from the
// store or from ROLES) so that every permission remains visible in the admin
// UI even when currently disabled for *all* roles — the admin must still be
// able to grant it again.
const PERMISSION_LABELS: Record<Permission, string> = {
  "application:create": "Create application",
  "application:view_own": "View own applications",
  "application:view_all": "View all applications",
  "drawing:upload": "Upload drawings",
  "drawing:view": "View drawings",
  "drawing:scrutinize": "Scrutinize drawings",
  "document:upload": "Upload documents",
  "document:view": "View documents",
  "document:verify": "Verify documents",
  "document:reject": "Reject documents",
  "fee:calculate": "Calculate fees",
  "fee:manage": "Manage fee structures",
  "payment:initiate": "Initiate payment",
  "payment:verify": "Verify payments",
  "workflow:approve": "Approve at stage",
  "workflow:forward": "Forward to next stage",
  "workflow:return": "Return to previous",
  "workflow:reject": "Reject application",
  "shortfall:raise": "Raise shortfall",
  "shortfall:view": "View shortfalls",
  "shortfall:resolve": "Resolve shortfall",
  "remarks:add": "Add remarks",
  "user:manage": "Manage users",
  "role:manage": "Manage roles",
  "config:manage": "Manage configuration",
  "audit:view": "View audit logs",
  "notifications:manage": "Manage notifications",
};

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];

const ROLE_ORDER: RoleKey[] = [
  "LTP",
  "TPS",
  "TPA",
  "ZAD",
  "ZDD",
  "ZJD",
  "DIRECTOR_DP",
  "ADDL_COMMISSIONER",
  "COMMISSIONER",
  "ADMIN",
];

const PERMISSION_CATEGORIES: { name: string; permissions: Permission[] }[] = [
  { name: "Application", permissions: ["application:create", "application:view_own", "application:view_all"] },
  { name: "Drawing", permissions: ["drawing:upload", "drawing:view", "drawing:scrutinize"] },
  { name: "Document", permissions: ["document:upload", "document:view", "document:verify", "document:reject"] },
  { name: "Fee", permissions: ["fee:calculate", "fee:manage"] },
  { name: "Payment", permissions: ["payment:initiate", "payment:verify"] },
  { name: "Workflow", permissions: ["workflow:approve", "workflow:forward", "workflow:return", "workflow:reject"] },
  { name: "Shortfall", permissions: ["shortfall:raise", "shortfall:view", "shortfall:resolve"] },
  { name: "Remarks", permissions: ["remarks:add"] },
  { name: "Admin", permissions: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage"] },
];

// "Key" permissions surfaced in the compact Matrix View (kept narrow enough
// to fit the screen with horizontal scroll when needed).
const KEY_PERMISSIONS: Permission[] = [
  "application:create",
  "application:view_all",
  "drawing:scrutinize",
  "document:verify",
  "document:reject",
  "workflow:approve",
  "workflow:forward",
  "workflow:return",
  "workflow:reject",
  "shortfall:raise",
  "shortfall:resolve",
  "user:manage",
  "config:manage",
];

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

export function AdminRoles() {
  // Per task spec: read roles & users from the store via selectors — not from
  // mock-data imports. The ROLES import above is only used as an immutable
  // seed reference for the "Modified" indicator.
  const roles = useAppStore((s) => s.roles);
  const users = useAppStore((s) => s.users);
  const updateRolePermission = useAppStore((s) => s.updateRolePermission);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();

  const roleList: Role[] = ROLE_ORDER.map((k) => roles[k]).filter(
    (r): r is Role => Boolean(r)
  );

  const totalRoles = roleList.length;
  const totalPermissions = ALL_PERMISSIONS.length;
  const totalAssignments = users.length;

  // Users-per-role lookup, memoised — derived from the store's users slice.
  const userCountByRole = React.useMemo(() => {
    const map: Partial<Record<RoleKey, number>> = {};
    for (const u of users) {
      map[u.role] = (map[u.role] ?? 0) + 1;
    }
    return map;
  }, [users]);

  // True when the live store permission differs from the seed ROLES baseline.
  // Used to show a "Modified" indicator on the permission cell.
  function isModified(roleKey: RoleKey, permission: Permission): boolean {
    const current = roles[roleKey]?.permissions.includes(permission) ?? false;
    const seed = ROLES[roleKey]?.permissions.includes(permission) ?? false;
    return current !== seed;
  }

  function handleToggle(roleKey: RoleKey, permission: Permission, enabled: boolean) {
    updateRolePermission(roleKey, permission, enabled);
    const roleLabel = roles[roleKey]?.fullName ?? roleKey;
    toast({
      title: enabled ? "Permission enabled" : "Permission disabled",
      description: `${PERMISSION_LABELS[permission]} ${enabled ? "granted to" : "revoked from"} ${roleLabel}.`,
    });
  }

  if (totalRoles === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="Inspect and govern the role-based access control (RBAC) matrix that powers every action across the LTP approval workflow."
          icon={ShieldCheck}
          breadcrumbs={[
            { label: "Administration", onClick: () => navigate("admin-dashboard") },
            { label: "Roles & Permissions" },
          ]}
          badge={
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
            >
              RBAC matrix
            </Badge>
          }
        />
        <EmptyState
          icon={ShieldAlert}
          title="No roles available"
          description="The role registry is empty. Reload the page or contact the IT & e-Governance Cell."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Inspect and govern the role-based access control (RBAC) matrix that powers every action across the LTP approval workflow."
        icon={ShieldCheck}
        breadcrumbs={[
          { label: "Administration", onClick: () => navigate("admin-dashboard") },
          { label: "Roles & Permissions" },
        ]}
        badge={
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
          >
            RBAC matrix
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                title: "Edit mode",
                description:
                  "Toggle any permission switch below to make changes. Every update is recorded in the audit log.",
              })
            }
          >
            <Pencil className="size-4" /> Edit matrix
          </Button>
        }
      />

      {/* KPI row — derived entirely from the store */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Roles"
          value={totalRoles}
          icon={ShieldCheck}
          hint="RBAC configured"
          cls="bg-primary/10 text-primary"
        />
        <KpiCard
          label="Total Permissions"
          value={totalPermissions}
          icon={KeyRound}
          hint="Distinct grants available"
          cls="bg-info/10 text-info"
        />
        <KpiCard
          label="Total Assignments"
          value={totalAssignments}
          icon={UsersIcon}
          hint="Users across all roles"
          cls="bg-success/10 text-success"
        />
      </div>

      {/* Tabs: By Role | Matrix View */}
      <Tabs defaultValue="by-role" className="w-full">
        <TabsList>
          <TabsTrigger value="by-role">
            <Layers className="size-3.5" /> By Role
          </TabsTrigger>
          <TabsTrigger value="matrix">
            <KeyRound className="size-3.5" /> Matrix View
          </TabsTrigger>
        </TabsList>

        {/* ---------------- By Role ---------------- */}
        <TabsContent value="by-role" className="space-y-4">
          {roleList.map((r) => {
            const userCount = userCountByRole[r.key] ?? 0;
            const modifiedCount = ALL_PERMISSIONS.filter((p) =>
              isModified(r.key, p)
            ).length;
            return (
              <Card key={r.key} className="shadow-gov">
                <CardHeader className="flex flex-col gap-2 border-b border-border/60 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                          {r.fullName}
                        </h3>
                        <RoleBadge role={r.key} />
                        <Badge
                          variant="outline"
                          className="bg-muted/60 text-muted-foreground gap-1"
                        >
                          <UsersIcon className="size-3" />
                          {userCount} {userCount === 1 ? "user" : "users"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-muted/60 text-muted-foreground"
                        >
                          Level {r.level}
                        </Badge>
                        {modifiedCount > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
                          >
                            {modifiedCount} modified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Long permission list — vertical scroll with custom scrollbar */}
                  <div className="max-h-96 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="space-y-4">
                      {PERMISSION_CATEGORIES.map((cat) => {
                        const grantedCount = cat.permissions.filter((p) =>
                          r.permissions.includes(p)
                        ).length;
                        return (
                          <div key={cat.name} className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">
                                {cat.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className="bg-muted/60 text-muted-foreground text-[10px]"
                              >
                                {grantedCount}/{cat.permissions.length}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {cat.permissions.map((p) => {
                                const granted = r.permissions.includes(p);
                                const modified = isModified(r.key, p);
                                return (
                                  <div
                                    key={p}
                                    className={cn(
                                      "flex items-center justify-between gap-2 rounded-md border bg-card p-2.5 transition-colors",
                                      granted
                                        ? "border-success/30 bg-success/5"
                                        : "border-border"
                                    )}
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-medium text-foreground truncate">
                                          {PERMISSION_LABELS[p]}
                                        </p>
                                        {modified && (
                                          <Badge
                                            variant="outline"
                                            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 text-[9px] px-1 py-0"
                                          >
                                            Modified
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                                        {p}
                                      </p>
                                    </div>
                                    <Switch
                                      checked={granted}
                                      onCheckedChange={(checked) =>
                                        handleToggle(r.key, p, checked)
                                      }
                                      aria-label={`${granted ? "Disable" : "Enable"} ${PERMISSION_LABELS[p]} for ${r.fullName}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ---------------- Matrix View ---------------- */}
        <TabsContent value="matrix">
          <SectionCard
            title="Permission Matrix"
            description="Compact grid — rows are roles, columns are key permissions. Toggle a switch to grant or revoke. Each change is audit-logged."
            icon={KeyRound}
            noPadding
          >
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-foreground">
                    <th className="min-w-[220px] border-b-2 border-border px-4 py-2.5 font-bold">
                      Role
                    </th>
                    {KEY_PERMISSIONS.map((p) => (
                      <th
                        key={p}
                        className="border-b-2 border-border px-3 py-2.5 text-center font-bold min-w-[120px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-semibold leading-tight">
                            {PERMISSION_LABELS[p]}
                          </span>
                          <span className="font-mono text-[9px] text-muted-foreground">
                            {p}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roleList.map((r) => {
                    const userCount = userCountByRole[r.key] ?? 0;
                    return (
                      <tr key={r.key} className="hover:bg-muted/30">
                        <td className="border-b border-border px-4 py-2.5 align-middle">
                          <div className="flex items-center gap-2">
                            <RoleBadge role={r.key} label={r.title} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {r.fullName}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {userCount} {userCount === 1 ? "user" : "users"} · Level {r.level}
                              </p>
                            </div>
                          </div>
                        </td>
                        {KEY_PERMISSIONS.map((p) => {
                          const granted = r.permissions.includes(p);
                          const modified = isModified(r.key, p);
                          return (
                            <td
                              key={p}
                              className="border-b border-border px-3 py-2.5 text-center align-middle"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <Switch
                                  checked={granted}
                                  onCheckedChange={(checked) =>
                                    handleToggle(r.key, p, checked)
                                  }
                                  aria-label={`${granted ? "Disable" : "Enable"} ${PERMISSION_LABELS[p]} for ${r.fullName}`}
                                />
                                {modified && (
                                  <span
                                    className="inline-block size-1.5 rounded-full bg-amber-500"
                                    aria-label="Modified from seed"
                                    title="Modified from seed"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Role Workflow Bindings — read-only reference (still sourced from
          the immutable WORKFLOW_STAGES config; the store does not yet
          expose runtime overrides for stage ownership beyond the
          `workflowStageOverrides` slice). */}
      <SectionCard
        title="Role Workflow Bindings"
        description="Each role may be the responsible owner of one or more workflow stages. Expand to inspect the stage's allowed actions."
        icon={Workflow}
      >
        <Accordion type="single" collapsible className="w-full">
          {roleList
            .filter((r) => r.key !== "ADMIN")
            .map((r) => {
              const stages = WORKFLOW_STAGES.filter((s) => s.role === r.key);
              return (
                <AccordionItem
                  key={r.key}
                  value={r.key}
                  className="border-b border-border last:border-b-0"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-3 pr-3">
                      <RoleBadge role={r.key} label={r.title} />
                      <span className="text-sm font-medium text-foreground">
                        {r.fullName}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-muted/60 text-muted-foreground"
                      >
                        {stages.length} stage{stages.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {stages.length === 0 ? (
                      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        <ShieldAlert className="size-4" /> This role does not own
                        any workflow stage directly.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {stages.map((s) => (
                          <div
                            key={s.key}
                            className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                                {s.order}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {s.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Next: {s.nextStage ?? "—"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {s.allowedActions.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">
                                  No manual actions
                                </span>
                              ) : (
                                s.allowedActions.map((a) => (
                                  <Badge
                                    key={a}
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 text-[10px]"
                                  >
                                    {WORKFLOW_ACTION_LABELS[a]}
                                  </Badge>
                                ))
                              )}
                              <ChevronRight className="size-3.5 text-muted-foreground" />
                              {s.canRaiseShortfall && (
                                <Badge
                                  variant="outline"
                                  className="bg-warning/15 text-warning-foreground border-warning/40 text-[10px]"
                                >
                                  Can raise shortfall
                                </Badge>
                              )}
                              {s.canApprove && (
                                <Badge
                                  variant="outline"
                                  className="bg-success/10 text-success border-success/30 text-[10px]"
                                >
                                  Can approve
                                </Badge>
                              )}
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
        RBAC changes are versioned and audit-logged. To request a new role or
        permission grant, raise a ticket with the IT &amp; e-Governance Cell.
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  cls,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  cls: string;
}) {
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

export default AdminRoles;
