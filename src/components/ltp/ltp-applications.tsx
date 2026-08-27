"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { APPLICATIONS } from "@/data/mock-data";
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { StatusBadge, PriorityBadge } from "@/components/design-system/badges";
import { formatDateTime, timeAgo } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileStack,
  FilePlus2,
  Search,
  Filter,
  Download,
  MapPin,
  Calendar,
  ArrowRight,
  LayoutGrid,
  List,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import type { Application, ApplicationStatus } from "@/types";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SCRUTINY_FAILED", label: "Scrutiny Failed" },
  { value: "DOCUMENTS_PENDING", label: "Documents Pending" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTFALL_RAISED", label: "Shortfall Raised" },
  { value: "APPROVED", label: "Approved" },
];

export function LtpApplications() {
  const { user, openApplication, navigate } = useAppStore();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [view, setView] = React.useState<"table" | "grid">("table");

  const apps = React.useMemo(() => {
    let list = APPLICATIONS.filter((a) => a.ltpId === user?.id || user?.role === "LTP");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.applicationNo.toLowerCase().includes(q) ||
          a.project.name.toLowerCase().includes(q) ||
          a.applicant.name.toLowerCase().includes(q)
      );
    }
    if (status !== "ALL") list = list.filter((a) => a.status === status);
    return list;
  }, [query, status, user]);

  const counts = {
    total: apps.length,
    active: apps.filter((a) => !["APPROVED", "REJECTED"].includes(a.status)).length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    action: apps.filter((a) => ["SCRUTINY_FAILED", "SHORTFALL_RAISED", "PAYMENT_PENDING", "DOCUMENTS_PENDING"].includes(a.status)).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="All building and project approval applications you have submitted."
        icon={FileStack}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Applications" }]}
        actions={
          <Button size="sm" onClick={() => navigate("ltp-create-application")}>
            <FilePlus2 className="size-4" /> New Application
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} icon={FileStack} accent="primary" />
        <StatCard label="Active" value={counts.active} icon={Clock} accent="info" />
        <StatCard label="Action Required" value={counts.action} icon={AlertTriangle} accent="warning" />
        <StatCard label="Approved" value={counts.approved} icon={CheckCircle2} accent="success" />
      </div>

      <SectionCard noPadding>
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by application no, project, applicant…"
              className="h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[160px]">
                <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center rounded-md border border-border">
              <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("table")}>
                <List className="size-4" />
              </Button>
              <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("grid")}>
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title="No applications found"
              description="Try adjusting your filters or create a new application."
              action={<Button size="sm" onClick={() => navigate("ltp-create-application")}><FilePlus2 className="size-4" /> New Application</Button>}
            />
          </div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Application No.</th>
                  <th className="px-4 py-2.5 font-medium">Project</th>
                  <th className="px-4 py-2.5 font-medium">Applicant</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Current Stage</th>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                  <th className="px-4 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apps.map((a) => (
                  <tr key={a.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <button onClick={() => openApplication(a.id)} className="font-mono text-xs font-medium text-primary hover:underline">
                        {a.applicationNo}
                      </button>
                      <div className="text-[10px] text-muted-foreground">{formatDate(a.submissionDate)}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="truncate text-xs font-medium">{a.project.name}</p>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-2.5" /> {a.project.ward}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="truncate text-xs">{a.applicant.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.project.propertyType.replace("_", " ").toLowerCase()}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} showIcon={false} /></td>
                    <td className="px-4 py-3"><span className="text-xs">{a.currentStageLabel}</span></td>
                    <td className="px-4 py-3"><PriorityBadge priority={a.priority} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(a.lastUpdated)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openApplication(a.id)}>
                        Open <ArrowRight className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((a) => (
              <ApplicationCard key={a.id} app={a} onOpen={() => openApplication(a.id)} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ApplicationCard({ app, onOpen }: { app: Application; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-gov transition-all hover:border-primary/40 hover:shadow-gov-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-primary">{app.applicationNo}</p>
          <p className="truncate text-sm font-medium">{app.project.name}</p>
        </div>
        <PriorityBadge priority={app.priority} />
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="size-3" /> {app.project.ward} · {app.project.zone}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={app.status} showIcon={false} />
        <span className="text-[11px] text-muted-foreground">{timeAgo(app.lastUpdated)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-[11px] text-muted-foreground">Stage: <span className="font-medium text-foreground">{app.currentStageLabel}</span></span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
