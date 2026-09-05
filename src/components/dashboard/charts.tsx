"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChartDatum } from "@/components/dashboard/dashboard-scope";

// ============================================================
// REUSABLE CHART COMPONENTS
// Used across ALL dashboards (LTP, Officer, Admin, PM).
// Compact, well-aligned, consistent dimensions.
//
// Design principles:
//   - Donut: 42% chart / 58% legend grid, vertically centered
//   - Legend: 3-col grid (label / count / %), 26px rows, 8px dots
//   - Bar: label-left + count-right on same line, bar below, 32px rows
//   - Card: 56px header, 220px content, 16px padding, no excess
// ============================================================

// ---------- Donut Chart ----------
// 42/58 grid split: donut left, legend right. Vertically centered.
// Compact 26px legend rows with 3-col grid (label/count/%).
export function DonutChart({
  data,
  size = 140,
  thickness = 24,
  centerLabel,
  centerValue,
}: {
  data: ChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Precompute cumulative offsets using pure reduce (no mutation in .map()).
  const segmentData = data.reduce<Array<{ dash: number; color: string; key: number; offset: number }>>(
    (acc, d, i) => {
      const dash = (d.value / total) * circumference;
      const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
      acc.push({ dash, color: d.color ?? getDefaultColor(i), key: i, offset });
      return acc;
    },
    []
  );

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[42%_58%] items-center gap-3">
      {/* Donut — centered in its column */}
      <div className="flex items-center justify-center">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="currentColor" strokeWidth={thickness}
              className="text-muted/20"
            />
            {segmentData.map((seg, i) => (
              <circle
                key={seg.key}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={hoveredIndex === i ? thickness + 4 : thickness}
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset}
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4,
                  filter: hoveredIndex === i ? 'brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>
          {(centerValue !== undefined || centerLabel) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {centerValue !== undefined && <span className="text-lg font-bold tabular-nums leading-none">{centerValue}</span>}
              {centerLabel && <span className="mt-0.5 text-[10px] text-muted-foreground">{centerLabel}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Legend — 3-col grid: label / count / %, compact 26px rows */}
      <div className="min-w-0 space-y-0.5">
        {data.map((d, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs leading-[26px] cursor-pointer rounded px-1 transition-all duration-200"
            style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4 }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full transition-all duration-200"
                style={{
                  background: d.color ?? getDefaultColor(i),
                  transform: hoveredIndex === i ? 'scale(1.5)' : 'scale(1)',
                }}
              />
              <span className="truncate font-medium" style={{ color: hoveredIndex === i ? (d.color ?? getDefaultColor(i)) : undefined }} title={d.label}>{d.label}</span>
            </span>
            <span className="text-right font-semibold tabular-nums text-foreground">{d.value}</span>
            <span className="w-9 text-right tabular-nums text-muted-foreground">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Horizontal Bar Chart ----------
// Compact: label left + count right on same line, bar below.
// 32px row height. All bars share the same background width.
export function BarChart({
  data,
  showValues = true,
}: {
  data: ChartDatum[];
  height?: number;
  barHeight?: number;
  showValues?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-1.5">
      {data.map((d, i) => (
        <div
          key={i}
          className="space-y-0.5 cursor-pointer rounded px-1 transition-all duration-200"
          style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.5 }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="flex items-center justify-between text-xs leading-[20px]">
            <span
              className="truncate font-medium transition-all duration-200"
              style={{ color: hoveredIndex === i ? (d.color ?? getDefaultColor(i)) : undefined }}
              title={d.label}
            >{d.label}</span>
            {showValues && <span className="font-semibold tabular-nums">{d.value}</span>}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(d.value / maxVal) * 100}%`,
                background: d.color ?? getDefaultColor(i),
                filter: hoveredIndex === i ? 'brightness(1.2)' : 'none',
                transform: hoveredIndex === i ? 'scaleY(1.4)' : 'scaleY(1)',
                transformOrigin: 'center',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Line Chart ----------
// Simple SVG line chart for volume over time.
export function LineChart({
  data,
  height = 200,
  color = "#047857",
}: {
  data: ChartDatum[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = 8;
  const chartH = height - padding * 2;
  const stepX = data.length > 1 ? (100 - padding * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: padding + chartH - (d.value / maxVal) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + chartH} L ${points[0].x} ${padding + chartH} Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// ---------- Chart Card ----------
// Compact: 56px header, 16px content padding, consistent across all charts.
export function ChartCard({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      {/* Header — 56px, compact */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        {Icon && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold leading-tight text-foreground">{title}</h3>
          {subtitle && <p className="truncate text-xs leading-tight text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {/* Content — 16px padding, vertically centers chart within stretched card */}
      <div className="flex flex-1 items-center p-4">{children}</div>
    </div>
  );
}

// ---------- Color palette ----------
function getDefaultColor(index: number): string {
  const colors = [
    "#047857", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  ];
  return colors[index % colors.length];
}
