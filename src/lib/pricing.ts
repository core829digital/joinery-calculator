import type {
  ProductType,
  ProfileSeries,
  GlassType,
  Color,
  HardwareBrand,
  HardwareLevel,
  AccessoryType,
  UserRole,
  PriceBreakdown,
} from "@/types";
import {
  PRODUCT_TYPES,
  PROFILE_SERIES,
  GLASS_TYPES,
  COLORS,
  HARDWARE_LEVELS,
  ACCESSORIES,
  DISCOUNT_RATES,
  TVA_RATE,
  TRANSPORT_RATE_PER_KM,
  FREE_TRANSPORT_KM,
} from "@/data/joinery";

export interface PricingInput {
  productType: ProductType;
  width: number;
  height: number;
  profileSeries: ProfileSeries;
  glassType: GlassType;
  interiorColor: Color;
  exteriorColor: Color;
  hardwareBrand: HardwareBrand;
  hardwareLevel: HardwareLevel;
  accessories: AccessoryType[];
  userRole: UserRole;
  distance: number;
  includeMontaj: boolean;
}

export function calculatePrice(input: PricingInput): PriceBreakdown {
  const {
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
  } = input;

  const area = (width * height) / 1000000;
  const perimeter = ((width + height) * 2) / 1000;

  const product = PRODUCT_TYPES.find((p) => p.type === productType);
  const profile = PROFILE_SERIES.find((p) => p.id === profileSeries);
  const glass = GLASS_TYPES.find((g) => g.id === glassType);
  const intColor = COLORS.find((c) => c.id === interiorColor);
  const extColor = COLORS.find((c) => c.id === exteriorColor);
  const hwLevel = HARDWARE_LEVELS[hardwareLevel || "standard"];

  if (!product || !profile || !glass) {
    throw new Error("Invalid configuration");
  }

  // Real material cost calculation

  // 1. PROFILE COST (calculated per linear meter of frame)
  // Formula: perimeter_m * profile_price_per_m * profile_price_multiplier
  const profilePricePerMeter: Record<string, number> = {
    ecoline_58: 18,
    ecoline_70: 22,
    ecoline_76: 26,
    premium_70: 28,
    premium_82: 32,
    prestige_76: 35,
    prestige_85: 40,
    prestige_92: 48,
    alu_premium_75: 55,
    alu_smart_80: 68,
  };
  const ppm = profilePricePerMeter[profileSeries] || 30;
  const profileCost = perimeter * ppm * profile.priceMultiplier;

  // 2. GLASS COST (calculated per square meter)
  // Glass price varies by type and thickness
  const glassPricePerSqm: Record<string, number> = {
    sticla_4mm: 120,
    sticla_6mm: 150,
    tripan_4_12_4: 180,
    tripan_4_16_4: 195,
    tripan_lowe_4_16_4: 220,
    tripan_lowe_4_20_4: 245,
    quadrupan_4_12_4_12_4: 310,
    sticla_antiefractie: 280,
    sticla_safety: 250,
    og_3mm: 160,
  };
  const gpm = glassPricePerSqm[glassType] || 180;
  const glassCost = area * gpm * glass.priceMultiplier;

  // 3. HARDWARE COST (per sash, different for windows vs doors)
  const sashCount = productType.includes("usa") ? 1 :
    productType === "window_1_canat" ? 1 :
    productType === "window_2_canate" || productType === "usa_balcon_2" ? 2 :
    productType === "window_3_canate" ? 3 :
    productType === "window_fix" ? 0 : 1;

  const hardwarePricePerSash: Record<string, number> = {
    siegenia: 85,
    gu: 80,
    maco: 75,
    " roto": 70,
    hoppe: 55,
    axor: 45,
    vhs: 35,
  };
  const hps = hardwarePricePerSash[hardwareBrand] || 70;
  const hardwareCost = sashCount * hps * hwLevel.priceMultiplier;

  // 4. COLOR COST (per linear meter of visible profile, both sides)
  const colorPricePerMeter = ((intColor?.pricePerMeter || 0) + (extColor?.pricePerMeter || 0)) / 2;
  const colorCost = perimeter * colorPricePerMeter * 2;

  // 5. GASKET / SEALING COST (per linear meter)
  const gasketCost = perimeter * 3.5;

  // 6. ACCESSORIES COST
  let accessoriesCost = 0;
  accessories.forEach((accId) => {
    const acc = ACCESSORIES.find((a) => a.id === accId);
    if (!acc) return;
    if (acc.priceType === "per_sqm") {
      accessoriesCost += acc.price * area;
    } else if (acc.priceType === "per_ml") {
      accessoriesCost += acc.price * perimeter;
    } else {
      accessoriesCost += acc.price;
    }
  });

  // 7. SUBTOTAL
  const rawMaterialCost = profileCost + glassCost + hardwareCost + colorCost + gasketCost + accessoriesCost;

  // 8. LABOR & OVERHEAD (typically 25-35% of material cost for fabrication)
  const laborCost = rawMaterialCost * 0.25;

  // 9. PACKAGING & LOGISTICS
  const packagingCost = area > 2 ? 85 : 55;

  const subtotalWithoutDiscount = rawMaterialCost + laborCost + packagingCost;

  // 10. DISCOUNT (dealer)
  const discount = subtotalWithoutDiscount * DISCOUNT_RATES[userRole];
  const afterDiscount = subtotalWithoutDiscount - discount;

  // 11. TRANSPORT
  const transport =
    distance > FREE_TRANSPORT_KM
      ? (distance - FREE_TRANSPORT_KM) * TRANSPORT_RATE_PER_KM * Math.ceil(area / 0.5)
      : 0;

  // 12. MONTAJ
  const montajCost = includeMontaj ? area * 120 : 0;

  // 13. TOTAL WITHOUT TVA
  const totalWithoutTVA = afterDiscount + transport + montajCost;

  // 14. TVA 21%
  const tvaAmount = totalWithoutTVA * TVA_RATE;

  // 15. FINAL TOTAL
  const total = totalWithoutTVA + tvaAmount;

  return {
    profile: Math.round(profileCost + laborCost * 0.6),
    glass: Math.round(glassCost),
    hardware: Math.round(hardwareCost),
    accessories: Math.round(colorCost + gasketCost + accessoriesCost),
    transport: Math.round(transport),
    montaj: Math.round(montajCost),
    subtotal: Math.round(subtotalWithoutDiscount),
    discount: Math.round(discount),
    tva: Math.round(tvaAmount),
    total: Math.round(total),
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProductTypeName(type: ProductType): string {
  const product = PRODUCT_TYPES.find((p) => p.type === type);
  return product?.name || type;
}

export function getProfileName(series: ProfileSeries): string {
  const profile = PROFILE_SERIES.find((p) => p.id === series);
  return profile?.commercialName || series;
}

export function getColorName(color: Color): string {
  const colorConfig = COLORS.find((c) => c.id === color);
  return colorConfig?.name || color;
}

export function getGlassName(glassType: GlassType): string {
  const glass = GLASS_TYPES.find((g) => g.id === glassType);
  return glass?.name || glassType;
}

export function getGlassUwValue(glassType: GlassType): string {
  const glass = GLASS_TYPES.find((g) => g.id === glassType);
  return glass ? `Uw = ${glass.uwValue} W/m²K` : "";
}