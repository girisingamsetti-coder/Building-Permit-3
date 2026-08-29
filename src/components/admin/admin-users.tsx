"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { USERS, ROLES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { formatDateTime, timeAgo } from "@/components/design-system/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users as UsersIcon,
  UserCheck,
  UserPlus,
  MoreHorizontal,
  Pencil,
  Ban,
  Eye,
  Search,
  ShieldCheck,
  CircleCheck,
  CircleSlash,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Filter,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RoleKey, User } from "@/types";

// Extend the user roster inline with realistic government staff
const EXTRA_USERS: User[] = [
  {
    id: "u-tps-02",
    name: "Shri. Anand Bhalerao",
    role: "TPS",
    email: "anand.bhalerao@municipality.gov.in",
    phone: "+91 98220 90011",
    employeeId: "MUN-TPS-1098",
    designation: "Town Planning Supervisor",
    zone: "Zone III — North",
    avatarColor: "teal",
    department: "Department of Town Planning",
    active: true,
    lastLogin: "2025-01-16T09:22:00",
  },
  {
    id: "u-zad-01",
    name: "Smt. Sneha Patwardhan",
    role: "ZAD",
    email: "sneha.patwardhan@municipality.gov.in",
    phone: "+91 99700 22410",
    employeeId: "MUN-ZAD-0156",
    designation: "Zonal Assistant Director",
    zone: "Zone IV — West",
    avatarColor: "cyan",
    department: "Zonal Office — West",
    active: true,
    lastLogin: "2025-01-15T18:10:00",
  },
  {
    id: "u-addl-01",
    name: "Smt. Lakshmi Menon",
    role: "ADDL_COMMISSIONER",
    email: "lakshmi.menon@municipality.gov.in",
    phone: "+91 98220 77001",
    employeeId: "MUN-ADC-0007",
    designation: "Additional Commissioner",
    zone: "Head Office",
    avatarColor: "rose",
    department: "Office of the Commissioner",
    active: true,
    lastLogin: "2025-01-14T16:40:00",
  },
  {
    id: "u-ltp-02",
    name: "Er. Sandeep Kulkarni",
    role: "LTP",
    email: "sandeep.kulkarni@structengg.in",
    phone: "+91 99230 67180",
    licenseNo: "LTP-MC-2017-0912",
    designation: "Civil Engineer & Licensed Technical Person",
    zone: "Zone II — South",
    avatarColor: "emerald",
    department: "Private Practice",
    active: false,
    lastLogin: "2024-12-22T11:15:00",
  },
];

const ALL_USERS: User[] = [...USERS, ...EXTRA_USERS];

function initials(name: string) {
  return name
    .replace(/^(Ar\.|Er\.|Dr\.|Shri\.|Smt\.|M\/s)\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AdminUsers() {
  const { navigate } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleKey | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [addOpen, setAddOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return ALL_USERS.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !u.active) return false;
      if (statusFilter === "INACTIVE" && u.active) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        (u.licenseNo ?? "").toLowerCase().includes(q) ||
        (u.employeeId ?? "").toLowerCase().includes(q) ||
        (u.zone ?? "").toLowerCase().includes(q)
      );
    }).sort((a, b) => (b.lastLogin ?? "").localeCompare(a.lastLogin ?? ""));
  }, [search, roleFilter, statusFilter]);

  const stats = {
    total: ALL_USERS.length,
    active: ALL_USERS.filter((u) => u.active).length,
    ltps: ALL_USERS.filter((u) => u.role === "LTP").length,
    officers: ALL_USERS.filter((u) => u.role !== "LTP" && u.role !== "ADMIN").length,
  };

  function handleAction(action: string, u: User) {
    toast({
      title: `${action} — ${u.name}`,
      description: action === "Suspend"
        ? "User access has been suspended. Audit event logged."
        : action === "Activate"
          ? "User access has been restored."
          : "Action queued for confirmation.",
    });
  }

  function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddOpen(false);
    toast({
      title: "User account created",
      description: "Invitation email sent. The new user will appear in the directory upon activation.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Provision, deactivate and audit every user with portal access — including LTPs, officers and administrators."
        icon={UsersIcon}
        breadcrumbs={[{ label: "Administration" }, { label: "User Management" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started", description: "User directory is being exported to CSV." })}>
              <Download className="size-4" /> Export
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="size-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Create new user</DialogTitle>
                  <DialogDescription>
                    New users receive an activation email. Fields marked <span className="text-destructive">*</span> are required.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
                      <Input id="name" placeholder="e.g. Shri. Rakesh Kulkarni" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input id="email" type="email" placeholder="name@municipality.gov.in" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                      <Select defaultValue="LTP">
                        <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.values(ROLES).map((r) => (
                            <SelectItem key={r.key} value={r.key}>{r.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+91 98220 00000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="zone">Zone</Label>
                      <Select defaultValue="ZONE_IV_W">
                        <SelectTrigger id="zone"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ZONE_I_E">Zone I — East</SelectItem>
                          <SelectItem value="ZONE_II_S">Zone II — South</SelectItem>
                          <SelectItem value="ZONE_III_N">Zone III — North</SelectItem>
                          <SelectItem value="ZONE_IV_W">Zone IV — West</SelectItem>
                          <SelectItem value="HO">Head Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="license">License / Employee ID</Label>
                      <Input id="license" placeholder="LTP-MC-YYYY-NNNN or MUN-XYZ-NNNN" />
                    </div>
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button type="submit">
                      <UserPlus className="size-4" /> Create user
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Users" value={stats.total} icon={UsersIcon} accent="primary" />
        <StatCard label="Active" value={stats.active} icon={UserCheck} accent="success" />
        <StatCard label="LTPs" value={stats.ltps} icon={Briefcase} accent="amber" />
        <StatCard label="Officers" value={stats.officers} icon={ShieldCheck} accent="info" />
      </div>

      {/* Filter bar + table */}
      <SectionCard
        title="User Directory"
        description="Searchable roster of every registered portal user."
        icon={UsersIcon}
        action={
          <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
            {filtered.length} of {ALL_USERS.length}
          </Badge>
        }
        noPadding
      >
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, license, employee ID or zone…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" /> Filters:
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleKey | "ALL")}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                {Object.values(ROLES).map((r) => (
                  <SelectItem key={r.key} value={r.key}>{r.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | "ACTIVE" | "INACTIVE")}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setRoleFilter("ALL"); setStatusFilter("ALL"); }}>
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
              title="No users match your filters"
              description="Try adjusting your search or clearing filters to see more results."
            />
          </div>
        ) : (
          <div className="max-h-[640px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email / Phone</TableHead>
                  <TableHead>License / Emp. ID</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-border">
                          <AvatarFallback className={cn("text-xs font-semibold", u.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} label={ROLES[u.role].title} /></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-foreground"><Mail className="size-3 text-muted-foreground" /> {u.email}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3" /> {u.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{u.licenseNo ?? u.employeeId ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                        <MapPin className="size-3 text-muted-foreground" />
                        {u.zone ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {u.active ? (
                        <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                          <CircleCheck className="size-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground border-border">
                          <CircleSlash className="size-3" /> Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">{u.lastLogin ? formatDateTime(u.lastLogin) : "—"}</span>
                        <span className="text-[11px] text-muted-foreground">{u.lastLogin ? timeAgo(u.lastLogin) : "Never logged in"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleAction("View", u)}>
                            <Eye className="size-3.5" /> View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleAction("Edit", u)}>
                            <Pencil className="size-3.5" /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {u.active ? (
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleAction("Suspend", u)}>
                              <Ban className="size-3.5" /> Suspend access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-emerald-600 focus:text-emerald-700" onSelect={() => handleAction("Activate", u)}>
                              <CircleCheck className="size-3.5" /> Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        Need to bulk-import users? Use the standard CSV template — contact <span className="font-medium text-foreground">it-cell@municipality.gov.in</span> for assistance. All user management actions are written to the audit log.
      </p>
    </div>
  );
}

export default AdminUsers;
