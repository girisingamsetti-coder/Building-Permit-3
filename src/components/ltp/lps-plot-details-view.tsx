"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  Compass,
  Ruler,
  Landmark,
  Database,
  Map,
} from "lucide-react";

export interface LpsPlotRecord {
  plotCode: string;
  // PLOT
  baFileNumber: string;
  plotNumber: string;
  gid: string;
  globalId: string;
  plotCodeUnderscore: string;
  // LOCATION
  village: string;
  lpsVillage: string;
  rsVillage: string;
  district: string;
  mandal: string;
  township: string;
  sector: string;
  colony: string;
  block: string;
  rsNumber: string;
  lpsNonLps: string;
  gpCode: string;
  distCode: string;
  lpsVillCo: string;
  mdlCode: string;
  villCode: string;
  // LAND USE
  zone: string;
  infraZone: string;
  sectorZone: string;
  landUse: string;
  landDistribution: string;
  landUseDescription: string;
  category: string;
  plotStatus: string;
  zoning: string;
  themeCity: string;
  symbology: string;
  layer: string;
  usage: string;
  detailedC: string;
  infraZo1: string;
  catDesc: string;
  luCode: string;
  plotCateg: string;
  // AREA
  areaAcres: string;
  areaSqYards: string;
  allottedExtent: string;
  netPlotAreaM2: string;
  maximumFsi: string;
  polyLength: string;
  polyWidth: string;
  // OWNERSHIP
  owners: string;
  lottery: string;
  // ROADS AND REGISTRATION
  registrationCode: string;
  rdWidthM: string;
  regCodeE: string;
  regCodeN: string;
  regCodeS: string;
  regCodeW: string;
  // SOIL
  soil: string;
  soilType: string;
  // BOUNDARY
  boundaryPoints: string;
  centroid: string;
  plotCoord: string;
  // RECORD
  joinCount: string;
  test: string;
  geoportalInsertedTs: string;
  geoportalUpdatedTs: string;
  [key: string]: any;
}

export const LPS_SAMPLE_RECORDS: Record<string, LpsPlotRecord> = {
  "23-723-3603-4-C20": {
    plotCode: "23-723-3603-4-C20",
    // PLOT
    baFileNumber: "23-723-3603-4-C20",
    plotNumber: "4",
    gid: "19297",
    globalId: "e8be1032-5917-4bfe-a42f-7cd46c291bb2",
    plotCodeUnderscore: "4-723-3603-C20",
    // LOCATION
    village: "Kuragallu",
    lpsVillage: "Kuragallu",
    rsVillage: "Kuragallu",
    district: "Guntur",
    mandal: "Mangalagiri",
    township: "23",
    sector: "170",
    colony: "723",
    block: "3603",
    rsNumber: "427",
    lpsNonLps: "LPS",
    gpCode: "GP0712001",
    distCode: "07",
    lpsVillCo: "0712001",
    mdlCode: "712",
    villCode: "0712001",
    // LAND USE
    zone: "Rest of Capital",
    infraZone: "Zone - 12",
    sectorZone: "South East Central",
    landUse: "Residential",
    landDistribution: "Residential",
    landUseDescription: "R3-Residential Returnable",
    category: "Residential Plots",
    plotStatus: "Allotted Plots",
    zoning: "R3 Medium to high density zone",
    themeCity: "Electronics",
    symbology: "R3 Medium to high density zone",
    layer: "Residential Plots",
    usage: "Returnable Plots",
    detailedC: "Residential Plots",
    infraZo1: "Zone - 12",
    catDesc: "R3",
    luCode: "R3",
    plotCateg: "C20",
    // AREA
    areaAcres: "0.216941783537",
    areaSqYards: "1049.99819171",
    allottedExtent: "1050.0",
    netPlotAreaM2: "877.932250028",
    maximumFsi: "2.2",
    polyLength: "106.612966",
    polyWidth: "88.614401",
    // OWNERSHIP
    owners: "NANNAPANENI RAMBABU",
    lottery: "1st Lottery",
    // ROADS AND REGISTRATION
    registrationCode: "23-170-723-3603-4-C20",
    rdWidthM: "0.0",
    regCodeE: "23-170-723-3603-12-C20",
    regCodeN: "23-170-723-3603-3-C20",
    regCodeS: "23-170-723-3603-5-C19",
    regCodeW: "17.0 mtr Road",
    // SOIL
    soil: "Dry Residential",
    soilType: "Dry",
    // BOUNDARY
    boundaryPoints: "4",
    centroid: "447663.97490000,1820525.34635000",
    plotCoord: "447647.7249,1820538.853;447680.2249,1820538.853;447647.7249,1820511.8397;447680.2249,1820511.8397;",
    // RECORD
    joinCount: "1",
    test: "Kuragallu",
    geoportalInsertedTs: "2026-09-10 22:43",
    geoportalUpdatedTs: "2026-09-10 23:08",
  },
  "11-502-4137-9-D82": {
    plotCode: "11-502-4137-9-D82",
    // PLOT
    baFileNumber: "11-502-4137-9-D82",
    plotNumber: "9",
    gid: "14820",
    globalId: "b3191024-8192-4fbe-b12a-89bc44120911",
    plotCodeUnderscore: "9-502-4137-D82",
    // LOCATION
    village: "Inavolu",
    lpsVillage: "Inavolu",
    rsVillage: "Inavolu",
    district: "Guntur",
    mandal: "Thullur",
    township: "11",
    sector: "105",
    colony: "502",
    block: "4137",
    rsNumber: "231",
    lpsNonLps: "LPS",
    gpCode: "GP0711004",
    distCode: "07",
    lpsVillCo: "0711004",
    mdlCode: "711",
    villCode: "0711004",
    // LAND USE
    zone: "Capital City Core",
    infraZone: "Zone - 8",
    sectorZone: "North West Central",
    landUse: "Residential",
    landDistribution: "Residential",
    landUseDescription: "R3-Medium to High Density",
    category: "Residential Plots",
    plotStatus: "Allotted Plots",
    zoning: "R3 Medium to high density zone",
    themeCity: "Government Core",
    symbology: "R3 Medium to high density zone",
    layer: "Residential Plots",
    usage: "Returnable Plots",
    detailedC: "Residential Plots",
    infraZo1: "Zone - 8",
    catDesc: "R3",
    luCode: "R3",
    plotCateg: "D82",
    // AREA
    areaAcres: "0.1859504",
    areaSqYards: "900.0",
    allottedExtent: "900.0",
    netPlotAreaM2: "752.514",
    maximumFsi: "2.2",
    polyLength: "95.500000",
    polyWidth: "85.000000",
    // OWNERSHIP
    owners: "K. RAMAMURTHY",
    lottery: "1st Lottery",
    // ROADS AND REGISTRATION
    registrationCode: "11-105-502-4137-9-D82",
    rdWidthM: "18.0",
    regCodeE: "11-105-502-4137-10-D82",
    regCodeN: "18.0 mtr Road",
    regCodeS: "11-105-502-4137-8-D82",
    regCodeW: "11-105-502-4137-15-D81",
    // SOIL
    soil: "Black Cotton Soil",
    soilType: "Clayey",
    // BOUNDARY
    boundaryPoints: "4",
    centroid: "448210.12450000,1821045.22100000",
    plotCoord: "448195.1245,1821055.2210;448225.1245,1821055.2210;448195.1245,1821035.2210;448225.1245,1821035.2210;",
    // RECORD
    joinCount: "1",
    test: "Inavolu",
    geoportalInsertedTs: "2026-08-15 14:20",
    geoportalUpdatedTs: "2026-08-15 15:45",
  },
  "14-301-2204-12-B15": {
    plotCode: "14-301-2204-12-B15",
    // PLOT
    baFileNumber: "14-301-2204-12-B15",
    plotNumber: "12",
    gid: "22091",
    globalId: "f9901412-1092-4ca1-a881-19ce90901234",
    plotCodeUnderscore: "12-301-2204-B15",
    // LOCATION
    village: "Velagapudi",
    lpsVillage: "Velagapudi",
    rsVillage: "Velagapudi",
    district: "Guntur",
    mandal: "Thullur",
    township: "14",
    sector: "120",
    colony: "301",
    block: "2204",
    rsNumber: "184",
    lpsNonLps: "LPS",
    gpCode: "GP0711009",
    distCode: "07",
    lpsVillCo: "0711009",
    mdlCode: "711",
    villCode: "0711009",
    // LAND USE
    zone: "Institutional & Administrative",
    infraZone: "Zone - 4",
    sectorZone: "North Central",
    landUse: "Residential",
    landDistribution: "Residential",
    landUseDescription: "R3-Residential Returnable",
    category: "Residential Plots",
    plotStatus: "Allotted Plots",
    zoning: "R3 Medium to high density zone",
    themeCity: "Justice & Administration",
    symbology: "R3 Medium to high density zone",
    layer: "Residential Plots",
    usage: "Returnable Plots",
    detailedC: "Residential Plots",
    infraZo1: "Zone - 4",
    catDesc: "R3",
    luCode: "R3",
    plotCateg: "B15",
    // AREA
    areaAcres: "0.2479338",
    areaSqYards: "1200.0",
    allottedExtent: "1200.0",
    netPlotAreaM2: "1003.352",
    maximumFsi: "2.2",
    polyLength: "120.000000",
    polyWidth: "90.000000",
    // OWNERSHIP
    owners: "SMT. P. LAKSHMI",
    lottery: "1st Lottery",
    // ROADS AND REGISTRATION
    registrationCode: "14-120-301-2204-12-B15",
    rdWidthM: "24.0",
    regCodeE: "14-120-301-2204-13-B15",
    regCodeN: "24.0 mtr Arterial Road",
    regCodeS: "14-120-301-2204-11-B15",
    regCodeW: "14-120-301-2204-20-B14",
    // SOIL
    soil: "Alluvial Clay",
    soilType: "Fine Grain",
    // BOUNDARY
    boundaryPoints: "4",
    centroid: "449112.55100000,1822100.88400000",
    plotCoord: "449095.5510,1822115.8840;449130.5510,1822115.8840;449095.5510,1822085.8840;449130.5510,1822085.8840;",
    // RECORD
    joinCount: "1",
    test: "Velagapudi",
    geoportalInsertedTs: "2026-07-20 10:15",
    geoportalUpdatedTs: "2026-07-20 11:30",
  },
};

interface LpsPlotDetailsViewProps {
  onPlotLoaded?: (record: LpsPlotRecord) => void;
  onSaveAndNext?: () => void;
  onBack?: () => void;
  initialPlotCode?: string;
  applicantSlot?: React.ReactNode;
  structuralEngineerSlot?: React.ReactNode;
}

export function LpsPlotDetailsView({
  onPlotLoaded,
  onSaveAndNext,
  onBack,
  initialPlotCode = "",
  applicantSlot,
  structuralEngineerSlot,
}: LpsPlotDetailsViewProps) {
  const [selectedPlotCode, setSelectedPlotCode] = React.useState<string>(initialPlotCode);
  const [plotData, setPlotData] = React.useState<LpsPlotRecord | null>(
    initialPlotCode && LPS_SAMPLE_RECORDS[initialPlotCode]
      ? LPS_SAMPLE_RECORDS[initialPlotCode]
      : null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = () => {
    if (plotData) {
      setPlotData(null);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSelectCode = (code: string) => {
    setSelectedPlotCode(code);
    setIsDropdownOpen(false);
    fetchPlotDetails(code);
  };

  const fetchPlotDetails = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setTimeout(() => {
      const found = LPS_SAMPLE_RECORDS[trimmed] || {
        ...LPS_SAMPLE_RECORDS["23-723-3603-4-C20"],
        plotCode: trimmed,
        baFileNumber: trimmed,
      };
      setPlotData(found);
      setIsLoading(false);
      onPlotLoaded?.(found);
    }, 350);
  };

  return (
    <div className="w-full space-y-6 font-sans text-slate-800">
      {/* ── TOP SECTION: 50% Applicant Info on Left | 50% Search & Structural on Right ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Column: Applicant Information Card (50% width) */}
        <div className="w-full min-w-0">
          {applicantSlot}
        </div>

        {/* Right Column: Enter plot code card & Structural Engineer Info Card (50% width) */}
        <div className="w-full min-w-0 space-y-4">
          {/* ── PLOT CODE INQUIRY & SEARCH BAR ── */}
          <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-[#7A1316] tracking-tight">
                    Enter plot code
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enter or select the LPS Plot Code below. Statutory cadastral and GIS records will be fetched directly from APCRDA Geoportal.
                </p>
              </div>
              {plotData && (
                <button
                  onClick={() => {
                    setPlotData(null);
                    setSelectedPlotCode("");
                  }}
                  className="text-xs font-bold text-[#7A1316] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="size-3.5" /> Search Another Plot
                </button>
              )}
            </div>

            {/* Input & Dropdown Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="relative w-full sm:w-96 md:w-[440px]" ref={dropdownRef}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="lps-plot-code-input"
                    value={selectedPlotCode}
                    onChange={(e) => setSelectedPlotCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && selectedPlotCode.trim()) {
                        fetchPlotDetails(selectedPlotCode);
                      }
                    }}
                    placeholder="Enter Plot Code (e.g. 23-723-3603-4-C20)"
                    className="w-full h-10 bg-white border-2 border-[#7A1316] rounded-lg pl-3 pr-9 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1316]/20"
                  />
                  <button
                    type="button"
                    id="lps-plot-code-dropdown-toggle"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="absolute right-2 p-1 text-slate-500 hover:text-[#7A1316] cursor-pointer"
                    title="Select from sample plot codes"
                  >
                    <ChevronDown className={cn("size-4 transition-transform", isDropdownOpen && "rotate-180")} />
                  </button>
                </div>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                  <div
                    id="lps-plot-code-dropdown-menu"
                    className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border-2 border-[#7A1316] bg-white shadow-xl py-1 overflow-hidden animate-in fade-in-50 zoom-in-95"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-black text-[#7A1316] bg-[#F5EBE1] border-b border-[#DCD5C8]">
                      Select Sample LPS Plot Code
                    </div>
                    {Object.keys(LPS_SAMPLE_RECORDS).map((code) => {
                      const rec = LPS_SAMPLE_RECORDS[code];
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleSelectCode(code)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer flex flex-col gap-0.5 border-b border-slate-100 last:border-b-0",
                            selectedPlotCode === code
                              ? "bg-[#FDF6ED] text-[#7A1316] font-bold"
                              : "hover:bg-[#FAF4EB] text-slate-800"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{code}</span>
                            {code === "23-723-3603-4-C20" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                Example from Blueprint
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {rec.village} · Block {rec.block} · Plot {rec.plotNumber} · Owner: {rec.owners}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                id="fetch-plot-btn"
                disabled={!selectedPlotCode || isLoading}
                onClick={() => fetchPlotDetails(selectedPlotCode)}
                className={cn(
                  "h-10 px-5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0",
                  selectedPlotCode && !isLoading
                    ? "bg-[#7A1316] hover:bg-[#8F161A] text-white border border-[#630E10]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Fetching Geoportal...
                  </>
                ) : (
                  <>
                    <Search className="size-4" /> Fetch Plot Details
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── STRUCTURAL ENGINEER INFO CARD (Only shown after entering plot code) ── */}
          {plotData && structuralEngineerSlot}
        </div>
      </div>

      {/* ── PLOT DETAILS REPORT (Aligned row-by-row across the screen) ── */}
      {plotData && (
        <div id="lps-plot-details-section" className="space-y-5 pt-1">
          {/* Top Plot Summary Bar */}
          <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#7A1316] text-white flex items-center justify-center font-bold shrink-0">
                <Building2 className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  APCRDA Statutory Plot Cadastral Record
                </h2>
                <p className="text-[11px] text-slate-600">
                  {plotData.village} · Block {plotData.block} · Plot No. {plotData.plotNumber} · Owner: {plotData.owners}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-[#DCD5C8]">
                <span className="text-[11px] font-semibold text-slate-500">Plot Code:</span>
                <span className="text-xs font-black text-[#7A1316] font-mono">
                  {plotData.plotCode}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Geoportal Record
              </span>
            </div>
          </div>

          {/* 2-Column Responsive Grid across the entire screen, paired row-by-row for pixel-perfect alignment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 1: PLOT IDENTIFICATION & EXTENT & DIMENSIONS     */}
            {/* ═══════════════════════════════════════════════════ */}

            {/* CARD 1: PLOT IDENTIFICATION */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Plot Identification
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Cadastral
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">BA file number</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.baFileNumber || plotData.plotCode}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotCode}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot number</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotNumber}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Gid</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.gid || "19297"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Global Id</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] break-all">{plotData.globalId || "e8be1032-5917-4bfe-a42f-7cd46c291bb2"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Code Underscore</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotCodeUnderscore || `${plotData.plotNumber}-723-3603-C20`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: EXTENT & DIMENSIONS */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Extent &amp; Dimensions
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Measurements
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Allotted Extent</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.allottedExtent || "1050.0"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Shape Area</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.shapeArea || plotData.netPlotAreaM2 || "877.93 m²"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Net Plot Area (m²)</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.netPlotAreaM2 || "877.932250028"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Net Plot Area (sq.yds)</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.netPlotAreaSqYds || plotData.areaSqYards || "1049.99 sq.yds"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Dimension</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotDimension || `${plotData.polyLength || "106.61"} m × ${plotData.polyWidth || "88.61"} m`}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Road Facing</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotRoadFacing || "West Facing (17.0 mtr Road)"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 2: ZONING & LAND USE & APPLICANT & ALLOTMENT     */}
            {/* ═══════════════════════════════════════════════════ */}

            {/* CARD 3: ZONING & MASTER PLAN */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Zoning &amp; Land Use
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Master Plan
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Land use</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.landUse || "Residential"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Zone code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.zoneCode || plotData.luCode || "R3"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Sub category</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.subCategory || plotData.catDesc || "R3-Residential Returnable"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Zoning</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.zoning || "R3 Medium to high density zone"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Existing land use</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.existingLandUse || "Residential Vacant Plot"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Sub zone code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.subZoneCode || plotData.plotCateg || "C20"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: APPLICANT & ALLOTMENT */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Applicant &amp; Allotment
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Ownership
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Owners</div>
                      <div className="p-2.5 font-bold text-[#7A1316] bg-[#FDFBF7]">{plotData.owners || "NANNAPANENI RAMBABU"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Application number</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.applicationNumber || "APCRDA/LPS/2026/0962"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot status</div>
                      <div className="p-2.5 font-semibold text-emerald-800 bg-[#FDFBF7]">{plotData.plotStatus || "Allotted Plots"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Return</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.return || plotData.landDistribution || "Residential Returnable"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Sub Return</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.subReturn || "R3 Zone Returnable"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Reserve Category</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.reserveCategory || plotData.category || "General Allotment"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Type</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotType || plotData.plotCateg || "C20 - Regular"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 3: PHYSICAL BOUNDARIES & GIS COORDINATES         */}
            {/* ═══════════════════════════════════════════════════ */}

            {/* CARD 5: PHYSICAL BOUNDARIES & ROAD FACING */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Physical Boundaries &amp; Roads
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Cadastral Limits
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">North</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.north || plotData.regCodeN || "23-170-723-3603-3-C20"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">North Road Width</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.northRoadWidthM || "12.00 m"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">South</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.south || plotData.regCodeS || "23-170-723-3603-5-C19"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">South Road Width</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.southRoadWidthM || "12.00 m"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">East</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.east || plotData.regCodeE || "23-170-723-3603-12-C20"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">East Road Width</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.eastRoadWidthM || "18.00 m"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">West</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.west || plotData.regCodeW || "17.0 mtr Road"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">West Road Width</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.westRoadWidthM || (plotData.rdWidthM && plotData.rdWidthM !== "0.0" ? `${plotData.rdWidthM} m` : "17.00 m")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 6: GIS COORDINATES & CENTROIDS */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Map className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      GIS Coordinates &amp; Centroids
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Spatial GIS
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lat Long X</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.latLongX || "80.52914° E"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lat Long Y</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.latLongY || "16.51428° N"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Centroid X</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.centroidX || (plotData.centroid ? plotData.centroid.split(",")[0] : "447663.97 m")}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Centroid Y</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.centroidY || (plotData.centroid ? plotData.centroid.split(",")[1] : "1820525.35 m")}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Min X</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.minX || "447647.72 m"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Min Y</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.minY || "1820511.84 m"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Max X</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.maxX || "447680.22 m"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Max Y</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] font-mono">{plotData.maxY || "1820538.85 m"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 4: LOCATION & ADMINISTRATION & STATUTORY REVENUE */}
            {/* ═══════════════════════════════════════════════════ */}

            {/* CARD 7: LOCATION & ADMINISTRATION */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Location &amp; Administration
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Geographical
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Village</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.village}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">LPS village</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsVillage || plotData.village}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">RS village</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.rsVillage || plotData.village}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">District</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.district}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Mandal</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.mandal}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Township</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.township}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Sector</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.sector}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Colony</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.colony}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Block</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.block}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">RS number</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.rsNumber}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">LPS / non-LPS</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsNonLps || "LPS"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">GP code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.gpCode}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Dist Code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.distCode}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lps Vill Co</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsVillCo}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lps Blk Co</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsBlkCo || `${plotData.distCode || "07"}${plotData.block || "3603"}`}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Statutory Status</div>
                      <div className="p-2.5 font-semibold text-emerald-800 bg-[#FDFBF7]">Cadastral Registered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 8: STATUTORY & REVENUE */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="size-4 text-[#7A1316]" />
                    <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                      Statutory &amp; Revenue Details
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                    Legal Records
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Allotment date</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.allotmentDate || "14-03-2024"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Mutation date</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.mutationDate || "22-08-2024"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Registration date</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.registrationDate || "18-06-2024"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Agreement date</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.agreementDate || "10-04-2024"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Mutation number</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.mutationNumber || "MUT/2024/77218"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Registration number</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.registrationNumber || "DOC/2024/GNT/84920"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">LPS village code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsVillageCode || plotData.lpsVillCo || "0712001"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Land use code</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.landUseCode || plotData.luCode || "R3"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Allotment status</div>
                      <div className="p-2.5 font-semibold text-emerald-800 bg-[#FDFBF7]">{plotData.allotmentStatus || "Allotted & Possessed"}</div>
                      <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Object ID</div>
                      <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.objectId || plotData.gid || "19297"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 5: CADASTRAL RECORD & AUDIT (Full Width)        */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="col-span-1 lg:col-span-2 bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden">
              <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-[#7A1316]" />
                  <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                    Cadastral Record &amp; System Audit
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#7A1316] border border-[#DCD5C8]">
                  System Audit
                </span>
              </div>
              <div className="p-3 sm:p-4">
                <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                    <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Join Count</div>
                    <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.joinCount || "1"}</div>
                    <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Test</div>
                    <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.test || "Kuragallu Cadastral Verified"}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                    <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Geoportal Inserted</div>
                    <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.geoportalInsertedTs || "2026-09-10 22:43"}</div>
                    <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Geoportal Updated</div>
                    <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.geoportalUpdatedTs || "2026-09-10 23:08"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Submit Action Bar */}
            <div className="col-span-1 lg:col-span-2 bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl px-6 py-4 flex items-center justify-center shadow-xs">
              {onSaveAndNext && (
                <button
                  type="button"
                  id="lps-submit-btn"
                  onClick={onSaveAndNext}
                  className="px-10 py-2.5 rounded-lg bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 border border-[#630E10]"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Submit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}