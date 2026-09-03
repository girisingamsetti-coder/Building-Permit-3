import type { Portal, ViewKey } from "@/types";
import {
  LayoutDashboard,
  FileStack,
  Upload,
  FileSearch,
  FolderClosed,
  ReceiptIndianRupee,
  CreditCard,
  AlertTriangle,
  Bell,
  User,
  CircleHelp,
  ClipboardCheck,
  Settings,
  Users,
  ShieldCheck,
  FileCog,
  Calculator,
  Workflow,
  MailWarning,
  History,
  FileCheck2,
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

export const NAV: Record<Portal, NavGroup[]> = {
  LTP: [
    {
      label: "Overview",
      items: [{ view: "ltp-dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Applications",
      items: [
        { view: "ltp-applications", label: "My Applications", icon: FileStack },
      ],
    },
    {
      label: "Submission",
      items: [
        { view: "ltp-drawings", label: "Drawings & Scrutiny", icon: Upload },
        { view: "ltp-documents", label: "Documents", icon: FolderClosed },
        { view: "ltp-fees", label: "Fees", icon: ReceiptIndianRupee },
        { view: "ltp-payment", label: "Payments", icon: CreditCard },
      ],
    },
    {
      label: "Communication",
      items: [
        { view: "ltp-shortfalls", label: "Shortfalls", icon: AlertTriangle },
        { view: "ltp-notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      label: "Account",
      items: [
        { view: "ltp-profile", label: "Profile", icon: User },
        { view: "ltp-help", label: "Help & Support", icon: CircleHelp },
      ],
    },
  ],
  OFFICER: [
    {
      label: "Workspace",
      items: [{ view: "officer-dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Review",
      items: [
        { view: "officer-applications", label: "Assigned Queue", icon: ClipboardCheck },
        { view: "officer-review", label: "Application Review", icon: FileSearch },
        { view: "officer-documents", label: "Document Review", icon: FileCheck2 },
      ],
    },
    {
      label: "Tracking",
      items: [
        { view: "ltp-shortfalls", label: "Shortfalls", icon: AlertTriangle },
        { view: "ltp-notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      label: "Account",
      items: [{ view: "ltp-profile", label: "Profile", icon: User }],
    },
  ],
  ADMIN: [
    {
      label: "Administration",
      items: [{ view: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Access Control",
      items: [
        { view: "admin-users", label: "Users", icon: Users },
        { view: "admin-roles", label: "Roles & Permissions", icon: ShieldCheck },
      ],
    },
    {
      label: "Configuration",
      items: [
        { view: "admin-application-types", label: "Application Types", icon: FileCog },
        { view: "admin-fee-structures", label: "Fee Structures", icon: Calculator },
        { view: "admin-workflow", label: "Workflow Stages", icon: Workflow },
        { view: "admin-templates", label: "Notification / SMS", icon: MailWarning },
        { view: "admin-settings", label: "System Settings", icon: Settings },
      ],
    },
    {
      label: "Monitoring",
      items: [
        { view: "admin-audit", label: "Audit Logs", icon: History },
        { view: "ltp-notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
};
