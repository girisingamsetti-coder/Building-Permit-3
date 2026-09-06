import * as React from "react";
import { cn } from "@/lib/utils";

function getPoint(cx: number, cy: number, r: number, angle: number, tilt: number, z: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle) * tilt - z,
  };
}

function getArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  tilt: number,
  z: number,
  sweep: 1 | 0 = 1
) {
  const p = getPoint(cx, cy, r, endAngle, tilt, z);
  const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  return `A ${r} ${r * tilt} 0 ${largeArc} ${sweep} ${p.x} ${p.y}`;
}

export function ApplicantPipeline3DChart({
  className,
}: {
  className?: string;
}) {
  const rawData = [
    { label: "Draft", value: 35 },
    { label: "Filed", value: 20 },
    { label: "In Scrutiny", value: 33 },
    { label: "Scrutiny Failed", value: 19 },
    { label: "Documents Pending", value: 40 },
    { label: "Payment Pending", value: 18 },
    { label: "Payment Declined", value: 8 },
    { label: "Returned", value: 14 },
    { label: "Officer Pending", value: 2 },
  ];

  // Palette mimicking the Applications by status chart (PolarStatusChart) with radial gradients
  const colors = [
    { from: "#dbeafe", to: "#3b82f6" }, // blue
    { from: "#ede9fe", to: "#8b5cf6" }, // violet
    { from: "#fef9c3", to: "#eab308" }, // amber
    { from: "#e0f2fe", to: "#0284c7" }, // sky
    { from: "#ffe4e6", to: "#f43f5e" }, // rose
    { from: "#d1fae5", to: "#10b981" }, // emerald
  ];

  // Sort data descending so the largest is at the bottom (rendered first)
  const sortedData = [...rawData].sort((a, b) => b.value - a.value);
  const maxValue = sortedData[0]?.value || 1;
  const totalValue = rawData.reduce((acc, d) => acc + d.value, 0);

  // Layout parameters
  const cx = 200;
  const cy = 200;
  const maxRadius = 120; // Reduced by 20% from 150
  const tilt = 1.0; // Top view (perfect circle)
  const thickness = 0; // No visible thickness from directly above

  // All slices start at the same angle (pointing slightly down-right)
  const startAngle = Math.PI * 0.1;

  const segments = sortedData.map((d, i) => {
    // Angle spans proportionally to value compared to maxValue
    // Max value gets 270 degrees (1.5 PI)
    const angleSpan = (d.value / maxValue) * (Math.PI * 1.5);
    // Note: because SVG arcs are drawn clockwise, startAngle + angleSpan
    const endAngle = startAngle + angleSpan;

    // Radius decreases for each stacked layer
    const radius = maxRadius - (i * 12); 
    
    // Z (height) is 0 from a pure top view
    const z = 0;

    return {
      ...d,
      startAngle,
      endAngle,
      radius,
      z,
      gradient: colors[i % colors.length],
      gradId: `grad-pipeline-${i}`,
    };
  });

  function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  return (
    <div className={cn("flex flex-col w-full h-full gap-1", className)}>
      <div className="flex-1 relative w-full max-w-[90%] mx-auto flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible z-10 drop-shadow-xl">
        <defs>
          {segments.map((seg, i) => (
            <radialGradient
              key={seg.gradId}
              id={seg.gradId}
              cx="200"
              cy="200"
              r={seg.radius}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="30%" stopColor={seg.gradient.from} />
              <stop offset="100%" stopColor={seg.gradient.to} />
            </radialGradient>
          ))}
        </defs>

        {/* Render back to front simply by array order since they stack vertically */}
        {segments.map((seg, i) => {
          const { startAngle, endAngle, radius, z, gradId, gradient } = seg;
          // Use the gradient URL for fill, and the darker 'to' color for stroke
          const topColor = `url(#${gradId})`;
          const strokeColor = gradient.to;

          const pCenter = { x: cx, y: cy };
          const pOuterStart = getPoint(cx, cy, radius, startAngle, tilt, 0);

          const topPath = `
            M ${pCenter.x} ${pCenter.y}
            L ${pOuterStart.x} ${pOuterStart.y}
            ${getArcPath(cx, cy, radius, startAngle, endAngle, tilt, 0, 1)}
            Z
          `;

          return (
            <g key={i} className="group cursor-pointer transition-transform duration-300 hover:scale-105 origin-center">
              {/* Added a small drop shadow to separate the overlapped layers slightly, maintaining a clean 2D vector look */}
              <path 
                d={topPath} 
                fill={topColor} 
                stroke={strokeColor} 
                strokeWidth="1.5" 
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
              />
            </g>
          );
        })}
        </svg>
      </div>

      {/* Compact 2-col Legend */}
      <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 px-1 content-end -mt-8">
        {rawData.map((d, i) => {
          const color = colors[i % colors.length];
          return (
            <div key={i} className="flex items-center justify-between gap-1.5 text-[10px] min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <div
                  className="w-2 h-2 shrink-0 rounded-full shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                />
                <span className="text-slate-500 truncate font-medium">{d.label}</span>
              </div>
              <span className="font-bold text-slate-700 tabular-nums shrink-0">{d.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
