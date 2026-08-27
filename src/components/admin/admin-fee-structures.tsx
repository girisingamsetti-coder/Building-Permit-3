"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { FEE_STRUCTURES, FEE_COMPONENTS, buildFee } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
  InfoGrid,
} from "@/components/design-system/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  CircleCheck,
  Plus,
  Pencil,
  Trash2,
  IndianRupee,
  CalendarDays,
  Layers,
  FileStack,
  Gauge,
  Clock,
  Beaker,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/components/design-system/workflow";
import type { FeeComponent } from "@/types";

const BASIS_LABELS: Record<FeeComponent["basis"], { label: string; cls: string }> = {
  FIXED: { label: "Fixed", cls: "bg-muted text-muted-foreground border-border" },
  AREA_BASED: { label: "Area based", cls: "bg-info/10 text-info border-info/30" },
  PERCENTAGE: { label: "Percentage", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900" },
  SLAB: { label: "Slab", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900" },
};

// Preview calculation - reuse buildFee logic
function previewCalculation(area: number) {
  const fee = buildFee(area);
  return fee;
}

export function AdminFeeStructures() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string>(FEE_STRUCTURES[0].id);
  const [previewArea, setPreviewArea] = React.useState<number>(1780);
  const [addComponentOpen, setAddComponentOpen] = React.useState(false);

  const selected = FEE_STRUCTURES.find((f) => f.id === selectedId) ?? FEE_STRUCTURES[0];
  const preview = React.useMemo(() => previewCalculation(previewArea), [previewArea]);

  const stats = {
    active: FEE_STRUCTURES.filter((f) => f.active).length,
    components: FEE_COMPONENTS.length,
    avgFee: 248650,
    lastUpdated: "2025-01-16 09:05",
  };

  function handleAddComponent(e: React.FormEvent) {
    e.preventDefault();
    setAddComponentOpen(false);
    toast({
      title: "Fee component added",
      description: "The new component has been added to the structure and is effective immediately.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Configure fee structures, components and basis of calculation for every application type. Changes are versioned and audit-logged."
        icon={Calculator}
        breadcrumbs={[{ label: "Administration" }, { label: "Fee Structures" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">FY 2025–26</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started", description: "Fee structures exported to CSV." })}>
              <FileStack className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setAddComponentOpen(true)}>
              <Plus className="size-4" /> Add Component
            </Button>
          </>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active Structures" value={stats.active} icon={FileStack} accent="primary" />
        <StatCard label="Total Components" value={stats.components} icon={Layers} accent="info" />
        <StatCard label="Avg. Fee (Residential)" value={formatINR(stats.avgFee)} icon={IndianRupee} accent="success" />
        <StatCard label="Last Updated" value={stats.lastUpdated.split(" ")[0]} icon={Clock} accent="amber" footer={<span className="text-[10px] text-muted-foreground">{stats.lastUpdated.split(" ")[1]} IST</span>} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: structures list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Structures</h3>
            <Badge variant="outline" className="bg-muted/60 text-muted-foreground">{FEE_STRUCTURES.length}</Badge>
          </div>
          {FEE_STRUCTURES.map((f) => {
            const isSelected = f.id === selectedId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedId(f.id)}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-xl border bg-card p-4 text-left shadow-gov transition-all",
                  isSelected ? "border-primary/50 ring-1 ring-primary/20" : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calculator className="size-4.5" />
                  </div>
                  {f.active ? (
                    <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 text-[10px]">
                      <CircleCheck className="size-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">Inactive</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground leading-snug">{f.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    From {f.effectiveFrom}
                  </span>
                  <span className="font-mono">{f.applicationType.replace("_", " ").toLowerCase()}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: components table + preview */}
        <div className="space-y-6 lg:col-span-2">
          {/* Components table */}
          <SectionCard
            title="Fee Components"
            description={`Components for ${selected.name}`}
            icon={Layers}
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit structure", description: selected.name })}>
                  <Pencil className="size-3.5" /> Edit rules
                </Button>
                <Button size="sm" onClick={() => setAddComponentOpen(true)}>
                  <Plus className="size-3.5" /> Add component
                </Button>
              </div>
            }
            noPadding
          >
            <div className="max-h-[440px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="pl-5">Component</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEE_COMPONENTS.map((c) => {
                    const basis = BASIS_LABELS[c.basis];
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{c.name}</span>
                            <span className="text-[11px] text-muted-foreground">{c.description}</span>
                          </div>
                        </TableCell>
                        <TableCell><span className="font-mono text-xs">{c.code}</span></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]", basis.cls)}>{basis.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {c.basis === "PERCENTAGE" ? `${c.rate}%` : formatINR(c.rate)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.unit ?? (c.basis === "FIXED" ? "per application" : "—")}</TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => toast({ title: "Edit component", description: c.name })}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => toast({ title: "Component deleted", description: `${c.name} removed from structure.` })}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* Preview Calculation */}
          <SectionCard
            title="Preview Calculation"
            description="Live computation of the fee for a sample built-up area using the current components."
            icon={Beaker}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1.5 sm:w-72">
                  <Label htmlFor="area">Built-up area (sq.m)</Label>
                  <Input
                    id="area"
                    type="number"
                    min={1}
                    value={previewArea}
                    onChange={(e) => setPreviewArea(Math.max(1, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[560, 980, 1780, 6400].map((a) => (
                    <Button
                      key={a}
                      type="button"
                      variant={previewArea === a ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewArea(a)}
                    >
                      {a} sq.m
                    </Button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="pl-4">Line item</TableHead>
                      <TableHead>Basis</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right pr-4">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.lineItems.map((li) => (
                      <TableRow key={li.componentCode}>
                        <TableCell className="pl-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{li.name}</span>
                            <span className="text-[11px] text-muted-foreground">{li.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{li.basis}</TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {li.basis.toLowerCase().includes("percentage") ? `${li.rate}%` : formatINR(li.rate)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">{li.quantity}</TableCell>
                        <TableCell className="text-right pr-4 font-mono text-sm tabular-nums">{formatINR(li.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total payable</p>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">{formatINR(preview.total)}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-mono tabular-nums">{formatINR(preview.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">GST</p>
                    <p className="text-sm font-mono tabular-nums">{formatINR(preview.gst)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Labour cess</p>
                    <p className="text-sm font-mono tabular-nums">{formatINR(preview.lineItems.find((i) => i.componentCode === "LABOUR_CESS")?.amount ?? 0)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                <Gauge className="size-3.5" />
                Formula: <span className="font-mono">App + Scrutiny(₹45 × area) + Dev(₹120 × area) + Proc + Doc(10 × ₹800) + 1% Labour Cess on Dev.</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Stat footer */}
      <SectionCard title="Structure Details" description="Read-only metadata for the selected fee structure." icon={TrendingUp}>
        <InfoGrid
          columns={4}
          items={[
            { label: "Structure ID", value: <span className="font-mono">{selected.id}</span> },
            { label: "Application Type", value: selected.applicationType.replace("_", " ").toLowerCase() },
            { label: "Effective From", value: selected.effectiveFrom },
            { label: "Status", value: selected.active ? "Active" : "Inactive" },
          ]}
        />
      </SectionCard>

      {/* Add component dialog */}
      <Dialog open={addComponentOpen} onOpenChange={setAddComponentOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add fee component</DialogTitle>
            <DialogDescription>
              New component will be appended to <span className="font-medium text-foreground">{selected.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddComponent} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Component name <span className="text-destructive">*</span></Label>
              <Input id="c-name" placeholder="e.g. Infrastructure Cess" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-code">Code <span className="text-destructive">*</span></Label>
                <Input id="c-code" placeholder="INFRA_CESS" required className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-basis">Basis</Label>
                <Select defaultValue="FIXED">
                  <SelectTrigger id="c-basis"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed</SelectItem>
                    <SelectItem value="AREA_BASED">Area based</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="SLAB">Slab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-rate">Rate <span className="text-destructive">*</span></Label>
                <Input id="c-rate" type="number" min={0} placeholder="2500" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-unit">Unit</Label>
                <Input id="c-unit" placeholder="sq.m or leave blank" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-desc">Description</Label>
              <Textarea id="c-desc" rows={2} placeholder="Brief description of what this component covers…" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="c-active" className="text-xs">Active immediately</Label>
                <p className="text-[11px] text-muted-foreground">If off, the component is saved as draft.</p>
              </div>
              <Switch id="c-active" defaultChecked />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddComponentOpen(false)}>Cancel</Button>
              <Button type="submit"><Plus className="size-4" /> Add component</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminFeeStructures;
