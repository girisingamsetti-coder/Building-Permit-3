"use client";
import * as React from "react";
import { useAppStore, useAllShortfalls } from "@/store/app-store";
import { PageHeader, SectionCard, EmptyState } from "@/components/design-system/layout";
import { ShortfallStatusBadge, ShortfallTypeBadge, RoleBadge } from "@/components/design-system/badges";
import { formatDate, timeAgo } from "@/components/design-system/workflow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search } from "lucide-react";

export function OfficerShortfalls() {
  const user = useAppStore((s) => s.user);
  const allShortfalls = useAllShortfalls();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const shortfalls = React.useMemo(() => {
    return allShortfalls.filter((sf) => {
      if (statusFilter !== "ALL" && sf.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return sf.title.toLowerCase().includes(q) || sf.applicationNo.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allShortfalls, search, statusFilter]);

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="Shortfalls"
        description="All shortfalls raised across your assigned applications."
        icon={AlertTriangle}
      />
      <SectionCard>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search shortfalls…"
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="REOPENED">Reopened</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {shortfalls.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No shortfalls" description="No shortfalls match your current filters." />
        ) : (
          <div className="space-y-2">
            {shortfalls.map((sf) => (
              <div key={sf.id} className="rounded-lg border border-border p-3 text-sm space-y-1 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-medium text-xs">{sf.title}</span>
                  <ShortfallStatusBadge status={sf.status} />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                  <span>App: <span className="font-mono">{sf.applicationNo}</span></span>
                  <ShortfallTypeBadge type={sf.type} />
                  <span>Raised by: <RoleBadge role={sf.raisedBy.role} /></span>
                  <span>{timeAgo(sf.raisedAt)}</span>
                  {sf.dueDate && <span>Due: {formatDate(sf.dueDate)}</span>}
                </div>
                {sf.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{sf.description}</p>}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
