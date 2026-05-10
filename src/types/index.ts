export type ProductType =
  | "window_1_canat"
  | "window_2_canate"
  | "window_3_canate"
  | "window_fix"
  | "window_1_2_3"
  | "window_cu_lista"
  | "usa_balcon_1"
  | "usa_balcon_2"
  | "usa_intrare_pvc"
  | "usa_intrare_aluminiu"
  | "pervaz_fereastra"
  | "pervaz_usa";

export type ProfileSeries =
  | "ecoline_58"
  | "ecoline_70"
  | "ecoline_76"
  | "premium_70"
  | "premium_82"
  | "prestige_76"
  | "prestige_85"
  | "prestige_92"
  | "alu_premium_75"
  | "alu_smart_80";

export type OpeningSide = "stanga" | "dreapta" | "bilateral";

export type OpeningType =
  | "fix"
  | "batant_dreapta"
  | "batant_stanga"
  | "basculant"
  | "obluc"
  | "oscilobatant"
  | "ghilotina"
  | "pliant"
  | "coulissant";

export type GlassType =
  | "4mm"
  | "6mm"
  | "4+4Lowe"
  | "tripan_4_12_4"
  | "tripan_4_16_4"
  | "tripan_lowe_4_16_4"
  | "tripan_lowe_4_20_4"
  | "quadrupan"
  | "antiefractie_p4a"
  | "antiefractie_p5"
  | "safety"
  | "og_ornamentala";

export type GlassGap = "6mm" | "8mm" | "10mm" | "12mm" | "16mm" | "20mm";

export type Color =
  | "alb_ral9001"
  | "alb_ral9003"
  | "alb_ral9010"
  | "alb_ral9016"
  | "antracit_ral7016"
  | "antracit_ral7021"
  | "antracit_ral7024"
  | "antracit_martele"
  | "bronz"
  | "stejar_deschis"
  | "stejar_inchis"
  | "stejar_negru"
  | "nuc"
  | "mahon"
  | "castan"
  | "cires"
  | "magnol"
  | "verde_ral6005"
  | "verde_ral6009"
  | "verde_ral6020"
  | "albastru_ral5010"
  | "albastru_ral5017"
  | "albastru_ral5020"
  | "rosu_ral3001"
  | "rosu_ral3003"
  | "rosu_ral3011"
  | "maro_ral8017"
  | "maro_ral8019"
  | "grafit_ral7024"
  | "argintiu_ral9006"
  | "argintiu_ral9007"
  | "negru_ral9005"
  | "negru_ral9011"
  | "maro_ciocolate"
  | "wenge"
  | "gri_ral7035"
  | "gri_ral7037"
  | "gri_ral7040"
  | "gri_ral9005_mica"
  | "dekor_200"
  | "dekor_300"
  | "dekor_400"
  | "dekor_500"
  | "dekor_600"
  | "dekor_700"
  | "dekor_800"
  | "dekor_900"
  | "alb_perlat"
  | "gri_antracit_perlat"
  | "auriu_ral1036"
  | "cupru_ral1061";

export type InteriorColor = Color | "fara_interior";

export type ExteriorColor = Color | "acelasi_ca_exterior";

export type HardwareBrand =
  | "siegenia"
  | "gu"
  | "maco"
  | "roto"
  | "hoppe"
  | "axor"
  | "vhs"
  | "winkhaus";

export type HardwareLevel =
  | "standard"
  | "premium"
  | "super_premium"
  | "auto_lock"
  | "basic";

export type HandleColor = "alb" | "bronz" | "argintiu" | "negru";

export type HandleType = "standard" | "design" | " ergonomic" | "segurar";

export type AccessoryType =
  | "plasa_antipraf"
  | "plasa_insecte"
  | "jaleta_exterioara"
  | "jaleta_interioara"
  | "rulou_casetat"
  | "rulou_exterior"
  | "oblon"
  | "glaf_interior"
  | "glaf_exterior"
  | "pervaz"
  | "calorifer"
  | "treapta_usa"
  | "prag_th";

export type UserRole = "guest" | "client" | "dealer" | "supplier" | "admin";

export interface DealerCode {
  code: string;
  dealerId: string;
  dealerName: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  clientCodes: string[];
}

export interface ClientCode {
  code: string;
  clientId: string;
  clientName: string;
  dealerId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface PriceConfig {
  dealerId: string;
  basePrice: number;
  discountPercent: number;
  marginPercent: number;
  clientDiscountPercent: number;
  lastUpdated: Date;
}

export interface Commission {
  id: string;
  dealerId: string;
  dealerName: string;
  orderId: string;
  orderTotal: number;
  commissionPercent: number;
  commissionAmount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  createdAt: Date;
  paidAt?: Date;
}

export interface Order {
  id: string;
  createdAt: Date;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  dealerId?: string;
  supplierId?: string;
  productType: ProductType;
  width: number;
  height: number;
  profileSeries: ProfileSeries;
  interiorColor: Color;
  exteriorColor: Color;
  glassType: GlassType;
  hardwareBrand: HardwareBrand;
  hardwareLevel: HardwareLevel;
  accessories: AccessoryType[];
  price: PriceBreakdown;
  status: "draft" | "quoted" | "confirmed" | "production" | "completed" | "cancelled";
  notes?: string;
}

export interface SupplierConfig {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  commissionPercent: number;
  defaultDiscount: number;
}

export interface DealerConfig {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  supplierId: string;
  accessCode: string;
  commissionPercent: number;
  customMargin: number;
  isActive: boolean;
}

export interface ClientConfig {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dealerId?: string;
  clientCode?: string;
  isActive: boolean;
}

export interface DatabaseConfig {
  products: ProductConfig[];
  profiles: ProfileConfig[];
  glassTypes: GlassConfig[];
  colors: ColorConfig[];
  accessories: AccessoryConfig[];
  hardwareBrands: HardwareConfig[];
  basePricePerSqm: number;
  discountRates: Record<UserRole, number>;
  transportRatePerKm: number;
  freeTransportKm: number;
  montajPricePerSqm: number;
  tvaRate: number;
}

export interface WizardState {
  step: number;
  productType: ProductType | null;
  width: number;
  height: number;
  profileSeries: ProfileSeries | null;
  openingType: OpeningType | null;
  openingSide: OpeningSide | null;
  interiorColor: InteriorColor | null;
  exteriorColor: ExteriorColor | null;
  glassType: GlassType | null;
  glassGap: GlassGap | null;
  hardwareBrand: HardwareBrand | null;
  hardwareLevel: HardwareLevel | null;
  handleColor: HandleColor | null;
  handleType: HandleType | null;
  accessories: AccessoryType[];
}

export interface PriceBreakdown {
  profile: number;
  glass: number;
  hardware: number;
  accessories: number;
  transport: number;
  montaj: number;
  subtotal: number;
  discount: number;
  tva: number;
  total: number;
}

export interface QuoteData {
  id: string;
  createdAt: Date;
  userId?: string;
  userRole: UserRole;
  productType: ProductType;
  width: number;
  height: number;
  profileSeries: ProfileSeries;
  openingType: OpeningType;
  openingSide: OpeningSide;
  interiorColor: InteriorColor;
  exteriorColor: ExteriorColor;
  glassType: GlassType;
  glassGap: GlassGap;
  hardwareBrand: HardwareBrand;
  hardwareLevel: HardwareLevel;
  handleColor: HandleColor;
  handleType: HandleType;
  accessories: AccessoryType[];
  price: PriceBreakdown;
}

export interface ProductConfig {
  type: ProductType;
  name: string;
  description: string;
  icon: string;
  basePriceMultiplier: number;
  maxWidth: number;
  maxHeight: number;
  canHaveTransom: boolean;
  canHaveSidePanel: boolean;
  isDoor: boolean;
}

export interface ProfileConfig {
  id: ProfileSeries;
  name: string;
  commercialName: string;
  description: string;
  depthMm: number;
  chambers: number;
  thermalBreak: boolean;
  priceMultiplier: number;
  profilePricePerMeter: number;
  maxGlassThickness: number;
 Uw: number;
}

export interface OpeningConfig {
  id: OpeningType;
  name: string;
  description: string;
  priceAdder: number;
  isAvailable: boolean;
  hasOpeningSide: boolean;
}

export interface GlassConfig {
  id: GlassType;
  name: string;
  description: string;
  thickness: number;
  uwValue: number;
  pricePerSqm: number;
  priceMultiplier: number;
}

export interface GlassGapConfig {
  id: GlassGap;
  name: string;
  mm: number;
  priceAdder: number;
}

export interface ColorConfig {
  id: Color;
  name: string;
  hex: string;
  ral: string;
  type: "standard" | "folie" | "vopsit" | "special";
  priceCategory: "standard" | "premium" | "special" | "lux";
  pricePerMeter: number;
  isAvailable: boolean;
}

export interface HardwareConfig {
  id: HardwareBrand;
  name: string;
  country: string;
  warrantyYears: number;
  pricePerSash: number;
  hasAutoLock: boolean;
}

export interface HardwareLevelConfig {
  id: HardwareLevel;
  name: string;
  description: string;
  priceMultiplier: number;
  features: string[];
}

export interface HandleConfig {
  id: HandleColor;
  name: string;
  hex: string;
  priceAdder: number;
}

export interface AccessoryConfig {
  id: AccessoryType;
  name: string;
  description: string;
  priceType: "fix" | "per_sqm" | "per_ml" | "per_buc";
  price: number;
  unit: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}