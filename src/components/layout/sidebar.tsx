"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { NAV } from "./nav-config";
import { ROLES } from "@/data/mock-data";
import { Building2, ChevronLeft, LogOut, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const { portal, view, navigate, sidebarCollapsed, setSidebarCollapsed, user, logout } =
    useAppStore();
  const groups = NAV[portal];
  const role = user?.role;
  const roleInfo = role ? ROLES[role] : null;
  const collapsed = sidebarCollapsed;

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
              LTP Approval
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              Building Permit Management System
            </p>
          </div>
        )}
      </div>

      {/* Portal label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-sidebar-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
              {portal === "LTP" ? "LTP Portal" : portal === "OFFICER" ? "Officer Workspace" : "Administration"}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="space-y-4">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = view === item.view;
                  const Icon = item.icon;
                  return (
                    <li key={item.view}>
                      <button
                        onClick={() => navigate(item.view)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          collapsed && "justify-center px-0",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-transform",
                            active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {active && !collapsed && (
                          <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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
        className="absolute -right-3 top-20 z-40 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md hover:text-foreground hover:border-primary/40 transition-colors"
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
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-500",
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
