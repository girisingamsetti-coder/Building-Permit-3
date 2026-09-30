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
}

export function LpsPlotDetailsView({
  onPlotLoaded,
  onSaveAndNext,
  onBack,
  initialPlotCode = "",
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
      {/* ── PLOT CODE INQUIRY & SEARCH BAR ── */}
      <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#7A1316]">
                APCRDA Geoportal LPS Plot Search
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20">
                Land Pooling Scheme
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

        {/* Info notice when plot is not loaded */}
        {!plotData && (
          <div className="rounded-lg border border-[#DCD5C8] bg-white/80 p-3 text-xs text-slate-600 flex items-start gap-2.5">
            <Sparkles className="size-4 text-[#7A1316] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Quick selection: </span>
              Click the dropdown arrow or select{" "}
              <button
                type="button"
                id="quick-select-sample-plot-btn"
                onClick={() => handleSelectCode("23-723-3603-4-C20")}
                className="font-bold text-[#7A1316] bg-[#FAF4EB] hover:bg-[#F3E5D4] px-1.5 py-0.5 rounded border border-[#DCD5C8] cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <span>23-723-3603-4-C20</span>
                <span className="text-[10px] text-amber-800 underline font-normal">(Click to load)</span>
              </button>{" "}
              to automatically populate statutory GIS boundaries, ownership, zoning (R3), and area metrics.
            </div>
          </div>
        )}
      </div>

      {/* Notice card before plot is fetched */}
      {!plotData && (
        <div className="border-2 border-dashed border-[#DCD5C8] bg-white/80 rounded-xl p-5 sm:p-6 text-left flex items-start gap-4">
          <div className="size-11 rounded-lg bg-[#FAF4EB] border border-[#DCD5C8] flex items-center justify-center text-[#7A1316] shrink-0 mt-0.5">
            <MapPin className="size-5" />
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-bold text-slate-900">Plot Details Pending</h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Please enter the Plot Code above or select{" "}
              <button
                type="button"
                onClick={() => handleSelectCode("23-723-3603-4-C20")}
                className="font-bold text-[#7A1316] underline hover:text-[#8F161A] cursor-pointer"
              >
                23-723-3603-4-C20
              </button>{" "}
              from the dropdown to display the statutory cadastral details, ownership, zoning, and GIS coordinates.
            </p>
          </div>
        </div>
      )}

      {/* ── PLOT DETAILS REPORT (Exact match to Screenshots 1, 2, 3) ── */}
      {plotData && (
        <div id="lps-plot-details-section" className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Plot details</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Plot Code:</span>
              <span className="text-xs font-black text-[#7A1316] bg-white px-2 py-0.5 rounded border border-[#DCD5C8]">
                {plotData.plotCode}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* ======================================================== */}
            {/* 1. PLOT                                                  */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                PLOT
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">BA file number</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.baFileNumber}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotCode}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot number</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotNumber}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Gid</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.gid}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Global Id</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] break-all">{plotData.globalId}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Code Underscore</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotCodeUnderscore}</div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 2. LOCATION                                              */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                LOCATION
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Village</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.village}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">LPS village</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsVillage}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">RS village</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.rsVillage}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">District</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.district}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Mandal</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.mandal}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Township</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.township}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Sector</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.sector}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Colony</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.colony}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Block</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.block}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">RS number</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.rsNumber}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">LPS / non-LPS</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsNonLps}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">GP code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.gpCode}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Dist Code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.distCode}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lps Vill Co</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lpsVillCo}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Mdl Code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.mdlCode}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Vill Code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.villCode}</div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. LAND USE                                              */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                LAND USE
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Zone</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.zone}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Infra zone</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.infraZone}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Sector zone</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.sectorZone}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Land use</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.landUse}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Land distribution</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.landDistribution}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Land use description</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.landUseDescription}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Category</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.category}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot status</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotStatus}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Zoning</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.zoning}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Theme city</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.themeCity}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Symbology</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.symbology}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Layer</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.layer}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Usage</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.usage}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Detailed C</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.detailedC}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Infra Zo1</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.infraZo1}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Cat Desc</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.catDesc}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lu Code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.luCode}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Categ</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.plotCateg}</div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 4. AREA                                                  */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                AREA
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Area (acres)</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.areaAcres}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Area (sq yards)</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.areaSqYards}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Allotted extent</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.allottedExtent}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Net plot area (m²)</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.netPlotAreaM2}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Maximum FSI</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.maximumFsi}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Poly Length</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.polyLength}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Poly Width</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.polyWidth}</div>
                  <div className="p-2.5 bg-[#FDFBF7] md:col-span-2 hidden md:block"></div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 5. OWNERSHIP                                             */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                OWNERSHIP
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Owners</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.owners}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Lottery</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.lottery}</div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 6. ROADS AND REGISTRATION                                */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                ROADS AND REGISTRATION
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Registration code</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.registrationCode}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Rd Width M</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.rdWidthM}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Reg Code E</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.regCodeE}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Reg Code N</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.regCodeN}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Reg Code S</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.regCodeS}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Reg Code W</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.regCodeW}</div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 7. SOIL                                                  */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                SOIL
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Soil</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.soil}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Soil type</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.soilType}</div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 8. BOUNDARY                                              */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                BOUNDARY
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Boundary points</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.boundaryPoints}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Centroid</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.centroid}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Plot Coord</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7] md:col-span-3 font-mono text-[11px] leading-relaxed break-all">
                    {plotData.plotCoord}
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 9. RECORD                                                */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
                RECORD
              </h3>
              <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Join Count</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.joinCount}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Test</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.test}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr_190px_1fr] lg:grid-cols-[210px_1fr_210px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#DCD5C8]">
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Geoportal Inserted Ts</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.geoportalInsertedTs}</div>
                  <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1]">Geoportal Updated Ts</div>
                  <div className="p-2.5 font-semibold text-slate-900 bg-[#FDFBF7]">{plotData.geoportalUpdatedTs}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD FOOTER ACTIONS (Back and Save and Next matching Screenshot) ── */}
          <div className="bg-[#FAF7F2] border-t border-[#DCD5C8] px-6 py-4 flex items-center justify-end gap-3">
            {onBack && (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2 rounded-md border border-[#DCD5C8] bg-white text-xs font-semibold text-slate-700 hover:bg-[#FBF3E4] hover:text-[#7A1316] transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            {onSaveAndNext && (
              <button
                type="button"
                id="lps-save-and-next-btn"
                onClick={onSaveAndNext}
                className="px-6 py-2 rounded-md bg-[#C47D18] hover:bg-[#A96A13] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Save and Next <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
