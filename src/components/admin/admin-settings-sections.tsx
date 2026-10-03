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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
// 1. ORGANIZATION SECTION
// Sub-tabs: Organization Profile, Departments, Divisions, Designations
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
    <div className="space-y-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Building className="size-3.5 mr-1" /> Organization Profile
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Layers className="size-3.5 mr-1" /> Departments ({departments.length})
          </TabsTrigger>
          <TabsTrigger value="divisions" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <SlidersHorizontal className="size-3.5 mr-1" /> Divisions ({divisions.length})
          </TabsTrigger>
          <TabsTrigger value="designations" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <ShieldCheck className="size-3.5 mr-1" /> Designations ({designations.length})
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wider mb-3">Statutory Authority Profile</h4>
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
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => toast({ title: "Organization Profile Updated", description: "Profile details saved." })} className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] text-xs font-bold h-8 px-4 rounded-lg">
                <Save className="size-3.5 mr-1" /> Save Profile
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <div className="bg-[#FAF7F2] p-3 border-b border-[#EADBCE] flex items-center justify-between">
              <span className="text-xs font-bold text-[#801824] uppercase">Configured Departments</span>
              <Button size="sm" onClick={() => toast({ title: "Department", description: "New department form opened." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-7 px-2.5 rounded-lg">
                <Plus className="size-3 mr-1" /> Add Department
              </Button>
            </div>
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
          </div>
        </TabsContent>

        {/* Divisions */}
        <TabsContent value="divisions" className="pt-4 space-y-4">
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
        </TabsContent>

        {/* Designations */}
        <TabsContent value="designations" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 2. USERS & ACCESS SECTION
// Sub-tabs: Users, Roles, Permissions, Access Control, Login & Authentication
// ============================================================

export function UsersAccessSection({
  roleAccessConfig,
  onRoleAccessChange,
}: {
  roleAccessConfig: SystemSettings["roleAccessConfig"];
  onRoleAccessChange: (cfg: SystemSettings["roleAccessConfig"]) => void;
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
    <div className="space-y-4">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Users className="size-3.5 mr-1" /> Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <ShieldCheck className="size-3.5 mr-1" /> Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <KeyRound className="size-3.5 mr-1" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="access" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Lock className="size-3.5 mr-1" /> Access Control
          </TabsTrigger>
          <TabsTrigger value="auth" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <ShieldAlert className="size-3.5 mr-1" /> Login & Authentication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <AdminUsers />
        </TabsContent>

        <TabsContent value="roles" className="pt-4">
          <AdminRoles />
        </TabsContent>

        <TabsContent value="permissions" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-white p-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wider mb-2">System Permissions Registry</h4>
            <p className="text-xs text-slate-600 mb-4">Master list of functional permissions granted to departmental roles and external stakeholders.</p>
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
          </div>
        </TabsContent>

        <TabsContent value="access" className="pt-4">
          <AccessControlMatrix config={roleAccessConfig ?? {}} onChange={onRoleAccessChange} />
        </TabsContent>

        <TabsContent value="auth" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wider">Authentication & Session Security Policy</h4>
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

            <div className="flex justify-end">
              <Button size="sm" onClick={() => toast({ title: "Security Policy Updated", description: "Authentication parameters saved." })} className="bg-[#801824] hover:bg-[#941C2B] text-[#FDF6ED] text-xs font-bold h-8 px-4 rounded-lg">
                <Save className="size-3.5 mr-1" /> Save Authentication Rules
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 3. MASTERS SECTION
// Sub-tabs: Projects, Zones, PMCs, Contractors, Ticket Types, Categories, Statuses
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
    <div className="space-y-4">
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="projects" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">Projects</TabsTrigger>
          <TabsTrigger value="zones" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">Zones</TabsTrigger>
          <TabsTrigger value="pmcs" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">PMCs</TabsTrigger>
          <TabsTrigger value="contractors" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">Contractors</TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">Ticket Types</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">Categories</TabsTrigger>
          <TabsTrigger value="statuses" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5">Statuses</TabsTrigger>
        </TabsList>

        {/* Projects Master */}
        <TabsContent value="projects" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <div className="bg-[#FAF7F2] p-3 border-b border-[#EADBCE] flex justify-between items-center">
              <span className="text-xs font-bold text-[#801824] uppercase">Project Classifications</span>
              <Button size="sm" onClick={() => toast({ title: "Master", description: "Add project modal" })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-7 px-2.5 rounded-lg"><Plus className="size-3 mr-1" /> Add Project Type</Button>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Project Classification</th>
                  <th className="p-3">Height / Criteria</th>
                  <th className="p-3 text-center">Auto-Scrutiny</th>
                  <th className="p-3 text-center">Statutory SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {projectsMaster.map((p) => (
                  <tr key={p.code} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 font-mono font-bold text-[#801824]">{p.code}</td>
                    <td className="p-3 font-semibold text-[#4A1017]">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.heightLimit}</td>
                    <td className="p-3 text-center">{p.autoScrutiny ? <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Enabled</Badge> : <Badge variant="outline" className="text-[10px]">Manual Panel</Badge>}</td>
                    <td className="p-3 text-center font-bold text-[#801824]">{p.slaDays} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Zones Master */}
        <TabsContent value="zones" className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zonesMaster.map((z) => (
              <div key={z.code} className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#801824]">{z.name}</span>
                  <span className="font-mono text-[10px] bg-white border border-[#EADBCE] px-1.5 py-0.5 rounded text-[#5C1A20]">{z.code}</span>
                </div>
                <p className="text-xs text-slate-700">{z.office}</p>
                <p className="text-[11px] text-[#4A1017] font-semibold">{z.head}</p>
                <p className="text-[10px] text-slate-500">Coverage: {z.coverage}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* PMCs Master */}
        <TabsContent value="pmcs" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">Consultant Firm</th>
                  <th className="p-3">Registration No.</th>
                  <th className="p-3">Authority Rating</th>
                  <th className="p-3 text-center">Active Sites</th>
                  <th className="p-3">Validity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {pmcsMaster.map((pmc, i) => (
                  <tr key={i} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 font-bold text-[#4A1017]">{pmc.name}</td>
                    <td className="p-3 font-mono text-slate-600">{pmc.regNo}</td>
                    <td className="p-3 font-bold text-amber-700">{pmc.rating}</td>
                    <td className="p-3 text-center font-bold text-[#801824]">{pmc.projects}</td>
                    <td className="p-3 text-slate-600">{pmc.validity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Contractors Master */}
        <TabsContent value="contractors" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">Contractor Name</th>
                  <th className="p-3">License Number</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">CAR Insurance Policy</th>
                  <th className="p-3 text-center">Active Sites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {contractorsMaster.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 font-bold text-[#4A1017]">{c.name}</td>
                    <td className="p-3 font-mono text-[#801824]">{c.licNo}</td>
                    <td className="p-3"><Badge variant="outline" className="bg-[#FAF4EB] text-slate-700 border-[#EADBCE]">{c.class}</Badge></td>
                    <td className="p-3 font-mono text-slate-600">{c.insurance}</td>
                    <td className="p-3 text-center font-bold text-[#801824]">{c.activeSites}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Ticket Types */}
        <TabsContent value="tickets" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Inquiry / Ticket Category</th>
                  <th className="p-3">Default Assigned Role</th>
                  <th className="p-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {ticketTypes.map((t) => (
                  <tr key={t.code} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 font-mono font-bold text-[#801824]">{t.code}</td>
                    <td className="p-3 font-semibold text-[#4A1017]">{t.name}</td>
                    <td className="p-3 text-slate-700">{t.defaultRole}</td>
                    <td className="p-3"><Badge variant="outline" className="bg-[#FAF4EB] text-[#801824] border-[#EADBCE]">{t.priority}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">Inspection Category</th>
                  <th className="p-3">Mandatory Trigger</th>
                  <th className="p-3">Fee Treatment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {inspectionCategories.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 font-bold text-[#4A1017]">{c.name}</td>
                    <td className="p-3 text-slate-600">{c.trigger}</td>
                    <td className="p-3 font-mono text-[#801824]">{c.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Statuses */}
        <TabsContent value="statuses" className="pt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statusesMaster.map((s) => (
              <div key={s.key} className="rounded-lg border border-[#EADBCE] bg-white p-3 space-y-1">
                <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-bold", s.badge)}>{s.key}</span>
                <p className="text-xs font-bold text-[#4A1017]">{s.label}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 4. WORKFLOW SECTION
// Sub-tabs: Workflows, Approvals, SLA, Escalations
// ============================================================

export function WorkflowSection() {
  const { toast } = useToast();
  const [delegationEnabled, setDelegationEnabled] = React.useState(true);
  const [dualSignOff, setDualSignOff] = React.useState(true);
  const [autoEscalate, setAutoEscalate] = React.useState(true);

  const slaTiers = [
    { stage: "Drawing Scrutiny (Pre-Check)", target: "48 Hours", amber: "36 Hours", escalation: "Zonal Head" },
    { stage: "Document & Site Verification", target: "72 Hours", amber: "48 Hours", escalation: "Zonal Deputy Director" },
    { stage: "Zonal Head Review", target: "5 Business Days", amber: "4 Days", escalation: "Director" },
    { stage: "Director Clearance", target: "5 Business Days", amber: "4 Days", escalation: "Additional Commissioner" },
    { stage: "Commissioner Final Sanction", target: "3 Business Days", amber: "2 Days", escalation: "Principal Secretary" },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="workflows" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Workflow className="size-3.5 mr-1" /> Workflows
          </TabsTrigger>
          <TabsTrigger value="approvals" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <ShieldCheck className="size-3.5 mr-1" /> Approvals
          </TabsTrigger>
          <TabsTrigger value="sla" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Clock className="size-3.5 mr-1" /> SLA
          </TabsTrigger>
          <TabsTrigger value="escalations" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <AlertTriangle className="size-3.5 mr-1" /> Escalations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="pt-4">
          <AdminWorkflow embedded />
        </TabsContent>

        <TabsContent value="approvals" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wider">Approval Delegation & Signing Quorums</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#4A1017] block">Temporary Officer Leave Delegation</span>
                  <span className="text-[11px] text-slate-500 block">Allow officers on sanctioned leave to temporarily delegate approval authority to peer rank.</span>
                </div>
                <Switch checked={delegationEnabled} onCheckedChange={setDelegationEnabled} className="data-[state=checked]:bg-[#801824]" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#4A1017] block">Dual Officer Sign-Off for Large Projects</span>
                  <span className="text-[11px] text-slate-500 block">Requires both Director and Additional Commissioner digital signatures for plots &gt; 5,000 sq.m.</span>
                </div>
                <Switch checked={dualSignOff} onCheckedChange={setDualSignOff} className="data-[state=checked]:bg-[#801824]" />
              </label>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => toast({ title: "Approval Rules Saved", description: "Delegation rules updated." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold h-8 px-4 rounded-lg">
                <Save className="size-3.5 mr-1" /> Save Approval Rules
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sla" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <div className="bg-[#FAF7F2] p-3 border-b border-[#EADBCE]">
              <span className="text-xs font-bold text-[#801824] uppercase">Service Level Agreements (Citizen Charter)</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">Stage / Milestone</th>
                  <th className="p-3">Target Completion</th>
                  <th className="p-3">Amber Warning Threshold</th>
                  <th className="p-3">Breach Escalation Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {slaTiers.map((s, i) => (
                  <tr key={i} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 font-bold text-[#4A1017]">{s.stage}</td>
                    <td className="p-3 font-bold text-emerald-800">{s.target}</td>
                    <td className="p-3 text-amber-700 font-semibold">{s.amber}</td>
                    <td className="p-3 font-medium text-[#801824]">{s.escalation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="escalations" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase tracking-wider">Automated Escalation Matrix</h4>
            <p className="text-xs text-slate-600">When an application remains untouched past statutory SLA, automatic routing triggers escalate to the immediate supervisor.</p>
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">Auto-Escalation on 100% SLA Breach</span>
                <span className="text-[11px] text-slate-500 block">Re-assign priority and notify Zonal Head automatically.</span>
              </div>
              <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} className="data-[state=checked]:bg-[#801824]" />
            </label>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => toast({ title: "Escalation Policy Saved", description: "Matrix saved." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold h-8 px-4 rounded-lg">
                <Save className="size-3.5 mr-1" /> Save Escalations
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 5. DOCUMENTS SECTION
// Sub-tabs: Document Types, File Formats, File Size, Version Control
// ============================================================

export function DocumentsSection({
  form,
  onFormatToggle,
  onFileSizeChange,
}: {
  form: SystemSettings;
  onFormatToggle: (key: "allowedDrawingFormats" | "allowedDocumentFormats", val: string, on: boolean) => void;
  onFileSizeChange: (val: number) => void;
}) {
  const { toast } = useToast();
  const documentTypes = [
    { code: "DOC-TITLE", name: "Registered Sale Deed / Title Document", mandatory: true, allowed: "PDF", maxMB: 25 },
    { code: "DOC-EC", name: "Encumbrance Certificate (30-Year Search)", mandatory: true, allowed: "PDF", maxMB: 15 },
    { code: "DOC-KHATA", name: "Latest Tax Assessment / Mutation Khata", mandatory: true, allowed: "PDF, JPG", maxMB: 10 },
    { code: "DOC-STR", name: "Structural Stability Undertaking", mandatory: true, allowed: "PDF", maxMB: 10 },
    { code: "DOC-FIRE", name: "Fire Services NOC (Provisional)", mandatory: false, allowed: "PDF", maxMB: 20 },
    { code: "DOC-SOIL", name: "Geo-Technical Soil Investigation Report", mandatory: false, allowed: "PDF", maxMB: 30 },
  ];

  const drawingFormats = ["DWG", "DXF", "PDF", "IFC", "RVT"];
  const docFormats = ["PDF", "JPG", "PNG", "TIFF"];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="types" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <FileText className="size-3.5 mr-1" /> Document Types
          </TabsTrigger>
          <TabsTrigger value="formats" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <FileCheck className="size-3.5 mr-1" /> File Formats
          </TabsTrigger>
          <TabsTrigger value="size" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <Sliders className="size-3.5 mr-1" /> File Size
          </TabsTrigger>
          <TabsTrigger value="version" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5">
            <HardDrive className="size-3.5 mr-1" /> Version Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
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
        </TabsContent>

        <TabsContent value="formats" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#801824] uppercase">Allowed CAD & BIM Drawing Formats</h4>
              <div className="flex flex-wrap gap-2">
                {drawingFormats.map((fmt) => {
                  const on = form.allowedDrawingFormats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => onFormatToggle("allowedDrawingFormats", fmt, !on)}
                      className={cn("px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer", on ? "bg-[#801824] text-white border-[#801824]" : "bg-white text-slate-600 border-[#EADBCE] hover:bg-[#FAF4EB]")}
                    >
                      {fmt} {on ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-[#EADBCE]" />

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#801824] uppercase">Allowed Ownership & Supporting Document Formats</h4>
              <div className="flex flex-wrap gap-2">
                {docFormats.map((fmt) => {
                  const on = form.allowedDocumentFormats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => onFormatToggle("allowedDocumentFormats", fmt, !on)}
                      className={cn("px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer", on ? "bg-[#801824] text-white border-[#801824]" : "bg-white text-slate-600 border-[#EADBCE] hover:bg-[#FAF4EB]")}
                    >
                      {fmt} {on ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="size" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Global Upload Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Maximum File Size (MB per individual file)</Label>
                <Input type="number" value={form.maxFileSizeMB} onChange={(e) => onFileSizeChange(Number(e.target.value))} className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Application Aggregate Package Cap (MB)</Label>
                <Input type="number" defaultValue={250} className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="version" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Drawing Versioning & Archive Rules</h4>
            <p className="text-xs text-slate-600">Whenever an LTP architect re-uploads a corrected drawing in response to shortfall, the version is automatically incremented.</p>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white">
                <span className="text-xs font-bold text-[#4A1017]">Maintain All Historical Revisions for Audit</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white">
                <span className="text-xs font-bold text-[#4A1017]">Auto-Watermark Previous Versions as &quot;SUPERSEDED&quot;</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 6. NOTIFICATIONS SECTION
// Sub-tabs: Email, SMS, Templates, Notification Rules
// ============================================================

export function NotificationsSection() {
  const { toast } = useToast();
  const [smtp, setSmtp] = React.useState({
    host: "mail.telangana.gov.in",
    port: 587,
    user: "notifications@authority.gov.in",
    senderName: "Building Permission Regulatory Authority",
  });

  const templates = [
    { title: "Application Submitted Confirmation", channel: "Email + SMS", trigger: "On LTP Submission" },
    { title: "Drawing Scrutiny Clearance Notice", channel: "SMS", trigger: "Scrutiny Passed" },
    { title: "Deficiency / Shortfall Notice", channel: "Email + SMS", trigger: "Shortfall Raised" },
    { title: "Sanction Order & Permit Download Link", channel: "Email + SMS", trigger: "Final Approval" },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="email" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Mail className="size-3.5 mr-1" /> Email</TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><MessageSquare className="size-3.5 mr-1" /> SMS</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><FileText className="size-3.5 mr-1" /> Templates</TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Sliders className="size-3.5 mr-1" /> Notification Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase">SMTP Relay Configuration</h4>
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
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Test Email Sent", description: "Verification email dispatched." })} className="border-[#DCD5C8] text-[#801824] text-xs h-8 px-3 rounded-lg"><Send className="size-3 mr-1" /> Send Test Email</Button>
              <Button size="sm" onClick={() => toast({ title: "SMTP Settings Saved", description: "Configuration updated." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold h-8 px-4 rounded-lg"><Save className="size-3.5 mr-1" /> Save Email Settings</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sms" className="pt-4 space-y-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">DLT National SMS Gateway</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#EADBCE]">
                <span className="text-[10px] text-slate-500 font-bold block">DLT Entity ID</span>
                <span className="font-mono text-xs font-bold text-[#801824]">110155239000004123</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EADBCE]">
                <span className="text-[10px] text-slate-500 font-bold block">Sender Header</span>
                <span className="font-mono text-xs font-bold text-[#801824]">TSHMDA</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EADBCE]">
                <span className="text-[10px] text-slate-500 font-bold block">Gateway Balance</span>
                <span className="font-bold text-xs text-emerald-800">184,250 Credits</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((t, i) => (
              <div key={i} className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#801824]">{t.title}</span>
                  <Badge variant="outline" className="text-[10px] bg-[#FAF4EB] text-[#5C1A20] border-[#EADBCE]">{t.channel}</Badge>
                </div>
                <p className="text-[11px] text-slate-500">Trigger: {t.trigger}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-2">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Dispatch Rules</h4>
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white">
              <span className="text-xs font-bold text-[#4A1017]">Quiet Hours (Hold SMS between 09:00 PM and 08:00 AM)</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white">
              <span className="text-xs font-bold text-[#4A1017]">Send Carbon Copy (CC) Email to Assigned Zonal Head</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 7. SYSTEM SECTION
// Sub-tabs: Date & Time, Number & Currency, Localization, Branding, General Settings
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
    <div className="space-y-4">
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="datetime" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Calendar className="size-3.5 mr-1" /> Date & Time</TabsTrigger>
          <TabsTrigger value="currency" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Sliders className="size-3.5 mr-1" /> Number & Currency</TabsTrigger>
          <TabsTrigger value="localization" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Globe className="size-3.5 mr-1" /> Localization</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Palette className="size-3.5 mr-1" /> Branding</TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Cpu className="size-3.5 mr-1" /> General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="datetime" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-4">
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
          </div>
        </TabsContent>

        <TabsContent value="currency" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Currency Symbol & ISO Code</Label>
                <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                  <SelectTrigger className="h-9 text-xs border-[#EADBCE] bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-[#EADBCE] bg-white">
                    <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Area Measurement Unit</Label>
                <Input value="Square Metres (sq.m)" disabled className="h-9 text-xs border-[#EADBCE] bg-white opacity-80" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="localization" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-4">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Languages Supported</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#801824] text-center font-bold text-xs text-[#801824]">English (Primary)</div>
              <div className="p-3 bg-white rounded-lg border border-[#EADBCE] text-center font-bold text-xs text-slate-700">Telugu (తెలుగు)</div>
              <div className="p-3 bg-white rounded-lg border border-[#EADBCE] text-center font-bold text-xs text-slate-700">Hindi (हिंदी)</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Portal Name</Label>
                <Input value={form.portalName} onChange={(e) => setField("portalName", e.target.value)} className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Portal Subtitle</Label>
                <Input value={form.portalSubtitle} onChange={(e) => setField("portalSubtitle", e.target.value)} className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[#EADBCE] bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">Design Theme</span>
                <span className="text-[11px] text-slate-500 block">Heritage Beige & Maroon palette active authority-wide.</span>
              </div>
              <Badge className="bg-[#801824] text-[#FDF6ED] text-xs">Beige & Maroon</Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="general" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">Demo Mode Flag</span>
                <span className="text-[11px] text-slate-500 block">Pre-fills sample projects and enables demo switching.</span>
              </div>
              <Switch checked={form.demoMode} onCheckedChange={(v) => setField("demoMode", v)} className="data-[state=checked]:bg-[#801824]" />
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 8. INTEGRATIONS SECTION
// Sub-tabs: APIs, External Systems, Webhooks, Sync Settings
// ============================================================

export function IntegrationsSection() {
  const { toast } = useToast();
  const apiKeys = [
    { name: "BPO Central Core API", keyPrefix: "bpo_live_891...", scope: "Full Read/Write", status: "Active" },
    { name: "Dharani Bhoomi Land Records", keyPrefix: "dharani_ro_332...", scope: "Title Verification", status: "Active" },
    { name: "Treasury CyberTax Gateway", keyPrefix: "ctax_pay_772...", scope: "Payment Callbacks", status: "Active" },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="apis" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="apis" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Plug className="size-3.5 mr-1" /> APIs</TabsTrigger>
          <TabsTrigger value="external" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Globe className="size-3.5 mr-1" /> External Systems</TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Webhook className="size-3.5 mr-1" /> Webhooks</TabsTrigger>
          <TabsTrigger value="sync" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><RefreshCw className="size-3.5 mr-1" /> Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <div className="p-3 bg-[#FAF7F2] border-b border-[#EADBCE] flex justify-between items-center">
              <span className="text-xs font-bold text-[#801824] uppercase">Departmental API Keys</span>
              <Button size="sm" onClick={() => toast({ title: "API Key", description: "Generate key modal" })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs h-7 px-2.5 rounded-lg"><Plus className="size-3 mr-1" /> Generate New Key</Button>
            </div>
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
        </TabsContent>

        <TabsContent value="external" className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#801824]">Dharani / Bhoomi Land Registry</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Connected</Badge>
              </div>
              <p className="text-[11px] text-slate-600">Real-time title encumbrance and owner Aadhaar verification.</p>
              <span className="text-[10px] text-slate-500 font-mono">Endpoint: https://api.dharani.telangana.gov.in/v2</span>
            </div>
            <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#801824]">State Fire Services NOC Portal</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Connected</Badge>
              </div>
              <p className="text-[11px] text-slate-600">Automated provisional NOC and clearance document sync.</p>
              <span className="text-[10px] text-slate-500 font-mono">Endpoint: https://fire.ts.gov.in/api/v1</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-2">
            <span className="text-xs font-bold text-[#801824] uppercase">Configured Webhook Callbacks</span>
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">Payment Gateway Callback</span>
                <span className="font-mono text-[10px] text-slate-500">https://authority.gov.in/api/webhooks/payment</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Active</Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Data Synchronization Schedules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Cadastral Land Sync Interval</Label>
                <Input value="Every 15 Minutes" disabled className="h-9 text-xs border-[#EADBCE] bg-white opacity-80" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Max Retry Attempts on Network Failure</Label>
                <Input type="number" defaultValue={3} className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 9. REPORTS SECTION
// Sub-tabs: Report Configuration, Export Settings, Scheduled Reports
// ============================================================

export function ReportsSection() {
  const { toast } = useToast();
  return (
    <div className="space-y-4">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="config" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><BarChart3 className="size-3.5 mr-1" /> Report Configuration</TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><FileSpreadsheet className="size-3.5 mr-1" /> Export Settings</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Calendar className="size-3.5 mr-1" /> Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="pt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="export" className="pt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="scheduled" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-3 shadow-2xs">
            <span className="text-xs font-bold text-[#801824] uppercase">Automated Scheduled Dispatches</span>
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">Daily Pendency Digest</span>
                <span className="text-[11px] text-slate-500">Sent every morning at 08:30 AM IST to Commissioner & Zonal Heads.</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Active</Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 10. SECURITY SECTION
// Sub-tabs: Security Policy, Audit Logs, Login History, Security Events
// ============================================================

export function SecuritySection() {
  const auditLogs = useAppStore((s) => s.adminAuditLog);

  const loginHistory = [
    { user: "shri.danakishore@gov.in", role: "COMMISSIONER", ip: "103.21.58.12", time: "10 mins ago", status: "Success" },
    { user: "director.planning@gov.in", role: "DIRECTOR", ip: "103.21.58.45", time: "28 mins ago", status: "Success" },
    { user: "zonalhead.north@gov.in", role: "ZONAL_HEAD", ip: "103.21.58.19", time: "1 hour ago", status: "Success" },
    { user: "applicant.ltp@infra.com", role: "LTP", ip: "49.207.181.5", time: "2 hours ago", status: "Success" },
    { user: "unknown.ip@45.33.12.8", role: "GUEST", ip: "45.33.12.8", time: "4 hours ago", status: "Blocked (Threshold)" },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="policy" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="policy" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Shield className="size-3.5 mr-1" /> Security Policy</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Activity className="size-3.5 mr-1" /> Audit Logs ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="login" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><Clock className="size-3.5 mr-1" /> Login History</TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-3 py-1.5"><ShieldAlert className="size-3.5 mr-1" /> Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="policy" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Departmental Cyber Security Policy</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white">
                <span className="text-xs font-bold text-[#4A1017]">TLS 1.3 Strict Transport Security (HSTS) Enforced</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white">
                <span className="text-xs font-bold text-[#4A1017]">Prevent Simultaneous Logins from Multiple Geolocation IPs</span>
                <Switch defaultChecked className="data-[state=checked]:bg-[#801824]" />
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8] sticky top-0">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]">
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">No admin audit events recorded yet.</td></tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF7F2]">
                        <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-[#4A1017]">{log.user}</td>
                        <td className="p-3 text-slate-700">{log.action}</td>
                        <td className="p-3 font-mono text-[#801824]">{log.entityId}</td>
                        <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="login" className="pt-4 space-y-3">
          <div className="rounded-xl border border-[#EADBCE] bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                <tr>
                  <th className="p-3">User Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Origin IP</th>
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
                      <Badge className={h.status.includes("Success") ? "bg-emerald-100 text-emerald-800 text-[10px]" : "bg-rose-100 text-rose-800 text-[10px]"}>{h.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="events" className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Threat Level</span>
              <p className="text-sm font-bold text-emerald-950">Normal / Safe</p>
              <p className="text-[11px] text-emerald-700">0 critical anomalies detected in last 24h.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-1">
              <span className="text-[10px] font-bold text-[#801824] uppercase">SSL Certificate</span>
              <p className="text-sm font-bold text-[#4A1017]">TLS 1.3 Active</p>
              <p className="text-[11px] text-slate-500">Valid until 15-Dec-2027.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-1">
              <span className="text-[10px] font-bold text-[#801824] uppercase">Database Encryption</span>
              <p className="text-sm font-bold text-[#4A1017]">AES-256</p>
              <p className="text-[11px] text-slate-500">Encrypted at rest & in-transit.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 11. SYSTEM ADMINISTRATION SECTION
// Sub-tabs: Backup, Data Retention, System Health, Error Logs, Maintenance Mode
// ============================================================

export function SystemAdminSection() {
  const { toast } = useToast();
  const [maintenance, setMaintenance] = React.useState(false);

  const errorLogs = [
    { time: "15:42:01", level: "INFO", message: "Automated drawing scrutiny batch completed successfully." },
    { time: "15:35:10", level: "INFO", message: "Treasury CyberTax payment webhook received and verified." },
    { time: "14:22:15", level: "WARN", message: "SMS delivery latency from telecom provider: 4.2s (Threshold 3.0s)." },
    { time: "14:01:00", level: "INFO", message: "Database vacuum maintenance and index optimization completed." },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="bg-[#FAF4EB] border border-[#E0D2BE] p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="backup" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><HardDrive className="size-3.5 mr-1" /> Backup</TabsTrigger>
          <TabsTrigger value="retention" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Calendar className="size-3.5 mr-1" /> Data Retention</TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Activity className="size-3.5 mr-1" /> System Health</TabsTrigger>
          <TabsTrigger value="errors" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Terminal className="size-3.5 mr-1" /> Error Logs</TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-[#801824] data-[state=active]:text-[#FDF6ED] text-[#5C1A20] text-xs font-semibold rounded-lg px-2.5 py-1.5"><Sliders className="size-3.5 mr-1" /> Maintenance Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="pt-4 space-y-4">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Database & Storage Snapshots</h4>
            <div className="p-3 bg-white rounded-lg border border-[#EADBCE] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Latest Automated Snapshot</span>
              <p className="text-xs font-mono font-bold text-[#801824]">backup_snapshot_20261003_0200.enc (1.42 GB)</p>
              <p className="text-[11px] text-slate-500">Created today at 02:00 AM IST · AES-256 Encrypted</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => toast({ title: "Backup Initiated", description: "Snapshot job dispatched to background." })} className="bg-[#801824] hover:bg-[#941C2B] text-white text-xs font-bold h-8 px-3 rounded-lg"><Plus className="size-3 mr-1" /> Create Instant Backup</Button>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Download", description: "Snapshot archive downloaded." })} className="border-[#DCD5C8] text-[#801824] text-xs h-8 px-3 rounded-lg"><Download className="size-3 mr-1" /> Download Snapshot</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Retention Periods</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Audit Trail Retention (Days)</Label>
                <Input defaultValue={365} type="number" className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#4A1017]">Draft Application Inactive Purge (Days)</Label>
                <Input defaultValue={90} type="number" className="h-9 text-xs border-[#EADBCE] bg-white" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="health" className="pt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#EADBCE] space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Application Server</span>
              <p className="text-xs font-bold text-emerald-800">Healthy (24ms)</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#EADBCE] space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Scrutiny Engine</span>
              <p className="text-xs font-bold text-emerald-800">Ready (0 Queue)</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#EADBCE] space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Database Pool</span>
              <p className="text-xs font-bold text-[#801824]">34 / 200 Conns</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#EADBCE] space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Storage Utilized</span>
              <p className="text-xs font-bold text-slate-800">2.1 TB / 5 TB (42%)</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-white space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-[#801824] uppercase">System Diagnostic Logs</span>
            <div className="space-y-1.5 font-mono text-[11px]">
              {errorLogs.map((l, i) => (
                <div key={i} className="p-2 bg-[#FAF7F2] rounded border border-[#EADBCE] flex items-center gap-2">
                  <span className="text-slate-400">{l.time}</span>
                  <Badge variant="outline" className={l.level === "WARN" ? "bg-amber-100 text-amber-800 text-[9px]" : "bg-emerald-100 text-emerald-800 text-[9px]"}>{l.level}</Badge>
                  <span className="text-[#4A1017]">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="pt-4 space-y-3">
          <div className="p-4 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] space-y-3">
            <h4 className="text-xs font-bold text-[#801824] uppercase">Portal Maintenance Override</h4>
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#EADBCE] bg-white cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#4A1017] block">Enable Maintenance Mode</span>
                <span className="text-[11px] text-slate-500 block">Blocks external LTP logins and displays scheduled maintenance banner.</span>
              </div>
              <Switch checked={maintenance} onCheckedChange={(v) => { setMaintenance(v); toast({ title: v ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled", description: "Public portal status updated." }); }} className="data-[state=checked]:bg-[#801824]" />
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
