"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { APPLICATIONS, USERS, ROLES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { AuditTimeline, formatDateTime } from "@/components/design-system/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  Search,
  Download,
  ListTree,
  Table as TableIcon,
  CalendarClock,
  Users as UsersIcon,
  AlertOctagon,
  Activity,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AuditEntry, RoleKey } from "@/types";

// ---------- Build a comprehensive audit feed ----------
const ADMIN_EXTRAS: AuditEntry[] = [
  { id: "ax-1", user: "Shri. Kailash Patil", role: "ADMIN", action: "Created user account", entity: "User", entityId: "u-tps-02", timestamp: "2025-01-16T08:42:00", ip: "10.0.0.55", device: "Edge / Windows" },
  { id: "ax-2", user: "Shri. Kailash Patil", role: "ADMIN", action: "Updated fee structure", entity: "FeeStructure", entityId: "fs-bp-res-2025", timestamp: "2025-01-16T09:05:00", oldStatus: "Active", newStatus: "Active", ip: "10.0.0.55", device: "Edge / Windows" },
  { id: "ax-3", user: "Shri. Kailash Patil", role: "ADMIN", action: "Disabled SMS template", entity: "SmsTemplate", entityId: "t9", timestamp: "2025-01-16T09:20:00", oldStatus: "Active", newStatus: "Inactive", ip: "10.0.0.55", device: "Edge / Windows" },
  { id: "ax-4", user: "Shri. Kailash Patil", role: "ADMIN", action: "Exported audit log (CSV)", entity: "AuditLog", entityId: "export-2025-0142", timestamp: "2025-01-16T10:11:00", ip: "10.0.0.55", device: "Edge / Windows" },
  { id: "ax-5", user: "Shri. Kailash Patil", role: "ADMIN", action: "Updated role permissions", entity: "Role", entityId: "ZJD", timestamp: "2025-01-16T11:30:00", ip: "10.0.0.55", device: "Edge / Windows" },
  { id: "ax-6", user: "Shri. Kailash Patil", role: "ADMIN", action: "Failed login attempt blocked", entity: "User", entityId: "unknown@example.in", timestamp: "2025-01-15T23:14:00", ip: "203.21.58.99", device: "Unknown" },
  { id: "ax-7", user: "Shri. Kailash Patil", role: "ADMIN", action: "Maintenance mode toggled OFF", entity: "System", entityId: "maintenance", timestamp: "2025-01-15T18:00:00", oldStatus: "ON", newStatus: "OFF", ip: "10.0.0.55", device: "Edge / Windows" },
];

function buildAllAudit(): AuditEntry[] {
  const fromApps = APPLICATIONS.flatMap((a) => a.auditLog);
  const merged = [...fromApps, ...ADMIN_EXTRAS];
  const seen = new Set<string>();
  const deduped = merged.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  return deduped.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

const ALL_ACTIONS = Array.from(new Set(buildAllAudit().map((e) => e.action)));
const ALL_ENTITIES = Array.from(new Set(buildAllAudit().map((e) => e.entity)));

export function AdminAudit() {
  const { navigate } = useAppStore();
  const { toast } = useToast();
  const [view, setView] = React.useState<"timeline" | "table">("timeline");
  const [search, setSearch] = React.useState("");
  const [range, setRange] = React.useState<"24h" | "7d" | "30d" | "all">("all");
  const [roleFilter, setRoleFilter] = React.useState<RoleKey | "ALL">("ALL");
  const [actionFilter, setActionFilter] = React.useState<string>("ALL");
  const [entityFilter, setEntityFilter] = React.useState<string>("ALL");

  const allAudit = React.useMemo(() => buildAllAudit(), []);

  const filtered = React.useMemo(() => {
    const now = Date.now();
    const rangeMs: Record<string, number> = {
      "24h": 86400000,
      "7d": 7 * 86400000,
      "30d": 30 * 86400000,
      all: Number.MAX_SAFE_INTEGER,
    };
    const cutoff = now - rangeMs[range];
    return allAudit.filter((e) => {
      const ts = new Date(e.timestamp).getTime();
      if (!isNaN(ts) && ts < cutoff) return false;
      if (roleFilter !== "ALL" && e.role !== roleFilter) return false;
      if (actionFilter !== "ALL" && e.action !== actionFilter) return false;
      if (entityFilter !== "ALL" && e.entity !== entityFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        e.user.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        (e.ip ?? "").toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q)
      );
    });
  }, [allAudit, range, roleFilter, actionFilter, entityFilter, search]);

  const stats = {
    total: allAudit.length,
    today: allAudit.filter((e) => e.timestamp.startsWith("2025-01-16")).length,
    uniqueUsers: new Set(allAudit.map((e) => e.user)).size,
    failed: allAudit.filter((e) => e.action.toLowerCase().includes("failed") || e.action.toLowerCase().includes("block")).length,
  };

  function exportCsv() {
    toast({
      title: "Export started",
      description: `Exporting ${filtered.length} audit events to CSV. A download link will appear shortly.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable, searchable record of every action performed across the portal — by users, officers, system services and administrators."
        icon={History}
        breadcrumbs={[{ label: "Administration" }, { label: "Audit Logs" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">Append-only</Badge>}
        actions={
          <>
            <Tabs value={view} onValueChange={(v) => setView(v as "timeline" | "table")}>
              <TabsList className="bg-muted/40">
                <TabsTrigger value="timeline" className="gap-1.5"><ListTree className="size-3.5" /> Timeline</TabsTrigger>
                <TabsTrigger value="table" className="gap-1.5"><TableIcon className="size-3.5" /> Table</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" /> Export CSV
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Events" value={stats.total.toLocaleString("en-IN")} icon={History} accent="primary" />
        <StatCard label="Today's Events" value={stats.today} icon={CalendarClock} accent="info" />
        <StatCard label="Unique Users" value={stats.uniqueUsers} icon={UsersIcon} accent="success" />
        <StatCard label="Failed / Blocked" value={stats.failed} icon={AlertOctagon} accent="destructive" />
      </div>

      {/* Filter bar */}
      <SectionCard
        title="Filters"
        icon={Filter}
        action={<Badge variant="outline" className="bg-muted/60 text-muted-foreground">{filtered.length} of {allAudit.length} events</Badge>}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, action, entity ID or IP…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as "24h" | "7d" | "30d" | "all")}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleKey | "ALL")}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                {Object.values(ROLES).map((r) => (
                  <SelectItem key={r.key} value={r.key}>{r.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All actions</SelectItem>
                {ALL_ACTIONS.sort().map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All entities</SelectItem>
                {ALL_ENTITIES.sort().map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || range !== "all" || roleFilter !== "ALL" || actionFilter !== "ALL" || entityFilter !== "ALL") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setRange("all"); setRoleFilter("ALL"); setActionFilter("ALL"); setEntityFilter("ALL"); }}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* View */}
      {filtered.length === 0 ? (
        <SectionCard title="No matching events" icon={Activity}>
          <EmptyState
            icon={History}
            title="No audit events match your filters"
            description="Try widening the time range or clearing filters to see more events."
          />
        </SectionCard>
      ) : view === "timeline" ? (
        <SectionCard
          title="Audit Timeline"
          description={`${filtered.length} events — newest first.`}
          icon={ListTree}
        >
          <ScrollArea className="max-h-[680px] pr-3">
            <AuditTimeline entries={filtered} />
          </ScrollArea>
        </SectionCard>
      ) : (
        <SectionCard
          title="Audit Table"
          description={`${filtered.length} events — newest first.`}
          icon={TableIcon}
          noPadding
        >
          <div className="max-h-[680px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="pl-5">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status change</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="pr-5">Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-5">
                      <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(e.timestamp)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{e.user}</span>
                    </TableCell>
                    <TableCell><RoleBadge role={e.role} label={ROLES[e.role].title} /></TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{e.action}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">{e.entity}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{e.entityId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {e.oldStatus || e.newStatus ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px]">
                          {e.oldStatus && <span className="text-muted-foreground">{e.oldStatus}</span>}
                          {e.oldStatus && e.newStatus && <ChevronRight className="size-3 text-muted-foreground" />}
                          {e.newStatus && <span className="font-medium text-foreground">{e.newStatus}</span>}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><span className="font-mono text-xs">{e.ip ?? "—"}</span></TableCell>
                    <TableCell className="pr-5"><span className="text-xs text-muted-foreground">{e.device ?? "—"}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="size-3.5" />
          Audit logs are retained for 7 years in line with the State e-Governance Data Retention Policy.
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("admin-settings")}>
          Configure retention
        </Button>
      </div>
    </div>
  );
}

export default AdminAudit;
