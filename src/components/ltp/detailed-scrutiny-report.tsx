"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Printer,
  RefreshCw,
  Maximize2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Upload,
} from "lucide-react";

export interface DetailedScrutinyReportProps {
  proposalNo?: string;
  projectTitle?: string;
  zone?: string;
  typology?: string;
  applicantName?: string;
  applicantAddress?: string;
  applicantContact?: string;
  architectName?: string;
  architectLicence?: string;
  architectContact?: string;
  plotNo?: string;
  surveyNo?: string;
  siteAddress?: string;
  plotArea?: string;
  proposedFootprint?: string;
  totalBuiltUpArea?: string;
  roadWidth?: string;

  // Statutory Area Parameters (from user's Plot Details form)
  proposedPlotArea?: string;
  totalAreaDocuments?: string;
  totalAreaGround?: string;
  plotStructure?: string;
  isAffectingRoadWidening?: string;
  proposedBuiltUpArea?: string;
  isCompoundWallProposed?: string;
  roadWidthInput?: string;

  // Site Details (Surroundings & Valuation)
  abutsExistingRoad?: string;
  statusOfRoad?: string;
  natureOfRoad?: string;
  widthOfApproachRoad?: string;
  plotNearbyReligious?: string;
  vicinityAerodrome?: string;
  vicinityWaterBodies?: string;
  marketValue?: string;
  abuttingIrr?: string;

  // Schedule of Boundaries (Cardinal Directions)
  northBoundary?: string;
  northNo?: string;
  southBoundary?: string;
  southNo?: string;
  eastBoundary?: string;
  eastNo?: string;
  westBoundary?: string;
  westNo?: string;

  scrutinyStatus?: "PASSED" | "FAILED";
  onProceedToDocumentation?: () => void;
  onReuploadForScrutiny?: () => void;

  className?: string;
  onRefresh?: () => void;
  onClose?: () => void;
}

export function DetailedScrutinyReport({
  proposalNo = "Temp/1168/0801/LPS/2026",
  projectTitle = "VADDURI VEERAIAH GARU (1)",
  zone = "R3-Medium to High density zone",
  typology = "AP1-Apartment",
  applicantName = "Vadduri Veeraiah",
  applicantAddress = "Thullur Mandal, Guntur District, Amaravati",
  applicantContact = "+91 94401 28941",
  architectName = "Er. K. Ramamurthy (LTP)",
  architectLicence = "CA/2018/94120 / APCRDA-LTP-042",
  architectContact = "+91 94401 88722",
  plotNo = "Plot No. 18",
  surveyNo = "267/2B",
  siteAddress = "Plot 18, Block 10, Sector 4, LPS Layout, Thullur Mandal",
  plotArea = "83.59 m²",
  proposedFootprint = "57.02 m²",
  totalBuiltUpArea = "57.02 m²",
  roadWidth = "3.00 m Wide CC Road",

  // Defaults matching the user's statutory Plot Details form
  proposedPlotArea = "83.59",
  totalAreaDocuments = "83.61",
  totalAreaGround = "83.59",
  plotStructure = "Below 200 sq m",
  isAffectingRoadWidening = "No",
  proposedBuiltUpArea = "57.02",
  isCompoundWallProposed = "No",
  roadWidthInput = "0",

  abutsExistingRoad = "Yes",
  statusOfRoad = "Public",
  natureOfRoad = "CC - Concrete",
  widthOfApproachRoad = "3",
  plotNearbyReligious = "NA",
  vicinityAerodrome = "No",
  vicinityWaterBodies = "No",
  marketValue = "5750",
  abuttingIrr = "No",

  northBoundary = "Others",
  northNo = "Plot 17",
  southBoundary = "Others",
  southNo = "Plot 19",
  eastBoundary = "Others",
  eastNo = "Plot 25",
  westBoundary = "Road",
  westNo = "3.00 m CC Approach Road",

  scrutinyStatus = "PASSED",
  onProceedToDocumentation,
  onReuploadForScrutiny,

  className,
  onRefresh,
  onClose,
}: DetailedScrutinyReportProps) {
  // Scrutiny status: PASSED or FAILED (supports prop and interactive testing)
  const [currentStatus, setCurrentStatus] = React.useState<"PASSED" | "FAILED">(scrutinyStatus);

  React.useEffect(() => {
    if (scrutinyStatus) {
      setCurrentStatus(scrutinyStatus);
    }
  }, [scrutinyStatus]);

  const isPassed = currentStatus === "PASSED";

  // Filter pill state: All | Compliant | Not Compliant
  const [filterMode, setFilterMode] = React.useState<"all" | "compliant" | "non-compliant">("all");
  const [basicDetailsOpen, setBasicDetailsOpen] = React.useState(true);

  // Status counts for evaluated CAD Scrutiny
  const nonCompliantCount = isPassed ? 0 : 2;
  const compliantCount = isPassed ? 16 : 14;
  const warningCount = 0;

  // Format today's date DD-MM-YYYY as in APCRDA scrutiny report (e.g. 30-09-2026)
  const todayStr = React.useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  return (
    <div
      id="detailed-scrutiny-report"
      className={cn(
        "w-full bg-[#FAF3E8] border border-[#D5C2AA] rounded-xl shadow-lg overflow-hidden font-sans text-slate-800 transition-all",
        className
      )}
    >
      {/* ── TOP ACTION BAR ── */}
      <div className="bg-[#FAF3E8] border-b border-[#E5D7C3] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-wide">
            {projectTitle}
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {zone} · {typology} · {proposalNo}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="bg-white hover:bg-[#F2E5D4] text-slate-800 border border-[#D5C2AA] px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="size-3 text-[#7F171A]" />
              <span>Refresh</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-white hover:bg-[#F2E5D4] text-slate-800 border border-[#D5C2AA] px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Print Scrutiny Report"
          >
            <Printer className="size-3 text-[#7F171A]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-[#F2E5D4] text-slate-800 border border-[#D5C2AA] px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              — Back to Proposals
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("detailed-scrutiny-report");
              if (el) {
                if (!document.fullscreenElement) {
                  el.requestFullscreen?.().catch(() => {});
                } else {
                  document.exitFullscreen?.().catch(() => {});
                }
              }
            }}
            className="bg-white hover:bg-[#F2E5D4] text-slate-700 border border-[#D5C2AA] p-1.5 rounded transition-colors cursor-pointer shadow-2xs"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="size-3 text-[#7F171A]" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 bg-[#FAF3E8]">
        {/* ── DEDICATED SCRUTINY STATUS AT TOP OF REPORT ── */}
        <div
          id="scrutiny-status-header-banner"
          className={cn(
            "rounded-xl p-4 sm:p-5 border-2 shadow-sm transition-all",
            isPassed
              ? "bg-emerald-50/95 border-emerald-600 text-emerald-950"
              : "bg-rose-50/95 border-[#7F171A] text-rose-950"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={cn(
                  "p-2.5 rounded-full text-white shrink-0 shadow-xs",
                  isPassed ? "bg-emerald-600" : "bg-[#7F171A]"
                )}
              >
                {isPassed ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <XCircle className="size-6" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label htmlFor="scrutiny-status-dropdown" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>Scrutiny Status:</span>
                  </label>

                  {/* Demo Purpose Dropdown with default "Passed" */}
                  <div className="relative inline-flex items-center">
                    <select
                      id="scrutiny-status-dropdown"
                      value={currentStatus === "PASSED" ? "Passed" : "Failed"}
                      onChange={(e) => setCurrentStatus(e.target.value === "Passed" ? "PASSED" : "FAILED")}
                      className={cn(
                        "text-xs font-black uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-lg border-2 shadow-2xs cursor-pointer transition-all appearance-none outline-hidden",
                        isPassed
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                          : "bg-[#7F171A] hover:bg-[#681316] text-white border-[#5A0F11]"
                      )}
                    >
                      <option value="Passed" className="bg-white text-emerald-800 font-bold py-1">
                        Passed (Compliant)
                      </option>
                      <option value="Failed" className="bg-white text-rose-800 font-bold py-1">
                        Failed (Not Passed)
                      </option>
                    </select>
                    <ChevronDown className="size-3.5 text-white absolute right-2.5 pointer-events-none stroke-[2.5]" />
                  </div>

                  <span
                    className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded border font-mono shadow-2xs",
                      isPassed
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-rose-100 text-[#7F171A] border-rose-300"
                    )}
                  >
                    {isPassed ? "16 / 16 Rules Compliant (100%)" : "2 Non-Compliances Detected"}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] mt-1.5 leading-relaxed text-slate-700">
                  {isPassed ? (
                    <span>
                      CAD Scrutiny verified under{" "}
                      <strong className="text-slate-900 font-semibold">
                        APCRDA Building Rules &amp; Andhra Pradesh Building Rules 2017
                      </strong>
                      . All mandatory setbacks, coverage ratios, height parameters, and parking standards are satisfied.
                    </span>
                  ) : (
                    <span>
                      CAD Scrutiny failed under{" "}
                      <strong className="text-slate-900 font-semibold">
                        APCRDA Building Rules &amp; Andhra Pradesh Building Rules 2017
                      </strong>
                      . Rule discrepancies detected in setbacks and approach road parameters. You must correct the drawing and reupload.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Demo indicator displaying active bottom button outcome */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center bg-white/70 border border-[#D5C2AA] px-3 py-1.5 rounded-lg shadow-2xs">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  Demo Action Outcome:
                </span>
                <span
                  className={cn(
                    "font-extrabold text-xs block",
                    isPassed ? "text-emerald-800" : "text-[#7F171A]"
                  )}
                >
                  {isPassed ? "Proceed to Documentation" : "Reupload for scrutiny"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RED HEADER BANNER (Detailed Scrutiny Report) ── */}
        <div className="bg-[#7F171A] text-white rounded-lg p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-normal text-white">
              Detailed Scrutiny Report
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-amber-100/90 mt-1">
              Amaravati — The People&apos;s Capital
            </p>
          </div>

          <div className="text-left md:text-right text-[11px] sm:text-xs space-y-1 text-slate-100 font-sans md:border-l md:border-white/20 md:pl-6">
            <div>
              Report Generated on:{" "}
              <span className="font-mono font-bold text-amber-200">{todayStr}</span>
            </div>
            <div>
              Proposal Number:{" "}
              <span className="font-mono font-bold">{proposalNo || "N/A"}</span>
            </div>
            <div className={cn("font-medium", isPassed ? "text-emerald-300" : "text-amber-200")}>
              {isPassed
                ? "0 non-compliances (All 16 statutory rules passed)"
                : `${nonCompliantCount} non-compliance(s) and ${warningCount} warning(s)`}
            </div>
            <div>
              Zone: {zone} · Typology: {typology}
            </div>
            <div className="text-slate-200 text-[10px] font-mono">
              BBAS Scrutiny Engine (ACadSharp) 2.6
            </div>
            <div className="pt-0.5">
              Overall:{" "}
              {isPassed ? (
                <span className="bg-emerald-600 border border-emerald-400 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase ml-1">
                  PASSED ✓
                </span>
              ) : (
                <span className="bg-[#5B0F12] border border-red-400/40 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase ml-1">
                  NOT PASSED ✕
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── FILTER PILLS (All | Compliant | Not Compliant) ── */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border",
              filterMode === "all"
                ? "bg-[#7F171A] text-white border-[#7F171A]"
                : "bg-white text-slate-700 border-[#D5C2AA] hover:bg-[#F2E5D4]"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("compliant")}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border flex items-center gap-1.5",
              filterMode === "compliant"
                ? "bg-[#1E7E34] text-white border-[#1E7E34]"
                : "bg-white text-[#1E7E34] border-[#1E7E34]/50 hover:bg-emerald-50"
            )}
          >
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Compliant ({compliantCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("non-compliant")}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border flex items-center gap-1.5",
              filterMode === "non-compliant"
                ? "bg-[#7F171A] text-white border-[#7F171A]"
                : "bg-white text-[#7F171A] border-[#7F171A]/50 hover:bg-rose-50"
            )}
          >
            <span className="size-1.5 rounded-full bg-rose-500 inline-block" />
            <span>Not Compliant ({nonCompliantCount})</span>
          </button>
        </div>

        {/* ── SECTION 1: BASIC DETAILS ── */}
        <div className="space-y-3">
          <div
            onClick={() => setBasicDetailsOpen((v) => !v)}
            className="flex items-center justify-between border-b-2 border-[#7F171A] pb-1 cursor-pointer select-none"
          >
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Basic Details
            </h3>
            <ChevronDown
              className={cn(
                "size-4 text-[#7F171A] transition-transform duration-200",
                !basicDetailsOpen && "-rotate-90"
              )}
            />
          </div>

          {basicDetailsOpen && (
            <div className="space-y-3 pt-1">
              <h4 className="font-serif font-bold text-[#7F171A] text-sm sm:text-base">
                Proposal Information
              </h4>

              {/* Two Column Side-by-Side Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                {/* Left Table: Project */}
                <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs">
                  <div className="bg-[#7F171A] text-white px-3.5 py-2 font-bold text-xs uppercase tracking-wide">
                    Project
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody className="divide-y divide-[#E5D7C3]">
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 w-40 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Project title
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {projectTitle}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Project type
                        </td>
                        <td className="px-3 py-2 text-slate-800">Building Permission</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Authority
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900">APCRDA</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Typology
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-900">{typology}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Proposal / file no.
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-800">
                          {proposalNo || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Plot / Sy. No.
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-800">
                          {plotNo || "—"} / Sy. {surveyNo || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Site address
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {siteAddress || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right Table: Applicant & Architect */}
                <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs">
                  <div className="bg-[#7F171A] text-white px-3.5 py-2 font-bold text-xs uppercase tracking-wide">
                    Applicant &amp; Architect
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody className="divide-y divide-[#E5D7C3]">
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 w-40 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Applicant
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {applicantName || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Applicant address
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {applicantAddress || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Applicant contact
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-800">
                          {applicantContact || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Architect / LTP
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {architectName || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Licence no.
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-800">
                          {architectLicence || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-800 bg-[#FAF3E8]/40 border-r border-[#E5D7C3]">
                          Contact
                        </td>
                        <td className="px-3 py-2 text-slate-800 font-mono">
                          {architectContact || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: STATUTORY PLOT & SITE DETAILS (FROM USER'S SUBMISSION FORM) ── */}
        <div className="space-y-4">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Plot Details &amp; Site Parameters
            </h3>
          </div>

          {/* 1. Proposed Construction (Area Parameters) */}
          <div className="bg-[#FBF3E4] border border-[#7F171A]/50 rounded-lg shadow-xs overflow-hidden text-xs">
            <div className="bg-[#7F171A] text-white px-4 py-2.5 font-bold flex items-center justify-between select-none">
              <span className="flex items-center gap-1.5 tracking-wide">
                <span className="text-xs font-mono">▲</span>
                Proposed Construction
              </span>
              <span className="text-[10px] text-amber-200 uppercase font-mono font-bold tracking-wider">
                AREA PARAMETERS
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-white">
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Proposed Plot Area (sq. mtr.)
                </span>
                <span className="font-mono font-bold text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {proposedPlotArea}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Total Area As per Documents (sq. mtr.)
                </span>
                <span className="font-mono font-bold text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {totalAreaDocuments}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Total Area As On Grounds (sq. mtr.)
                </span>
                <span className="font-mono font-bold text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {totalAreaGround}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Plot Structure
                </span>
                <span className="font-medium text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {plotStructure}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Is site affecting road widening?
                </span>
                <span className={cn(
                  "font-bold px-2.5 py-0.5 rounded text-[11px]",
                  isAffectingRoadWidening === "Yes" ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-emerald-50 text-emerald-800 border border-emerald-300"
                )}>
                  {isAffectingRoadWidening}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Proposed Built Up Area (sq. mtr.)
                </span>
                <span className="font-mono font-bold text-[#7F171A] bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {proposedBuiltUpArea}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-semibold text-slate-800">
                  Is Compound Wall proposed?
                </span>
                <span className="font-medium text-slate-700 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {isCompoundWallProposed}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-semibold text-slate-800">Road Width</span>
                <span className="font-mono font-medium text-slate-700 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {roadWidthInput}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Site Details (Surroundings & Valuation) */}
          <div className="bg-[#FBF3E4] border border-[#7F171A]/50 rounded-lg shadow-xs overflow-hidden text-xs">
            <div className="bg-[#7F171A] text-white px-4 py-2.5 font-bold flex items-center justify-between select-none">
              <span className="flex items-center gap-1.5 tracking-wide">
                <span className="text-xs font-mono">▲</span>
                Site Details
              </span>
              <span className="text-[10px] text-amber-200 uppercase font-mono font-bold tracking-wider">
                SURROUNDINGS &amp; VALUATION
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-white">
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Whether site abuts any existing road?
                </span>
                <span className={cn(
                  "font-bold px-2.5 py-0.5 rounded text-[11px]",
                  abutsExistingRoad === "Yes" ? "bg-emerald-50 text-emerald-800 border border-emerald-300" : "bg-slate-100 text-slate-700 border border-slate-300"
                )}>
                  {abutsExistingRoad}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Status of Road
                </span>
                <span className="font-medium text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {statusOfRoad}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Nature of the Road
                </span>
                <span className="font-medium text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {natureOfRoad}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Width of the Approach Road (Mtr.)
                </span>
                <span className="font-mono font-bold text-slate-900 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {widthOfApproachRoad} m
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-semibold text-slate-800">Plot Nearby Religious Structures</span>
                <span className="font-medium text-slate-700 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {plotNearbyReligious}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-semibold text-slate-800">Is the Plot in the vicinity of Aerodrome?</span>
                <span className="font-medium text-slate-700 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {vicinityAerodrome}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2 md:col-span-2">
                <span className="font-semibold text-slate-800">
                  Is the buildings which are in the vicinity area of Water Bodies/Railways/High tension line?
                </span>
                <span className="font-medium text-slate-700 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {vicinityWaterBodies}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Market Value (in Rs per Sq.Yard)
                </span>
                <span className="font-mono font-bold text-[#7F171A] bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  ₹ {marketValue}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EFE7DC] pb-2">
                <span className="font-bold text-slate-800">
                  <span className="text-rose-600 font-black mr-1">*</span> Whether site is abutting from IRR?
                </span>
                <span className="font-medium text-slate-700 bg-[#FAF3E8] px-2.5 py-1 rounded border border-[#D5C2AA]">
                  {abuttingIrr}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Schedule of boundaries (Cardinal Directions) */}
          <div className="bg-[#FBF3E4] border border-[#7F171A]/50 rounded-lg shadow-xs overflow-hidden text-xs">
            <div className="bg-[#7F171A] text-white px-4 py-2.5 font-bold flex items-center justify-between select-none">
              <span className="flex items-center gap-1.5 tracking-wide">
                <span className="text-xs font-mono">▲</span>
                Schedule of boundaries
              </span>
              <span className="text-[10px] text-amber-200 uppercase font-mono font-bold tracking-wider">
                CARDINAL DIRECTIONS
              </span>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAF3E8] text-[#7F171A] font-bold border-b border-[#D5C2AA]">
                  <tr>
                    <th className="px-4 py-2.5 w-32">Direction</th>
                    <th className="px-4 py-2.5 w-48">Boundary Classification</th>
                    <th className="px-4 py-2.5">Boundary / Plot / Survey / Road Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE7DC]">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#7F171A]" /> North
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{northBoundary}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{northNo || "Adjacent Plot / Boundary"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#7F171A]" /> South
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{southBoundary}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{southNo || "Adjacent Plot / Boundary"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#7F171A]" /> East
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{eastBoundary}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{eastNo || "Adjacent Plot / Boundary"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#7F171A]" /> West
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{westBoundary}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{westNo || `${widthOfApproachRoad} m ${natureOfRoad} Approach Road`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Drawing Scrutiny Plot Metrics (CAD Engine Verified) */}
          <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
            <div className="bg-[#FAF3E8] border-b border-[#D5C2AA] px-3.5 py-2 font-bold text-[#7F171A] uppercase tracking-wide flex items-center justify-between">
              <span>Drawing Scrutiny Plot Metrics (CAD Engine Verified)</span>
              <span className="text-[10px] text-slate-500 font-mono normal-case">Rule Engine v4.2</span>
            </div>
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-[#E5D7C3]">
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A] w-1/2 sm:w-2/5">
                    Plot area as per drawing
                  </td>
                  <td className="px-3.5 py-2 font-mono font-medium text-slate-900">
                    {plotArea}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Less: road widening
                  </td>
                  <td className="px-3.5 py-2 font-mono text-slate-700">0.00 m²</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Less: splay
                  </td>
                  <td className="px-3.5 py-2 font-mono text-slate-700">0.00 m²</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Net plot area (used for coverage / FSI / green)
                  </td>
                  <td className="px-3.5 py-2 font-mono font-medium text-slate-900">
                    {plotArea}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Total proposed work footprint
                  </td>
                  <td className="px-3.5 py-2 font-mono text-slate-900">
                    {proposedFootprint}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Vacant plot area
                  </td>
                  <td className="px-3.5 py-2 font-mono text-slate-900">
                    26.57 m²
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Total built-up area (FSI floors)
                  </td>
                  <td className="px-3.5 py-2 font-mono font-medium text-slate-900">
                    {totalBuiltUpArea}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Green coverage area
                  </td>
                  <td className="px-3.5 py-2 font-mono text-slate-900">
                    12.54 m²
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-bold text-white bg-[#7F171A]">
                    Abutting road(s)
                  </td>
                  <td className="px-3.5 py-2 text-slate-800">
                    {roadWidth}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 3: PLOT LEVEL CHECKING ── */}
        <div className="space-y-3">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Plot Level Checking
            </h3>
          </div>

          <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#7F171A] text-white font-bold">
                <tr>
                  <th className="px-3.5 py-2.5">Check</th>
                  <th className="px-3.5 py-2.5">Required</th>
                  <th className="px-3.5 py-2.5">Proposed</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7C3]">
                {/* Row 1: Minimum plot area */}
                {(filterMode === "all" || filterMode === "compliant") && (
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">
                      Minimum plot area
                    </td>
                    <td className="px-3.5 py-2.5 font-mono">≥ 50.00 m²</td>
                    <td className="px-3.5 py-2.5 font-mono font-medium text-slate-900">
                      {plotArea}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="bg-[#1E7E34] text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase inline-block">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-mono text-[11px]">
                      Compliant under {plotStructure} category (Min 50.00 m²)
                    </td>
                  </tr>
                )}

                {/* Row 2: Ground coverage */}
                {(filterMode === "all" || filterMode === "compliant") && (
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">
                      Ground coverage
                    </td>
                    <td className="px-3.5 py-2.5 font-mono">≤ 70.00 %</td>
                    <td className="px-3.5 py-2.5 font-mono font-medium text-slate-900">
                      68.21 %
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="bg-[#1E7E34] text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase inline-block">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-mono text-[11px]">
                      {proposedFootprint} proposed work / {plotArea} net plot
                    </td>
                  </tr>
                )}

                {/* Row 3: FSI */}
                {(filterMode === "all" || filterMode === "compliant") && (
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">FSI</td>
                    <td className="px-3.5 py-2.5 font-mono">≤ 1.500</td>
                    <td className="px-3.5 py-2.5 font-mono font-medium text-slate-900">
                      0.682
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="bg-[#1E7E34] text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase inline-block">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-mono text-[11px]">
                      {totalBuiltUpArea} BUA / {plotArea} net plot
                    </td>
                  </tr>
                )}

                {/* Row 4: Green coverage */}
                {(filterMode === "all" || filterMode === "compliant") && (
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">
                      Green coverage
                    </td>
                    <td className="px-3.5 py-2.5 font-mono">≥ 15.00 %</td>
                    <td className="px-3.5 py-2.5 font-mono font-medium text-slate-900">
                      15.00 %
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="bg-[#1E7E34] text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase inline-block">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-mono text-[11px]">
                      12.54 m² green / {plotArea} net plot
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 4: BUILDING DETAILS ── */}
        <div className="space-y-3">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Building Details
            </h3>
          </div>

          <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#7F171A] text-white font-bold">
                <tr>
                  <th className="px-3.5 py-2.5">Building Name</th>
                  <th className="px-3.5 py-2.5">Building Use</th>
                  <th className="px-3.5 py-2.5">Building Subuse</th>
                  <th className="px-3.5 py-2.5">Building Type</th>
                  <th className="px-3.5 py-2.5">Building Structure</th>
                  <th className="px-3.5 py-2.5">Floor Details</th>
                  <th className="px-3.5 py-2.5">Type of Roofs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7C3]">
                <tr>
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">Building 1</td>
                  <td className="px-3.5 py-2.5 text-slate-800">Residential</td>
                  <td className="px-3.5 py-2.5 text-slate-700">Individual Residential</td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-[#7F171A]">{typology}</td>
                  <td className="px-3.5 py-2.5 text-slate-800">Lowrise at 10 m or below</td>
                  <td className="px-3.5 py-2.5 text-slate-800 font-medium">Ground + 1 Floor</td>
                  <td className="px-3.5 py-2.5 text-slate-800">Flat RCC Roof</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-600">
            Building type is the project typology. Structure is Lowrise at 15 m or below, and Highrise above 15 m.
          </p>
        </div>

        {/* ── SECTION 5: MORTGAGE DETAILS ── */}
        <div className="space-y-4">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Mortgage Details
            </h3>
          </div>

          {/* Mortgage Requirement Checks */}
          <div className="space-y-2">
            <div className="border-l-4 border-[#7F171A] pl-2 font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Mortgage Requirement Checks
            </div>

            <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#7F171A] text-white font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5" rowSpan={2}>
                      Building
                    </th>
                    <th
                      className="px-3.5 py-1.5 text-center border-b border-[#962629]"
                      colSpan={2}
                    >
                      Area (m²)
                    </th>
                    <th className="px-3.5 py-2.5 text-center" rowSpan={2}>
                      Status
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3.5 py-1.5 text-center text-[11px] bg-[#6B1114]">
                      Required
                    </th>
                    <th className="px-3.5 py-1.5 text-center text-[11px] bg-[#6B1114]">
                      Proposed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D7C3]">
                  <tr>
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">Building 1</td>
                    <td className="px-3.5 py-2.5 text-center font-mono">5.70 m²</td>
                    <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-900">6.00 m²</td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Compliant
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-600">
              Required is 10% of each building&apos;s own built-up area, checked against that building&apos;s proposed mortgage area.
            </p>
          </div>

          {/* Mortgage Allowance Checks */}
          <div className="space-y-1.5 pt-1">
            <div className="border-l-4 border-[#7F171A] pl-2 font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Mortgage Allowance Checks
            </div>
            <div className="bg-white border border-[#D5C2AA] rounded-sm p-3 text-xs text-slate-800 shadow-2xs">
              First floor front unit (6.00 m²) demarcated compliant with APCRDA mortgage deed requirements.
            </div>
          </div>
        </div>

        {/* ── SECTION 6: MANDATORY SETBACKS CHECKS ── */}
        <div className="space-y-4">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Mandatory Setbacks Checks
            </h3>
          </div>

          {/* Above Grade Setback Details */}
          <div className="space-y-2">
            <div className="border-l-4 border-[#7F171A] pl-2 font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Above Grade Setback Details
            </div>

            <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#7F171A] text-white font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5">Setback Side</th>
                    <th className="px-3.5 py-2.5">Required (m)</th>
                    <th className="px-3.5 py-2.5">Proposed (m)</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Clearance Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D7C3]">
                  <tr className={cn(isPassed ? "hover:bg-emerald-50/30" : "bg-rose-50/40 hover:bg-rose-50/60")}>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Front (Road Side)</td>
                    <td className="px-3.5 py-2 font-mono">≥ 1.50 m</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">
                      {isPassed ? "1.80 m" : "1.20 m"}
                    </td>
                    <td className="px-3.5 py-2">
                      {isPassed ? (
                        <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Compliant
                        </span>
                      ) : (
                        <span className="bg-[#7F171A] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Not Compliant
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">
                      {isPassed
                        ? `Clear from ${widthOfApproachRoad} m CC road`
                        : "Deficient by 0.30 m under APCRDA Table 7. Minimum 1.50 m required."}
                    </td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2 font-bold text-slate-800">Rear</td>
                    <td className="px-3.5 py-2 font-mono">≥ 1.00 m</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">1.20 m</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">Clear from rear boundary</td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2 font-bold text-slate-800">Side 1 (East)</td>
                    <td className="px-3.5 py-2 font-mono">≥ 1.00 m</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">1.00 m</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">Unobstructed pedestrian pathway</td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30">
                    <td className="px-3.5 py-2 font-bold text-slate-800">Side 2 (West)</td>
                    <td className="px-3.5 py-2 font-mono">≥ 1.00 m</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">1.05 m</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Compliant
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">Compliant with APCRDA Table 7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Basement Setback Details */}
          <div className="space-y-1.5 pt-1">
            <div className="border-l-4 border-[#7F171A] pl-2 font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Basement Setback Details
            </div>
            <div className="bg-white border border-[#D5C2AA] rounded-sm p-3 text-xs text-slate-700 shadow-2xs">
              No basement proposed. All foundation footprints contained within the above grade setback envelope.
            </div>
            <p className="text-[11px] text-slate-600">
              Above grade — Front is the plot edge touching the road. Rear is the opposite face. Side1 and Side2 are left and right looking from the road. Corner is an edge on a second road.
            </p>
          </div>
        </div>

        {/* ── SECTION 7: BUILDING COMPLIANCE DETAILS ── */}
        <div className="space-y-4">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Building Compliance Details
            </h3>
          </div>

          {/* Room Size Checks */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-[#7F171A] text-sm">
              Room Size Checks
            </h4>
            <p className="text-[11px] text-slate-600">
              Width and depth are the short and long sides. Ventilation is window area for natural rooms, a dash for mechanical rooms, and NA for lift, lobby, corridor, passage, shaft, duct, void, and balcony rooms.
            </p>

            <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#7F171A] text-white font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5">Room Name</th>
                    <th className="px-3.5 py-2.5">Min Required Area</th>
                    <th className="px-3.5 py-2.5">Proposed Area</th>
                    <th className="px-3.5 py-2.5">Natural Ventilation Area</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D7C3]">
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-900">Living / Drawing Hall</td>
                    <td className="px-3.5 py-2 font-mono">≥ 12.00 m²</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">18.50 m²</td>
                    <td className="px-3.5 py-2 font-mono text-emerald-700">2.80 m² (15.13%)</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Compliant</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-900">Master Bedroom</td>
                    <td className="px-3.5 py-2 font-mono">≥ 10.00 m²</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">14.20 m²</td>
                    <td className="px-3.5 py-2 font-mono text-emerald-700">2.10 m² (14.78%)</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Compliant</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-900">Kitchen</td>
                    <td className="px-3.5 py-2 font-mono">≥ 5.00 m²</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">7.20 m²</td>
                    <td className="px-3.5 py-2 font-mono text-emerald-700">1.40 m² (19.44%)</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Compliant</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Staircase Details */}
          <div className="space-y-1.5 pt-1">
            <h4 className="font-serif font-bold text-[#7F171A] text-sm">
              Staircase Details
            </h4>
            <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#7F171A] text-white font-bold">
                  <tr>
                    <th className="px-3.5 py-2">Flight / Core</th>
                    <th className="px-3.5 py-2">Width (m)</th>
                    <th className="px-3.5 py-2">Tread (mm)</th>
                    <th className="px-3.5 py-2">Riser (mm)</th>
                    <th className="px-3.5 py-2">Headroom (m)</th>
                    <th className="px-3.5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D7C3]">
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-900">Internal Staircase</td>
                    <td className="px-3.5 py-2 font-mono">1.00 m (Req ≥ 0.90)</td>
                    <td className="px-3.5 py-2 font-mono">260 mm (Req ≥ 250)</td>
                    <td className="px-3.5 py-2 font-mono">160 mm (Req ≤ 175)</td>
                    <td className="px-3.5 py-2 font-mono">2.25 m (Req ≥ 2.20)</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Compliant</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Lift Size Checks */}
          <div className="space-y-1.5 pt-1">
            <h4 className="font-serif font-bold text-[#7F171A] text-sm">
              Lift Size Checks
            </h4>
            <p className="text-[11px] text-slate-600">
              Lift car minimum width and length (1.70 × 1.90 m) is mandatory for buildings above G+2 floors (NA for lowrise residential ≤ 10 m).
            </p>
            <div className="bg-white border border-[#D5C2AA] rounded-sm p-3 text-xs text-slate-700 shadow-2xs">
              Exempted from mandatory passenger lift under APCRDA Bye-laws (Ground + 1 Floor dwelling).
            </div>
          </div>

          {/* Ramp Details */}
          <div className="space-y-1.5 pt-1">
            <h4 className="font-serif font-bold text-[#7F171A] text-sm">
              Ramp Details
            </h4>
            <p className="text-[11px] text-slate-600">
              Slope 1:8 vehicular, 1:10 pedestrian, and 1:12 accessible are the ramp defaults.
            </p>
            <div className="bg-white border border-[#D5C2AA] rounded-sm p-3 text-xs text-slate-700 shadow-2xs">
              Pedestrian access ramp (Slope 1:10, Width 1.20 m) provided at ground level entrance.
            </div>
          </div>

          {/* Parking Details */}
          <div className="space-y-1.5 pt-1">
            <div className="border-l-4 border-[#1E7E34] pl-2 font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Parking Details
            </div>
            <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#7F171A] text-white font-bold">
                  <tr>
                    <th className="px-3.5 py-2">Parking Category</th>
                    <th className="px-3.5 py-2">Required Slots</th>
                    <th className="px-3.5 py-2">Proposed Slots</th>
                    <th className="px-3.5 py-2">Allocated Area</th>
                    <th className="px-3.5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D7C3]">
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-900">Four Wheeler (Car Parking)</td>
                    <td className="px-3.5 py-2 font-mono">1 Slot (5.00 × 2.50 m)</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">1 Slot</td>
                    <td className="px-3.5 py-2 font-mono text-slate-800">12.50 m²</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Compliant</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-900">Two Wheeler Parking</td>
                    <td className="px-3.5 py-2 font-mono">2 Slots</td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">2 Slots</td>
                    <td className="px-3.5 py-2 font-mono text-slate-800">4.00 m²</td>
                    <td className="px-3.5 py-2">
                      <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Compliant</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── SECTION 8: SOLAR PANEL ── */}
        <div className="space-y-2">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Solar Panel
            </h3>
          </div>
          <p className="text-[11px] text-slate-600">
            Solar panel area is one third of that building&apos;s terrace area.
          </p>

          <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#7F171A] text-white font-bold">
                <tr>
                  <th className="px-3.5 py-2">Building</th>
                  <th className="px-3.5 py-2">Required (m²)</th>
                  <th className="px-3.5 py-2">Proposed (m²)</th>
                  <th className="px-3.5 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7C3]">
                <tr>
                  <td className="px-3.5 py-2 font-bold text-slate-900">Building 1</td>
                  <td className="px-3.5 py-2 font-mono">19.00 m²</td>
                  <td className="px-3.5 py-2 font-mono font-bold text-slate-900">20.00 m²</td>
                  <td className="px-3.5 py-2 text-center">
                    <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Compliant
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 9: RAIN WATER HARVESTING ── */}
        <div className="space-y-2">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Rain Water Harvesting
            </h3>
          </div>
          <p className="text-[11px] text-slate-600">
            Rain water harvesting is required when the plot exceeds 200 m². (Optional/recommended for plots under 200 m²).
          </p>
          <div className="bg-white border border-[#D5C2AA] rounded-sm p-3 text-xs text-slate-800 shadow-2xs flex items-center justify-between">
            <span>1 RWH percolation recharge pit proposed (dimension 1.00 × 1.00 × 1.50 m) with filter media.</span>
            <span className="bg-[#1E7E34] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ml-2">
              Compliant
            </span>
          </div>
        </div>

        {/* ── SECTION 10: PRE-SCRUTINY FINDINGS ── */}
        <div className="space-y-2">
          <div className="border-b-2 border-[#7F171A] pb-1">
            <h3 className="font-serif font-bold text-[#7F171A] text-base sm:text-lg">
              Pre-scrutiny Findings
            </h3>
          </div>

          <div className="border border-[#D5C2AA] rounded-sm overflow-hidden bg-white shadow-2xs text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#7F171A] text-white font-bold">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">#</th>
                  <th className="px-3 py-2 text-center w-20">Severity</th>
                  <th className="px-3 py-2 text-center w-24">Category</th>
                  <th className="px-3 py-2 text-center w-24">Object ID</th>
                  <th className="px-3 py-2 text-center w-40">Layer</th>
                  <th className="px-3.5 py-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7C3]">
                {/* Row 1: Document vs Ground Variance */}
                <tr className="hover:bg-amber-50/20">
                  <td className="px-3 py-2 text-center font-bold text-slate-700">1</td>
                  <td className="px-3 py-2 text-center font-medium text-slate-800">
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Notice
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-medium text-slate-800">Plot</td>
                  <td className="px-3 py-2 text-center text-slate-500 font-mono">—</td>
                  <td className="px-3 py-2 text-center text-slate-800 font-mono text-[11px]">__BB__Plot</td>
                  <td className="px-3.5 py-2 text-slate-800">
                    Document area ({totalAreaDocuments} m²) differs from on-ground survey area ({totalAreaGround} m²) by 0.02 m² (within permissible 1% tolerance).
                  </td>
                </tr>
                {/* Row 2: Approach Road Verification */}
                <tr className="hover:bg-amber-50/20">
                  <td className="px-3 py-2 text-center font-bold text-slate-700">2</td>
                  <td className="px-3 py-2 text-center font-medium text-slate-800">
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Verified
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-medium text-slate-800">Road</td>
                  <td className="px-3 py-2 text-center text-slate-500 font-mono">—</td>
                  <td className="px-3 py-2 text-center text-slate-800 font-mono text-[11px]">__BB_Road</td>
                  <td className="px-3.5 py-2 text-slate-800">
                    {widthOfApproachRoad}.00 m {natureOfRoad} approach road verified. Site abuts public road (Not affecting road widening).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ACTION FOOTER: PROCEED TO DOCUMENTATION / REUPLOAD FOR SCRUTINY ── */}
        <div
          id="scrutiny-action-footer"
          className={cn(
            "rounded-xl p-4 sm:p-5 border-2 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all",
            isPassed
              ? "bg-white border-emerald-600/70"
              : "bg-white border-[#7F171A]/70"
          )}
        >
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div
              className={cn(
                "p-2.5 rounded-full text-white shrink-0 shadow-2xs",
                isPassed ? "bg-emerald-600" : "bg-[#7F171A]"
              )}
            >
              {isPassed ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isPassed ? "text-emerald-800" : "text-[#7F171A]"
                  )}
                >
                  {isPassed ? "Scrutiny Cleared" : "Action Required"}
                </span>
                <span className="text-[11px] text-slate-400">·</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {isPassed
                    ? "Statutory CAD rules passed"
                    : "Correct CAD drawing & re-submit"}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isPassed
                  ? "All statutory drawing validations completed. Proceed to upload mandatory ownership deeds and NOCs."
                  : "Resolve setback and height parameters in AutoCAD / CAD software, then reupload the drawing."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
            {isPassed ? (
              <button
                type="button"
                id="btn-proceed-to-documentation"
                onClick={() => {
                  if (onProceedToDocumentation) {
                    onProceedToDocumentation();
                  }
                }}
                className="w-full sm:w-auto bg-[#7F171A] hover:bg-[#651215] active:bg-[#4E0D10] text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#651215]"
              >
                <span>Proceed to Documentation</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-reupload-for-scrutiny"
                onClick={() => {
                  if (onReuploadForScrutiny) {
                    onReuploadForScrutiny();
                  }
                }}
                className="w-full sm:w-auto bg-[#7F171A] hover:bg-[#651215] active:bg-[#4E0D10] text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#651215]"
              >
                <Upload className="size-4" />
                <span>Reupload for scrutiny</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
