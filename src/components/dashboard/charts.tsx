"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChartDatum } from "@/components/dashboard/dashboard-scope";

// ============================================================
// REUSABLE CHART COMPONENTS
// Used across ALL dashboards (LTP, Officer, Admin, PM).
// Consistent dimensions, alignment, legends, colors.
// ============================================================

// ---------- Donut Chart ----------
// Centered SVG donut with legend on the right.
export function DonutChart({
  data,
  size = 160,
  thickness = 28,
  centerLabel,
  centerValue,
}: {
  data: ChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // Precompute cumulative offsets for each segment using a pure reduce.
  // Avoids mutating a variable inside .map() (react-hooks/immutability).
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
      <div className="flex items-center justify-center" style={{ height: size + 40 }}>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor" strokeWidth={thickness}
            className="text-muted/30"
          />
          {segmentData.map((seg) => (
            <circle
              key={seg.key}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              className="transition-all duration-300"
            />
          ))}
        </svg>
        {(centerValue !== undefined || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && <span className="text-xl font-bold tabular-nums">{centerValue}</span>}
            {centerLabel && <span className="text-[10px] text-muted-foreground">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color ?? getDefaultColor(i) }} />
            <span className="flex-1 truncate text-muted-foreground" title={d.label}>{d.label}</span>
            <span className="font-semibold tabular-nums">{d.value}</span>
            <span className="text-muted-foreground tabular-nums w-10 text-right">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Horizontal Bar Chart ----------
// Clean horizontal bars with labels + values.
export function BarChart({
  data,
  height = 220,
  barHeight = 28,
  showValues = true,
}: {
  data: ChartDatum[];
  height?: number;
  barHeight?: number;
  showValues?: boolean;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const totalH = Math.max(height, data.length * (barHeight + 8) + 16);

  return (
    <div className="space-y-2" style={{ minHeight: totalH }}>
      {data.map((d, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-medium" title={d.label}>{d.label}</span>
            {showValues && <span className="font-semibold tabular-nums">{d.value}</span>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(d.value / maxVal) * 100}%`,
                background: d.color ?? getDefaultColor(i),
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
  const width = 100; // percentage-based
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
// Consistent wrapper: header (icon + title + subtitle) + chart body.
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
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        {Icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
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
