"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, useAllShortfalls } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import {
  ShortfallStatusBadge,
  ShortfallTypeBadge,
  RoleBadge,
} from "@/components/design-system/badges";
import { formatDateTime, formatDate, timeAgo } from "@/components/design-system/workflow";
import { FileUploader, type UploadedFile } from "@/components/design-system/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  FileWarning,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  CircleDot,
  MessageSquare,
  Upload,
  Download,
  ArrowRight,
  ShieldCheck,
  CalendarClock,
  AlertCircle,
  Send,
  Inbox,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application, Shortfall } from "@/types";

type ShortfallWithApp = Shortfall & { application: Application };

export function LtpShortfalls() {
  const { navigate, openApplication, respondToShortfall } = useAppStore();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [selected, setSelected] = React.useState<ShortfallWithApp | null>(null);
  const [respondOpen, setRespondOpen] = React.useState(false);
  const [responseText, setResponseText] = React.useState("");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  const allShortfalls = useAllShortfalls();
  const filtered = allShortfalls.filter((s) => {
    if (query && !s.title.toLowerCase().includes(query.toLowerCase()) && !s.shortfallId.toLowerCase().includes(query.toLowerCase())) return false;
    if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: allShortfalls.length,
    open: allShortfalls.filter((s) => s.status === "OPEN" || s.status === "REOPENED").length,
    responded: allShortfalls.filter((s) => s.status === "RESPONDED" || s.status === "UNDER_REVIEW").length,
    resolved: allShortfalls.filter((s) => s.status === "RESOLVED").length,
  };

  function openRespond(s: ShortfallWithApp) {
    setSelected(s);
    setRespondOpen(true);
    setResponseText("");
    setFiles([]);
  }

  function submitResponse() {
    if (!selected) return;
    const supportingDoc = files[0]?.name;
    respondToShortfall(selected.applicationId, selected.id, responseText, supportingDoc);
    setRespondOpen(false);
    toast({ title: "Response submitted", description: "Your response has been sent to the reviewing officer." });
    setResponseText("");
    setFiles([]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shortfall Center"
        description="Manage all shortfalls raised on your applications — respond, attach documents and track resolution."
        icon={AlertTriangle}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Shortfalls" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ShortfallStat label="Total" value={stats.total} icon={AlertTriangle} cls="bg-muted text-muted-foreground" />
        <ShortfallStat label="Open" value={stats.open} icon={Clock} cls="bg-warning/15 text-warning-foreground" />
        <ShortfallStat label="Responded" value={stats.responded} icon={MessageSquare} cls="bg-info/10 text-info" />
        <ShortfallStat label="Resolved" value={stats.resolved} icon={CheckCircle2} cls="bg-success/10 text-success" />
      </div>

      <SectionCard noPadding>
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by shortfall ID or title…" className="h-9 pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-36"><Filter className="mr-1.5 size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="DOCUMENT">Document</SelectItem>
                <SelectItem value="FEE">Fee</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="RESPONDED">Responded</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="REOPENED">Reopened</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={CheckCircle2} title="No shortfalls" description="There are no shortfalls matching your filters." />
          </div>
        ) : (
          <Tabs defaultValue="active">
            <div className="border-b border-border px-3 pt-3">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger value="active" className="data-[state=active]:bg-muted rounded-md">Active ({stats.open + stats.responded})</TabsTrigger>
                <TabsTrigger value="resolved" className="data-[state=active]:bg-muted rounded-md">Resolved ({stats.resolved})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="active" className="m-0">
              <ShortfallList shortfalls={filtered.filter((s) => s.status !== "RESOLVED")} onSelect={setSelected} onRespond={openRespond} onOpenApp={(id) => openApplication(id)} />
            </TabsContent>
            <TabsContent value="resolved" className="m-0">
              <ShortfallList shortfalls={filtered.filter((s) => s.status === "RESOLVED")} onSelect={setSelected} onRespond={openRespond} onOpenApp={(id) => openApplication(id)} />
            </TabsContent>
          </Tabs>
        )}
      </SectionCard>

      {/* Detail drawer */}
      <Sheet open={!!selected && !respondOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <ShortfallTypeBadge type={selected.type} />
                  <ShortfallStatusBadge status={selected.status} />
                </div>
                <SheetTitle className="text-left">{selected.title}</SheetTitle>
                <SheetDescription className="text-left font-mono">{selected.shortfallId}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Detail label="Application" value={selected.applicationNo} />
                  <Detail label="Raised By" value={selected.raisedBy.name} />
                  <Detail label="Role" value={<RoleBadge role={selected.raisedBy.role} />} />
                  <Detail label="Raised On" value={formatDate(selected.raisedAt)} />
                  <Detail label="Due Date" value={<span className="text-destructive font-medium">{formatDate(selected.dueDate)}</span>} />
                  <Detail label="Status" value={<ShortfallStatusBadge status={selected.status} />} />
                </div>
                {selected.response && (
                  <div className="rounded-lg border border-info/30 bg-info/5 p-3">
                    <p className="text-xs font-medium text-info">Your Response</p>
                    <p className="mt-1 text-sm">{selected.response.text}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">Responded {formatDateTime(selected.response.respondedAt)}</p>
                  </div>
                )}
                {selected.resolvedBy && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                    <p className="text-xs font-medium text-success">Resolved</p>
                    <p className="mt-1 text-sm">{selected.resolution}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">By {selected.resolvedBy.name} on {formatDate(selected.resolvedAt ?? "")}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openApplication(selected.applicationId)}>View application</Button>
                  {(selected.status === "OPEN" || selected.status === "REOPENED") && (
                    <Button className="flex-1" onClick={() => openRespond(selected)}><Send className="size-4" /> Respond</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Respond dialog */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Shortfall</DialogTitle>
            <DialogDescription>{selected?.shortfallId} — {selected?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Your response *</Label>
              <Textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Explain how the shortfall has been addressed…" rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Supporting document (optional)</Label>
              <FileUploader
                label="Drop file here"
                hint="PDF, JPG, PNG · max 10 MB"
                accept=".pdf,.jpg,.png"
                uploadedFiles={files}
                onUpload={(nf) => setFiles((p) => { const m = new Map(p.map((f) => [f.id, f])); nf.forEach((f) => m.set(f.id, f)); return Array.from(m.values()); })}
                onRemove={(id) => setFiles((p) => p.filter((f) => f.id !== id))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondOpen(false)}>Cancel</Button>
            <Button onClick={submitResponse} disabled={!responseText.trim()}><Send className="size-4" /> Submit Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShortfallList({ shortfalls, onSelect, onRespond, onOpenApp }: { shortfalls: ShortfallWithApp[]; onSelect: (s: ShortfallWithApp) => void; onRespond: (s: ShortfallWithApp) => void; onOpenApp: (id: string) => void }) {
  if (shortfalls.length === 0) {
    return <div className="p-6"><EmptyState icon={Inbox} title="Nothing here" description="No shortfalls in this view." /></div>;
  }
  return (
    <ul className="divide-y divide-border">
      {shortfalls.map((s) => {
        const overdue = new Date(s.dueDate).getTime() < Date.now() && (s.status === "OPEN" || s.status === "REOPENED");
        return (
          <li key={s.id} className="p-4 transition-colors hover:bg-muted/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <button onClick={() => onSelect(s)} className="flex items-start gap-3 text-left flex-1 min-w-0">
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", s.status === "RESOLVED" ? "bg-success/10 text-success" : overdue ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground")}>
                  <AlertTriangle className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{s.title}</p>
                    <ShortfallTypeBadge type={s.type} />
                    {overdue && <Badge className="bg-destructive text-white text-[9px]">Overdue</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                    <span className="font-mono">{s.shortfallId}</span>
                    <span>·</span>
                    <button onClick={(e) => { e.stopPropagation(); onOpenApp(s.applicationId); }} className="font-mono text-primary hover:underline">{s.applicationNo}</button>
                    <span>·</span>
                    <span>Raised by {s.raisedBy.name}</span>
                    <RoleBadge role={s.raisedBy.role} />
                    <span>·</span>
                    <span className="flex items-center gap-1"><CalendarClock className="size-3" /> Due {formatDate(s.dueDate)}</span>
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <ShortfallStatusBadge status={s.status} />
                {(s.status === "OPEN" || s.status === "REOPENED") && <Button size="sm" onClick={() => onRespond(s)}><Send className="size-3.5" /> Respond</Button>}
                <Button size="sm" variant="outline" onClick={() => onSelect(s)}>Details <ArrowRight className="size-3.5" /></Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ShortfallStat({ label, value, icon: Icon, cls }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}
