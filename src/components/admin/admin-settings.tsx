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
  CircleDot,
  ShieldCheck,
  Eye,
  Lock,
  Workflow,
  Building,
  Users,
  Database,
  FolderOpen,
  Bell,
  Cpu,
  Webhook,
  BarChart3,
  ShieldAlert,
  Server,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SystemSettings, ModuleAccessLevel } from "@/types";
import { AdminWorkflow } from "./admin-workflow";
import { OfficerSettings } from "../officer/officer-settings";
import {
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
  // Compare roleAccessConfig and userAccessConfig
  try {
    if (JSON.stringify(a.roleAccessConfig) !== JSON.stringify(b.roleAccessConfig)) return false;
    if (JSON.stringify(a.userAccessConfig ?? {}) !== JSON.stringify(b.userAccessConfig ?? {})) return false;
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
    <form onSubmit={handleSave} className="flex-1 flex flex-col h-full min-h-0" aria-label="System settings form">
      {/* Main Configuration Card in Beige & Maroon Theme */}
      <div className="flex-1 flex flex-col min-h-0 rounded-xl border-2 border-[#801824]/20 bg-white shadow-xs overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5 pb-0">
          <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0 gap-2">
            <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1.5 rounded-xl flex gap-1.5 overflow-x-auto h-auto no-scrollbar w-full justify-start flex-nowrap shrink-0" aria-label="System settings sections">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Building2 className="size-3.5" /> General
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Building className="size-3.5" /> Organization
              </TabsTrigger>
              <TabsTrigger
                value="users-access"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Users className="size-3.5" /> Users & Access
              </TabsTrigger>
              <TabsTrigger
                value="masters"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Database className="size-3.5" /> Masters
              </TabsTrigger>
              <TabsTrigger
                value="workflow"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Workflow className="size-3.5" /> Workflow
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <FolderOpen className="size-3.5" /> Documents
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Bell className="size-3.5" /> Notifications
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Cpu className="size-3.5" /> System
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Webhook className="size-3.5" /> Integrations
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <BarChart3 className="size-3.5" /> Reports
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <ShieldAlert className="size-3.5" /> Security
              </TabsTrigger>
              <TabsTrigger
                value="system-admin"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Server className="size-3.5" /> System Administration
              </TabsTrigger>
              <TabsTrigger
                value="formats"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <FileText className="size-3.5" /> Formats
              </TabsTrigger>
              <TabsTrigger
                value="limits"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Sliders className="size-3.5" /> Limits
              </TabsTrigger>
              <TabsTrigger
                value="demo"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <FlaskConical className="size-3.5" /> Demo Mode
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] data-[state=active]:shadow-xs text-[#5C1A20] font-semibold text-xs rounded-lg px-3 py-2 hover:bg-[#F3EADF] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <ShieldCheck className="size-3.5" /> Module Access
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0 pr-1 mt-1 pb-4">
              {/* ---------- General ---------- */}
              <TabsContent value="general" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldInput
                  id="portalName"
                  label="Portal Name"
                  description="Project name displayed across the login screen, top bar, and left menu bar header."
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
            </TabsContent>

            {/* ---------- Formats ---------- */}
            <TabsContent value="formats" className="space-y-4 pt-3">
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

              <div className="border-t border-[#EADBCE] my-4" />

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
            <TabsContent value="limits" className="space-y-4 pt-3">
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
            </TabsContent>

            {/* ---------- Demo Mode ---------- */}
            <TabsContent value="demo" className="space-y-4 pt-3">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-[#EADBCE] bg-[#FDFBF7] p-5">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FBF3E4] border border-[#EADBCE] text-[#801824]">
                    <FlaskConical className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#4A1017]">Enable Demo Mode</p>
                    <p className="text-xs text-slate-600">
                      When enabled, the portal uses mock SMS / payment gateways and seed data.
                      Disable for production deployments with real integrations.
                    </p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Current status:{" "}
                      <span
                        className={
                          storeSettings.demoMode
                            ? "font-bold text-[#801824]"
                            : "font-bold text-emerald-700"
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
                  className="data-[state=checked]:bg-[#801824]"
                  aria-label="Toggle demo mode"
                />
              </div>
              <div className="rounded-xl border border-[#EADBCE] bg-[#FAF4EB] p-4 text-xs text-[#5C1A20]">
                <p className="font-bold text-[#801824]">Demo mode limitations</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
                  <li>SMS notifications are logged to the database but not delivered to real recipients.</li>
                  <li>Payments are mocked — no charges are made through the payment gateway.</li>
                  <li>Seed data is loaded on first run and may be reset by an administrator.</li>
                </ul>
              </div>
            </TabsContent>

            {/* ---------- Organization ---------- */}
            <TabsContent value="organization" className="space-y-4 pt-3">
              <OrganizationSection />
            </TabsContent>

            {/* ---------- Users & Access ---------- */}
            <TabsContent value="users-access" className="space-y-4 pt-3">
              <UsersAccessSection
                roleAccessConfig={form.roleAccessConfig}
                onRoleAccessChange={(cfg) => setField("roleAccessConfig", cfg)}
                userAccessConfig={form.userAccessConfig}
                onUserAccessChange={(cfg) => setField("userAccessConfig", cfg)}
                hideRestrictedModules={form.hideRestrictedModules}
                onHideRestrictedModulesChange={(val) => setField("hideRestrictedModules", val)}
              />
            </TabsContent>

            {/* ---------- Masters ---------- */}
            <TabsContent value="masters" className="space-y-4 pt-3">
              <MastersSection />
            </TabsContent>

            {/* ---------- Workflow ---------- */}
            <TabsContent value="workflow" className="space-y-4 pt-3">
              <WorkflowSection />
            </TabsContent>

            {/* ---------- Documents ---------- */}
            <TabsContent value="documents" className="space-y-4 pt-3">
              <DocumentsSection
                form={form}
                onFormatToggle={toggleArrayValue}
                onFileSizeChange={(v) => setField("maxFileSizeMB", v)}
              />
            </TabsContent>

            {/* ---------- Notifications ---------- */}
            <TabsContent value="notifications" className="space-y-4 pt-3">
              <NotificationsSection />
            </TabsContent>

            {/* ---------- System ---------- */}
            <TabsContent value="system" className="space-y-4 pt-3">
              <SystemSection form={form} setField={setField} />
            </TabsContent>

            {/* ---------- Integrations ---------- */}
            <TabsContent value="integrations" className="space-y-4 pt-3">
              <IntegrationsSection />
            </TabsContent>

            {/* ---------- Reports ---------- */}
            <TabsContent value="reports" className="space-y-4 pt-3">
              <ReportsSection />
            </TabsContent>

            {/* ---------- Security ---------- */}
            <TabsContent value="security" className="space-y-4 pt-3">
              <SecuritySection />
            </TabsContent>

            {/* ---------- System Administration ---------- */}
            <TabsContent value="system-admin" className="space-y-4 pt-3">
              <SystemAdminSection />
            </TabsContent>

            {/* ---------- Access Control / Module Access ---------- */}
            <TabsContent value="access" className="space-y-4 pt-3">
              <ModuleAccessManager
                config={form.roleAccessConfig ?? {}}
                onChange={(cfg) => setField("roleAccessConfig", cfg)}
                userConfig={form.userAccessConfig ?? {}}
                onUserConfigChange={(cfg) => setField("userAccessConfig", cfg)}
                hideRestricted={form.hideRestrictedModules ?? false}
                onHideRestrictedChange={(val) => setField("hideRestrictedModules", val)}
                onDirectSave={(newRoleCfg, newUserCfg, newHide) => {
                  setField("roleAccessConfig", newRoleCfg);
                  setField("userAccessConfig", newUserCfg);
                  setField("hideRestrictedModules", newHide);
                  updateSystemSettings({
                    roleAccessConfig: newRoleCfg,
                    userAccessConfig: newUserCfg,
                    hideRestrictedModules: newHide,
                  });
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ---------- Integrated Card Footer Action Bar in Beige & Maroon Theme ---------- */}
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
// Sub-components
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
