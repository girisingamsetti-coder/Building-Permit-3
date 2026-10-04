"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import {
  formatDateTime,
  formatDate,
  timeAgo,
} from "@/components/design-system/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users as UsersIcon,
  UserPlus,
  MoreHorizontal,
  Pencil,
  Ban,
  Search,
  CircleCheck,
  CircleSlash,
  Mail,
  MapPin,
  Filter,
  Download,
  KeyRound,
  Trash2,
  Clock,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  UserCheck,
  Lock,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoleKey, User, UserStatus } from "@/types";

// ---------- Helpers ----------

function initials(name: string): string {
  return name
    .replace(/^(Ar\.|Er\.|Dr\.|Shri\.|Smt\.|M\/s)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const STATUS_CFG: Record<UserStatus, { label: string; cls: string; dot: string }> = {
  ACTIVE: {
    label: "Active",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    label: "Inactive",
    cls: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  SUSPENDED: {
    label: "Suspended",
    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    dot: "bg-red-500",
  },
  PENDING: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    dot: "bg-amber-500",
  },
};

function UserStatusBadge({ status }: { status: UserStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", cfg.cls)}>
      <span className={cn("size-1.5 rounded-full", cfg.dot)} aria-hidden="true" />
      {cfg.label}
    </Badge>
  );
}

const ZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "Zone 1", label: "Zone 1" },
  { value: "Zone 2", label: "Zone 2" },
  { value: "Zone 3", label: "Zone 3" },
  { value: "Head Office", label: "Head Office" },
];

const NONE_ZONE = "NONE";

// ---------- Form types ----------

interface AddUserForm {
  name: string;
  email: string;
  phone: string;
  role: RoleKey;
  designation: string;
  zone: string;
  employeeId: string;
  licenseNo: string;
  password?: string;
}

const EMPTY_ADD_FORM: AddUserForm = {
  name: "",
  email: "",
  phone: "",
  role: "LTP",
  designation: "",
  zone: "",
  employeeId: "",
  licenseNo: "",
  password: "demo1234",
};

interface EditUserForm {
  name: string;
  email: string;
  phone: string;
  designation: string;
  zone: string;
  employeeId: string;
  licenseNo: string;
  password?: string;
}

// Normalize the Select zone value: NONE means "no zone" (undefined).
function zoneFromForm(value: string): string | undefined {
  return value && value !== NONE_ZONE ? value : undefined;
}

// ---------- Component ----------

export function AdminUsers() {
  const {
    navigate,
    users,
    roles,
    login,
    createUser,
    updateUser,
    setUserRole,
    activateUser,
    deactivateUser,
    suspendUser,
    deleteUser,
  } = useAppStore();
  const { toast } = useToast();

  // Filter state
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleKey | "ALL">("ALL");
  const [zoneFilter, setZoneFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | UserStatus>("ALL");

  // User details & password modal target
  const [detailTarget, setDetailTarget] = React.useState<User | null>(null);
  const [detailPwVisible, setDetailPwVisible] = React.useState(false);

  // Table password reveal state (per user)
  const [revealedPasswords, setRevealedPasswords] = React.useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${title} copied`,
      description: text,
    });
  };

  // Add dialog
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<AddUserForm>(EMPTY_ADD_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = React.useState<User | null>(null);
  const [editForm, setEditForm] = React.useState<EditUserForm | null>(null);

  // Change-role dialog
  const [roleChangeTarget, setRoleChangeTarget] = React.useState<User | null>(null);
  const [roleChangeRole, setRoleChangeRole] = React.useState<RoleKey>("LTP");
  const [roleChangeReason, setRoleChangeReason] = React.useState("");

  // Suspend dialog
  const [suspendTarget, setSuspendTarget] = React.useState<User | null>(null);
  const [suspendReason, setSuspendReason] = React.useState("");

  // Deactivate dialog
  const [deactivateTarget, setDeactivateTarget] = React.useState<User | null>(null);
  const [deactivateReason, setDeactivateReason] = React.useState("");

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);

  // ---------- Derived KPIs ----------
  const kpis = React.useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "ACTIVE").length,
      suspended: users.filter((u) => u.status === "SUSPENDED").length,
      inactive: users.filter((u) => u.status === "INACTIVE").length,
      pending: users.filter((u) => u.status === "PENDING").length,
    }),
    [users],
  );

  // ---------- Filtered users ----------
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => {
        if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
        if (zoneFilter !== "ALL" && (u.zone ?? "") !== zoneFilter) return false;
        if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          (u.employeeId ?? "").toLowerCase().includes(q) ||
          (u.licenseNo ?? "").toLowerCase().includes(q) ||
          (u.designation ?? "").toLowerCase().includes(q) ||
          (u.zone ?? "").toLowerCase().includes(q) ||
          (u.department ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [users, search, roleFilter, zoneFilter, statusFilter]);

  const hasFilters = search.trim() !== "" || roleFilter !== "ALL" || zoneFilter !== "ALL" || statusFilter !== "ALL";

  function resetFilters() {
    setSearch("");
    setRoleFilter("ALL");
    setZoneFilter("ALL");
    setStatusFilter("ALL");
  }

  // ---------- Add user ----------
  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast({ title: "Missing required fields", description: "Name and email are required." });
      return;
    }
    setSubmitting(true);
    const result = createUser({
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim(),
      role: addForm.role,
      password: addForm.password?.trim() || "demo1234",
      designation: addForm.designation.trim() || undefined,
      zone: zoneFromForm(addForm.zone),
      employeeId: addForm.employeeId.trim() || undefined,
      licenseNo: addForm.licenseNo.trim() || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast({
        title: "Could not create user",
        description: result.error ?? "Unknown error.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "User account created",
      description: `${addForm.name.trim()} added as ${roles[addForm.role].fullName}.`,
    });
    setAddForm(EMPTY_ADD_FORM);
    setAddOpen(false);
  }

  // ---------- Edit user ----------
  function openEdit(u: User) {
    setEditTarget(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone,
      designation: u.designation ?? "",
      zone: u.zone ?? "",
      employeeId: u.employeeId ?? "",
      licenseNo: u.licenseNo ?? "",
      password: u.password ?? "demo1234",
    });
  }

  function closeEdit() {
    setEditTarget(null);
    setEditForm(null);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editForm) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast({ title: "Missing required fields", description: "Name and email are required." });
      return;
    }
    updateUser(editTarget.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      designation: editForm.designation.trim() || undefined,
      zone: zoneFromForm(editForm.zone),
      employeeId: editForm.employeeId.trim() || undefined,
      licenseNo: editForm.licenseNo.trim() || undefined,
      password: editForm.password?.trim() || "demo1234",
    });
    toast({
      title: "User details updated",
      description: `${editForm.name.trim()}'s profile has been saved.`,
    });
    closeEdit();
  }

  // ---------- Activate ----------
  function handleActivate(u: User) {
    activateUser(u.id);
    toast({ title: "User activated", description: `${u.name} can now sign in to the portal.` });
  }

  // ---------- Suspend ----------
  function openSuspend(u: User) {
    setSuspendTarget(u);
    setSuspendReason("");
  }

  function closeSuspend() {
    setSuspendTarget(null);
    setSuspendReason("");
  }

  function handleSuspendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!suspendTarget) return;
    if (!suspendReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for suspension." });
      return;
    }
    suspendUser(suspendTarget.id, suspendReason.trim());
    toast({
      title: "User suspended",
      description: `${suspendTarget.name} can no longer sign in. Reason recorded in the audit log.`,
      variant: "destructive",
    });
    closeSuspend();
  }

  // ---------- Deactivate ----------
  function openDeactivate(u: User) {
    setDeactivateTarget(u);
    setDeactivateReason("");
  }

  function closeDeactivate() {
    setDeactivateTarget(null);
    setDeactivateReason("");
  }

  function handleDeactivateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deactivateTarget) return;
    if (!deactivateReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for deactivation." });
      return;
    }
    deactivateUser(deactivateTarget.id, deactivateReason.trim());
    toast({
      title: "User deactivated",
      description: `${deactivateTarget.name} marked inactive. Reason recorded.`,
    });
    closeDeactivate();
  }

  // ---------- Change role ----------
  function openRoleChange(u: User) {
    setRoleChangeTarget(u);
    setRoleChangeRole(u.role);
    setRoleChangeReason("");
  }

  function closeRoleChange() {
    setRoleChangeTarget(null);
    setRoleChangeReason("");
  }

  function handleRoleChangeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleChangeTarget) return;
    if (roleChangeRole === roleChangeTarget.role) {
      toast({ title: "No change", description: "Selected role is the same as the current role." });
      return;
    }
    setUserRole(roleChangeTarget.id, roleChangeRole, roleChangeReason.trim() || undefined);
    toast({
      title: "Role updated",
      description: `${roleChangeTarget.name} is now ${roles[roleChangeRole].fullName}.`,
    });
    closeRoleChange();
  }

  // ---------- Delete ----------
  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteUser(deleteTarget.id);
    toast({
      title: "User deleted",
      description: `${name} has been removed from the directory.`,
      variant: "destructive",
    });
    setDeleteTarget(null);
  }

  // ---------- Export CSV ----------
  function exportCsv() {
    const headers = [
      "Name", "Email", "Phone", "Role", "Designation", "Zone",
      "Employee ID", "License No", "Status", "Password", "Created", "Last Login",
    ];
    const rows = filtered.map((u) => [
      u.name, u.email, u.phone, u.role, u.designation ?? "", u.zone ?? "",
      u.employeeId ?? "", u.licenseNo ?? "", u.status, u.password ?? "demo1234",
      u.createdAt ?? "", u.lastLogin ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: `${filtered.length} users exported to CSV.` });
  }

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Provision, deactivate and audit every user with portal access — including LTPs, officers and administrators."
        icon={UsersIcon}
        breadcrumbs={[
          { label: "Administration", onClick: () => navigate("admin-dashboard") },
          { label: "User Management" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" /> Export
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setAddForm(EMPTY_ADD_FORM);
                setAddOpen(true);
              }}
            >
              <UserPlus className="size-4" /> Add User
            </Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Users" value={kpis.total} icon={UsersIcon} cls="bg-primary/10 text-primary" />
        <KpiCard label="Active" value={kpis.active} icon={CircleCheck} cls="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
        <KpiCard label="Pending" value={kpis.pending} icon={Clock} cls="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
        <KpiCard label="Inactive" value={kpis.inactive} icon={CircleSlash} cls="bg-muted text-muted-foreground" />
        <KpiCard label="Suspended" value={kpis.suspended} icon={ShieldAlert} cls="bg-red-500/15 text-red-700 dark:text-red-300" />
      </div>

      {/* User directory */}
      <SectionCard
        title="User Directory"
        description="Searchable roster of every registered portal user."
        icon={UsersIcon}
        action={
          <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
            {filtered.length} of {users.length}
          </Badge>
        }
        noPadding
      >
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <Input
              id="user-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, role, zone, designation, ID..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" aria-hidden="true" /> Filters:
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleKey | "ALL")}>
              <SelectTrigger className="w-[160px] h-9 text-xs" aria-label="Filter by role">
                <span className="text-[11px] font-bold text-slate-600 mr-1 shrink-0">Role:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {Object.values(roles).map((r) => (
                  <SelectItem key={r.key} value={r.key}>{r.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={zoneFilter} onValueChange={(v) => setZoneFilter(v)}>
              <SelectTrigger className="w-[140px] h-9 text-xs" aria-label="Filter by zone">
                <span className="text-[11px] font-bold text-slate-600 mr-1 shrink-0">Zone:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="Zone 1">Zone 1</SelectItem>
                <SelectItem value="Zone 2">Zone 2</SelectItem>
                <SelectItem value="Zone 3">Zone 3</SelectItem>
                <SelectItem value="Head Office">Head Office</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | UserStatus)}>
              <SelectTrigger className="w-[130px] h-9 text-xs" aria-label="Filter by status">
                <span className="text-[11px] font-bold text-slate-600 mr-1 shrink-0">Status:</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={resetFilters}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={UsersIcon}
              title={hasFilters ? "No users match your filters" : "No users yet"}
              description={
                hasFilters
                  ? "Try adjusting your search or clearing filters to see more results."
                  : "Use the “Add User” button to provision the first portal account."
              }
            />
          </div>
        ) : (
          <div className="max-h-[640px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="border-b-2 border-border">
                  <TableHead className="w-56 max-w-[220px] pl-4 font-bold text-foreground">Name & Contact</TableHead>
                  <TableHead className="w-36 font-bold text-foreground">Role</TableHead>
                  <TableHead className="w-28 text-center font-bold text-foreground">Status</TableHead>
                  <TableHead className="w-48 max-w-[180px] font-bold text-foreground">Zone & Designation</TableHead>
                  <TableHead className="w-44 font-bold text-foreground">Password / Login</TableHead>
                  <TableHead className="w-28 font-bold text-foreground">Last login</TableHead>
                  <TableHead className="w-28 pr-4 text-right font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="w-56 max-w-[220px] pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="size-9 border border-border cursor-pointer hover:ring-2 hover:ring-[#801824]/30 transition-all shrink-0"
                          onClick={() => {
                            setDetailTarget(u);
                            setDetailPwVisible(false);
                          }}
                          aria-hidden="true"
                        >
                          <AvatarFallback
                            className={cn(
                              "text-xs font-semibold",
                              u.status === "ACTIVE"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {initials(u.name) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailTarget(u);
                              setDetailPwVisible(false);
                            }}
                            className="text-left font-medium text-sm text-foreground hover:text-[#801824] hover:underline transition-colors block truncate"
                          >
                            {u.name}
                          </button>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="size-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{u.email}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(u.email, "Email");
                              }}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy email"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-36 whitespace-nowrap">
                      <RoleBadge role={u.role} label={roles[u.role]?.title ?? u.role} />
                    </TableCell>
                    <TableCell className="w-28 text-center whitespace-nowrap">
                      <UserStatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="w-48 max-w-[180px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-foreground font-medium truncate">
                          <MapPin className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                          <span className="truncate">{u.zone ?? "Head Office"}</span>
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {u.designation ?? u.department ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-44 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-[#FAF4EB] text-[#5C1A20] border border-[#E0D2BE] px-2 py-0.5 rounded-md font-semibold tracking-wider select-all">
                          {revealedPasswords[u.id] ? (u.password || "demo1234") : "••••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleReveal(u.id)}
                          title={revealedPasswords[u.id] ? "Hide password" : "Show password"}
                        >
                          {revealedPasswords[u.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(u.password || "demo1234", "Password")}
                          title="Copy password"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="w-28 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap text-xs text-foreground">
                          {u.lastLogin ? formatDateTime(u.lastLogin) : "—"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {u.lastLogin ? timeAgo(u.lastLogin) : "Never logged in"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-28 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs px-2.5 gap-1 border-[#E0D2BE] hover:bg-[#FAF4EB] text-[#5C1A20]"
                          onClick={() => {
                            setDetailTarget(u);
                            setDetailPwVisible(false);
                          }}
                        >
                          <Eye className="size-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`Actions for ${u.name}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="text-xs text-muted-foreground truncate">
                              {u.name}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => {
                                setDetailTarget(u);
                                setDetailPwVisible(false);
                              }}
                            >
                              <KeyRound className="size-3.5" /> View details & password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[#801824] font-medium"
                              onSelect={() => {
                                const res = login(u.email, u.password || "demo1234");
                                if (res.ok) {
                                  toast({
                                    title: `Switched to ${u.name}`,
                                    description: `Signed in as ${u.role} (${u.email})`,
                                  });
                                }
                              }}
                            >
                              <UserCheck className="size-3.5" /> Login / Switch to user
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                const text = `Email: ${u.email}\nPassword: ${u.password || "demo1234"}`;
                                navigator.clipboard.writeText(text);
                                toast({ title: "Copied credentials", description: "Email & password copied." });
                              }}
                            >
                              <Copy className="size-3.5" /> Copy credentials
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => openEdit(u)}>
                              <Pencil className="size-3.5" /> Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openRoleChange(u)}>
                              <KeyRound className="size-3.5" /> Change role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {u.status !== "ACTIVE" && (
                              <DropdownMenuItem
                                className="text-emerald-600 focus:text-emerald-700"
                                onSelect={() => handleActivate(u)}
                              >
                                <CircleCheck className="size-3.5" /> Activate
                              </DropdownMenuItem>
                            )}
                            {u.status !== "INACTIVE" && (
                              <DropdownMenuItem onSelect={() => openDeactivate(u)}>
                                <CircleSlash className="size-3.5" /> Deactivate
                              </DropdownMenuItem>
                            )}
                            {u.status !== "SUSPENDED" && (
                              <DropdownMenuItem
                                className="text-amber-700 focus:text-amber-800"
                                onSelect={() => openSuspend(u)}
                              >
                                <Ban className="size-3.5" /> Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setDeleteTarget(u)}
                            >
                              <Trash2 className="size-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Help footer */}
      <p className="text-xs text-muted-foreground">
        Need to bulk-import users? Use the standard CSV template — contact{" "}
        <span className="font-medium text-foreground">it-cell@municipality.gov.in</span>{" "}
        for assistance. All user management actions are written to the audit log.
      </p>

      {/* ===== User Details & Password Modal ===== */}
      <Dialog
        open={!!detailTarget}
        onOpenChange={(o) => {
          if (!o) {
            setDetailTarget(null);
            setDetailPwVisible(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          {detailTarget && (
            <>
              <DialogHeader className="pb-2 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border-2 border-[#E0D2BE] shadow-sm">
                      <AvatarFallback className="bg-[#FAF4EB] text-sm font-semibold text-[#5C1A20]">
                        {initials(detailTarget.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        {detailTarget.name}
                        <UserStatusBadge status={detailTarget.status} />
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        {roles[detailTarget.role]?.fullName ?? detailTarget.role} • {detailTarget.designation || "Municipal Officer"}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                {/* Credentials & Login Card */}
                <div className="rounded-lg border-2 border-[#C97A63]/30 bg-gradient-to-br from-[#FAF4EB] to-white p-4 shadow-xs space-y-3 dark:from-stone-900 dark:to-stone-950 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-[#801824] text-white">
                        <Lock className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C1A20] dark:text-stone-300">
                          Login Credentials & Access
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Direct credentials to authenticate into the system as this user
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-mono border-[#C97A63]/40 text-[#801824] bg-white/80 dark:bg-stone-900">
                      {detailTarget.role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Email */}
                    <div className="rounded-md border bg-background/80 p-2.5 space-y-1">
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <Mail className="size-3 text-muted-foreground" /> Email / Username
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          title="Copy email"
                          onClick={() => copyToClipboard(detailTarget.email, "Email")}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                      <div className="font-mono text-xs font-semibold text-foreground select-all break-all">
                        {detailTarget.email}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="rounded-md border bg-background/80 p-2.5 space-y-1">
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <KeyRound className="size-3 text-muted-foreground" /> Password
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-foreground"
                            title={detailPwVisible ? "Hide password" : "Show password"}
                            onClick={() => setDetailPwVisible(!detailPwVisible)}
                          >
                            {detailPwVisible ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-foreground"
                            title="Copy password"
                            onClick={() => copyToClipboard(detailTarget.password || "demo1234", "Password")}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#801824] dark:text-red-400 select-all flex items-center">
                        {detailPwVisible ? (
                          detailTarget.password || "demo1234"
                        ) : (
                          <span className="tracking-widest">••••••••••••</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar inside Credentials Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E0D2BE]/60 dark:border-stone-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => {
                        const text = `Email: ${detailTarget.email}\nPassword: ${detailTarget.password || "demo1234"}`;
                        copyToClipboard(text, "Email and Password");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy Email & Password
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-[#801824] text-white hover:bg-[#5C1A20]"
                      onClick={() => {
                        const res = login(detailTarget.email, detailTarget.password || "demo1234");
                        if (res.ok) {
                          toast({
                            title: `Switched to ${detailTarget.name}`,
                            description: `You are now logged in as ${detailTarget.role} (${detailTarget.email})`,
                          });
                          setDetailTarget(null);
                        }
                      }}
                    >
                      <UserCheck className="size-3.5" /> Switch & Login as this User
                    </Button>
                  </div>
                </div>

                {/* Statutory & Jurisdictional Information */}
                <div className="rounded-lg border bg-card p-3.5 space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Organizational & Statutory Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Role</span>
                      <span className="font-medium text-foreground">{roles[detailTarget.role]?.fullName ?? detailTarget.role}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Designation</span>
                      <span className="font-medium text-foreground">{detailTarget.designation || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Zone / Jurisdiction</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground" />
                        {detailTarget.zone || "Head Office / Central"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Department</span>
                      <span className="font-medium text-foreground">{detailTarget.department || "Town Planning & Building Permissions"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Phone</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Phone className="size-3 text-muted-foreground" />
                        {detailTarget.phone || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Portal Type</span>
                      <span className="font-medium text-foreground">
                        {detailTarget.role === "LTP" ? "EXTERNAL (Architect / LTP)" : "INTERNAL (Department)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System & Identification */}
                <div className="rounded-lg border bg-muted/40 p-3.5 space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    System Identifiers & Activity
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Employee ID</span>
                      <span className="font-mono text-foreground">{detailTarget.employeeId || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">License Number</span>
                      <span className="font-mono text-foreground">{detailTarget.licenseNo || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">System User ID</span>
                      <span className="font-mono text-[11px] text-muted-foreground truncate block" title={detailTarget.id}>
                        {detailTarget.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Last Login</span>
                      <span className="text-foreground">
                        {detailTarget.lastLogin ? formatDateTime(detailTarget.lastLogin) : "Never logged in"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Created Date</span>
                      <span className="text-foreground">
                        {detailTarget.createdAt ? formatDateTime(detailTarget.createdAt) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Status</span>
                      <span className="text-foreground font-medium">{detailTarget.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 border-t flex flex-row items-center justify-between sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const u = detailTarget;
                    setDetailTarget(null);
                    openEdit(u);
                  }}
                  className="gap-1.5"
                >
                  <Pencil className="size-3.5" /> Edit User Profile
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setDetailTarget(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Add User Dialog ===== */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) setAddForm(EMPTY_ADD_FORM);
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create new user</DialogTitle>
            <DialogDescription>
              New users are activated immediately. Fields marked{" "}
              <span className="text-destructive">*</span> are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-name">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Shri. Rakesh Kulkarni"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="name@municipality.gov.in"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={addForm.role}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, role: v as RoleKey }))}
                >
                  <SelectTrigger id="add-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(roles).map((r) => (
                      <SelectItem key={r.key} value={r.key}>
                        {r.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98220 00000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-designation">Designation</Label>
                <Input
                  id="add-designation"
                  value={addForm.designation}
                  onChange={(e) => setAddForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="e.g. Town Planning Supervisor"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-zone">Zone</Label>
                <Select
                  value={addForm.zone || NONE_ZONE}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, zone: v === NONE_ZONE ? "" : v }))}
                >
                  <SelectTrigger id="add-zone">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_ZONE}>—</SelectItem>
                    {ZONE_OPTIONS.map((z) => (
                      <SelectItem key={z.value} value={z.value}>
                        {z.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-employee">Employee ID</Label>
                <Input
                  id="add-employee"
                  value={addForm.employeeId}
                  onChange={(e) => setAddForm((f) => ({ ...f, employeeId: e.target.value }))}
                  placeholder="MUN-XYZ-NNNN"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-license">License No. (LTP only)</Label>
                <Input
                  id="add-license"
                  value={addForm.licenseNo}
                  onChange={(e) => setAddForm((f) => ({ ...f, licenseNo: e.target.value }))}
                  placeholder="LTP-MC-YYYY-NNNN"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-password">
                  Login Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-password"
                  type="text"
                  value={addForm.password ?? "demo1234"}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="demo1234"
                  required
                />
                <p className="text-[11px] text-muted-foreground">Password required for direct login or user switching.</p>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <UserPlus className="size-4" /> {submitting ? "Creating…" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== Edit User Dialog ===== */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) closeEdit(); }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit user details</DialogTitle>
            <DialogDescription>
              {editTarget ? `Update ${editTarget.name}'s profile information.` : ""}
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, name: e.target.value } : f))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, email: e.target.value } : f))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, phone: e.target.value } : f))}
                    placeholder="+91 98220 00000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-designation">Designation</Label>
                  <Input
                    id="edit-designation"
                    value={editForm.designation}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, designation: e.target.value } : f))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-zone">Zone</Label>
                  <Select
                    value={editForm.zone || NONE_ZONE}
                    onValueChange={(v) => setEditForm((f) => (f ? { ...f, zone: v === NONE_ZONE ? "" : v } : f))}
                  >
                    <SelectTrigger id="edit-zone">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_ZONE}>—</SelectItem>
                      {ZONE_OPTIONS.map((z) => (
                        <SelectItem key={z.value} value={z.value}>
                          {z.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-employee">Employee ID</Label>
                  <Input
                    id="edit-employee"
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, employeeId: e.target.value } : f))}
                    placeholder="MUN-XYZ-NNNN"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-license">License No. (LTP only)</Label>
                  <Input
                    id="edit-license"
                    value={editForm.licenseNo}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, licenseNo: e.target.value } : f))}
                    placeholder="LTP-MC-YYYY-NNNN"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-password">
                    Login Password
                  </Label>
                  <Input
                    id="edit-password"
                    type="text"
                    value={editForm.password ?? "demo1234"}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, password: e.target.value } : f))}
                    placeholder="demo1234"
                  />
                  <p className="text-[11px] text-muted-foreground">Password required for direct login or user switching.</p>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Change Role Dialog ===== */}
      <Dialog open={!!roleChangeTarget} onOpenChange={(o) => { if (!o) closeRoleChange(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Change user role</DialogTitle>
            <DialogDescription>
              {roleChangeTarget
                ? `${roleChangeTarget.name} is currently ${roles[roleChangeTarget.role].fullName}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role-new">
                New role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={roleChangeRole}
                onValueChange={(v) => setRoleChangeRole(v as RoleKey)}
              >
                <SelectTrigger id="role-new">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(roles).map((r) => (
                    <SelectItem key={r.key} value={r.key}>
                      {r.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-reason">Reason / remark (optional)</Label>
              <Textarea
                id="role-reason"
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
                placeholder="e.g. Reorganisation of zonal office — officer now reports to Director DP."
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeRoleChange}>
                Cancel
              </Button>
              <Button type="submit">
                <KeyRound className="size-4" /> Apply role change
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== Suspend Dialog ===== */}
      <Dialog open={!!suspendTarget} onOpenChange={(o) => { if (!o) closeSuspend(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Suspend user access</DialogTitle>
            <DialogDescription>
              {suspendTarget
                ? `${suspendTarget.name} will no longer be able to sign in. A reason is required for the audit log.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSuspendSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="suspend-reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="suspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Pending disciplinary inquiry — direction from Commissioner's office."
                rows={3}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeSuspend}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                <Ban className="size-4" /> Suspend access
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== Deactivate Dialog ===== */}
      <Dialog open={!!deactivateTarget} onOpenChange={(o) => { if (!o) closeDeactivate(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Deactivate user</DialogTitle>
            <DialogDescription>
              {deactivateTarget
                ? `Mark ${deactivateTarget.name} as inactive. A reason is required for the audit log.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeactivateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="deact-reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="deact-reason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="e.g. Retirement / transfer to another department."
                rows={3}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDeactivate}>
                Cancel
              </Button>
              <Button type="submit">
                <CircleSlash className="size-4" /> Deactivate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== Delete confirm AlertDialog ===== */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.name} (${deleteTarget.email}) from the directory. This action cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------- Local KPI card (mirrors admin-dashboard style) ----------
function KpiCard({
  label,
  value,
  icon: Icon,
  cls,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  cls: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}>
        <Icon className="size-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default AdminUsers;
