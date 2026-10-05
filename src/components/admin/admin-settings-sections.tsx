"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Building,
  Users,
  Database,
  Workflow,
  FolderOpen,
  Bell,
  Cpu,
  Webhook,
  BarChart3,
  ShieldAlert,
  Server,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Search,
  Download,
  RefreshCw,
  Sliders,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  MessageSquare,
  Calendar,
  Globe,
  Palette,
  Plug,
  FileText,
  Activity,
  HardDrive,
  Terminal,
  FileSpreadsheet,
  Layers,
  ExternalLink,
  Shield,
  Clock,
  Send,
  SlidersHorizontal,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoleBadge } from "@/components/design-system/badges";
import type { RoleKey, SystemSettings } from "@/types";
import { AdminWorkflow } from "./admin-workflow";
import { AdminUsers } from "./admin-users";
import { AdminRoles } from "./admin-roles";
import { AccessControlMatrix } from "./admin-settings";

// ============================================================
// Common Reusable Section Card for Grouped Layout (No Tabs)
// ============================================================
export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs", className)}>
      <div className="bg-[#FAF7F2] p-3 sm:px-4 sm:py-3 border-b border-[#EADBCE] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-[#FAF4EB] border border-[#EADBCE] text-[#801824] shrink-0">
              <Icon className="size-4" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wider">{title}</h4>
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

// ============================================================
// 1. ORGANIZATION SECTION
// Groups: Statutory Profile, Departments, Divisions, Designations
// ============================================================

export function OrganizationSection() {
  const { toast } = useToast();
  const [profile, setProfile] = React.useState({
    name: "Hyderabad Metropolitan Development Authority",
    code: "HMDA-MAUD",
    regNo: "G.O. Ms. No. 168 / MA&UD Dept.",
    head: "Shri Dana Kishore, IAS (Principal Secretary & Metropolitan Commissioner)",
    address: "Swarna Jayanti Complex, Sanjeeva Reddy Nagar, Hyderabad - 500038, Telangana",
    phone: "040-23456789 / 1800-425-8888",
    email: "commissioner@hmda.gov.in",
    workingHours: "Monday – Saturday: 09:30 AM – 05:30 PM (IST)",
    jurisdiction: "7,257 sq. km (16 Municipalities, 849 Villages & 7 Growth Corridors)",
  });

  const [departments, setDepartments] = React.useState([
    { id: "dept-1", name: "Town & Country Planning", hod: "Chief Town Planner", staff: 38, status: "Active", code: "TCP" },
    { id: "dept-2", name: "Engineering & Structural Safety", hod: "Chief Engineer (Buildings)", staff: 29, status: "Active", code: "ENG" },
    { id: "dept-3", name: "Fire & Emergency Services Liaison", hod: "Addl. Director (Fire Prevention)", staff: 14, status: "Active", code: "FIRE" },
    { id: "dept-4", name: "Revenue & Fee Assessment", hod: "Revenue Officer", staff: 19, status: "Active", code: "REV" },
    { id: "dept-5", name: "GIS & Cadastral Mapping Wing", hod: "Joint Director (Survey & Land)", staff: 22, status: "Active", code: "GIS" },
    { id: "dept-6", name: "Heritage & Environmental Protection", hod: "Conservation Architect", staff: 9, status: "Active", code: "HER" },
  ]);

  const [divisions, setDivisions] = React.useState([
    { id: "div-1", name: "Zonal Planning Division - North & West", head: "Zonal Head (Cyberabad)", jurisdiction: "Kukatpally, Serilingampally, Patancheru", activeFiles: 142 },
    { id: "div-2", name: "Zonal Planning Division - South & East", head: "Zonal Head (Charminar)", jurisdiction: "Charminar, LB Nagar, Rajendranagar, Shamshabad", activeFiles: 98 },
    { id: "div-3", name: "High-Rise & Mega Projects Cell", head: "Director (Technical)", jurisdiction: "All Commercial & Residential Buildings > 15m Height", activeFiles: 64 },
    { id: "div-4", name: "Inspection & Quality Vigilance Division", head: "Superintending Engineer", jurisdiction: "Plinth, Slab & Completion Mandatory Audits", activeFiles: 185 },
  ]);

  const designations = [
    { title: "Metropolitan Commissioner", cadre: "IAS (Principal Secretary)", level: "Level 6", roleKey: "COMMISSIONER", count: 1 },
    { title: "Additional Commissioner", cadre: "State Civil Service / MA&UD", level: "Level 5", roleKey: "ADDITIONAL_COMMISSIONER", count: 2 },
    { title: "Director (Town Planning)", cadre: "Directorate of Town & Country Planning", level: "Level 4", roleKey: "DIRECTOR", count: 3 },
    { title: "Zonal Joint Director (ZJD)", cadre: "Senior Town Planner", level: "Level 3", roleKey: "ZJD", count: 5 },
    { title: "Zonal Deputy Director (ZDD)", cadre: "Deputy Town Planner", level: "Level 3", roleKey: "ZDD", count: 8 },
    { title: "Planning Officer (Zonal Head)", cadre: "Planning Officer / Architect", level: "Level 2", roleKey: "ZONAL_HEAD", count: 12 },
    { title: "Town Planning Assistant (TPA)", cadre: "Assistant Planning Officer", level: "Level 1", roleKey: "TPA", count: 24 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Profile */}
      <SectionCard
        icon={Building}
        title="Statutory Authority Profile"
        subtitle="Official headquarters, jurisdiction, and gazette registration details"
        action={
          <Button
            size="sm"
            onClick={() => toast({ title: "Organization Profile Updated", description: "Profile details saved." })}
            className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] text-xs font-bold h-8 px-4 rounded-lg cursor-pointer"
          >
            <Save className="size-3.5 mr-1" /> Save Profile
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Authority Official Name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Statutory Gazette / Reg No.</Label>
            <Input value={profile.regNo} onChange={(e) => setProfile({ ...profile, regNo: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-[#4A1017]">Head of Authority (Commissioner)</Label>
            <Input value={profile.head} onChange={(e) => setProfile({ ...profile, head: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-[#4A1017]">Registered Address & Headquarters</Label>
            <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Official Contact & Helpline</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Official Support Email</Label>
            <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Official Working Hours</Label>
            <Input value={profile.workingHours} onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Geographical Jurisdiction Coverage</Label>
            <Input value={profile.jurisdiction} onChange={(e) => setProfile({ ...profile, jurisdiction: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
        </div>
      </SectionCard>

      {/* 2. Departments */}
      <SectionCard
        icon={Layers}
        title={`Configured Departments (${departments.length})`}
        subtitle="Operational departments, assigned HODs, and current staff strength"
        action={
          <Button
            size="sm"
            onClick={() => toast({ title: "Department", description: "New department form opened." })}
            className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" /> Add Department
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold">
              <tr className="border-b border-[#DCD5C8]">
                <th className="p-3">Code</th>
                <th className="p-3">Department Name</th>
                <th className="p-3">Head of Department (HOD)</th>
                <th className="p-3 text-center">Staff Count</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-mono font-bold text-[#801824]">{d.code}</td>
                  <td className="p-3 font-semibold text-[#4A1017]">{d.name}</td>
                  <td className="p-3 text-slate-700">{d.hod}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{d.staff}</td>
                  <td className="p-3"><Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 3. Divisions */}
      <SectionCard
        icon={SlidersHorizontal}
        title={`Zonal Planning Divisions (${divisions.length})`}
        subtitle="Geographic division offices and ongoing file load"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {divisions.map((div) => (
            <div key={div.id} className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#801824]">{div.name}</span>
                <Badge variant="outline" className="text-[10px] bg-white text-[#801824] border-[#EADBCE]">
                  {div.activeFiles} Active Files
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600">Lead: <span className="font-semibold text-[#4A1017]">{div.head}</span></p>
              <p className="text-[11px] text-slate-500">Jurisdiction: {div.jurisdiction}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Designations */}
      <SectionCard
        icon={ShieldCheck}
        title={`Officer Designations & Cadres (${designations.length})`}
        subtitle="Official hierarchy, civil service cadre, and associated system roles"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">Official Designation</th>
                <th className="p-3">Cadre & Service</th>
                <th className="p-3">Approval Level</th>
                <th className="p-3">System Role</th>
                <th className="p-3 text-center">Active Officers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {designations.map((des, i) => (
                <tr key={i} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-bold text-[#4A1017]">{des.title}</td>
                  <td className="p-3 text-slate-700">{des.cadre}</td>
                  <td className="p-3"><Badge variant="outline" className="bg-[#FAF4EB] text-[#801824] border-[#EADBCE]">{des.level}</Badge></td>
                  <td className="p-3"><RoleBadge role={des.roleKey as RoleKey} label={des.roleKey} /></td>
                  <td className="p-3 text-center font-bold text-[#801824]">{des.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 2. USERS & ACCESS SECTION
// Groups: Directory, Roles, Permissions, Module Access, Auth Policy
// ============================================================

export function UsersAccessSection({
  roleAccessConfig,
  onRoleAccessChange,
  userAccessConfig,
  onUserAccessChange,
  hideRestrictedModules,
  onHideRestrictedModulesChange,
}: {
  roleAccessConfig: SystemSettings["roleAccessConfig"];
  onRoleAccessChange: (cfg: SystemSettings["roleAccessConfig"]) => void;
  userAccessConfig?: SystemSettings["userAccessConfig"];
  onUserAccessChange?: (cfg: SystemSettings["userAccessConfig"]) => void;
  hideRestrictedModules?: boolean;
  onHideRestrictedModulesChange?: (val: boolean) => void;
}) {
  const { toast } = useToast();
  const [authSettings, setAuthSettings] = React.useState({
    sessionTimeoutMinutes: 30,
    maxConcurrentLogins: 2,
    minPasswordLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    passwordExpiryDays: 90,
    lockoutAttempts: 5,
    lockoutDurationMinutes: 15,
    mfaForOfficers: true,
    mfaForLTP: false,
  });

  const permissionsList = [
    { module: "Applications", perms: ["application:create", "application:view_own", "application:view_all"] },
    { module: "Drawings & Scrutiny", perms: ["drawing:upload", "drawing:view", "drawing:scrutinize"] },
    { module: "Documents", perms: ["document:upload", "document:view", "document:verify", "document:reject"] },
    { module: "Fee Assessment", perms: ["fee:calculate", "fee:manage", "payment:initiate", "payment:verify"] },
    { module: "Workflow Progression", perms: ["workflow:approve", "workflow:forward", "workflow:return", "workflow:reject"] },
    { module: "Objections & Shortfalls", perms: ["shortfall:raise", "shortfall:view", "shortfall:resolve"] },
    { module: "Administration", perms: ["user:manage", "role:manage", "config:manage", "audit:view", "notifications:manage"] },
    { module: "Monitoring & SLA", perms: ["reports:view", "officer_progress:view", "sla:view"] },
  ];

  return (
    <div className="space-y-6">
      {/* 1. User Directory */}
      <SectionCard
        icon={Users}
        title="User Accounts Directory"
        subtitle="Manage department officers, staff directories, and portal credentials"
      >
        <AdminUsers />
      </SectionCard>

      {/* 2. Roles */}
      <SectionCard
        icon={ShieldCheck}
        title="Roles & Privilege Hierarchy"
        subtitle="System roles, tier assignments, and core functional authorizations"
      >
        <AdminRoles />
      </SectionCard>

      {/* 3. Permissions Registry */}
      <SectionCard
        icon={KeyRound}
        title="System Permissions Registry"
        subtitle="Master list of functional permissions granted to departmental roles and external stakeholders"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissionsList.map((grp) => (
            <div key={grp.module} className="rounded-lg border border-[#EADBCE] bg-[#FAF7F2] p-3 space-y-2">
              <span className="text-xs font-bold text-[#4A1017]">{grp.module}</span>
              <div className="flex flex-wrap gap-1">
                {grp.perms.map((p) => (
                  <span key={p} className="font-mono text-[10px] bg-white border border-[#EADBCE] px-2 py-0.5 rounded text-[#801824]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Granular Access Matrix */}
      <SectionCard
        icon={Lock}
        title="Granular Module Access Matrix"
        subtitle="Configure module visibility, read, write, and approval levels across roles"
      >
        <AccessControlMatrix
          config={roleAccessConfig ?? {}}
          onChange={onRoleAccessChange}
          userConfig={userAccessConfig ?? {}}
          onUserConfigChange={onUserAccessChange}
          hideRestricted={hideRestrictedModules ?? false}
          onHideRestrictedChange={onHideRestrictedModulesChange}
        />
      </SectionCard>

      {/* 5. Auth Policy */}
      <SectionCard
        icon={ShieldAlert}
        title="Authentication & Session Security Policy"
        subtitle="Password expiration, multi-factor authentication, and lockout rules"
        action={
          <Button
            size="sm"
            onClick={() => toast({ title: "Security Policy Updated", description: "Authentication parameters saved." })}
            className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] text-xs font-bold h-8 px-4 rounded-lg cursor-pointer"
          >
            <Save className="size-3.5 mr-1" /> Save Authentication Rules
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A1017]">Session Inactivity Timeout (Minutes)</Label>
              <Input type="number" value={authSettings.sessionTimeoutMinutes} onChange={(e) => setAuthSettings({ ...authSettings, sessionTimeoutMinutes: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A1017]">Max Concurrent Logins per User</Label>
              <Input type="number" value={authSettings.maxConcurrentLogins} onChange={(e) => setAuthSettings({ ...authSettings, maxConcurrentLogins: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A1017]">Account Lockout Attempt Threshold</Label>
              <Input type="number" value={authSettings.lockoutAttempts} onChange={(e) => setAuthSettings({ ...authSettings, lockoutAttempts: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A1017]">Lockout Duration (Minutes)</Label>
              <Input type="number" value={authSettings.lockoutDurationMinutes} onChange={(e) => setAuthSettings({ ...authSettings, lockoutDurationMinutes: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A1017]">Password Expiry Interval (Days)</Label>
              <Input type="number" value={authSettings.passwordExpiryDays} onChange={(e) => setAuthSettings({ ...authSettings, passwordExpiryDays: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A1017]">Minimum Password Length</Label>
              <Input type="number" value={authSettings.minPasswordLength} onChange={(e) => setAuthSettings({ ...authSettings, minPasswordLength: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
            </div>
          </div>

          <Separator className="bg-[#EADBCE]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
              <span className="text-xs font-bold text-[#4A1017]">Two-Factor Authentication for Officers</span>
              <Switch checked={authSettings.mfaForOfficers} onCheckedChange={(v) => setAuthSettings({ ...authSettings, mfaForOfficers: v })} className="data-[state=checked]:bg-[#801824]" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
              <span className="text-xs font-bold text-[#4A1017]">Require Special Character in Passwords</span>
              <Switch checked={authSettings.requireSpecialChar} onCheckedChange={(v) => setAuthSettings({ ...authSettings, requireSpecialChar: v })} className="data-[state=checked]:bg-[#801824]" />
            </label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 3. MASTERS SECTION
// Groups: Projects, Zones, PMCs, Contractors, Tickets, Categories, Statuses
// ============================================================

export function MastersSection() {
  const { toast } = useToast();

  const projectsMaster = [
    { code: "RES-IND", name: "Residential Individual Plot", heightLimit: "<= 10m (G+2)", autoScrutiny: true, slaDays: 7 },
    { code: "RES-APT", name: "Residential Multi-Storey Apartments", heightLimit: "<= 15m", autoScrutiny: true, slaDays: 14 },
    { code: "COMM-RET", name: "Commercial & Retail Complex", heightLimit: "Varies", autoScrutiny: false, slaDays: 21 },
    { code: "IND-WARE", name: "Industrial Shed / Logistics Hub", heightLimit: "Industrial Zone", autoScrutiny: false, slaDays: 30 },
    { code: "INST-EDU", name: "Institutional / Educational Campus", heightLimit: "Special Norms", autoScrutiny: false, slaDays: 30 },
    { code: "HR-SPECIAL", name: "High-Rise (> 15m up to 55m)", heightLimit: "High-Rise Panel", autoScrutiny: false, slaDays: 45 },
  ];

  const zonesMaster = [
    { code: "ZONE-N", name: "North Zone", office: "Medchal Zonal Office", head: "Sri P. Ramesh (PO)", coverage: "14 Wards" },
    { code: "ZONE-S", name: "South Zone", office: "Shamshabad Zonal Office", head: "Smt. K. Shailaja (PO)", coverage: "18 Wards" },
    { code: "ZONE-E", name: "East Zone", office: "Ghatkesar Zonal Office", head: "Sri V. Anand (PO)", coverage: "16 Wards" },
    { code: "ZONE-W", name: "West Zone (Cyberabad)", office: "Gachibowli Zonal Office", head: "Sri M. Srinivas (PO)", coverage: "22 Wards" },
    { code: "ZONE-C", name: "Central Zone", office: "Khairatabad Head Office", head: "Smt. B. Geetha (PO)", coverage: "20 Wards" },
  ];

  const pmcsMaster = [
    { name: "Tata Consulting Engineers Ltd.", regNo: "PMC-2024-001", rating: "4.9 / 5", projects: 18, validity: "31-Dec-2027" },
    { name: "STUP Consultants P. Ltd.", regNo: "PMC-2023-018", rating: "4.8 / 5", projects: 12, validity: "30-Jun-2026" },
    { name: "L&T Infrastructure Engineering", regNo: "PMC-2023-005", rating: "4.9 / 5", projects: 22, validity: "15-Aug-2028" },
    { name: "Meinhardt Infrastructure Consultants", regNo: "PMC-2024-042", rating: "4.7 / 5", projects: 9, validity: "31-Mar-2027" },
  ];

  const contractorsMaster = [
    { name: "NCC Limited", licNo: "CONT-SPL-A-108", class: "Special Class A", insurance: "CARP-2026-9901", activeSites: 14 },
    { name: "Ramky Infrastructure Ltd.", licNo: "CONT-A-214", class: "Class A", insurance: "CARP-2026-8822", activeSites: 9 },
    { name: "Aparna Constructions", licNo: "CONT-A-305", class: "Class A", insurance: "CARP-2026-7731", activeSites: 18 },
    { name: "My Home Constructions", licNo: "CONT-A-412", class: "Class A", insurance: "CARP-2026-6640", activeSites: 11 },
  ];

  const ticketTypes = [
    { code: "TCK-SCRUTINY", name: "Drawing Scrutiny Rule Clarification", defaultRole: "Town Planning Assistant", priority: "Medium" },
    { code: "TCK-DOCS", name: "Document Deficiency Query", defaultRole: "Zonal Head", priority: "High" },
    { code: "TCK-FEE", name: "Fee & Penalty Assessment Inquiry", defaultRole: "Revenue Officer", priority: "Medium" },
    { code: "TCK-INSP", name: "Site Inspection Reschedule Request", defaultRole: "Field Inspector", priority: "Low" },
    { code: "TCK-PAYMENT", name: "Payment Gateway Transaction Inquiry", defaultRole: "Treasury Officer", priority: "Urgent" },
  ];

  const inspectionCategories = [
    { name: "Plinth Level Verification", trigger: "Within 15 days of excavation", mandatory: true, fee: "Included in Scrutiny" },
    { name: "First Floor Slab Verification", trigger: "Prior to 2nd floor casting", mandatory: true, fee: "Included in Scrutiny" },
    { name: "Superstructure Height Check", trigger: "Post roof casting", mandatory: true, fee: "Included in Scrutiny" },
    { name: "Occupancy Certificate (OC) Final Inspection", trigger: "Building complete", mandatory: true, fee: "Rs. 5,000" },
    { name: "Rainwater Harvesting & Solar Verification", trigger: "OC stage", mandatory: true, fee: "Mandatory condition" },
  ];

  const statusesMaster = [
    { key: "DRAFT", label: "Draft Application", badge: "bg-slate-100 text-slate-800" },
    { key: "DRAWING_UPLOADED", label: "Drawing Uploaded", badge: "bg-blue-100 text-blue-800" },
    { key: "SCRUTINY_IN_PROGRESS", label: "Scrutiny In Progress", badge: "bg-amber-100 text-amber-800" },
    { key: "DOCUMENT_VERIFICATION", label: "Document Verification", badge: "bg-indigo-100 text-indigo-800" },
    { key: "FEE_GENERATED", label: "Fee Generated", badge: "bg-purple-100 text-purple-800" },
    { key: "PAYMENT_PENDING", label: "Payment Pending", badge: "bg-orange-100 text-orange-800" },
    { key: "ZONAL_HEAD_REVIEW", label: "Zonal Head Review", badge: "bg-cyan-100 text-cyan-800" },
    { key: "DIRECTOR_REVIEW", label: "Director Review", badge: "bg-amber-100 text-amber-800" },
    { key: "COMMISSIONER_REVIEW", label: "Commissioner Review", badge: "bg-rose-100 text-rose-800" },
    { key: "APPROVED", label: "Sanctioned & Approved", badge: "bg-emerald-100 text-emerald-800" },
    { key: "REJECTED", label: "Rejected", badge: "bg-red-100 text-red-800" },
    { key: "SHORTFALL_RAISED", label: "Shortfall Raised", badge: "bg-amber-100 text-amber-800" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Projects Master */}
      <SectionCard
        icon={Database}
        title="Project Classifications Master"
        subtitle="Building types, height restrictions, automated scrutiny eligibility, and SLA days"
        action={
          <Button
            size="sm"
            onClick={() => toast({ title: "Master", description: "Add project modal" })}
            className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" /> Add Project Type
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Project Classification</th>
                <th className="p-3">Height Limit</th>
                <th className="p-3 text-center">Auto-Scrutiny</th>
                <th className="p-3 text-center">SLA Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {projectsMaster.map((p) => (
                <tr key={p.code} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-mono font-bold text-[#801824]">{p.code}</td>
                  <td className="p-3 font-bold text-[#4A1017]">{p.name}</td>
                  <td className="p-3 text-slate-700">{p.heightLimit}</td>
                  <td className="p-3 text-center">
                    {p.autoScrutiny ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Enabled</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Manual</Badge>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold text-[#801824]">{p.slaDays} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 2. Zones Master */}
      <SectionCard
        icon={Globe}
        title="Planning Zones & Jurisdiction"
        subtitle="Zonal headquarters, assigned Planning Officers, and ward counts"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">Zone Code</th>
                <th className="p-3">Zone Name</th>
                <th className="p-3">Headquarters</th>
                <th className="p-3">Planning Officer In-Charge</th>
                <th className="p-3 text-center">Wards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {zonesMaster.map((z) => (
                <tr key={z.code} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-mono font-bold text-[#801824]">{z.code}</td>
                  <td className="p-3 font-bold text-[#4A1017]">{z.name}</td>
                  <td className="p-3 text-slate-700">{z.office}</td>
                  <td className="p-3 font-semibold text-slate-800">{z.head}</td>
                  <td className="p-3 text-center"><Badge variant="outline" className="text-[10px] bg-[#FAF4EB] text-[#801824] border-[#EADBCE]">{z.coverage}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 3. PMCs & Contractors */}
      <SectionCard
        icon={Building2}
        title="Registered PMCs & Contractors"
        subtitle="Empaneled Project Management Consultants and licensed builders"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#EADBCE] bg-[#FAF7F2] p-3 space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Project Management Consultants (PMCs)</span>
            <div className="space-y-2">
              {pmcsMaster.map((pmc, i) => (
                <div key={i} className="p-2.5 bg-white rounded-lg border border-[#EADBCE] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#4A1017]">{pmc.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{pmc.regNo} · Valid to {pmc.validity}</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{pmc.rating}</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#EADBCE] bg-[#FAF7F2] p-3 space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Registered Construction Contractors</span>
            <div className="space-y-2">
              {contractorsMaster.map((c, i) => (
                <div key={i} className="p-2.5 bg-white rounded-lg border border-[#EADBCE] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#4A1017]">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{c.licNo} · {c.class}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-[#FAF4EB] text-[#801824] border-[#EADBCE]">{c.activeSites} Sites</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 4. Inspection Categories & Statuses */}
      <SectionCard
        icon={CheckCircle2}
        title="Mandatory Inspection Stages & Application Statuses"
        subtitle="Site audit criteria and standard workflow status lifecycle"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Mandatory Site Inspection Stages</span>
            <div className="space-y-2">
              {inspectionCategories.map((c, i) => (
                <div key={i} className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] text-xs space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#4A1017]">{c.name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Mandatory</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">Trigger: {c.trigger}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Workflow Status Lifecycle</span>
            <div className="grid grid-cols-2 gap-2">
              {statusesMaster.map((s) => (
                <div key={s.key} className="p-2 bg-white rounded-lg border border-[#EADBCE] text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px]">{s.label}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold", s.badge)}>{s.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 4. WORKFLOW SECTION
// Groups: Active Engine, Delegation & Signing, SLAs, Escalations
// ============================================================

export function WorkflowSection() {
  const { toast } = useToast();
  const [delegationEnabled, setDelegationEnabled] = React.useState(true);
  const [dualSignOff, setDualSignOff] = React.useState(true);

  const slaTiers = [
    { stage: "Drawing Scrutiny (Pre-Check)", target: "48 Hours", amber: "36 Hours", escalation: "Zonal Head" },
    { stage: "Document & Site Verification", target: "72 Hours", amber: "48 Hours", escalation: "Zonal Deputy Director" },
    { stage: "Zonal Head Review", target: "5 Business Days", amber: "4 Days", escalation: "Director" },
    { stage: "Director Clearance", target: "5 Business Days", amber: "4 Days", escalation: "Additional Commissioner" },
    { stage: "Commissioner Final Sanction", target: "3 Business Days", amber: "2 Days", escalation: "Principal Secretary" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Workflow Engine */}
      <SectionCard
        icon={Workflow}
        title="Active Building Permission Workflow Engine"
        subtitle="Multi-tier review pipeline from submission to final sanction order issuance"
      >
        <AdminWorkflow embedded />
      </SectionCard>

      {/* 2. Approvals Delegation */}
      <SectionCard
        icon={ShieldCheck}
        title="Approval Delegation & Signing Quorums"
        subtitle="Configure sign-off requirements, temporary leave delegation, and dual signatures"
        action={
          <Button
            size="sm"
            onClick={() => toast({ title: "Policy Updated", description: "Approval parameters saved." })}
            className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] text-xs font-bold h-8 px-4 rounded-lg cursor-pointer"
          >
            <Save className="size-3.5 mr-1" /> Save Approval Rules
          </Button>
        }
      >
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#4A1017] block">Temporary Officer Leave Delegation</span>
              <span className="text-[11px] text-slate-500 block">Allow officers on sanctioned leave to temporarily delegate approval authority to peer rank.</span>
            </div>
            <Switch checked={delegationEnabled} onCheckedChange={setDelegationEnabled} className="data-[state=checked]:bg-[#801824]" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#4A1017] block">Dual Officer Sign-Off for Large Projects</span>
              <span className="text-[11px] text-slate-500 block">Requires both Director and Additional Commissioner digital signatures for plots &gt; 5,000 sq.m.</span>
            </div>
            <Switch checked={dualSignOff} onCheckedChange={setDualSignOff} className="data-[state=checked]:bg-[#801824]" />
          </label>
        </div>
      </SectionCard>

      {/* 3. SLA Matrix */}
      <SectionCard
        icon={Clock}
        title="Statutory Citizen Charter SLAs & Automated Escalations"
        subtitle="Mandated turn-around times per review stage and escalation targets"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">Workflow Stage</th>
                <th className="p-3">Citizen Charter SLA</th>
                <th className="p-3">Amber Warning Threshold</th>
                <th className="p-3">Automated Escalation Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {slaTiers.map((s, i) => (
                <tr key={i} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-bold text-[#4A1017]">{s.stage}</td>
                  <td className="p-3 font-semibold text-emerald-800">{s.target}</td>
                  <td className="p-3 text-amber-700 font-semibold">{s.amber}</td>
                  <td className="p-3 text-[#801824] font-bold">{s.escalation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 5. DOCUMENTS SECTION
// Groups: Document Types, Formats, Size, Versioning
// ============================================================

export function DocumentsSection({
  form,
  onFormatToggle,
  onFileSizeChange,
}: {
  form: SystemSettings;
  onFormatToggle: (key: "allowedDrawingFormats" | "allowedDocumentFormats", value: string, on: boolean) => void;
  onFileSizeChange: (mb: number) => void;
}) {
  const documentTypes = [
    { code: "DOC-SALE", name: "Registered Sale Deed / Title Deed", mandatory: true, allowed: "PDF", maxMB: 15 },
    { code: "DOC-ENC", name: "Encumbrance Certificate (EC - 30 Years)", mandatory: true, allowed: "PDF", maxMB: 10 },
    { code: "DOC-NOC-FIRE", name: "State Disaster Response & Fire NOC", mandatory: false, allowed: "PDF", maxMB: 20 },
    { code: "DOC-STRUCT", name: "Structural Stability Certificate (SER)", mandatory: true, allowed: "PDF", maxMB: 25 },
    { code: "DOC-SOIL", name: "Geo-Technical Soil Investigation Report", mandatory: false, allowed: "PDF", maxMB: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Document Types */}
      <SectionCard
        icon={FileText}
        title="Mandatory Document Checklists"
        subtitle="Statutory document attachments required from Licensed Technical Persons (LTP)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">Document Code</th>
                <th className="p-3">Required Document Name</th>
                <th className="p-3">Requirement</th>
                <th className="p-3">Allowed Format</th>
                <th className="p-3 text-center">Max Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {documentTypes.map((d) => (
                <tr key={d.code} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-mono font-bold text-[#801824]">{d.code}</td>
                  <td className="p-3 font-bold text-[#4A1017]">{d.name}</td>
                  <td className="p-3">{d.mandatory ? <Badge className="bg-[#801824] text-white text-[10px]">Mandatory</Badge> : <Badge variant="outline" className="text-[10px]">Optional / Case-based</Badge>}</td>
                  <td className="p-3 font-mono text-slate-700">{d.allowed}</td>
                  <td className="p-3 text-center font-bold text-[#801824]">{d.maxMB} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 2. Format & Versioning Rules */}
      <SectionCard
        icon={HardDrive}
        title="File Verification & Archival Versioning Rules"
        subtitle="Upload retention rules, checksum integrity checks, and version control"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">SHA-256 Checksum Validation</span>
            <p className="text-xs text-slate-600">Calculates cryptographic hash upon upload to prevent unauthorized document alteration during the review lifecycle.</p>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Active Enforcement</Badge>
          </div>
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Automatic Drawing Version Stamping</span>
            <p className="text-xs text-slate-600">Revisions submitted in response to shortfalls automatically increment drawing version tags (e.g. DWG-REV-02).</p>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Active Enforcement</Badge>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 6. NOTIFICATIONS SECTION
// Groups: SMTP, SMS, Templates, Webhooks
// ============================================================

export function NotificationsSection() {
  const { toast } = useToast();
  const [smtp, setSmtp] = React.useState({
    host: "mail.telangana.gov.in",
    port: 587,
    user: "no-reply-buildingpermit@hmda.gov.in",
    senderName: "TS-bPASS Building Permission Authority",
  });

  const templates = [
    { title: "Application Submitted Confirmation", channel: "Email + SMS", trigger: "Form Filing" },
    { title: "Technical Drawing Scrutiny Completed", channel: "Email + SMS", trigger: "Scrutiny Engine" },
    { title: "Technical Shortfall Raised", channel: "Email + SMS + In-App", trigger: "Officer Review" },
    { title: "Fee Demand Note Generated", channel: "Email + SMS", trigger: "Fee Assessment" },
    { title: "Sanction Order & Permit Download Link", channel: "Email + SMS", trigger: "Final Approval" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. SMTP Relay */}
      <SectionCard
        icon={Mail}
        title="SMTP Mail Relay Configuration"
        subtitle="Departmental mail server settings for citizen notifications and receipt dispatches"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Test Email Sent", description: "Verification email dispatched." })} className="border-[#DCD5C8] text-[#801824] text-xs h-8 px-3 rounded-lg"><Send className="size-3 mr-1" /> Send Test Email</Button>
            <Button size="sm" onClick={() => toast({ title: "SMTP Settings Saved", description: "Configuration updated." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold h-8 px-4 rounded-lg"><Save className="size-3.5 mr-1" /> Save Email Settings</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">SMTP Host</Label>
            <Input value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Port</Label>
            <Input type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Sender Email</Label>
            <Input value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Sender Display Name</Label>
            <Input value={smtp.senderName} onChange={(e) => setSmtp({ ...smtp, senderName: e.target.value })} className="h-9 text-xs border-[#EADBCE] bg-white" />
          </div>
        </div>
      </SectionCard>

      {/* 2. DLT SMS Gateway */}
      <SectionCard
        icon={MessageSquare}
        title="DLT National SMS Gateway"
        subtitle="Telecom regulatory approved header and entity configuration"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE]">
            <span className="text-[10px] text-slate-500 font-bold block">DLT Entity ID</span>
            <span className="font-mono text-xs font-bold text-[#801824]">110155239000004123</span>
          </div>
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE]">
            <span className="text-[10px] text-slate-500 font-bold block">Sender Header</span>
            <span className="font-mono text-xs font-bold text-[#801824]">TSHMDA</span>
          </div>
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE]">
            <span className="text-[10px] text-slate-500 font-bold block">Gateway Balance</span>
            <span className="font-bold text-xs text-emerald-800">184,250 Credits</span>
          </div>
        </div>
      </SectionCard>

      {/* 3. Event Templates */}
      <SectionCard
        icon={FileText}
        title="Notification Event Templates & Triggers"
        subtitle="Automated alerts dispatched across SMS and Email at critical workflow milestones"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((t, i) => (
            <div key={i} className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#801824]">{t.title}</span>
                <Badge variant="outline" className="text-[10px] bg-white text-[#5C1A20] border-[#EADBCE]">{t.channel}</Badge>
              </div>
              <p className="text-[11px] text-slate-500">Trigger: {t.trigger}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 7. SYSTEM SECTION
// Groups: Numbering, Cache, Fee Engine, Environment
// ============================================================

export function SystemSection({
  form,
  setField,
}: {
  form: SystemSettings;
  setField: <K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) => void;
}) {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      {/* 1. Date, Time & Localization */}
      <SectionCard
        icon={Calendar}
        title="System Localization & Timezone"
        subtitle="Standard timestamp formatting and regional parameters"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">Default Date Format</Label>
            <Select value={form.dateFormat} onValueChange={(v) => setField("dateFormat", v)}>
              <SelectTrigger className="h-9 text-xs border-[#EADBCE] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent className="border-[#EADBCE] bg-white">
                <SelectItem value="DD MMM YYYY">DD MMM YYYY (e.g., 03 Oct 2026)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g., 03/10/2026)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2026-10-03)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A1017]">System Timezone</Label>
            <Input value="Asia/Kolkata (IST +05:30)" disabled className="h-9 text-xs border-[#EADBCE] bg-white opacity-80" />
          </div>
        </div>
      </SectionCard>

      {/* 2. Fee Engine & Application Numbering */}
      <SectionCard
        icon={Cpu}
        title="Application Numbering & Fee Computation Engine"
        subtitle="Automatic file numbering schema and tariff assessment formulas"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">File Numbering Schema</span>
            <p className="font-mono text-xs font-bold text-[#4A1017]">HMDA/BP/&#123;YEAR&#125;/&#123;ZONE&#125;/&#123;SEQ_00000&#125;</p>
            <p className="text-[11px] text-slate-500">Auto-resets sequence at fiscal year rollover (01-April).</p>
          </div>
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Tariff Calculation Engine</span>
            <p className="text-xs text-slate-700">Built-up area rate: Rs. 15 / sq.ft. + Infrastructure betterment fee 2.5% of market value.</p>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Rule Engine v3.4 Active</Badge>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 8. INTEGRATIONS SECTION
// Groups: APIs, Gateways, GIS, DSC
// ============================================================

export function IntegrationsSection() {
  const { toast } = useToast();

  const apiKeys = [
    { name: "Dharani Land Records Integration API", keyPrefix: "ts_live_dh_98f...", scope: "Read Cadastral", status: "Active" },
    { name: "State Fire & Emergency Services NOC Service", keyPrefix: "ts_live_fire_31a...", scope: "NOC Verification", status: "Active" },
    { name: "Treasury CFMS Payment Gateway", keyPrefix: "ts_live_cfms_77b...", scope: "Challan Settlement", status: "Active" },
    { name: "National e-Governance GIS Cadastral Layer", keyPrefix: "ts_live_gis_12c...", scope: "Spatial Analysis", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. APIs */}
      <SectionCard
        icon={Plug}
        title="Departmental API Integrations"
        subtitle="Inter-agency digital connectors and secure credentials"
        action={
          <Button
            size="sm"
            onClick={() => toast({ title: "API Key", description: "Generate key modal" })}
            className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" /> Generate New Key
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">Application / Integration</th>
                <th className="p-3">Key Token Prefix</th>
                <th className="p-3">Access Scope</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {apiKeys.map((k, i) => (
                <tr key={i} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-bold text-[#4A1017]">{k.name}</td>
                  <td className="p-3 font-mono text-[#801824]">{k.keyPrefix}</td>
                  <td className="p-3 text-slate-700">{k.scope}</td>
                  <td className="p-3"><Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{k.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 2. Gateways & Signatures */}
      <SectionCard
        icon={ShieldCheck}
        title="Payment Gateways & Digital Signatures (DSC)"
        subtitle="Treasury e-Challan providers and Aadhaar digital signing tokens"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Treasury CFMS & SBI e-Pay</span>
            <p className="text-xs text-slate-600">Settles permit fee challans directly to the state treasury head of account 0029-MAUD.</p>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Connected & Verified</Badge>
          </div>
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Class 3 Digital Signature Certificate (DSC)</span>
            <p className="text-xs text-slate-600">Requires USB crypto-token or Aadhaar eSign OTP for sanction order endorsement.</p>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Active Enforcement</Badge>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 9. REPORTS SECTION
// Groups: Metrics, Export, Schedules
// ============================================================

export function ReportsSection() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      {/* 1. Metrics & Exports */}
      <SectionCard
        icon={BarChart3}
        title="MIS Reports & Export Configuration"
        subtitle="Departmental KPI visibility, compliance tracking, and PDF watermarks"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Departmental Metrics Visibility</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
                <span className="text-xs font-bold text-[#4A1017]">Display Cumulative Revenue Collections in Officer Reports</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
                <span className="text-xs font-bold text-[#4A1017]">Show Zonal Pendency & SLA Compliance Benchmarking</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Export Formats & Watermarking</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
                <span className="text-xs font-bold text-[#4A1017]">Stamp Official Verification Watermark on PDF Exports</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
                <span className="text-xs font-bold text-[#4A1017]">Allow Raw Excel (.xlsx) Data Export for Auditors</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 10. SECURITY SECTION
// Groups: Policy, Audit Logs, Login History
// ============================================================

export function SecuritySection() {
  const auditLogs = [
    { time: "Today 13:42", actor: "Commissioner (IAS)", role: "COMMISSIONER", event: "Final Sanction Approved", ip: "10.0.12.44", target: "HMDA/BP/2026/0412" },
    { time: "Today 12:15", actor: "Director (TP)", role: "DIRECTOR", event: "Forwarded with Recommendations", ip: "10.0.12.82", target: "HMDA/BP/2026/0398" },
    { time: "Today 11:30", actor: "Zonal Head (Cyberabad)", role: "ZONAL_HEAD", event: "Shortfall Resolved Verification", ip: "10.0.14.22", target: "HMDA/BP/2026/0410" },
    { time: "Today 10:05", actor: "System Daemon", role: "SYSTEM", event: "Automated SLA Escalation", ip: "localhost", target: "HMDA/BP/2026/0355" },
    { time: "Yesterday 18:20", actor: "Admin", role: "ADMIN", event: "Role Access Permissions Updated", ip: "10.0.1.10", target: "SystemSettings" },
  ];

  const loginHistory = [
    { user: "commissioner@gov.in", role: "COMMISSIONER", ip: "10.0.12.44", time: "12 mins ago", status: "Success" },
    { user: "director.planning@gov.in", role: "DIRECTOR", ip: "103.21.58.45", time: "28 mins ago", status: "Success" },
    { user: "zonalhead.north@gov.in", role: "ZONAL_HEAD", ip: "103.21.58.19", time: "1 hour ago", status: "Success" },
    { user: "applicant.ltp@infra.com", role: "LTP", ip: "49.207.181.5", time: "2 hours ago", status: "Success" },
    { user: "unknown.ip@45.33.12.8", role: "GUEST", ip: "45.33.12.8", time: "4 hours ago", status: "Blocked (Threshold)" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Cyber Security Policy */}
      <SectionCard
        icon={Shield}
        title="Departmental Cyber Security Policy"
        subtitle="Network transport rules, IP geofencing, and protocol hardening"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-[#FAF7F2]">
            <span className="text-xs font-bold text-[#4A1017]">TLS 1.3 Strict Transport Security (HSTS) Enforced</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-[#FAF7F2]">
            <span className="text-xs font-bold text-[#4A1017]">Prevent Simultaneous Logins from Multiple Geolocation IPs</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
          </label>
        </div>
      </SectionCard>

      {/* 2. Audit Trail */}
      <SectionCard
        icon={Activity}
        title={`Immutable Security Audit Trail (${auditLogs.length} Events)`}
        subtitle="Cryptographically sealed audit log of state actions and permission grants"
      >
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8] sticky top-0">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 text-slate-500 font-mono">{log.time}</td>
                  <td className="p-3 font-bold text-[#4A1017]">{log.actor}</td>
                  <td className="p-3 text-[#801824] font-semibold">{log.event}</td>
                  <td className="p-3 font-mono text-slate-700">{log.target}</td>
                  <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 3. Login History */}
      <SectionCard
        icon={Clock}
        title="Recent Authentication History"
        subtitle="Latest session access logs and anomaly detection"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
              <tr>
                <th className="p-3">User Principal</th>
                <th className="p-3">Role</th>
                <th className="p-3">Client IP</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {loginHistory.map((h, i) => (
                <tr key={i} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-bold text-[#4A1017]">{h.user}</td>
                  <td className="p-3"><RoleBadge role={h.role as RoleKey} label={h.role} /></td>
                  <td className="p-3 font-mono text-slate-600">{h.ip}</td>
                  <td className="p-3 text-slate-500">{h.time}</td>
                  <td className="p-3">
                    {h.status === "Success" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Success</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 text-[10px]">{h.status}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 11. SYSTEM ADMIN SECTION
// Groups: Backup, Retention, Health, Logs
// ============================================================

export function SystemAdminSection() {
  const { toast } = useToast();

  const healthMetrics = [
    { service: "PostgreSQL Production DB", status: "Healthy", ping: "4ms", uptime: "99.98%" },
    { service: "Redis In-Memory Cache", status: "Healthy", ping: "1ms", uptime: "100%" },
    { service: "MinIO S3 Document Storage", status: "Healthy", ping: "8ms", uptime: "99.95%" },
    { service: "Auto-Cad Scrutiny Worker Pool", status: "Healthy", ping: "12ms", uptime: "99.90%" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Database & Snapshots */}
      <SectionCard
        icon={HardDrive}
        title="Database & Storage Snapshots"
        subtitle="Automated point-in-time recovery and snapshot archives"
        action={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => toast({ title: "Backup Initiated", description: "Snapshot job dispatched to background." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold h-8 px-3 rounded-lg"><Plus className="size-3 mr-1" /> Create Instant Backup</Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Download", description: "Snapshot archive downloaded." })} className="border-[#DCD5C8] text-[#801824] text-xs h-8 px-3 rounded-lg"><Download className="size-3 mr-1" /> Download Snapshot</Button>
          </div>
        }
      >
        <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Latest Automated Snapshot</span>
          <p className="text-xs font-mono font-bold text-[#801824]">backup_snapshot_20261003_0200.enc (1.42 GB)</p>
          <p className="text-[11px] text-slate-500">Created today at 02:00 AM IST · AES-256 Encrypted</p>
        </div>
      </SectionCard>

      {/* 2. System Health */}
      <SectionCard
        icon={Activity}
        title="System Infrastructure Health Diagnostics"
        subtitle="Core services, latency benchmarks, and uptime availability"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthMetrics.map((m, i) => (
            <div key={i} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">{m.service}</span>
                <span className="text-[11px] text-slate-500 block">Latency: {m.ping} · Uptime: {m.uptime}</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{m.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3. Maintenance Mode */}
      <SectionCard
        icon={Sliders}
        title="Maintenance Mode & Scheduled Downtime"
        subtitle="Restrict citizen portal logins during major administrative database upgrades"
      >
        <label className="flex items-center justify-between p-3.5 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] cursor-pointer">
          <div>
            <span className="text-xs font-bold text-[#4A1017] block">Enable Maintenance Window Mode</span>
            <span className="text-[11px] text-slate-500 block">When active, only System Administrators can sign in. Citizens and LTPs see a maintenance banner.</span>
          </div>
          <Switch className="data-[state=checked]:bg-[#801824]" />
        </label>
      </SectionCard>
    </div>
  );
}
