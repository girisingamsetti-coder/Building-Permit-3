"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useToast } from "@/hooks/use-toast";
import type { ModuleAccessLevel, RoleKey, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  User as UserIcon,
  Lock,
  Unlock,
  Search,
  Filter,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Save,
  LayoutDashboard,
  FolderOpen,
  FilePlus,
  Activity,
  Box,
  FileCode2,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  MapPin,
  FileText,
  AlertOctagon,
  Ban,
  HardHat,
  Building2,
  RefreshCw,
  CreditCard,
  Send,
  BarChart3,
  Settings,
  CheckCircle2,
  Sliders,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
  Layers,
  HelpCircle,
  UserCheck,
} from "lucide-react";

// ============================================================
// Module Definitions & Categories
// ============================================================
export interface SystemModuleInfo {
  id: string;
  label: string;
  category: "Core" | "Technical" | "Compliance" | "Post-Approval" | "Administrative";
  description: string;
  iconName: string;
}

export const ALL_SYSTEM_MODULES: SystemModuleInfo[] = [
  // Core
  {
    id: "dashboard",
    label: "Dashboard",
    category: "Core",
    description: "Executive portal summary, KPI metrics, SLA status clocks, and pending application overview",
    iconName: "LayoutDashboard",
  },
  {
    id: "applications",
    label: "Applications",
    category: "Core",
    description: "Submitted proposals, drafts, registered files, and application details",
    iconName: "FolderOpen",
  },
  {
    id: "application-submission",
    label: "Applications (Filing)",
    category: "Core",
    description: "8-step proposal application form, APCRDA cadastral lookup, and draft submission wizard",
    iconName: "FilePlus",
  },
  {
    id: "application-status",
    label: "Application Status",
    category: "Core",
    description: "Approved files, in-review progression milestones, and statutory TAT timers",
    iconName: "Activity",
  },

  // Technical
  {
    id: "bim",
    label: "3D (BIM) Model Viewer",
    category: "Technical",
    description: "Interactive 3D building information models, digital elevation & setback envelope analysis",
    iconName: "Box",
  },
  {
    id: "2d-drawings",
    label: "2D Architectural Drawings",
    category: "Technical",
    description: "AutoCAD plan scrutiny, floor-by-floor DWG/DXF drawings, and CAD layer validation",
    iconName: "FileCode2",
  },
  {
    id: "tasks",
    label: "Scrutiny Tasks",
    category: "Technical",
    description: "PreDCR automated rule engine checks, discrepancy analysis, and scrutiny reports",
    iconName: "ClipboardCheck",
  },

  // Compliance
  {
    id: "documents",
    label: "Document Vault",
    category: "Compliance",
    description: "Title deeds, structural stability certificates, encumbrance certificates & statutory affidavits",
    iconName: "FileCheck",
  },
  {
    id: "compliance",
    label: "Compliance",
    category: "Compliance",
    description: "Compliance management: Shortfall resolution (technical deficiencies) and Show Cause notices (statutory deviations)",
    iconName: "ShieldAlert",
  },
  {
    id: "shortfalls",
    label: "Shortfalls",
    category: "Compliance",
    description: "Deficiency citations, shortfall reply uploads, and technical shortfall verification",
    iconName: "AlertTriangle",
  },
  {
    id: "inspections",
    label: "Site Inspections",
    category: "Compliance",
    description: "Geo-tagged field inspection orders, site photographs, officer observations & punch lists",
    iconName: "MapPin",
  },
  {
    id: "nocs",
    label: "NOC Clearances",
    category: "Compliance",
    description: "Fire, Airport Authority, Traffic Police, UDA, Revenue & Pollution statutory clearances",
    iconName: "ShieldCheck",
  },
  {
    id: "proceeding-status",
    label: "Statutory Compliance",
    category: "Compliance",
    description: "Form 53 compliance reports, Pre-DCR verification audits, and legal proceeding records",
    iconName: "FileText",
  },
  {
    id: "show-cause",
    label: "Show Cause",
    category: "Compliance",
    description: "Statutory violation notices, unauthorized works hearings, and developer explanations",
    iconName: "AlertOctagon",
  },
  {
    id: "revocations",
    label: "Permit Revocations",
    category: "Compliance",
    description: "Building permit cancellation proceedings, forfeiture hearings, and revocation orders",
    iconName: "Ban",
  },

  // Post-Approval
  {
    id: "commencement",
    label: "Work Commencement",
    category: "Post-Approval",
    description: "Commencement Certificate (CC) issuance and construction work initiation date tracking",
    iconName: "HardHat",
  },
  {
    id: "occupancy",
    label: "Occupancy",
    category: "Post-Approval",
    description: "Building completion verification, final site audits, and Occupancy Certificate issuance",
    iconName: "Building2",
  },
  {
    id: "change-of-ltp",
    label: "LTP Change",
    category: "Post-Approval",
    description: "Architect and engineer transfer requests, developer NOCs, and replacements",
    iconName: "RefreshCw",
  },

  // Administrative
  {
    id: "payments",
    label: "Fee & Payments",
    category: "Administrative",
    description: "Statutory fee assessments, APCRDA payment gateway, challan generation & official receipts",
    iconName: "CreditCard",
  },
  {
    id: "developers",
    label: "Developer Registry",
    category: "Administrative",
    description: "Registered builder licenses, developer firms, credential verification & blacklisting status",
    iconName: "Users",
  },
  {
    id: "professionals",
    label: "LTP Directory",
    category: "Administrative",
    description: "Licensed Technical Persons register (architects, civil engineers, structural designers)",
    iconName: "ShieldCheck",
  },
  {
    id: "outward",
    label: "Outward",
    category: "Administrative",
    description: "Official proceeding letters, speed post barcode tracking, and dispatch acknowledgment",
    iconName: "Send",
  },
  {
    id: "reports",
    label: "Reports",
    category: "Administrative",
    description: "Zonal MIS analytics, SLA compliance monitoring, revenue reports and audit trail logs",
    iconName: "BarChart3",
  },
  {
    id: "registration",
    label: "Registration",
    category: "Administrative",
    description: "Approve or reject new LTP and Developer registrations submitted via login, verify credentials, council/RERA licenses & affidavits",
    iconName: "UserCheck",
  },
  {
    id: "settings",
    label: "Settings",
    category: "Administrative",
    description: "System parameters, access control, workflow rules, masters, and security policies",
    iconName: "Settings",
  },
];

export const ROLES_FOR_ACCESS = [
  { key: "LTP", label: "LTP (Architect / Engineer)", badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300" },
  { key: "TPA", label: "Town Planning Assistant (TPA)", badgeColor: "bg-teal-50 text-teal-800 border-teal-300" },
  { key: "ZDD", label: "Zonal Deputy Director (ZDD)", badgeColor: "bg-blue-50 text-blue-800 border-blue-300" },
  { key: "ZJD", label: "Zonal Joint Director (ZJD)", badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-300" },
  { key: "ZONAL_HEAD", label: "Zonal Head", badgeColor: "bg-purple-50 text-purple-800 border-purple-300" },
  { key: "DIRECTOR", label: "Director of Planning", badgeColor: "bg-amber-50 text-amber-800 border-amber-300" },
  { key: "ADDITIONAL_COMMISSIONER", label: "Additional Commissioner", badgeColor: "bg-orange-50 text-orange-800 border-orange-300" },
  { key: "COMMISSIONER", label: "Commissioner", badgeColor: "bg-rose-50 text-rose-800 border-rose-300" },
  { key: "ADMIN", label: "System Administrator", badgeColor: "bg-slate-100 text-slate-800 border-slate-300" },
] as const;

export const ACCESS_LEVEL_OPTIONS: { value: ModuleAccessLevel; label: string; desc: string; color: string; badgeCls: string }[] = [
  {
    value: "full",
    label: "Full Access",
    desc: "Complete view & interactive action permissions",
    color: "bg-emerald-500",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    value: "read",
    label: "Read Only",
    desc: "View module data; editing & action buttons disabled",
    color: "bg-blue-500",
    badgeCls: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    value: "none",
    label: "No Access",
    desc: "Module access denied & restricted",
    color: "bg-rose-500",
    badgeCls: "bg-rose-100 text-rose-800 border-rose-300",
  },
];

// Helper to render module icon
function renderModuleIcon(iconName: string, className?: string) {
  const cls = cn("size-4 shrink-0", className);
  switch (iconName) {
    case "LayoutDashboard": return <LayoutDashboard className={cls} />;
    case "FolderOpen": return <FolderOpen className={cls} />;
    case "FilePlus": return <FilePlus className={cls} />;
    case "Activity": return <Activity className={cls} />;
    case "Box": return <Box className={cls} />;
    case "FileCode2": return <FileCode2 className={cls} />;
    case "ClipboardCheck": return <ClipboardCheck className={cls} />;
    case "FileCheck": return <FileCheck className={cls} />;
    case "AlertTriangle": return <AlertTriangle className={cls} />;
    case "MapPin": return <MapPin className={cls} />;
    case "ShieldCheck": return <ShieldCheck className={cls} />;
    case "FileText": return <FileText className={cls} />;
    case "AlertOctagon": return <AlertOctagon className={cls} />;
    case "Ban": return <Ban className={cls} />;
    case "HardHat": return <HardHat className={cls} />;
    case "Building2": return <Building2 className={cls} />;
    case "RefreshCw": return <RefreshCw className={cls} />;
    case "CreditCard": return <CreditCard className={cls} />;
    case "Users": return <Users className={cls} />;
    case "Send": return <Send className={cls} />;
    case "BarChart3": return <BarChart3 className={cls} />;
    case "UserCheck": return <UserCheck className={cls} />;
    case "Settings": return <Settings className={cls} />;
    default: return <Layers className={cls} />;
  }
}

// ============================================================
// Props for Module Access Manager Component
// ============================================================
export interface ModuleAccessManagerProps {
  config: Record<string, Record<string, ModuleAccessLevel>>;
  onChange: (cfg: Record<string, Record<string, ModuleAccessLevel>>) => void;
  userConfig?: Record<string, Record<string, ModuleAccessLevel>>;
  onUserConfigChange?: (cfg: Record<string, Record<string, ModuleAccessLevel>>) => void;
  hideRestricted?: boolean;
  onHideRestrictedChange?: (val: boolean) => void;
  onDirectSave?: (
    roleCfg: Record<string, Record<string, ModuleAccessLevel>>,
    userCfg: Record<string, Record<string, ModuleAccessLevel>>,
    hide: boolean
  ) => void;
}

export function ModuleAccessManager({
  config: roleConfig,
  onChange: onRoleConfigChange,
  userConfig = {},
  onUserConfigChange,
  hideRestricted = false,
  onHideRestrictedChange,
  onDirectSave,
}: ModuleAccessManagerProps) {
  const { toast } = useToast();
  const allUsers = useAppStore((s) => s.users);
  const updateSystemSettings = useAppStore((s) => s.updateSystemSettings);

  // Active top-level subtab: "by-user" | "by-role" | "policy"
  const [activeTab, setActiveTab] = React.useState<"by-user" | "by-role" | "policy">("by-user");

  // User Selection & Search State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("ALL");
  const [selectedZoneFilter, setSelectedZoneFilter] = React.useState<string>("ALL");
  const [selectedUserId, setSelectedUserId] = React.useState<string>(allUsers[0]?.id || "u-ltp-01");

  // Module filter within User view
  const [moduleSearch, setModuleSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  // View style for user tab: "cards" | "table"
  const [userViewMode, setUserViewMode] = React.useState<"cards" | "table">("cards");

  // Filtered users list
  const filteredUsers = React.useMemo(() => {
    return allUsers.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q);

      const matchesRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
      const matchesZone = selectedZoneFilter === "ALL" || (u.zone && u.zone.includes(selectedZoneFilter));

      return matchesSearch && matchesRole && matchesZone;
    });
  }, [allUsers, searchQuery, selectedRoleFilter, selectedZoneFilter]);

  // Currently active selected user
  const activeUser = React.useMemo(() => {
    return allUsers.find((u) => u.id === selectedUserId) || allUsers[0] || null;
  }, [allUsers, selectedUserId]);

  // Compute effective access level for a user on a module
  const getUserModuleAccess = React.useCallback(
    (userId: string, userRole: string, moduleId: string): { level: ModuleAccessLevel; isOverride: boolean } => {
      if (userConfig[userId]?.[moduleId] !== undefined) {
        return { level: userConfig[userId][moduleId], isOverride: true };
      }
      const roleLevel = roleConfig[userRole]?.[moduleId] ?? "full";
      return { level: roleLevel, isOverride: false };
    },
    [userConfig, roleConfig]
  );

  // Set user-specific module access
  const handleSetUserModuleAccess = (userId: string, moduleId: string, level: ModuleAccessLevel) => {
    const nextUserConfig = {
      ...userConfig,
      [userId]: {
        ...(userConfig[userId] ?? {}),
        [moduleId]: level,
      },
    };
    onUserConfigChange?.(nextUserConfig);
  };

  // Revert a single module override for a user back to role default
  const handleRevertUserModule = (userId: string, moduleId: string) => {
    if (!userConfig[userId]) return;
    const userOverrides = { ...userConfig[userId] };
    delete userOverrides[moduleId];

    const nextUserConfig = { ...userConfig };
    if (Object.keys(userOverrides).length === 0) {
      delete nextUserConfig[userId];
    } else {
      nextUserConfig[userId] = userOverrides;
    }
    onUserConfigChange?.(nextUserConfig);

    toast({
      title: "Module Access Reset",
      description: "Reverted to role default permissions.",
    });
  };

  // Bulk actions for active user
  const handleBulkSetUser = (userId: string, level: ModuleAccessLevel) => {
    const userOverrides: Record<string, ModuleAccessLevel> = {};
    ALL_SYSTEM_MODULES.forEach((m) => {
      userOverrides[m.id] = level;
    });
    const nextUserConfig = {
      ...userConfig,
      [userId]: userOverrides,
    };
    onUserConfigChange?.(nextUserConfig);

    toast({
      title: `All Modules Set to ${level === "full" ? "Full Access" : level === "read" ? "Read Only" : "No Access"}`,
      description: `Updated module permissions for ${activeUser?.name || "selected user"}.`,
    });
  };

  // Reset all module overrides for a user (inherit 100% from role)
  const handleResetUserAll = (userId: string) => {
    const nextUserConfig = { ...userConfig };
    delete nextUserConfig[userId];
    onUserConfigChange?.(nextUserConfig);

    toast({
      title: "User Permissions Reset",
      description: `All module access permissions for ${activeUser?.name} now inherit from ${activeUser?.role} defaults.`,
    });
  };

  // Role Matrix Actions
  const handleSetRoleModule = (role: string, moduleId: string, level: ModuleAccessLevel) => {
    const next = {
      ...roleConfig,
      [role]: { ...(roleConfig[role] ?? {}), [moduleId]: level },
    };
    onRoleConfigChange(next);
  };

  const handleSetRoleRowAll = (role: string, level: ModuleAccessLevel) => {
    const next = { ...roleConfig, [role]: {} as Record<string, ModuleAccessLevel> };
    ALL_SYSTEM_MODULES.forEach((m) => {
      next[role][m.id] = level;
    });
    onRoleConfigChange(next);
  };

  const handleSetRoleColAll = (moduleId: string, level: ModuleAccessLevel) => {
    const next = { ...roleConfig };
    ROLES_FOR_ACCESS.forEach((r) => {
      next[r.key] = { ...(next[r.key] ?? {}), [moduleId]: level };
    });
    onRoleConfigChange(next);
  };

  // Direct Save handler
  const handleDirectSaveAll = () => {
    if (onDirectSave) {
      onDirectSave(roleConfig, userConfig, hideRestricted);
    } else {
      updateSystemSettings({
        roleAccessConfig: roleConfig,
        userAccessConfig: userConfig,
        hideRestrictedModules: hideRestricted,
      });
    }

    toast({
      title: "Module Access Permissions Saved",
      description: "All user and role module access permissions have been updated and are active immediately.",
    });
  };

  // Count active overrides
  const userOverrideCount = React.useMemo(() => {
    return Object.keys(userConfig).reduce((acc, uid) => {
      const overrides = Object.keys(userConfig[uid] || {});
      return overrides.length > 0 ? acc + 1 : acc;
    }, 0);
  }, [userConfig]);

  // Filter modules for display
  const filteredModules = React.useMemo(() => {
    return ALL_SYSTEM_MODULES.filter((m) => {
      const q = moduleSearch.toLowerCase().trim();
      const matchesSearch = !q || m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [moduleSearch, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* ── TOP HEADER BANNER ── */}
      <div className="rounded-xl border border-[#EADBCE] bg-[#FDFBF7] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#801824] text-white shadow-xs">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-[#801824] uppercase tracking-wide">
                User &amp; Role Module Access Control
              </h3>
              <Badge className="bg-[#801824]/10 text-[#801824] border-[#801824]/20 text-[10px] font-bold">
                {ALL_SYSTEM_MODULES.length} System Modules
              </Badge>
              {userOverrideCount > 0 && (
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                  {userOverrideCount} Users with Custom Overrides
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#5C1A20] mt-1 leading-relaxed max-w-3xl">
              Configure which modules specific users and roles can access. Individual user permissions take precedence over role defaults.
              Changes take effect immediately across all user sidebars and modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <Button
            type="button"
            onClick={handleDirectSaveAll}
            className="bg-[#801824] hover:bg-[#941C2B] text-white font-bold text-xs shadow-xs gap-1.5 cursor-pointer h-9 px-4"
          >
            <Save className="size-3.5" />
            <span>Save Module Access</span>
          </Button>
        </div>
      </div>

      {/* ── NAVIGATION SUB-TABS ── */}
      <div className="bg-[#FAF4EB] border border-[#E0D2BE] p-1.5 rounded-xl flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("by-user")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "by-user"
                ? "bg-[#801824] text-white shadow-xs"
                : "text-[#5C1A20] hover:bg-[#F3EADF]"
            )}
          >
            <UserIcon className="size-3.5" />
            <span>By User (Individual Access)</span>
            {userOverrideCount > 0 && (
              <span className="size-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("by-role")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "by-role"
                ? "bg-[#801824] text-white shadow-xs"
                : "text-[#5C1A20] hover:bg-[#F3EADF]"
            )}
          >
            <ShieldCheck className="size-3.5" />
            <span>By Role (Default Matrix)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "policy"
                ? "bg-[#801824] text-white shadow-xs"
                : "text-[#5C1A20] hover:bg-[#F3EADF]"
            )}
          >
            <Sliders className="size-3.5" />
            <span>Access Policy &amp; Visibility</span>
          </button>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-[#4A1017] px-2">
          {ACCESS_LEVEL_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", opt.color)} />
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB 1: BY USER (USER-SPECIFIC ACCESS)                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "by-user" && (
        <div className="space-y-4">
          {/* User Selection & Search Bar */}
          <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-xl p-3.5 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search user by name, email, employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs bg-white border-[#DCD5C8]"
                />
              </div>

              {/* Filters & View Toggle */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Role filter */}
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#DCD5C8] bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Roles ({allUsers.length})</option>
                  {ROLES_FOR_ACCESS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>

                {/* Zone filter */}
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#DCD5C8] bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Zones</option>
                  <option value="Zone 1">Zone 1</option>
                  <option value="Zone 2">Zone 2</option>
                  <option value="Zone 3">Zone 3</option>
                  <option value="Head Office">Head Office</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center bg-white border border-[#DCD5C8] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setUserViewMode("cards")}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer",
                      userViewMode === "cards" ? "bg-[#801824] text-white" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Configure User
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserViewMode("table")}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer",
                      userViewMode === "table" ? "bg-[#801824] text-white" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Directory Table
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Horizontal User Carousel / Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#EADBCE]/60">
              {filteredUsers.slice(0, 15).map((u) => {
                const isSelected = u.id === selectedUserId;
                const overrides = Object.keys(userConfig[u.id] || {});
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setUserViewMode("cards");
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-left flex items-center gap-2 shrink-0 transition-all cursor-pointer text-xs",
                      isSelected
                        ? "bg-[#801824] text-white border-[#801824] shadow-xs"
                        : "bg-white text-slate-700 border-[#DCD5C8] hover:border-[#801824]/50"
                    )}
                  >
                    <div
                      className={cn(
                        "size-5 rounded-full flex items-center justify-center font-bold text-[10px]",
                        isSelected ? "bg-white text-[#801824]" : "bg-[#FAF4EB] text-[#801824]"
                      )}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="truncate max-w-[120px]">
                      <p className="font-bold truncate leading-tight">{u.name}</p>
                      <p className={cn("text-[10px] truncate", isSelected ? "text-white/80" : "text-slate-500")}>
                        {u.role}
                      </p>
                    </div>
                    {overrides.length > 0 && (
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          isSelected ? "bg-amber-300" : "bg-amber-500"
                        )}
                        title={`${overrides.length} custom overrides`}
                      />
                    )}
                  </button>
                );
              })}
              {filteredUsers.length > 15 && (
                <div className="flex items-center text-xs text-slate-500 px-2 font-medium shrink-0">
                  +{filteredUsers.length - 15} more
                </div>
              )}
            </div>
          </div>

          {/* VIEW MODE A: CONFIGURE SELECTED USER CARDS */}
          {userViewMode === "cards" && activeUser && (
            <div className="space-y-4">
              {/* Selected User Header Card */}
              <div className="bg-white border-2 border-[#801824]/30 rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: User details */}
                  <div className="flex items-start gap-3.5">
                    <div className="size-12 rounded-xl bg-[#801824] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                      {activeUser.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-slate-900">{activeUser.name}</h4>
                        <Badge className="bg-[#801824] text-white border-0 text-[10px] font-bold">
                          {activeUser.role}
                        </Badge>
                        {activeUser.zone && (
                          <Badge variant="outline" className="text-slate-600 border-slate-300 text-[10px]">
                            {activeUser.zone}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px]">
                          {activeUser.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {activeUser.email} • {activeUser.designation || "Authorized User"} • ID: {activeUser.employeeId || activeUser.id}
                      </p>
                      {/* Override status */}
                      <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
                        {(() => {
                          const activeUserOverrides = Object.keys(userConfig[activeUser.id] || {});
                          if (activeUserOverrides.length > 0) {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold">
                                <Sparkles className="size-3 text-amber-600" />
                                {activeUserOverrides.length} Custom Overrides Active (vs {activeUser.role} defaults)
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold">
                              <Check className="size-3 text-emerald-600" />
                              Inheriting all permissions from {activeUser.role} role defaults
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right: User Bulk Actions Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkSetUser(activeUser.id, "full")}
                      className="text-xs font-bold border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 cursor-pointer h-8"
                    >
                      <CheckCircle2 className="size-3 mr-1" />
                      Grant All
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkSetUser(activeUser.id, "read")}
                      className="text-xs font-bold border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 cursor-pointer h-8"
                    >
                      <Eye className="size-3 mr-1" />
                      Read Only All
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkSetUser(activeUser.id, "none")}
                      className="text-xs font-bold border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 cursor-pointer h-8"
                    >
                      <Lock className="size-3 mr-1" />
                      Revoke All
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResetUserAll(activeUser.id)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer h-8"
                      title="Clear custom overrides and inherit from role"
                    >
                      <RotateCcw className="size-3 mr-1" />
                      Reset to Role
                    </Button>
                  </div>
                </div>
              </div>

              {/* Module Filter & Category Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EADBCE]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["ALL", "Core", "Technical", "Compliance", "Post-Approval", "Administrative"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                        selectedCategory === cat
                          ? "bg-[#801824] text-white shadow-2xs"
                          : "text-slate-600 hover:bg-white"
                      )}
                    >
                      {cat === "ALL" ? "All Modules" : cat}
                    </button>
                  ))}
                </div>

                <div className="relative max-w-xs">
                  <Search className="size-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search module..."
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="pl-7 h-8 text-xs bg-white border-[#DCD5C8]"
                  />
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredModules.map((mod) => {
                  const access = getUserModuleAccess(activeUser.id, activeUser.role, mod.id);
                  const roleDefaultLevel = roleConfig[activeUser.role]?.[mod.id] ?? "full";

                  return (
                    <div
                      key={mod.id}
                      className={cn(
                        "rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all",
                        access.isOverride
                          ? "bg-[#FDFBF7] border-amber-300 shadow-xs"
                          : "bg-white border-[#EADBCE] hover:border-[#801824]/40"
                      )}
                    >
                      {/* Top: Icon + Label + Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-[#FAF4EB] text-[#801824] flex items-center justify-center border border-[#EADBCE]">
                              {renderModuleIcon(mod.iconName)}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-900 leading-tight">{mod.label}</p>
                              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                {mod.category}
                              </span>
                            </div>
                          </div>

                          {/* Access level pill */}
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border",
                              access.level === "full"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : access.level === "read"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            )}
                          >
                            {access.level === "full" ? "Full" : access.level === "read" ? "Read" : "None"}
                          </Badge>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {mod.description}
                        </p>
                      </div>

                      {/* Middle: 3-Segment Access Level Toggle */}
                      <div className="grid grid-cols-3 gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#EADBCE]">
                        {ACCESS_LEVEL_OPTIONS.map((opt) => {
                          const isActive = access.level === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSetUserModuleAccess(activeUser.id, mod.id, opt.value)}
                              className={cn(
                                "py-1 px-1.5 rounded text-[10px] font-bold transition-all text-center cursor-pointer",
                                isActive
                                  ? opt.value === "full"
                                    ? "bg-emerald-600 text-white shadow-2xs"
                                    : opt.value === "read"
                                    ? "bg-blue-600 text-white shadow-2xs"
                                    : "bg-rose-600 text-white shadow-2xs"
                                  : "text-slate-600 hover:bg-white"
                              )}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom Footer: Inheritance vs Override */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        {access.isOverride ? (
                          <>
                            <span className="text-amber-800 font-bold flex items-center gap-1">
                              <Sparkles className="size-2.5 text-amber-600" />
                              Custom Override
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevertUserModule(activeUser.id, mod.id)}
                              className="text-[#801824] hover:underline font-bold cursor-pointer"
                            >
                              Revert to {roleDefaultLevel}
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500">
                            Default from {activeUser.role}: <strong className="uppercase">{roleDefaultLevel}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE B: SUMMARY TABLE OF ALL USERS */}
          {userViewMode === "table" && (
            <div className="border border-[#EADBCE] rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                    <tr>
                      <th className="px-3 py-2.5 w-10 text-center">#</th>
                      <th className="px-3 py-2.5">User</th>
                      <th className="px-3 py-2.5">Role &amp; Zone</th>
                      <th className="px-3 py-2.5">Access Status</th>
                      <th className="px-3 py-2.5 text-center">Accessible Modules</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {filteredUsers.map((u, idx) => {
                      const overrides = Object.keys(userConfig[u.id] || {});
                      // Count accessible modules for this user
                      const accessibleCount = ALL_SYSTEM_MODULES.filter((m) => {
                        const acc = getUserModuleAccess(u.id, u.role, m.id);
                        return acc.level !== "none";
                      }).length;

                      const isSelected = u.id === selectedUserId;

                      return (
                        <tr
                          key={u.id}
                          className={cn(
                            "hover:bg-[#FAF7F2] transition-colors",
                            isSelected && "bg-[#FBF3E4]/50"
                          )}
                        >
                          <td className="px-3 py-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-[#801824] text-white flex items-center justify-center font-bold text-[10px]">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                                <p className="text-[10px] text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <Badge className="bg-slate-100 text-slate-800 border-slate-300 text-[10px] mr-1.5">
                              {u.role}
                            </Badge>
                            <span className="text-[11px] text-slate-600">{u.zone || "Head Office"}</span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {overrides.length > 0 ? (
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                                {overrides.length} Custom Overrides
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">Standard Role Defaults</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap font-mono font-bold text-slate-800">
                            {accessibleCount} / {ALL_SYSTEM_MODULES.length}
                          </td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px]">
                              {u.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setUserViewMode("cards");
                              }}
                              className="text-xs font-bold text-[#801824] hover:bg-[#FAF4EB] cursor-pointer h-7"
                            >
                              Configure Modules
                              <ChevronRight className="size-3.5 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB 2: BY ROLE (DEFAULT ACCESS MATRIX)                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "by-role" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 text-xs text-[#5C1A20] leading-relaxed">
            <strong className="text-[#801824]">Role Access Defaults:</strong> Configure the default module access level for each role.
            Any user without an individual custom override inherits these role-level permissions.
          </div>

          {/* Matrix Table */}
          <div className="overflow-hidden rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-xs border-collapse text-left">
                <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-20">
                  <tr className="divide-x divide-[#DCD5C8]">
                    <th className="px-4 py-3 text-left font-bold text-[#7A1316] w-48 min-w-[160px] sticky left-0 bg-[#F5EBE1] z-30">
                      Role / Portal
                    </th>
                    {ALL_SYSTEM_MODULES.map((m) => (
                      <th key={m.id} className="px-2 py-2.5 text-center font-bold text-[#7A1316] min-w-[110px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] leading-tight font-bold">{m.label}</span>
                          <span className="text-[9px] text-[#7A1316]/70 uppercase font-medium">{m.category}</span>
                          {/* Column quick-set buttons */}
                          <div className="flex gap-1 mt-0.5">
                            {ACCESS_LEVEL_OPTIONS.map((o) => (
                              <button
                                key={o.value}
                                type="button"
                                title={`Set all roles to ${o.label} for ${m.label}`}
                                onClick={() => handleSetRoleColAll(m.id, o.value)}
                                className={cn("size-2.5 rounded-full transition-opacity cursor-pointer opacity-70 hover:opacity-100", o.color)}
                              />
                            ))}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-bold text-[#7A1316] min-w-[85px] text-[11px]">
                      Set Row
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
                  {ROLES_FOR_ACCESS.map((role) => (
                    <tr key={role.key} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                      <td className="px-4 py-3 font-bold text-[#801824] whitespace-nowrap bg-[#FAF7F2]/60 sticky left-0 z-10 border-r border-[#EADBCE]">
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-normal">{role.key}</span>
                        </div>
                      </td>

                      {ALL_SYSTEM_MODULES.map((m) => {
                        const current = roleConfig[role.key]?.[m.id] ?? "full";
                        return (
                          <td key={m.id} className="px-1.5 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {ACCESS_LEVEL_OPTIONS.map((o) => (
                                <button
                                  key={o.value}
                                  type="button"
                                  title={`${o.label}: ${m.label}`}
                                  onClick={() => handleSetRoleModule(role.key, m.id, o.value)}
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-[9px] font-bold border cursor-pointer transition-all",
                                    current === o.value
                                      ? o.value === "full"
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-2xs font-black"
                                        : o.value === "read"
                                        ? "bg-blue-100 text-blue-800 border-blue-400 shadow-2xs font-black"
                                        : "bg-rose-100 text-rose-800 border-rose-400 shadow-2xs font-black"
                                      : "bg-[#FAF7F2] text-slate-400 border-transparent hover:border-[#DCD5C8] hover:text-[#5C1A20]"
                                  )}
                                >
                                  {o.value === "full" ? "F" : o.value === "read" ? "R" : "X"}
                                </button>
                              ))}
                            </div>
                          </td>
                        );
                      })}

                      {/* Row quick-set buttons */}
                      <td className="px-3 py-3 text-center bg-[#FAF7F2]/30">
                        <div className="flex items-center justify-center gap-1.5">
                          {ACCESS_LEVEL_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              title={`Set entire row to ${o.label}`}
                              onClick={() => handleSetRoleRowAll(role.key, o.value)}
                              className={cn("size-3 rounded-full transition-opacity cursor-pointer opacity-70 hover:opacity-100", o.color)}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB 3: ACCESS POLICY & SETTINGS                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "policy" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#EADBCE] rounded-xl p-5 space-y-5 shadow-2xs">
            <h4 className="text-sm font-bold text-[#801824] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="size-4" />
              Navigation &amp; Module Visibility Policy
            </h4>

            {/* Policy Toggle 1: Hide restricted modules */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2]">
              <div className="space-y-1">
                <Label htmlFor="hide-restricted-switch" className="text-xs font-bold text-slate-900 cursor-pointer">
                  Hide Restricted Modules from Sidebar Navigation
                </Label>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  When enabled, modules where a user or role has &quot;No Access&quot; are completely removed from their navigation menu.
                  When disabled, restricted modules remain visible with a locked indicator.
                </p>
              </div>
              <Switch
                id="hide-restricted-switch"
                checked={hideRestricted}
                onCheckedChange={(val) => onHideRestrictedChange?.(val)}
                className="data-[state=checked]:bg-[#801824]"
              />
            </div>

            {/* Policy 2: User Overrides active summary */}
            <div className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">User-Specific Override Registry</h5>
                  <p className="text-xs text-slate-500">
                    Currently tracking {userOverrideCount} users with customized module access rules.
                  </p>
                </div>
                {userOverrideCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUserConfigChange?.({});
                      toast({
                        title: "All Overrides Cleared",
                        description: "All users now strictly inherit their role defaults.",
                      });
                    }}
                    className="text-xs font-bold text-rose-800 border-rose-300 hover:bg-rose-50 cursor-pointer"
                  >
                    Clear All User Overrides
                  </Button>
                )}
              </div>

              {userOverrideCount > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {Object.keys(userConfig).map((uid) => {
                    const u = allUsers.find((usr) => usr.id === uid);
                    const overrideKeys = Object.keys(userConfig[uid] || {});
                    if (!u || overrideKeys.length === 0) return null;

                    return (
                      <div key={uid} className="p-2.5 rounded-lg border border-[#DCD5C8] bg-[#FAF7F2] flex items-center justify-between gap-2 text-xs">
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{overrideKeys.length} modules overridden</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUserId(uid);
                            setActiveTab("by-user");
                            setUserViewMode("cards");
                          }}
                          className="h-7 text-[10px] font-bold text-[#801824] hover:bg-white"
                        >
                          Edit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-[#FAF7F2] rounded-lg border border-dashed border-[#DCD5C8]">
                  No custom user overrides active. All users inherit directly from their assigned role defaults.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Backwards-compatible export
export const AccessControlMatrix = ModuleAccessManager;
