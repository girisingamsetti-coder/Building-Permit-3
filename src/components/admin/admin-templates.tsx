"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { SMS_TEMPLATES, NOTIFICATIONS } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  StatCard,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MailWarning,
  MessageSquare,
  Bell,
  Send,
  Pencil,
  CheckCircle2,
  Smartphone,
  Mail,
  CircleCheck,
  CircleSlash,
  Activity,
  Percent,
  FileStack,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NotificationType } from "@/types";

// ---------- Notification channel config ----------
const NOTIF_TYPES: { type: NotificationType; label: string; inApp: boolean; sms: boolean; email: boolean }[] = [
  { type: "APPLICATION_SUBMITTED", label: "Application Submitted", inApp: true, sms: true, email: false },
  { type: "SCRUTINY_FAILED", label: "Scrutiny Failed", inApp: true, sms: true, email: true },
  { type: "SCRUTINY_PASSED", label: "Scrutiny Passed", inApp: true, sms: true, email: false },
  { type: "DOCUMENTS_REQUIRED", label: "Documents Required", inApp: true, sms: true, email: false },
  { type: "FEE_GENERATED", label: "Fee Generated", inApp: true, sms: true, email: false },
  { type: "PAYMENT_SUCCESSFUL", label: "Payment Successful", inApp: true, sms: true, email: true },
  { type: "SHORTFALL_RAISED", label: "Shortfall Raised", inApp: true, sms: true, email: true },
  { type: "APPLICATION_FORWARDED", label: "Application Forwarded", inApp: true, sms: false, email: false },
  { type: "APPLICATION_APPROVED", label: "Application Approved", inApp: true, sms: true, email: true },
  { type: "APPLICATION_RETURNED", label: "Application Returned", inApp: true, sms: true, email: false },
  { type: "FINAL_DECISION", label: "Final Decision", inApp: true, sms: true, email: true },
  { type: "SYSTEM", label: "System", inApp: true, sms: false, email: false },
];

// Sample data for rendering template
const SAMPLE_DATA: Record<string, string> = {
  "{name}": "Ar. Vikram Deshpande",
  "{appNo}": "MC/BP/2025/04/0184",
  "{amount}": "2,67,850",
  "{receiptNo}": "RCP/2025/04/00921",
  "{reportNo}": "SCR/2025/4827",
  "{dueDate}": "22-Jan-2025",
  "{stage}": "ZAD / ZDD Review",
  "{permitNo}": "PER/2025/04/0098",
  "{reason}": "FAR excess beyond permissible limit",
};

function renderTemplate(tpl: string) {
  let out = tpl;
  Object.entries(SAMPLE_DATA).forEach(([k, v]) => {
    out = out.split(k).join(v);
  });
  return out;
}

export function AdminTemplates() {
  const { toast } = useToast();
  const [activeMap, setActiveMap] = React.useState<Record<string, boolean>>(
    Object.fromEntries(SMS_TEMPLATES.map((t) => [t.id, t.active]))
  );
  const [testOpen, setTestOpen] = React.useState<string | null>(null);
  const [testPhone, setTestPhone] = React.useState("+91 98220 14578");
  const [channelState, setChannelState] = React.useState(NOTIF_TYPES);

  function toggleChannel(type: NotificationType, channel: "inApp" | "sms" | "email") {
    setChannelState((prev) =>
      prev.map((n) => (n.type === type ? { ...n, [channel]: !n[channel] } : n))
    );
  }

  function sendTest(tplId: string) {
    setTestOpen(null);
    const tpl = SMS_TEMPLATES.find((t) => t.id === tplId);
    toast({
      title: "Test SMS sent (mock)",
      description: tpl ? `Message preview rendered for ${tpl.name} and sent to ${testPhone}.` : "Sent.",
    });
  }

  const stats = {
    total: SMS_TEMPLATES.length,
    active: Object.values(activeMap).filter(Boolean).length,
    sentToday: 1842,
    deliveryRate: 96.4,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification & SMS Templates"
        description="Manage transactional SMS templates, in-app notification copy and per-event channel routing. All deliveries are logged for audit."
        icon={MailWarning}
        breadcrumbs={[{ label: "Administration" }, { label: "Notification & SMS Templates" }]}
        badge={<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">MSG91 · Sandbox</Badge>}
        actions={
          <Button size="sm" onClick={() => toast({ title: "New template", description: "Template editor opened in draft mode." })}>
            <Pencil className="size-4" /> New template
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Templates" value={stats.total} icon={FileStack} accent="primary" />
        <StatCard label="Active Templates" value={stats.active} icon={CircleCheck} accent="success" />
        <StatCard label="SMS Sent Today" value={stats.sentToday.toLocaleString("en-IN")} icon={Send} accent="info" />
        <StatCard label="Delivery Rate" value={`${stats.deliveryRate}%`} icon={Percent} accent="amber" />
      </div>

      <Tabs defaultValue="sms">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="sms" className="gap-1.5">
            <MessageSquare className="size-3.5" /> SMS Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="size-3.5" /> Notification Templates
          </TabsTrigger>
        </TabsList>

        {/* SMS tab */}
        <TabsContent value="sms" className="mt-4">
          <SectionCard
            title="SMS Templates"
            description="Transactional templates rendered and dispatched via the MSG91 gateway."
            icon={MessageSquare}
            noPadding
          >
            <div className="max-h-[640px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="pl-5">Template</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="min-w-[280px]">Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SMS_TEMPLATES.map((t) => {
                    const isActive = activeMap[t.id] ?? t.active;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="pl-5">
                          <span className="text-sm font-medium text-foreground">{t.name}</span>
                        </TableCell>
                        <TableCell><span className="font-mono text-xs">{t.code}</span></TableCell>
                        <TableCell className="max-w-md">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="line-clamp-1 cursor-help text-xs text-muted-foreground">
                                  {t.template}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="text-xs leading-relaxed">{t.template}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-info/10 text-info border-info/30 text-[10px]">
                            {t.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(v) => {
                              setActiveMap((prev) => ({ ...prev, [t.id]: v }));
                              toast({
                                title: v ? "Template activated" : "Template deactivated",
                                description: `${t.name} is now ${v ? "active" : "inactive"}.`,
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toast({ title: "Edit template", description: t.name })}>
                              <Pencil className="size-3.5" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setTestOpen(t.id)}>
                              <Send className="size-3.5" /> Test send
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
        </TabsContent>

        {/* Notification tab */}
        <TabsContent value="notifications" className="mt-4">
          <SectionCard
            title="Notification Channel Matrix"
            description="Toggle the default delivery channels for each notification event type."
            icon={Bell}
            noPadding
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-5">Notification Event</TableHead>
                    <TableHead className="text-center"><span className="inline-flex items-center gap-1.5"><Bell className="size-3.5" /> In-app</span></TableHead>
                    <TableHead className="text-center"><span className="inline-flex items-center gap-1.5"><Smartphone className="size-3.5" /> SMS</span></TableHead>
                    <TableHead className="text-center"><span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> Email</span></TableHead>
                    <TableHead className="pr-5">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelState.map((n) => (
                    <TableRow key={n.type}>
                      <TableCell className="pl-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{n.label}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{n.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={n.inApp} onCheckedChange={() => toggleChannel(n.type, "inApp")} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={n.sms} onCheckedChange={() => toggleChannel(n.type, "sms")} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={n.email} onCheckedChange={() => toggleChannel(n.type, "email")} />
                      </TableCell>
                      <TableCell className="pr-5 text-xs text-muted-foreground">
                        {NOTIFICATIONS.find((x) => x.type === n.type)?.message ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* Recent notifications */}
          <SectionCard
            title="Recent Notifications Dispatched"
            description="Last few notifications sent across the portal."
            icon={Activity}
            className="mt-6"
          >
            <div className="space-y-2">
              {NOTIFICATIONS.slice(0, 6).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    n.smsSent ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {n.smsSent ? <CircleCheck className="size-4" /> : <CircleSlash className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">{n.channel}</Badge>
                      {n.smsSent ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
                          SMS {n.smsStatus ?? "SENT"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">SMS skipped</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Test send dialog */}
      <Dialog open={!!testOpen} onOpenChange={(o) => !o && setTestOpen(null)}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Test SMS send</DialogTitle>
            <DialogDescription>
              {testOpen && (
                <>
                  Preview of <span className="font-medium text-foreground">{SMS_TEMPLATES.find((t) => t.id === testOpen)?.name}</span> with sample placeholders. This is a sandbox send — no real SMS is delivered.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {testOpen && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Recipient phone</Label>
                <Input id="phone" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="+91 98220 00000" />
              </div>
              <div className="space-y-1.5">
                <Label>Rendered preview</Label>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {renderTemplate(SMS_TEMPLATES.find((t) => t.id === testOpen)!.template)}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">Placeholders auto-filled with sample application data.</p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-info/30 bg-info/5 px-3 py-2 text-xs text-info">
                <Zap className="size-3.5" />
                Mock send — message will not be delivered to a real device.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(null)}>Cancel</Button>
            <Button onClick={() => testOpen && sendTest(testOpen)}>
              <Send className="size-4" /> Send test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminTemplates;
