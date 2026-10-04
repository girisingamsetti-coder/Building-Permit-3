"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDashboardScope } from "@/components/dashboard/dashboard-scope";
import {
  FileBadge2,
  Search,
  Filter,
  Download,
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  X,
  ChevronsUpDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildingPermitOrder, buildPermitOrderFromBaNo } from "./building-permit-order";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/types";

export interface ApprovedFileItem {
  id: string;
  baNo: string;
  bpoNo: string;
  projectName: string;
  permissionType: string;
  applicantName: string;
  sanctionDate: string;
  lpsType: "LPS" | "Non LPS";
  village: string;
  district: string;
  totalArea: string;
  appId?: string;
}

const DEFAULT_APPROVED_FILES: ApprovedFileItem[] = [
  {
    id: "apprv-1",
    baNo: "1168/0055/BP/10/002/2026",
    bpoNo: "BPO/1168/0055/2026",
    projectName: "Srinivasa Nilayam (G+2 Residential)",
    permissionType: "Building Permission",
    applicantName: "P. Srinivasa Rao",
    sanctionDate: "10/06/2026",
    lpsType: "LPS",
    village: "Nelapadu",
    district: "Guntur",
    totalArea: "320.50 Sq.m",
  },
  {
    id: "apprv-2",
    baNo: "1168/0024/BP/10/001/2026",
    bpoNo: "BPO/1168/0024/2026",
    projectName: "Amaravati Commercial Hub (B+G+4)",
    permissionType: "Commercial",
    applicantName: "Jonnalagadda Srinivasarao",
    sanctionDate: "28/05/2026",
    lpsType: "LPS",
    village: "Borupalem",
    district: "Guntur",
    totalArea: "777.60 Sq.m",
  },
  {
    id: "apprv-3",
    baNo: "1168/0112/GD/10/003/2026",
    bpoNo: "BPO/1168/0112/2026",
    projectName: "Capital Enclave Group Housing",
    permissionType: "Group Development",
    applicantName: "Smt. Meena Kulkarni",
    sanctionDate: "14/07/2026",
    lpsType: "LPS",
    village: "Venkatapalem",
    district: "Guntur",
    totalArea: "1,850.00 Sq.m",
  },
  {
    id: "apprv-4",
    baNo: "1168/0078/BP/10/008/2026",
    bpoNo: "BPO/1168/0078/2026",
    projectName: "Lakshmi Residency (G+3)",
    permissionType: "Building Permission",
    applicantName: "M. Lakshmi Narayana",
    sanctionDate: "02/08/2026",
    lpsType: "Non LPS",
    village: "Mandadam",
    district: "Guntur",
    totalArea: "450.25 Sq.m",
  },
  {
    id: "apprv-5",
    baNo: "1168/0189/BP/10/012/2026",
    bpoNo: "BPO/1168/0189/2026",
    projectName: "Krishna Vihar Residential Villas",
    permissionType: "Building Permission",
    applicantName: "K. Ramakrishna",
    sanctionDate: "19/08/2026",
    lpsType: "LPS",
    village: "Thullur",
    district: "Guntur",
    totalArea: "620.00 Sq.m",
  },
];

export function LtpApprovedFiles() {
  const { applications } = useDashboardScope();
  const openApplication = useAppStore((s) => s.openApplication);
  const { toast } = useToast();

  const [searchKeywords, setSearchKeywords] = React.useState("");
  const [filterScheme, setFilterScheme] = React.useState("ALL");
  const [filterType, setFilterType] = React.useState("ALL");
  const [sortField, setSortField] = React.useState<keyof ApprovedFileItem>("sanctionDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedBpo, setSelectedBpo] = React.useState<ApprovedFileItem | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Combine store applications with default authentic APCRDA approved files
  const approvedItems: ApprovedFileItem[] = React.useMemo(() => {
    const storeApproved: ApprovedFileItem[] = applications
      .filter((a) => a.status === "APPROVED")
      .map((a, idx) => {
        const d = new Date(a.lastUpdated || a.submissionDate || Date.now());
        const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        const pType = a.project?.type as string | undefined;
        const typeLabel =
          pType === "LAYOUT_APPROVAL" || pType === "DEVELOPMENT_PERMIT"
            ? "Group Development"
            : pType === "COMMERCIAL"
            ? "Commercial"
            : "Building Permission";

        const isLps =
          a.applicationNo?.includes("/LPS/") ||
          (a as any).lpsType === "LPS" ||
          (a as any).data?.general?.lpsLayout === "LPS Layout";

        return {
          id: a.id || `apprv-store-${idx}`,
          baNo: a.applicationNo,
          bpoNo: `BPO/${a.applicationNo.replace(/^AP\/BP\//, "").replace(/^D\//, "")}`,
          projectName: a.project?.name || `Permit Project ${idx + 1}`,
          permissionType: typeLabel,
          applicantName: a.applicant?.name || "Sanctioned Applicant",
          sanctionDate: dateStr,
          lpsType: (isLps ? "LPS" : "Non LPS") as "LPS" | "Non LPS",
          village: (a.project as any)?.village || "Borupalem",
          district: (a.project as any)?.district || "Guntur",
          totalArea: a.project?.plotArea ? `${a.project.plotArea} Sq.m` : "500.00 Sq.m",
          appId: a.id,
        };
      });

    return storeApproved;
  }, [applications]);

  // Filtering
  const filteredItems = React.useMemo(() => {
    return approvedItems.filter((item) => {
      if (searchKeywords.trim()) {
        const q = searchKeywords.toLowerCase();
        const matches =
          item.baNo.toLowerCase().includes(q) ||
          item.bpoNo.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.applicantName.toLowerCase().includes(q) ||
          item.village.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterScheme !== "ALL" && item.lpsType !== filterScheme) return false;
      if (filterType !== "ALL" && item.permissionType !== filterType) return false;

      return true;
    });
  }, [approvedItems, searchKeywords, filterScheme, filterType]);

  // Sorting
  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortAsc]);

  const handleSort = (field: keyof ApprovedFileItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Approved Registry Refreshed",
        description: `Verified ${approvedItems.length} sanctioned building permits.`,
      });
    }, 400);
  };

  const exportCSV = () => {
    const headers = ["#", "Application No.", "BPO No.", "Project", "Applicant", "Scheme", "Sanction Date", "Area"];
    const rows = sortedItems.map((item, idx) => [
      idx + 1,
      `"${item.baNo}"`,
      `"${item.bpoNo}"`,
      `"${item.projectName}"`,
      `"${item.applicantName}"`,
      `"${item.lpsType}"`,
      item.sanctionDate,
      `"${item.totalArea}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Approved_Permits_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user selected to view the BPO Order document
  if (selectedBpo) {
    const permitData = buildPermitOrderFromBaNo(
      selectedBpo.baNo,
      selectedBpo.applicantName,
      selectedBpo.village,
      selectedBpo.district
    );

    return (
      <div className="w-full h-full bg-[#FAF7F2] p-4 flex flex-col font-sans text-slate-800 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedBpo(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DCD5C8] bg-white text-xs font-bold text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-4" /> Back to Approved Files
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Sanctioned Permit
            </span>
            <span className="text-xs font-mono font-bold text-[#801824] bg-white border border-[#EADBCE] px-3 py-1 rounded-lg">
              {selectedBpo.baNo}
            </span>
          </div>
        </div>
        <div className="max-w-5xl w-full mx-auto">
          <BuildingPermitOrder
            data={permitData}
            onBack={() => setSelectedBpo(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-5 flex flex-col gap-4 font-sans text-slate-800 overflow-y-auto">
      {/* ── Controls: Search, Filters & Export ── */}
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        {/* Search Box */}
        <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded-full px-3.5 h-[34px] w-full sm:w-64 shadow-2xs hover:shadow-xs focus-within:border-[#801824] focus-within:ring-2 focus-within:ring-[#801824]/10 transition-all">
          <Search className="size-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder=""
            className="w-full bg-transparent text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
          />
          {searchKeywords && (
            <button
              type="button"
              onClick={() => setSearchKeywords("")}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Scheme Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#801824] focus-within:ring-2 focus-within:ring-[#801824]/10 transition-all">
          <span className="text-[11px] font-bold text-slate-600 shrink-0">Scheme:</span>
          <select
            value={filterScheme}
            onChange={(e) => setFilterScheme(e.target.value)}
            aria-label="Filter by Scheme"
            className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
          >
            <option value="ALL">All</option>
            <option value="LPS">LPS Layout</option>
            <option value="Non LPS">Non LPS</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-[#DCD5C8] rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs focus-within:border-[#801824] focus-within:ring-2 focus-within:ring-[#801824]/10 transition-all">
          <span className="text-[11px] font-bold text-slate-600 shrink-0">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by Type"
            className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer pr-1"
          >
            <option value="ALL">All</option>
            <option value="Building Permission">Building Permission</option>
            <option value="Commercial">Commercial</option>
            <option value="Group Development">Group Development</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchKeywords || filterScheme !== "ALL" || filterType !== "ALL") && (
          <button
            onClick={() => {
              setSearchKeywords("");
              setFilterScheme("ALL");
              setFilterType("ALL");
            }}
            className="rounded-full px-3 py-1.5 bg-rose-50 text-[#801824] border border-[#801824]/20 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
          >
            <X className="size-3" />
            <span>Clear</span>
          </button>
        )}

        {/* Export CSV */}
        <button
          onClick={exportCSV}
          title="Export CSV"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DCD5C8] bg-white text-xs font-bold text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
        >
          <FileSpreadsheet className="size-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          title="Refresh Registry"
          className="flex size-8 items-center justify-center rounded-full border border-[#DCD5C8] bg-white text-[#801824] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-[#801824]")} />
        </button>
      </div>

      {/* ── Table Container (Maroon & Beige Theme) ── */}
      <div className="rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
              <tr className="divide-x divide-[#DCD5C8]">
                <th className="w-10 px-2 py-2 text-center font-bold">#</th>

                <th
                  onClick={() => handleSort("baNo")}
                  className="w-36 px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Application No.</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("projectName")}
                  className="w-60 max-w-[240px] px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Project Name</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("applicantName")}
                  className="w-44 max-w-[180px] px-3 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Applicant / Owner</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-20 px-2 py-2 font-bold text-center">Scheme</th>

                <th
                  onClick={() => handleSort("sanctionDate")}
                  className="w-24 px-2.5 py-2 font-bold cursor-pointer hover:bg-[#EFE3D5] transition-colors select-none text-center whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Sanction Date</span>
                    <ChevronsUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                <th className="w-24 px-2 py-2 font-bold text-center whitespace-nowrap">Status</th>

                <th className="w-36 px-3 py-2 font-bold text-center whitespace-nowrap">Permit Order & Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EADBCE] bg-white text-xs">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 bg-white">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#801824]">
                        <FileBadge2 className="size-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No approved permits match your query</p>
                      <p className="text-xs text-slate-500">Try adjusting your search terms or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]"
                  >
                    <td className="px-2 py-2 text-center text-slate-500 font-medium">{idx + 1}</td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-col">
                        <button
                          onClick={() => {
                            if (item.appId) {
                              openApplication(item.appId, "ltp-application-details");
                            } else {
                              setSelectedBpo(item);
                            }
                          }}
                          className="font-mono font-bold text-[#7A1316] hover:text-[#801824] hover:underline cursor-pointer text-left leading-tight"
                          title="Click to view permit details"
                        >
                          {item.baNo}
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{item.bpoNo}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900 leading-snug">{item.projectName}</div>
                      <span className="text-[11px] text-slate-500">{item.village}, {item.district} • {item.totalArea}</span>
                    </td>

                    <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">
                      {item.applicantName}
                    </td>

                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block",
                          item.lpsType === "LPS"
                            ? "bg-[#7A1316] text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        )}
                      >
                        {item.lpsType === "LPS" ? "LPS Layout" : "Non-LPS"}
                      </span>
                    </td>

                    <td className="px-2.5 py-2 text-center font-mono text-slate-600 whitespace-nowrap">
                      {item.sanctionDate}
                    </td>

                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="size-3 text-emerald-600" /> Sanctioned
                      </span>
                    </td>

                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedBpo(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#801824] text-[#FDF6ED] hover:bg-[#941C2B] transition-colors shadow-2xs cursor-pointer"
                          title="Open official Building Permit Order"
                        >
                          <Download className="size-3.5" />
                          <span>View BPO</span>
                        </button>

                        <button
                          onClick={() => {
                            if (item.appId) {
                              openApplication(item.appId, "ltp-application-details");
                            } else {
                              setSelectedBpo(item);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#DCD5C8] text-[#5C1A20] hover:bg-[#F3EADF] transition-colors cursor-pointer"
                          title="View Application Record"
                        >
                          <span>Details</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#FAF7F2] border-t border-[#DCD5C8] px-4 py-2.5 text-xs text-slate-600 flex items-center justify-between">
          <span className="font-medium">
            Showing <strong className="text-[#801824]">{sortedItems.length}</strong> of {approvedItems.length} approved permit records
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">
            APCRDA Capital City &amp; Zonal Region
          </span>
        </div>
      </div>
    </div>
  );
}
