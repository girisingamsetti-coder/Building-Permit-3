"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { getDynamicNav } from "@/lib/permissions";
import {
  LayoutDashboard, FileStack, ClipboardList, AlertTriangle,
  CreditCard, FolderClosed, BarChart3, Settings,
  Building2, ChevronLeft, Box, Layers,
  MapPin, FileBadge2, FileWarning, Gavel, UserRoundCog,
  HardHat, Briefcase, IdCard, Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

  // Compute visible nav items dynamically from live permissions.
  // getDynamicNav filters the 8 modules by the user's current effective
  // permissions, so any change Super Admin makes to a role propagates here.
  const navItems = React.useMemo(() => {
    if (!user) return [];
    return getDynamicNav(user, portal, roles);
  }, [user, portal, roles]);

  const isLTP = portal === "LTP" || user?.role === "LTP";
  const ltpTheme = useAppStore((s) => s.ltpTheme) ?? "maroon-cream";

  const ltpStyles = {
    "maroon-cream": {
      aside: "bg-[#FDFBF7] border-r border-[#EADBCE] text-[#4A1017]",
      brand: "bg-[#FAF7F2] border-b border-[#EADBCE]",
      badge: "bg-[#801824] text-[#FDF6ED] font-black shadow-sm",
      brandText: "text-[#801824] font-black tracking-wider",
      collapsedBadge: "bg-[#801824] text-[#FDF6ED]",
      scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      footerWrapper: "border-[#EADBCE] bg-[#FAF7F2]",
      footerInner: "bg-[#F3EADF] border-[#EADBCE]",
      userName: "text-[#4A1017]",
      userRole: "text-[#801824]",
      avatarBg: "bg-[#801824] text-[#FDF6ED] border border-[#801824]/20",
      logoutBtn: "text-[#801824] hover:bg-[#F3EADF] hover:text-[#4A1017]",
    },
    "apcrda-blue": {
      aside: "bg-[#103A6A] border-[#0C2E54] text-white",
      brand: "bg-[#0C2B4F] border-[#081E38]",
      badge: "bg-[#EAB308] text-[#0C2B4F]",
      brandText: "text-white",
      collapsedBadge: "bg-[#0C2B4F] text-[#EAB308]",
      scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      footerWrapper: "border-[#0C2E54] bg-[#0C2B4F]",
      footerInner: "bg-[#10355E] border-[#1A4E87]",
      userName: "text-white",
      userRole: "text-[#93C5FD]",
      avatarBg: "bg-[#154884] text-white border border-[#3B82F6]/40",
      logoutBtn: "text-[#93C5FD] hover:bg-[#154884] hover:text-white",
    },
    "charcoal-indigo": {
      aside: "bg-[#141418] border-[#22222A] text-zinc-100",
      brand: "bg-[#101014] border-[#22222A]",
      badge: "bg-indigo-600 text-white",
      brandText: "text-white",
      collapsedBadge: "bg-indigo-600 text-white",
      scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      footerWrapper: "border-[#22222A] bg-[#101014]",
      footerInner: "bg-[#181820] border-[#272733]",
      userName: "text-zinc-100",
      userRole: "text-zinc-400",
      avatarBg: "bg-indigo-600 text-white",
      logoutBtn: "text-zinc-400 hover:bg-[#252530] hover:text-white",
    },
    "midnight-slate": {
      aside: "bg-[#0B132B] border-[#1C2541] text-slate-100",
      brand: "bg-[#080E21] border-[#1C2541]",
      badge: "bg-sky-500 text-white",
      brandText: "text-white",
      collapsedBadge: "bg-sky-500 text-white",
      scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      footerWrapper: "border-[#1C2541] bg-[#080E21]",
      footerInner: "bg-[#0F1C3F] border-[#1C2541]",
      userName: "text-slate-100",
      userRole: "text-slate-400",
      avatarBg: "bg-sky-600 text-white",
      logoutBtn: "text-sky-300 hover:bg-[#152654] hover:text-white",
    },
    "clean-light": {
      aside: "bg-[#F8FAFC] border-[#E2E8F0] text-slate-800",
      brand: "bg-[#FFFFFF] border-[#E2E8F0]",
      badge: "bg-blue-600 text-white",
      brandText: "text-slate-900",
      collapsedBadge: "bg-blue-600 text-white",
      scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      footerWrapper: "border-[#E2E8F0] bg-[#FFFFFF]",
      footerInner: "bg-[#F1F5F9] border-[#E2E8F0]",
      userName: "text-slate-800",
      userRole: "text-slate-500",
      avatarBg: "bg-blue-600 text-white",
      logoutBtn: "text-slate-600 hover:bg-[#E2E8F0] hover:text-slate-900",
    },
  }[ltpTheme] || {
    aside: "bg-[#FDFBF7] border-r border-[#EADBCE] text-[#4A1017]",
    brand: "bg-[#FAF7F2] border-b border-[#EADBCE]",
    badge: "bg-[#801824] text-[#FDF6ED] font-black shadow-sm",
    brandText: "text-[#801824] font-black tracking-wider",
    collapsedBadge: "bg-[#801824] text-[#FDF6ED]",
    scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    footerWrapper: "border-[#EADBCE] bg-[#FAF7F2]",
    footerInner: "bg-[#F3EADF] border-[#EADBCE]",
    userName: "text-[#4A1017]",
    userRole: "text-[#801824]",
    avatarBg: "bg-[#801824] text-[#FDF6ED] border border-[#801824]/20",
    logoutBtn: "text-[#801824] hover:bg-[#F3EADF] hover:text-[#4A1017]",
  };

  const currentTheme = isLTP ? ltpStyles : {
    aside: "bg-[#FDFBF7] border-r border-[#EADBCE] text-[#4A1017]",
    brand: "bg-[#FAF7F2] border-b border-[#EADBCE]",
    badge: "bg-[#801824] text-[#FDF6ED] font-black shadow-sm",
    brandText: "text-[#801824] font-black tracking-wider",
    collapsedBadge: "bg-[#801824] text-[#FDF6ED]",
    scroll: "no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    footerWrapper: "border-[#EADBCE] bg-[#FAF7F2]",
    footerInner: "bg-[#F3EADF] border-[#EADBCE]",
    userName: "text-[#4A1017]",
    userRole: "text-[#801824]",
    avatarBg: "bg-[#801824] text-[#FDF6ED] border border-[#801824]/20",
    logoutBtn: "text-[#801824] hover:bg-[#F3EADF] hover:text-[#4A1017]",
  };

  return (
    <aside
      className={cn(
        "relative z-30 flex h-full flex-col transition-[width] duration-300 ease-out border-r shadow-md",
        currentTheme.aside,
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center justify-center border-b px-4", currentTheme.brand)}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            {isLTP && (
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-md", currentTheme.badge)}>
                BN
              </div>
            )}
            <h1 className={cn("text-base font-bold tracking-wider uppercase text-center", currentTheme.brandText)}>
              Bhavana Nirmaan
            </h1>
          </div>
        ) : (
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg shadow-sm font-bold", currentTheme.collapsedBadge)}>
            B
          </div>
        )}
      </div>

      {/* Dynamic Nav for Officer/Admin or LTP Menu for LTP */}
      {isLTP ? (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <LtpSidebarMenu />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-2 py-2">
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
                            ? "bg-[#801824] text-[#FDF6ED] shadow-sm ring-1 ring-[#801824]/20"
                            : "text-[#5C1A20] hover:bg-[#F3EADF] hover:text-[#801824]"
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
                            ? "bg-[#801824] text-[#FDF6ED] shadow-sm ring-1 ring-[#801824]/20"
                            : "text-[#5C1A20] hover:bg-[#F3EADF] hover:text-[#801824]"
                        )}
                      >
                        3D
                      </button>
                    </li>
                  );
                }

                return (
                  <li key="bim-switcher" className="my-0.5">
                    <div className="flex w-full items-center rounded-[18px] bg-[#F3EADF] p-0.5 border border-[#EADBCE] shadow-inner">
                      <button
                        onClick={() => navigate(view2D)}
                        title="2D Building Drawings & DCR Scrutiny"
                        className={cn(
                          "flex items-center justify-start gap-2 py-1 px-4 rounded-[14px] text-[13px] font-bold transition-all duration-200",
                          is2DActive
                            ? "bg-[#801824] text-[#FDF6ED] shadow-sm ring-1 ring-[#801824]/20"
                            : "text-[#5C1A20] hover:bg-[#EADBCE]/60 hover:text-[#801824]"
                        )}
                      >
                        <Layers className={cn("size-4 shrink-0", is2DActive ? "text-[#FDF6ED]" : "text-[#801824]")} />
                        <span>2D</span>
                      </button>
                      <button
                        onClick={() => navigate(view3D)}
                        title="3D BIM Scrutiny & Digital Twin"
                        className={cn(
                          "flex items-center justify-start gap-2 py-1 px-3 rounded-[14px] text-[13px] font-bold transition-all duration-200",
                          is3DActive
                            ? "bg-[#801824] text-[#FDF6ED] shadow-sm ring-1 ring-[#801824]/20"
                            : "text-[#5C1A20] hover:bg-[#EADBCE]/60 hover:text-[#801824]"
                        )}
                      >
                        <Box className={cn("size-4 shrink-0", is3DActive ? "text-[#FDF6ED]" : "text-[#801824]")} />
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
                        ? "bg-[#801824] text-[#FDF6ED] shadow-sm ring-1 ring-[#801824]/20"
                        : "text-[#5C1A20] hover:bg-[#F3EADF] hover:text-[#801824]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-transform",
                        active
                          ? "text-[#FDF6ED]"
                          : "text-[#801824] group-hover:scale-110"
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
      </div>
      )}

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
