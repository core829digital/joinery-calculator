"use client";

import { useMemo } from "react";
import type {
  ProductType,
  ProfileSeries,
  GlassType,
  Color,
  HardwareBrand,
  HardwareLevel,
  AccessoryType,
  UserRole,
} from "@/types";
import {
  PROFILE_SERIES,
  GLASS_TYPES,
  COLORS,
  HARDWARE_BRANDS,
  HARDWARE_LEVELS,
  DISCOUNT_RATES,
  TVA_RATE,
} from "@/data/joinery";
import { calculatePrice, formatPrice, getGlassUwValue } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { FileText, Send, RefreshCw } from "lucide-react";
import { Panel } from "./ProductPanels";

interface PricingPanelProps {
  productType: ProductType;
  width: number;
  height: number;
  profileSeries: ProfileSeries;
  glassType: GlassType | null;
  interiorColor: Color | null;
  exteriorColor: Color | null;
  hardwareBrand: HardwareBrand | null;
  hardwareLevel: HardwareLevel | null;
  accessories: AccessoryType[];
  userRole: UserRole;
  distance: number;
  includeMontaj: boolean;
}

export function PricingPanel({
  productType,
  width,
  height,
  profileSeries,
  glassType,
  interiorColor,
  exteriorColor,
  hardwareBrand,
  hardwareLevel,
  accessories,
  userRole,
  distance,
  includeMontaj,
}: PricingPanelProps) {
  const price = useMemo(() => {
    if (!glassType || !interiorColor || !exteriorColor) return null;

    try {
      return calculatePrice({
        productType,
        width,
        height,
        profileSeries,
        glassType,
        interiorColor,
        exteriorColor,
        hardwareBrand: hardwareBrand || "siegenia",
        hardwareLevel: hardwareLevel || "standard",
        accessories,
        userRole,
        distance,
        includeMontaj,
      });
    } catch {
      return null;
    }
  }, [
    productType, width, height, profileSeries, glassType,
    interiorColor, exteriorColor, hardwareBrand, hardwareLevel,
    accessories, userRole, distance, includeMontaj,
  ]);

  if (!price) {
    return (
      <Panel title="Rezumat Preț" description="Completați toate opțiunile">
        <div className="text-center py-8 text-slate-500 text-sm">
          Selectați toate opțiunile pentru a calcula prețul
        </div>
      </Panel>
    );
  }

  const area = (width * height) / 1000000;
  const perimeter = ((width + height) * 2) / 1000;
  const profile = PROFILE_SERIES.find((p) => p.id === profileSeries);
  const glass = GLASS_TYPES.find((g) => g.id === glassType);
  const intColor = COLORS.find((c) => c.id === interiorColor);
  const extColor = COLORS.find((c) => c.id === exteriorColor);
  const hw = HARDWARE_BRANDS.find((h) => h.id === hardwareBrand);
  const hwLevel = hardwareLevel ? HARDWARE_LEVELS[hardwareLevel] : HARDWARE_LEVELS.standard;
  const discountPct = DISCOUNT_RATES[userRole] * 100;

  const laborCost = Math.round(price.subtotal * 0.25);

  return (
    <Panel
      title="Rezumat Preț Detaliat"
      description="Calcul pe baza consumului real de materiale"
    >
      <div className="space-y-2 text-sm">
        {/* Material breakdown */}
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Costuri Materiale
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Profile ({profile?.commercialName || profileSeries})</span>
          <span className="font-medium text-slate-900">{formatPrice(price.profile - Math.round(laborCost * 0.6))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Sticlă {glass?.name || ""}</span>
          <span className="font-medium text-slate-900">{formatPrice(price.glass)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Feronerie {hw?.name || ""} {hwLevel.name}</span>
          <span className="font-medium text-slate-900">{formatPrice(price.hardware)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Culori / Etanșare / Accesorii</span>
          <span className="font-medium text-slate-900">{formatPrice(price.accessories)}</span>
        </div>

        {/* Labor */}
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-3 border-t border-slate-100 pt-2">
          Manoperă și Producție
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Manoperă (25%)</span>
          <span className="font-medium text-slate-900">{formatPrice(laborCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Ambalare și logistică</span>
          <span className="font-medium text-slate-900">{formatPrice(area > 2 ? 85 : 55)}</span>
        </div>

        {/* Subtotal */}
        <div className="border-t border-slate-200 pt-2 flex justify-between">
          <span className="font-medium text-slate-700">Total fără discount</span>
          <span className="font-medium text-slate-900">{formatPrice(price.subtotal)}</span>
        </div>

        {/* Discount */}
        {price.discount > 0 && (
          <div className="flex justify-between text-primary-600">
            <span className="font-medium">Discount dealer ({discountPct}%)</span>
            <span className="font-medium">-{formatPrice(price.discount)}</span>
          </div>
        )}

        {/* Services */}
        {(price.transport > 0 || price.montaj > 0) && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-3 border-t border-slate-100 pt-2">
              Servicii
            </div>
            {price.transport > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Transport ({distance}km)</span>
                <span className="font-medium text-slate-900">{formatPrice(price.transport)}</span>
              </div>
            )}
            {price.montaj > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Montaj profesional</span>
                <span className="font-medium text-slate-900">{formatPrice(price.montaj)}</span>
              </div>
            )}
          </>
        )}

        {/* TVA */}
        <div className="border-t border-slate-300 pt-2 flex justify-between">
          <span className="font-semibold text-slate-800">TVA {Math.round(TVA_RATE * 100)}%</span>
          <span className="font-semibold text-slate-800">{formatPrice(price.tva)}</span>
        </div>

        {/* TOTAL */}
        <div className="bg-primary-600 px-4 py-3 rounded-lg flex justify-between items-center mt-2 shadow-lg shadow-primary-500/20">
          <span className="text-primary-100 text-sm font-medium">TOTAL INCL. TVA</span>
          <span className="text-2xl font-bold text-white">{formatPrice(price.total)}</span>
        </div>
      </div>

      {/* Technical specs */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Suprafață:</span>
          <span className="font-medium">{area.toFixed(3)} m²</span>
        </div>
        <div className="flex justify-between">
          <span>Perimetru:</span>
          <span className="font-medium">{perimeter.toFixed(2)} ml</span>
        </div>
        <div className="flex justify-between">
          <span>Dimensiuni:</span>
          <span className="font-medium">{width} × {height} mm</span>
        </div>
        <div className="flex justify-between">
          <span>Culoare interior:</span>
          <span className="font-medium">{intColor?.name || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Culoare exterior:</span>
          <span className="font-medium">{extColor?.name || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Uw sticlă:</span>
          <span className="font-medium text-primary-600">{getGlassUwValue(glassType || "tripan_4_12_4")}</span>
        </div>
      </div>
    </Panel>
  );
}

interface ServicesPanelProps {
  distance: number;
  includeMontaj: boolean;
  onDistanceChange: (distance: number) => void;
  onMontajChange: (include: boolean) => void;
}

export function ServicesPanel({
  distance,
  includeMontaj,
  onDistanceChange,
  onMontajChange,
}: ServicesPanelProps) {
  const getTransportPrice = (km: number) => {
    if (km <= 30) return 150;
    if (km <= 60) return 250;
    if (km <= 100) return 350;
    if (km <= 200) return 500;
    if (km <= 500) return 800;
    return 1200;
  };

  const montajPricePerSqm = 180;

  return (
    <Panel title="Servicii" description="Transport și montaj">
      <div className="space-y-4">
        {/* Transport */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Distanță transport (km)
          </label>
          <div className="flex gap-2 mb-3">
            {[30, 60, 100, 200, 500].map((km) => (
              <button
                key={km}
                onClick={() => onDistanceChange(km)}
                className={cn(
                  "flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-colors",
                  distance === km
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {km}+
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={500}
              value={Math.min(distance, 500)}
              onChange={(e) => onDistanceChange(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-1 w-24">
              <input
                type="number"
                min={0}
                max={1000}
                value={distance}
                onChange={(e) => onDistanceChange(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center"
              />
              <span className="text-xs text-slate-500">km</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Preț transport estimat:{" "}
            <span className="font-semibold text-primary-600">
              {getTransportPrice(distance)} lei
            </span>
          </div>
        </div>

        {/* Montaj */}
        <div className="border-t border-slate-200 pt-4">
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Montaj profesional
          </label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeMontaj}
                onChange={(e) => onMontajChange(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-slate-900">Montaj inclus</div>
                <div className="text-xs text-slate-500">
                  Instalare profesională de către echipe certificate
                </div>
              </div>
            </label>

            {includeMontaj && (
              <div className="ml-7 p-3 bg-primary-50 rounded-lg">
                <div className="text-sm font-semibold text-primary-700">
                  Preț montaj: {montajPricePerSqm} lei/m²
                </div>
                <div className="text-xs text-primary-600 mt-1">
                  (Prețul variază în funcție de complexitate)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-slate-200 pt-4">
          <div className="p-3 bg-slate-100 rounded-lg">
            <div className="text-sm text-slate-600">
              Total servicii:{" "}
              <span className="font-bold text-slate-900">
                {includeMontaj ? getTransportPrice(distance) + 180 : getTransportPrice(distance)} lei
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

interface ActionsPanelProps {
  onRequestPDF: () => void;
  onSendOrder: () => void;
  onReset: () => void;
  price: number | null;
}

export function ActionsPanel({
  onRequestPDF,
  onSendOrder,
  onReset,
  price,
}: ActionsPanelProps) {
  return (
    <Panel title="Acțiuni" description="Solicită ofertă sau trimite comanda">
      <div className="space-y-3">
        <button
          onClick={onRequestPDF}
          disabled={!price}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
            price
              ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          <FileText className="w-5 h-5" />
          Cere Ofertă PDF
        </button>

        <button
          onClick={onSendOrder}
          disabled={!price}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
            price
              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
          Trimite Comanda
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-4 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Configurare nouă
        </button>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Notă:</strong> Prețul este estimativ și poate varia. Pentru ofertă
          detaliată cu materiile exacte, contactați-ne.
        </p>
      </div>
    </Panel>
  );
}