"use client";

import * as React from "react";
import {
  Layers,
  Box,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  UploadCloud,
  Sparkles,
  BarChart3,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Download,
  Printer,
  Compass,
  Ruler,
  FileText,
  FileCode,
  ShieldCheck,
  Check,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// 2D Scrutiny Rule Interface
export interface ScrutinyRule2D {
  id: string;
  category: "Setbacks" | "Bulk & Density" | "Fire & Safety" | "Amenities" | "Light & Ventilation";
  title: string;
  description: string;
  requiredValue: string;
  observedValue: string;
  delta: string;
  status: "PASS" | "FAIL" | "WARNING";
  clause: string;
  recommendation?: string;
  drawingLayer?: string;
}

const MOCK_2D_RULES: ScrutinyRule2D[] = [
  {
    id: "DCR-2D-01",
    category: "Setbacks",
    title: "Front Setback from Road",
    description: "Minimum distance from front site boundary to building exterior wall.",
    requiredValue: "6.00 m",
    observedValue: "6.20 m",
    delta: "+0.20 m",
    status: "PASS",
    clause: "Regulation §7.2 (Zonal Regulations 2020)",
    drawingLayer: "SETBACKS",
  },
  {
    id: "DCR-2D-02",
    category: "Setbacks",
    title: "Rear Setback",
    description: "Minimum open space between rear plot boundary and building rear elevation.",
    requiredValue: "4.00 m",
    observedValue: "4.10 m",
    delta: "+0.10 m",
    status: "PASS",
    clause: "Regulation §7.3",
    drawingLayer: "SETBACKS",
  },
  {
    id: "DCR-2D-03",
    category: "Setbacks",
    title: "East Side Setback (Side 1)",
    description: "Minimum clear side passage for fire tender and ventilation.",
    requiredValue: "3.00 m",
    observedValue: "2.10 m",
    delta: "-0.90 m",
    status: "FAIL",
    clause: "Regulation §7.4",
    recommendation: "Balcony projection exceeds 1.0m into required 3.0m side setback. Modify CAD drawing to reduce cantilever.",
    drawingLayer: "SETBACKS",
  },
  {
    id: "DCR-2D-04",
    category: "Setbacks",
    title: "West Side Setback (Side 2)",
    description: "Opposite side setback clearance.",
    requiredValue: "3.00 m",
    observedValue: "3.10 m",
    delta: "+0.10 m",
    status: "PASS",
    clause: "Regulation §7.4",
    drawingLayer: "SETBACKS",
  },
  {
    id: "DCR-2D-05",
    category: "Bulk & Density",
    title: "Floor Area Ratio (FAR / FSI)",
    description: "Total gross built-up area divided by net plot area.",
    requiredValue: "Max 1.75",
    observedValue: "1.68",
    delta: "-0.07",
    status: "PASS",
    clause: "Regulation §8.1",
    drawingLayer: "AREAS",
  },
  {
    id: "DCR-2D-06",
    category: "Bulk & Density",
    title: "Maximum Ground Coverage",
    description: "Footprint percentage of plot covered by building.",
    requiredValue: "Max 50.0%",
    observedValue: "44.5%",
    delta: "-5.5%",
    status: "PASS",
    clause: "Regulation §8.2",
    drawingLayer: "AREAS",
  },
  {
    id: "DCR-2D-07",
    category: "Bulk & Density",
    title: "Building Height Limit",
    description: "Height measured from crown of abutting road to top of roof terrace.",
    requiredValue: "Max 24.00 m",
    observedValue: "23.40 m",
    delta: "-0.60 m",
    status: "PASS",
    clause: "Regulation §9.1",
    drawingLayer: "SECTION",
  },
  {
    id: "DCR-2D-08",
    category: "Fire & Safety",
    title: "Staircase Flight Width",
    description: "Minimum clear unobstructed width of common main staircase.",
    requiredValue: "1.50 m",
    observedValue: "1.25 m",
    delta: "-0.25 m",
    status: "FAIL",
    clause: "NBC 2016 Part 4 / Reg §11.2",
    recommendation: "Staircase width is deficient by 250mm. Enlarge staircase core on typical floor drawing.",
    drawingLayer: "STAIRS",
  },
  {
    id: "DCR-2D-09",
    category: "Amenities",
    title: "Off-street Car Parking (ECS)",
    description: "Equivalent car parking spaces required based on tenement count.",
    requiredValue: "16 ECS",
    observedValue: "18 ECS",
    delta: "+2 ECS",
    status: "PASS",
    clause: "Regulation §10.3",
    drawingLayer: "PARKING",
  },
  {
    id: "DCR-2D-10",
    category: "Light & Ventilation",
    title: "Window-to-Floor Area Ratio",
    description: "Aggregate window openings in habitable rooms vs carpet area.",
    requiredValue: "Min 10.0%",
    observedValue: "12.4%",
    delta: "+2.4%",
    status: "PASS",
    clause: "Regulation §12.1",
    drawingLayer: "WINDOWS",
  },
  {
    id: "DCR-2D-11",
    category: "Amenities",
    title: "Rainwater Harvesting Recharge Pit",
    description: "Capacity of underground recharge pit calculated on roof catchment area.",
    requiredValue: "Min 15.0 m³",
    observedValue: "16.5 m³",
    delta: "+1.5 m³",
    status: "PASS",
    clause: "Regulation §14.3",
    drawingLayer: "RWH",
  },
];

export function Drawings2DModule() {
  const { applications, user, navigate, portal } = useAppStore();
  const [selectedAppId, setSelectedAppId] = React.useState<string>("MC/BP/2026/04/0001");
  const [activeTab, setActiveTab] = React.useState<string>("viewer");
  const [activeFloor, setActiveFloor] = React.useState<string>("GROUND_FLOOR");
  const [highlightedRule, setHighlightedRule] = React.useState<ScrutinyRule2D | null>(null);
  const [zoom, setZoom] = React.useState<number>(1);
  const [rotation, setRotation] = React.useState<number>(0);
  const [showSetbacks, setShowSetbacks] = React.useState<boolean>(true);
  const [showDimensions, setShowDimensions] = React.useState<boolean>(true);
  const [showColumns, setShowColumns] = React.useState<boolean>(true);
  const [showRoomTags, setShowRoomTags] = React.useState<boolean>(true);
  const [measureToolActive, setMeasureToolActive] = React.useState<boolean>(false);
  const [scrutinyCategory, setScrutinyCategory] = React.useState<string>("ALL");
  const { toast } = useToast();

  const handleTargetViolation = (rule: ScrutinyRule2D) => {
    setHighlightedRule(rule);
    setActiveTab("viewer");
    toast({
      title: `Targeted on 2D Plan: ${rule.id}`,
      description: rule.title,
    });
  };

  const bimPortalView = portal === "SUPER_ADMIN" ? "admin-bim" : portal === "OFFICER" ? "officer-bim" : "ltp-bim";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="2D CAD Drawing & Scrutiny Engine"
        description="Comprehensive vector CAD drawing validation, automatic DCR setback verification, and regulatory rule scrutiny."
        icon={Layers}
        badge={
          <Badge variant="outline" className="border-indigo-500/40 text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300">
            Auto-DCR Engine
          </Badge>
        }
      />

      {/* Application Selector Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Application Reference:
            </span>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.applicationNo}>
                  {app.applicationNo} — {app.project.name} (CAD v2 · Scrutinized)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px]">
              CAD Version 2.0 Uploaded
            </Badge>
            <span className="text-muted-foreground">
              Drawing: <strong className="text-foreground font-mono">ARCH_SANCTION_V2.dwg</strong> (8.4 MB)
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="viewer" className="text-xs gap-1.5">
            <Eye className="size-3.5" /> 2D CAD Viewer
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs gap-1.5">
            <CheckCircle2 className="size-3.5" /> Scrutiny Matrix ({MOCK_2D_RULES.length})
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs gap-1.5">
            <BarChart3 className="size-3.5" /> Area Statements
          </TabsTrigger>
          <TabsTrigger value="diff" className="text-xs gap-1.5">
            <FileCode className="size-3.5" /> Revision Diff (v1 vs v2)
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1.5">
            <UploadCloud className="size-3.5" /> CAD Upload
          </TabsTrigger>
          <TabsTrigger value="report" className="text-xs gap-1.5">
            <Printer className="size-3.5" /> Scrutiny Report
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: 2D CAD VIEWER */}
        <TabsContent value="viewer" className="space-y-3">
          {/* Viewer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
            {/* Sheet Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Drawing Sheet:</span>
              <select
                value={activeFloor}
                onChange={(e) => setActiveFloor(e.target.value)}
                className="h-8 text-xs font-medium rounded-lg border border-input bg-background px-2.5 py-1 text-foreground"
              >
                <option value="GROUND_FLOOR">Ground Floor Plan (1:100)</option>
                <option value="FIRST_FLOOR">First Floor Plan</option>
                <option value="TYPICAL_FLOOR">Typical Floor Plan (2nd–7th)</option>
                <option value="TERRACE_FLOOR">Terrace & Roof Catchment Plan</option>
                <option value="SECTION_AA">Cross Section A-A (Clearances)</option>
                <option value="SITE_LAYOUT">Site & Setback Layout Plan</option>
              </select>
            </div>

            {/* Layer Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant={showSetbacks ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowSetbacks(!showSetbacks)}
                className="h-7 text-[11px] gap-1 px-2"
              >
                {showSetbacks ? "✓" : ""} Setbacks
              </Button>
              <Button
                variant={showDimensions ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowDimensions(!showDimensions)}
                className="h-7 text-[11px] gap-1 px-2"
              >
                {showDimensions ? "✓" : ""} Dimensions
              </Button>
              <Button
                variant={showColumns ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowColumns(!showColumns)}
                className="h-7 text-[11px] gap-1 px-2"
              >
                {showColumns ? "✓" : ""} Columns & Grid
              </Button>
              <Button
                variant={showRoomTags ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowRoomTags(!showRoomTags)}
                className="h-7 text-[11px] gap-1 px-2"
              >
                {showRoomTags ? "✓" : ""} Room Tags
              </Button>
              <Button
                variant={measureToolActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMeasureToolActive(!measureToolActive);
                  toast({
                    title: measureToolActive ? "Measure Tool Deactivated" : "Measure Tool Active",
                    description: measureToolActive ? "" : "Click two points on the drawing canvas to measure distance.",
                  });
                }}
                className="h-7 text-[11px] gap-1 px-2"
              >
                <Ruler className="size-3" /> Measure
              </Button>
            </div>

            {/* Zoom & Canvas controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-7" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}>
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="w-12 text-center text-xs tabular-nums text-muted-foreground font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="icon" className="size-7" onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}>
                <ZoomIn className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="size-7" onClick={() => setRotation((r) => r + 90)}>
                <RotateCw className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="size-7" onClick={() => { setZoom(1); setRotation(0); }}>
                <Maximize2 className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-slate-900 shadow-inner" style={{ height: 560 }}>
            {/* Dark Grid Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Targeted Violation Alert Overlay if selected */}
            {highlightedRule && (
              <div className="absolute top-4 left-4 z-20 max-w-sm p-3 rounded-xl bg-background/95 border border-red-500/50 shadow-xl backdrop-blur space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" /> {highlightedRule.id}: {highlightedRule.title}
                  </span>
                  <button onClick={() => setHighlightedRule(null)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">{highlightedRule.description}</p>
                <div className="flex items-center gap-3 text-[11px] pt-1">
                  <span>Required: <strong className="text-foreground">{highlightedRule.requiredValue}</strong></span>
                  <span>Observed: <strong className="text-red-600">{highlightedRule.observedValue}</strong></span>
                </div>
              </div>
            )}

            {/* Measurement overlay if active */}
            {measureToolActive && (
              <div className="absolute bottom-4 right-4 z-20 p-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-lg flex items-center gap-2">
                <Ruler className="size-4" /> Live Measure: 4.25 meters between grid A-2 and B-2
              </div>
            )}

            {/* Canvas Transformation Wrapper */}
            <div className="flex h-full items-center justify-center p-6 overflow-auto">
              <div
                className="relative aspect-[16/10] w-full max-w-4xl rounded-lg border-2 border-slate-700 bg-slate-950 shadow-2xl transition-transform"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 800 500" className="h-full w-full select-none" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  <rect width="800" height="500" fill="url(#cadGrid)" />

                  {/* 1. Plot Boundary */}
                  <rect x="50" y="40" width="700" height="410" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                  <text x="60" y="32" fontSize="10" fill="#22c55e" fontWeight="bold" fontFamily="monospace">
                    SANCTIONED PLOT BOUNDARY — 35.00 m × 20.50 m (717.50 m²)
                  </text>

                  {/* 2. Setback Envelopes (Dashed lines) */}
                  {showSetbacks && (
                    <g>
                      <rect x="110" y="110" width="580" height="280" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 6" />
                      <text x="400" y="95" textAnchor="middle" fontSize="10" fill="#38bdf8" fontFamily="monospace" fontWeight="bold">
                        FRONT SETBACK: 6.20 m (REQ: 6.00 m) ✓
                      </text>
                      <text x="400" y="415" textAnchor="middle" fontSize="10" fill="#38bdf8" fontFamily="monospace" fontWeight="bold">
                        REAR SETBACK: 4.10 m (REQ: 4.00 m) ✓
                      </text>
                      <text x="80" y="260" textAnchor="middle" fontSize="10" fill="#f87171" fontFamily="monospace" fontWeight="bold" transform="rotate(-90 80 260)">
                        EAST SIDE: 2.10 m (REQ: 3.00 m) ✗ FAIL
                      </text>
                      <text x="720" y="260" textAnchor="middle" fontSize="10" fill="#38bdf8" fontFamily="monospace" fontWeight="bold" transform="rotate(90 720 260)">
                        WEST SIDE: 3.10 m (REQ: 3.00 m) ✓
                      </text>

                      {/* Red Highlight overlay for the East side setback encroachment */}
                      <rect x="90" y="140" width="40" height="150" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                      <text x="105" y="220" fontSize="9" fill="#ef4444" fontWeight="bold" transform="rotate(-90 105 220)">
                        BALCONY ENCROACHMENT (0.90 m)
                      </text>
                    </g>
                  )}

                  {/* 3. Structural Building Footprint & Internal Rooms */}
                  <g>
                    {/* Main Building Mass */}
                    <rect x="130" y="120" width="540" height="260" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />

                    {/* Internal Room Dividers */}
                    <line x1="330" y1="120" x2="330" y2="380" stroke="#475569" strokeWidth="1.8" />
                    <line x1="510" y1="120" x2="510" y2="380" stroke="#475569" strokeWidth="1.8" />
                    <line x1="130" y1="250" x2="330" y2="250" stroke="#475569" strokeWidth="1.8" />
                    <line x1="330" y1="260" x2="510" y2="260" stroke="#475569" strokeWidth="1.8" />
                    <line x1="510" y1="250" x2="670" y2="250" stroke="#475569" strokeWidth="1.8" />

                    {/* Staircase Core (Failed rule target) */}
                    <rect x="340" y="270" width="160" height="100" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
                    <path d="M 350 280 L 490 280 M 350 295 L 490 295 M 350 310 L 490 310 M 350 325 L 490 325 M 350 340 L 490 340 M 350 355 L 490 355" stroke="#6366f1" strokeWidth="1" />
                    <text x="420" y="325" textAnchor="middle" fontSize="10" fill="#a5b4fc" fontWeight="bold" fontFamily="monospace">
                      STAIRCASE (1.25m WIDTH) ✗
                    </text>

                    {/* Lift Well */}
                    <rect x="440" y="135" width="60" height="70" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="440" y1="135" x2="500" y2="205" stroke="#94a3b8" strokeWidth="0.8" />
                    <line x1="500" y1="135" x2="440" y2="205" stroke="#94a3b8" strokeWidth="0.8" />
                    <text x="470" y="175" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="bold">LIFT</text>

                    {/* Room Names & Square Meters */}
                    {showRoomTags && (
                      <g fill="#e2e8f0" fontFamily="sans-serif">
                        <text x="230" y="180" textAnchor="middle" fontSize="11" fontWeight="bold">LIVING & DINING</text>
                        <text x="230" y="196" textAnchor="middle" fontSize="9" fill="#94a3b8">5.80 m × 4.20 m (24.36 m²)</text>

                        <text x="230" y="310" textAnchor="middle" fontSize="11" fontWeight="bold">BEDROOM 1</text>
                        <text x="230" y="326" textAnchor="middle" fontSize="9" fill="#94a3b8">4.50 m × 3.60 m (16.20 m²)</text>

                        <text x="420" y="180" textAnchor="middle" fontSize="11" fontWeight="bold">KITCHEN</text>
                        <text x="420" y="196" textAnchor="middle" fontSize="9" fill="#94a3b8">3.20 m × 2.80 m (8.96 m²)</text>

                        <text x="590" y="180" textAnchor="middle" fontSize="11" fontWeight="bold">MASTER SUITE</text>
                        <text x="590" y="196" textAnchor="middle" fontSize="9" fill="#94a3b8">5.20 m × 4.00 m (20.80 m²)</text>

                        <text x="590" y="310" textAnchor="middle" fontSize="11" fontWeight="bold">BEDROOM 2</text>
                        <text x="590" y="326" textAnchor="middle" fontSize="9" fill="#94a3b8">4.20 m × 3.60 m (15.12 m²)</text>
                      </g>
                    )}

                    {/* Columns & Grid Lines */}
                    {showColumns && (
                      <g fill="#f59e0b">
                        <rect x="125" y="115" width="12" height="12" />
                        <rect x="325" y="115" width="12" height="12" />
                        <rect x="505" y="115" width="12" height="12" />
                        <rect x="665" y="115" width="12" height="12" />
                        <rect x="125" y="245" width="12" height="12" />
                        <rect x="325" y="245" width="12" height="12" />
                        <rect x="505" y="245" width="12" height="12" />
                        <rect x="665" y="245" width="12" height="12" />
                        <rect x="125" y="375" width="12" height="12" />
                        <rect x="325" y="375" width="12" height="12" />
                        <rect x="505" y="375" width="12" height="12" />
                        <rect x="665" y="375" width="12" height="12" />
                      </g>
                    )}

                    {/* Entrance Porch */}
                    <polygon points="380,120 420,120 400,95" fill="#3b82f6" fillOpacity="0.4" stroke="#60a5fa" />
                    <text x="400" y="112" textAnchor="middle" fontSize="8" fill="#93c5fd" fontWeight="bold">MAIN ENTRY</text>
                  </g>

                  {/* 4. North Arrow and Title Block */}
                  <g>
                    {/* North Symbol */}
                    <circle cx="720" cy="80" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
                    <polygon points="720,68 715,90 720,86 725,90" fill="#ef4444" />
                    <text x="720" y="105" textAnchor="middle" fontSize="10" fill="#f8fafc" fontWeight="bold">N</text>

                    {/* Title Block Bottom */}
                    <rect x="50" y="440" width="700" height="28" fill="#0f172a" stroke="#334155" />
                    <text x="65" y="458" fontSize="10" fill="#38bdf8" fontWeight="bold" fontFamily="monospace">
                      PROJECT: GREENFIELD RESIDENCY (G+7 RESIDENTIAL)
                    </text>
                    <text x="420" y="458" fontSize="9" fill="#94a3b8" fontFamily="monospace">
                      APP: MC/BP/2026/04/0001 · DWG: AR-101 (REV 2)
                    </text>
                    <text x="700" y="458" textAnchor="end" fontSize="9" fill="#22c55e" fontFamily="monospace" fontWeight="bold">
                      SCALE 1:100
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
              <span>Sheet: <strong className="text-white">Ground Floor Plan</strong></span>
              <span>·</span>
              <span>DCR Checks: <strong className="text-emerald-400">9 PASS</strong>, <strong className="text-red-400">2 FAIL</strong></span>
              <span>·</span>
              <span className="font-mono text-[11px] text-slate-400">Auto-Scrutinized: Today, 17:40</span>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: 2D SCRUTINY MATRIX */}
        <TabsContent value="matrix" className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Card className="p-3 border bg-card">
              <span className="text-xs text-muted-foreground font-medium">Total DCR 2D Rules</span>
              <div className="text-2xl font-bold text-foreground mt-1">{MOCK_2D_RULES.length}</div>
              <span className="text-[11px] text-muted-foreground">Automated checks</span>
            </Card>
            <Card className="p-3 border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Passed Rules</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {MOCK_2D_RULES.filter((r) => r.status === "PASS").length}
              </div>
              <span className="text-[11px] text-muted-foreground">Compliant with regulations</span>
            </Card>
            <Card className="p-3 border border-red-500/20 bg-red-500/5">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Failed Deviations</span>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {MOCK_2D_RULES.filter((r) => r.status === "FAIL").length}
              </div>
              <span className="text-[11px] text-muted-foreground">Requires CAD revision</span>
            </Card>
            <Card className="p-3 border border-amber-500/20 bg-amber-500/5">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Warnings</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {MOCK_2D_RULES.filter((r) => r.status === "WARNING").length}
              </div>
              <span className="text-[11px] text-muted-foreground">Near threshold boundary</span>
            </Card>
          </div>

          {/* Scrutiny Rules Table */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-3 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Rule Category:</span>
                <select
                  value={scrutinyCategory}
                  onChange={(e) => setScrutinyCategory(e.target.value)}
                  className="h-8 text-xs rounded-lg border border-input bg-background px-2.5 py-1 text-foreground"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Setbacks">Setbacks & Distances</option>
                  <option value="Bulk & Density">Bulk, FAR & Coverage</option>
                  <option value="Fire & Safety">Fire Egress & Stairs</option>
                  <option value="Amenities">Parking & RWH</option>
                  <option value="Light & Ventilation">Light & Ventilation</option>
                </select>
              </div>

              <div className="text-xs text-muted-foreground">
                Showing <strong>{MOCK_2D_RULES.filter((r) => scrutinyCategory === "ALL" || r.category === scrutinyCategory).length}</strong> rules
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-3 px-4">Rule ID & Clause</th>
                    <th className="py-3 px-4">Parameter & Description</th>
                    <th className="py-3 px-4">Required by DCR</th>
                    <th className="py-3 px-4">Measured in CAD</th>
                    <th className="py-3 px-4">Delta</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_2D_RULES.filter((r) => scrutinyCategory === "ALL" || r.category === scrutinyCategory).map((rule) => (
                    <tr key={rule.id} className={cn("hover:bg-muted/30 transition-colors", rule.status === "FAIL" && "bg-red-500/5")}>
                      <td className="py-3 px-4 font-mono font-medium">
                        <div className="text-foreground font-bold">{rule.id}</div>
                        <div className="text-[10px] text-muted-foreground">{rule.clause}</div>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-foreground">{rule.title}</div>
                        <div className="text-[11px] text-muted-foreground">{rule.description}</div>
                        {rule.recommendation && (
                          <div className="mt-1 text-[11px] text-red-600 font-medium bg-red-500/10 p-1.5 rounded">
                            {rule.recommendation}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">{rule.requiredValue}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{rule.observedValue}</td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        <span className={rule.status === "FAIL" ? "text-red-600" : "text-emerald-600"}>
                          {rule.delta}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            rule.status === "PASS"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : rule.status === "FAIL"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          )}
                        >
                          {rule.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTargetViolation(rule)}
                          className="h-7 text-[11px] gap-1"
                        >
                          <Eye className="size-3" /> View on Plan
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: AREA STATEMENTS & SCHEDULES */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" /> Plot & Density Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Gross Plot Area:</span>
                  <span className="font-semibold text-foreground">717.50 m² (858.1 sq.yds)</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Road Widening Deduction:</span>
                  <span className="font-medium text-muted-foreground">0.00 m²</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Net Permissible Plot Area:</span>
                  <span className="font-semibold text-foreground">717.50 m²</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Permissible Ground Coverage (50%):</span>
                  <span className="font-semibold text-foreground">358.75 m²</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Proposed Ground Coverage (44.5%):</span>
                  <span className="font-bold text-emerald-600">319.28 m² (Complies ✓)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Permissible FAR (1.75):</span>
                  <span className="font-semibold text-foreground">1,255.62 m²</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="size-4 text-primary" /> Floor-by-Floor Area Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Ground Floor (Stilt + Parking):</span>
                  <span className="font-semibold text-foreground">319.28 m²</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">First Floor (Residential):</span>
                  <span className="font-semibold text-foreground">148.50 m²</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Typical Floors (2nd to 7th):</span>
                  <span className="font-semibold text-foreground">891.00 m² (148.5 × 6)</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Terrace Core & Headroom:</span>
                  <span className="font-semibold text-foreground">32.40 m²</span>
                </div>
                <div className="flex justify-between py-1 border-t-2 font-bold text-sm">
                  <span>Total Proposed FSI Area:</span>
                  <span className="text-primary">1,205.40 m²</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: REVISION DIFF */}
        <TabsContent value="diff" className="space-y-4">
          <Card className="p-4 border space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileCode className="size-4 text-primary" /> Drawing Version 1 vs Version 2 Comparison
            </h4>
            <p className="text-xs text-muted-foreground">
              LTP uploaded Version 2 after responding to Shortfall #SF/2026/00021.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
                <Badge variant="outline" className="text-xs font-mono">Version 1.0 (Superseded)</Badge>
                <div className="text-muted-foreground">Front Setback: 5.40 m (Violated)</div>
                <div className="text-muted-foreground">Staircase Width: 1.10 m (Violated)</div>
                <div className="text-red-500 font-semibold">Status: REJECTED AT AUTO-SCRUTINY</div>
              </div>
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <Badge className="bg-emerald-600 text-white text-xs font-mono">Version 2.0 (Current)</Badge>
                <div className="text-foreground">Front Setback: 6.20 m (Rectified to 6.20m ✓)</div>
                <div className="text-foreground">Staircase Width: 1.25 m (Partially rectified)</div>
                <div className="text-emerald-600 font-semibold">Status: 9 OF 11 DCR CHECKS CLEARED</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 5: CAD UPLOAD */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6 border border-dashed text-center space-y-3">
            <UploadCloud className="size-12 text-primary mx-auto opacity-70" />
            <h4 className="font-bold text-sm text-foreground">Upload Revised 2D Architectural CAD Drawing</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Supported formats: AutoCAD DWG (.dwg), Drawing Exchange Format (.dxf), Architectural PDF (.pdf) up to 50 MB.
            </p>
            <Button size="sm" className="gap-2 text-xs">
              <UploadCloud className="size-4" /> Select CAD Drawing File
            </Button>
          </Card>
        </TabsContent>

        {/* TAB 6: PRINTABLE SCRUTINY REPORT */}
        <TabsContent value="report" className="space-y-4">
          <Card className="p-6 border space-y-4 bg-card max-w-3xl mx-auto shadow-sm">
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">2D DCR AUTOMATED SCRUTINY CERTIFICATE</h3>
                <p className="text-xs text-muted-foreground">Directorate of Town & Country Planning — Building Permit Automation</p>
              </div>
              <Badge className="bg-emerald-600 text-white">PROVISIONAL REPORT</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg">
              <div>Application No: <strong className="text-foreground">{selectedAppId}</strong></div>
              <div>Scrutiny Engine Version: <strong className="text-foreground">v2026.4.1 (AutoCAD 2D)</strong></div>
              <div>Plot Survey No: <strong className="text-foreground">Sy 42/1, Baner East</strong></div>
              <div>Date of Scrutiny: <strong className="text-foreground">{new Date().toLocaleDateString()}</strong></div>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-foreground">Scrutiny Summary:</h5>
              <div className="p-3 rounded-lg border bg-muted/20 flex justify-around text-center">
                <div>
                  <div className="text-xl font-bold text-foreground">{MOCK_2D_RULES.length}</div>
                  <div className="text-[11px] text-muted-foreground">Total Checked</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-600">{MOCK_2D_RULES.filter((r) => r.status === "PASS").length}</div>
                  <div className="text-[11px] text-muted-foreground">Rules Passed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">{MOCK_2D_RULES.filter((r) => r.status === "FAIL").length}</div>
                  <div className="text-[11px] text-muted-foreground">Deviations</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Printer className="size-3.5" /> Print Certificate
              </Button>
              <Button size="sm" className="gap-1.5 text-xs">
                <Download className="size-3.5" /> Download Full PDF Report
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
