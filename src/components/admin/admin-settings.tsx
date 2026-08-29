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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Building2,
  ShieldCheck,
  Plug,
  Bell,
  DatabaseBackup,
  Save,
  CircleCheck,
  CircleAlert,
  CircleDot,
  Wrench,
  Clock,
  Server,
  CreditCard,
  HardDrive,
  Smartphone,
  Globe,
  Lock,
  KeyRound,
  CalendarClock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Integration mock status
interface Integration {
  id: string;
  label: string;
  icon: typeof Server;
  status: "Operational" | "Degraded" | "Not configured";
  note: string;
  configured: boolean;
}

const INTEGRATIONS: Integration[] = [
  { id: "sms", label: "SMS Gateway — MSG91", icon: Smartphone, status: "Operational", note: "Sender ID: MUNOTP · DLT template approved", configured: true },
  { id: "pay", label: "Payment Gateway — BillDesk", icon: CreditCard, status: "Operational", note: "Sandbox merchant: MUNPUNE0421", configured: true },
  { id: "storage", label: "Object Storage — S3", icon: HardDrive, status: "Operational", note: "Bucket: ltp-uploads-prod", configured: true },
  { id: "dms", label: "DMS / e-Office", icon: Server, status: "Not configured", note: "Optional integration with State e-Office", configured: false },
  { id: "gis", label: "GIS Layer — Bhuvan", icon: Globe, status: "Degraded", note: "Tile service intermittent", configured: true },
];

export function AdminSettings() {
  const { toast } = useToast();
  const [maintenance, setMaintenance] = React.useState(false);
  const [twoFA, setTwoFA] = React.useState(true);
  const [defaultSms, setDefaultSms] = React.useState(true);
  const [defaultEmail, setDefaultEmail] = React.useState(false);
  const [defaultInApp, setDefaultInApp] = React.useState(true);

  function handleSave(section: string, e: React.FormEvent) {
    e.preventDefault();
    toast({
      title: `${section} saved`,
      description: "Settings have been persisted. Audit event logged.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Authority-wide configuration — general identity, security policies, third-party integrations, notification defaults and backup schedules."
        icon={Settings}
        breadcrumbs={[{ label: "Administration" }, { label: "System Settings" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">Production</Badge>}
      />

      {/* General */}
      <form onSubmit={(e) => handleSave("General settings", e)}>
        <SectionCard
          title="General"
          description="Authority identity and localisation."
          icon={Building2}
          action={<DemoBadge />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Authority name" id="auth-name" defaultValue="Municipal Corporation of Pune" />
            <Field label="Portal name" id="portal-name" defaultValue="LTP Approval" />
            <Field label="Jurisdiction" id="jurisdiction" defaultValue="Maharashtra, India" />
            <div className="space-y-1.5">
              <Label htmlFor="tz">Timezone</Label>
              <Select defaultValue="IST">
                <SelectTrigger id="tz"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IST">Asia/Kolkata (IST, UTC+05:30)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lang">Default language</Label>
              <Select defaultValue="EN">
                <SelectTrigger id="lang"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="MR">मराठी (Marathi)</SelectItem>
                  <SelectItem value="HI">हिन्दी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="INR">
                <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SaveBar />
        </SectionCard>
      </form>

      {/* Security */}
      <form onSubmit={(e) => handleSave("Security settings", e)}>
        <SectionCard
          title="Security"
          description="Password policy, session handling and access controls."
          icon={ShieldCheck}
          action={<DemoBadge />}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pwd-min">Minimum password length</Label>
                <Input id="pwd-min" type="number" defaultValue={12} min={8} max={32} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pwd-expiry">Password expiry (days)</Label>
                <Input id="pwd-expiry" type="number" defaultValue={90} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="session">Session timeout (minutes)</Label>
                <Input id="session" type="number" defaultValue={30} min={5} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attempts">Max failed login attempts</Label>
                <Input id="attempts" type="number" defaultValue={5} min={3} />
              </div>
            </div>
            <div className="space-y-3">
              <ToggleRow
                icon={Lock}
                label="Enforce two-factor authentication (2FA)"
                description="TOTP-based 2FA required for all officer & admin roles."
                checked={twoFA}
                onCheckedChange={setTwoFA}
              />
              <ToggleRow
                icon={KeyRound}
                label="Password complexity (mixed case + symbols)"
                description="Reject passwords not meeting the strong-complexity ruleset."
                checked
                onCheckedChange={() => {}}
              />
              <Separator />
              <div className="space-y-1.5">
                <Label htmlFor="ipwl">IP whitelist (comma separated CIDRs)</Label>
                <Input id="ipwl" defaultValue="10.0.0.0/8, 103.21.58.0/24" className="font-mono text-xs" />
                <p className="text-[11px] text-muted-foreground">Only the listed ranges may access the admin console.</p>
              </div>
            </div>
          </div>
          <SaveBar />
        </SectionCard>
      </form>

      {/* Integrations */}
      <SectionCard
        title="Integrations"
        description="Status & configuration of all third-party services consumed by the portal."
        icon={Plug}
        action={<DemoBadge />}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {INTEGRATIONS.map((i) => {
            const isOk = i.status === "Operational";
            const isDegraded = i.status === "Degraded";
            const StatusIcon = isOk ? CircleCheck : isDegraded ? CircleAlert : CircleDot;
            return (
              <div key={i.id} className={cn(
                "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-gov",
                isDegraded ? "border-amber-300/60 dark:border-amber-800/60" : "border-border"
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      isOk ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : isDegraded ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
                    )}>
                      <i.icon className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{i.label}</p>
                      <p className="text-[11px] text-muted-foreground">{i.note}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "gap-1 text-[10px]",
                    isOk ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900" :
                    isDegraded ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900" :
                    "bg-muted text-muted-foreground"
                  )}>
                    <StatusIcon className="size-3" /> {i.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toast({ title: "View logs", description: `Opening recent logs for ${i.label}.` })}>
                    Logs
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Configure", description: `Opening configuration for ${i.label}.` })}>
                    <Settings className="size-3.5" /> Configure
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Notifications */}
      <form onSubmit={(e) => handleSave("Notification defaults", e)}>
        <SectionCard
          title="Default Notification Channels"
          description="Default delivery channels for portal notifications — overridable per event type in the Templates module."
          icon={Bell}
          action={<DemoBadge />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ToggleRow icon={Bell} label="In-app" description="Always-on bell-icon notifications." checked={defaultInApp} onCheckedChange={setDefaultInApp} />
            <ToggleRow icon={Smartphone} label="SMS" description="Transactional SMS via MSG91." checked={defaultSms} onCheckedChange={setDefaultSms} />
            <ToggleRow icon={Globe} label="Email" description="Email digests (optional)." checked={defaultEmail} onCheckedChange={setDefaultEmail} />
          </div>
          <SaveBar />
        </SectionCard>
      </form>

      {/* Backup & Maintenance */}
      <form onSubmit={(e) => handleSave("Backup & maintenance", e)}>
        <SectionCard
          title="Backup & Maintenance"
          description="Database backups, retention and maintenance-mode controls."
          icon={DatabaseBackup}
          action={<DemoBadge />}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Backup schedule</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="backup-freq">Frequency</Label>
                <Select defaultValue="DAILY">
                  <SelectTrigger id="backup-freq"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">Hourly</SelectItem>
                    <SelectItem value="DAILY">Daily — 02:00 IST</SelectItem>
                    <SelectItem value="WEEKLY">Weekly — Sunday 02:00 IST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="retention">Retention period (days)</Label>
                <Input id="retention" type="number" defaultValue={30} min={1} />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-xs">
                <CircleCheck className="size-3.5 text-success" />
                <span className="text-foreground">
                  Last successful backup: <span className="font-mono">2025-01-16 02:00 IST</span> · size 4.2 GB
                </span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => toast({ title: "Backup triggered", description: "Manual backup has been queued." })}>
                <DatabaseBackup className="size-3.5" /> Trigger backup now
              </Button>
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Maintenance mode</p>
              </div>
              <ToggleRow
                icon={Wrench}
                label="Enable maintenance mode"
                description="Temporarily blocks non-admin access to the portal."
                checked={maintenance}
                onCheckedChange={setMaintenance}
              />
              {maintenance && (
                <div className="flex items-center gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <CircleAlert className="size-3.5" />
                  Portal is in maintenance mode. Only administrators can sign in.
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="maint-msg">Maintenance message (shown to users)</Label>
                <Input id="maint-msg" defaultValue="The portal is undergoing scheduled maintenance. Please try again after 04:00 IST." />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Next scheduled maintenance: <span className="font-medium text-foreground">Sun, 19-Jan-2025, 02:00–04:00 IST</span>
              </div>
            </div>
          </div>
          <SaveBar />
        </SectionCard>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Settings className="size-3.5" />
          All settings are versioned and audit-logged. Rollback is available for the last 90 days.
        </div>
        <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
          Build v2.4.1 · Config v17
        </Badge>
      </div>
    </div>
  );
}

// ---------- helpers ----------
function DemoBadge() {
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 gap-1">
      <CircleDot className="size-3" /> Demo data
    </Badge>
  );
}

function Field({ label, id, defaultValue }: { label: string; id: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={defaultValue} />
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Server;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SaveBar() {
  return (
    <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
      <Button type="button" variant="ghost" size="sm">Reset</Button>
      <Button type="submit" size="sm">
        <Save className="size-4" /> Save changes
      </Button>
    </div>
  );
}

export default AdminSettings;
