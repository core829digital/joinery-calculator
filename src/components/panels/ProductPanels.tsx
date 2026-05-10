"use client";

import { cn } from "@/lib/utils";
import type { ProductType } from "@/types";
import { PRODUCT_TYPES } from "@/data/joinery";
import {
  Square,
  RectangleHorizontal,
  Layers,
  PanelLeft,
  DoorOpen,
  DoorClosed,
  Grid3X3,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  "window-1": <Square className="w-8 h-8" strokeWidth={1.5} />,
  "window-2": <RectangleHorizontal className="w-8 h-8" strokeWidth={1.5} />,
  "window-3": <Grid3X3 className="w-8 h-8" strokeWidth={1.5} />,
  "window-fix": <PanelLeft className="w-8 h-8" strokeWidth={1.5} />,
  "door-balcony": <DoorOpen className="w-8 h-8" strokeWidth={1.5} />,
  "door-balcony-2": <Layers className="w-8 h-8" strokeWidth={1.5} />,
  "door-entry": <DoorClosed className="w-8 h-8" strokeWidth={1.5} />,
  "door-alu": <DoorClosed className="w-8 h-8" strokeWidth={1.5} />,
};

interface PanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Panel({ title, description, children }: PanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface ProductTypePanelProps {
  selected: ProductType | null;
  onSelect: (type: ProductType) => void;
}

export function ProductTypePanel({ selected, onSelect }: ProductTypePanelProps) {
  return (
    <Panel title="Tip Produs" description="Selectați tipul de ferestră sau ușă">
      <div className="grid grid-cols-2 gap-3">
        {PRODUCT_TYPES.map((product) => (
          <button
            key={product.type}
            onClick={() => onSelect(product.type)}
            className={cn(
              "group relative p-4 rounded-lg border-2 text-left transition-all",
              selected === product.type
                ? "border-primary-500 bg-primary-50 shadow-md"
                : "border-slate-200 bg-white hover:border-primary-300 hover:shadow-md"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                selected === product.type
                  ? "bg-primary-100 text-primary-600"
                  : "bg-slate-100 text-slate-600 group-hover:bg-primary-50"
              )}
            >
              {ICONS[product.icon]}
            </div>
            <h4 className="font-medium text-slate-900 text-sm">{product.name}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">
                Max: {product.maxWidth}x{product.maxHeight}mm
              </span>
            </div>
            {selected === product.type && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </Panel>
  );
}

import { Check } from "lucide-react";

interface DimensionsPanelProps {
  width: number;
  height: number;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  productType: ProductType | null;
}

export function DimensionsPanel({
  width,
  height,
  onWidthChange,
  onHeightChange,
  productType,
}: DimensionsPanelProps) {
  const product = PRODUCT_TYPES.find((p) => p.type === productType);
  const maxW = product?.maxWidth || 2400;
  const maxH = product?.maxHeight || 2400;

  return (
    <Panel title="Dimensiuni" description="Introduceți dimensiunile în mm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Lățime (L)
          </label>
          <div className="relative">
            <input
              type="number"
              value={width || ""}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              min={300}
              max={maxW}
              className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-lg font-medium text-center"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mm
            </span>
          </div>
          <input
            type="range"
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            min={300}
            max={maxW}
            step={10}
            className="w-full mt-2 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>300mm</span>
            <span>{maxW}mm</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Înălțime (H)
          </label>
          <div className="relative">
            <input
              type="number"
              value={height || ""}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              min={300}
              max={maxH}
              className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-lg font-medium text-center"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mm
            </span>
          </div>
          <input
            type="range"
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            min={300}
            max={maxH}
            step={10}
            className="w-full mt-2 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>300mm</span>
            <span>{maxH}mm</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Suprafață:</span>
          <span className="font-semibold text-slate-900">
            {((width * height) / 1000000).toFixed(3)} m²
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-slate-600">Perimetru:</span>
          <span className="font-semibold text-slate-900">
            {((width + height) * 2 / 1000).toFixed(1)} ml
          </span>
        </div>
      </div>
    </Panel>
  );
}

interface OpeningPanelProps {
  selected: string | null;
  onSelect: (type: string) => void;
}

export function OpeningPanel({ selected, onSelect }: OpeningPanelProps) {
  return (
    <Panel title="Tip Deschidere" description="Selectați tipul de mecanism de deschidere">
      <div className="space-y-2">
        {[
          { id: "fix", name: "Fix (Fără Deschidere)", desc: "Fără mecanism de deschidere", available: true },
          { id: "batant_dreapta", name: "Batant Dreapta", desc: "Deschidere către interior/exterior - dreapta", available: true },
          { id: "batant_stanga", name: "Batant Stânga", desc: "Deschidere către interior/exterior - stânga", available: true },
          { id: "basculant", name: "Basculant (Kip)", desc: "Rotație pe ax orizontal superior", available: true },
          { id: "obluc", name: "Obluc (Roto)", desc: "Deschidere combinată batant + basculant", available: true },
          { id: "oscilobatant", name: "Oscilobatant", desc: "Combinat: oscilant + batant", available: true },
          { id: "ghilotina", name: "Ghilotină", desc: "Glisare verticală", available: false },
          { id: "pliant", name: "Pliant (Folding)", desc: "Acordeon, economisește spațiu", available: false },
          { id: "coulissant", name: "Coulissant (Glisant)", desc: "Glisare orizontală", available: false },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => item.available && onSelect(item.id)}
            disabled={!item.available}
            className={cn(
              "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between",
              selected === item.id && item.available
                ? "border-primary-500 bg-primary-50"
                : item.available
                  ? "border-slate-200 hover:border-slate-300"
                  : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
            )}
          >
            <div>
              <span className={cn("text-sm font-medium", selected === item.id && item.available ? "text-primary-700" : "text-slate-700")}>
                {item.name}
              </span>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            {!item.available && (
              <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                În curând
              </span>
            )}
          </button>
        ))}
      </div>
    </Panel>
  );
}

export { Panel };