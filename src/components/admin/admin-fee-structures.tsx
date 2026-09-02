"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { FEE_STRUCTURES, FEE_COMPONENTS } from "@/data/mock-data";
import { feeService } from "@/services/fee-service";
import {
  PageHeader,
  SectionCard,
  StatCard,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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
  Beaker,
  Info,
  Building2,
  AlertCircle,
  Receipt,
  Save,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/components/design-system/workflow";
import type {
  ApplicationType,
  FeeComponent,
  PropertyType,
} from "@/types";

// ============================================================
// Constants
// ============================================================

const BASIS_LABELS: Record<FeeComponent["basis"], { label: string; cls: string }> = {
  FIXED: { label: "Fixed", cls: "bg-muted text-muted-foreground border-border" },
  AREA_BASED: { label: "Area based", cls: "bg-info/10 text-info border-info/30" },
  PERCENTAGE: { label: "Percentage", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900" },
  SLAB: { label: "Slab", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900" },
};

const PROPERTY_TYPES: PropertyType[] = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "INSTITUTIONAL", "MIXED_USE"];

const SCROLLABLE =
  "max-h-96 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent";

type DemoMode =
  | "add-structure"
  | "edit-structure"
  | "add-component"
  | "edit-component"
  | "delete-component";

interface DemoDraft {
  name: string;
  code: string;
  basis: FeeComponent["basis"];
  rate: string;
  unit: string;
  description: string;
  active: boolean;
}

const EMPTY_DRAFT: DemoDraft = {
  name: "",
  code: "",
  basis: "FIXED",
  rate: "",
  unit: "",
  description: "",
  active: true,
};

const DEMO_LABELS: Record<DemoMode, { title: string; description: string; action: string; destructive?: boolean }> = {
  "add-structure": { title: "Add fee structure", description: "Demo configuration — not persisted. Define a new fee structure for an application type.", action: "Create structure" },
  "edit-structure": { title: "Edit fee structure", description: "Demo configuration — not persisted. Edits to the fee structure are session-only.", action: "Save changes" },
  "add-component": { title: "Add fee component", description: "Demo configuration — not persisted. The new component will not be saved to the fee config.", action: "Add component" },
  "edit-component": { title: "Edit fee component", description: "Demo configuration — not persisted. Component rate changes will not affect live calculations.", action: "Save changes" },
  "delete-component": { title: "Delete fee component", description: "Demo configuration — not persisted. The component will not actually be removed.", action: "Delete component", destructive: true },
};

// ============================================================
// Helpers
// ============================================================

function titleCase(s: string): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function feeComponentByCode(code: FeeComponent["code"]): FeeComponent | undefined {
  return FEE_COMPONENTS.find((c) => c.code === code);
}

function formulaPreview(): string {
  const appFee = feeComponentByCode("APP_FEE")?.rate ?? 0;
  const scrutiny = feeComponentByCode("SCRUTINY_FEE")?.rate ?? 0;
  const dev = feeComponentByCode("DEV_FEE")?.rate ?? 0;
  const proc = feeComponentByCode("PROC_FEE")?.rate ?? 0;
  const doc = feeComponentByCode("DOC_FEE")?.rate ?? 0;
  return `${formatINR(appFee)} + (₹${scrutiny} × area) + (₹${dev} × area) + ${formatINR(proc)} + (₹${doc} × docs) + 1% labour cess on dev fee`;
}

// ============================================================
// Component
// ============================================================

export function AdminFeeStructures() {
  const navigate = useAppStore((s) => s.navigate);
  const applications = useAppStore((s) => s.applications);
  const applicationTypes = useAppStore((s) => s.applicationTypes);
  const systemSettings = useAppStore((s) => s.systemSettings);
  const { toast } = useToast();

  // ---- Stats (derived from store applications + canonical FEE_STRUCTURES) ----
  const totalStructures = FEE_STRUCTURES.length;
  const activeStructures = FEE_STRUCTURES.filter((f) => f.active).length;
  const appsWithFees = React.useMemo(
    () => applications.filter((a) => a.fee && a.fee.total > 0),
    [applications]
  );
  const appsUsingFees = appsWithFees.length;
  const avgFee = React.useMemo(() => {
    if (appsWithFees.length === 0) return 0;
    const sum = appsWithFees.reduce((acc, a) => acc + (a.fee?.total ?? 0), 0);
    return Math.round(sum / appsWithFees.length);
  }, [appsWithFees]);
  const highestFee = React.useMemo(
    () => appsWithFees.reduce((max, a) => Math.max(max, a.fee?.total ?? 0), 0),
    [appsWithFees]
  );

  // ---- Calculator state ----
  const [calcType, setCalcType] = React.useState<ApplicationType>("BUILDING_PERMISSION");
  const [calcProperty, setCalcProperty] = React.useState<PropertyType>("RESIDENTIAL");
  const [calcArea, setCalcArea] = React.useState<number>(1780);
  const [calcPlot, setCalcPlot] = React.useState<number>(Math.round(1780 * 0.7));
  const [calcDocs, setCalcDocs] = React.useState<number>(8);

  const calcResult = React.useMemo(() => {
    const result = feeService.calculate({
      applicationType: calcType,
      propertyType: calcProperty,
      builtUpArea: Math.max(1, calcArea),
      plotArea: Math.max(1, calcPlot),
      documentCount: Math.max(0, calcDocs),
    });
    return result ? feeService.toApplicationFee(result, 0) : null;
  }, [calcType, calcProperty, calcArea, calcPlot, calcDocs]);

  // ---- Demo configuration dialog ----
  const [demoOpen, setDemoOpen] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState<DemoMode>("add-component");
  const [demoTarget, setDemoTarget] = React.useState<string>("");
  const [demoDraft, setDemoDraft] = React.useState<DemoDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = React.useState(false);

  function openDemo(mode: DemoMode, target: string, draft: DemoDraft = EMPTY_DRAFT): void {
    setDemoMode(mode);
    setDemoTarget(target);
    setDemoDraft(draft);
    setDemoOpen(true);
  }

  function openDemoAddComponent(structureName: string): void {
    openDemo("add-component", structureName);
  }
  function openDemoEditComponent(c: FeeComponent): void {
    openDemo("edit-component", c.name, {
      name: c.name,
      code: c.code,
      basis: c.basis,
      rate: String(c.rate),
      unit: c.unit ?? "",
      description: c.description,
      active: true,
    });
  }
  function openDemoDeleteComponent(c: FeeComponent): void {
    openDemo("delete-component", c.name);
  }
  function openDemoAddStructure(): void {
    openDemo("add-structure", "");
  }
  function openDemoEditStructure(structureName: string): void {
    openDemo("edit-structure", structureName);
  }

  function handleDemoSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setSaving(true);
    // Demo configuration is NOT persisted — fee structures are configured in code (fee-config.ts).
    // Show a confirmation toast that's clearly labelled as demo-only after a brief delay
    // so the user sees a perceptible loading state and cannot double-submit.
    window.setTimeout(() => {
      setSaving(false);
      setDemoOpen(false);
      toast({
        title: DEMO_LABELS[demoMode].title,
        description:
          "Demo configuration saved — NOT persisted. Fee structures are configured in code (src/data/fee-config.ts). Changes reset on reload.",
      });
    }, 350);
  }

  const isStructureMode = demoMode === "add-structure" || demoMode === "edit-structure";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="View fee structures, components and the basis of calculation for every application type. Use the live fee calculator to compute fees for a sample built-up area."
        icon={Calculator}
        breadcrumbs={[{ label: "Administration", onClick: () => navigate("admin-dashboard") }, { label: "Fee Structures" }]}
        badge={
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
            <Info className="size-3 mr-1" /> Configured in code
          </Badge>
        }
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={openDemoAddStructure}>
                <Plus className="size-4" /> Add structure
              </Button>
            </TooltipTrigger>
            <TooltipContent>Demo only — not persisted</TooltipContent>
          </Tooltip>
        }
      />

      {/* Honest demo-mode callout */}
      {systemSettings.demoMode ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Demo mode — fee structures are read-only</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-300/90">
              The Zustand store has no fee-structure persistence layer. Fee structures and components below are read from
              <span className="font-mono"> src/data/fee-config.ts </span>
              (canonical source). Edit/Create/Delete buttons open a demo configuration dialog that is clearly labelled as
              session-only and does not persist.
            </p>
          </div>
        </div>
      ) : null}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Structures" value={totalStructures} icon={FileStack} accent="primary" />
        <StatCard label="Active Structures" value={activeStructures} icon={CircleCheck} accent="success" />
        <StatCard label="Apps Using Fees" value={appsUsingFees} icon={Receipt} accent="info" />
        <StatCard label="Avg. Fee (paid apps)" value={formatINR(avgFee)} icon={IndianRupee} accent="amber" />
      </div>

      <Tabs defaultValue="by-type" className="w-full">
        <TabsList className="h-9">
          <TabsTrigger value="by-type"><Building2 className="size-3.5" /> By Type</TabsTrigger>
          <TabsTrigger value="structures"><Layers className="size-3.5" /> Structures & Components</TabsTrigger>
          <TabsTrigger value="calculator"><Beaker className="size-3.5" /> Fee Calculator</TabsTrigger>
        </TabsList>

        {/* ---------- Tab 1: By Application Type ---------- */}
        <TabsContent value="by-type" className="space-y-4 outline-none">
          <SectionCard
            title="Per-Type Fee Structures"
            description="Each application type's fee structure (read-only — configured in code). Edit affordances are demo-only and not persisted."
            icon={Building2}
          >
            {applicationTypes.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No application types configured"
                description="Application types are managed in Admin → Application Types. Once added, their fee structures will appear here."
              />
            ) : (
              <div className={cn("space-y-4", SCROLLABLE)}>
                {applicationTypes.map((type) => {
                  const structure = feeService.findStructure(type.key);
                  const appFee = feeComponentByCode("APP_FEE");
                  const scrutiny = feeComponentByCode("SCRUTINY_FEE");
                  const dev = feeComponentByCode("DEV_FEE");
                  const doc = feeComponentByCode("DOC_FEE");
                  return (
                    <div
                      key={type.key}
                      className={cn(
                        "rounded-xl border bg-card p-4 shadow-sm",
                        structure ? "border-border" : "border-dashed border-border/70"
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-lg",
                              structure ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Building2 className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{type.name}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                            {structure ? (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                <span className="font-mono">{structure.id}</span> · Effective from {structure.effectiveFrom}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {structure ? (
                            <>
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                              >
                                <CircleCheck className="size-3 mr-0.5" /> Active
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => openDemoEditStructure(structure.name)}
                                    aria-label={`Edit fee structure for ${type.name} (demo)`}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Demo only — not persisted</TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">No structure</Badge>
                          )}
                        </div>
                      </div>
                      {structure ? (
                        <>
                          <Separator className="my-3" />
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <FeeField
                              label="Base fee (APP_FEE)"
                              value={appFee ? formatINR(appFee.rate) : "—"}
                              hint={appFee?.basis ?? "—"}
                            />
                            <FeeField
                              label="Per sq.m (DEV_FEE)"
                              value={dev ? `₹${dev.rate}/sq.m` : "—"}
                              hint={dev?.basis ?? "—"}
                            />
                            <FeeField
                              label="Scrutiny fee"
                              value={scrutiny ? `₹${scrutiny.rate}/sq.m` : "—"}
                              hint={scrutiny?.basis ?? "—"}
                            />
                            <FeeField
                              label="Document fee"
                              value={doc ? `₹${doc.rate}/doc` : "—"}
                              hint={doc?.basis ?? "—"}
                            />
                          </div>
                          <div className="mt-3 flex items-start gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                            <Gauge className="size-3.5 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wide">Total formula preview</p>
                              <p className="font-mono text-foreground/80 break-words">{formulaPreview()}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                          <Info className="size-3.5 shrink-0 mt-0.5" />
                          <span>
                            No fee structure configured for this application type. The fee calculator will return no result
                            for this type until a structure is added in
                            <span className="font-mono"> fee-config.ts</span>.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ---------- Tab 2: Structures & Components ---------- */}
        <TabsContent value="structures" className="space-y-4 outline-none">
          <SectionCard
            title="Fee Structures"
            description={`${FEE_STRUCTURES.length} structures — read-only. Use the demo dialog to preview edits (not persisted).`}
            icon={FileStack}
            noPadding
          >
            <div className={SCROLLABLE}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow className="border-b-2">
                    <TableHead className="pl-5 font-bold">Structure</TableHead>
                    <TableHead className="font-bold">Application Type</TableHead>
                    <TableHead className="font-bold">Effective</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right pr-5 font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEE_STRUCTURES.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                          <span className="text-[11px] text-muted-foreground">{s.description}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/70">{s.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{titleCase(s.applicationType)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" /> {s.effectiveFrom}
                        </span>
                      </TableCell>
                      <TableCell>
                        {s.active ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                          >
                            <CircleCheck className="size-3 mr-0.5" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => openDemoEditStructure(s.name)}
                              aria-label={`Edit ${s.name} (demo)`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Demo only — not persisted</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          <SectionCard
            title="Fee Components"
            description={`${FEE_COMPONENTS.length} components — read-only. Use the demo dialog to preview edits (not persisted).`}
            icon={Layers}
            noPadding
            action={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openDemoAddComponent("Default structure")}>
                    <Plus className="size-3.5" /> Add component
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Demo only — not persisted</TooltipContent>
              </Tooltip>
            }
          >
            <div className={SCROLLABLE}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow className="border-b-2">
                    <TableHead className="pl-5 font-bold">Component</TableHead>
                    <TableHead className="font-bold">Code</TableHead>
                    <TableHead className="font-bold">Basis</TableHead>
                    <TableHead className="text-right font-bold">Rate</TableHead>
                    <TableHead className="font-bold">Unit</TableHead>
                    <TableHead className="text-right pr-5 font-bold">Actions</TableHead>
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
                        <TableCell>
                          <span className="font-mono text-xs">{c.code}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]", basis.cls)}>{basis.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {c.basis === "PERCENTAGE" ? `${c.rate}%` : formatINR(c.rate)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.unit ?? (c.basis === "FIXED" ? "per application" : "—")}</TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => openDemoEditComponent(c)}
                                  aria-label={`Edit ${c.name} (demo)`}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Demo only — not persisted</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-destructive hover:text-destructive"
                                  onClick={() => openDemoDeleteComponent(c)}
                                  aria-label={`Delete ${c.name} (demo)`}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Demo only — not persisted</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ---------- Tab 3: Fee Calculator ---------- */}
        <TabsContent value="calculator" className="space-y-4 outline-none">
          <SectionCard
            title="Fee Calculator"
            description="Live fee computation using the canonical fee service. Picks the active fee structure for the selected application type and computes line items."
            icon={Beaker}
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="calc-type">Application type</Label>
                  <Select value={calcType} onValueChange={(v) => setCalcType(v as ApplicationType)}>
                    <SelectTrigger id="calc-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {applicationTypes.map((t) => (
                        <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="calc-property">Property type</Label>
                  <Select value={calcProperty} onValueChange={(v) => setCalcProperty(v as PropertyType)}>
                    <SelectTrigger id="calc-property"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>{titleCase(p)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="calc-area">Built-up area (sq.m)</Label>
                    <Input
                      id="calc-area"
                      type="number"
                      min={1}
                      value={calcArea}
                      onChange={(e) => setCalcArea(Math.max(1, Number(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="calc-plot">Plot area (sq.m)</Label>
                    <Input
                      id="calc-plot"
                      type="number"
                      min={1}
                      value={calcPlot}
                      onChange={(e) => setCalcPlot(Math.max(1, Number(e.target.value) || 0))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="calc-docs">Document count</Label>
                  <Input
                    id="calc-docs"
                    type="number"
                    min={0}
                    value={calcDocs}
                    onChange={(e) => setCalcDocs(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[560, 980, 1780, 6400].map((a) => (
                    <Button
                      key={a}
                      type="button"
                      variant={calcArea === a ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCalcArea(a);
                        setCalcPlot(Math.round(a * 0.7));
                      }}
                    >
                      {a} sq.m
                    </Button>
                  ))}
                </div>
                <Separator />
                <div className="rounded-md bg-muted/30 p-3 text-[11px] text-muted-foreground">
                  <p className="font-medium text-foreground">Live computation</p>
                  <p>
                    Uses <span className="font-mono">feeService.calculate()</span> from
                    <span className="font-mono"> src/services/fee-service.ts</span>. Result reflects the active fee structure
                    for the selected application type.
                  </p>
                </div>
              </div>

              {/* Result */}
              <div className="space-y-4">
                {calcResult ? (
                  <>
                    <div className="overflow-hidden rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 border-b-2">
                            <TableHead className="pl-4 font-bold">Line item</TableHead>
                            <TableHead className="font-bold">Basis</TableHead>
                            <TableHead className="text-right font-bold">Rate</TableHead>
                            <TableHead className="text-right font-bold">Qty</TableHead>
                            <TableHead className="text-right pr-4 font-bold">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {calcResult.lineItems.map((li) => (
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
                        <p className="text-2xl font-semibold text-foreground tabular-nums">{formatINR(calcResult.total)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Subtotal</p>
                          <p className="text-sm font-mono tabular-nums">{formatINR(calcResult.subtotal)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">GST</p>
                          <p className="text-sm font-mono tabular-nums">{formatINR(calcResult.gst)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Labour cess</p>
                          <p className="text-sm font-mono tabular-nums">
                            {formatINR(calcResult.lineItems.find((i) => i.componentCode === "LABOUR_CESS")?.amount ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={AlertCircle}
                    title="No fee structure for this application type"
                    description="The fee service has no active structure for the selected application type. Choose a different type or add a structure in src/data/fee-config.ts."
                  />
                )}
              </div>
            </div>
          </SectionCard>

          {/* Recent applications with fees (real store data) */}
          <SectionCard
            title="Applications with Generated Fees"
            description={`${appsUsingFees} applications in the store have a non-zero fee. Highest fee: ${formatINR(highestFee)}.`}
            icon={Receipt}
            noPadding
          >
            {appsWithFees.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No applications with fees yet"
                description="Generated fees will appear here once an LTP runs the fee engine on an application."
              />
            ) : (
              <div className={SCROLLABLE}>
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="border-b-2">
                      <TableHead className="pl-5 font-bold">Application No</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Structure</TableHead>
                      <TableHead className="text-right font-bold">Built-up</TableHead>
                      <TableHead className="text-right font-bold">Total</TableHead>
                      <TableHead className="text-right pr-5 font-bold">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appsWithFees.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="pl-5">
                          <span className="font-mono text-xs">{a.applicationNo}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{titleCase(a.project.type)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{a.fee?.feeStructureName ?? "—"}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">{a.project.builtUpArea} sq.m</TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">{formatINR(a.fee?.total ?? 0)}</TableCell>
                        <TableCell className="text-right pr-5 font-mono text-sm tabular-nums">
                          {a.fee && a.fee.outstanding > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">{formatINR(a.fee.outstanding)}</span>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                            >
                              <CircleCheck className="size-3 mr-0.5" /> Paid
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ============================================================
          Demo Configuration Dialog — NOT persisted
          ============================================================ */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{DEMO_LABELS[demoMode].title}</DialogTitle>
            <DialogDescription>{DEMO_LABELS[demoMode].description}</DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-medium flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> Demo configuration — not persisted
            </p>
            <p className="mt-1 text-amber-700 dark:text-amber-300/90">
              Submitting this form will <span className="font-semibold">not</span> modify the canonical fee config
              (<span className="font-mono">src/data/fee-config.ts</span>). You will see a confirmation toast only.
            </p>
          </div>

          <form onSubmit={handleDemoSubmit} className="space-y-4">
            {demoMode === "delete-component" ? (
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove <span className="font-medium text-foreground">{demoTarget}</span> from the fee
                structure? This action is demo-only and will not actually delete the component.
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="d-name">
                    {isStructureMode ? "Structure name" : "Component name"}
                    <span className="text-destructive"> *</span>
                  </Label>
                  <Input
                    id="d-name"
                    placeholder={isStructureMode ? "e.g. Building Permission — Industrial (2026)" : "e.g. Infrastructure Cess"}
                    required
                    value={demoDraft.name}
                    onChange={(e) => setDemoDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="d-code">
                      {isStructureMode ? "Application type" : "Code"}
                      <span className="text-destructive"> *</span>
                    </Label>
                    {isStructureMode ? (
                      <Select
                        value={demoDraft.code}
                        onValueChange={(v) => setDemoDraft((d) => ({ ...d, code: v }))}
                      >
                        <SelectTrigger id="d-code"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {applicationTypes.map((t) => (
                            <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="d-code"
                        placeholder="INFRA_CESS"
                        required
                        className="font-mono"
                        value={demoDraft.code}
                        onChange={(e) => setDemoDraft((d) => ({ ...d, code: e.target.value }))}
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="d-basis">Basis</Label>
                    <Select
                      value={demoDraft.basis}
                      onValueChange={(v) => setDemoDraft((d) => ({ ...d, basis: v as FeeComponent["basis"] }))}
                    >
                      <SelectTrigger id="d-basis"><SelectValue /></SelectTrigger>
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
                    <Label htmlFor="d-rate">
                      {isStructureMode ? "Effective from" : "Rate"}
                      <span className="text-destructive"> *</span>
                    </Label>
                    {isStructureMode ? (
                      <Input
                        id="d-rate"
                        type="date"
                        required
                        value={demoDraft.unit}
                        onChange={(e) => setDemoDraft((d) => ({ ...d, unit: e.target.value }))}
                      />
                    ) : (
                      <Input
                        id="d-rate"
                        type="number"
                        min={0}
                        placeholder="2500"
                        required
                        value={demoDraft.rate}
                        onChange={(e) => setDemoDraft((d) => ({ ...d, rate: e.target.value }))}
                      />
                    )}
                  </div>
                  {!isStructureMode ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="d-unit">Unit</Label>
                      <Input
                        id="d-unit"
                        placeholder="sq.m or leave blank"
                        value={demoDraft.unit}
                        onChange={(e) => setDemoDraft((d) => ({ ...d, unit: e.target.value }))}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d-desc">Description</Label>
                  <Textarea
                    id="d-desc"
                    rows={2}
                    placeholder="Brief description…"
                    value={demoDraft.description}
                    onChange={(e) => setDemoDraft((d) => ({ ...d, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="d-active" className="text-xs">Active immediately</Label>
                    <p className="text-[11px] text-muted-foreground">Demo flag — has no effect on the canonical config.</p>
                  </div>
                  <Switch
                    id="d-active"
                    checked={demoDraft.active}
                    onCheckedChange={(v) => setDemoDraft((d) => ({ ...d, active: v }))}
                  />
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDemoOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={saving}
                variant={DEMO_LABELS[demoMode].destructive ? "destructive" : "default"}
              >
                {saving ? (
                  <>
                    <Clock className="size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-4" /> {DEMO_LABELS[demoMode].action}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function FeeField({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="space-y-0.5 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

export default AdminFeeStructures;
