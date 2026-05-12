"use client";

import { PROFILE_SERIES, GLASS_TYPES, COLORS, HARDWARE_BRANDS, HARDWARE_LEVELS, TVA_RATE } from "@/data/joinery";
import { calculatePrice, formatPrice, getGlassUwValue } from "@/lib/pricing";
import type { ProductType, ProfileSeries, GlassType, Color, HardwareBrand, HardwareLevel, AccessoryType, UserRole } from "@/types";

interface WindowItem {
  id: number;
  name: string;
  productType: ProductType;
  quantity: number;
  width: number;
  height: number;
}

interface PrintLayoutProps {
  windows: WindowItem[];
  activeWindowIndex?: number;
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
  dealerName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
}

export default function PrintLayout({
  windows,
  activeWindowIndex = 0,
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
  dealerName,
  clientName,
  clientEmail,
  clientPhone,
  notes,
}: PrintLayoutProps) {
  const activeWindow = windows[activeWindowIndex];
  
  const getPriceForWindow = (win: WindowItem) => {
    if (!glassType || !interiorColor || !exteriorColor) return null;
    return calculatePrice({
      productType: win.productType,
      width: win.width,
      height: win.height,
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
  };

  const price = activeWindow ? getPriceForWindow(activeWindow) : null;
  
  const totalPrice = windows.reduce((sum, win) => {
    const winPrice = getPriceForWindow(win);
    return sum + (winPrice ? winPrice.total * win.quantity : 0);
  }, 0);

  const profile = PROFILE_SERIES.find((p) => p.id === profileSeries);
  const glass = GLASS_TYPES.find((g) => g.id === glassType);
  const intColor = COLORS.find((c) => c.id === interiorColor);
  const extColor = COLORS.find((c) => c.id === exteriorColor);
  const hw = HARDWARE_BRANDS.find((h) => h.id === hardwareBrand);
  const hwLevel = hardwareLevel ? HARDWARE_LEVELS[hardwareLevel] : HARDWARE_LEVELS.standard;

  const productNames: Record<ProductType, string> = {
    window_1_canat: "Fereastră 1 canat",
    window_2_canate: "Fereastră 2 canate",
    window_3_canate: "Fereastră 3 canate",
    window_fix: "Fereastră fixă",
    window_1_2_3: "Fereastră (tip)",
    window_cu_lista: "Fereastră cu listă",
    usa_balcon_1: "Ușă balcon 1 canat",
    usa_balcon_2: "Ușă balcon 2 canate",
    usa_intrare_pvc: "Ușă intrare PVC",
    usa_intrare_aluminiu: "Ușă intrare aluminiu",
    pervaz_fereastra: "Pervaz fereastră",
    pervaz_usa: "Pervaz ușă",
  };

  return (
    <div className="print-layout p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-primary-600 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-600">Winmeeth SRL</h1>
          <p className="text-sm text-slate-600">Calculator Tâmplărie Profesională</p>
          <p className="text-xs text-slate-500">Str. Energiei 470, 605300 Dărmănești | Tel: +40 745 700 363</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Ofertă Preliminară</p>
          <p className="text-xs text-slate-500">Data: {new Date().toLocaleDateString("ro-RO")}</p>
          <p className="text-xs text-slate-500">Nr. oferta: {Date.now().toString().slice(-8)}</p>
        </div>
      </div>

      {/* Client Info */}
      {(clientName || dealerName) && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Informații Client</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {dealerName && <p><span className="text-slate-500">Dealer:</span> {dealerName}</p>}
            {clientName && <p><span className="text-slate-500">Client:</span> {clientName}</p>}
            {clientEmail && <p><span className="text-slate-500">Email:</span> {clientEmail}</p>}
            {clientPhone && <p><span className="text-slate-500">Telefon:</span> {clientPhone}</p>}
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Lista Produse ({windows.length} poziții)</h2>
        
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-2 px-2 text-left font-semibold">Nr.</th>
              <th className="py-2 px-2 text-left font-semibold">Tip Produs</th>
              <th className="py-2 px-2 text-left font-semibold">Dimensiuni</th>
              <th className="py-2 px-2 text-center font-semibold">Buc.</th>
              <th className="py-2 px-2 text-right font-semibold">Suprafață</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((win, idx) => (
              <tr key={win.id} className={`border-b ${idx === activeWindowIndex ? 'bg-primary-50' : ''}`}>
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2 font-medium">{productNames[win.productType] || win.productType}</td>
                <td className="py-2 px-2">{win.width} × {win.height} mm</td>
                <td className="py-2 px-2 text-center">{win.quantity}</td>
                <td className="py-2 px-2 text-right">{((win.width * win.height) / 1000000 * win.quantity).toFixed(3)} m²</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold bg-slate-50">
              <td colSpan={4} className="py-2 px-2">Total</td>
              <td className="py-2 px-2 text-right">
                {windows.reduce((sum, w) => sum + (w.width * w.height) / 1000000 * w.quantity, 0).toFixed(3)} m²
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Configuration Summary */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Configurație Unitară (per produs)</h2>
        
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-slate-600">Seria Profil</td>
              <td className="py-2 font-medium">{profile?.commercialName || profileSeries}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">Sticlă</td>
              <td className="py-2 font-medium">{glass?.name || glassType} (Uw: {getGlassUwValue(glassType || "tripan_4_12_4")})</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">Culoare Interior</td>
              <td className="py-2 font-medium">{intColor?.name || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">Culoare Exterior</td>
              <td className="py-2 font-medium">{extColor?.name || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">Feronerie</td>
              <td className="py-2 font-medium">{hw?.name || "Siegenia"} {hwLevel.name}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Accessories */}
      {accessories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Accesorii Selectate</h2>
          <ul className="text-sm">
            {accessories.map((accId) => (
              <li key={accId} className="py-1">• {accId}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Services */}
      {(distance > 0 || includeMontaj) && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Servicii Adiționale</h2>
          <ul className="text-sm">
            {distance > 0 && <li>• Transport: {distance} km</li>}
            {includeMontaj && <li>• Montaj profesional inclus</li>}
          </ul>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded">
          <p className="text-sm text-amber-800"><strong>Observații:</strong> {notes}</p>
        </div>
      )}

      {/* Price Summary - Detailed per product */}
      <div className="mt-8 border-2 border-primary-600 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-primary-600 mb-4">Rezumat Preț pe Produse</h2>
        
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b">
              <th className="py-1 text-left text-slate-600">Produs</th>
              <th className="py-1 text-center text-slate-600">Buc.</th>
              <th className="py-1 text-right text-slate-600">Preț Unitar</th>
              <th className="py-1 text-right text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((win) => {
              const winPrice = getPriceForWindow(win);
              return (
                <tr key={win.id} className="border-b">
                  <td className="py-1 text-slate-600">
                    {productNames[win.productType] || win.productType} ({win.width}×{win.height}mm)
                    {win.quantity > 1 && <span className="text-slate-400"> ×{win.quantity}</span>}
                  </td>
                  <td className="py-1 text-center">{win.quantity}</td>
                  <td className="py-1 text-right">{winPrice ? formatPrice(winPrice.total) : "—"}</td>
                  <td className="py-1 text-right font-medium">
                    {winPrice ? formatPrice(winPrice.total * win.quantity) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {price && (
              <>
                <tr className="border-b">
                  <td colSpan={3} className="py-1 text-slate-600">Transport</td>
                  <td className="py-1 text-right">{formatPrice(price.transport)}</td>
                </tr>
                {price.montaj > 0 && (
                  <tr className="border-b">
                    <td colSpan={3} className="py-1 text-slate-600">Montaj</td>
                    <td className="py-1 text-right">{formatPrice(price.montaj)}</td>
                  </tr>
                )}
                {price.discount > 0 && (
                  <tr className="text-primary-600">
                    <td colSpan={3} className="py-1">Discount</td>
                    <td className="py-1 text-right">-{formatPrice(price.discount)}</td>
                  </tr>
                )}
                <tr className="border-t border-slate-300 font-medium">
                  <td colSpan={3} className="py-2">TVA ({Math.round(TVA_RATE * 100)}%)</td>
                  <td className="py-2 text-right">{formatPrice(price.tva * windows.reduce((sum, w) => sum + w.quantity, 0))}</td>
                </tr>
              </>
            )}
          </tfoot>
        </table>
        
        <div className="bg-primary-600 text-white p-4 rounded-lg flex justify-between items-center">
          <span className="text-lg font-bold">TOTAL GENERAL (incl. TVA)</span>
          <span className="text-2xl font-bold">{formatPrice(totalPrice + (price?.transport || 0) + (price?.montaj || 0) - (price?.discount || 0) + (price?.tva || 0) * windows.reduce((s, w) => s + w.quantity, 0))}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>Oferta este valabilă 30 de zile de la data emiterii.</p>
        <p>Prețurile sunt estimative și pot fi ajustate în funcție de complexitatea execuției.</p>
        <p className="mt-2">Winmeeth SRL - Str. Energiei 470, 605300 Dărmănești | Tel: +40 745 700 363</p>
      </div>
    </div>
  );
}

export function getOfferteEmailBody(
  productType: ProductType,
  width: number,
  height: number,
  profileSeries: ProfileSeries,
  price: number | null,
  dealerName?: string
): string {
  const productNames: Record<ProductType, string> = {
    window_1_canat: "Fereastră 1 canat",
    window_2_canate: "Fereastră 2 canate",
    window_3_canate: "Fereastră 3 canate",
    window_fix: "Fereastră fixă",
    window_1_2_3: "Fereastră (tip)",
    window_cu_lista: "Fereastră cu listă",
    usa_balcon_1: "Ușă balcon 1 canat",
    usa_balcon_2: "Ușă balcon 2 canate",
    usa_intrare_pvc: "Ușă intrare PVC",
    usa_intrare_aluminiu: "Ușă intrare aluminiu",
    pervaz_fereastra: "Pervaz fereastră",
    pervaz_usa: "Pervaz ușă",
  };

  const profile = PROFILE_SERIES.find((p) => p.id === profileSeries);
  
  let body = `Bună ziua,\n\n`;
  body += `Vă mulțumim pentru interesul acordat produselor noastre.\n\n`;
  body += `Am pregătit o solicitare de ofertă pentru următoarea configurație:\n\n`;
  body += `PRODUS: ${productNames[productType]}\n`;
  body += `DIMENSIUNI: ${width} × ${height} mm\n`;
  body += `PROFIL: ${profile?.commercialName || profileSeries}\n`;
  if (price) {
    body += `PREȚ ESTIMATIV: ${formatPrice(price)} (incl. TVA)\n`;
  }
  if (dealerName) {
    body += `DEALER: ${dealerName}\n`;
  }
  body += `\nVom reveni cu o ofertă detaliată în cel mai scurt timp.\n\n`;
  body += `Cu stimă,\n`;
  body += `Echipa Winmeeth SRL\n`;
  body += `Str. Energiei 470, 605300 Dărmănești\n`;
  body += `Tel: +40 745 700 363`;

  return body;
}