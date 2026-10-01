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
  Pencil,
  Check,
  X,
  Save,
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

  // Editable cards state
  const [editingCard, setEditingCard] = React.useState<Record<string, boolean>>({});
  const [isBulkEdit, setIsBulkEdit] = React.useState(false);
  const [draftPlotData, setDraftPlotData] = React.useState<LpsPlotRecord>(
    plotData ? { ...plotData } : ({} as LpsPlotRecord)
  );
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync draftPlotData when plotData changes
  React.useEffect(() => {
    if (plotData) {
      setDraftPlotData({ ...plotData });
    }
  }, [plotData]);

  const updateField = (field: string, value: string) => {
    setDraftPlotData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isCardEditing = (cardKey: string) => isBulkEdit || !!editingCard[cardKey];

  const handleStartEdit = (cardKey: string) => {
    if (plotData) {
      setDraftPlotData({ ...plotData });
    }
    setEditingCard((prev) => ({ ...prev, [cardKey]: true }));
  };

  const handleCancelCard = (cardKey: string) => {
    if (plotData) {
      setDraftPlotData({ ...plotData });
    }
    setEditingCard((prev) => ({ ...prev, [cardKey]: false }));
  };

  const handleSaveCard = (cardKey: string, cardTitle: string) => {
    if (!plotData) return;
    const updated = { ...plotData, ...draftPlotData };
    setPlotData(updated);
    if (updated.plotCode && LPS_SAMPLE_RECORDS[updated.plotCode]) {
      LPS_SAMPLE_RECORDS[updated.plotCode] = updated;
    }
    setEditingCard((prev) => ({ ...prev, [cardKey]: false }));
    onPlotLoaded?.(updated);
    showToast(`${cardTitle} updated successfully!`);
  };

  const handleToggleBulkEdit = () => {
    if (isBulkEdit) {
      if (plotData) setDraftPlotData({ ...plotData });
      setIsBulkEdit(false);
      setEditingCard({});
    } else {
      if (plotData) setDraftPlotData({ ...plotData });
      setIsBulkEdit(true);
    }
  };

  const handleSaveAllCards = () => {
    if (!plotData) return;
    const updated = { ...plotData, ...draftPlotData };
    setPlotData(updated);
    if (updated.plotCode && LPS_SAMPLE_RECORDS[updated.plotCode]) {
      LPS_SAMPLE_RECORDS[updated.plotCode] = updated;
    }
    setIsBulkEdit(false);
    setEditingCard({});
    onPlotLoaded?.(updated);
    showToast("All 9 Plot Cadastral Cards updated and saved successfully!");
  };

  const handleCancelAllCards = () => {
    if (plotData) setDraftPlotData({ ...plotData });
    setIsBulkEdit(false);
    setEditingCard({});
    showToast("Edits discarded.");
  };

  const renderCardHeader = (
    title: string,
    icon: React.ReactNode,
    tag: string,
    cardKey: string
  ) => {
    const isEditing = isCardEditing(cardKey);
    return (
      <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-black text-[#801824] uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && !isBulkEdit ? (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => handleCancelCard(cardKey)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                title="Cancel changes"
              >
                <X className="size-3 text-slate-500" /> Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCard(cardKey, title)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
                title="Save changes to this card"
              >
                <Check className="size-3 text-white" /> Save
              </button>
            </div>
          ) : !isBulkEdit ? (
            <button
              type="button"
              onClick={() => handleStartEdit(cardKey)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-[#7A1316] bg-white border border-[#7A1316]/50 hover:bg-[#7A1316] hover:text-white transition-all shadow-2xs cursor-pointer group"
              title={`Edit ${title}`}
            >
              <Pencil className="size-3 text-[#7A1316] group-hover:text-white" /> Edit
            </button>
          ) : (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
              Editing
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderCell = (
    label: string,
    fieldKey: string,
    cardKey: string,
    options?: {
      placeholder?: string;
      mono?: boolean;
      selectOptions?: string[];
      colSpanFull?: boolean;
      defaultValue?: string;
    }
  ) => {
    const isEditing = isCardEditing(cardKey);
    const resolvedValue = plotData?.[fieldKey] || options?.defaultValue || "";
    const value = isEditing
      ? (draftPlotData[fieldKey] !== undefined ? draftPlotData[fieldKey] : resolvedValue)
      : (resolvedValue || "—");

    return (
      <React.Fragment key={fieldKey}>
        <div className="p-2.5 font-medium text-slate-600 bg-[#F5EBE1] flex items-center">
          {label}
        </div>
        <div className={cn("p-2 bg-[#FDFBF7] flex items-center min-h-[38px]", options?.colSpanFull && "sm:col-span-3")}>
          {isEditing ? (
            options?.selectOptions ? (
              <select
                value={draftPlotData[fieldKey] !== undefined ? draftPlotData[fieldKey] : resolvedValue || options.selectOptions[0]}
                onChange={(e) => updateField(fieldKey, e.target.value)}
                className="w-full h-7 px-2 text-xs font-semibold text-slate-900 bg-white border border-[#7A1316] rounded shadow-inner outline-none focus:ring-1 focus:ring-[#7A1316]"
              >
                {options.selectOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={draftPlotData[fieldKey] !== undefined ? draftPlotData[fieldKey] : resolvedValue}
                onChange={(e) => updateField(fieldKey, e.target.value)}
                placeholder={options?.placeholder || `Enter ${label}`}
                className={cn(
                  "w-full h-7 px-2 text-xs font-semibold text-slate-900 bg-white border border-[#7A1316] rounded shadow-inner outline-none focus:ring-1 focus:ring-[#7A1316] transition-all",
                  options?.mono && "font-mono"
                )}
              />
            )
          ) : (
            <span
              className={cn(
                "font-semibold text-slate-900 break-all",
                options?.mono && "font-mono",
                fieldKey === "owners" && "text-[#7A1316] font-bold",
                (fieldKey === "plotStatus" || fieldKey === "statutoryStatus" || fieldKey === "allotmentStatus") && "text-emerald-800 font-bold"
              )}
            >
              {value || "—"}
            </span>
          )}
        </div>
      </React.Fragment>
    );
  };

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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Applicant Information Card (50% width) */}
        <div className="w-full min-w-0 h-full flex flex-col">
          {applicantSlot}
        </div>

        {/* Right Column: Structural Engineer Info Card & Enter plot code card (50% width) */}
        <div className="w-full min-w-0 h-full flex flex-col justify-between gap-4">
          {/* ── STRUCTURAL ENGINEER INFO CARD ── */}
          {structuralEngineerSlot && (
            <div className="flex-1 min-h-[165px] flex flex-col">
              {structuralEngineerSlot}
            </div>
          )}

          {/* ── PLOT CODE INQUIRY & SEARCH BAR ── */}
          <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl p-4 sm:p-5 shadow-xs flex-1 min-h-[165px] flex flex-col justify-between">
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
            </div>

            {/* Input & Dropdown Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
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

              {/* Reload / Reset Search Button */}
              <button
                type="button"
                id="reload-plot-btn"
                onClick={() => {
                  setPlotData(null);
                  setSelectedPlotCode("");
                }}
                title="Reset / Reload plot search"
                className="size-10 rounded-lg border-2 border-[#7A1316] bg-white hover:bg-[#FBF3E4] text-[#7A1316] flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PLOT DETAILS REPORT (Aligned row-by-row across the screen) ── */}
      {plotData && (
        <div id="lps-plot-details-section" className="space-y-5 pt-1 relative">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-14 right-6 z-50 bg-[#7A1316] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-[#9A181C] animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

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
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-[#DCD5C8]">
                <span className="text-[11px] font-semibold text-slate-500">Plot Code:</span>
                <span className="text-xs font-black text-[#7A1316] font-mono">
                  {plotData.plotCode}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Geoportal Record
              </span>

              {/* Edit All Cards / Save All Controls */}
              {isBulkEdit ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={handleCancelAllCards}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <X className="size-3.5" /> Cancel All
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllCards}
                    className="inline-flex items-center gap-1 px-4 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Check className="size-3.5" /> Save All Cards
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleBulkEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Make all 9 cards editable at once"
                >
                  <Pencil className="size-3.5" /> Edit All Cards
                </button>
              )}
            </div>
          </div>

          {/* Bulk Edit Notice Banner */}
          {isBulkEdit && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-700 shrink-0" />
                <span className="font-semibold">
                  <strong>Bulk Edit Mode Active:</strong> All 9 cadastral cards are now editable. You can modify any value and click <strong>&quot;Save All Cards&quot;</strong> when done.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelAllCards}
                  className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllCards}
                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="size-3.5" /> Save All
                </button>
              </div>
            </div>
          )}

          {/* 2-Column Responsive Grid across the entire screen, paired row-by-row for pixel-perfect alignment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 1: PLOT IDENTIFICATION & EXTENT & DIMENSIONS     */}
            {/* ═══════════════════════════════════════════════════ */}

            {/* CARD 1: PLOT IDENTIFICATION */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                {renderCardHeader("Plot Identification", <Building2 className="size-4 text-[#7A1316]" />, "Cadastral", "plotId")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("BA file number", "baFileNumber", "plotId")}
                      {renderCell("Plot code", "plotCode", "plotId", { mono: true })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Plot number", "plotNumber", "plotId")}
                      {renderCell("Gid", "gid", "plotId")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Global Id", "globalId", "plotId")}
                      {renderCell("Plot Code Underscore", "plotCodeUnderscore", "plotId")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: EXTENT & DIMENSIONS */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                {renderCardHeader("Extent & Dimensions", <Ruler className="size-4 text-[#7A1316]" />, "Measurements", "extent")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Allotted Extent", "allottedExtent", "extent")}
                      {renderCell("Shape Area", "shapeArea", "extent")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Net Plot Area (m²)", "netPlotAreaM2", "extent")}
                      {renderCell("Net Plot Area (sq.yds)", "netPlotAreaSqYds", "extent")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Plot Dimension", "plotDimension", "extent")}
                      {renderCell("Plot Road Facing", "plotRoadFacing", "extent")}
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
                {renderCardHeader("Zoning & Land Use", <Layers className="size-4 text-[#7A1316]" />, "Master Plan", "zoning")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Land use", "landUse", "zoning", {
                        selectOptions: ["Residential", "Commercial", "Mixed Use", "Industrial", "Public & Semi-Public", "Open Space / Recreational"],
                      })}
                      {renderCell("Zone code", "zoneCode", "zoning")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Sub category", "subCategory", "zoning")}
                      {renderCell("Zoning", "zoning", "zoning")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Existing land use", "existingLandUse", "zoning")}
                      {renderCell("Sub zone code", "subZoneCode", "zoning")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: APPLICANT & ALLOTMENT */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                {renderCardHeader("Applicant & Allotment", <FileText className="size-4 text-[#7A1316]" />, "Ownership", "allotment")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Owners", "owners", "allotment", { colSpanFull: true })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Application number", "applicationNumber", "allotment")}
                      {renderCell("Plot status", "plotStatus", "allotment", {
                        selectOptions: ["Allotted Plots", "Possessed & Handed Over", "General Allotment", "In Process"],
                      })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Return", "return", "allotment")}
                      {renderCell("Sub Return", "subReturn", "allotment")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Reserve Category", "reserveCategory", "allotment")}
                      {renderCell("Plot Type", "plotType", "allotment")}
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
                {renderCardHeader("Physical Boundaries & Roads", <Compass className="size-4 text-[#7A1316]" />, "Cadastral Limits", "boundaries")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("North", "north", "boundaries", { defaultValue: plotData.regCodeN || "23-170-723-3603-3-C20" })}
                      {renderCell("North Road Width", "northRoadWidthM", "boundaries", { defaultValue: "12.00 m" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("South", "south", "boundaries", { defaultValue: plotData.regCodeS || "23-170-723-3603-5-C19" })}
                      {renderCell("South Road Width", "southRoadWidthM", "boundaries", { defaultValue: "12.00 m" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("East", "east", "boundaries", { defaultValue: plotData.regCodeE || "23-170-723-3603-12-C20" })}
                      {renderCell("East Road Width", "eastRoadWidthM", "boundaries", { defaultValue: "18.00 m" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("West", "west", "boundaries", { defaultValue: plotData.regCodeW || "17.0 mtr Road" })}
                      {renderCell("West Road Width", "westRoadWidthM", "boundaries", { defaultValue: (plotData.rdWidthM && plotData.rdWidthM !== "0.0" ? `${plotData.rdWidthM} m` : "17.00 m") })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 6: GIS COORDINATES & CENTROIDS */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                {renderCardHeader("GIS Coordinates & Centroids", <Map className="size-4 text-[#7A1316]" />, "Spatial GIS", "gis")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Lat Long X", "latLongX", "gis", { mono: true, defaultValue: "80.52914° E" })}
                      {renderCell("Lat Long Y", "latLongY", "gis", { mono: true, defaultValue: "16.51428° N" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Centroid X", "centroidX", "gis", { mono: true, defaultValue: plotData.centroid ? plotData.centroid.split(",")[0] : "447663.97 m" })}
                      {renderCell("Centroid Y", "centroidY", "gis", { mono: true, defaultValue: plotData.centroid ? plotData.centroid.split(",")[1] : "1820525.35 m" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Min X", "minX", "gis", { mono: true, defaultValue: "447647.72 m" })}
                      {renderCell("Min Y", "minY", "gis", { mono: true, defaultValue: "1820511.84 m" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Max X", "maxX", "gis", { mono: true, defaultValue: "447680.22 m" })}
                      {renderCell("Max Y", "maxY", "gis", { mono: true, defaultValue: "1820538.85 m" })}
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
                {renderCardHeader("Location & Administration", <MapPin className="size-4 text-[#7A1316]" />, "Geographical", "location")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Village", "village", "location")}
                      {renderCell("LPS village", "lpsVillage", "location", { defaultValue: plotData.village })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("RS village", "rsVillage", "location", { defaultValue: plotData.village })}
                      {renderCell("District", "district", "location")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Mandal", "mandal", "location")}
                      {renderCell("Township", "township", "location")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Sector", "sector", "location")}
                      {renderCell("Colony", "colony", "location")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Block", "block", "location")}
                      {renderCell("RS number", "rsNumber", "location")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("LPS / non-LPS", "lpsNonLps", "location", {
                        defaultValue: "LPS",
                        selectOptions: ["LPS", "Non-LPS"],
                      })}
                      {renderCell("GP code", "gpCode", "location")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Dist Code", "distCode", "location")}
                      {renderCell("Lps Vill Co", "lpsVillCo", "location")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Lps Blk Co", "lpsBlkCo", "location", {
                        defaultValue: `${plotData.distCode || "07"}${plotData.block || "3603"}`,
                      })}
                      {renderCell("Statutory Status", "statutoryStatus", "location", {
                        defaultValue: "Cadastral Registered",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 8: STATUTORY & REVENUE */}
            <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
              <div>
                {renderCardHeader("Statutory & Revenue Details", <Landmark className="size-4 text-[#7A1316]" />, "Legal Records", "statutory")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Allotment date", "allotmentDate", "statutory", { defaultValue: "14-03-2024" })}
                      {renderCell("Mutation date", "mutationDate", "statutory", { defaultValue: "22-08-2024" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Registration date", "registrationDate", "statutory", { defaultValue: "18-06-2024" })}
                      {renderCell("Agreement date", "agreementDate", "statutory", { defaultValue: "10-04-2024" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Mutation number", "mutationNumber", "statutory", { defaultValue: "MUT/2024/77218" })}
                      {renderCell("Registration number", "registrationNumber", "statutory", { defaultValue: "DOC/2024/GNT/84920" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("LPS village code", "lpsVillageCode", "statutory", { defaultValue: plotData.lpsVillCo || "0712001" })}
                      {renderCell("Land use code", "landUseCode", "statutory", { defaultValue: plotData.luCode || "R3" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Allotment status", "allotmentStatus", "statutory", {
                        defaultValue: "Allotted & Possessed",
                        selectOptions: ["Allotted & Possessed", "Possessed & Handed Over", "Pending Possession", "Provisional"],
                      })}
                      {renderCell("Object ID", "objectId", "statutory", { defaultValue: plotData.gid || "19297" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ROW 5: CADASTRAL RECORD & AUDIT (Full Width)        */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="col-span-1 lg:col-span-2 bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden">
              <div>
                {renderCardHeader("Cadastral Record & System Audit", <Database className="size-4 text-[#7A1316]" />, "System Audit", "audit")}
                <div className="p-3 sm:p-4">
                  <div className="border border-[#DCD5C8] rounded-md overflow-hidden bg-white text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8] border-b border-[#DCD5C8]">
                      {renderCell("Join Count", "joinCount", "audit", { defaultValue: "1" })}
                      {renderCell("Test", "test", "audit", { defaultValue: "Kuragallu Cadastral Verified" })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DCD5C8]">
                      {renderCell("Geoportal Inserted", "geoportalInsertedTs", "audit", { defaultValue: "2026-09-10 22:43" })}
                      {renderCell("Geoportal Updated", "geoportalUpdatedTs", "audit", { defaultValue: "2026-09-10 23:08" })}
                    </div>
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
                  <span>Save &amp; Continue</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}