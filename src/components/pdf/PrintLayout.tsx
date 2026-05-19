"use client";

import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
  
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
    window_1_canat: t("print.productNames.window_1_canat"),
    window_2_canate: t("print.productNames.window_2_canate"),
    window_3_canate: t("print.productNames.window_3_canate"),
    window_fix: t("print.productNames.window_fix"),
    window_1_2_3: t("print.productNames.window_1_canat"),
    window_cu_lista: t("print.productNames.window_1_canat"),
    usa_balcon_1: t("print.productNames.usa_balcon_1"),
    usa_balcon_2: t("print.productNames.usa_balcon_2"),
    usa_intrare_pvc: t("print.productNames.usa_intrare_pvc"),
    usa_intrare_aluminiu: t("print.productNames.usa_intrare_aluminiu"),
    pervaz_fereastra: t("print.productNames.window_fix"),
    pervaz_usa: t("print.productNames.usa_intrare_pvc"),
  };

  return (
    <div className="print-layout p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-blue-600 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Core829 SRL</h1>
          <p className="text-sm text-slate-600">{t("print.subtitle")}</p>
          <p className="text-xs text-slate-500">Tel: +40766668482 | contact.core829@gmail.com</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{t("print.offerTitle")}</p>
          <p className="text-xs text-slate-500">Data: {new Date().toLocaleDateString("ro-RO")}</p>
          <p className="text-xs text-slate-500">Nr. oferta: {Date.now().toString().slice(-8)}</p>
        </div>
      </div>

      {/* Client Info */}
      {(clientName || dealerName) && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">{t("print.clientInfo")}</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {dealerName && <p><span className="text-slate-500">{t("print.dealerLabel")}:</span> {dealerName}</p>}
            {clientName && <p><span className="text-slate-500">{t("print.clientLabel")}:</span> {clientName}</p>}
            {clientEmail && <p><span className="text-slate-500">{t("print.emailLabel")}:</span> {clientEmail}</p>}
            {clientPhone && <p><span className="text-slate-500">{t("print.phoneLabel")}:</span> {clientPhone}</p>}
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{t("print.productsList")} ({windows.length} {t("common.piece")})</h2>
        
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-2 px-2 text-left font-semibold">{t("print.colNr")}</th>
              <th className="py-2 px-2 text-left font-semibold">{t("print.colType")}</th>
              <th className="py-2 px-2 text-left font-semibold">{t("print.colDims")}</th>
              <th className="py-2 px-2 text-center font-semibold">{t("print.colQty")}</th>
              <th className="py-2 px-2 text-right font-semibold">{t("print.colArea")}</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((win, idx) => (
              <tr key={win.id} className={`border-b ${idx === activeWindowIndex ? 'bg-primary-50' : ''}`}>
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2 font-medium">{productNames[win.productType] || win.productType}</td>
                <td className="py-2 px-2">{win.width} × {win.height} {t("common.mm")}</td>
                <td className="py-2 px-2 text-center">{win.quantity}</td>
                <td className="py-2 px-2 text-right">{((win.width * win.height) / 1000000 * win.quantity).toFixed(3)} {t("common.sqm")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold bg-slate-50">
              <td colSpan={4} className="py-2 px-2">{t("print.total")}</td>
              <td className="py-2 px-2 text-right">
                {windows.reduce((sum, w) => sum + (w.width * w.height) / 1000000 * w.quantity, 0).toFixed(3)} {t("common.sqm")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Configuration Summary */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{t("print.configSummary")}</h2>
        
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-slate-600">{t("print.profileSeries")}</td>
              <td className="py-2 font-medium">{profile?.commercialName || profileSeries}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">{t("print.glass")}</td>
              <td className="py-2 font-medium">{glass?.name || glassType} (Uw: {getGlassUwValue(glassType || "tripan_4_12_4")})</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">{t("print.interiorColor")}</td>
              <td className="py-2 font-medium">{intColor?.name || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">{t("print.exteriorColor")}</td>
              <td className="py-2 font-medium">{extColor?.name || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-slate-600">{t("print.hardware")}</td>
              <td className="py-2 font-medium">{hw?.name || "Siegenia"} {hwLevel.name}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Accessories */}
      {accessories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">{t("print.selectedAccessories")}</h2>
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
          <h2 className="text-sm font-semibold text-slate-700 mb-2">{t("print.additionalServices")}</h2>
          <ul className="text-sm">
            {distance > 0 && <li>• {t("print.transport")}: {distance} km</li>}
            {includeMontaj && <li>• {t("print.installIncluded")}</li>}
          </ul>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded">
          <p className="text-sm text-amber-800"><strong>{t("print.notes")}:</strong> {notes}</p>
        </div>
      )}

      {/* Price Summary - Detailed per product */}
      <div className="mt-8 border-2 border-primary-600 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-primary-600 mb-4">{t("print.priceSummary")}</h2>
        
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b">
              <th className="py-1 text-left text-slate-600">{t("print.colProduct")}</th>
              <th className="py-1 text-center text-slate-600">{t("print.colQty")}</th>
              <th className="py-1 text-right text-slate-600">{t("print.colUnitPrice")}</th>
              <th className="py-1 text-right text-slate-600">{t("print.colTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((win) => {
              const winPrice = getPriceForWindow(win);
              return (
                <tr key={win.id} className="border-b">
                  <td className="py-1 text-slate-600">
                    {productNames[win.productType] || win.productType} ({win.width}×{win.height}{t("common.mm")})
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
                  <td colSpan={3} className="py-1 text-slate-600">{t("print.transport")}</td>
                  <td className="py-1 text-right">{formatPrice(price.transport)}</td>
                </tr>
                {price.montaj > 0 && (
                  <tr className="border-b">
                    <td colSpan={3} className="py-1 text-slate-600">{t("print.install")}</td>
                    <td className="py-1 text-right">{formatPrice(price.montaj)}</td>
                  </tr>
                )}
                {price.discount > 0 && (
                  <tr className="text-primary-600">
                    <td colSpan={3} className="py-1">{t("print.discount")}</td>
                    <td className="py-1 text-right">-{formatPrice(price.discount)}</td>
                  </tr>
                )}
                <tr className="border-t border-slate-300 font-medium">
                  <td colSpan={3} className="py-2">{t("print.vat")} ({Math.round(TVA_RATE * 100)}%)</td>
                  <td className="py-2 text-right">{formatPrice(price.tva * windows.reduce((sum, w) => sum + w.quantity, 0))}</td>
                </tr>
              </>
            )}
          </tfoot>
        </table>
        
        <div className="bg-primary-600 text-white p-4 rounded-lg flex justify-between items-center">
          <span className="text-lg font-bold">{t("print.grandTotal")} ({t("print.vat")})</span>
          <span className="text-2xl font-bold">{formatPrice(totalPrice + (price?.transport || 0) + (price?.montaj || 0) - (price?.discount || 0) + (price?.tva || 0) * windows.reduce((s, w) => s + w.quantity, 0))} {t("common.lei")}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>{t("print.footer.validity")}</p>
        <p>{t("print.footer.estimate")}</p>
        <p className="mt-2">Core829 SRL - contact.core829@gmail.com | Tel: +40766668482</p>
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
  body += `Echipa Core829 SRL\n`;
  body += `contact.core829@gmail.com\n`;
  body += `Tel: +40 745 700 363`;

  return body;
}