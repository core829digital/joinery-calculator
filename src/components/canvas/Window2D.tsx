"use client";

import { useMemo, useState } from "react";
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
  scale = 0.35,
  className,
  onComponentClick,
}: Window2DProps) {
  const [hoveredComponent, setHoveredComponent] = useState<WindowComponent | null>(null);

  const interiorHex = interiorColor && COLOR_MAP[interiorColor] ? COLOR_MAP[interiorColor] : "#F5F5F0";
  const exteriorHex = exteriorColor && COLOR_MAP[exteriorColor] ? COLOR_MAP[exteriorColor] : "#F5F5F0";

  const w = width * scale;
  const h = height * scale;

  const frameThickness = 12 * scale;
  const sashProfile = 10 * scale;
  const glassGap = 4 * scale;

  const handleComponentHover = (component: WindowComponent | null) => {
    setHoveredComponent(component);
  };

  const config = useMemo(() => {
    switch (productType) {
      case "window_1_canat":
        return {
          type: "1 canat",
          sashes: [{ x: frameThickness, y: frameThickness, w: w - frameThickness * 2, h: h - frameThickness * 2, side: openingSide as "left" | "right" | "none" }],
          isDoor: false,
        };
      case "window_2_canate":
        return {
          type: "2 canate",
          sashes: [
            { x: frameThickness, y: frameThickness, w: (w - frameThickness * 2 - 4 * scale) / 2, h: h - frameThickness * 2, side: "left" as const },
            { x: frameThickness + (w - frameThickness * 2) / 2 + 2 * scale, y: frameThickness, w: (w - frameThickness * 2 - 4 * scale) / 2, h: h - frameThickness * 2, side: "right" as const },
          ],
          isDoor: false,
        };
      case "window_3_canate":
        return {
          type: "3 canate",
          sashes: [
            { x: frameThickness, y: frameThickness, w: (w - frameThickness * 2 - 6 * scale) / 3, h: h - frameThickness * 2, side: "left" as const },
            { x: frameThickness + (w - frameThickness * 2) / 3 + 2 * scale, y: frameThickness, w: (w - frameThickness * 2 - 6 * scale) / 3, h: h - frameThickness * 2, side: "center" as const },
            { x: frameThickness + (w - frameThickness * 2) * 2 / 3 + 4 * scale, y: frameThickness, w: (w - frameThickness * 2 - 6 * scale) / 3, h: h - frameThickness * 2, side: "right" as const },
          ],
          isDoor: false,
        };
      case "window_fix":
        return {
          type: "fereastră fixă",
          sashes: [{ x: frameThickness, y: frameThickness, w: w - frameThickness * 2, h: h - frameThickness * 2, side: "none" as const }],
          isDoor: false,
        };
      case "usa_balcon_1":
      case "usa_intrare_pvc":
      case "usa_intrare_aluminiu":
        return {
          type: "ușă 1 canat",
          sashes: [{ x: frameThickness, y: frameThickness, w: w - frameThickness * 2, h: h - frameThickness * 2, side: openingSide as "left" | "right" }],
          isDoor: true,
        };
      case "usa_balcon_2":
        return {
          type: "ușă 2 canate",
          sashes: [
            { x: frameThickness, y: frameThickness, w: (w - frameThickness * 2 - 4 * scale) / 2, h: h - frameThickness * 2, side: "left" as const },
            { x: frameThickness + (w - frameThickness * 2) / 2 + 2 * scale, y: frameThickness, w: (w - frameThickness * 2 - 4 * scale) / 2, h: h - frameThickness * 2, side: "right" as const },
          ],
          isDoor: true,
        };
      default:
        return {
          type: "1 canat",
          sashes: [{ x: frameThickness, y: frameThickness, w: w - frameThickness * 2, h: h - frameThickness * 2, side: openingSide as "left" | "right" }],
          isDoor: false,
        };
    }
  }, [productType, w, h, scale, frameThickness, openingSide]);

  const svgWidth = w + 80;
  const svgHeight = h + 80;

  const handleX = (sash: typeof config.sashes[0]) => {
    if (sash.side === "none" || sash.side === "center" || !sash.side) return sash.x + sash.w / 2;
    // Mânerul este pe partea de deschidere (marginea opusă balamalelor - farX)
    return sash.side === "right" ? sash.x + sash.w - 8 * scale : sash.x + 8 * scale;
  };
  
  const handleYFromBottom = (sash: typeof config.sashes[0]) => {
    // Înălțimea manerului de la baza canatului
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

    if (sashRole === "inactive") {
      const isInward = openingDirection === "inward";
      const strokeStyle = isInward 
        ? { strokeDasharray: undefined } 
        : { strokeDasharray: `${4 * scale} ${3 * scale}` };
      const lineColor = isInward ? "#1E40AF" : "#EA580C";
      const secondaryColor = isInward ? "#3B82F6" : "#F97316";
      
      const isLeftSash = sash.side === "left";
      const topY = sash.y;
      const bottomY = sash.y + sash.h;
      const leftX = sash.x;
      const rightX = sash.x + sash.w;
      const centerY = sash.y + sash.h / 2;
      const centerX = sash.x + sash.w / 2;
      
      // Balamale la EXTERIOR (margine), Leva la INTERIOR (centru)
      const hingeX = isLeftSash ? leftX : rightX;
      const farX = isLeftSash ? rightX : leftX; // Marginea opusa balamalelor
      
      return (
        <g key={`inactive-${idx}`} opacity={0.7}>
          {/* Linii pe tot canatul */}
          <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={1.2 * scale} {...strokeStyle} />
          <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={1.2 * scale} {...strokeStyle} />
          <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2 * scale} opacity={0.7} {...strokeStyle} />
          {/* TRIUNGHI: de la balamale (hingeX) la marginea opusa (farX) */}
          <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2 * scale} />
          {/* Linii diagonale de la balamale la marginea opusa */}
          <line x1={hingeX} y1={topY} x2={farX} y2={centerY} stroke={lineColor} strokeWidth={1.5 * scale} opacity={0.6} />
          <line x1={hingeX} y1={bottomY} x2={farX} y2={centerY} stroke={lineColor} strokeWidth={1.5 * scale} opacity={0.6} />
          {/* Puncte balamale */}
          <circle cx={hingeX} cy={topY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={hingeX} cy={bottomY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={hingeX} cy={centerY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          {/* Punct levera la centru */}
          <circle cx={centerX} cy={centerY} r={2.5 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.8 * scale} />
          {/* LEVA - la centrul canatului - mai mica pentru a nu bloca */}
          <rect x={centerX - 3 * scale} y={centerY - 6 * scale} width={6 * scale} height={12 * scale} rx={1.5 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.5 * scale} />
          <circle cx={centerX} cy={centerY} r={2 * scale} fill="white" opacity={0.8} />
          <text x={centerX} y={topY - 8 * scale} textAnchor="middle" fontSize={5 * scale} fill={secondaryColor} fontWeight="bold">INACTIV</text>
          <text x={hingeX} y={bottomY + 10 * scale} textAnchor={isLeftSash ? "start" : "end"} fontSize={4 * scale} fill={lineColor}>BALAMA</text>
        </g>
      );
    }

    const isLeft = sash.side === "left";
    const isInward = openingDirection === "inward";
    
    const strokeStyle = isInward 
      ? { strokeDasharray: undefined } 
      : { strokeDasharray: `${4 * scale} ${3 * scale}` };
    
    const lineColor = isInward ? "#1E40AF" : "#EA580C";
    const secondaryColor = isInward ? "#3B82F6" : "#F97316";
    const tiltColor = "#8B5CF6";

    const topY = sash.y;
    const bottomY = sash.y + sash.h;
    const leftX = sash.x;
    const rightX = sash.x + sash.w;
    const centerX = sash.x + sash.w / 2;
    const centerY = sash.y + sash.h / 2;
    
    const hingeX = isLeft ? leftX : rightX;
    // Mânerul este la INTERIOR (centru) - unde se întâlnesc canaturile
    const handleX = centerX;

    // Marginea opusa balamalelor pentru triunghi complet
    const farX = isLeft ? rightX : leftX;
    
    if (openingType === "oscilobativ") {
      return (
        <g key={`oscilo-${idx}`} opacity={0.95}>
          <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={1.2 * scale} {...strokeStyle} />
          <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={1.2 * scale} {...strokeStyle} />
          <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2 * scale} opacity={0.7} {...strokeStyle} />
          
          {/* TRIUNGHI: de la balamale la marginea opusa */}
          <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2 * scale} />
          <line x1={hingeX} y1={topY} x2={farX} y2={centerY} stroke={lineColor} strokeWidth={1.5 * scale} opacity={0.6} />
          <line x1={hingeX} y1={bottomY} x2={farX} y2={centerY} stroke={lineColor} strokeWidth={1.5 * scale} opacity={0.6} />
          
          {/* Linii oscilobativ specifice */}
          <line x1={leftX} y1={bottomY} x2={centerX} y2={topY} stroke={tiltColor} strokeWidth={2.5 * scale} />
          <line x1={rightX} y1={bottomY} x2={centerX} y2={topY} stroke={tiltColor} strokeWidth={2.5 * scale} />
          
          <circle cx={hingeX} cy={topY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={hingeX} cy={bottomY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={centerX} cy={topY} r={3 * scale} fill={tiltColor} stroke="white" strokeWidth={1 * scale} />
          <circle cx={leftX} cy={bottomY} r={2 * scale} fill={tiltColor} />
          <circle cx={rightX} cy={bottomY} r={2 * scale} fill={tiltColor} />
          
          <circle cx={hingeX} cy={centerY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={handleX} cy={centerY} r={2.5 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.8 * scale} />
          
          {/* MANER la varful triunghiului */}
          <circle cx={handleX} cy={centerY} r={4 * scale} fill={secondaryColor} stroke="white" strokeWidth={1 * scale} />
          <rect x={handleX - 4 * scale} y={centerY - 3 * scale} width={8 * scale} height={6 * scale} rx={1.5 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.8 * scale} />
          <circle cx={handleX} cy={centerY} r={2 * scale} fill="white" opacity={0.9} />
          
          <text x={centerX} y={topY - 8 * scale} textAnchor="middle" fontSize={5 * scale} fill={secondaryColor} fontWeight="bold">MANER</text>
          <text x={hingeX} y={bottomY + 10 * scale} textAnchor={isLeft ? "start" : "end"} fontSize={4 * scale} fill={lineColor}>BALAMA</text>
        </g>
      );
    }
    
    return (
      <g key={`normal-${idx}`} opacity={0.95}>
        {/* Linii pe tot canatul */}
        <line x1={leftX} y1={topY} x2={rightX} y2={topY} stroke={lineColor} strokeWidth={1.2 * scale} {...strokeStyle} />
        <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke={lineColor} strokeWidth={1.2 * scale} {...strokeStyle} />
        <line x1={hingeX} y1={topY} x2={hingeX} y2={bottomY} stroke={lineColor} strokeWidth={2 * scale} opacity={0.7} {...strokeStyle} />
        
        {/* TRIUNGHI: de la balamale la marginea opusa */}
        <polygon points={`${hingeX},${topY} ${hingeX},${bottomY} ${farX},${centerY}`} fill="none" stroke={lineColor} strokeWidth={2 * scale} />
        {/* Linii diagonale */}
        <line x1={hingeX} y1={topY} x2={farX} y2={centerY} stroke={lineColor} strokeWidth={1.5 * scale} opacity={0.6} />
        <line x1={hingeX} y1={bottomY} x2={farX} y2={centerY} stroke={lineColor} strokeWidth={1.5 * scale} opacity={0.6} />
        
        <circle cx={hingeX} cy={topY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={hingeX} cy={bottomY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={hingeX} cy={centerY} r={2.5 * scale} fill={lineColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={handleX} cy={centerY} r={2.5 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.8 * scale} />
        
        {/* MANER la centru */}
        <circle cx={handleX} cy={centerY} r={4 * scale} fill={secondaryColor} stroke="white" strokeWidth={1 * scale} />
        <rect x={handleX - 4 * scale} y={centerY - 3 * scale} width={8 * scale} height={6 * scale} rx={1.5 * scale} fill={secondaryColor} stroke="white" strokeWidth={0.8 * scale} />
        <circle cx={handleX} cy={centerY} r={2 * scale} fill="white" opacity={0.9} />
        
        <text x={centerX} y={topY - 8 * scale} textAnchor="middle" fontSize={5 * scale} fill={secondaryColor} fontWeight="bold">MANER</text>
        <text x={hingeX} y={bottomY + 10 * scale} textAnchor={isLeft ? "start" : "end"} fontSize={4 * scale} fill={lineColor}>BALAMA</text>
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

    const boltX = isLeftSash ? sash.x + sash.w - 6 * scale : sash.x + 4 * scale;
    const boltLength = 8 * scale;
    const boltWidth = 4 * scale;
    
    return (
      <g key={`bolts-${idx}`} opacity={0.8}>
        <rect
          x={boltX}
          y={sash.y + sash.h * 0.15}
          width={boltLength}
          height={boltWidth}
          rx={1 * scale}
          fill="#6B7280"
          stroke="#4B5563"
          strokeWidth={0.5 * scale}
        />
        <rect
          x={boltX}
          y={sash.y + sash.h * 0.85 - boltWidth}
          width={boltLength}
          height={boltWidth}
          rx={1 * scale}
          fill="#6B7280"
          stroke="#4B5563"
          strokeWidth={0.5 * scale}
        />
      </g>
    );
  };

  const renderHandle = (sash: typeof config.sashes[0], idx: number) => {
    if (sash.side === "none" || sash.side === "center") return null;

    const isSingleSash = config.sashes.length === 1;
    const isLeftSash = sash.side === "left";
    const isRightSash = sash.side === "right";
    const hasMontant = sashConfiguration === "montant";
    const hasStulp = sashConfiguration === "stulp";
    
    // Determină dacă canatul este activ sau inactiv
    const sashKey = sash.side || String(idx);
    const sashRole = sashRoles[sashKey] || (isSingleSash ? "active" : (isLeftSash && openingSide === "left") || (isRightSash && openingSide === "right") ? "active" : "inactive");
    const isActiveSash = sashRole === "active";
    
    const shouldShowHandle = isSingleSash || hasMontant || (hasStulp && isActiveSash);
    
    if (!shouldShowHandle) return null;

    // Pentru canat inactiv, nu afișăm mâner suplimentar - desenul tehnic din renderOpeningLines include deja levera
    if (sashRole === "inactive") return null;

    const hx = handleX(sash);
    const hy = handleYFromBottom(sash);
    const handleWidth = 10 * scale;
    const handleHeightSize = 20 * scale;

    return (
      <g 
        key={`handle-${idx}`} 
        onClick={() => onComponentClick?.("maner")} 
        onMouseEnter={() => handleComponentHover("maner")}
        onMouseLeave={() => handleComponentHover(null)}
        style={{ cursor: "pointer" }}
      >
        {/* MANER REALIST pentru fereastra PVC - tip C/arc */}
        {/* Placa de baza */}
        <rect
          x={hx - 1 * scale}
          y={hy - handleHeightSize / 2}
          width={handleWidth}
          height={handleHeightSize}
          rx={2 * scale}
          fill={hoveredComponent === "maner" ? "#2563EB" : "#1F2937"}
          stroke={hoveredComponent === "maner" ? "#1D4ED8" : "#111827"}
          strokeWidth={hoveredComponent === "maner" ? 1 : 0.5}
        />
        {/* Mânerul (partea mobile) */}
        <path
          d={`M ${hx + 2 * scale} ${hy - handleHeightSize / 2 + 3 * scale} 
              Q ${hx + 9 * scale} ${hy} ${hx + 2 * scale} ${hy + handleHeightSize / 2 - 3 * scale}`}
          fill="none"
          stroke={hoveredComponent === "maner" ? "#60A5FA" : "#9CA3AF"}
          strokeWidth={2.5 * scale}
          strokeLinecap="round"
        />
        {/* Puncte de prindere */}
        <circle cx={hx + 2 * scale} cy={hy - handleHeightSize / 2 + 4 * scale} r={1.5 * scale} fill={hoveredComponent === "maner" ? "#93C5FD" : "#6B7280"} />
        <circle cx={hx + 2 * scale} cy={hy + handleHeightSize / 2 - 4 * scale} r={1.5 * scale} fill={hoveredComponent === "maner" ? "#93C5FD" : "#6B7280"} />
      </g>
    );
  };

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden", className)}>
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vizualizare 2D</span>
          <span className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700 font-medium">
            {config.type}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
            {openingSide === "left" ? "← Deschidere stânga" : "Deschidere dreapta →"}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${openingType === "oscilobativ" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"}`}>
            {openingType === "oscilobativ" ? "Oscilobativ" : "Batant"}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${openingDirection === "inward" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
            {openingDirection === "inward" ? "Interior" : "Exterior"}
          </span>
          {sashConfiguration && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${sashConfiguration === "stulp" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"}`}>
              {sashConfiguration === "stulp" ? "Stulp" : "Montant"}
            </span>
          )}
        </div>
        {showDimensions && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium">{width} × {height} mm</span>
            <span className="text-slate-300">|</span>
            <span>{((width * height) / 1000000).toFixed(3)} m²</span>
          </div>
        )}
      </div>

      <div className="p-4 flex items-center justify-center bg-slate-50 min-h-[280px]">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          <defs>
            <pattern id="glassPattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#E3F2FD" />
              <rect width="6" height="6" fill="none" stroke="#BBDEFB" strokeWidth="0.3" />
            </pattern>
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="30%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2196F3" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <g transform="translate(40, 40)">
            {/* ZIDARIA / BRICKMOLD - exterior outline */}
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={3 * scale}
              strokeDasharray={`${8 * scale} ${4 * scale}`}
/>

            {/* TOC / Rama exterioară - CLICKABLE */}
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill={exteriorHex}
              stroke={hoveredComponent === "toc" ? "#3B82F6" : "#1F2937"}
              strokeWidth={hoveredComponent === "toc" ? 2.5 : 1}
              onClick={() => onComponentClick?.("toc")}
              onMouseEnter={() => handleComponentHover("toc")}
              onMouseLeave={() => handleComponentHover(null)}
              style={{ cursor: "pointer" }}
            />

            {/* TOC INTERIOR / Rama interioară */}
            <rect
              x={frameThickness}
              y={frameThickness}
              width={w - frameThickness * 2}
              height={h - frameThickness * 2}
              fill={interiorHex}
              stroke="#9CA3AF"
              strokeWidth={1}
            />

            {/* CANATURI / Sashes */}
            {config.sashes.map((sash, idx) => (
              <g key={`sash-${idx}`}>
                {/* Canat exterior - CLICKABLE */}
                <rect
                  x={sash.x - sashProfile}
                  y={sash.y - sashProfile}
                  width={sash.w + sashProfile * 2}
                  height={sash.h + sashProfile * 2}
                  fill={exteriorHex}
                  stroke={hoveredComponent === "canat" ? "#3B82F6" : "#1F2937"}
                  strokeWidth={hoveredComponent === "canat" ? 2 : 0.8}
                  onClick={() => onComponentClick?.("canat")}
                  onMouseEnter={() => handleComponentHover("canat")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* Canat interior */}
                <rect
                  x={sash.x - sashProfile + 2 * scale}
                  y={sash.y - sashProfile + 2 * scale}
                  width={sash.w + sashProfile * 2 - 4 * scale}
                  height={sash.h + sashProfile * 2 - 4 * scale}
                  fill={interiorHex}
                  stroke="#D1D5DB"
                  strokeWidth={0.5}
                />

                {/* STICLA / Glass - CLICKABLE */}
                <rect
                  x={sash.x + glassGap}
                  y={sash.y + glassGap}
                  width={sash.w - glassGap * 2}
                  height={sash.h - glassGap * 2}
                  fill="url(#glassPattern)"
                  stroke={hoveredComponent === "sticla" ? "#3B82F6" : "transparent"}
                  strokeWidth={hoveredComponent === "sticla" ? 2 : 0}
                  onClick={() => onComponentClick?.("sticla")}
                  onMouseEnter={() => handleComponentHover("sticla")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* BAGHETE / Glazing beads - CLICKABLE */}
                <rect
                  x={sash.x + glassGap + 1.5 * scale}
                  y={sash.y + glassGap + 1.5 * scale}
                  width={sash.w - glassGap * 2 - 3 * scale}
                  height={sash.h - glassGap * 2 - 3 * scale}
                  fill="none"
                  stroke={hoveredComponent === "baghete" ? "#3B82F6" : "#94A3B8"}
                  strokeWidth={hoveredComponent === "baghete" ? 2.5 : 1.5}
                  onClick={() => onComponentClick?.("baghete")}
                  onMouseEnter={() => handleComponentHover("baghete")}
                  onMouseLeave={() => handleComponentHover(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* MONTANT ORIZONTAL pe canat - pentru intarire sau luminator */}
                {horizontalMuntin && (
                  <g>
                    <rect
                      x={sash.x + glassGap + 1.5 * scale}
                      y={sash.y + sash.h / 2 - 2 * scale}
                      width={sash.w - glassGap * 2 - 3 * scale}
                      height={4 * scale}
                      fill="#6B7280"
                      stroke="#4B5563"
                      strokeWidth={0.5}
                    />
                    <circle
                      cx={sash.x + glassGap + 1.5 * scale}
                      cy={sash.y + sash.h / 2}
                      r={2 * scale}
                      fill="#4B5563"
                    />
                    <circle
                      cx={sash.x + sash.w - glassGap - 1.5 * scale}
                      cy={sash.y + sash.h / 2}
                      r={2 * scale}
                      fill="#4B5563"
                    />
                  </g>
                )}

                {/* BALAMALE / Hinges - CLICKABLE */}
                {sash.side && sash.side !== "none" && (
                  <g 
                    onClick={() => onComponentClick?.("balamale")} 
                    onMouseEnter={() => handleComponentHover("balamale")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={sash.x - sashProfile + 2 * scale}
                      y={sash.y + sash.h * 0.15}
                      width={6 * scale}
                      height={12 * scale}
                      rx={1 * scale}
                      fill={hoveredComponent === "balamale" ? "#3B82F6" : "#9CA3AF"}
                      stroke={hoveredComponent === "balamale" ? "#1D4ED8" : "#6B7280"}
                      strokeWidth={hoveredComponent === "balamale" ? 1 : 0.5}
                    />
                    <rect
                      x={sash.x - sashProfile + 2 * scale}
                      y={sash.y + sash.h * 0.75}
                      width={6 * scale}
                      height={12 * scale}
                      rx={1 * scale}
                      fill={hoveredComponent === "balamale" ? "#3B82F6" : "#9CA3AF"}
                      stroke={hoveredComponent === "balamale" ? "#1D4ED8" : "#6B7280"}
                      strokeWidth={hoveredComponent === "balamale" ? 1 : 0.5}
                    />
                  </g>
                )}

                {/* MANER / Handle - CLICKABLE */}
                {sash.side && sash.side !== "none" && renderHandle(sash, idx)}

                {/* BOLTURI / Bolts pentru canatul pasiv în sistem stulp */}
                {sash.side && sash.side !== "none" && renderBolts(sash, idx)}
              </g>
            ))}

            {/* PRAG / Threshold - doar pentru usi sau daca e selectat */}
            {(showThreshold || config.isDoor) && (
              <g 
                onClick={() => onComponentClick?.("prag")} 
                onMouseEnter={() => handleComponentHover("prag")}
                onMouseLeave={() => handleComponentHover(null)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={frameThickness - 2 * scale}
                  y={h - 6 * scale}
                  width={w - frameThickness * 2 + 4 * scale}
                  height={6 * scale}
                  fill={hoveredComponent === "prag" ? "#3B82F6" : "#374151"}
                  stroke={hoveredComponent === "prag" ? "#1D4ED8" : "#1F2937"}
                  strokeWidth={hoveredComponent === "prag" ? 1 : 0.5}
                  rx={1 * scale}
                />
                <text 
                  x={w / 2} 
                  y={h - 1 * scale} 
                  textAnchor="middle" 
                  fontSize={5 * scale} 
                  fill="#9CA3AF"
                >
                  PRAG
                </text>
              </g>
            )}

            {/* LINII TEHNICE DE DESCHIDERE - DRAWN ON TOP */}
            {config.sashes.map((sash, idx) => renderOpeningLines(sash, idx))}

            {/* STULP / MONTANT Separator pentru 2 canate - CLICKABLE */}
            {config.sashes.length === 2 && sashConfiguration && (
              <g>
                {sashConfiguration === "stulp" ? (
                  <g 
                    onClick={() => onComponentClick?.("stulp")} 
                    onMouseEnter={() => handleComponentHover("stulp")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={w / 2 - 3 * scale} y={frameThickness} width={6 * scale} height={h - frameThickness * 2} fill={hoveredComponent === "stulp" ? "#3B82F6" : "#6B7280"} stroke={hoveredComponent === "stulp" ? "#1D4ED8" : "#4B5563"} strokeWidth={hoveredComponent === "stulp" ? 1 : 0.5} />
                    <text x={w / 2} y={frameThickness + 12 * scale} textAnchor="middle" fontSize={5 * scale} fill="white" fontWeight="bold">STULP</text>
                    <line x1={w / 2 - 3 * scale} y1={frameThickness + 16 * scale} x2={w / 2 + 3 * scale} y2={frameThickness + 16 * scale} stroke="#9CA3AF" strokeWidth={0.5} />
                    <text x={w / 2} y={frameThickness + 22 * scale} textAnchor="middle" fontSize={4 * scale} fill="#D1D5DB">(INVERSOR)</text>
                    {/* Technical detail icon */}
                    <circle cx={w / 2} cy={h - frameThickness - 8 * scale} r={3 * scale} fill={hoveredComponent === "stulp" ? "#60A5FA" : "#9CA3AF"} />
                  </g>
                ) : (
                  <g 
                    onClick={() => onComponentClick?.("montant")} 
                    onMouseEnter={() => handleComponentHover("montant")}
                    onMouseLeave={() => handleComponentHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={w / 2 - 4 * scale} y={frameThickness} width={8 * scale} height={h - frameThickness * 2} fill={hoveredComponent === "montant" ? "#3B82F6" : "#4B5563"} stroke={hoveredComponent === "montant" ? "#1D4ED8" : "#374151"} strokeWidth={hoveredComponent === "montant" ? 1 : 1} />
                    <rect x={w / 2 - 2 * scale} y={frameThickness + 2 * scale} width={4 * scale} height={h - frameThickness * 2 - 4 * scale} fill={hoveredComponent === "montant" ? "#60A5FA" : "#6B7280"} />
                    <text x={w / 2} y={frameThickness + 12 * scale} textAnchor="middle" fontSize={5 * scale} fill="white" fontWeight="bold">MONTANT</text>
                    <line x1={w / 2 - 4 * scale} y1={frameThickness + 16 * scale} x2={w / 2 + 4 * scale} y2={frameThickness + 16 * scale} stroke="#9CA3AF" strokeWidth={0.5} />
                    <text x={w / 2} y={frameThickness + 22 * scale} textAnchor="middle" fontSize={4 * scale} fill="#D1D5DB">(FIX)</text>
                    {/* Technical detail icon */}
                    <circle cx={w / 2} cy={h - frameThickness - 8 * scale} r={3 * scale} fill={hoveredComponent === "montant" ? "#60A5FA" : "#9CA3AF"} />
                  </g>
                )}
              </g>
            )}

            {/* GLAF EXTERIOR / Drip cap - CLICKABLE */}
            <g 
              onClick={() => onComponentClick?.("glaf")} 
              onMouseEnter={() => handleComponentHover("glaf")}
              onMouseLeave={() => handleComponentHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={w - 8 * scale}
                y={-3 * scale}
                width={8 * scale}
                height={frameThickness}
                fill={hoveredComponent === "glaf" ? "#3B82F6" : "#374151"}
              />
            </g>

            {/* Dimension lines */}
            {showDimensions && (
              <>
                {/* Width */}
                <line x1={0} y1={h + 6 * scale} x2={w} y2={h + 6 * scale} stroke="#64748B" strokeWidth={0.5} />
                <line x1={0} y1={h + 4 * scale} x2={0} y2={h + 10 * scale} stroke="#64748B" strokeWidth={0.5} />
                <line x1={w} y1={h + 4 * scale} x2={w} y2={h + 10 * scale} stroke="#64748B" strokeWidth={0.5} />
                <text x={w / 2} y={h + 16 * scale} textAnchor="middle" fontSize={8 * scale} fill="#64748B">{width}mm</text>

                {/* Height */}
                <line x1={-6 * scale} y1={0} x2={-6 * scale} y2={h} stroke="#64748B" strokeWidth={0.5} />
                <line x1={-10 * scale} y1={0} x2={-4 * scale} y2={0} stroke="#64748B" strokeWidth={0.5} />
                <line x1={-10 * scale} y1={h} x2={-4 * scale} y2={h} stroke="#64748B" strokeWidth={0.5} />
                <text x={-12 * scale} y={h / 2} textAnchor="middle" fontSize={8 * scale} fill="#64748B" transform={`rotate(-90, ${-12 * scale}, ${h / 2})`}>{height}mm</text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: exteriorHex }}></div>
          <span className="text-slate-600">Toc exterior</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: interiorHex, border: '1px solid #D1D5DB' }}></div>
          <span className="text-slate-600">Toc interior</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB' }}></div>
          <span className="text-slate-600">Sticlă</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-400"></div>
          <span className="text-slate-600">Maner</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-300"></div>
          <span className="text-slate-600">Balamale</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
          <span className="text-slate-600">Deschidere</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
          <span className="text-slate-600">Glaf</span>
        </div>
        {config.isDoor && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-600"></div>
            <span className="text-slate-600">Prag</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-primary-600">
          <span className="font-medium">{hoveredComponent ? `${COMPONENT_LABELS[hoveredComponent]} selectat` : 'Faceți clic pe elemente pentru configurare'}</span>
        </div>
      </div>
    </div>
  );
}
