"use client";

import * as React from "react";
import {
  IdCard,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Award,
  FileText,
  Phone,
  Mail,
  Compass,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MOCK_PROFESSIONALS, type ProfessionalRecord } from "@/data/modules-data";
import { useAppStore, type PendingRegistration } from "@/store/app-store";

const REGISTERS = [
  { key: "ALL", label: "All LTPs" },
  { key: "APPROVED", label: "Approved / Active" },
  { key: "VERIFIED", label: "Verified" },
  { key: "PENDING", label: "Pending" },
  { key: "SHORTFALL", label: "Shortfall" },
  { key: "RENEWAL", label: "Renewal Due" },
  { key: "EXPIRED", label: "Expired" },
] as const;

export function ProfessionalsView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [selectedProf, setSelectedProf] = React.useState<ProfessionalRecord | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);

  const pendingRegistrations = useAppStore((s) => s.pendingRegistrations);
  const approveRegistration = useAppStore((s) => s.approveRegistration);
  const rejectRegistration = useAppStore((s) => s.rejectRegistration);
  const user = useAppStore((s) => s.user);

  const ltpPending = pendingRegistrations.filter((r) => r.type === "LTP");
  const pendingCount = ltpPending.filter((r) => r.status === "PENDING").length;

  const professionals = MOCK_PROFESSIONALS;

  const filtered = React.useMemo(() => {
    return professionals.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.licenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.councilRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTab = activeTab === "ALL" || item.status === activeTab;
      const matchType = typeFilter === "ALL" || item.professionalType === typeFilter;

      return matchSearch && matchTab && matchType;
    });
  }, [professionals, searchTerm, activeTab, typeFilter]);

  const counts = React.useMemo(() => {
    return {
      ALL: professionals.length,
      APPROVED: professionals.filter((p) => p.status === "APPROVED").length,
      VERIFIED: professionals.filter((p) => p.status === "VERIFIED").length,
      PENDING: professionals.filter((p) => p.status === "PENDING").length,
      SHORTFALL: professionals.filter((p) => p.status === "SHORTFALL").length,
      RENEWAL: professionals.filter((p) => p.status === "RENEWAL").length,
      EXPIRED: professionals.filter((p) => p.status === "EXPIRED").length,
    };
  }, [professionals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <IdCard className="size-6" />
            </div>
            LTP Register — Licensed Technical Persons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registered Technical Professionals — Architects, Structural Engineers, Town Planners, and Civil Engineers licensed to submit applications.
          </p>
        </div>
        <Button className="gap-2 text-xs h-9">
          <Plus className="size-4" /> New LTP Registration
        </Button>
      </div>

      {/* Registers Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {REGISTERS.map((r) => {
          const isSelected = activeTab === r.key;
          const count = counts[r.key as keyof typeof counts] ?? 0;
          return (
            <button
              key={r.key}
              onClick={() => setActiveTab(r.key)}
              className={cn(
                "rounded-xl border p-2.5 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <span className="block text-[11px] text-muted-foreground font-medium truncate">{r.label}</span>
              <span className="block text-xl font-bold text-foreground mt-0.5">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search LTP name, licence, council reg…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="size-3.5" /> Discipline:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Disciplines</option>
            <option value="ARCHITECT">Architect</option>
            <option value="STRUCTURAL_ENGINEER">Structural Engineer</option>
            <option value="ENGINEER">Civil Engineer</option>
            <option value="TOWN_PLANNER">Town Planner</option>
          </select>
        </div>
      </div>

      {/* Pending Registrations from Portal */}
      {ltpPending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 bg-amber-100/60">
            <AlertTriangle className="size-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Pending LTP Registrations from Portal</span>
            {pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5">{pendingCount} awaiting</span>
            )}
          </div>
          <div className="divide-y divide-amber-100">
            {ltpPending.map((reg) => (
              <div key={reg.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-800">{reg.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      reg.status === "PENDING" ? "bg-amber-100 text-amber-700 border border-amber-300" :
                      reg.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                      "bg-rose-100 text-rose-700 border border-rose-300"
                    )}>{reg.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex gap-4 flex-wrap">
                    <span>{reg.email}</span>
                    <span>{reg.phone}</span>
                    {reg.licenseNo && <span>Lic: {reg.licenseNo}</span>}
                    <span className="text-slate-400">Submitted: {new Date(reg.submittedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  {reg.status === "REJECTED" && reg.rejectionReason && (
                    <div className="text-xs text-rose-600 mt-0.5">Reason: {reg.rejectionReason}</div>
                  )}
                  {reg.status === "APPROVED" && (
                    <div className="text-xs text-emerald-600 mt-0.5">Approved by: {reg.approvedBy}</div>
                  )}
                </div>
                {reg.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    {rejectingId === reg.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="text-xs border border-rose-300 rounded px-2 py-1 h-7 w-48"
                          placeholder="Rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <Button size="sm" variant="destructive" className="h-7 text-xs"
                          onClick={() => { rejectRegistration(reg.id, rejectReason); setRejectingId(null); setRejectReason(""); }}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRejectingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => approveRegistration(reg.id, user?.name ?? "Admin")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs"
                          onClick={() => setRejectingId(reg.id)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">LTP Name / Reg #</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Licence # & Council</th>
                <th className="py-3 px-4">Qualification & Exp</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No technical persons found in this register.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <div className="text-foreground font-semibold flex items-center gap-1.5">
                        <IdCard className="size-3.5 text-primary" /> {item.name}
                      </div>
                      <div className="font-mono text-muted-foreground text-[11px]">{item.registrationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {item.professionalType.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-foreground font-medium">{item.licenceNo}</div>
                      <div className="text-[10px] text-muted-foreground">{item.councilRegistration}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium truncate max-w-xs">{item.qualification}</div>
                      <div className="text-[10px] text-muted-foreground">{item.experienceYears} Years Experience</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.organization}</div>
                      <div className="text-[10px] text-muted-foreground">{item.applicationsCount} Apps handled</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-foreground font-medium">To: {item.validTo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "VERIFIED"
                            ? "bg-teal-500/10 text-teal-600 border-teal-500/20"
                            : item.status === "SHORTFALL"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProf(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> Credentials
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedProf && (
        <Dialog open={!!selectedProf} onOpenChange={(open) => !open && setSelectedProf(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <IdCard className="size-5 text-teal-600" />
                  {selectedProf.name}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedProf.status === "APPROVED"
                      ? "bg-emerald-600 text-white"
                      : "bg-teal-600 text-white"
                  )}
                >
                  {selectedProf.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs font-mono">
                Registration #{selectedProf.registrationNumber} · {selectedProf.professionalType.replace("_", " ")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Licence Number:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedProf.licenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Council / Reg Body:</span>
                  <span className="font-medium text-foreground">{selectedProf.councilRegistration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Degree / Qualification:</span>
                  <span className="font-medium text-foreground">{selectedProf.qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Professional Firm:</span>
                  <span className="text-foreground">{selectedProf.organization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Licence Validity:</span>
                  <span className="font-medium text-foreground">{selectedProf.validFrom} to {selectedProf.validTo}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Contact Details
                  </span>
                  <div className="flex items-center gap-1.5 py-0.5">
                    <Phone className="size-3 text-muted-foreground" /> {selectedProf.phone}
                  </div>
                  <div className="flex items-center gap-1.5 py-0.5">
                    <Mail className="size-3 text-muted-foreground" /> {selectedProf.email}
                  </div>
                  <div className="text-muted-foreground py-0.5 text-[11px]">
                    {selectedProf.address}, {selectedProf.district}
                  </div>
                </Card>

                <Card className="p-3 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Activity & Track Record
                  </span>
                  <div className="text-2xl font-bold text-foreground py-0.5">
                    {selectedProf.applicationsCount}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    Total files submitted across ULB zones
                  </div>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
