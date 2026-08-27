"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, DEMO_CREDENTIALS } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Users,
  CheckCheck,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { timeAgo } from "@/components/design-system/workflow";
import { RoleBadge } from "@/components/design-system/badges";
import { useToast } from "@/hooks/use-toast";
import type { NotificationType, RoleKey } from "@/types";

const NOTIF_ICON: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: "FileStack",
  SCRUTINY_FAILED: "XCircle",
  SCRUTINY_PASSED: "CheckCircle2",
  DOCUMENTS_REQUIRED: "FolderClosed",
  FEE_GENERATED: "ReceiptIndianRupee",
  PAYMENT_SUCCESSFUL: "BadgeCheck",
  SHORTFALL_RAISED: "AlertTriangle",
  APPLICATION_FORWARDED: "Forward",
  APPLICATION_APPROVED: "CheckCircle2",
  APPLICATION_RETURNED: "Undo2",
  FINAL_DECISION: "Gavel",
  SYSTEM: "Settings",
};

const SMS_STATUS_CLS: Record<string, string> = {
  SENT: "bg-info/15 text-info",
  DELIVERED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PENDING: "bg-muted text-muted-foreground",
};

export function Topbar() {
  const {
    user,
    portal,
    notifications,
    mobileNavOpen,
    setMobileNavOpen,
    toggleTheme,
    theme,
    navigate,
    markAllNotificationsRead,
    markNotificationRead,
    openApplication,
    loginAsRole,
    logout,
  } = useAppStore();
  const { toast } = useToast();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-5">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search applications, officers, documents…"
          className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Role switcher (demo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:inline-flex gap-2">
              <Zap className="size-3.5 text-amber-500" />
              <span className="text-xs">Demo Role</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs">
              <Users className="size-3.5" /> Switch demo role
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DEMO_CREDENTIALS.map((c) => (
              <DropdownMenuItem
                key={c.role}
                onClick={() => {
                  loginAsRole(c.role);
                  toast({
                    title: `Signed in as ${ROLES[c.role].fullName}`,
                    description: `Demo role switched to ${c.label}`,
                  });
                }}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ROLES[c.role].fullName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
                </div>
                <RoleBadge role={c.role} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle theme"
          className="text-muted-foreground"
        >
          {theme === "light" ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 sm:w-96">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <p className="text-sm font-semibold">Notifications</p>
                {unread > 0 && (
                  <Badge className="bg-destructive text-white text-[10px]">{unread} new</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={markAllNotificationsRead}
                disabled={unread === 0}
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </Button>
            </div>
            <ScrollArea className="h-[360px]">
              <ul className="divide-y divide-border">
                {notifications.length === 0 && (
                  <li className="p-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </li>
                )}
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.applicationId) openApplication(n.applicationId);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                        !n.read && "bg-primary/[0.03]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                        )}
                      >
                        <Bell className="size-3.5" />
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm leading-tight", !n.read && "font-semibold")}>
                            {n.title}
                          </p>
                          {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-muted-foreground">{timeAgo(n.timestamp)}</span>
                          {n.smsSent && (
                            <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium", SMS_STATUS_CLS[n.smsStatus ?? "PENDING"])}>
                              <MessageSquare className="size-2.5" /> SMS {n.smsStatus?.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => navigate("ltp-notifications")}
              >
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-muted">
              <UserAvatar color={user?.avatarColor} name={user?.name} />
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{ROLES[user?.role ?? "LTP"].title}</p>
              </div>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <RoleBadge role={user?.role ?? "LTP"} />
                {user?.zone && <span className="text-[10px] text-muted-foreground">{user.zone}</span>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("ltp-profile")}>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            {portal === "ADMIN" && (
              <DropdownMenuItem onClick={() => navigate("admin-settings")}>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function UserAvatar({ color, name }: { color?: string; name?: string }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-500",
  };
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-[11px] font-semibold text-white",
        colorMap[color ?? "slate"]
      )}
    >
      {initials}
    </div>
  );
}
