"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  ExternalLink,
  Copy,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { BimScrutinyRule, RuleCategory, RuleStatus } from "@/data/mock-bim-data";

interface BimScrutinyMatrixProps {
  rules: BimScrutinyRule[];
  activeViolationId?: string | null;
  onSelectViolation: (rule: BimScrutinyRule) => void;
  userRole?: string;
}

export function BimScrutinyMatrix({
  rules,
  activeViolationId,
  onSelectViolation,
  userRole,
}: BimScrutinyMatrixProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const categories: { label: string; value: string }[] = [
    { label: "All Rules", value: "ALL" },
    { label: "Setbacks", value: "Setbacks" },
    { label: "Bulk & Density", value: "Bulk & Density" },
    { label: "Amenities", value: "Amenities" },
    { label: "Fire & Safety", value: "Fire & Safety" },
    { label: "Sustainability", value: "Sustainability" },
  ];

  // Filtered rules
  const filteredRules = rules.filter((rule) => {
    const matchesCat = selectedCategory === "ALL" || rule.category === selectedCategory;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "FAIL" && rule.status === "FAIL") ||
      (statusFilter === "PASS" && rule.status === "PASS") ||
      (statusFilter === "WARNING" && rule.status === "WARNING");
    const matchesSearch =
      searchQuery === "" ||
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const failCount = rules.filter((r) => r.status === "FAIL").length;
  const passCount = rules.filter((r) => r.status === "PASS").length;
  const warnCount = rules.filter((r) => r.status === "WARNING").length;

  const copyRemark = (rule: BimScrutinyRule) => {
    const text = `[BIM Scrutiny Flag: ${rule.id} - ${rule.title}] Required: ${rule.requiredValue}, Observed: ${rule.observedValue}. Difference: ${rule.delta}. Recommendation: ${rule.recommendation || "Ensure strict compliance with DCR."}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Observation Copied",
      description: `Wording for ${rule.id} copied to clipboard for official remarks.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500">Total Evaluated</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {rules.length}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "FAIL" ? "ALL" : "FAIL")}
          className={`cursor-pointer rounded-xl border p-3.5 shadow-sm transition-all ${
            statusFilter === "FAIL"
              ? "border-red-500 bg-red-50/80 dark:bg-red-950/40"
              : "border-red-200 bg-red-50/40 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">Violations (Fail)</p>
            <XCircle className="size-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-red-700 dark:text-red-300">
            {failCount}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "PASS" ? "ALL" : "PASS")}
          className={`cursor-pointer rounded-xl border p-3.5 shadow-sm transition-all ${
            statusFilter === "PASS"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40"
              : "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Compliant (Pass)</p>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {passCount}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "WARNING" ? "ALL" : "WARNING")}
          className={`cursor-pointer rounded-xl border p-3.5 shadow-sm transition-all ${
            statusFilter === "WARNING"
              ? "border-amber-500 bg-amber-50/80 dark:bg-amber-950/40"
              : "border-amber-200 bg-amber-50/40 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Warnings</p>
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-300">
            {warnCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              variant={selectedCategory === cat.value ? "default" : "outline"}
              className="h-8 text-xs font-medium"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Rules Table / Card List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Rule & Clause</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">DCR Permissible</th>
                <th className="px-4 py-3">BIM Extracted</th>
                <th className="px-4 py-3">Delta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">3D Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No rules match the current filters.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => {
                  const isSelected = activeViolationId === rule.id;
                  const isFail = rule.status === "FAIL";
                  const isPass = rule.status === "PASS";

                  return (
                    <tr
                      key={rule.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-cyan-50/70 dark:bg-cyan-950/40"
                          : isFail
                          ? "hover:bg-red-50/30 dark:hover:bg-red-950/20"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{rule.title}</span>
                          {rule.severity === "CRITICAL" && (
                            <Badge variant="outline" className="border-red-400 text-[9px] text-red-600 bg-red-50 dark:bg-red-950">
                              CRITICAL
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{rule.description}</p>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {rule.category}
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {rule.requiredValue}
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold">
                        <span className={isFail ? "text-red-600 dark:text-red-400" : isPass ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                          {rule.observedValue}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-500">
                        {rule.delta}
                      </td>

                      <td className="px-4 py-3">
                        {isPass && (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                            PASS
                          </Badge>
                        )}
                        {isFail && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-300">
                            FAIL
                          </Badge>
                        )}
                        {rule.status === "WARNING" && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                            WARNING
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFail && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                              onClick={() => copyRemark(rule)}
                              title="Copy observation text"
                            >
                              <Copy className="size-3 mr-1" /> Copy
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className={`h-7 px-2.5 text-[11px] ${
                              isFail && !isSelected
                                ? "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
                                : ""
                            }`}
                            onClick={() => onSelectViolation(rule)}
                          >
                            <Eye className="size-3 mr-1" />
                            {isSelected ? "Inspecting" : "Locate 3D"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
