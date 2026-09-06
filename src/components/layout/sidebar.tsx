"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { getDynamicNav } from "@/lib/permissions";
import { ROLES } from "@/data/mock-data";
import {
  LayoutDashboard, FileStack, ClipboardList, AlertTriangle,
  CreditCard, FolderClosed, BarChart3, Settings,
  Building2, ChevronLeft, LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { ViewKey } from "@/types";

// Icon map keyed by the module's permKey
const MODULE_ICONS: Record<string, LucideIcon> = {
  dashboard:    LayoutDashboard,
  applications: FileStack,
  tasks:        ClipboardList,
  shortfalls:   AlertTriangle,
  payments:     CreditCard,
  documents:    FolderClosed,
  reports:      BarChart3,
  settings:     Settings,
};

export function Sidebar() {
  // Read live mutable `roles` from store — so sidebar re-renders whenever
  // Super Admin updates any role's permissions via the Roles panel.
  const portal    = useAppStore((s) => s.portal);
  const view      = useAppStore((s) => s.view);
  const user      = useAppStore((s) => s.user);
  const roles     = useAppStore((s) => s.roles);           // ← live mutable
  const navigate  = useAppStore((s) => s.navigate);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const dashboardVersion = useAppStore((s) => s.dashboardVersion);
  const setDashboardVersion = useAppStore((s) => s.setDashboardVersion);
  const recentActivityVersion = useAppStore((s) => s.recentActivityVersion);
  const setRecentActivityVersion = useAppStore((s) => s.setRecentActivityVersion);
  const cVersion = useAppStore((s) => s.cVersion);
  const setCVersion = useAppStore((s) => s.setCVersion);
  const logout    = useAppStore((s) => s.logout);

  // Compute visible nav items dynamically from live permissions.
  // getDynamicNav filters the 8 modules by the user's current effective
  // permissions, so any change Super Admin makes to a role propagates here.
  const navItems = React.useMemo(() => {
    if (!user) return [];
    return getDynamicNav(user, portal, roles);
  }, [user, portal, roles]);

  const roleInfo = user?.role ? ROLES[user.role] : null;



  return (
    <aside
      className={cn(
        "relative z-30 flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Building2 className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
              Nirman AP
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              Building Permission Authority
            </p>
          </div>
        )}
      </div>




      {/* Dynamic Nav — re-renders whenever roles change */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = view === item.view;
              const Icon = MODULE_ICONS[item.permKey] ?? LayoutDashboard;
              return (
                <li key={item.permKey}>
                  <button
                    onClick={() => navigate(item.view)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        active
                          ? "text-primary-foreground"
                          : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground group-hover:scale-110"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto size-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 px-2 space-y-4">
            <div>
              {!collapsed && <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Dashboard Version</p>}
              <div className={cn("flex gap-1 p-1 border border-sidebar-border rounded-lg bg-sidebar-accent/30", collapsed ? "flex-col" : "")}>
                {(['v1', 'v2', 'v3'] as const).map(v => (
                  <button
                    key={v}
                    className={cn(
                      "flex-1 h-8 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center",
                      collapsed && "px-0",
                      dashboardVersion === v
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "bg-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                    )}
                    onClick={() => setDashboardVersion(v)}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {!collapsed && <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Recent Activity</p>}
              <div className={cn("flex gap-1 p-1 border border-sidebar-border rounded-lg bg-sidebar-accent/30", collapsed ? "flex-col" : "")}>
                {(['r1', 'r2', 'r3'] as const).map(r => (
                  <button
                    key={r}
                    className={cn(
                      "flex-1 h-8 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center",
                      collapsed && "px-0",
                      recentActivityVersion === r
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "bg-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                    )}
                    onClick={() => setRecentActivityVersion(r)}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {!collapsed && <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Cards</p>}
              <div className={cn("flex gap-1 p-1 border border-sidebar-border rounded-lg bg-sidebar-accent/30", collapsed ? "flex-col" : "")}>
                {(['c1', 'c2', 'c3'] as const).map(c => (
                  <button
                    key={c}
                    className={cn(
                      "flex-1 h-8 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center",
                      collapsed && "px-0",
                      cVersion === c
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "bg-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                    )}
                    onClick={() => setCVersion(c)}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </ScrollArea>

      {/* User card */}
      <div className="border-t border-sidebar-border p-2">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/40 p-2.5">
            <div className="flex items-center gap-2.5">
              <Avatar color={user?.avatarColor} name={user?.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-sidebar-accent-foreground">
                  {user?.name}
                </p>
                <p className="truncate text-[10px] text-sidebar-foreground/60">
                  {roleInfo?.fullName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={logout}
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md hover:text-foreground hover:border-primary/40 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={cn("size-3.5 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}

function Avatar({ color, name }: { color?: string; name?: string }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    teal:    "bg-teal-500",
    cyan:    "bg-cyan-500",
    amber:   "bg-amber-500",
    rose:    "bg-rose-500",
    slate:   "bg-slate-500",
  };
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
        colorMap[color ?? "slate"]
      )}
    >
      {initials}
    </div>
  );
}
