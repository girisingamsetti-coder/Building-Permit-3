"use client";

import * as React from "react";
import {
  Building2,
  Layers,
  Square,
  Maximize,
  Car,
  Home,
  DoorOpen,
  AppWindow,
  Columns,
  Grid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BimBuildingMetrics, BimStorey } from "@/data/mock-bim-data";

interface BimExtractedDataProps {
  metrics: BimBuildingMetrics;
  storeys: BimStorey[];
}

export function BimExtractedData({ metrics, storeys }: BimExtractedDataProps) {
  return (
    <div className="space-y-6">
      {/* High-level KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="size-3.5 text-cyan-600" /> Total Built-Up
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {metrics.grossFloorArea.toLocaleString()} <span className="text-xs font-normal">m²</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Maximize className="size-3.5 text-blue-600" /> Building Height
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {metrics.buildingHeight} <span className="text-xs font-normal">m</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Square className="size-3.5 text-amber-600" /> Ground Coverage
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {metrics.groundCoveragePct} <span className="text-xs font-normal">%</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Layers className="size-3.5 text-purple-600" /> Storeys Above
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            G + {metrics.storeysAboveGround - 1}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Grid className="size-3.5 text-emerald-600" /> FAR Achieved
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.farAchieved} <span className="text-xs font-normal text-slate-400">/ {metrics.farPermissible}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Car className="size-3.5 text-indigo-600" /> Parking (ECS)
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {metrics.parkingEcsProvided} <span className="text-xs font-normal text-slate-400">/ {metrics.parkingEcsRequired}</span>
          </p>
        </div>
      </div>

      {/* Storey Breakdown Schedule Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="size-4 text-cyan-600" />
          Floor-by-Floor Architectural Area Schedule
        </h3>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Storey Level</th>
                <th className="px-4 py-3">Datum Elevation</th>
                <th className="px-4 py-3">Clear Height</th>
                <th className="px-4 py-3">Built-Up Area (BUA)</th>
                <th className="px-4 py-3">Carpet Area</th>
                <th className="px-4 py-3">Space Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {storeys.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                    {st.name}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {st.elevation >= 0 ? `+${st.elevation.toFixed(2)}` : st.elevation.toFixed(2)} m
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {st.height.toFixed(2)} m
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                    {st.builtUpArea.toFixed(2)} m²
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {st.carpetArea.toFixed(2)} m²
                  </td>
                  <td className="px-4 py-2.5 font-sans">
                    <Badge variant="outline" className="text-[10px]">
                      {st.spacesCount} Spaces
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BIM Element Quantity Take-Off (QTO) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Columns className="size-4 text-cyan-600" />
          IFC Element Quantity Take-Off (QTO)
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Square className="size-4" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics.wallCount}</p>
              <p className="text-[11px] text-slate-500">IfcWall</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Columns className="size-4" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics.columnCount}</p>
              <p className="text-[11px] text-slate-500">IfcColumn</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics.slabCount}</p>
              <p className="text-[11px] text-slate-500">IfcSlab</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <DoorOpen className="size-4" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics.doorCount}</p>
              <p className="text-[11px] text-slate-500">IfcDoor</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
              <AppWindow className="size-4" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics.windowCount}</p>
              <p className="text-[11px] text-slate-500">IfcWindow</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Home className="size-4" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics.spaceCount}</p>
              <p className="text-[11px] text-slate-500">IfcSpace</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
