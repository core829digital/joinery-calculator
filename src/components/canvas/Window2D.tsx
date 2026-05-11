"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ProductType, Color } from "@/types";
import { COLORS } from "@/data/joinery";

export type WindowComponent = "toc" | "canat" | "sticla" | "baghete" | "maner" | "balamale" | "glaf" | "prag" | "stulp" | "montant";

const COLOR_MAP: Record<string, string> = COLORS.reduce((acc, c) => {
  acc[c.id] = c.hex;
  return acc;
}, {} as Record<string, string>);

const COMPONENT_LABELS: Record<WindowComponent, string> = {
  toc: "Toc (Rama)",
  canat: "Canat",
  sticla: "Sticlă",
  baghete: "Baghete",
  maner: "Maner",
  balamale: "Balamale",
  glaf: "Glaf",
  prag: "Prag",
  stulp: "Stulp",
  montant: "Montant",
};

export type SashRole = "active" | "inactive" | "fixed";

interface Window2DProps {
  productType: ProductType;
  width: number;
  height: number;
  interiorColor: Color | null;
  exteriorColor: Color | null;
  openingSide?: "left" | "right";
  openingType?: "normal" | "oscilobativ";
  openingDirection?: "inward" | "outward";
  sashConfiguration?: "stulp" | "montant";
  sashRoles?: Record<string, SashRole>;
  handleHeight?: number;
  showThreshold?: boolean;
  horizontalMuntin?: boolean;
  showDimensions?: boolean;
  scale?: number;
  className?: string;
  onComponentClick?: (component: WindowComponent) => void;
  onDimensionChange?: (width: number, height: number) => void;
  onSashRoleChange?: (sashId: string, role: SashRole) => void;
  onOpeningTypeChange?: (type: "normal" | "oscilobativ") => void;
  glassType?: string;
}

export default function Window2D({
  productType,
  width,
  height,
  interiorColor,
  exteriorColor,
  openingSide = "right",
  openingType = "normal",
  openingDirection = "inward",
  sashConfiguration,
  sashRoles = {},
  handleHeight,
  showThreshold = false,
  horizontalMuntin = false,
  showDimensions = true,
  scale = 0.65,
  className,
  onComponentClick,
  onDimensionChange,
  onSashRoleChange,
  onOpeningTypeChange,
  glassType,
}: Window2DProps) {
  const [hoveredComponent, setHoveredComponent] = useState<WindowComponent | null>(null);
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);

  // Frame colors from props (used in legend)
  const _frameColorInterior = interiorColor && COLOR_MAP[interiorColor] ? COLOR_MAP[interiorColor] : "#F8F9FA";
  const _frameColorExterior = exteriorColor && COLOR_MAP[exteriorColor] ? COLOR_MAP[exteriorColor] : "#E9ECEF";

  const w = width * scale;
  const h = height * scale;

  // GROSIME MĂRITĂ pentru toc și cercevea - stil CAD foarte pronunțat
  const tocThickness = 55 * scale;  // foarte gros - stil CAD, ușor de clic
  const sashThickness = 28 * scale; // foarte gros - stil CAD
  const glassGap = 6 * scale; // spațiu mai mare pentru sticlă

  const handleComponentHover = (component: WindowComponent | null) => {
    setHoveredComponent(component);
  };

  const config = useMemo(() => {
    switch (productType) {
      case "window_1_canat":
        return {
          type: "1 canat",
          sashes: [{ x: tocThickness, y: tocThickness, w: w - tocThickness * 2, h: h - tocThickness * 2, side: openingSide as "left" | "right" | "none" }],
          isDoor: false,
        };
      case "window_2_canate":
        return {
          type: "2 canate",
          sashes: [
            { x: tocThickness, y: tocThickness, w: (w - tocThickness * 2 - 4 * scale) / 2, h: h - tocThickness * 2, side: "left" as const },
            { x: tocThickness + (w - tocThickness * 2) / 2 + 2 * scale, y: tocThickness, w: (w - tocThickness * 2 - 4 * scale) / 2, h: h - tocThickness * 2, side: "right" as const },
          ],
          isDoor: false,
        };
      case "window_3_canate":
        return {
          type: "3 canate",
          sashes: [
            { x: tocThickness, y: tocThickness, w: (w - tocThickness * 2 - 6 * scale) / 3, h: h - tocThickness * 2, side: "left" as const },
            { x: tocThickness + (w - tocThickness * 2) / 3 + 2 * scale, y: tocThickness, w: (w - tocThickness * 2 - 6 * scale) / 3, h: h - tocThickness * 2, side: "center" as const },
            { x: tocThickness + (w - tocThickness * 2) * 2 / 3 + 4 * scale, y: tocThickness, w: (w - tocThickness * 2 - 6 * scale) / 3, h: h - tocThickness * 2, side: "right" as const },
          ],
          isDoor: false,
        };
      case "window_fix":
        return {
          type: "fereastră fixă",
          sashes: [{ x: tocThickness, y: tocThickness, w: w - tocThickness * 2, h: h - tocThickness * 2, side: "none" as const }],
          isDoor: false,
        };
      case "usa_balcon_1":
      case "usa_intrare_pvc":
      case "usa_intrare_aluminiu":
        return {
          type: "ușă 1 canat",
          sashes: [{ x: tocThickness, y: tocThickness, w: w - tocThickness * 2, h: h - tocThickness * 2, side: openingSide as "left" | "right" }],
          isDoor: true,
        };
      case "usa_balcon_2":
        return {
          type: "ușă 2 canate",
          sashes: [
            { x: tocThickness, y: tocThickness, w: (w - tocThickness * 2 - 4 * scale) / 2, h: h - tocThickness * 2, side: "left" as const },
            { x: tocThickness + (w - tocThickness * 2) / 2 + 2 * scale, y: tocThickness, w: (w - tocThickness * 2 - 4 * scale) / 2, h: h - tocThickness * 2, side: "right" as const },
          ],
          isDoor: true,
        };
      default:
        return {
          type: "1 canat",
          sashes: [{ x: tocThickness, y: tocThickness, w: w - tocThickness * 2, h: h - tocThickness * 2, side: openingSide as "left" | "right" }],
          isDoor: false,
        };
    }
  }, [productType, w, h, scale, tocThickness, openingSide]);

  // Compute available opening types based on sash roles
  const openingTypeOptions = useMemo(() => {
    const roles = config.sashes.map((sash, idx) => {
      const sashKey = sash.side || String(idx);
      return sashRoles[sashKey] || ((sash.side === openingSide) || (config.sashes.length === 1) ? "active" : "inactive");
    });

    const hasActive = roles.includes("active");
    const hasInactive = roles.includes("inactive");
    const allFixed = roles.length > 0 && roles.every((r) => r === "fixed");

    if (allFixed) return { show: false, options: [] as ("normal" | "oscilobativ")[] };
    if (hasActive) return { show: true, options: ["normal", "oscilobativ"] as ("normal" | "oscilobativ")[] };
    if (hasInactive) return { show: true, options: ["normal"] as ("normal" | "oscilobativ")[] };
    return { show: false, options: [] as ("normal" | "oscilobativ")[] };
  }, [config.sashes, sashRoles, openingSide]);

  // Reset opening type if current value is no longer valid
  useEffect(() => {
    if (openingType === "oscilobativ" && !openingTypeOptions.options.includes("oscilobativ")) {
      onOpeningTypeChange?.("normal");
    }
  }, [openingType, openingTypeOptions.options, onOpeningTypeChange]);

  const margin = Math.max(20, 35 * scale);
  const svgWidth = w + margin * 2;
  const svgHeight = h + margin * 2;

  const handleX = (sash: typeof config.sashes[0]) => {
    if (sash.side === "none" || sash.side === "center" || !sash.side) return sash.x + sash.w / 2;
    return sash.side === "right" ? sash.x + sash.w - 8 * scale : sash.x + 8 * scale;
  };
  
  const handleYFromBottom = (sash: typeof config.sashes[0]) => {
    const minHandleY = 30 * scale;
    const maxHandleY = sash.h - 30 * scale;
    if (!handleHeight) return sash.y + sash.h / 2;
    const requestedY = handleHeight * scale;
    const clampedY = Math.max(minHandleY, Math.min(requestedY, maxHandleY));
    return sash.y + sash.h - clampedY;
  };

  const renderOpeningLines = (sash: typeof config.sashes[0], idx: number) => {
    if (sash.side === "none" || sash.side === "center") return null;

    const sashKey = sash.side || String(idx);
    const sashRole = sashRoles[sashKey] || 
      ((sash.side === openingSide) || (config.sashes.length === 1) ? "active" : "inactive");

    if (sashRole === "fixed") return null;

    const isLeft = sash.side === "left";
    const isInward = openingDirection === "inward";
    
    const lineColor = isInward ? "#1E40AF" : "#EA580C";
    const secondaryColor = isInward ? "#3B82F6" : "#F97316";

    const topY = sash.y;
    const bottomY = sash.y + sash.h;
    const leftX = sash.x;
    const rightX = sash.x + sash.w;
    const centerX = sash.x + sash.w / 2;
    const centerY = sash.y + sash.h / 2;
    
    const hingeX = isLeft ? leftX : rightX;
    const farX = isLeft ? rightX : leftX;
    const handleXPos = isLeft ? rightX : leftX;

    if (sashRole === "inactive") {
      return (
        <g key={`inactive-${idx}`} opacity={0.9}>
          <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={2 * scale} strokeDasharray={`${4 * scale} ${3 * scale}`} />
          <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={2 * scale} strokeDasharray={`${4 * scale} ${3 * scale}`} />
          <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2.5 * scale} opacity={0.7} strokeDasharray={`${4 * scale} ${3 * scale}`} />
          <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2.5 * scale} strokeDasharray={`${4 * scale} ${3 * scale}`} />
          <circle cx={hingeX} cy={topY} r={3 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={hingeX} cy={bottomY} r={3 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={centerX} cy={centerY} r={3.5 * scale} fill="#F59E0B" stroke="white" strokeWidth={0.8 * scale} />
          <text x={centerX} y={topY - 8 * scale} textAnchor="middle" fontSize={5 * scale} fill="#F59E0B" fontWeight="bold">INACTIV</text>
        </g>
      );
    }

    if (openingType === "oscilobativ") {
      return (
        <g key={`oscilo-${idx}`} opacity={0.95}>
          <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={2 * scale} />
          <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={2 * scale} />
          <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2.5 * scale} opacity={0.7} />
          <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2.5 * scale} />
          <line x1={leftX} y1={bottomY} x2={centerX} y2={topY} stroke="#8B5CF6" strokeWidth={3 * scale} />
          <line x1={rightX} y1={bottomY} x2={centerX} y2={topY} stroke="#8B5CF6" strokeWidth={3 * scale} />
          <circle cx={hingeX} cy={topY} r={2 * scale} fill={lineColor} stroke="white" strokeWidth={0.5 * scale} />
          <circle cx={hingeX} cy={bottomY} r={2 * scale} fill={lineColor} stroke="white" strokeWidth={0.5 * scale} />
          <circle cx={centerX} cy={topY} r={2.5 * scale} fill="#8B5CF6" stroke="white" strokeWidth={0.5 * scale} />
          <text x={centerX} y={topY - 6 * scale} textAnchor="middle" fontSize={4 * scale} fill="#8B5CF6" fontWeight="bold">OSCILO</text>
        </g>
      );
    }
    
    return (
      <g key={`normal-${idx}`} opacity={0.95}>
        <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={2 * scale} />
        <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={2 * scale} />
        <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2.5 * scale} opacity={0.7} />
        <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2.5 * scale} />
        <circle cx={hingeX} cy={topY} r={3 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={hingeX} cy={bottomY} r={3 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={hingeX} cy={centerY} r={3 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={handleXPos} cy={centerY} r={3 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.8 * scale} />
        <text x={centerX} y={topY - 8 * scale} textAnchor="middle" fontSize={5 * scale} fill={secondaryColor} fontWeight="bold">MANER</text>
        <text x={hingeX} y={bottomY + 10 * scale} textAnchor={isLeft ? "start" : "end"} fontSize={4 * scale} fill={lineColor} fontWeight="600">BALAMA</text>
      </g>
    );
  };

  const renderBolts = (sash: typeof config.sashes[0], idx: number) => {
    if (sash.side === "none" || sash.side === "center") return null;
    if (sashConfiguration !== "stulp") return null;
    
    const isLeftSash = sash.side === "left";
    const isRightSash = sash.side === "right";
    const isActiveSash = (isLeftSash && openingSide === "left") || (isRightSash && openingSide === "right");
    
    if (isActiveSash) return null;

    const boltX = isLeftSash ? sash.x + sash.w - 5 * scale : sash.x + 3 * scale;
    
    return (
      <g key={`bolts-${idx}`} opacity={0.7}>
        <rect x={boltX} y={sash.y + sash.h * 0.15} width={6 * scale} height={3 * scale} rx={1 * scale} fill="#6B7280" />
        <rect x={boltX} y={sash.y + sash.h * 0.85 - 3 * scale} width={6 * scale} height={3 * scale} rx={1 * scale} fill="#6B7280" />
      </g>
    );
  };

  const renderHandle = (sash: typeof config.sashes[0], idx: number) => {
    if (sash.side === "none" || sash.side === "center") return null;

    const isSingleSash = config.sashes.length === 1;
    const isLeftSash = sash.side === "left";
    const isRightSash = sash.side === "right";
    
    const sashKey = sash.side || String(idx);
    const sashRole = sashRoles[sashKey] || (isSingleSash ? "active" : (isLeftSash && openingSide === "left") || (isRightSash && openingSide === "right") ? "active" : "inactive");
    const isActiveSash = sashRole === "active";
    
    const shouldShowHandle = isSingleSash || sashConfiguration === "montant" || (sashConfiguration === "stulp" && isActiveSash);
    
    if (!shouldShowHandle) return null;
    if (sashRole === "inactive") return null;

    const hx = handleX(sash);
    const hy = handleYFromBottom(sash);
    const handleW = 8 * scale;
    const handleH = 16 * scale;

    return (
      <g 
        key={`handle-${idx}`} 
        onClick={(e) => { e.stopPropagation(); onComponentClick?.("maner"); }} 
        onMouseEnter={() => handleComponentHover("maner")}
        onMouseLeave={() => handleComponentHover(null)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={hx - handleW / 2}
          y={hy - handleH / 2}
          width={handleW}
          height={handleH}
          rx={2 * scale}
          fill={hoveredComponent === "maner" ? "#2563EB" : "#9CA3AF"}
          stroke={hoveredComponent === "maner" ? "#1D4ED8" : "#6B7280"}
          strokeWidth={hoveredComponent === "maner" ? 1 : 0.5}
        />
        <rect
          x={hx - handleW / 2 + 1.5 * scale}
          y={hy - handleH / 2 + 1.5 * scale}
          width={handleW - 3 * scale}
          height={handleH - 3 * scale}
          rx={1.5 * scale}
          fill={hoveredComponent === "maner" ? "#60A5FA" : "#D1D5DB"}
          stroke="#FFFFFF"
          strokeWidth={0.3 * scale}
        />
      </g>
    );
  };

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden", className)}>
      <div className="px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-center justify-between h-7">
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">2D</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 font-medium">{config.type}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{openingSide === "left" ? "← St" : "Dr →"}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${openingDirection === "inward" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
            {openingDirection === "inward" ? "Int" : "Ext"}
          </span>
          {sashConfiguration && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sashConfiguration === "stulp" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"}`}>
              {sashConfiguration === "stulp" ? "Stulp" : "Mont"}
            </span>
          )}
          {/* Opening Type Dropdown - gated by sash roles */}
          {openingTypeOptions.show && (
            <select
              value={openingTypeOptions.options.includes(openingType) ? openingType : openingTypeOptions.options[0] || "normal"}
              onChange={(e) => {
                const val = e.target.value as "normal" | "oscilobativ";
                onOpeningTypeChange?.(val);
              }}
              className="text-[9px] h-4 px-1 rounded border border-slate-200 bg-white text-slate-600"
            >
              {openingTypeOptions.options.includes("normal") && (
                <option value="normal">Normal</option>
              )}
              {openingTypeOptions.options.includes("oscilobativ") && (
                <option value="oscilobativ">Oscilobatant</option>
              )}
            </select>
          )}
          {/* Sash Role Toggles */}
          {config.sashes.length > 1 && onSashRoleChange && (
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200">
              {config.sashes.map((sash, idx) => {
                const sashId = sash.side || String(idx);
                const role = sashRoles[sashId] || "active";
                const label = sash.side === "left" ? "St" : sash.side === "right" ? "Dr" : sash.side === "center" ? "C" : String(idx + 1);
                return (
                  <div key={sashId} className="flex items-center gap-0.5">
                    <span className="text-[9px] text-slate-400">{label}:</span>
                    <button
                      onClick={() => {
                        const next: SashRole = role === "active" ? "inactive" : role === "inactive" ? "fixed" : "active";
                        onSashRoleChange(sashId, next);
                      }}
                      className={cn(
                        "px-1 py-0.5 rounded text-[9px] font-medium transition-colors",
                        role === "active" ? "bg-green-600 text-white" : role === "inactive" ? "bg-amber-500 text-white" : "bg-slate-500 text-white"
                      )}
                      title={role === "active" ? "Canat activ (se deschide)" : role === "inactive" ? "Canat inactiv (nu se deschide)" : "Canat fix (fix)"}
                    >
                      {role === "active" ? "Activ" : role === "inactive" ? "Inact" : "Fix"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {showDimensions && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <label className="text-[10px] text-slate-500 font-medium">L:</label>
              <input
                type="number"
                value={localWidth}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setLocalWidth(val);
                  if (val >= 300 && val <= 3000) {
                    onDimensionChange?.(val, localHeight);
                  }
                }}
                className="w-14 px-1 py-0.5 text-[10px] font-semibold text-center border border-slate-300 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                min={300}
                max={3000}
              />
            </div>
            <span className="text-slate-300 text-[10px]">×</span>
            <div className="flex items-center gap-0.5">
              <label className="text-[10px] text-slate-500 font-medium">H:</label>
              <input
                type="number"
                value={localHeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setLocalHeight(val);
                  if (val >= 300 && val <= 3000) {
                    onDimensionChange?.(localWidth, val);
                  }
                }}
                className="w-14 px-1 py-0.5 text-[10px] font-semibold text-center border border-slate-300 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                min={300}
                max={3000}
              />
            </div>
            <span className="text-[10px] text-slate-500">{((localWidth * localHeight) / 1000000).toFixed(2)}m²</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center bg-slate-50 w-full h-full overflow-hidden" style={{ minHeight: 0 }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', display: 'block' }}
        >
          <defs>
            <pattern id="glassPattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#E3F2FD" />
              <rect width="8" height="8" fill="none" stroke="#90CAF9" strokeWidth="0.2" />
            </pattern>
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2196F3" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8F9FA" />
              <stop offset="50%" stopColor="#E9ECEF" />
              <stop offset="100%" stopColor="#DEE2E6" />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin}, ${margin})`}>
            {/* ZIDARIA / BRICKMOLD - exterior outline */}
            <rect
              x={-4 * scale}
              y={-4 * scale}
              width={w + 8 * scale}
              height={h + 8 * scale}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={2 * scale}
              strokeDasharray={`${6 * scale} ${3 * scale}`}
            />

            {/* TOC EXTERIOR - Rama principala - STIL CAD */}
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="url(#frameGradient)"
              stroke={hoveredComponent === "toc" ? "#2563EB" : "#0F172A"}
              strokeWidth={hoveredComponent === "toc" ? 4 * scale : 3 * scale}
              onClick={(e) => { e.stopPropagation(); onComponentClick?.("toc"); }}
              onMouseEnter={() => handleComponentHover("toc")}
              onMouseLeave={() => handleComponentHover(null)}
              style={{ cursor: "pointer" }}
            />

            {/* TOC INTERIOR - Linie de contur interioara - CAD stil */}
            <rect
              x={tocThickness - 1 * scale}
              y={tocThickness - 1 * scale}
              width={w - (tocThickness - 1 * scale) * 2}
              height={h - (tocThickness - 1 * scale) * 2}
              fill="none"
              stroke="#64748B"
              strokeWidth={1.5 * scale}
            />

            {/* CANATURI / Sashes */}
            {config.sashes.map((sash, idx) => (
              <g key={`sash-${idx}`}>
                {/* CERCEVEA EXTERIOARA - rama canatului - STIL CAD */}
                <rect
                  x={sash.x - sashThickness}
                  y={sash.y - sashThickness}
                  width={sash.w + sashThickness * 2}
                  height={sash.h + sashThickness * 2}
                  fill="url(#frameGradient)"
                  stroke={hoveredComponent === "canat" ? "#2563EB" : "#1E293B"}
                  strokeWidth={hoveredComponent === "canat" ? 3 * scale : 2 * scale}
                  onClick={(e) => { e.stopPropagation(); onComponentClick?.("canat"); }}
                  onMouseEnter={() => handleComponentHover("canat")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* CERCEVEA INTERIOARA - linie de contur */}
                <rect
                  x={sash.x - sashThickness + 1.5 * scale}
                  y={sash.y - sashThickness + 1.5 * scale}
                  width={sash.w + sashThickness * 2 - 3 * scale}
                  height={sash.h + sashThickness * 2 - 3 * scale}
                  fill="none"
                  stroke="#ADB5BD"
                  strokeWidth={0.6 * scale}
                />

                {/* STICLA / Glass */}
                <rect
                  x={sash.x + glassGap}
                  y={sash.y + glassGap}
                  width={sash.w - glassGap * 2}
                  height={sash.h - glassGap * 2}
                  fill="url(#glassPattern)"
                  stroke={hoveredComponent === "sticla" ? "#3B82F6" : "transparent"}
                  strokeWidth={hoveredComponent === "sticla" ? 2 : 0}
                  onClick={(e) => { e.stopPropagation(); onComponentClick?.("sticla"); }}
                  onMouseEnter={() => handleComponentHover("sticla")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />
                {/* Suprapunere gradient sticla */}
                <rect
                  x={sash.x + glassGap}
                  y={sash.y + glassGap}
                  width={sash.w - glassGap * 2}
                  height={sash.h - glassGap * 2}
                  fill="url(#glassShine)"
                  pointerEvents="none"
                />
                {/* Eticheta tip sticla pe desen */}
                {glassType && sash.w > 80 * scale && (
                  <g>
                    <rect
                      x={sash.x + sash.w / 2 - 20 * scale}
                      y={sash.y + sash.h / 2 - 6 * scale}
                      width={40 * scale}
                      height={12 * scale}
                      fill="rgba(255,255,255,0.85)"
                      rx={2 * scale}
                      stroke="#90CAF9"
                      strokeWidth={0.5 * scale}
                    />
                    <text
                      x={sash.x + sash.w / 2}
                      y={sash.y + sash.h / 2 + 2 * scale}
                      textAnchor="middle"
                      fontSize={5 * scale}
                      fill="#1565C0"
                      fontWeight="600"
                    >
                      {glassType}
                    </text>
                  </g>
                )}

                {/* BAGHETE / Glazing beads */}
                <rect
                  x={sash.x + glassGap + 2 * scale}
                  y={sash.y + glassGap + 2 * scale}
                  width={sash.w - glassGap * 2 - 4 * scale}
                  height={sash.h - glassGap * 2 - 4 * scale}
                  fill="none"
                  stroke={hoveredComponent === "baghete" ? "#3B82F6" : "#94A3B8"}
                  strokeWidth={hoveredComponent === "baghete" ? 2 : 1}
                  onClick={(e) => { e.stopPropagation(); onComponentClick?.("baghete"); }}
                  onMouseEnter={() => handleComponentHover("baghete")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* Muntin orizontal */}
                {horizontalMuntin && (
                  <g>
                    <rect
                      x={sash.x + glassGap + 2 * scale}
                      y={sash.y + sash.h / 2 - 1.5 * scale}
                      width={sash.w - glassGap * 2 - 4 * scale}
                      height={3 * scale}
                      fill="#6B7280"
                    />
                  </g>
                )}

                {/* BALAMALE / Hinges */}
                {sash.side && sash.side !== "none" && (
                  <g 
                    onClick={(e) => { e.stopPropagation(); onComponentClick?.("balamale"); }} 
                    onMouseEnter={() => handleComponentHover("balamale")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={sash.x - sashThickness + 1 * scale}
                      y={sash.y + sash.h * 0.12}
                      width={5 * scale}
                      height={10 * scale}
                      rx={1 * scale}
                      fill={hoveredComponent === "balamale" ? "#3B82F6" : "#9CA3AF"}
                      stroke={hoveredComponent === "balamale" ? "#1D4ED8" : "#6B7280"}
                      strokeWidth={hoveredComponent === "balamale" ? 0.8 : 0.4}
                    />
                    <rect
                      x={sash.x - sashThickness + 1 * scale}
                      y={sash.y + sash.h * 0.75}
                      width={5 * scale}
                      height={10 * scale}
                      rx={1 * scale}
                      fill={hoveredComponent === "balamale" ? "#3B82F6" : "#9CA3AF"}
                      stroke={hoveredComponent === "balamale" ? "#1D4ED8" : "#6B7280"}
                      strokeWidth={hoveredComponent === "balamale" ? 0.8 : 0.4}
                    />
                  </g>
                )}

                {/* MANER / Handle */}
                {sash.side && sash.side !== "none" && renderHandle(sash, idx)}

                {/* BOLTURI / Bolts */}
                {sash.side && sash.side !== "none" && renderBolts(sash, idx)}
              </g>
            ))}

            {/* PRAG / Threshold */}
            {(showThreshold || config.isDoor) && (
              <g 
                onClick={(e) => { e.stopPropagation(); onComponentClick?.("prag"); }} 
                onMouseEnter={() => handleComponentHover("prag")}
                onMouseLeave={() => handleComponentHover(null)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={tocThickness - 1 * scale}
                  y={h - 5 * scale}
                  width={w - tocThickness * 2 + 2 * scale}
                  height={5 * scale}
                  fill={hoveredComponent === "prag" ? "#3B82F6" : "#374151"}
                  stroke={hoveredComponent === "prag" ? "#1D4ED8" : "#1F2937"}
                  strokeWidth={hoveredComponent === "prag" ? 0.8 : 0.4}
                  rx={0.5 * scale}
                />
              </g>
            )}

            {/* LINII TEHNICE DE DESCHIDERE */}
            {config.sashes.map((sash, idx) => renderOpeningLines(sash, idx))}

            {/* STULP / MONTANT */}
            {config.sashes.length === 2 && sashConfiguration && (
              <g>
                {sashConfiguration === "stulp" ? (
                  <g 
                    onClick={(e) => { e.stopPropagation(); onComponentClick?.("stulp"); }} 
                    onMouseEnter={() => handleComponentHover("stulp")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={w / 2 - 2.5 * scale} y={tocThickness} width={5 * scale} height={h - tocThickness * 2} fill={hoveredComponent === "stulp" ? "#3B82F6" : "#6B7280"} stroke={hoveredComponent === "stulp" ? "#1D4ED8" : "#4B5563"} strokeWidth={0.5} />
                    <text x={w / 2} y={tocThickness + 10 * scale} textAnchor="middle" fontSize={4 * scale} fill="white" fontWeight="bold">STULP</text>
                    <circle cx={w / 2} cy={h - tocThickness - 6 * scale} r={2.5 * scale} fill={hoveredComponent === "stulp" ? "#60A5FA" : "#9CA3AF"} />
                  </g>
                ) : (
                  <g 
                    onClick={(e) => { e.stopPropagation(); onComponentClick?.("montant"); }} 
                    onMouseEnter={() => handleComponentHover("montant")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={w / 2 - 3 * scale} y={tocThickness} width={6 * scale} height={h - tocThickness * 2} fill={hoveredComponent === "montant" ? "#3B82F6" : "#4B5563"} stroke={hoveredComponent === "montant" ? "#1D4ED8" : "#374151"} strokeWidth={0.8} />
                    <rect x={w / 2 - 1.5 * scale} y={tocThickness + 1.5 * scale} width={3 * scale} height={h - tocThickness * 2 - 3 * scale} fill={hoveredComponent === "montant" ? "#60A5FA" : "#6B7280"} />
                    <text x={w / 2} y={tocThickness + 10 * scale} textAnchor="middle" fontSize={4 * scale} fill="white" fontWeight="bold">MONTANT</text>
                    <circle cx={w / 2} cy={h - tocThickness - 6 * scale} r={2.5 * scale} fill={hoveredComponent === "montant" ? "#60A5FA" : "#9CA3AF"} />
                  </g>
                )}
              </g>
            )}

            {/* GLAF EXTERIOR / Drip cap */}
            <g 
              onClick={(e) => { e.stopPropagation(); onComponentClick?.("glaf"); }} 
              onMouseEnter={() => handleComponentHover("glaf")}
              onMouseLeave={() => handleComponentHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect x={w - 6 * scale} y={-2 * scale} width={6 * scale} height={tocThickness - 2 * scale} fill={hoveredComponent === "glaf" ? "#3B82F6" : "#374151"} rx={0.5 * scale} />
            </g>

            {/* COTE / Dimension lines */}
            {showDimensions && (
              <>
                {/* Latime - deasupra */}
                <line x1={0} y1={-18 * scale} x2={w} y2={-18 * scale} stroke="#1e293b" strokeWidth={2 * scale} strokeLinecap="round" />
                <line x1={0} y1={-24 * scale} x2={0} y2={-12 * scale} stroke="#1e293b" strokeWidth={2 * scale} strokeLinecap="round" />
                <line x1={w} y1={-24 * scale} x2={w} y2={-12 * scale} stroke="#1e293b" strokeWidth={2 * scale} strokeLinecap="round" />
                <polygon points={`${-7 * scale},${-18 * scale} ${7 * scale},${-18 * scale} ${0},${-26 * scale}`} fill="#1e293b" />
                <polygon points={`${w - 7 * scale},${-18 * scale} ${w + 7 * scale},${-18 * scale} ${w},${-26 * scale}`} fill="#1e293b" />
                <text x={w / 2} y={-30 * scale} textAnchor="middle" fontSize={12 * scale} fill="#1e293b" fontWeight="700">{width} mm</text>

                {/* Inaltime - in stanga */}
                <line x1={-18 * scale} y1={0} x2={-18 * scale} y2={h} stroke="#1e293b" strokeWidth={2 * scale} strokeLinecap="round" />
                <line x1={-24 * scale} y1={0} x2={-12 * scale} y2={0} stroke="#1e293b" strokeWidth={2 * scale} strokeLinecap="round" />
                <line x1={-24 * scale} y1={h} x2={-12 * scale} y2={h} stroke="#1e293b" strokeWidth={2 * scale} strokeLinecap="round" />
                <polygon points={`${-18 * scale},${-7 * scale} ${-18 * scale},${7 * scale} ${-26 * scale},${0}`} fill="#1e293b" />
                <polygon points={`${-18 * scale},${h - 7 * scale} ${-18 * scale},${h + 7 * scale} ${-26 * scale},${h}`} fill="#1e293b" />
                <text x={-32 * scale} y={h / 2} textAnchor="middle" fontSize={12 * scale} fill="#1e293b" fontWeight="700" transform={`rotate(-90, ${-32 * scale}, ${h / 2})`}>{height} mm</text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Legend - Compact */}
      <div className="px-2 py-1 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10px] flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ background: `linear-gradient(180deg, ${_frameColorInterior} 0%, ${_frameColorExterior} 100%)` }}></div>
          <span className="text-slate-600">Toc</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#E3F2FD', border: '1px solid #90CAF9' }}></div>
          <span className="text-slate-600">Sticlă</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-slate-400"></div>
          <span className="text-slate-600">Maner</span>
        </div>
        <div className="ml-auto text-primary-600">
          <span className="font-medium">{hoveredComponent ? `${COMPONENT_LABELS[hoveredComponent]} selectat` : 'Click pe elemente'}</span>
        </div>
      </div>
    </div>
  );
}