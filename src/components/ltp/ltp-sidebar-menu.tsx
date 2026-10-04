"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { ModuleAccessLevel } from "@/types";
import {
  LayoutDashboard,
  FolderOpen,
  HardHat,
  ClipboardCheck,
  ShieldAlert,
  Building2,
  RefreshCw,
  ChevronDown,
  BarChart3,
  Settings,
  UserCheck,
  Send,
  AlertTriangle,
} from "lucide-react";

export type LtpSidebarTheme = "maroon-cream" | "apcrda-blue" | "charcoal-indigo" | "midnight-slate" | "clean-light";

interface SubmenuItem {
  id: string;
  label: string;
}

interface LtpModuleDef {
  id: string;
  label: string;
  iconType: "dashboard" | "applications" | "commencement" | "scrutiny" | "compliance" | "occupancy" | "ltp-change" | "reports" | "settings" | "registration" | "outward" | "shortfalls";
  directMenuId?: string;
  submenus: SubmenuItem[];
}

const LTP_MODULES: LtpModuleDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    iconType: "dashboard",
    directMenuId: "dashboard",
    submenus: [],
  },
  {
    id: "application-submission",
    label: "Applications",
    iconType: "applications",
    submenus: [
      { id: "submitted-applications", label: "Submissions" },
      { id: "draft-application", label: "Drafts" },
      { id: "objected-files", label: "Objections" },
    ],
  },
  {
    id: "application-status",
    label: "Application Status",
    iconType: "scrutiny",
    submenus: [
      { id: "approved-files", label: "Approved files" },
      { id: "review-proceeding", label: "In Review" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    iconType: "compliance",
    submenus: [
      { id: "my-shortfalls", label: "Shortfalls" },
      { id: "my-show-cause", label: "Show Cause" },
    ],
  },
  {
    id: "commencement",
    label: "Work Commencement",
    iconType: "commencement",
    directMenuId: "commencement",
    submenus: [],
  },
  {
    id: "occupancy",
    label: "Occupancy",
    iconType: "occupancy",
    directMenuId: "occupancy",
    submenus: [],
  },
  {
    id: "change-of-ltp",
    label: "LTP Change",
    iconType: "ltp-change",
    directMenuId: "change-ltp",
    submenus: [],
  },
  {
    id: "reports",
    label: "Reports",
    iconType: "reports",
    directMenuId: "reports-summary",
    submenus: [],
  },
];

const ADMIN_MODULES: LtpModuleDef[] = [
  ...LTP_MODULES,
  {
    id: "settings",
    label: "Settings",
    iconType: "settings",
    directMenuId: "settings",
    submenus: [],
  },
];

export const REGISTRATION_MODULE: LtpModuleDef = {
  id: "registration",
  label: "Registration",
  iconType: "registration",
  submenus: [
    { id: "registration-all", label: "All Registrations" },
    { id: "registration-pending", label: "Pending Approvals" },
    { id: "registration-ltp", label: "LTP Registrations" },
    { id: "registration-developer", label: "Developer Registrations" },
    { id: "registration-approved", label: "Approved" },
    { id: "registration-rejected", label: "Rejected" },
  ],
};

export function hasRegistrationAccess(role?: string): boolean {
  if (!role) return false;
  return (
    role === "ZJD" ||
    role === "ZDD" ||
    role === "ADDITIONAL_COMMISSIONER" ||
    role === "COMMISSIONER" ||
    role === "ADMIN"
  );
}

export const OUTWARD_MODULE: LtpModuleDef = {
  id: "outward",
  label: "Outward",
  iconType: "outward",
  directMenuId: "outward",
  submenus: [],
};

export function hasOutwardAccess(role?: string): boolean {
  if (!role) return false;
  return role !== "LTP";
}

const ZONAL_MODULES: LtpModuleDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    iconType: "dashboard",
    directMenuId: "dashboard",
    submenus: [],
  },
  {
    id: "registration",
    label: "Registration",
    iconType: "applications",
    submenus: [
      { id: "developer-verification", label: "Developer Verification" },
      { id: "rejected-registration", label: "Rejected" },
      { id: "approved-registration", label: "Approved" },
      { id: "all-ltp-approved", label: "All LTP- Approved" },
    ],
  },
  {
    id: "application-status",
    label: "Application Status",
    iconType: "scrutiny",
    submenus: [
      { id: "review-proceeding", label: "Review Proceeding" },
      { id: "proceeding-issued", label: "Proceeding Issued" },
      { id: "revoke", label: "Revoke" },
    ],
  },
  {
    id: "proceeding-status",
    label: "Compliance",
    iconType: "compliance",
    directMenuId: "proceeding-status",
    submenus: [],
  },
  {
    id: "change-of-ltp",
    label: "Change Of LTP",
    iconType: "ltp-change",
    directMenuId: "change-ltp",
    submenus: [],
  },
  {
    id: "outward",
    label: "Outward",
    iconType: "applications",
    directMenuId: "outward",
    submenus: [],
  },
];

const TPA_MODULES: LtpModuleDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    iconType: "dashboard",
    directMenuId: "dashboard",
    submenus: [],
  },
  {
    id: "registration",
    label: "Registration",
    iconType: "applications",
    submenus: [
      { id: "all-ltp-in-process", label: "All LTP- In Process" },
    ],
  },
  {
    id: "application-status",
    label: "Application Status",
    iconType: "scrutiny",
    submenus: [
      { id: "review-proceeding", label: "Review Proceeding" },
      { id: "proceeding-issued", label: "Proceeding Issued" },
    ],
  },
  {
    id: "proceeding-status",
    label: "Compliance",
    iconType: "compliance",
    directMenuId: "proceeding-status",
    submenus: [],
  },
  {
    id: "outward",
    label: "Outward",
    iconType: "applications",
    directMenuId: "outward",
    submenus: [],
  },
];

interface ThemeDetails {
  id: LtpSidebarTheme;
  label: string;
  name: string;
  badge: string;
  dotColor: string;
  moduleBorder: string;
  headerBg: string;
  headerHoverBg: string;
  headerText: string;
  headerIcon: string;
  headerChevron: string;
  selectedHeaderBg?: string;
  selectedHeaderHoverBg?: string;
  selectedHeaderText?: string;
  selectedHeaderIcon?: string;
  selectedHeaderChevron?: string;
  submenuBg: string;
  submenuBorder: string;
  submenuText: string;
  submenuHoverBg: string;
  submenuHoverText: string;
  activeItemBg: string;
  activeItemText: string;
  activeIndicator: string;
  themeBox: string;
  themeActiveBtn: string;
  themeInactiveBtn: string;
}

export const THEME_DETAILS: Record<LtpSidebarTheme, ThemeDetails> = {
  "maroon-cream": {
    id: "maroon-cream",
    label: "BBAS Maroon",
    name: "BBAS Maroon & Cream",
    badge: "Official",
    dotColor: "bg-[#801824] border border-[#FDF6ED]/70",
    moduleBorder: "border-b border-[#EADBCE]",
    headerBg: "bg-transparent",
    headerHoverBg: "hover:bg-[#F3EADF]",
    headerText: "text-[#4A1017] font-semibold text-[13.5px]",
    headerIcon: "text-[#801824]",
    headerChevron: "text-[#801824]/60",
    selectedHeaderBg: "bg-[#801824] shadow-xs",
    selectedHeaderHoverBg: "hover:bg-[#941C2B]",
    selectedHeaderText: "text-[#FDF6ED] font-bold text-[13.5px]",
    selectedHeaderIcon: "text-[#FDF6ED]",
    selectedHeaderChevron: "text-[#FDF6ED]",
    submenuBg: "bg-[#FAF4EB]",
    submenuBorder: "border border-[#E0D2BE]",
    submenuText: "text-[#5C1A20] font-medium text-[12.5px]",
    submenuHoverBg: "hover:bg-[#EFE3D3]",
    submenuHoverText: "hover:text-[#801824]",
    activeItemBg: "bg-[#EBDBC8]",
    activeItemText: "text-[#801824] font-bold",
    activeIndicator: "border-l-4 border-[#801824] pl-3",
    themeBox: "bg-[#FDFBF7] border-[#EADBCE] text-[#4A1017]",
    themeActiveBtn: "bg-[#801824] text-[#FDF6ED] font-semibold",
    themeInactiveBtn: "text-[#5C1A20] hover:bg-[#F3EADF]",
  },
  "apcrda-blue": {
    id: "apcrda-blue",
    label: "APCRDA Blue",
    name: "APCRDA Official Blue",
    badge: "Official Blue",
    dotColor: "bg-[#103A6A] border border-white/60",
    moduleBorder: "border-b border-[#0C2E54]",
    headerBg: "bg-[#103A6A]",
    headerHoverBg: "hover:bg-[#154884]",
    headerText: "text-white font-medium text-[13.5px]",
    headerIcon: "text-white",
    headerChevron: "text-white",
    submenuBg: "bg-[#C4D5EF]",
    submenuBorder: "border-t border-[#A8C4EC]",
    submenuText: "text-[#0F1E36] font-normal text-[12.5px]",
    submenuHoverBg: "hover:bg-[#B0CAEB]",
    submenuHoverText: "hover:text-[#050C16]",
    activeItemBg: "bg-[#D8D8D8] shadow-sm",
    activeItemText: "text-[#0A1628] font-bold",
    activeIndicator: "",
    themeBox: "bg-[#0C2B4F] border-[#15477C] text-white",
    themeActiveBtn: "bg-[#103A6A] text-white border border-[#2B6CB0] font-semibold",
    themeInactiveBtn: "text-[#93C5FD] hover:bg-[#10355E] hover:text-white",
  },
  "charcoal-indigo": {
    id: "charcoal-indigo",
    label: "Charcoal Dark",
    name: "Charcoal & Indigo",
    badge: "Modern Dark",
    dotColor: "bg-indigo-500",
    moduleBorder: "border-b border-[#25252E]",
    headerBg: "bg-[#1A1A20]",
    headerHoverBg: "hover:bg-[#23232C]",
    headerText: "text-zinc-200 font-medium text-[13px]",
    headerIcon: "text-indigo-400",
    headerChevron: "text-zinc-400",
    submenuBg: "bg-[#101014]",
    submenuBorder: "border-t border-[#1F1F28]",
    submenuText: "text-zinc-400 font-normal text-[12.5px]",
    submenuHoverBg: "hover:bg-[#181820]",
    submenuHoverText: "hover:text-zinc-100",
    activeItemBg: "bg-indigo-600/15",
    activeItemText: "text-indigo-300 font-semibold",
    activeIndicator: "border-l-2 border-indigo-500 pl-[22px]",
    themeBox: "bg-[#101014] border-[#272733] text-zinc-300",
    themeActiveBtn: "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold",
    themeInactiveBtn: "text-zinc-400 hover:bg-[#1A1A22] hover:text-zinc-200",
  },
  "midnight-slate": {
    id: "midnight-slate",
    label: "Midnight Slate",
    name: "Midnight Slate & Sky",
    badge: "Navy Slate",
    dotColor: "bg-sky-400",
    moduleBorder: "border-b border-[#1C2541]",
    headerBg: "bg-[#0F1C3F]",
    headerHoverBg: "hover:bg-[#152654]",
    headerText: "text-slate-200 font-medium text-[13px]",
    headerIcon: "text-sky-400",
    headerChevron: "text-slate-400",
    submenuBg: "bg-[#091126]",
    submenuBorder: "border-t border-[#152347]",
    submenuText: "text-slate-400 font-normal text-[12.5px]",
    submenuHoverBg: "hover:bg-[#132247]",
    submenuHoverText: "hover:text-slate-100",
    activeItemBg: "bg-sky-500/20",
    activeItemText: "text-sky-300 font-semibold",
    activeIndicator: "border-l-2 border-sky-400 pl-[22px]",
    themeBox: "bg-[#080E21] border-[#1C2541] text-slate-300",
    themeActiveBtn: "bg-sky-500/20 text-sky-300 border border-sky-400/40 font-semibold",
    themeInactiveBtn: "text-slate-400 hover:bg-[#0F1C3F] hover:text-slate-200",
  },
  "clean-light": {
    id: "clean-light",
    label: "Enterprise Light",
    name: "Clean Light",
    badge: "Crisp Light",
    dotColor: "bg-blue-600",
    moduleBorder: "border-b border-[#E2E8F0]",
    headerBg: "bg-[#F1F5F9]",
    headerHoverBg: "hover:bg-[#E2E8F0]",
    headerText: "text-slate-800 font-medium text-[13px]",
    headerIcon: "text-blue-600",
    headerChevron: "text-slate-500",
    submenuBg: "bg-[#FFFFFF]",
    submenuBorder: "border-t border-[#E2E8F0]",
    submenuText: "text-slate-600 font-normal text-[12.5px]",
    submenuHoverBg: "hover:bg-[#F8FAFC]",
    submenuHoverText: "hover:text-slate-900",
    activeItemBg: "bg-blue-50",
    activeItemText: "text-blue-700 font-semibold",
    activeIndicator: "border-l-2 border-blue-600 pl-[22px]",
    themeBox: "bg-[#FFFFFF] border-[#E2E8F0] text-slate-700",
    themeActiveBtn: "bg-blue-50 text-blue-700 border border-blue-300 font-semibold",
    themeInactiveBtn: "text-slate-600 hover:bg-[#F1F5F9] hover:text-slate-900",
  },
};

const COMPLIANCE_TAB_IDS = new Set([
  "proceeding-status",
  "verified",
  "shortfall",
  "review-shortfall-submission",
  "show-cause",
  "review-show-cause-submission",
]);

const COMMENCEMENT_TAB_IDS = new Set([
  "commencement",
  "cc-issued",
  "work-initiated",
]);

const REGISTRATION_TAB_IDS = new Set([
  "registration",
  "registration-all",
  "registration-pending",
  "registration-ltp",
  "registration-developer",
  "registration-approved",
  "registration-rejected",
  "developer-verification",
  "all-ltp-approved",
  "approved-registration",
  "rejected-registration",
  "all-ltp-in-process",
]);

const REPORTS_TAB_IDS = new Set([
  "reports",
  "reports-summary",
  "reports-payments",
  "reports-scrutiny",
  "reports-mis",
]);

const OCCUPANCY_TAB_IDS = new Set([
  "occupancy",
  "occupancy-dashboard",
  "occupancy-list",
  "occupancy-apply",
  "occupancy-certificates",
  "submitted-application",
]);

function isMenuMatch(mod: LtpModuleDef, menuId: string): boolean {
  if (mod.id === "compliance" || mod.id === "compliance-v2" || mod.id === "proceeding-status" || mod.directMenuId === "proceeding-status") {
    return mod.submenus.some((s) => s.id === menuId) || COMPLIANCE_TAB_IDS.has(menuId);
  }
  if (mod.id === "commencement" || mod.directMenuId === "commencement") {
    return COMMENCEMENT_TAB_IDS.has(menuId);
  }
  if (mod.id === "registration" || mod.directMenuId === "registration") {
    return REGISTRATION_TAB_IDS.has(menuId);
  }
  if (mod.id === "reports" || mod.directMenuId === "reports" || mod.directMenuId === "reports-summary") {
    return REPORTS_TAB_IDS.has(menuId);
  }
  if (mod.id === "outward" || mod.directMenuId === "outward") {
    return menuId === "outward" || menuId === "ltp-outward" || menuId === "officer-outward" || menuId === "admin-outward";
  }
  if (mod.id === "occupancy") {
    return OCCUPANCY_TAB_IDS.has(menuId) || mod.submenus.some((s) => s.id === menuId);
  }
  return (
    mod.id === menuId ||
    mod.directMenuId === menuId ||
    mod.submenus.some((s) => s.id === menuId)
  );
}

export function LtpSidebarMenu({ collapsed = false }: { collapsed?: boolean }) {
  const ltpActiveMenu = useAppStore((s) => s.ltpActiveMenu) ?? "dashboard";
  const setLtpActiveMenu = useAppStore((s) => s.setLtpActiveMenu);
  const rawTheme = useAppStore((s) => s.ltpTheme);
  const ltpTheme = (!rawTheme || rawTheme === "apcrda-blue") ? "maroon-cream" : rawTheme;
  const navigate = useAppStore((s) => s.navigate);
  const view = useAppStore((s) => s.view);
  const user = useAppStore((s) => s.user);

  const theme = THEME_DETAILS[ltpTheme] || THEME_DETAILS["maroon-cream"];

  // Base modules according to role
  const baseModules = user?.role === "ADMIN" ? ADMIN_MODULES : LTP_MODULES;
  const rawModules = React.useMemo(() => {
    let list = [...baseModules];

    // Registration module for authorized approval roles (ZJD, ZDD, Addl Commissioner, Commissioner, Admin)
    if (hasRegistrationAccess(user?.role)) {
      const dashIdx = list.findIndex((m) => m.id === "dashboard");
      const insertIdx = dashIdx >= 0 ? dashIdx + 1 : 0;
      if (!list.some((m) => m.id === "registration")) {
        list.splice(insertIdx, 0, REGISTRATION_MODULE);
      }
    }

    // Outward module for all roles except LTP — placed next to Compliance module
    if (hasOutwardAccess(user?.role)) {
      if (!list.some((m) => m.id === "outward")) {
        const complianceIdx = list.findIndex((m) => m.id === "proceeding-status" || m.label === "Compliance");
        if (complianceIdx >= 0) {
          list.splice(complianceIdx + 1, 0, OUTWARD_MODULE);
        } else {
          const settingsIdx = list.findIndex((m) => m.id === "settings");
          if (settingsIdx >= 0) {
            list.splice(settingsIdx, 0, OUTWARD_MODULE);
          } else {
            list.push(OUTWARD_MODULE);
          }
        }
      }
    }

    return list;
  }, [user?.role, baseModules]);
  const userAccessConfig = useAppStore((s) => s.systemSettings?.userAccessConfig);
  const roleAccessConfig = useAppStore((s) => s.systemSettings?.roleAccessConfig);
  const hideRestricted = useAppStore((s) => s.systemSettings?.hideRestrictedModules);

  const getAccessLevel = React.useCallback((moduleId: string): ModuleAccessLevel => {
    if (user?.id && userAccessConfig?.[user.id]?.[moduleId]) {
      return userAccessConfig[user.id][moduleId];
    }
    return roleAccessConfig?.[user?.role ?? ""]?.[moduleId] ?? "full";
  }, [user?.id, user?.role, userAccessConfig, roleAccessConfig]);

  const modules = React.useMemo(() => {
    if (user?.role === "ADMIN" || !hideRestricted) return rawModules;
    return rawModules.filter((m) => getAccessLevel(m.id) !== "none");
  }, [rawModules, user?.role, hideRestricted, getAccessLevel]);

  // Single module expanded at a time
  const [openModuleId, setOpenModuleId] = React.useState<string | null>(() => {
    return (
      modules.find((m) => isMenuMatch(m, ltpActiveMenu))?.id ?? "dashboard"
    );
  });

  // Keep parent module expanded if active menu changes
  React.useEffect(() => {
    const parentMod = modules.find((m) => isMenuMatch(m, ltpActiveMenu));
    if (parentMod) {
      setOpenModuleId(parentMod.id);
    }
  }, [ltpActiveMenu, modules]);

  const handleSelectSubmenu = (menuId: string) => {
    setLtpActiveMenu(menuId);
    if (menuId === "dashboard") {
      if (view !== "ltp-dashboard") {
        navigate("ltp-dashboard");
      }
    } else {
      if (view !== "ltp-applications") {
        navigate("ltp-applications");
      }
    }
  };

  const handleModuleClick = (mod: LtpModuleDef) => {
    const isCurrentlyActiveModule = isMenuMatch(mod, ltpActiveMenu);

    if (openModuleId === mod.id && !collapsed && mod.submenus.length > 0) {
      if (!isCurrentlyActiveModule) {
        handleSelectSubmenu(mod.submenus[0].id);
      } else {
        setOpenModuleId(null);
      }
    } else {
      setOpenModuleId(mod.id);
      if (mod.submenus.length > 0) {
        const activeSub = mod.submenus.find((s) => s.id === ltpActiveMenu);
        handleSelectSubmenu(activeSub ? activeSub.id : mod.submenus[0].id);
      } else if (mod.directMenuId) {
        handleSelectSubmenu(mod.directMenuId);
      }
    }
  };

  const getModuleIcon = (mod: LtpModuleDef, isActive: boolean) => {
    const cls = cn(
      "size-4 shrink-0 transition-colors",
      isActive ? (theme.selectedHeaderIcon ?? "text-[#FDF6ED]") : theme.headerIcon
    );
    switch (mod.iconType) {
      case "dashboard": return <LayoutDashboard className={cls} />;
      case "applications": return <FolderOpen className={cls} />;
      case "commencement": return <HardHat className={cls} />;
      case "scrutiny": return <ClipboardCheck className={cls} />;
      case "compliance": return <ShieldAlert className={cls} />;
      case "occupancy": return <Building2 className={cls} />;
      case "reports": return <BarChart3 className={cls} />;
      case "ltp-change": return <RefreshCw className={cls} />;
      case "registration": return <UserCheck className={cls} />;
      case "outward": return <Send className={cls} />;
      case "settings": return <Settings className={cls} />;
      case "shortfalls": return <AlertTriangle className={cls} />;
    }
  };

  // ── Collapsed: icon-only rail ───────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col w-full items-center pt-2 pb-6 space-y-1">
        {modules.map((mod) => {
          const isActive = isMenuMatch(mod, ltpActiveMenu);
          return (
            <button
              key={mod.id}
              title={mod.label}
              onClick={() => handleModuleClick(mod)}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg transition-all duration-150",
                isActive
                  ? cn(theme.selectedHeaderBg ?? "bg-[#801824]", theme.selectedHeaderHoverBg ?? "hover:bg-[#941C2B]")
                  : cn(theme.headerBg, theme.headerHoverBg)
              )}
            >
              {getModuleIcon(mod, isActive)}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Expanded: full accordion menu ───────────────────────────────────────
  return (
    <div className="flex flex-col w-full text-sm font-sans px-2 pt-2 space-y-1 pb-6">
      {modules.map((mod) => {
        const isOpen = openModuleId === mod.id;
        const isActive = isMenuMatch(mod, ltpActiveMenu);
        const hasSubmenus = mod.submenus.length > 0;
        const isHeaderActive = hasSubmenus ? isOpen : isActive;
        return (
          <div key={mod.id} className="transition-all duration-150">
            <button
              onClick={() => handleModuleClick(mod)}
              className={cn(
                "flex w-full items-center justify-between px-3.5 py-2.5 text-left transition-all duration-150 rounded-lg",
                isHeaderActive ? (theme.selectedHeaderBg ?? "bg-[#801824]") : theme.headerBg,
                isHeaderActive ? (theme.selectedHeaderHoverBg ?? "hover:bg-[#941C2B]") : theme.headerHoverBg
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getModuleIcon(mod, isHeaderActive)}
                <span
                  className={cn(
                    "truncate tracking-wide transition-colors",
                    isHeaderActive ? (theme.selectedHeaderText ?? "text-[#FDF6ED] font-bold") : theme.headerText
                  )}
                >
                  {mod.label}
                </span>
                {/* Access level badge — shown when not Full */}
                {(() => {
                  const lvl = getAccessLevel(mod.id);
                  if (lvl === "full") return null;
                  return (
                    <span className={cn(
                      "ml-auto shrink-0 rounded-full px-1.5 py-0 text-[9px] font-bold leading-4 border",
                      lvl === "read"
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    )}>
                      {lvl === "read" ? "Read" : "None"}
                    </span>
                  );
                })()}
              </div>
              {hasSubmenus && isOpen && (
                <ChevronDown className={cn("size-4 shrink-0", theme.selectedHeaderChevron ?? "text-[#FDF6ED]")} />
              )}
            </button>

            {hasSubmenus && isOpen && (
              <div className={cn("mt-1 p-1 rounded-lg border shadow-xs animate-in fade-in-50 duration-150 space-y-0.5", theme.submenuBg, theme.submenuBorder)}>
                {mod.submenus.map((sub) => {
                  const isSubActive = ltpActiveMenu === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubmenu(sub.id)}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-left transition-all duration-150 rounded-md",
                        isSubActive
                          ? cn(theme.activeItemBg, theme.activeItemText, theme.activeIndicator)
                          : cn(theme.submenuText, theme.submenuHoverBg, theme.submenuHoverText)
                      )}
                    >
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

