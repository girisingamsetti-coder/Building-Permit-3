"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
} from "@/components/design-system/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Building2,
  Save,
  RotateCcw,
  FileText,
  Sliders,
  FlaskConical,
  Coins,
  HardDrive,
  CircleDot,
  CircleCheck,
  CircleAlert,
  ShieldCheck,
  Eye,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SystemSettings, ModuleAccessLevel } from "@/types";
import { AdminWorkflow } from "./admin-workflow";
import { ClipboardList } from "lucide-react";
import { OfficerSettings } from "../officer/officer-settings";

// ============================================================
// Constants — option lists for select / toggle inputs
// ============================================================
const DRAWING_FORMATS = ["DWG", "DXF", "PDF"] as const;
const DOCUMENT_FORMATS = ["PDF", "JPG", "PNG"] as const;
const DATE_FORMATS = ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;
const CURRENCIES = [
  { value: "INR", label: "₹ Indian Rupee (INR)" },
  { value: "USD", label: "$ US Dollar (USD)" },
  { value: "EUR", label: "€ Euro (EUR)" },
  { value: "GBP", label: "£ British Pound (GBP)" },
] as const;

// ============================================================
// Deep-equal for SystemSettings — used for the dirty indicator
// ============================================================
function settingsEqual(a: SystemSettings, b: SystemSettings): boolean {
  if (a.portalName !== b.portalName) return false;
  if (a.portalSubtitle !== b.portalSubtitle) return false;
  if (a.dateFormat !== b.dateFormat) return false;
  if (a.currency !== b.currency) return false;
  if (a.maxFileSizeMB !== b.maxFileSizeMB) return false;
  if (a.sessionTimeoutMinutes !== b.sessionTimeoutMinutes) return false;
  if (a.demoMode !== b.demoMode) return false;
  if (a.allowedDrawingFormats.length !== b.allowedDrawingFormats.length) return false;
  if (!a.allowedDrawingFormats.every((v) => b.allowedDrawingFormats.includes(v))) return false;
  if (a.allowedDocumentFormats.length !== b.allowedDocumentFormats.length) return false;
  if (!a.allowedDocumentFormats.every((v) => b.allowedDocumentFormats.includes(v))) return false;
  // Compare roleAccessConfig
  try {
    if (JSON.stringify(a.roleAccessConfig) !== JSON.stringify(b.roleAccessConfig)) return false;
  } catch { return false; }
  return true;
}

// ============================================================
// Main component
// ============================================================
export function AdminSettings() {
  const { toast } = useToast();
  const storeSettings = useAppStore((s) => s.systemSettings);
  const updateSystemSettings = useAppStore((s) => s.updateSystemSettings);
  const navigate = useAppStore((s) => s.navigate);

  // Local form state — initialised once from the store (the "draft" being edited)
  const [form, setForm] = React.useState<SystemSettings>(storeSettings);
  const [saving, setSaving] = React.useState(false);
  const user = useAppStore((s) => s.user);

  if (user?.role === "COMMISSIONER" || user?.role === "ADDITIONAL_COMMISSIONER") {
    return <OfficerSettings />;
  }

  const dirty = !settingsEqual(form, storeSettings);

  function setField<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue(
    key: "allowedDrawingFormats" | "allowedDocumentFormats",
    value: string,
    on: boolean,
  ) {
    setForm((prev) => {
      const current = prev[key];
      const next = on
        ? current.includes(value)
          ? current
          : [...current, value]
        : current.filter((v) => v !== value);
      return { ...prev, [key]: next };
    });
  }

  function handleReset() {
    setForm(storeSettings);
    toast({
      title: "Changes discarded",
      description: "Form has been reset to the latest saved system settings.",
    });
  }

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (saving) return;
    if (!dirty) {
      toast({
        title: "No changes to save",
        description: "Form values already match the saved system settings.",
      });
      return;
    }
    setSaving(true);
    // Brief delay so the loading state is perceptible (in-memory store would otherwise save instantly)
    window.setTimeout(() => {
      updateSystemSettings({ ...form });
      setSaving(false);
      toast({
        title: "Settings saved",
        description: "System settings updated. An audit event has been logged.",
      });
    }, 250);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6" aria-label="System settings form">
      <PageHeader
        title="System Settings"
        description="Authority-wide configuration — portal identity, formats, file limits and demo mode. All changes are audit-logged."
        icon={Settings}
        breadcrumbs={[
          { label: "Administration", onClick: () => navigate("admin-dashboard") },
          { label: "System Settings" },
        ]}
        badge={
          dirty ? (
            <Badge
              variant="outline"
              className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
              aria-live="polite"
            >
              <CircleAlert className="size-3" /> Unsaved changes
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
            >
              <CircleCheck className="size-3" /> Saved
            </Badge>
          )
        }
      />

      {/* KPI / snapshot cards — current store values */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SnapshotCard
          icon={Building2}
          label="Portal Name"
          value={storeSettings.portalName}
          hint={storeSettings.portalSubtitle}
          cls="bg-primary/10 text-primary"
        />
        <SnapshotCard
          icon={Coins}
          label="Currency"
          value={storeSettings.currency}
          hint={`Date format: ${storeSettings.dateFormat}`}
          cls="bg-info/10 text-info"
        />
        <SnapshotCard
          icon={HardDrive}
          label="Max File Size"
          value={`${storeSettings.maxFileSizeMB} MB`}
          hint={`Session timeout: ${storeSettings.sessionTimeoutMinutes} min`}
          cls="bg-success/10 text-success"
        />
        <SnapshotCard
          icon={FlaskConical}
          label="Demo Mode"
          value={storeSettings.demoMode ? "Enabled" : "Disabled"}
          hint={storeSettings.demoMode ? "Mock gateways & seed data" : "Production mode"}
          cls={
            storeSettings.demoMode
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-muted text-muted-foreground"
          }
        />
      </div>

      <SectionCard
        title="Configuration"
        description="Edit portal settings, formatting rules, upload limits and demo-mode toggle."
        icon={Sliders}
        action={
          dirty ? (
            <Badge
              variant="outline"
              className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
            >
              <CircleDot className="size-3" /> Unsaved changes
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-muted/60 text-muted-foreground">
              <CircleCheck className="size-3" /> In sync with store
            </Badge>
          )
        }
      >
        <Tabs defaultValue="general" className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto" aria-label="System settings sections">
            <TabsTrigger value="general">
              <Building2 className="size-3.5" /> General
            </TabsTrigger>
            <TabsTrigger value="formats">
              <FileText className="size-3.5" /> Formats
            </TabsTrigger>
            <TabsTrigger value="limits">
              <Sliders className="size-3.5" /> Limits
            </TabsTrigger>
            <TabsTrigger value="demo">
              <FlaskConical className="size-3.5" /> Demo Mode
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardList className="size-3.5" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="access">
              <ShieldCheck className="size-3.5" /> Access Control
            </TabsTrigger>
          </TabsList>

          {/* ---------- General ---------- */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput
                id="portalName"
                label="Portal Name"
                description="Primary brand name shown in the top bar and on the login screen."
                value={form.portalName}
                onChange={(v) => setField("portalName", v)}
                placeholder="LTP Approval"
                maxLength={80}
              />
              <FieldInput
                id="portalSubtitle"
                label="Portal Subtitle"
                description="Short descriptor shown beneath the portal name."
                value={form.portalSubtitle}
                onChange={(v) => setField("portalSubtitle", v)}
                placeholder="Building Permit Management System"
                maxLength={120}
              />
            </div>
          </TabsContent>

          {/* ---------- Formats ---------- */}
          <TabsContent value="formats" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSelect
                id="dateFormat"
                label="Date Format"
                description="Display format used across the portal for all dates."
                value={form.dateFormat}
                onChange={(v) => setField("dateFormat", v)}
                options={DATE_FORMATS.map((d) => ({ value: d, label: d }))}
              />
              <FieldSelect
                id="currency"
                label="Currency"
                description="Currency used for fee calculation, receipts and invoices."
                value={form.currency}
                onChange={(v) => setField("currency", v)}
                options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>

            <Separator />

            <FormatToggleGroup
              idPrefix="drawing-format"
              label="Allowed Drawing Formats"
              description="File extensions accepted for architectural drawing uploads."
              formats={DRAWING_FORMATS}
              selected={form.allowedDrawingFormats}
              onToggle={(v, on) => toggleArrayValue("allowedDrawingFormats", v, on)}
            />
            <FormatToggleGroup
              idPrefix="document-format"
              label="Allowed Document Formats"
              description="File extensions accepted for supporting document uploads."
              formats={DOCUMENT_FORMATS}
              selected={form.allowedDocumentFormats}
              onToggle={(v, on) => toggleArrayValue("allowedDocumentFormats", v, on)}
            />
          </TabsContent>

          {/* ---------- Limits ---------- */}
          <TabsContent value="limits" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldNumber
                id="maxFileSizeMB"
                label="Max File Size (MB)"
                description="Maximum size per individual file upload (drawings + documents)."
                value={form.maxFileSizeMB}
                min={1}
                max={100}
                onChange={(v) => setField("maxFileSizeMB", v)}
              />
              <FieldNumber
                id="sessionTimeoutMinutes"
                label="Session Timeout (minutes)"
                description="Idle session expiry applied to all signed-in users."
                value={form.sessionTimeoutMinutes}
                min={5}
                max={480}
                onChange={(v) => setField("sessionTimeoutMinutes", v)}
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
              <p className="font-bold text-foreground">Notes</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>File size limit is enforced per upload on both drawings and documents.</li>
                <li>Session timeout counts idle time only — active navigation resets the timer.</li>
              </ul>
            </div>
          </TabsContent>

          {/* ---------- Demo Mode ---------- */}
          <TabsContent value="demo" className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FlaskConical className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Enable Demo Mode</p>
                  <p className="text-xs text-muted-foreground">
                    When enabled, the portal uses mock SMS / payment gateways and seed data.
                    Disable for production deployments with real integrations.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Current status:{" "}
                    <span
                      className={
                        storeSettings.demoMode
                          ? "font-medium text-amber-600 dark:text-amber-400"
                          : "font-medium text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {storeSettings.demoMode ? "Demo mode active" : "Production mode"}
                    </span>
                  </p>
                </div>
              </div>
              <Switch
                id="demoMode"
                checked={form.demoMode}
                onCheckedChange={(v) => setField("demoMode", v)}
                aria-label="Toggle demo mode"
              />
            </div>
            <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <p className="font-bold">Demo mode limitations</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>SMS notifications are logged to the database but not delivered to real recipients.</li>
                <li>Payments are mocked — no charges are made through the payment gateway.</li>
                <li>Seed data is loaded on first run and may be reset by an administrator.</li>
              </ul>
            </div>
          </TabsContent>

          {/* ---------- Tasks / Workflow ---------- */}
          <TabsContent value="tasks" className="space-y-4">
            <AdminWorkflow />
          </TabsContent>

          {/* ---------- Access Control ---------- */}
          <TabsContent value="access" className="space-y-4">
            <AccessControlMatrix
              config={form.roleAccessConfig ?? {}}
              onChange={(cfg) => setField("roleAccessConfig", cfg)}
            />
          </TabsContent>
        </Tabs>
      </SectionCard>

      {/* ---------- Sticky action bar ---------- */}
      <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-gov backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
          <Settings className="size-3.5" />
          <span>
            {dirty
              ? "You have unsaved changes that have not been persisted."
              : "All changes are saved."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!dirty || saving}
          >
            <RotateCcw className="size-3.5" /> Reset
          </Button>
          <Button type="submit" size="sm" disabled={!dirty || saving}>
            <Save className="size-3.5" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Sub-components
// ============================================================

function SnapshotCard({
  icon: Icon,
  label,
  value,
  hint,
  cls,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  cls: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}>
        <Icon className="size-4" />
      </div>
      <p className="mt-2 truncate text-lg font-semibold" title={value}>
        {value}
      </p>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      {hint && (
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground" title={hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

function FieldInput({
  id,
  label,
  description,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function FieldNumber({
  id,
  label,
  description,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          onChange(n);
        }}
      />
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function FieldSelect({
  id,
  label,
  description,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function FormatToggleGroup({
  idPrefix,
  label,
  description,
  formats,
  selected,
  onToggle,
}: {
  idPrefix: string;
  label: string;
  description: string;
  formats: readonly string[];
  selected: string[];
  onToggle: (value: string, on: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {formats.map((fmt) => {
          const on = selected.includes(fmt);
          const fieldId = `${idPrefix}-${fmt}`;
          return (
            <div
              key={fmt}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors",
                on
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:bg-muted/30",
              )}
            >
              <Label htmlFor={fieldId} className="flex-1 cursor-pointer font-mono font-medium">
                {fmt}
              </Label>
              <Switch
                id={fieldId}
                checked={on}
                onCheckedChange={(v) => onToggle(fmt, v)}
                aria-label={`${on ? "Disable" : "Enable"} ${fmt} format`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Access Control Matrix
// ============================================================
const ROLES_FOR_ACCESS = [
  { key: "LTP",                  label: "LTP" },
  { key: "TPA",                  label: "TPA" },
  { key: "ZDD",                  label: "ZDD" },
  { key: "ZJD",                  label: "ZJD" },
  { key: "ADDITIONAL_COMMISSIONER", label: "Addl. Commissioner" },
  { key: "COMMISSIONER",         label: "Commissioner" },
  { key: "ADMIN",                label: "Admin" },
] as const;

const MODULES_FOR_ACCESS = [
  { id: "dashboard",             label: "Dashboard" },
  { id: "application-submission",label: "Applications" },
  { id: "application-status",    label: "Application Status" },
  { id: "proceeding-status",     label: "Compliance & Regulations" },
  { id: "commencement",          label: "Work Commencement" },
  { id: "occupancy",             label: "Occupancy (OC)" },
  { id: "change-of-ltp",         label: "LTP Change" },
  { id: "reports",               label: "Reports" },
] as const;

const ACCESS_OPTIONS: { value: ModuleAccessLevel; label: string; color: string }[] = [
  { value: "full",  label: "Full",  color: "bg-emerald-500" },
  { value: "read",  label: "Read",  color: "bg-blue-400" },
  { value: "none",  label: "None",  color: "bg-slate-300" },
];

function AccessControlMatrix({
  config,
  onChange,
}: {
  config: Record<string, Record<string, ModuleAccessLevel>>;
  onChange: (cfg: Record<string, Record<string, ModuleAccessLevel>>) => void;
}) {
  function getLevel(role: string, moduleId: string): ModuleAccessLevel {
    return config[role]?.[moduleId] ?? "full";
  }

  function setLevel(role: string, moduleId: string, level: ModuleAccessLevel) {
    const next = {
      ...config,
      [role]: { ...(config[role] ?? {}), [moduleId]: level },
    };
    onChange(next);
  }

  function setRowAll(role: string, level: ModuleAccessLevel) {
    const next = { ...config, [role]: {} as Record<string, ModuleAccessLevel> };
    MODULES_FOR_ACCESS.forEach((m) => { next[role][m.id] = level; });
    onChange(next);
  }

  function setColAll(moduleId: string, level: ModuleAccessLevel) {
    const next = { ...config };
    ROLES_FOR_ACCESS.forEach((r) => {
      next[r.key] = { ...(next[r.key] ?? {}), [moduleId]: level };
    });
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Module Access Control</p>
          <p className="text-xs text-muted-foreground">
            Configure what each role can do in every module.
            All users see all modules — access level controls their capabilities within each module.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            {ACCESS_OPTIONS.map((o) => (
              <span key={o.value} className="flex items-center gap-1.5 font-medium text-foreground">
                <span className={`inline-block size-2.5 rounded-full ${o.color}`} />
                {o.label === "Full" ? "Full Access" : o.label === "Read" ? "Read Only" : "No Access"}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="px-3 py-2.5 text-left font-bold text-foreground w-40 min-w-[140px]">Role</th>
              {MODULES_FOR_ACCESS.map((m) => (
                <th key={m.id} className="px-2 py-2.5 text-center font-bold text-foreground min-w-[90px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] leading-tight">{m.label}</span>
                    {/* Column quick-set buttons */}
                    <div className="flex gap-0.5">
                      {ACCESS_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          title={`Set all to ${o.label}`}
                          onClick={() => setColAll(m.id, o.value)}
                          className={`size-2.5 rounded-full ${o.color} opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                        />
                      ))}
                    </div>
                  </div>
                </th>
              ))}
              <th className="px-2 py-2.5 text-center font-bold text-muted-foreground min-w-[80px] text-[10px]">Set Row</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {ROLES_FOR_ACCESS.map((role) => (
              <tr key={role.key} className="hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2.5 font-bold text-foreground whitespace-nowrap">
                  {role.label}
                </td>
                {MODULES_FOR_ACCESS.map((m) => {
                  const current = getLevel(role.key, m.id);
                  return (
                    <td key={m.id} className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {ACCESS_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            title={o.value === "full" ? "Full Access" : o.value === "read" ? "Read Only" : "No Access"}
                            onClick={() => setLevel(role.key, m.id, o.value)}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-bold border cursor-pointer transition-all",
                              current === o.value
                                ? o.value === "full"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-sm"
                                  : o.value === "read"
                                  ? "bg-blue-100 text-blue-800 border-blue-400 shadow-sm"
                                  : "bg-slate-200 text-slate-600 border-slate-400 shadow-sm"
                                : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50 opacity-40 hover:opacity-70"
                            )}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  );
                })}
                {/* Row quick-set */}
                <td className="px-2 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {ACCESS_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        title={`Set entire row to ${o.label}`}
                        onClick={() => setRowAll(role.key, o.value)}
                        className={`size-3 rounded-full ${o.color} opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground rounded-lg border border-border bg-muted/20 px-3 py-2">
        <strong>Note:</strong> Changes take effect after clicking &quot;Save Changes&quot;. The access configuration controls module-level capabilities — 
        &quot;Full&quot; allows all actions, &quot;Read&quot; allows viewing only, &quot;None&quot; hides action buttons but still shows the module.
      </p>
    </div>
  );
}

export default AdminSettings;
