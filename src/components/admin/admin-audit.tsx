"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAllAuditLogs } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { formatDateTime } from "@/components/design-system/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Search,
  Download,
  CalendarClock,
  Users as UsersIcon,
  AlertOctagon,
  Activity,
  Filter,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminAuditEntry, AuditEntry, RoleKey } from "@/types";

// Unified audit entry for display (merges app-scoped + admin-scoped)
interface UnifiedAuditEntry extends AuditEntry {
  targetType?: string;
  oldValue?: string;
  newValue?: string;
}

export function AdminAudit() {
  const { navigate, adminAuditLog } = useAppStore();
  const appAudit = useAllAuditLogs();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [range, setRange] = React.useState<"24h" | "7d" | "30d" | "all">("all");
  const [roleFilter, setRoleFilter] = React.useState<RoleKey | "ALL">("ALL");
  const [actionFilter, setActionFilter] = React.useState("ALL");
  const [entityFilter, setEntityFilter] = React.useState("ALL");
  const [tab, setTab] = React.useState<"all" | "admin" | "application">("all");

  // Merge admin audit log + application audit log into one feed
  const allAudit: UnifiedAuditEntry[] = React.useMemo(() => {
    const adminEntries: UnifiedAuditEntry[] = adminAuditLog.map((e) => ({ ...e }));
    const appEntries: UnifiedAuditEntry[] = appAudit.map((e) => ({ ...e, targetType: "Application" }));
    const merged = [...adminEntries, ...appEntries];
    return merged.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [adminAuditLog, appAudit]);

  // Derive action/entity lists from real data
  const allActions = Array.from(new Set(allAudit.map((e) => e.action))).sort();
  const allEntities = Array.from(new Set(allAudit.map((e) => e.targetType ?? e.entity))).sort();

  const filtered = React.useMemo(() => {
    return allAudit.filter((e) => {
      if (tab === "admin" && !adminAuditLog.some((a) => a.id === e.id)) return false;
      if (tab === "application" && adminAuditLog.some((a) => a.id === e.id)) return false;
      if (actionFilter !== "ALL" && e.action !== actionFilter) return false;
      if (entityFilter !== "ALL" && e.entity !== entityFilter && e.targetType !== entityFilter) return false;
      if (roleFilter !== "ALL" && e.role !== roleFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        e.user.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        (e.ip ?? "").toLowerCase().includes(q)
      );
    });
  }, [allAudit, search, range, roleFilter, actionFilter, entityFilter, tab, adminAuditLog]);

  const today = new Date().toISOString().slice(0, 10);
  const todaysEvents = allAudit.filter((e) => e.timestamp.startsWith(today)).length;
  const adminEvents = adminAuditLog.length;
  const appEvents = appAudit.length;

  function exportCsv() {
    const headers = ["Timestamp", "User", "Role", "Action", "Entity", "Entity ID", "Old Value", "New Value", "IP", "Device"];
    const rows = filtered.map((e) => [
      e.timestamp, e.user, e.role, e.action, e.targetType ?? e.entity, e.entityId,
      e.oldValue ?? e.oldStatus ?? "", e.newValue ?? e.newStatus ?? "", e.ip ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: `${filtered.length} entries exported to CSV.` });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Every administrative and application action is recorded here. Filter, search and export the complete event history."
        icon={History}
        breadcrumbs={[{ label: "Administration", onClick: () => navigate("admin-dashboard") }, { label: "Audit Logs" }]}
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Total Events" value={allAudit.length} icon={History} cls="bg-primary/10 text-primary" />
        <KpiCard label="Today" value={todaysEvents} icon={CalendarClock} cls="bg-info/10 text-info" />
        <KpiCard label="Admin Actions" value={adminEvents} icon={ShieldCheck2} cls="bg-warning/15 text-warning-foreground" />
        <KpiCard label="Application Events" value={appEvents} icon={Activity} cls="bg-success/10 text-success" />
      </div>

      <SectionCard title="Audit Feed" description={`${filtered.length} of ${allAudit.length} events`} icon={History} noPadding
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, action, ID…" className="h-8 w-52 pl-8 text-xs" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Actions</SelectItem>
                {allActions.map((a) => (
                  <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Entities</SelectItem>
                {allEntities.map((e) => (
                  <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-4 py-2">
          {(["all", "admin", "application"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t === "all" ? "All Events" : t === "admin" ? "Admin Actions" : "Application Events"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState icon={History} title="No audit events" description="No events match your filters. Perform administrative actions to generate audit entries." />
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                <tr className="text-left text-[11px] uppercase tracking-wide text-foreground">
                  <th className="px-4 py-2.5 font-bold">Timestamp</th>
                  <th className="px-4 py-2.5 font-bold">Actor</th>
                  <th className="px-4 py-2.5 font-bold">Action</th>
                  <th className="px-4 py-2.5 font-bold">Target</th>
                  <th className="px-4 py-2.5 font-bold">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={`${e.id}-${e.timestamp}`} className="hover:bg-muted/30 align-top">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(e.timestamp)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium">{e.user}</p>
                      <RoleBadge role={e.role} />
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium">{e.action}</p>
                      <Badge variant="outline" className="text-[9px]">{e.targetType ?? e.entity}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{e.entityId}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {e.oldValue && e.newValue ? (
                        <span><span className="text-destructive">{e.oldValue}</span> → <span className="text-success">{e.newValue}</span></span>
                      ) : e.newValue ? (
                        <span className="text-success">→ {e.newValue}</span>
                      ) : e.oldStatus && e.newStatus ? (
                        <span><span className="text-destructive">{e.oldStatus}</span> → <span className="text-success">{e.newStatus}</span></span>
                      ) : e.remarks ? (
                        <span className="text-muted-foreground">{e.remarks}</span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, cls }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ShieldCheck2({ className }: { className?: string }) {
  return <ShieldCheck className={className} />;
}

// Lucide icons used
import { ShieldCheck } from "lucide-react";
