"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { FEE_STRUCTURES, buildDocuments } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
  InfoGrid,
} from "@/components/design-system/layout";
import { DocumentStatusBadge } from "@/components/design-system/badges";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCog,
  FileStack,
  Files,
  CircleCheck,
  Plus,
  Pencil,
  Trash2,
  Building2,
  LayoutGrid,
  KeyRound,
  FileText,
  Archive,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ApplicationType, DocumentRecord } from "@/types";

// ---------- Application type registry ----------
interface AppTypeMeta {
  key: ApplicationType;
  name: string;
  description: string;
  active: boolean;
  baseFeeStructureId?: string;
}

const APP_TYPES: AppTypeMeta[] = [
  {
    key: "BUILDING_PERMISSION",
    name: "Building Permission",
    description: "Permission to erect, re-erect or make material alterations to a building. Most common application type covering residential, commercial, industrial and institutional properties.",
    active: true,
    baseFeeStructureId: "fs-bp-res-2025",
  },
  {
    key: "LAYOUT_APPROVAL",
    name: "Layout Approval",
    description: "Approval of subdivision / group housing layout plans for plots above the threshold defined in the DCR.",
    active: true,
    baseFeeStructureId: "fs-layout-2025",
  },
  {
    key: "OCCUPANCY_CERTIFICATE",
    name: "Occupancy Certificate",
    description: "Issued post-construction verifying the building is fit for occupation and complies with the sanctioned plan.",
    active: true,
  },
  {
    key: "REVISION_PERMISSION",
    name: "Revision Permission",
    description: "Permission to revise a previously sanctioned plan — additions, modifications or change of land use.",
    active: true,
  },
  {
    key: "DEVELOPMENT_PERMIT",
    name: "Development Permit",
    description: "Permit for land development including infrastructure, roads and common amenities on large parcels.",
    active: true,
  },
  {
    key: "DEMOLITION_PERMIT",
    name: "Demolition Permit",
    description: "Permit required to demolish any structure above the prescribed plinth area threshold.",
    active: false,
  },
];

const ICONS: Record<ApplicationType, typeof FileCog> = {
  BUILDING_PERMISSION: Building2,
  LAYOUT_APPROVAL: LayoutGrid,
  OCCUPANCY_CERTIFICATE: KeyRound,
  REVISION_PERMISSION: FileText,
  DEVELOPMENT_PERMIT: Archive,
  DEMOLITION_PERMIT: Trash2,
};

export function AdminApplicationTypes() {
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<ApplicationType>("BUILDING_PERMISSION");
  const [addOpen, setAddOpen] = React.useState(false);

  // Build a per-type required documents list (reusing buildDocuments for realism)
  const documentsByType: Record<ApplicationType, DocumentRecord[]> = React.useMemo(() => {
    const all = buildDocuments("verified");
    return {
      BUILDING_PERMISSION: all,
      LAYOUT_APPROVAL: all.filter((d) => !["DOC_ARCH", "DOC_STRUCT"].includes(d.code)).concat([
        { id: "d-l1", name: "Layout Plan (stamped)", code: "DOC_LAYOUT_PLAN", required: true, status: "REQUIRED" },
        { id: "d-l2", name: "Revised Subdivision Sketch", code: "DOC_SUBDIV", required: true, status: "REQUIRED" },
      ]),
      OCCUPANCY_CERTIFICATE: [
        { id: "d-oc-1", name: "Sanctioned Plan (original)", code: "DOC_SAN_PLAN", required: true, status: "REQUIRED" },
        { id: "d-oc-2", name: "Completion Certificate", code: "DOC_COMPLETION", required: true, status: "REQUIRED" },
        { id: "d-oc-3", name: "Builder NOC", code: "DOC_BUILDER_NOC", required: true, status: "REQUIRED" },
        { id: "d-oc-4", name: "Occupancy Affidavit", code: "DOC_OCC_AFF", required: true, status: "REQUIRED" },
        ...all.filter((d) => ["DOC_712", "DOC_PROP_CARD", "DOC_FIRE_NOC"].includes(d.code)),
      ],
      REVISION_PERMISSION: [
        { id: "d-rp-1", name: "Original Sanctioned Plan", code: "DOC_ORIG_SAN", required: true, status: "REQUIRED" },
        { id: "d-rp-2", name: "Revised Architectural Drawings", code: "DOC_REV_ARCH", required: true, status: "REQUIRED" },
        { id: "d-rp-3", name: "Reason for Revision", code: "DOC_REV_REASON", required: true, status: "REQUIRED" },
        ...all.filter((d) => ["DOC_712", "DOC_PROP_CARD", "DOC_AUTH"].includes(d.code)),
      ],
      DEVELOPMENT_PERMIT: [
        { id: "d-dp-1", name: "Land Development Plan", code: "DOC_DEV_PLAN", required: true, status: "REQUIRED" },
        { id: "d-dp-2", name: "Infrastructure Layout", code: "DOC_INFRA", required: true, status: "REQUIRED" },
        { id: "d-dp-3", name: "Environmental Clearance", code: "DOC_ENV", required: true, status: "REQUIRED" },
        ...all.filter((d) => ["DOC_712", "DOC_PROP_CARD"].includes(d.code)),
      ],
      DEMOLITION_PERMIT: [
        { id: "d-dm-1", name: "Existing Building Plan", code: "DOC_EXIST_PLAN", required: true, status: "REQUIRED" },
        { id: "d-dm-2", name: "Demolition Method Statement", code: "DOC_DEMO_METH", required: true, status: "REQUIRED" },
        { id: "d-dm-3", name: "Debris Disposal Plan", code: "DOC_DEBRIS", required: true, status: "REQUIRED" },
        ...all.filter((d) => ["DOC_712", "DOC_PROP_CARD", "DOC_FIRE_NOC"].includes(d.code)),
      ],
    };
  }, []);

  const selectedMeta = APP_TYPES.find((t) => t.key === selected)!;
  const selectedDocs = documentsByType[selected];
  const requiredCount = selectedDocs.filter((d) => d.required).length;
  const optionalCount = selectedDocs.length - requiredCount;
  const feeStructure = FEE_STRUCTURES.find((f) => f.id === selectedMeta.baseFeeStructureId);

  const totalDocs = Object.values(documentsByType).reduce((s, ds) => s + ds.length, 0);
  const activeTypes = APP_TYPES.filter((t) => t.active).length;

  function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    setAddOpen(false);
    toast({
      title: "Document added",
      description: "The new required document has been appended to the checklist for this application type.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Types & Documents"
        description="Define the application types available to applicants and the required-document checklist for each."
        icon={FileCog}
        breadcrumbs={[{ label: "Administration" }, { label: "Application Types & Documents" }]}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add Document
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Application Types" value={APP_TYPES.length} icon={FileCog} accent="primary" />
        <StatCard label="Active Types" value={activeTypes} icon={CircleCheck} accent="success" />
        <StatCard label="Configured Documents" value={totalDocs} icon={Files} accent="info" />
        <StatCard label="Fee Structures" value={FEE_STRUCTURES.length} icon={IndianRupee} accent="amber" />
      </div>

      {/* Application type tabs */}
      <SectionCard
        title="Application Type Configuration"
        description="Switch between types to view and edit the document checklist."
        icon={FileStack}
        noPadding
      >
        <div className="border-b border-border/60 p-3">
          <Tabs value={selected} onValueChange={(v) => setSelected(v as ApplicationType)}>
            <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/40 p-1">
              {APP_TYPES.map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  {t.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Selected type detail */}
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
          {/* Left meta */}
          <div className="border-b border-border/60 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {(() => {
                  const Icon = ICONS[selectedMeta.key];
                  return <Icon className="size-5" />;
                })()}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{selectedMeta.name}</h3>
                  {selectedMeta.active ? (
                    <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                      <CircleCheck className="size-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>
                  )}
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">{selectedMeta.key}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selectedMeta.description}</p>

            <div className="mt-5">
              <InfoGrid
                columns={1}
                items={[
                  { label: "Required Documents", value: `${requiredCount} mandatory · ${optionalCount} conditional` },
                  { label: "Total Checklist Items", value: selectedDocs.length },
                  {
                    label: "Associated Fee Structure",
                    value: feeStructure ? (
                      <span className="inline-flex items-center gap-1.5">
                        <IndianRupee className="size-3 text-muted-foreground" />
                        {feeStructure.name}
                      </span>
                    ) : "Not configured",
                  },
                  {
                    label: "Effective From",
                    value: feeStructure ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3 text-muted-foreground" />
                        {feeStructure.effectiveFrom}
                      </span>
                    ) : "—",
                  },
                ]}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit mode", description: `Editing configuration for ${selectedMeta.name}.` })}>
                <Pencil className="size-3.5" /> Edit type
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-3.5" /> Add document
              </Button>
            </div>
          </div>

          {/* Right documents table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Required Documents Checklist</p>
                <p className="text-xs text-muted-foreground">{selectedDocs.length} items configured for {selectedMeta.name}</p>
              </div>
              <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
                {requiredCount} required · {optionalCount} optional
              </Badge>
            </div>
            <div className="max-h-[560px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="pl-5">Document</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDocs.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-2.5">
                          <FileText className="size-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{d.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-mono text-xs">{d.code}</span></TableCell>
                      <TableCell>
                        {d.required ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">Conditional</Badge>
                        )}
                      </TableCell>
                      <TableCell><DocumentStatusBadge status={d.status} /></TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => toast({ title: "Edit document", description: d.name })}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => toast({ title: "Removed", description: `${d.name} removed from checklist.` })}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* All application types grid */}
      <SectionCard
        title="All Application Types"
        description="Quick overview of every configured application type."
        icon={FileCog}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {APP_TYPES.map((t) => {
            const Icon = ICONS[t.key];
            const count = documentsByType[t.key].length;
            const fee = FEE_STRUCTURES.find((f) => f.id === t.baseFeeStructureId);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelected(t.key)}
                className={cn(
                  "group flex flex-col gap-2 rounded-xl border bg-card p-4 text-left shadow-gov transition-all hover:border-primary/40 hover:bg-accent/40",
                  selected === t.key ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4.5" />
                  </div>
                  {t.active ? (
                    <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 text-[10px]">
                      <CircleCheck className="size-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">Inactive</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2 text-xs text-muted-foreground">
                  <span>{count} docs</span>
                  <span className="truncate">{fee ? fee.name.split("—")[0].trim() : "No fee"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Add Document dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add required document</DialogTitle>
            <DialogDescription>
              The document will be added to the checklist of <span className="font-medium text-foreground">{selectedMeta.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDoc} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">Document name <span className="text-destructive">*</span></Label>
              <Input id="doc-name" placeholder="e.g. Structural Stability Certificate" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="doc-code">Code <span className="text-destructive">*</span></Label>
                <Input id="doc-code" placeholder="DOC_STRUCT_CERT" required className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-req">Requirement</Label>
                <Select defaultValue="required">
                  <SelectTrigger id="doc-req"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-desc">Description / acceptance criteria</Label>
              <Textarea id="doc-desc" placeholder="Describe what the document must contain to be accepted by the verifier…" rows={3} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="doc-active" className="text-xs">Active immediately</Label>
                <p className="text-[11px] text-muted-foreground">If off, document will be saved as draft.</p>
              </div>
              <Switch id="doc-active" defaultChecked />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit"><Plus className="size-4" /> Add document</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminApplicationTypes;
