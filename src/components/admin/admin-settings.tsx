"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  ShieldCheck,
  Workflow,
  Building,
  Users,
  Webhook,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SystemSettings } from "@/types";
import { OfficerSettings } from "../officer/officer-settings";
import {
  SectionCard,
  OrganizationSection,
  UsersAccessSection,
  MastersSection,
  WorkflowSection,
  DocumentsSection,
  NotificationsSection,
  SystemSection,
  IntegrationsSection,
  ReportsSection,
  SecuritySection,
  SystemAdminSection,
} from "./admin-settings-sections";
import { ModuleAccessManager, AccessControlMatrix } from "./admin-module-access";

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
  if (a.hideRestrictedModules !== b.hideRestrictedModules) return false;
  if (a.allowedDrawingFormats.length !== b.allowedDrawingFormats.length) return false;
  if (!a.allowedDrawingFormats.every((v) => b.allowedDrawingFormats.includes(v))) return false;
  if (a.allowedDocumentFormats.length !== b.allowedDocumentFormats.length) return false;
  if (!a.allowedDocumentFormats.every((v) => b.allowedDocumentFormats.includes(v))) return false;
  try {
    if (JSON.stringify(a.roleAccessConfig) !== JSON.stringify(b.roleAccessConfig)) return false;
    if (JSON.stringify(a.userAccessConfig ?? {}) !== JSON.stringify(b.userAccessConfig ?? {})) return false;
  } catch {
    return false;
  }
  return true;
}

// ============================================================
// Settings Tabs Configuration (Exactly 6 Clean Tabs)
// ============================================================
export interface SettingsTab {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "general",
    label: "General",
    description: "Portal identity, date & currency formats, upload quotas, and sandbox simulation",
    icon: Sliders,
  },
  {
    id: "organization",
    label: "Organization & Masters",
    description: "Statutory authority profile, departments, designations, planning zones, and masters",
    icon: Building,
  },
  {
    id: "users-access",
    label: "Users & Access",
    description: "User directories, role provisioning, granular module permissions, and auth policies",
    icon: Users,
  },
  {
    id: "workflow-docs",
    label: "Workflows & Documents",
    description: "Approval pipelines, citizen charter SLAs, escalations, and mandatory document checklists",
    icon: Workflow,
  },
  {
    id: "integrations",
    label: "Integrations & Comms",
    description: "External department APIs, payment gateways, SMS/email alerts, and scheduled reports",
    icon: Webhook,
  },
  {
    id: "system-security",
    label: "System & Security",
    description: "System rule parameters, security audit trail, diagnostics, and database maintenance",
    icon: ShieldAlert,
  },
];

// ============================================================
// Main AdminSettings Component
// ============================================================
export function AdminSettings() {
  const { toast } = useToast();
  const storeSettings = useAppStore((s) => s.systemSettings);
  const updateSystemSettings = useAppStore((s) => s.updateSystemSettings);

  // Local form state
  const [form, setForm] = React.useState<SystemSettings>(storeSettings);
  const [saving, setSaving] = React.useState(false);
  const user = useAppStore((s) => s.user);

  // Exactly 6 Tabs State
  const [activeTab, setActiveTab] = React.useState<string>("general");

  if (user?.role === "COMMISSIONER" || user?.role === "ADDITIONAL_COMMISSIONER") {
    return <OfficerSettings />;
  }

  const dirty = !settingsEqual(form, storeSettings);

  const currentTabDef =
    SETTINGS_TABS.find((t) => t.id === activeTab) || SETTINGS_TABS[0];

  function setField<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue(
    key: "allowedDrawingFormats" | "allowedDocumentFormats",
    value: string,
    on: boolean
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
    <form onSubmit={handleSave} className="flex-1 flex flex-col h-full min-h-0" aria-label="System settings form">
      {/* Main Settings Card in Beige & Maroon Theme */}
      <div className="flex-1 flex flex-col min-h-0 rounded-xl border-2 border-[#801824]/20 bg-white shadow-xs overflow-hidden">
        {/* Top 6 Tabs Bar */}
        <div className="bg-[#FAF4EB] border-b border-[#E0D2BE] px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5" role="tablist" aria-label="Settings Tabs">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
                    isActive
                      ? "bg-[#801824] text-[#FDF6ED] border-[#801824] shadow-xs"
                      : "bg-white/80 text-[#5C1A20] border-[#EADBCE] hover:bg-[#F3EADF] hover:text-[#801824]"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Context Subheader */}
        <div className="bg-[#FDFBF7] border-b border-[#EADBCE]/80 px-4 sm:px-5 py-2 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <currentTabDef.icon className="size-4 text-[#801824] shrink-0" />
            <span className="text-xs font-bold text-[#4A1017]">{currentTabDef.label}</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-[11px] text-slate-500 truncate hidden sm:inline">{currentTabDef.description}</span>
          </div>
        </div>

        {/* Vertically Scrollable Page Content Area with Grouped Layout */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6">
          {/* ============================================================ */}
          {/* TAB 1: GENERAL                                               */}
          {/* ============================================================ */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Group 1: Portal Branding */}
              <SectionCard
                icon={Building2}
                title="Portal Identity & Branding"
                subtitle="Project title and subtitle displayed across the portal top bar and authentication screen"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldInput
                    id="portalName"
                    label="Portal Name"
                    description="Project name displayed across the login screen, top bar, and menu header."
                    value={form.portalName}
                    onChange={(v) => setField("portalName", v)}
                    placeholder="Building Permission System"
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
              </SectionCard>

              {/* Group 2: Formats & Localization */}
              <SectionCard
                icon={FileText}
                title="Formats & Localization"
                subtitle="Standard date display format, active billing currency, and accepted file extensions"
              >
                <div className="space-y-5">
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
                      description="Currency used for fee calculation, receipts, and invoices."
                      value={form.currency}
                      onChange={(v) => setField("currency", v)}
                      options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
                    />
                  </div>

                  <Separator className="bg-[#EADBCE]" />

                  <FormatToggleGroup
                    idPrefix="drawing-format"
                    label="Allowed Drawing Formats"
                    description="File extensions accepted for architectural CAD drawings."
                    formats={DRAWING_FORMATS}
                    selected={form.allowedDrawingFormats}
                    onToggle={(v, on) => toggleArrayValue("allowedDrawingFormats", v, on)}
                  />
                  <FormatToggleGroup
                    idPrefix="document-format"
                    label="Allowed Document Formats"
                    description="File extensions accepted for supporting PDF/image documents."
                    formats={DOCUMENT_FORMATS}
                    selected={form.allowedDocumentFormats}
                    onToggle={(v, on) => toggleArrayValue("allowedDocumentFormats", v, on)}
                  />
                </div>
              </SectionCard>

              {/* Group 3: Upload Quotas & Session Limits */}
              <SectionCard
                icon={Sliders}
                title="Upload Quotas & Session Limits"
                subtitle="Maximum file size limits per upload and idle user session timeout"
              >
                <div className="space-y-4">
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
                  <div className="rounded-xl border border-[#EADBCE] bg-[#FAF4EB] p-4 text-xs text-[#5C1A20]">
                    <p className="font-bold text-[#801824]">Notes</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
                      <li>File size limit is enforced per upload on both drawings and documents.</li>
                      <li>Session timeout counts idle time only — active navigation resets the timer.</li>
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* Group 4: Sandbox & Demo Mode */}
              <SectionCard
                icon={FlaskConical}
                title="Sandbox & Simulation Environment"
                subtitle="Toggle simulation mode with mocked SMS and payment gateway integrations"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF4EB] border border-[#EADBCE] text-[#801824]">
                        <FlaskConical className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#4A1017]">Enable Demo Mode</p>
                        <p className="text-[11px] text-slate-600">
                          When enabled, the portal uses mocked SMS/payment gateways and seed applications.
                          Disable for production deployment.
                        </p>
                        <p className="text-[11px] text-slate-500 pt-0.5">
                          Current status:{" "}
                          <span className={storeSettings.demoMode ? "font-bold text-[#801824]" : "font-bold text-emerald-700"}>
                            {storeSettings.demoMode ? "Demo Mode Active" : "Production Mode Active"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="demoMode"
                      checked={form.demoMode}
                      onCheckedChange={(v) => setField("demoMode", v)}
                      className="data-[state=checked]:bg-[#801824]"
                      aria-label="Toggle demo mode"
                    />
                  </div>
                  <div className="rounded-xl border border-[#EADBCE] bg-[#FAF4EB] p-4 text-xs text-[#5C1A20]">
                    <p className="font-bold text-[#801824]">Demo mode limitations</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
                      <li>SMS notifications are logged to the database but not delivered to real recipients.</li>
                      <li>Payments are mocked — no charges are made through real payment gateways.</li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ORGANIZATION & MASTERS                                */}
          {/* ============================================================ */}
          {activeTab === "organization" && (
            <div className="space-y-6">
              <OrganizationSection />
              <MastersSection />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: USERS & ACCESS                                        */}
          {/* ============================================================ */}
          {activeTab === "users-access" && (
            <div className="space-y-6">
              <UsersAccessSection
                roleAccessConfig={form.roleAccessConfig}
                onRoleAccessChange={(cfg) => setField("roleAccessConfig", cfg)}
                userAccessConfig={form.userAccessConfig}
                onUserAccessChange={(cfg) => setField("userAccessConfig", cfg)}
                hideRestrictedModules={form.hideRestrictedModules}
                onHideRestrictedModulesChange={(val) => setField("hideRestrictedModules", val)}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: WORKFLOWS & DOCUMENTS                                 */}
          {/* ============================================================ */}
          {activeTab === "workflow-docs" && (
            <div className="space-y-6">
              <WorkflowSection />
              <DocumentsSection
                form={form}
                onFormatToggle={toggleArrayValue}
                onFileSizeChange={(v) => setField("maxFileSizeMB", v)}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: INTEGRATIONS & COMMS                                  */}
          {/* ============================================================ */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <IntegrationsSection />
              <NotificationsSection />
              <ReportsSection />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: SYSTEM & SECURITY                                     */}
          {/* ============================================================ */}
          {activeTab === "system-security" && (
            <div className="space-y-6">
              <SystemSection form={form} setField={setField} />
              <SecuritySection />
              <SystemAdminSection />
            </div>
          )}
        </div>

        {/* Integrated Card Footer Action Bar */}
        <div className="border-t border-[#EADBCE] bg-[#FAF7F2] px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5C1A20]" aria-live="polite">
            <Settings className="size-4 text-[#801824]" />
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
              className="border-[#DCD5C8] text-[#801824] bg-white hover:bg-[#F3EADF] font-semibold text-xs h-8 px-4 rounded-lg cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!dirty || saving}
              className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] font-bold text-xs h-8 px-5 rounded-lg shadow-xs cursor-pointer"
            >
              <Save className="size-3.5 mr-1" />
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Form Sub-components
// ============================================================

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
      <Label htmlFor={id} className="text-xs font-bold text-[#4A1017]">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs border-[#EADBCE] bg-white text-slate-800 focus-visible:ring-[#801824] focus-visible:border-[#801824] rounded-lg"
      />
      <p className="text-[11px] text-slate-500">{description}</p>
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
      <Label htmlFor={id} className="text-xs font-bold text-[#4A1017]">
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
        className="h-9 text-xs border-[#EADBCE] bg-white text-slate-800 focus-visible:ring-[#801824] focus-visible:border-[#801824] rounded-lg"
      />
      <p className="text-[11px] text-slate-500">{description}</p>
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
      <Label htmlFor={id} className="text-xs font-bold text-[#4A1017]">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-9 text-xs border-[#EADBCE] bg-white text-slate-800 focus:ring-[#801824] rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-[#EADBCE] bg-white text-slate-800">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs hover:bg-[#F3EADF] focus:bg-[#F3EADF] cursor-pointer">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-slate-500">{description}</p>
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
        <p className="text-xs font-bold text-[#4A1017]">{label}</p>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {formats.map((fmt) => {
          const on = selected.includes(fmt);
          const fieldId = `${idPrefix}-${fmt}`;
          return (
            <div
              key={fmt}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs transition-all",
                on
                  ? "border-[#801824] bg-[#FDF6ED] text-[#801824] shadow-xs font-bold"
                  : "border-[#EADBCE] bg-white text-slate-600 hover:bg-[#FAF4EB]"
              )}
            >
              <Label htmlFor={fieldId} className="flex-1 cursor-pointer font-mono text-xs">
                {fmt}
              </Label>
              <Switch
                id={fieldId}
                checked={on}
                onCheckedChange={(v) => onToggle(fmt, v)}
                className="data-[state=checked]:bg-[#801824]"
                aria-label={`${on ? "Disable" : "Enable"} ${fmt} format`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Re-export ModuleAccessManager and AccessControlMatrix
export { ModuleAccessManager, AccessControlMatrix } from "./admin-module-access";

export default AdminSettings;
