"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductType, Color, OpeningType } from "@/types";
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

const HARDWARE_HANDLE_COLORS: Record<string, string> = {
  siegenia: "#A0A0A0",
  gu: "#A0A0A0",
  maco: "#B8B8B8",
  roto: "#888888",
  hoppe: "#C0C0C0",
  axor: "#A0A0A0",
  vhs: "#909090",
  winkhaus: "#989898",
};

const HARDWARE_HANDLE_COLORS_DARK: Record<string, string> = {
  siegenia: "#505050",
  gu: "#505050",
  maco: "#606060",
  roto: "#404040",
  hoppe: "#606060",
  axor: "#505050",
  vhs: "#505050",
  winkhaus: "#505050",
};

interface Window2DProps {
  productType: ProductType;
  width: number;
  height: number;
  interiorColor: Color | null;
  exteriorColor: Color | null;
  openingSide?: "left" | "right";
  openingDirection?: "inward" | "outward";
  sashConfiguration?: "stulp" | "montant";
  sashRoles?: Record<string, SashRole>;
  sashOpeningTypes?: Record<string, OpeningType>;
  handleHeight?: number;
  showThreshold?: boolean;
  horizontalMuntin?: boolean;
  showDimensions?: boolean;
  className?: string;
  onComponentClick?: (component: WindowComponent) => void;
  glassType?: string;
  hardwareBrand?: string;
}

export default function Window2D({
  productType,
  width,
  height,
  interiorColor,
  exteriorColor,
  openingSide = "right",
  openingDirection = "inward",
  sashConfiguration,
  sashRoles = {},
  sashOpeningTypes = {},
  handleHeight,
  showThreshold = false,
  horizontalMuntin = false,
  showDimensions = true,
  className,
  onComponentClick,
  glassType,
  hardwareBrand,
}: Window2DProps) {
  const [hoveredComponent, setHoveredComponent] = useState<WindowComponent | null>(null);

  const getTocColor = () => {
    if (interiorColor && COLOR_MAP[interiorColor]) {
      return COLOR_MAP[interiorColor];
    }
    return "#F8F9FA";
  };

  const getTocStrokeColor = () => {
    if (exteriorColor && COLOR_MAP[exteriorColor]) {
      return COLOR_MAP[exteriorColor];
    }
    return "#E9ECEF";
  };

  const getHandleColor = () => {
    if (!hardwareBrand) return "#9CA3AF";
    if (HARDWARE_HANDLE_COLORS_DARK[hardwareBrand]) {
      return HARDWARE_HANDLE_COLORS_DARK[hardwareBrand];
    }
    return "#9CA3AF";
  };

  const getHandleAccentColor = () => {
    if (!hardwareBrand) return "#D1D5DB";
    if (HARDWARE_HANDLE_COLORS[hardwareBrand]) {
      return HARDWARE_HANDLE_COLORS[hardwareBrand];
    }
    return "#D1D5DB";
  };

  const tocColor = getTocColor();
  const tocStrokeColor = getTocStrokeColor();
  const handleColor = getHandleColor();
  const handleAccentColor = getHandleAccentColor();

  // FIXED s - all internal proportions use this constant
  // Container CSS controls visual size, not this s
  const s = 0.5;

  const w = width * s;
  const h = height * s;

  // GROSIME MĂRITĂ pentru toc și cercevea - stil CAD foarte pronunțat
  const tocThickness = 55 * s;  // foarte gros - stil CAD, ușor de clic
  const sashThickness = 28 * s; // foarte gros - stil CAD
  const glassGap = 6 * s; // spațiu mai mare pentru sticlă

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
            { x: tocThickness, y: tocThickness, w: (w - tocThickness * 2 - 4 * s) / 2, h: h - tocThickness * 2, side: "left" as const },
            { x: tocThickness + (w - tocThickness * 2) / 2 + 2 * s, y: tocThickness, w: (w - tocThickness * 2 - 4 * s) / 2, h: h - tocThickness * 2, side: "right" as const },
          ],
          isDoor: false,
        };
      case "window_3_canate":
        return {
          type: "3 canate",
          sashes: [
            { x: tocThickness, y: tocThickness, w: (w - tocThickness * 2 - 6 * s) / 3, h: h - tocThickness * 2, side: "left" as const },
            { x: tocThickness + (w - tocThickness * 2) / 3 + 2 * s, y: tocThickness, w: (w - tocThickness * 2 - 6 * s) / 3, h: h - tocThickness * 2, side: "center" as const },
            { x: tocThickness + (w - tocThickness * 2) * 2 / 3 + 4 * s, y: tocThickness, w: (w - tocThickness * 2 - 6 * s) / 3, h: h - tocThickness * 2, side: "right" as const },
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
            { x: tocThickness, y: tocThickness, w: (w - tocThickness * 2 - 4 * s) / 2, h: h - tocThickness * 2, side: "left" as const },
            { x: tocThickness + (w - tocThickness * 2) / 2 + 2 * s, y: tocThickness, w: (w - tocThickness * 2 - 4 * s) / 2, h: h - tocThickness * 2, side: "right" as const },
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
  }, [productType, w, h, s, tocThickness, openingSide]);

  const margin = Math.max(6, 14 * s);
  const svgWidth = w + margin * 2;
  const svgHeight = h + margin * 2;

  const handleX = (sash: typeof config.sashes[0]) => {
    if (sash.side === "none" || sash.side === "center" || !sash.side) return sash.x + sash.w / 2;
    return sash.side === "right" ? sash.x + sash.w - 8 * s : sash.x + 8 * s;
  };
  
  const handleYFromBottom = (sash: typeof config.sashes[0]) => {
    const minHandleY = 30 * s;
    const maxHandleY = sash.h - 30 * s;
    if (!handleHeight) return sash.y + sash.h / 2;
    const requestedY = handleHeight * s;
    const clampedY = Math.max(minHandleY, Math.min(requestedY, maxHandleY));
    return sash.y + sash.h - clampedY;
  };

  const renderOpeningLines = (sash: typeof config.sashes[0], idx: number) => {
    if (sash.side === "none" || sash.side === "center") return null;

    const sashKey = sash.side || String(idx);
    const sashRole = sashRoles[sashKey] || 
      ((sash.side === openingSide) || (config.sashes.length === 1) ? "active" : "inactive");

    const sashOpeningType = sashOpeningTypes[sashKey] || "normal";
    const isOscilobatant = sashOpeningType === "oscilobatant";

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

    if (sashRole === "fixed") {
      return (
        <g key={`fixed-${idx}`} opacity={0.95}>
          <line x1={leftX} y1={topY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={1.5 * s} opacity={0.6} />
          <line x1={rightX} y1={topY} x2={leftX} y2={bottomY} stroke={lineColor} strokeWidth={1.5 * s} opacity={0.6} />
          <circle cx={centerX} cy={centerY} r={4 * s} fill="none" stroke={lineColor} strokeWidth={1.5 * s} opacity={0.6} />
          <text x={centerX} y={topY - 8 * s} textAnchor="middle" fontSize={5 * s} fill={lineColor} fontWeight="bold">FIX</text>
        </g>
      );
    }

    if (sashRole === "inactive") {
      return (
        <g key={`inactive-${idx}`} opacity={0.9}>
          <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={2 * s} strokeDasharray={`${4 * s} ${3 * s}`} />
          <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={2 * s} strokeDasharray={`${4 * s} ${3 * s}`} />
          <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2.5 * s} opacity={0.7} strokeDasharray={`${4 * s} ${3 * s}`} />
          <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2.5 * s} strokeDasharray={`${4 * s} ${3 * s}`} />
          <circle cx={hingeX} cy={topY} r={3 * s} fill={lineColor} stroke="white" strokeWidth={0.8 * s} />
          <circle cx={hingeX} cy={bottomY} r={3 * s} fill={lineColor} stroke="white" strokeWidth={0.8 * s} />
          <circle cx={centerX} cy={centerY} r={4.5 * s} fill="#F59E0B" stroke="white" strokeWidth={0.8 * s} />
          <text x={centerX - 3 * s} y={centerY + 1.5 * s} textAnchor="middle" fontSize={7 * s} fill="white" fontWeight="bold">+</text>
          <text x={centerX} y={topY - 8 * s} textAnchor="middle" fontSize={5 * s} fill="#F59E0B" fontWeight="bold">INACTIV</text>
        </g>
      );
    }

    if (isOscilobatant) {
      return (
        <g key={`oscilo-${idx}`} opacity={0.95}>
          <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={2 * s} />
          <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={2 * s} />
          <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2.5 * s} opacity={0.7} />
          <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2.5 * s} />
          <line x1={leftX} y1={bottomY} x2={centerX} y2={topY} stroke="#8B5CF6" strokeWidth={3 * s} />
          <line x1={rightX} y1={bottomY} x2={centerX} y2={topY} stroke="#8B5CF6" strokeWidth={3 * s} />
          <circle cx={hingeX} cy={topY} r={2 * s} fill={lineColor} stroke="white" strokeWidth={0.5 * s} />
          <circle cx={hingeX} cy={bottomY} r={2 * s} fill={lineColor} stroke="white" strokeWidth={0.5 * s} />
          <circle cx={centerX} cy={topY} r={2.5 * s} fill="#8B5CF6" stroke="white" strokeWidth={0.5 * s} />
          <text x={centerX} y={topY - 6 * s} textAnchor="middle" fontSize={4 * s} fill="#8B5CF6" fontWeight="bold">OSCILO</text>
        </g>
      );
    }
    
    return (
      <g key={`normal-${idx}`} opacity={0.95}>
        <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={2 * s} />
        <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={2 * s} />
        <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2.5 * s} opacity={0.7} />
        <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2.5 * s} />
        <circle cx={hingeX} cy={topY} r={3 * s} fill={lineColor} stroke="white" strokeWidth={0.8 * s} />
        <circle cx={hingeX} cy={bottomY} r={3 * s} fill={lineColor} stroke="white" strokeWidth={0.8 * s} />
        <circle cx={hingeX} cy={centerY} r={3 * s} fill={lineColor} stroke="white" strokeWidth={0.8 * s} />
        <circle cx={handleXPos} cy={centerY} r={3 * s} fill={secondaryColor} stroke="white" strokeWidth={0.8 * s} />
        <text x={centerX} y={topY - 8 * s} textAnchor="middle" fontSize={5 * s} fill={secondaryColor} fontWeight="bold">MANER</text>
        <text x={hingeX} y={bottomY + 10 * s} textAnchor={isLeft ? "start" : "end"} fontSize={4 * s} fill={lineColor} fontWeight="600">BALAMA</text>
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

    const boltX = isLeftSash ? sash.x + sash.w - 5 * s : sash.x + 3 * s;
    
    return (
      <g key={`bolts-${idx}`} opacity={0.7}>
        <rect x={boltX} y={sash.y + sash.h * 0.15} width={6 * s} height={3 * s} rx={1 * s} fill="#6B7280" />
        <rect x={boltX} y={sash.y + sash.h * 0.85 - 3 * s} width={6 * s} height={3 * s} rx={1 * s} fill="#6B7280" />
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
    const handleW = 8 * s;
    const handleH = 16 * s;

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
          rx={2 * s}
          fill={hoveredComponent === "maner" ? handleColor : handleAccentColor}
          stroke={hoveredComponent === "maner" ? "#1D4ED8" : handleColor}
          strokeWidth={hoveredComponent === "maner" ? 1 : 0.5}
        />
        <rect
          x={hx - handleW / 2 + 1.5 * s}
          y={hy - handleH / 2 + 1.5 * s}
          width={handleW - 3 * s}
          height={handleH - 3 * s}
          rx={1.5 * s}
          fill={hoveredComponent === "maner" ? "#60A5FA" : "#E5E7EB"}
          stroke="#FFFFFF"
          strokeWidth={0.3 * s}
        />
      </g>
    );
  };

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden", className)}>
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
              <stop offset="0%" stopColor={tocColor} />
              <stop offset="50%" stopColor={tocColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={tocStrokeColor} />
            </linearGradient>
            <linearGradient id="sashGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={tocColor} stopOpacity="0.98" />
              <stop offset="100%" stopColor={tocStrokeColor} />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin}, ${margin})`}>
            {/* ZIDARIA / BRICKMOLD - exterior outline */}
            <rect
              x={-4 * s}
              y={-4 * s}
              width={w + 8 * s}
              height={h + 8 * s}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={2 * s}
              strokeDasharray={`${6 * s} ${3 * s}`}
            />

            {/* TOC EXTERIOR - Rama principala - STIL CAD */}
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="url(#frameGradient)"
              stroke={hoveredComponent === "toc" ? "#2563EB" : tocStrokeColor}
              strokeWidth={hoveredComponent === "toc" ? 4 * s : 3 * s}
              onClick={(e) => { e.stopPropagation(); onComponentClick?.("toc"); }}
              onMouseEnter={() => handleComponentHover("toc")}
              onMouseLeave={() => handleComponentHover(null)}
              style={{ cursor: "pointer" }}
            />

            {/* TOC INTERIOR - Linie de contur interioara - CAD stil */}
            <rect
              x={tocThickness - 1 * s}
              y={tocThickness - 1 * s}
              width={w - (tocThickness - 1 * s) * 2}
              height={h - (tocThickness - 1 * s) * 2}
              fill="none"
              stroke="#64748B"
              strokeWidth={1.5 * s}
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
                  fill="url(#sashGradient)"
                  stroke={hoveredComponent === "canat" ? "#2563EB" : tocStrokeColor}
                  strokeWidth={hoveredComponent === "canat" ? 3 * s : 2 * s}
                  onClick={(e) => { e.stopPropagation(); onComponentClick?.("canat"); }}
                  onMouseEnter={() => handleComponentHover("canat")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* CERCEVEA INTERIOARA - linie de contur */}
                <rect
                  x={sash.x - sashThickness + 1.5 * s}
                  y={sash.y - sashThickness + 1.5 * s}
                  width={sash.w + sashThickness * 2 - 3 * s}
                  height={sash.h + sashThickness * 2 - 3 * s}
                  fill="none"
                  stroke="#ADB5BD"
                  strokeWidth={0.6 * s}
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
                {glassType && sash.w > 80 * s && (
                  <g>
                    <rect
                      x={sash.x + sash.w / 2 - 20 * s}
                      y={sash.y + sash.h / 2 - 6 * s}
                      width={40 * s}
                      height={12 * s}
                      fill="rgba(255,255,255,0.85)"
                      rx={2 * s}
                      stroke="#90CAF9"
                      strokeWidth={0.5 * s}
                    />
                    <text
                      x={sash.x + sash.w / 2}
                      y={sash.y + sash.h / 2 + 2 * s}
                      textAnchor="middle"
                      fontSize={5 * s}
                      fill="#1565C0"
                      fontWeight="600"
                    >
                      {glassType}
                    </text>
                  </g>
                )}

                {/* BAGHETE / Glazing beads */}
                <rect
                  x={sash.x + glassGap + 2 * s}
                  y={sash.y + glassGap + 2 * s}
                  width={sash.w - glassGap * 2 - 4 * s}
                  height={sash.h - glassGap * 2 - 4 * s}
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
                      x={sash.x + glassGap + 2 * s}
                      y={sash.y + sash.h / 2 - 1.5 * s}
                      width={sash.w - glassGap * 2 - 4 * s}
                      height={3 * s}
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
                      x={sash.x - sashThickness + 1 * s}
                      y={sash.y + sash.h * 0.12}
                      width={5 * s}
                      height={10 * s}
                      rx={1 * s}
                      fill={hoveredComponent === "balamale" ? "#3B82F6" : "#9CA3AF"}
                      stroke={hoveredComponent === "balamale" ? "#1D4ED8" : "#6B7280"}
                      strokeWidth={hoveredComponent === "balamale" ? 0.8 : 0.4}
                    />
                    <rect
                      x={sash.x - sashThickness + 1 * s}
                      y={sash.y + sash.h * 0.75}
                      width={5 * s}
                      height={10 * s}
                      rx={1 * s}
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
                  x={tocThickness - 1 * s}
                  y={h - 5 * s}
                  width={w - tocThickness * 2 + 2 * s}
                  height={5 * s}
                  fill={hoveredComponent === "prag" ? "#3B82F6" : "#374151"}
                  stroke={hoveredComponent === "prag" ? "#1D4ED8" : "#1F2937"}
                  strokeWidth={hoveredComponent === "prag" ? 0.8 : 0.4}
                  rx={0.5 * s}
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
                    <rect x={w / 2 - 2.5 * s} y={tocThickness} width={5 * s} height={h - tocThickness * 2} fill={hoveredComponent === "stulp" ? "#3B82F6" : "#6B7280"} stroke={hoveredComponent === "stulp" ? "#1D4ED8" : "#4B5563"} strokeWidth={0.5} />
                    <text x={w / 2} y={tocThickness + 10 * s} textAnchor="middle" fontSize={4 * s} fill="white" fontWeight="bold">STULP</text>
                    <circle cx={w / 2} cy={h - tocThickness - 6 * s} r={2.5 * s} fill={hoveredComponent === "stulp" ? "#60A5FA" : "#9CA3AF"} />
                  </g>
                ) : (
                  <g 
                    onClick={(e) => { e.stopPropagation(); onComponentClick?.("montant"); }} 
                    onMouseEnter={() => handleComponentHover("montant")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={w / 2 - 3 * s} y={tocThickness} width={6 * s} height={h - tocThickness * 2} fill={hoveredComponent === "montant" ? "#3B82F6" : "#4B5563"} stroke={hoveredComponent === "montant" ? "#1D4ED8" : "#374151"} strokeWidth={0.8} />
                    <rect x={w / 2 - 1.5 * s} y={tocThickness + 1.5 * s} width={3 * s} height={h - tocThickness * 2 - 3 * s} fill={hoveredComponent === "montant" ? "#60A5FA" : "#6B7280"} />
                    <text x={w / 2} y={tocThickness + 10 * s} textAnchor="middle" fontSize={4 * s} fill="white" fontWeight="bold">MONTANT</text>
                    <circle cx={w / 2} cy={h - tocThickness - 6 * s} r={2.5 * s} fill={hoveredComponent === "montant" ? "#60A5FA" : "#9CA3AF"} />
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
              <rect x={w - 6 * s} y={-2 * s} width={6 * s} height={tocThickness - 2 * s} fill={hoveredComponent === "glaf" ? "#3B82F6" : "#374151"} rx={0.5 * s} />
            </g>

            {/* COTE / Dimension lines */}
            {showDimensions && (
              <>
                {/* Latime - deasupra */}
                <line x1={0} y1={-10 * s} x2={w} y2={-10 * s} stroke="#1e293b" strokeWidth={2 * s} strokeLinecap="round" />
                <line x1={0} y1={-14 * s} x2={0} y2={-6 * s} stroke="#1e293b" strokeWidth={2 * s} strokeLinecap="round" />
                <line x1={w} y1={-14 * s} x2={w} y2={-6 * s} stroke="#1e293b" strokeWidth={2 * s} strokeLinecap="round" />
                <polygon points={`${-4 * s},${-10 * s} ${4 * s},${-10 * s} ${0},${-15 * s}`} fill="#1e293b" />
                <polygon points={`${w - 4 * s},${-10 * s} ${w + 4 * s},${-10 * s} ${w},${-15 * s}`} fill="#1e293b" />
                <text x={w / 2} y={-19 * s} textAnchor="middle" fontSize={12 * s} fill="#1e293b" fontWeight="700">{width} mm</text>

                {/* Inaltime - in stanga */}
                <line x1={-10 * s} y1={0} x2={-10 * s} y2={h} stroke="#1e293b" strokeWidth={2 * s} strokeLinecap="round" />
                <line x1={-14 * s} y1={0} x2={-6 * s} y2={0} stroke="#1e293b" strokeWidth={2 * s} strokeLinecap="round" />
                <line x1={-14 * s} y1={h} x2={-6 * s} y2={h} stroke="#1e293b" strokeWidth={2 * s} strokeLinecap="round" />
                <polygon points={`${-10 * s},${-4 * s} ${-10 * s},${4 * s} ${-15 * s},${0}`} fill="#1e293b" />
                <polygon points={`${-10 * s},${h - 4 * s} ${-10 * s},${h + 4 * s} ${-15 * s},${h}`} fill="#1e293b" />
                <text x={-19 * s} y={h / 2} textAnchor="middle" fontSize={12 * s} fill="#1e293b" fontWeight="700" transform={`rotate(-90, ${-19 * s}, ${h / 2})`}>{height} mm</text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Legend - Compact */}
      <div className="px-2 py-1 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10px] flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ background: `linear-gradient(180deg, ${tocColor} 0%, ${tocStrokeColor} 100%)` }}></div>
          <span className="text-slate-600">Toc</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#E3F2FD', border: '1px solid #90CAF9' }}></div>
          <span className="text-slate-600">Sticlă</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: handleColor }}></div>
          <span className="text-slate-600">Maner</span>
        </div>
        <div className="ml-auto text-primary-600">
          <span className="font-medium">{hoveredComponent ? `${COMPONENT_LABELS[hoveredComponent]} selectat` : 'Click pe elemente'}</span>
        </div>
      </div>
    </div>
  );
}