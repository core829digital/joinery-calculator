"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ProfileSeries, GlassType, Color } from "@/types";
import { PROFILE_SERIES, GLASS_TYPES, COLORS, HARDWARE_BRANDS, HARDWARE_LEVELS, ACCESSORIES } from "@/data/joinery";
import { Check, ChevronRight, Thermometer, X } from "lucide-react";
import { Panel } from "./ProductPanels";

interface ProfilePanelProps {
  selected: ProfileSeries | null;
  onSelect: (profile: ProfileSeries) => void;
}

export function ProfilePanel({ selected, onSelect }: ProfilePanelProps) {
  const [filterThermal, setFilterThermal] = useState(false);

  const filteredProfiles = useMemo(() => {
    if (filterThermal) return PROFILE_SERIES.filter((p) => p.thermalBreak);
    return PROFILE_SERIES;
  }, [filterThermal]);

  return (
    <Panel
      title="Seria Profilului"
      description="Selectați seria de profil PVC sau Aluminiu"
    >
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filterThermal}
            onChange={(e) => setFilterThermal(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          Doar cu rupture termică
        </label>
        <span className="text-xs text-slate-400 ml-auto">
          {filteredProfiles.length} variante
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredProfiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelect(profile.id)}
            className={cn(
              "w-full p-3 rounded-lg border text-left transition-all",
              selected === profile.id
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900">{profile.commercialName}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {profile.depthMm}mm
                  </span>
                  {profile.thermalBreak && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Thermal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{profile.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {selected === profile.id && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
                <span className="text-xs text-slate-400">
                  x{profile.priceMultiplier.toFixed(2)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

interface GlassPanelProps {
  selected: GlassType | null;
  onSelect: (glass: GlassType) => void;
}

export function GlassPanel({ selected, onSelect }: GlassPanelProps) {
  const [filterUw, setFilterUw] = useState<number | null>(null);

  const filteredGlass = useMemo(() => {
    if (filterUw) return GLASS_TYPES.filter((g) => g.uwValue <= filterUw);
    return GLASS_TYPES;
  }, [filterUw]);

  return (
    <Panel title="Tip Sticlă" description="Selectați geamul pentru izolare termică și fonică">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm text-slate-600">Uw maxim:</span>
        {[null, 1.0, 0.8, 0.6].map((val) => (
          <button
            key={val ?? "all"}
            onClick={() => setFilterUw(val)}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              filterUw === val
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {val ? `≤${val}` : "Toate"}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredGlass.map((glass) => (
          <button
            key={glass.id}
            onClick={() => onSelect(glass.id)}
            className={cn(
              "w-full p-3 rounded-lg border text-left transition-all",
              selected === glass.id
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{glass.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{glass.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {selected === glass.id && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
                <span className="text-xs font-medium text-primary-600">
                  Uw={glass.uwValue}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

interface ColorsPanelProps {
  interiorColor: Color | null;
  exteriorColor: Color | null;
  onInteriorChange: (color: Color) => void;
  onExteriorChange: (color: Color) => void;
}

export function ColorsPanel({
  interiorColor,
  exteriorColor,
  onInteriorChange,
  onExteriorChange,
}: ColorsPanelProps) {
  const { t } = useTranslation();
  const [colorFilter, setColorFilter] = useState<"all" | "standard" | "folie" | "vopsit">("all");
  const [showModal, setShowModal] = useState(false);
  const [modalSide, setModalSide] = useState<"interior" | "exterior">("interior");

  const filteredColors = useMemo(() => {
    if (colorFilter === "all") return COLORS;
    return COLORS.filter((c) => c.type === colorFilter);
  }, [colorFilter]);

  const standardColors = filteredColors.filter((c) => c.priceCategory === "standard");
  const premiumColors = filteredColors.filter((c) => c.priceCategory === "premium" || c.priceCategory === "lux");
  const specialColors = filteredColors.filter((c) => c.priceCategory === "special");

  const getCurrentColor = (side: "interior" | "exterior") => {
    const colorId = side === "interior" ? interiorColor : exteriorColor;
    return COLORS.find((c) => c.id === colorId);
  };

  const openColorPicker = (side: "interior" | "exterior") => {
    setModalSide(side);
    setShowModal(true);
  };

  const handleColorSelect = (colorId: Color) => {
    if (modalSide === "interior") {
      onInteriorChange(colorId);
    } else {
      onExteriorChange(colorId);
    }
    setShowModal(false);
  };

  const ColorSwatch = ({ color, isSelected, onClick, showName = false }: { color: typeof COLORS[0]; isSelected: boolean; onClick: () => void; showName?: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center",
        isSelected ? "border-primary-500 ring-2 ring-primary-500 ring-offset-2" : "border-slate-200 hover:border-slate-300"
      )}
      title={`${color.name} (${color.ral})`}
    >
      <div
        className="w-12 h-12 rounded-md"
        style={{ backgroundColor: color.hex }}
      />
      {isSelected && (
        <Check className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white rounded-full p-0.5" />
      )}
      {showName && (
        <span className="text-[10px] text-slate-600 mt-1 px-1 text-center line-clamp-1">{color.name.split(" ")[0]}</span>
      )}
    </button>
  );

  return (
    <Panel
      title="Culori Interior / Exterior"
      description="Combinații bicolore pentru design personalizat"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["all", "standard", "folie", "vopsit"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setColorFilter(type)}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors capitalize",
              colorFilter === type
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {type === "all" ? "Toate" : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Interior */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Interior</h4>
          <button
            onClick={() => openColorPicker("interior")}
            className="w-full flex items-center gap-3 p-2 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-md border border-slate-300"
              style={{ backgroundColor: getCurrentColor("interior")?.hex || "#F5F5F0" }}
            />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-slate-700">{getCurrentColor("interior")?.name || t("panels.colors.select")}</div>
              <div className="text-xs text-slate-500">{getCurrentColor("interior")?.ral || "—"}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Exterior */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Exterior</h4>
          <button
            onClick={() => openColorPicker("exterior")}
            className="w-full flex items-center gap-3 p-2 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-md border border-slate-300"
              style={{ backgroundColor: getCurrentColor("exterior")?.hex || "#383E42" }}
            />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-slate-700">{getCurrentColor("exterior")?.name || t("panels.colors.select")}</div>
              <div className="text-xs text-slate-500">{getCurrentColor("exterior")?.ral || "—"}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Color legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
          Standard
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          Premium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
          Special
        </span>
      </div>

      {/* Color Picker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Alege Culoarea {modalSide === "interior" ? "Interior" : "Exterior"}
                </h3>
                <p className="text-sm text-slate-500">{t("panels.colors.availableCount", { count: COLORS.length })}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 p-3 border-b border-slate-100 overflow-x-auto">
              {(["all", "standard", "folie", "vopsit"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setColorFilter(type)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full transition-colors capitalize whitespace-nowrap",
                    colorFilter === type
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {type === "all" ? "Toate" : type}
                </button>
              ))}
            </div>

            {/* Color Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Standard Colors */}
              {standardColors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Standard (gratuit)
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {standardColors.map((color) => (
                      <ColorSwatch
                        key={color.id}
                        color={color}
                        isSelected={(modalSide === "interior" ? interiorColor : exteriorColor) === color.id}
                        onClick={() => handleColorSelect(color.id)}
                        showName
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Colors */}
              {premiumColors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Premium (cost suplimentar)
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {premiumColors.map((color) => (
                      <ColorSwatch
                        key={color.id}
                        color={color}
                        isSelected={(modalSide === "interior" ? interiorColor : exteriorColor) === color.id}
                        onClick={() => handleColorSelect(color.id)}
                        showName
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Special Colors */}
              {specialColors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Speciale (preț ridicat)
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {specialColors.map((color) => (
                      <ColorSwatch
                        key={color.id}
                        color={color}
                        isSelected={(modalSide === "interior" ? interiorColor : exteriorColor) === color.id}
                        onClick={() => handleColorSelect(color.id)}
                        showName
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

interface HardwarePanelProps {
  brand: string | null;
  level: string | null;
  onBrandChange: (brand: string) => void;
  onLevelChange: (level: string) => void;
}

export function HardwarePanel({
  brand,
  level,
  onBrandChange,
  onLevelChange,
}: HardwarePanelProps) {
  return (
    <Panel title="Feronerie" description="Brand și nivel de echipare">
      <div className="space-y-4">
        {/* Brand */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Brand</h4>
          <div className="grid grid-cols-2 gap-2">
            {HARDWARE_BRANDS.map((hw) => (
              <button
                key={hw.id}
                onClick={() => onBrandChange(hw.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  brand === hw.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-primary-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{hw.name}</span>
                  {brand === hw.id && <Check className="w-4 h-4 text-primary-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{hw.country} • {hw.warrantyYears} ani garanție</p>
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Nivel Echipare</h4>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(HARDWARE_LEVELS) as [string, { name: string; description: string; priceMultiplier: number }][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => onLevelChange(key)}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  level === key
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-primary-300"
                )}
              >
                <span className="font-medium text-slate-900">{val.name}</span>
                <p className="text-xs text-slate-500 mt-1">x{val.priceMultiplier}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

import type { AccessoryType } from "@/types";

interface AccessoriesPanelProps {
  selected: AccessoryType[];
  onToggle: (id: AccessoryType) => void;
}

export function AccessoriesPanel({ selected, onToggle }: AccessoriesPanelProps) {
  const categories = {
    plase: ACCESSORIES.filter((a) => a.id.includes("plasa")),
    umbrele: ACCESSORIES.filter((a) => a.id.includes("jaleta") || a.id.includes("rulou") || a.id.includes("oblon")),
    glafuri: ACCESSORIES.filter((a) => a.id.includes("glaf") || a.id.includes("pervaz") || a.id.includes("prag")),
    altele: ACCESSORIES.filter((a) => !a.id.includes("plasa") && !a.id.includes("jaleta") && !a.id.includes("rulou") && !a.id.includes("oblon") && !a.id.includes("glaf") && !a.id.includes("pervaz") && !a.id.includes("prag")),
  };

  return (
    <Panel title="Accesorii" description="Plase, jaluțele, glafuri și alte accesorii">
      <div className="space-y-4">
        {Object.entries(categories).filter(([, items]) => items.length > 0).map(([catName, items]) => (
          <div key={catName}>
            <h4 className="text-sm font-medium text-slate-700 mb-2 capitalize">{catName}</h4>
            <div className="space-y-2">
              {items.map((acc) => (
                <label
                  key={acc.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                    selected.includes(acc.id)
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(acc.id)}
                      onChange={() => onToggle(acc.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">{acc.name}</span>
                      <p className="text-xs text-slate-500">{acc.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {acc.price} lei/{acc.unit}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export { Panel };