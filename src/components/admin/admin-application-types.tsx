"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  FileCog,
  Plus,
  Pencil,
  MoreHorizontal,
  CircleCheck,
  CircleSlash,
  Power,
  PowerOff,
  Building2,
  LayoutGrid,
  KeyRound,
  FileText,
  Archive,
  Trash2,
  Info,
  Search,
  ArrowDownUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  ApplicationStatus,
  ApplicationType,
  ApplicationTypeConfig,
} from "@/types";

// ============================================================
// Application Type Configuration
// Reads applicationTypes + applications from the Zustand store
// and wires the toggle / edit actions to the real store actions
// (toggleApplicationType, updateApplicationType). The "Add" button
// is intentionally disabled with a tooltip — the store has no
// createApplicationType action because new types require a
// schema change (the ApplicationType union would need extending).
// ============================================================

// Decorative icon per known ApplicationType key (purely visual; the
// store's ApplicationTypeConfig has no icon field so we map locally).
const TYPE_ICONS: Record<ApplicationType, React.ComponentType<{ className?: string }>> = {
  BUILDING_PERMISSION: Building2,
  LAYOUT_APPROVAL: LayoutGrid,
  OCCUPANCY_CERTIFICATE: KeyRound,
  REVISION_PERMISSION: FileText,
  DEVELOPMENT_PERMIT: Archive,
  DEMOLITION_PERMIT: Trash2,
};

function iconFor(key: ApplicationType): React.ComponentType<{ className?: string }> {
  return TYPE_ICONS[key] ?? FileCog;
}

// Coarse bucketing of ApplicationStatus for per-type stats.
type StatusBucket = "approved" | "inProgress" | "rejected";

function bucketFor(status: ApplicationStatus): StatusBucket {
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED" || status === "RETURNED") return "rejected";
  return "inProgress";
}

interface TypeStats {
  total: number;
  approved: number;
  inProgress: number;
  rejected: number;
}

function emptyStats(): TypeStats {
  return { total: 0, approved: 0, inProgress: 0, rejected: 0 };
}

// Editable form fields — matches the store's updateApplicationType
// signature exactly (name / description / typicalDuration).
interface EditForm {
  name: string;
  description: string;
  typicalDuration: string;
}

type FilterTab = "all" | "active" | "inactive";
type SortKey = "name-asc" | "name-desc" | "apps-desc" | "apps-asc" | "status-active-first";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "apps-desc", label: "Applications (most first)" },
  { value: "apps-asc", label: "Applications (fewest first)" },
  { value: "status-active-first", label: "Status (active first)" },
];

export function AdminApplicationTypes() {
  const { toast } = useToast();
  const applicationTypes = useAppStore((s) => s.applicationTypes);
  const applications = useAppStore((s) => s.applications);
  const toggleApplicationType = useAppStore((s) => s.toggleApplicationType);
  const updateApplicationType = useAppStore((s) => s.updateApplicationType);
  const navigate = useAppStore((s) => s.navigate);

  // ---- UI state ----
  const [tab, setTab] = React.useState<FilterTab>("all");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("name-asc");
  const [editTarget, setEditTarget] = React.useState<ApplicationTypeConfig | null>(null);
  const [editForm, setEditForm] = React.useState<EditForm>({ name: "", description: "", typicalDuration: "" });
  const [saving, setSaving] = React.useState(false);

  function openEdit(t: ApplicationTypeConfig) {
    setEditTarget(t);
    setEditForm({ name: t.name, description: t.description, typicalDuration: t.typicalDuration });
  }

  function closeEdit() {
    setEditTarget(null);
    setEditForm({ name: "", description: "", typicalDuration: "" });
  }

  // ---- Per-type stats derived from store applications ----
  const statsByKey = React.useMemo(() => {
    const map = new Map<ApplicationType, TypeStats>();
    for (const t of applicationTypes) map.set(t.key, emptyStats());
    for (const a of applications) {
      const s = map.get(a.project.type);
      if (!s) continue;
      s.total += 1;
      s[bucketFor(a.status)] += 1;
    }
    return map;
  }, [applicationTypes, applications]);

  function statsFor(key: ApplicationType): TypeStats {
    return statsByKey.get(key) ?? emptyStats();
  }

  // ---- KPI cards derived from store ----
  const totalTypes = applicationTypes.length;
  const activeTypes = applicationTypes.filter((t) => t.active).length;
  const inactiveTypes = totalTypes - activeTypes;
  const applicationsUsingTypes = applications.length;

  // ---- Filtered + sorted rows ----
  const visibleTypes = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = applicationTypes.filter((t) => {
      if (tab === "active" && !t.active) return false;
      if (tab === "inactive" && t.active) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
    rows = [...rows].sort((a, b) => {
      const aTotal = (statsByKey.get(a.key) ?? emptyStats()).total;
      const bTotal = (statsByKey.get(b.key) ?? emptyStats()).total;
      switch (sort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "apps-desc": return bTotal - aTotal;
        case "apps-asc": return aTotal - bTotal;
        case "status-active-first": return (a.active === b.active) ? 0 : a.active ? -1 : 1;
        default: return 0;
      }
    });
    return rows;
  }, [applicationTypes, tab, search, sort, statsByKey]);

  // ---- Action handlers (real store wiring) ----
  function handleToggle(t: ApplicationTypeConfig) {
    const next = !t.active;
    toggleApplicationType(t.key, next);
    toast({
      title: next ? "Application type activated" : "Application type deactivated",
      description: `${t.name} is now ${next ? "available to applicants" : "hidden from new applications"}.`,
    });
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    const name = editForm.name.trim();
    const description = editForm.description.trim();
    const typicalDuration = editForm.typicalDuration.trim();
    if (!name || !description || !typicalDuration) {
      toast({
        title: "Missing fields",
        description: "Name, description and typical duration are all required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    // Brief perceptible delay so the saving state is visible and to
    // guard against double-submit. The store mutation is synchronous.
    setTimeout(() => {
      updateApplicationType(editTarget.key, { name, description, typicalDuration });
      setSaving(false);
      toast({
        title: "Application type updated",
        description: `${name} — changes saved and audit-logged.`,
      });
      closeEdit();
    }, 200);
  }

  const editDirty =
    !!editTarget &&
    (editForm.name !== editTarget.name ||
      editForm.description !== editTarget.description ||
      editForm.typicalDuration !== editTarget.typicalDuration);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Types"
        description="Manage the application types available to applicants. Toggle availability and edit display metadata. Adding new types requires a schema change."
        icon={FileCog}
        breadcrumbs={[{ label: "Administration", onClick: () => navigate("admin-dashboard") }, { label: "Application Types" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">Configurable</Badge>}
        actions={
          // The store has no createApplicationType action because the
          // ApplicationType union would need extending (schema change).
          // Button is disabled with an explanatory tooltip — honest UI.
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button size="sm" disabled aria-label="Add application type — disabled">
                  <Plus className="size-4" /> Add Application Type
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-center">
              Adding new application types requires a schema change — contact engineering.
            </TooltipContent>
          </Tooltip>
        }
      />

      {/* KPI cards — all derived from the store */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Total Types" value={totalTypes} icon={FileCog} hint="Configured in store" cls="bg-primary/10 text-primary" />
        <KpiCard label="Active Types" value={activeTypes} icon={CircleCheck} hint="Available to applicants" cls="bg-success/10 text-success" />
        <KpiCard label="Inactive Types" value={inactiveTypes} icon={CircleSlash} hint="Hidden from new applications" cls="bg-muted text-muted-foreground" />
        <KpiCard label="Applications Using Types" value={applicationsUsingTypes} icon={LayoutGrid} hint={`Across ${activeTypes} active types`} cls="bg-info/10 text-info" />
      </div>

      {/* Main configuration table */}
      <SectionCard
        title="Application Type Configuration"
        description="Toggle availability or edit display metadata. Changes are persisted to the store and audit-logged."
        icon={FileCog}
        noPadding
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)} className="w-full">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 lg:w-auto">
              <TabsTrigger value="all" className="text-xs">All ({totalTypes})</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Active ({activeTypes})</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs">Inactive ({inactiveTypes})</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, key, description…"
                  className="h-8 w-56 pl-8 text-xs"
                  aria-label="Search application types"
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-8 w-48 text-xs" aria-label="Sort application types">
                  <ArrowDownUp className="size-3.5" aria-hidden="true" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(["all", "active", "inactive"] as const).map((t) => (
            <TabsContent key={t} value={t} className="m-0">
              <div className="max-h-96 overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                {visibleTypes.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={FileCog}
                      title={
                        t === "active"
                          ? "No active application types"
                          : t === "inactive"
                            ? "No inactive application types"
                            : search.trim()
                              ? "No application types match your search"
                              : "No application types configured"
                      }
                      description={
                        t === "inactive"
                          ? "All configured application types are currently active."
                          : search.trim()
                            ? "Try a different search term or clear the search."
                            : "Application types will appear here once they are seeded into the store."
                      }
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow className="border-b-2">
                        <TableHead className="font-bold text-foreground">Name</TableHead>
                        <TableHead className="font-bold text-foreground">Key</TableHead>
                        <TableHead className="font-bold text-foreground">Description</TableHead>
                        <TableHead className="font-bold text-foreground">Typical Duration</TableHead>
                        <TableHead className="font-bold text-foreground">Status</TableHead>
                        <TableHead className="font-bold text-foreground">Applications</TableHead>
                        <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleTypes.map((type) => {
                        const Icon = iconFor(type.key);
                        const stats = statsFor(type.key);
                        return (
                          <TableRow key={type.key}>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                    type.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                  )}
                                  aria-hidden="true"
                                >
                                  <Icon className="size-4" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{type.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-[11px] text-muted-foreground">{type.key}</span>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="line-clamp-2 text-xs text-muted-foreground">{type.description}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-muted/60 text-muted-foreground">{type.typicalDuration}</Badge>
                            </TableCell>
                            <TableCell>
                              {type.active ? (
                                <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                                  <CircleCheck className="size-3" /> Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground">
                                  <CircleSlash className="size-3" /> Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {stats.total === 0 ? (
                                <span className="text-xs text-muted-foreground">—</span>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium tabular-nums text-foreground">{stats.total}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {stats.approved} approved · {stats.inProgress} in progress · {stats.rejected} rejected
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={`Actions for ${type.name}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuLabel className="text-xs text-muted-foreground">{type.name}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => handleToggle(type)}>
                                    {type.active ? (
                                      <>
                                        <PowerOff className="size-3.5" /> Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Power className="size-3.5" /> Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => openEdit(type)}>
                                    <Pencil className="size-3.5" /> Edit details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SectionCard>

      {/* Honesty callout — explains what persists vs what's disabled */}
      <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
          <Info className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Toggle &amp; edit persist to the store</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Activating, deactivating and editing application type metadata call the real store actions
            (<span className="font-mono text-[11px] text-foreground">toggleApplicationType</span> /{" "}
            <span className="font-mono text-[11px] text-foreground">updateApplicationType</span>) and are
            recorded in the admin audit log. Adding new application types requires a schema change — the{" "}
            <span className="font-medium text-foreground">Add Application Type</span> button is therefore
            disabled.
          </p>
        </div>
      </div>

      {/* Edit Dialog — wired to updateApplicationType */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) closeEdit(); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit application type</DialogTitle>
            <DialogDescription>
              Update the display metadata for{" "}
              <span className="font-medium text-foreground">{editTarget?.name}</span>. Changes are
              persisted to the store and audit-logged.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="at-name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="at-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Building Permission"
                required
                maxLength={80}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="at-desc">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="at-desc"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description shown to applicants and officers."
                rows={3}
                required
                maxLength={280}
              />
              <p className="text-[10px] text-muted-foreground">{editForm.description.length}/280</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="at-dur">Typical Duration <span className="text-destructive">*</span></Label>
              <Input
                id="at-dur"
                value={editForm.typicalDuration}
                onChange={(e) => setEditForm((f) => ({ ...f, typicalDuration: e.target.value }))}
                placeholder="e.g. 30 days"
                required
                maxLength={32}
                autoComplete="off"
              />
              <p className="text-[10px] text-muted-foreground">Free-form text shown as the SLA expectation.</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="at-active" className="text-xs">Currently {editTarget?.active ? "Active" : "Inactive"}</Label>
                <p className="text-[11px] text-muted-foreground">Toggle availability from the row menu (Deactivate / Activate).</p>
              </div>
              <Switch
                id="at-active"
                checked={editTarget?.active ?? false}
                disabled
                aria-label="Active state — read-only; toggle via the row menu"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeEdit} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !editDirty || !editForm.name.trim() || !editForm.description.trim() || !editForm.typicalDuration.trim()}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- KPI card (kept local to match admin-dashboard / admin-audit pattern) ----------
function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  cls,
}: {
  label: string;
  value: string | number;
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

export default AdminApplicationTypes;
