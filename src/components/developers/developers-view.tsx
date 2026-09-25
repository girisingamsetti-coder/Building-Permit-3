"use client";

import * as React from "react";
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Plus,
  ShieldCheck,
  Award,
  FileText,
  Phone,
  Mail,
  MapPin,
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
import { MOCK_DEVELOPERS, type DeveloperRecord } from "@/data/modules-data";

const REGISTERS = [
  { key: "ALL", label: "All Developers" },
  { key: "APPROVED", label: "Approved (In Force)" },
  { key: "PENDING", label: "Pending" },
  { key: "SHORTFALL", label: "Shortfall" },
  { key: "RENEWAL", label: "Renewal Due" },
  { key: "EXPIRED", label: "Expired" },
  { key: "REJECTED", label: "Rejected" },
] as const;

export function DevelopersView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [selectedDev, setSelectedDev] = React.useState<DeveloperRecord | null>(null);

  const developers = MOCK_DEVELOPERS;

  const filtered = React.useMemo(() => {
    return developers.filter((item) => {
      const matchSearch =
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.authorizedPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reraNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTab = activeTab === "ALL" || item.status === activeTab;

      return matchSearch && matchTab;
    });
  }, [developers, searchTerm, activeTab]);

  const counts = React.useMemo(() => {
    return {
      ALL: developers.length,
      APPROVED: developers.filter((d) => d.status === "APPROVED").length,
      PENDING: developers.filter((d) => d.status === "PENDING").length,
      SHORTFALL: developers.filter((d) => d.status === "SHORTFALL").length,
      RENEWAL: developers.filter((d) => d.status === "RENEWAL").length,
      EXPIRED: developers.filter((d) => d.status === "EXPIRED").length,
      REJECTED: developers.filter((d) => d.status === "REJECTED").length,
    };
  }, [developers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Briefcase className="size-6" />
            </div>
            Developers Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real Estate Developer & Builder Registrations — RERA licenses, incorporation credentials, grading, and renewal tracking.
          </p>
        </div>
        <Button className="gap-2 text-xs h-9">
          <Plus className="size-4" /> New Developer Registration
        </Button>
      </div>

      {/* 7 Registers Navigation Strip */}
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

      {/* Search and filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search company, director, PAN, RERA…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{filtered.length}</strong> of {developers.length} registered developers
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Reg # / Firm Name</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Authorized Person</th>
                <th className="py-3 px-4">RERA Number</th>
                <th className="py-3 px-4">Grade & Projects</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No developer registrations found in this register.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <div className="text-foreground font-semibold flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" /> {item.companyName}
                      </div>
                      <div className="font-mono text-muted-foreground text-[11px]">{item.registrationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {item.developerType.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.authorizedPerson}</div>
                      <div className="text-[11px] text-muted-foreground">{item.designation}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {item.reraNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Award className="size-3.5 text-amber-500" />
                        {item.grade.replace("_", " ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{item.activeProjects} active projects</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-foreground font-medium">To: {item.validTo}</div>
                      <div className="text-[10px] text-muted-foreground">({item.experienceYears} yrs exp)</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "RENEWAL"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : item.status === "PENDING"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDev(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="size-3.5" /> Profile
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
      {selectedDev && (
        <Dialog open={!!selectedDev} onOpenChange={(open) => !open && setSelectedDev(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="size-5 text-blue-600" />
                  {selectedDev.companyName}
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedDev.status === "APPROVED"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedDev.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs font-mono">
                Reg #{selectedDev.registrationNumber} · {selectedDev.developerType} · Grade: {selectedDev.grade}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authorized Person:</span>
                  <span className="font-semibold text-foreground">{selectedDev.authorizedPerson} ({selectedDev.designation})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CIN / Incorporation #:</span>
                  <span className="font-mono text-foreground">{selectedDev.incorporationNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAN / GSTIN:</span>
                  <span className="font-mono text-foreground">{selectedDev.pan} / {selectedDev.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RERA Project Registration:</span>
                  <span className="font-mono font-semibold text-primary">{selectedDev.reraNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Contact & Communication
                  </span>
                  <div className="flex items-center gap-1.5 text-foreground py-0.5">
                    <Phone className="size-3 text-muted-foreground" /> {selectedDev.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground py-0.5">
                    <Mail className="size-3 text-muted-foreground" /> {selectedDev.email}
                  </div>
                  <div className="flex items-start gap-1.5 text-muted-foreground py-0.5 mt-1">
                    <MapPin className="size-3 shrink-0 text-muted-foreground mt-0.5" />
                    <span>{selectedDev.address}, {selectedDev.district}</span>
                  </div>
                </Card>

                <Card className="p-3 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Validity & Track Record
                  </span>
                  <div className="text-foreground py-0.5">
                    Valid From: <strong>{selectedDev.validFrom}</strong>
                  </div>
                  <div className="text-foreground py-0.5">
                    Valid Till: <strong>{selectedDev.validTo}</strong>
                  </div>
                  <div className="text-muted-foreground py-0.5">
                    Active Projects: <strong className="text-foreground">{selectedDev.activeProjects}</strong> | Experience: <strong className="text-foreground">{selectedDev.experienceYears} Years</strong>
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
