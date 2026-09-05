import type { Portal, ViewKey } from "@/types";
import {
  LayoutDashboard,
  FileStack,
  ClipboardList,
  AlertTriangle,
  CreditCard,
  FolderClosed,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  view: ViewKey;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Unified 8-module navigation for every portal.
 * All users see the same module labels; each portal maps to the
 * views appropriate for its level of access.
 *
 * Modules:
 *  1. Dashboard
 *  2. Applications
 *  3. Tasks        (LTP: drawings & scrutiny queue  | Officer: review queue | Admin: workflow mgmt)
 *  4. Shortfalls
 *  5. Payments
 *  6. Documents
 *  7. Reports
 *  8. Settings
 */
export const NAV: Record<Portal, NavGroup[]> = {
  // ----------------------------------------------------------------
  // LTP — applicant portal
  // ----------------------------------------------------------------
  LTP: [
    {
      label: "",
      items: [
        { view: "ltp-dashboard",     label: "Dashboard",     icon: LayoutDashboard },
        { view: "ltp-applications",  label: "Applications",  icon: FileStack },
        { view: "ltp-drawings",      label: "Tasks",         icon: ClipboardList },
        { view: "ltp-shortfalls",    label: "Shortfalls",    icon: AlertTriangle },
        { view: "ltp-payment",       label: "Payments",      icon: CreditCard },
        { view: "ltp-documents",     label: "Documents",     icon: FolderClosed },
        { view: "ltp-fees",          label: "Reports",       icon: BarChart3 },
        { view: "ltp-profile",       label: "Settings",      icon: Settings },
      ],
    },
  ],

  // ----------------------------------------------------------------
  // OFFICER — Zonal Head | Director | Additional Commissioner | Commissioner
  // ----------------------------------------------------------------
  OFFICER: [
    {
      label: "",
      items: [
        { view: "officer-dashboard",    label: "Dashboard",    icon: LayoutDashboard },
        { view: "officer-applications", label: "Applications", icon: FileStack },
        { view: "officer-tasks",        label: "Tasks",        icon: ClipboardList },
        { view: "officer-shortfalls",   label: "Shortfalls",   icon: AlertTriangle },
        { view: "officer-payments",     label: "Payments",     icon: CreditCard },
        { view: "officer-documents",    label: "Documents",    icon: FolderClosed },
        { view: "officer-reports",      label: "Reports",      icon: BarChart3 },
        { view: "officer-settings",     label: "Settings",     icon: Settings },
      ],
    },
  ],

  // ----------------------------------------------------------------
  // SUPER_ADMIN — full system access including admin configuration
  // ----------------------------------------------------------------
  SUPER_ADMIN: [
    {
      label: "",
      items: [
        { view: "admin-dashboard",    label: "Dashboard",    icon: LayoutDashboard },
        { view: "admin-applications", label: "Applications", icon: FileStack },
        { view: "admin-workflow",     label: "Tasks",        icon: ClipboardList },
        { view: "admin-shortfalls",   label: "Shortfalls",   icon: AlertTriangle },
        { view: "admin-payments",     label: "Payments",     icon: CreditCard },
        { view: "admin-documents",    label: "Documents",    icon: FolderClosed },
        { view: "admin-reports",      label: "Reports",      icon: BarChart3 },
        { view: "admin-settings",     label: "Settings",     icon: Settings },
      ],
    },
  ],
};
