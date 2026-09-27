"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  Copy,
  Layers,
  ChevronDown,
  ChevronLeft,
  Palette,
} from "lucide-react";

export type LtpSidebarTheme = "maroon-cream" | "apcrda-blue" | "charcoal-indigo" | "midnight-slate" | "clean-light";

interface SubmenuItem {
  id: string;
  label: string;
}

interface LtpModuleDef {
  id: string;
  label: string;
  hasIcon?: boolean;
  iconType?: "files" | "layers";
  submenus: SubmenuItem[];
}

const LTP_MODULES: LtpModuleDef[] = [
  {
    id: "commencement",
    label: "Work Commencement (CC)",
    hasIcon: false,
    submenus: [
      { id: "cc-issued", label: "CC Issued" },
      { id: "work-initiated", label: "Work Initiated" },
    ],
  },
  {
    id: "application-submission",
    label: "Permit Applications",
    hasIcon: true,
    iconType: "files",
    submenus: [
      { id: "draft-application", label: "Draft Applications" },
      { id: "submitted-applications", label: "Submitted Applications" },
    ],
  },
  {
    id: "application-status",
    label: "Application Tracking",
    hasIcon: true,
    iconType: "files",
    submenus: [
      { id: "review-proceeding", label: "Review Proceedings" },
      { id: "objected-files", label: "Objected Files" },
      { id: "approved-files", label: "Approved Files" },
      { id: "proceeding-issued", label: "Proceeding Issued" },
    ],
  },
  {
    id: "proceeding-status",
    label: "Proceedings & Compliance",
    hasIcon: true,
    iconType: "files",
    submenus: [
      { id: "verified", label: "Verified Files" },
      { id: "shortfall", label: "Shortfall Notices" },
      { id: "review-shortfall-submission", label: "Shortfall Resubmissions" },
      { id: "show-cause", label: "Show Cause Notices" },
      { id: "review-show-cause-submission", label: "Show Cause Responses" },
    ],
  },
  {
    id: "change-of-ltp",
    label: "Change of LTP (Transfer)",
    hasIcon: true,
    iconType: "layers",
    submenus: [
      { id: "change-ltp", label: "Change LTP / Transfer" },
    ],
  },
  {
    id: "occupancy",
    label: "Occupancy Certificate (OC)",
    hasIcon: true,
    iconType: "files",
    submenus: [
      { id: "occupancy-list", label: "Occupancy List" },
      { id: "submitted-application", label: "Submitted Applications" },
    ],
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
    moduleBorder: "border-b border-[#64131C]",
    headerBg: "bg-[#801824]",
    headerHoverBg: "hover:bg-[#941C2B]",
    headerText: "text-[#FDF6ED] font-medium text-[13.5px]",
    headerIcon: "text-[#FDF6ED]",
    headerChevron: "text-[#FDF6ED]/80",
    submenuBg: "bg-[#FDF6ED]",
    submenuBorder: "border-t border-[#EBD8BF]",
    submenuText: "text-[#5C1A20] font-medium text-[12.5px]",
    submenuHoverBg: "hover:bg-[#F3E5D3]",
    submenuHoverText: "hover:text-[#801824]",
    activeItemBg: "bg-[#801824] shadow-sm",
    activeItemText: "text-white font-bold",
    activeIndicator: "",
    themeBox: "bg-[#64131C] border-[#8A1C28] text-[#FDF6ED]",
    themeActiveBtn: "bg-[#801824] text-[#FDF6ED] border border-[#A83240] font-semibold",
    themeInactiveBtn: "text-[#F5D8B8] hover:bg-[#721520] hover:text-white",
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

const THEME_OPTIONS: Array<{ id: LtpSidebarTheme; label: string; dotColor: string }> = [
  { id: "maroon-cream", label: "BBAS Maroon", dotColor: "bg-[#801824] border border-[#FDF6ED]/70" },
  { id: "apcrda-blue", label: "APCRDA Blue", dotColor: "bg-[#103A6A] border border-white/70" },
  { id: "charcoal-indigo", label: "Charcoal Dark", dotColor: "bg-indigo-500" },
  { id: "midnight-slate", label: "Midnight Slate", dotColor: "bg-sky-400" },
  { id: "clean-light", label: "Enterprise Light", dotColor: "bg-blue-600" },
];

export function LtpSidebarMenu() {
  const ltpActiveMenu = useAppStore((s) => s.ltpActiveMenu) ?? "draft-application";
  const setLtpActiveMenu = useAppStore((s) => s.setLtpActiveMenu);
  const ltpTheme = useAppStore((s) => s.ltpTheme) ?? "maroon-cream";
  const setLtpTheme = useAppStore((s) => s.setLtpTheme);
  const navigate = useAppStore((s) => s.navigate);
  const view = useAppStore((s) => s.view);

  const theme = THEME_DETAILS[ltpTheme] || THEME_DETAILS["maroon-cream"];

  // Accordion open/close state matching the screenshots
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    commencement: true,
    "application-submission": true,
    "application-status": true,
    "proceeding-status": false,
    "change-of-ltp": false,
    occupancy: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectSubmenu = (menuId: string) => {
    setLtpActiveMenu(menuId);
    if (view !== "ltp-applications") {
      navigate("ltp-applications");
    }
  };

  return (
    <div className="flex flex-col w-full text-sm font-sans select-none pb-6">
      {LTP_MODULES.map((mod) => {
        const isOpen = !!openSections[mod.id];
        return (
          <div key={mod.id} className={cn(theme.moduleBorder, "last:border-b-0")}>
            {/* Module Header Button */}
            <button
              onClick={() => toggleSection(mod.id)}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-150",
                theme.headerBg,
                theme.headerHoverBg
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {mod.hasIcon && mod.iconType === "layers" ? (
                  <Layers className={cn("size-4 shrink-0", theme.headerIcon)} />
                ) : mod.hasIcon ? (
                  <Copy className={cn("size-4 shrink-0", theme.headerIcon)} />
                ) : null}
                <span className={cn("truncate tracking-wide", theme.headerText)}>
                  {mod.label}
                </span>
              </div>
              {isOpen ? (
                <ChevronDown className={cn("size-4 shrink-0", theme.headerChevron)} />
              ) : (
                <ChevronLeft className={cn("size-4 shrink-0", theme.headerChevron)} />
              )}
            </button>

            {/* Submenu Accordion Items */}
            {isOpen && (
              <div className={cn("py-1 shadow-inner animate-in fade-in-50 duration-150", theme.submenuBg, theme.submenuBorder)}>
                {mod.submenus.map((sub) => {
                  const isActive = ltpActiveMenu === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubmenu(sub.id)}
                      className={cn(
                        "flex w-full items-center px-6 py-2.5 text-left transition-all duration-150",
                        theme.submenuText,
                        isActive
                          ? cn(theme.activeItemBg, theme.activeItemText, theme.activeIndicator)
                          : cn(theme.submenuHoverBg, theme.submenuHoverText)
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

      {/* Theme Selector Panel in Sidebar */}
      <div className="mt-5 px-3">
        <div className={cn("rounded-lg p-2.5 border transition-all shadow-sm", theme.themeBox)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Palette className="size-3.5 shrink-0" />
              <span>Menu Theme</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 px-1 py-0.5 rounded bg-black/10">
              {theme.badge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLtpTheme(opt.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left",
                  ltpTheme === opt.id ? theme.themeActiveBtn : theme.themeInactiveBtn
                )}
                title={`Switch theme to ${opt.label}`}
              >
                <span className={cn("size-2.5 rounded-full shrink-0", opt.dotColor)} />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
