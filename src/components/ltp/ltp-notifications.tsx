"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/design-system/layout";
import { formatDateTime, timeAgo } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  MessageSquare,
  CheckCheck,
  Filter,
  Search,
  FileStack,
  XCircle,
  CheckCircle2,
  FolderClosed,
  ReceiptIndianRupee,
  BadgeCheck,
  AlertTriangle,
  Forward,
  Undo2,
  Gavel,
  Settings,
  Mail,
  Send,
  Inbox,
} from "lucide-react";
import type { NotificationType } from "@/types";

const NOTIF_META: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  APPLICATION_SUBMITTED: { icon: FileStack, cls: "bg-info/10 text-info" },
  SCRUTINY_FAILED: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
  SCRUTINY_PASSED: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  DOCUMENTS_REQUIRED: { icon: FolderClosed, cls: "bg-info/10 text-info" },
  DOCUMENT_VERIFIED: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  FEE_GENERATED: { icon: ReceiptIndianRupee, cls: "bg-amber-500/15 text-amber-600" },
  PAYMENT_SUCCESSFUL: { icon: BadgeCheck, cls: "bg-success/10 text-success" },
  SHORTFALL_RAISED: { icon: AlertTriangle, cls: "bg-warning/15 text-warning-foreground" },
  SHORTFALL_RESPONDED: { icon: MessageSquare, cls: "bg-info/10 text-info" },
  SHORTFALL_RESOLVED: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  APPLICATION_FORWARDED: { icon: Forward, cls: "bg-info/10 text-info" },
  APPLICATION_APPROVED: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  APPLICATION_REJECTED: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
  APPLICATION_RETURNED: { icon: Undo2, cls: "bg-warning/15 text-warning-foreground" },
  FINAL_DECISION: { icon: Gavel, cls: "bg-primary/10 text-primary" },
  SYSTEM: { icon: Settings, cls: "bg-muted text-muted-foreground" },
};

const SMS_CLS: Record<string, string> = {
  SENT: "bg-info/15 text-info",
  DELIVERED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PENDING: "bg-muted text-muted-foreground",
};

export function LtpNotifications() {
  const { navigate, notifications, smsLogs, markAllNotificationsRead, markNotificationRead, openApplication } = useAppStore();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("all");

  const filtered = notifications.filter((n) => {
    if (query && !n.title.toLowerCase().includes(query.toLowerCase()) && !n.message.toLowerCase().includes(query.toLowerCase())) return false;
    if (tab === "unread" && n.read) return false;
    if (tab === "sms" && !n.smsSent) return false;
    return true;
  });

  const unread = notifications.filter((n) => !n.read).length;
  const smsSent = notifications.filter((n) => n.smsSent).length;
  const smsDelivered = smsLogs.filter((s) => s.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="All in-app and SMS notifications for your applications."
        icon={Bell}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead} disabled={unread === 0}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NotifStat label="Total" value={notifications.length} icon={Bell} cls="bg-muted text-muted-foreground" />
        <NotifStat label="Unread" value={unread} icon={Inbox} cls="bg-primary/10 text-primary" />
        <NotifStat label="SMS Sent" value={smsSent} icon={MessageSquare} cls="bg-info/10 text-info" />
        <NotifStat label="SMS Delivered" value={smsDelivered} icon={BadgeCheck} cls="bg-success/10 text-success" />
      </div>

      <SectionCard noPadding>
        {/* Filter */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unread > 0 && <Badge className="ml-1.5 bg-destructive text-white text-[9px]">{unread}</Badge>}</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm sm:w-64"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={Bell} title="No notifications" description="You're all caught up." /></div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((n) => {
              const meta = NOTIF_META[n.type];
              const Icon = meta.icon;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.applicationId) openApplication(n.applicationId);
                    }}
                    className={cn("flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/30", !n.read && "bg-primary/[0.02]")}
                  >
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", meta.cls)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-tight", !n.read && "font-semibold")}>{n.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {!n.read && <span className="size-2 rounded-full bg-primary" />}
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(n.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <Badge variant="outline" className="text-[9px]">{n.type.replace(/_/g, " ").toLowerCase()}</Badge>
                        {n.smsSent ? (
                          <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium", SMS_CLS[n.smsStatus ?? "PENDING"])}>
                            <MessageSquare className="size-2.5" /> SMS {n.smsStatus?.toLowerCase()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
                            <Bell className="size-2.5" /> In-app only
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{formatDateTime(n.timestamp)}</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* SMS log */}
      <SectionCard title="SMS Delivery Log" description="Status of SMS notifications sent to the applicant" icon={MessageSquare} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Template</th>
                <th className="px-4 py-2.5 font-medium">Recipient</th>
                <th className="px-4 py-2.5 font-medium">Application</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Sent At</th>
                <th className="px-4 py-2.5 font-medium">Delivered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {smsLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">No SMS notifications dispatched yet.</td></tr>
              ) : smsLogs.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{s.templateCode}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[260px]">{s.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs">{s.recipient}</p>
                    <p className="text-[10px] text-muted-foreground">{s.recipientName}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.applicationNo ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", SMS_CLS[s.status ?? "PENDING"])}>
                      <MessageSquare className="size-2.5" /> {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(s.sentAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{s.deliveredAt ? formatDateTime(s.deliveredAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function NotifStat({ label, value, icon: Icon, cls }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-gov">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", cls)}><Icon className="size-4" /></div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
