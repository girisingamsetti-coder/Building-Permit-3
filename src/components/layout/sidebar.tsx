"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { getDynamicNav } from "@/lib/permissions";
import { ROLES } from "@/data/mock-data";
import {
  LayoutDashboard, FileStack, ClipboardList, AlertTriangle,
  CreditCard, FolderClosed, BarChart3, Settings,
  Building2, ChevronLeft, LogOut, Box, Layers,
  MapPin, FileBadge2, FileWarning, Gavel, UserRoundCog,
  HardHat, Briefcase, IdCard, Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { ViewKey } from "@/types";
import { LtpSidebarMenu } from "@/components/ltp/ltp-sidebar-menu";

const MODULE_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  applications: FileStack,
  "2d-drawings": Layers,
  bim: Box,
  occupancy: Building2,
  tasks: ClipboardList,
  shortfalls: AlertTriangle,
  inspections: MapPin,
  nocs: FileBadge2,
  "show-cause": FileWarning,
  revocations: Gavel,
  "ltp-changes": UserRoundCog,
  "work-initiated": HardHat,
  developers: Briefcase,
  professionals: IdCard,
  outward: Send,
  payments: CreditCard,
  documents: FolderClosed,
  reports: BarChart3,
  settings: Settings,
};

export function Sidebar() {
  // Read live mutable `roles` from store — so sidebar re-renders whenever
  // Super Admin updates any role's permissions via the Roles panel.
  const portal = useAppStore((s) => s.portal);
  const view = useAppStore((s) => s.view);
  const user = useAppStore((s) => s.user);
  const roles = useAppStore((s) => s.roles);           // ← live mutable
  const navigate = useAppStore((s) => s.navigate);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const dashboardVersion = useAppStore((s) => s.dashboardVersion);
  const setDashboardVersion = useAppStore((s) => s.setDashboardVersion);
  const recentActivityVersion = useAppStore((s) => s.recentActivityVersion);
  const setRecentActivityVersion = useAppStore((s) => s.setRecentActivityVersion);
  const cVersion = useAppStore((s) => s.cVersion);
  const setCVersion = useAppStore((s) => s.setCVersion);
  const logout = useAppStore((s) => s.logout);

  // Compute visible nav items dynamically from live permissions.
  // getDynamicNav filters the 8 modules by the user's current effective
  // permissions, so any change Super Admin makes to a role propagates here.
  const navItems = React.useMemo(() => {
    if (!user) return [];
    return getDynamicNav(user, portal, roles);
  }, [user, portal, roles]);

  const roleInfo = user?.role ? ROLES[user.role] : null;



  const isLTP = portal === "LTP" || user?.role === "LTP";
  const ltpTheme = useAppStore((s) => s.ltpTheme) ?? "maroon-cream";

  const ltpStyles = {
    "maroon-cream": {
      aside: "bg-[#801824] border-[#64131C]",
      brand: "bg-[#64131C] border-[#4E0E15]",
      badge: "bg-[#FDF6ED] text-[#801824] font-black",
      brandText: "text-[#FDF6ED]",
      collapsedBadge: "bg-[#64131C] text-[#FDF6ED]",
      scroll: "[scrollbar-color:#A83240_#801824] [&::-webkit-scrollbar-track]:bg-[#801824] [&::-webkit-scrollbar-thumb]:bg-[#A83240] hover:[&::-webkit-scrollbar-thumb]:bg-[#FDF6ED]",
      footerWrapper: "border-[#64131C] bg-[#64131C]",
      footerInner: "bg-[#721520] border-[#8A1C28]",
      userName: "text-[#FDF6ED]",
      userRole: "text-[#F5D8B8]",
      avatarBg: "bg-[#801824] text-[#FDF6ED] border border-[#F5D8B8]/40",
      logoutBtn: "text-[#F5D8B8] hover:bg-[#801824] hover:text-white",
    },
    "apcrda-blue": {
      aside: "bg-[#103A6A] border-[#0C2E54]",
      brand: "bg-[#0C2B4F] border-[#081E38]",
      badge: "bg-[#EAB308] text-[#0C2B4F]",
      brandText: "text-white",
      collapsedBadge: "bg-[#0C2B4F] text-[#EAB308]",
      scroll: "[scrollbar-color:#4B77A8_#103A6A] [&::-webkit-scrollbar-track]:bg-[#103A6A] [&::-webkit-scrollbar-thumb]:bg-[#4B77A8] hover:[&::-webkit-scrollbar-thumb]:bg-[#93C5FD]",
      footerWrapper: "border-[#0C2E54] bg-[#0C2B4F]",
      footerInner: "bg-[#10355E] border-[#1A4E87]",
      userName: "text-white",
      userRole: "text-[#93C5FD]",
      avatarBg: "bg-[#154884] text-white border border-[#3B82F6]/40",
      logoutBtn: "text-[#93C5FD] hover:bg-[#154884] hover:text-white",
    },
    "charcoal-indigo": {
      aside: "bg-[#141418] border-[#22222A]",
      brand: "bg-[#101014] border-[#22222A]",
      badge: "bg-indigo-600 text-white",
      brandText: "text-white",
      collapsedBadge: "bg-indigo-600 text-white",
      scroll: "[scrollbar-color:#33333F_#101014] [&::-webkit-scrollbar-track]:bg-[#101014] [&::-webkit-scrollbar-thumb]:bg-[#33333F] hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500",
      footerWrapper: "border-[#22222A] bg-[#101014]",
      footerInner: "bg-[#181820] border-[#272733]",
      userName: "text-zinc-100",
      userRole: "text-zinc-400",
      avatarBg: "bg-indigo-600 text-white",
      logoutBtn: "text-zinc-400 hover:bg-[#252530] hover:text-white",
    },
    "midnight-slate": {
      aside: "bg-[#0B132B] border-[#1C2541]",
      brand: "bg-[#080E21] border-[#1C2541]",
      badge: "bg-sky-500 text-white",
      brandText: "text-white",
      collapsedBadge: "bg-sky-500 text-white",
      scroll: "[scrollbar-color:#2C3D68_#080E21] [&::-webkit-scrollbar-track]:bg-[#080E21] [&::-webkit-scrollbar-thumb]:bg-[#2C3D68] hover:[&::-webkit-scrollbar-thumb]:bg-[#38BDF8]",
      footerWrapper: "border-[#1C2541] bg-[#080E21]",
      footerInner: "bg-[#0F1C3F] border-[#1C2541]",
      userName: "text-slate-100",
      userRole: "text-slate-400",
      avatarBg: "bg-sky-600 text-white",
      logoutBtn: "text-sky-300 hover:bg-[#152654] hover:text-white",
    },
    "clean-light": {
      aside: "bg-[#F8FAFC] border-[#E2E8F0]",
      brand: "bg-[#FFFFFF] border-[#E2E8F0]",
      badge: "bg-blue-600 text-white",
      brandText: "text-slate-900",
      collapsedBadge: "bg-blue-600 text-white",
      scroll: "[scrollbar-color:#CBD5E1_#F8FAFC] [&::-webkit-scrollbar-track]:bg-[#F8FAFC] [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] hover:[&::-webkit-scrollbar-thumb]:bg-[#94A3B8]",
      footerWrapper: "border-[#E2E8F0] bg-[#FFFFFF]",
      footerInner: "bg-[#F1F5F9] border-[#E2E8F0]",
      userName: "text-slate-800",
      userRole: "text-slate-500",
      avatarBg: "bg-blue-600 text-white",
      logoutBtn: "text-slate-600 hover:bg-[#E2E8F0] hover:text-slate-900",
    },
  }[ltpTheme] || {
    aside: "bg-[#801824] border-[#64131C]",
    brand: "bg-[#64131C] border-[#4E0E15]",
    badge: "bg-[#FDF6ED] text-[#801824] font-black",
    brandText: "text-[#FDF6ED]",
    collapsedBadge: "bg-[#64131C] text-[#FDF6ED]",
    scroll: "[scrollbar-color:#A83240_#801824] [&::-webkit-scrollbar-track]:bg-[#801824] [&::-webkit-scrollbar-thumb]:bg-[#A83240] hover:[&::-webkit-scrollbar-thumb]:bg-[#FDF6ED]",
    footerWrapper: "border-[#64131C] bg-[#64131C]",
    footerInner: "bg-[#721520] border-[#8A1C28]",
    userName: "text-[#FDF6ED]",
    userRole: "text-[#F5D8B8]",
    avatarBg: "bg-[#801824] text-[#FDF6ED] border border-[#F5D8B8]/40",
    logoutBtn: "text-[#F5D8B8] hover:bg-[#801824] hover:text-white",
  };

  const currentTheme = isLTP ? ltpStyles : {
    aside: "bg-[#801824] border-[#64131C]",
    brand: "bg-[#64131C] border-[#4E0E15]",
    badge: "bg-[#FDF6ED] text-[#801824] font-black",
    brandText: "text-[#FDF6ED]",
    collapsedBadge: "bg-[#64131C] text-[#FDF6ED]",
    scroll: "[scrollbar-color:#A83240_#801824] [&::-webkit-scrollbar-track]:bg-[#801824] [&::-webkit-scrollbar-thumb]:bg-[#A83240] hover:[&::-webkit-scrollbar-thumb]:bg-[#FDF6ED]",
    footerWrapper: "border-[#64131C] bg-[#64131C]",
    footerInner: "bg-[#721520] border-[#8A1C28]",
    userName: "text-[#FDF6ED]",
    userRole: "text-[#F5D8B8]",
    avatarBg: "bg-[#801824] text-[#FDF6ED] border border-[#F5D8B8]/40",
    logoutBtn: "text-[#F5D8B8] hover:bg-[#801824] hover:text-white",
  };

  return (
    <aside
      className={cn(
        "relative z-30 flex h-full flex-col text-white transition-[width] duration-300 ease-out border-r shadow-2xl",
        currentTheme.aside,
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center justify-center border-b px-4", currentTheme.brand)}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            {isLTP && (
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-md", ltpStyles.badge)}>
                BN
              </div>
            )}
            <h1 className={cn("text-base font-bold tracking-wider uppercase text-center", isLTP ? ltpStyles.brandText : "text-white")}>
              Bhavana Nirmaan
            </h1>
          </div>
        ) : (
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm font-bold", isLTP ? ltpStyles.collapsedBadge : "bg-[#3D405B]")}>
            B
          </div>
        )}
      </div>

      {/* Dynamic Nav for Officer/Admin or LTP Menu for LTP */}
      {isLTP ? (
        <div className={cn("flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full", ltpStyles.scroll)}>
          <LtpSidebarMenu />
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 px-2 py-2">
          <nav>
            <ul className="space-y-0">
              {navItems.map((item) => {
              if (item.permKey === "bim") {
                const view2D: ViewKey = portal === "SUPER_ADMIN" ? "admin-2d-drawings" : portal === "OFFICER" ? "officer-2d-drawings" : "ltp-2d-drawings";
                const view3D: ViewKey = portal === "SUPER_ADMIN" ? "admin-bim" : portal === "OFFICER" ? "officer-bim" : "ltp-bim";
                const is2DActive = view === view2D || view === "ltp-drawings";
                const is3DActive = view === view3D;

                if (collapsed) {
                  return (
                    <li key="bim-switcher" className="my-0.5 flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => navigate(view2D)}
                        title="2D Building Drawings & Scrutiny"
                        className={cn(
                          "flex size-9 items-center justify-center rounded-[12px] text-xs font-bold transition-all duration-200",
                          is2DActive
                            ? "bg-[#64131C] text-white shadow-sm ring-1 ring-white/20"
                            : "text-[#F5D8B8] hover:bg-[#941C2B] hover:text-white"
                        )}
                      >
                        2D
                      </button>
                      <button
                        onClick={() => navigate(view3D)}
                        title="3D BIM Scrutiny & Digital Twin"
                        className={cn(
                          "flex size-9 items-center justify-center rounded-[12px] text-xs font-bold transition-all duration-200",
                          is3DActive
                            ? "bg-[#64131C] text-white shadow-sm ring-1 ring-white/20"
                            : "text-[#F5D8B8] hover:bg-[#941C2B] hover:text-white"
                        )}
                      >
                        3D
                      </button>
                    </li>
                  );
                }

                return (
                  <li key="bim-switcher" className="my-0.5">
                    <div className="flex w-full items-center rounded-[18px] bg-[#64131C] p-0.5 border border-[#8A1C28] shadow-inner">
                      <button
                        onClick={() => navigate(view2D)}
                        title="2D Building Drawings & DCR Scrutiny"
                        className={cn(
                          "flex items-center justify-start gap-2 py-1 px-4 rounded-[14px] text-[13px] font-bold transition-all duration-200",
                          is2DActive
                            ? "bg-[#801824] text-white shadow-sm ring-1 ring-white/10"
                            : "text-[#F5D8B8] hover:bg-[#721520] hover:text-white"
                        )}
                      >
                        <Layers className={cn("size-4 shrink-0", is2DActive ? "text-[#FDF6ED]" : "text-[#F5D8B8]")} />
                        <span>2D</span>
                      </button>
                      <button
                        onClick={() => navigate(view3D)}
                        title="3D BIM Scrutiny & Digital Twin"
                        className={cn(
                          "flex items-center justify-start gap-2 py-1 px-3 rounded-[14px] text-[13px] font-bold transition-all duration-200",
                          is3DActive
                            ? "bg-[#801824] text-white shadow-sm ring-1 ring-white/10"
                            : "text-[#F5D8B8] hover:bg-[#721520] hover:text-white"
                        )}
                      >
                        <Box className={cn("size-4 shrink-0", is3DActive ? "text-[#FDF6ED]" : "text-[#F5D8B8]")} />
                        <span>3D</span>
                      </button>
                    </div>
                  </li>
                );
              }

              const active = view === item.view;
              const Icon = MODULE_ICONS[item.permKey] ?? LayoutDashboard;
              return (
                <li key={item.permKey}>
                  <button
                    onClick={() => navigate(item.view)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-[18px] px-4 py-1.5 text-[13px] font-semibold transition-all duration-200",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-[#64131C] text-[#FDF6ED] shadow-sm ring-1 ring-white/10"
                        : "text-[#F5D8B8] hover:bg-[#941C2B] hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-transform",
                        active
                          ? "text-[#FDF6ED]"
                          : "text-[#F5D8B8] group-hover:text-white group-hover:scale-110"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 px-2 space-y-4">
          </div>
        </nav>
      </ScrollArea>
      )}

      {/* User card */}
      <div className={cn("border-t p-2", currentTheme.footerWrapper)}>
        {!collapsed ? (
          <div className={cn("rounded-lg p-2.5", currentTheme.footerInner)}>
            <div className="flex items-center gap-2.5">
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg font-bold text-sm shadow-sm", currentTheme.avatarBg)}>
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-xs font-semibold", currentTheme.userName)}>
                  {user?.name ?? "User"}
                </p>
                <p className={cn("truncate text-[10px]", currentTheme.userRole)}>
                  {roleInfo?.fullName ?? user?.role ?? "Licensed Technical Person"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-7", currentTheme.logoutBtn)}
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
            className={cn("mx-auto", currentTheme.logoutBtn)}
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

function Avatar({ color, name, customClass }: { color?: string; name?: string; customClass?: string }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-600",
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
        customClass || colorMap[color ?? "slate"]
      )}
    >
      {initials}
    </div>
  );
}
