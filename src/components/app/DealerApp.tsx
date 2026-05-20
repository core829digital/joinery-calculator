"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type {
  ProductType,
  ProfileSeries,
  OpeningType,
  GlassType,
  Color,
  HardwareBrand,
  HardwareLevel,
  AccessoryType,
  UserRole,
  Order,
} from "@/types";
import { MENU_CATEGORIES } from "@/data/joinery";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Window2D, { WindowComponent, SashRole } from "@/components/canvas/Window2D";
import {
  ProductTypePanel,
} from "@/components/panels/ProductPanels";
import {
  ProfilePanel,
  GlassPanel,
  ColorsPanel,
  HardwarePanel,
  AccessoriesPanel,
} from "@/components/panels/ConfigurationPanels";
import {
  PricingPanel,
  ActionsPanel,
  ServicesPanel,
} from "@/components/panels/PricingPanels";
import PrintLayout from "@/components/pdf/PrintLayout";
import { calculatePrice, formatPrice } from "@/lib/pricing";
import { useTranslation } from "@/lib/i18n";
import {
  Layers,
  Frame,
  Palette,
  Square,
  Settings,
  PlusSquare,
  Truck,
  FileText,
  Send,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  Ruler,
} from "lucide-react";

const MENU_ICONS: Record<string, React.ReactNode> = {
  produse: <Layers className="w-5 h-5" />,
  profil: <Frame className="w-5 h-5" />,
  culori: <Palette className="w-5 h-5" />,
  sticla: <Square className="w-5 h-5" />,
  feronerie: <Settings className="w-5 h-5" />,
  accesorii: <PlusSquare className="w-5 h-5" />,
  servicii: <Truck className="w-5 h-5" />,
  ofertare: <FileText className="w-5 h-5" />,
};

const COMPONENT_TO_MENU: Record<WindowComponent, string> = {
  toc: "profil",
  canat: "profil",
  sticla: "sticla",
  baghete: "sticla",
  maner: "feronerie",
  balamale: "feronerie",
  glaf: "accesorii",
  prag: "accesorii",
  stulp: "profil",
  montant: "profil",
};

interface DealerAppProps {
  userRole?: UserRole;
  clientCode?: string | null;
  dealerId?: string;
}

const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  window_1_canat: "Fereastră 1 canat",
  window_2_canate: "Fereastră 2 canate",
  window_3_canate: "Fereastră 3 canate",
  window_fix: "Fereastră Fix",
  usa_balcon_1: "Ușă balcon 1 canat",
  usa_balcon_2: "Ușă balcon 2 canate",
  usa_intrare_pvc: "Ușă intrare PVC",
  usa_intrare_aluminiu: "Ușă intrare Aluminiu",
  pervaz_fereastra: "Pervaz fereastră",
  pervaz_usa: "Pervaz ușă",
};

const getProductDisplayName = (type: ProductType | null | undefined): string => {
  if (!type) return "Fereastră";
  return PRODUCT_DISPLAY_NAMES[type] || "Produs";
};

export default function DealerApp({ userRole = "dealer", clientCode, dealerId }: DealerAppProps) {
  const { addOrder } = useAuth();
  const { t } = useTranslation();
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [profileSeries, setProfileSeries] = useState<ProfileSeries | null>(null);
  const [interiorColor, setInteriorColor] = useState<Color | null>(null);
  const [exteriorColor, setExteriorColor] = useState<Color | null>(null);
  const [glassType, setGlassType] = useState<GlassType | null>(null);
  const [hardwareBrand, setHardwareBrand] = useState<HardwareBrand | null>(null);
  const [hardwareLevel, setHardwareLevel] = useState<HardwareLevel | null>(null);
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [distance, setDistance] = useState(30);
  const [includeMontaj, setIncludeMontaj] = useState(false);

  // Per-window config
  interface WindowConfig {
    id: number;
    name: string;
    productType: ProductType;
    quantity: number;
    width: number;
    height: number;
    openingType: OpeningType | null;
    openingSide: "left" | "right";
    openingDirection: "inward" | "outward";
    sashConfiguration: "stulp" | "montant" | null;
    sashRoles: Record<string, "active" | "inactive" | "fixed">;
    sashOpeningTypes: Record<string, OpeningType>;
    showThreshold: boolean;
    horizontalMuntin: boolean;
    handleHeight: number;
  }
  
  const defaultWindowConfig: Omit<WindowConfig, "id" | "name" | "productType" | "quantity"> = {
    width: 1200,
    height: 1400,
    openingType: null,
    openingSide: "right",
    openingDirection: "inward",
    sashConfiguration: null,
    sashRoles: {},
    sashOpeningTypes: {},
    showThreshold: false,
    horizontalMuntin: false,
    handleHeight: 100,
  };
  
  const [activeMenu, setActiveMenu] = useState("produse");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedComponent, setSelectedComponent] = useState<WindowComponent | null>(null);
  const [showPreview] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  
  // Order Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });
  
  // Window Info Popup
  const [showInfoPopup, setShowInfoPopup] = useState<number | null>(null);
  
  // Print/Export state
  const [showPrintView, setShowPrintView] = useState(false);

  // Popup state for configuration panels (desktop)
  const [showPanelPopup, setShowPanelPopup] = useState(false);

  const configDropdownRef = useRef<HTMLDivElement>(null);

  // Left sidebar state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);

  // Multi-window state — starts empty, user adds first product
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);
  const [showAddWindowMenu, setShowAddWindowMenu] = useState(false);
  
  // Draft dimensions for live editing without instant validation
  const [draftDimensions, setDraftDimensions] = useState<Record<number, { w: string; h: string }>>({});
  
  const activeWindow = windows[activeWindowIndex] ?? null;

  // Update window names when productType changes - only for NEW default
  useEffect(() => {
    if (productType) {
      setWindows(prev => prev.map((win, idx) => ({
        ...win,
        name: getProductDisplayName(productType) + ` #${idx + 1}`
      })));
    }
  }, [productType]);
  
  const addWindow = (type?: ProductType) => {
    const newId = windows.length + 1;
    const windowType = type || productType || "window_2_canate";
    setWindows([...windows, { 
      id: newId, 
      name: getProductDisplayName(windowType) + " #" + newId, 
      productType: windowType,
      quantity: 1,
      ...defaultWindowConfig 
    }]);
    setActiveWindowIndex(windows.length);
  };

  const removeWindow = (index: number) => {
    if (windows.length <= 1) return;
    const newWindows = windows.filter((_, i) => i !== index);
    setWindows(newWindows);
    // Clean up draft dimensions for removed window
    const removedWin = windows[index];
    setDraftDimensions(prev => {
      const next = { ...prev };
      delete next[removedWin.id];
      return next;
    });
    if (activeWindowIndex >= newWindows.length) {
      setActiveWindowIndex(newWindows.length - 1);
    }
  };

  const duplicateWindow = (index: number) => {
    if (windows.length === 0) return;
    const winToClone = windows[index];
    const newId = windows.length > 0 ? Math.max(...windows.map(w => w.id)) + 1 : 1;
    const newWindow = { ...winToClone, id: newId, name: getProductDisplayName(productType) + " #" + newId };
    setWindows([...windows, newWindow]);
    setActiveWindowIndex(windows.length);
  };

  // Commit draft dimensions to window state with validation
  const commitDimension = (winId: number, field: "width" | "height", rawValue: string | undefined) => {
    if (!rawValue || rawValue.trim() === "") return; // Keep current value if empty
    const num = parseInt(rawValue, 10);
    if (isNaN(num) || num < 0) return; // Reject invalid
    const clamped = Math.min(num, 5000); // Cap at 5000mm
    setWindows(prev => prev.map(w => w.id === winId ? { ...w, [field]: clamped } : w));
    // Clear draft
    setDraftDimensions(prev => {
      const current = prev[winId];
      if (!current) return prev;
      const next = { ...current, [field === "width" ? "w" : "h"]: String(clamped) };
      return { ...prev, [winId]: next };
    });
  };

  // Initialize draft dimensions when window is added
  useEffect(() => {
    setDraftDimensions(prev => {
      const next = { ...prev };
      windows.forEach(win => {
        if (!next[win.id]) {
          next[win.id] = { w: String(win.width), h: String(win.height) };
        }
      });
      return next;
    });
  }, [windows]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleAccessory = useCallback((id: AccessoryType) => {
    setAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  const handleComponentClick = useCallback((component: WindowComponent) => {
    setSelectedComponent(component);
    const menu = COMPONENT_TO_MENU[component];
    setActiveMenu(menu);
    if (!isMobile) {
      setShowPanelPopup(true);
    }
  }, [isMobile]);

  const handleReset = () => {
    setProductType(null);
    setProfileSeries(null);
    setInteriorColor(null);
    setExteriorColor(null);
    setGlassType(null);
    setHardwareBrand(null);
    setHardwareLevel(null);
    setAccessories([]);
    setDistance(30);
    setIncludeMontaj(false);
    setActiveMenu("produse");
    setSelectedComponent(null);
    // Reset active window to defaults
    setWindows(prev => prev.map((win, idx) => 
      idx === activeWindowIndex ? { ...win, ...defaultWindowConfig } : win
    ));
  };

  const handleSave = () => {
    if (!activeWindow?.productType) {
      alert(t("configurator.warnings.selectProductBeforeSave"));
      return;
    }

    const order: Order = {
      id: `order_${Date.now()}`,
      createdAt: new Date(),
      clientId: clientCode || undefined,
      dealerId: dealerId || undefined,
      supplierId: "supplier_1",
      productType: activeWindow.productType,
      width: activeWindow.width,
      height: activeWindow.height,
      profileSeries: profileSeries || "premium_82",
      interiorColor: interiorColor || "alb_ral9003",
      exteriorColor: exteriorColor || "antracit_ral7016",
      glassType: glassType || "tripan_4_16_4",
      hardwareBrand: hardwareBrand || "siegenia",
      hardwareLevel: hardwareLevel || "premium",
      accessories,
      price: {
        profile: 0,
        glass: 0,
        hardware: 0,
        accessories: 0,
        transport: 0,
        montaj: 0,
        subtotal: 0,
        discount: 0,
        tva: 0,
        total: 0,
      },
      status: "draft",
    };

    addOrder(order);
    alert(t("configurator.warnings.configSaved"));
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      // Search in menu categories
      const matchedCategories = MENU_CATEGORIES.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query.toLowerCase()) ||
          cat.id.toLowerCase().includes(query.toLowerCase())
      );
      if (matchedCategories.length > 0) {
        setActiveMenu(matchedCategories[0].id);
        setSelectedComponent(null);
      }
    }
  }, []);

  const handleFilter = useCallback((filterType: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[filterType] || [];
      if (current.includes(value)) {
        return { ...prev, [filterType]: current.filter((v) => v !== value) };
      }
      return { ...prev, [filterType]: [...current, value] };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setShowFilters(false);
  }, []);

  const handleExportPDF = useCallback(() => {
    const winProductType = activeWindow?.productType;
    if (!winProductType) {
      alert(t("configurator.warnings.selectProductBeforeExport"));
      return;
    }
    setShowPrintView(true);
  }, [activeWindow?.productType, t]);

  const handlePrint = useCallback(() => {
    const winProductType = activeWindow?.productType;
    if (!winProductType) {
      alert(t("configurator.warnings.selectProductBeforePrint"));
      return;
    }
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
    }, 500);
  }, [activeWindow?.productType, t]);

  const handleSendEmail = useCallback(() => {
    if (!activeWindow?.productType) {
      alert(t("configurator.warnings.selectProductBeforeEmail"));
      return;
    }
    setShowOrderModal(true);
  }, [activeWindow?.productType, t]);

  const handleConfirmOrder = useCallback(() => {
    if (!activeWindow?.productType) return;

    const price = glassType && interiorColor && exteriorColor
      ? calculatePrice({
          productType: activeWindow.productType,
      width: activeWindow.width,
      height: activeWindow.height,
      profileSeries: profileSeries || "premium_82",
          glassType,
          interiorColor,
          exteriorColor,
          hardwareBrand: hardwareBrand || "siegenia",
          hardwareLevel: hardwareLevel || "standard",
          accessories,
          userRole,
          distance,
          includeMontaj,
        })
      : null;

    const order: Order = {
      id: `order_${Date.now()}`,
      createdAt: new Date(),
      clientId: clientCode || undefined,
      clientName: orderForm.clientName || undefined,
      clientEmail: orderForm.clientEmail || undefined,
      clientPhone: orderForm.clientPhone || undefined,
      notes: orderForm.notes || undefined,
      dealerId: dealerId || undefined,
      supplierId: "supplier_1",
      productType: activeWindow.productType,
      width: activeWindow.width,
      height: activeWindow.height,
      profileSeries: profileSeries || "premium_82",
      interiorColor: interiorColor || "alb_ral9003",
      exteriorColor: exteriorColor || "antracit_ral7016",
      glassType: glassType || "tripan_4_16_4",
      hardwareBrand: hardwareBrand || "siegenia",
      hardwareLevel: hardwareLevel || "premium",
      accessories,
      price: price ? {
        profile: price.profile,
        glass: price.glass,
        hardware: price.hardware,
        accessories: price.accessories,
        transport: price.transport,
        montaj: price.montaj,
        subtotal: price.subtotal,
        discount: price.discount,
        tva: price.tva,
        total: price.total,
      } : {
        profile: 0,
        glass: 0,
        hardware: 0,
        accessories: 0,
        transport: 0,
        montaj: 0,
        subtotal: 0,
        discount: 0,
        tva: 0,
        total: 0,
      },
      status: "quoted",
    };

    addOrder(order);
    
    // Send email if client email provided
    if (orderForm.clientEmail && activeWindow?.productType) {
      const subject = t("email.subjectWithProduct", { product: getProductDisplayName(activeWindow.productType) });
      const body = `${t("email.greeting")},\n\n${t("email.bodyIntro")}:\n\n` +
        `${t("email.productLabel")}: ${getProductDisplayName(activeWindow.productType)}\n` +
        `${t("email.dimensionsLabel")}: ${activeWindow.width} × ${activeWindow.height} mm\n` +
        `${t("email.profileLabel")}: ${profileSeries || "premium_82"}\n` +
        `${t("email.colorsLabel")}: ${t("email.interior")} - ${interiorColor || "alb"}, ${t("email.exterior")} - ${exteriorColor || "antracit"}\n` +
        `${t("email.glassLabel")}: ${glassType || "tripan"}\n` +
        `${t("email.hardwareLabel")}: ${hardwareBrand || "siegenia"}\n` +
        (price ? `${t("email.estimatedPriceLabel")}: ${formatPrice(price.total)} (incl. TVA)\n` : "") +
        `\n${t("email.clientDataLabel")}:\n${t("email.name")}: ${orderForm.clientName || "—"}\n${t("email.emailLabel")}: ${orderForm.clientEmail}\n${t("email.phoneLabel")}: ${orderForm.clientPhone || "—"}\n` +
        `\n${t("email.regards")},\n${t("email.signature")}\ncontact.core829@gmail.com\nTel: +40766668482`;
      
      window.location.href = `mailto:contact.core829@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    setShowOrderModal(false);
    setOrderForm({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
    alert(t("configurator.warnings.orderSent"));
  }, [activeWindow, profileSeries, glassType, interiorColor, exteriorColor, hardwareBrand, hardwareLevel, accessories, userRole, distance, includeMontaj, clientCode, dealerId, orderForm, addOrder, t]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeCategory = MENU_CATEGORIES.find((c) => c.id === activeMenu);

  // Filter items for quick filtering
  const filterOptions = {
    produse: [
      { id: "window", label: t("configurator.filters.windows") },
      { id: "door", label: t("configurator.filters.doors") },
      { id: "balcony", label: t("configurator.filters.balcony") },
      { id: "harmonic", label: t("configurator.filters.harmonic") },
    ],
    profil: [
      { id: "premium_82", label: t("configurator.filters.premium82") },
      { id: "premium_70", label: t("configurator.filters.premium70") },
      { id: "standard_60", label: t("configurator.filters.standard60") },
    ],
    sticla: [
      { id: "tripan", label: t("configurator.filters.tripan") },
      { id: "monopane", label: t("configurator.filters.monopane") },
    ],
    feronerie: [
      { id: "siegenia", label: t("configurator.filters.siegenia") },
      { id: "roto", label: t("configurator.filters.roto") },
      { id: "gu", label: t("configurator.filters.gu") },
    ],
  };

  // Config popup handlers
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [configPopupWindowIdx, setConfigPopupWindowIdx] = useState<number | null>(null);

  const openConfigForWindow = (idx: number) => {
    setActiveWindowIndex(idx);
    setConfigPopupWindowIdx(idx);
    setShowConfigPopup(true);
  };

  const closeConfigPopup = () => {
    setShowConfigPopup(false);
    setConfigPopupWindowIdx(null);
  };

  const updateWindowField = (idx: number, key: string, value: unknown) => {
    setWindows(prev => prev.map((w, i) => i === idx ? { ...w, [key]: value } : w));
  };

  // Close config dropdown on resize only (not scroll - popup has its own scroll)
  useEffect(() => {
    if (!showConfigPopup) return;
    const handleResize = () => setShowConfigPopup(false);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showConfigPopup]);

  // Config popup rendered inline - not an IIFE
  const configPopupWin = configPopupWindowIdx !== null ? windows[configPopupWindowIdx] : null;
  const configSashes = configPopupWin
    ? (configPopupWin.productType === "window_1_canat" || configPopupWin.productType === "usa_balcon_1"
      ? [{ side: configPopupWin.openingSide || "right" }]
      : configPopupWin.productType === "window_fix"
      ? []
      : configPopupWin.productType === "window_3_canate"
      ? [{ side: "left" }, { side: "center" }, { side: "right" }]
      : [{ side: "left" }, { side: "right" }])
    : [];

  const configDropdown = showConfigPopup && configPopupWin && configPopupWindowIdx !== null && (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeConfigPopup(); }}
    >
      <div 
        ref={configDropdownRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-slate-800">{t("configurator.configPopup.title")}</h3>
          <button onClick={closeConfigPopup} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Product Type Selector */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <label className="block text-sm font-medium text-slate-700 mb-2">{t("configurator.configPopup.productType")}</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: "window_1_canat" as ProductType, label: t("configurator.productTypes.window_1_canat") },
              { type: "window_2_canate" as ProductType, label: t("configurator.productTypes.window_2_canate") },
              { type: "window_3_canate" as ProductType, label: t("configurator.productTypes.window_3_canate") },
              { type: "window_fix" as ProductType, label: t("configurator.productTypes.window_fix") },
              { type: "usa_balcon_1" as ProductType, label: t("configurator.productTypes.usa_balcon_1") },
              { type: "usa_balcon_2" as ProductType, label: t("configurator.productTypes.usa_balcon_2") },
            ].map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  updateWindowField(configPopupWindowIdx, "productType", opt.type);
                  updateWindowField(configPopupWindowIdx, "name", getProductDisplayName(opt.type) + " #" + (configPopupWindowIdx + 1));
                }}
                className={cn(
                  "p-2 rounded-lg border text-xs font-medium transition-all",
                  configPopupWin.productType === opt.type
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-slate-200 hover:border-primary-300 text-slate-600"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reverse Opening Direction */}
        <div className="p-4 border-b border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2">Direcție Deschidere</label>
          <button
            onClick={() => {
              const currentSide = configPopupWin.openingSide;
              updateWindowField(configPopupWindowIdx, "openingSide", currentSide === "left" ? "right" : "left");
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <svg className="w-5 h-5 text-slate-500 group-hover:text-primary-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors">
              {t("configurator.configPopup.reverseOpening")} ({configPopupWin.openingSide === "left" ? t("configurator.configPopup.left") : t("configurator.configPopup.right")} → {configPopupWin.openingSide === "left" ? t("configurator.configPopup.right") : t("configurator.configPopup.left")})
            </span>
          </button>
        </div>

        {/* Visual Sash Selection */}
        {configSashes.length > 0 && (
          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">{t("configurator.configPopup.sashSelection")}</label>
            <div className="flex justify-center gap-2">
              {configSashes.map((sash, idx) => {
                const sashId = sash.side || String(idx);
                const role = configPopupWin.sashRoles[sashId] || "active";
                const label = sash.side === "left" ? t("configurator.configPopup.sashLeft") : sash.side === "right" ? t("configurator.configPopup.sashRight") : sash.side === "center" ? t("configurator.configPopup.sashCenter") : `${t("configurator.configPopup.sashN")} ${idx + 1}`;
                return (
                  <div
                    key={sashId}
                    className={cn(
                      "p-4 rounded-xl border-2 min-w-[120px]",
                      "border-primary-500 bg-primary-50 ring-2 ring-primary-500"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-20 rounded-lg border-2 mx-auto mb-2",
                      role === "active" ? "border-green-500 bg-green-50" : 
                      role === "inactive" ? "border-amber-500 bg-amber-50" : 
                      "border-slate-400 bg-slate-100"
                    )}>
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-600">{sash.side === "left" ? "←" : sash.side === "right" ? "→" : "○"}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-800">{label}</div>
                    <div className={cn(
                      "text-xs mt-1",
                      role === "active" ? "text-green-600" : 
                      role === "inactive" ? "text-amber-600" : 
                      "text-slate-500"
                    )}>
                      {role === "active" ? t("configurator.configPopup.active") : role === "inactive" ? t("configurator.configPopup.inactive") : t("configurator.configPopup.fixed")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Window Options */}
        <div className="p-4 space-y-4 border-b border-slate-100">
          <label className="block text-sm font-medium text-slate-700">{t("configurator.configPopup.windowOptions")}</label>
          
          {/* Stulp / Montant */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("configurator.configPopup.stulp")} / {t("configurator.configPopup.montant")}</label>
            <div className="flex gap-2">
              <button onClick={() => updateWindowField(configPopupWindowIdx, "sashConfiguration", "stulp")} className={cn("flex-1 p-2 rounded-lg border text-center text-xs transition-all", configPopupWin.sashConfiguration === "stulp" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 hover:border-purple-300")}>{t("configurator.configPopup.stulp")}</button>
              <button onClick={() => updateWindowField(configPopupWindowIdx, "sashConfiguration", "montant")} className={cn("flex-1 p-2 rounded-lg border text-center text-xs transition-all", configPopupWin.sashConfiguration === "montant" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300")}>{t("configurator.configPopup.montant")}</button>
              <button onClick={() => updateWindowField(configPopupWindowIdx, "sashConfiguration", null)} className={cn("flex-1 p-2 rounded-lg border text-center text-xs transition-all", !configPopupWin.sashConfiguration ? "border-slate-500 bg-slate-100 text-slate-700" : "border-slate-200 hover:border-slate-400")}>{t("configurator.configPopup.none")}</button>
            </div>
          </div>

          {/* Prag */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-500">{t("configurator.configPopup.threshold")}</label>
            <button onClick={() => updateWindowField(configPopupWindowIdx, "showThreshold", !configPopupWin.showThreshold)} className={cn("w-12 h-6 rounded-full transition-colors", configPopupWin.showThreshold ? "bg-primary-600" : "bg-slate-300")}>
              <div className={cn("w-5 h-5 bg-white rounded-full shadow transform transition-transform", configPopupWin.showThreshold ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>

          {/* Montant Orizontal */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-500">{t("configurator.configPopup.horizontalMuntin")}</label>
            <button onClick={() => updateWindowField(configPopupWindowIdx, "horizontalMuntin", !configPopupWin.horizontalMuntin)} className={cn("w-12 h-6 rounded-full transition-colors", configPopupWin.horizontalMuntin ? "bg-primary-600" : "bg-slate-300")}>
              <div className={cn("w-5 h-5 bg-white rounded-full shadow transform transition-transform", configPopupWin.horizontalMuntin ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>

          {/* Handle Height */}
          <div>
            <div className="text-xs text-slate-500 mb-1">{t("configurator.configPopup.handleHeight")}: {configPopupWin.handleHeight}mm</div>
            <input type="range" min="30" max="200" value={configPopupWin.handleHeight} onChange={(e) => updateWindowField(configPopupWindowIdx, "handleHeight", Number(e.target.value))} className="w-full h-1.5 accent-primary-600" />
          </div>
        </div>

        {/* Per-Sash Configuration */}
        {configSashes.length > 0 && (
          <div className="p-4 space-y-4">
            {configSashes.map((sash, idx) => {
              const sashId = sash.side || String(idx);
              const role = configPopupWin.sashRoles[sashId] || "active";
              const openingType = configPopupWin.sashOpeningTypes[sashId] || "normal";
              const label = sash.side === "left" ? t("configurator.configPopup.sashLeft") : sash.side === "right" ? t("configurator.configPopup.sashRight") : sash.side === "center" ? t("configurator.configPopup.sashCenter") : `${t("configurator.configPopup.sashN")} ${idx + 1}`;
              const openingOptions = role === "inactive"
                ? [{ id: "normal", label: t("configurator.configPopup.openingNormal"), desc: t("configurator.configPopup.normalDesc"), disabled: false }]
                : [
                    { id: "normal", label: t("configurator.configPopup.openingNormal"), desc: t("configurator.configPopup.normalDesc"), disabled: false },
                    { id: "oscilobatant", label: t("configurator.configPopup.openingOscilobatant"), desc: t("configurator.configPopup.oscilobatantDesc"), disabled: false },
                    { id: "batant", label: t("configurator.configPopup.openingBatant"), desc: t("configurator.configPopup.batantDesc"), disabled: false },
                  ];

              return (
                <div key={sashId} className="p-3 bg-slate-50 rounded-xl space-y-3">
                  <div className="text-sm font-semibold text-slate-700">{label}</div>
                  
                  {/* Rol Canat */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">{t("configurator.configPopup.sashRole")}</label>
                    <div className="flex gap-2">
                      <button onClick={() => { const r: Record<string, SashRole> = { ...configPopupWin.sashRoles, [sashId]: "active" }; updateWindowField(configPopupWindowIdx, "sashRoles", r); }} className={cn("flex-1 p-2 rounded-lg border text-center text-xs", role === "active" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200")}>{t("configurator.configPopup.active")}</button>
                      <button onClick={() => { const r: Record<string, SashRole> = { ...configPopupWin.sashRoles, [sashId]: "inactive" }; updateWindowField(configPopupWindowIdx, "sashRoles", r); }} className={cn("flex-1 p-2 rounded-lg border text-center text-xs", role === "inactive" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200")}>{t("configurator.configPopup.inactive")}<div className="text-[9px] text-amber-600">{t("configurator.configPopup.inactiveDesc")}</div></button>
                      <button onClick={() => { const r: Record<string, SashRole> = { ...configPopupWin.sashRoles, [sashId]: "fixed" }; updateWindowField(configPopupWindowIdx, "sashRoles", r); }} className={cn("flex-1 p-2 rounded-lg border text-center text-xs", role === "fixed" ? "border-slate-500 bg-slate-100 text-slate-700" : "border-slate-200")}>{t("configurator.configPopup.fixed")}</button>
                    </div>
                  </div>

                  {/* Tip Deschidere */}
                  {role !== "fixed" && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t("configurator.configPopup.openingType")}</label>
                      <div className="flex gap-1.5">
                        {openingOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => { const o: Record<string, OpeningType> = { ...configPopupWin.sashOpeningTypes, [sashId]: opt.id as OpeningType }; updateWindowField(configPopupWindowIdx, "sashOpeningTypes", o); }}
                            className={cn("flex-1 p-1.5 rounded-lg border text-center text-[10px] transition-all", openingType === opt.id && !opt.disabled ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 text-slate-500", opt.disabled && "opacity-40 cursor-not-allowed")}
                            disabled={opt.disabled}
                          >
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-[9px] text-slate-400">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                      {role === "inactive" && <div className="text-[10px] text-amber-600 mt-1">{t("configurator.configPopup.inactiveWarning")}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Close Button */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={closeConfigPopup} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );

  // Close config dropdown on scroll/resize

  // Popup renderer for configuration panels - NO auto-close, user saves manually
  const renderPopupContent = () => {
    switch (activeMenu) {
      case "produse":
        return (
          <div className="space-y-4">
            <ProductTypePanel selected={productType} onSelect={(v) => setProductType(v)} />
          </div>
        );
      case "profil":
        return <ProfilePanel selected={profileSeries} onSelect={(v) => setProfileSeries(v)} />;
      case "culori":
        return (
          <ColorsPanel
            interiorColor={interiorColor}
            exteriorColor={exteriorColor}
            onInteriorChange={(v) => setInteriorColor(v)}
            onExteriorChange={(v) => setExteriorColor(v)}
          />
        );
      case "sticla":
        return <GlassPanel selected={glassType} onSelect={(v) => setGlassType(v)} />;
      case "feronerie":
        return (
          <HardwarePanel
            brand={hardwareBrand}
            level={hardwareLevel}
            onBrandChange={(v) => setHardwareBrand(v as HardwareBrand)}
            onLevelChange={(v) => setHardwareLevel(v as HardwareLevel)}
          />
        );
      case "accesorii":
        return <AccessoriesPanel selected={accessories} onToggle={(id) => toggleAccessory(id)} />;
      case "servicii":
        return (
          <ServicesPanel
            distance={distance}
            includeMontaj={includeMontaj}
            onDistanceChange={(v) => setDistance(v)}
            onMontajChange={(v) => setIncludeMontaj(v)}
          />
        );
      case "ofertare": {
        const winProductType = activeWindow?.productType;
        return (
          <div className="space-y-4">
            {winProductType && (
              <PricingPanel
                productType={winProductType}
                width={activeWindow.width}
                height={activeWindow.height}
                profileSeries={profileSeries ?? "premium_82"}
                interiorColor={interiorColor ?? "alb_ral9003"}
                exteriorColor={exteriorColor ?? "antracit_ral7016"}
                glassType={glassType ?? "tripan_4_16_4"}
                hardwareBrand={hardwareBrand ?? "siegenia"}
                hardwareLevel={hardwareLevel ?? "premium"}
                accessories={accessories}
                userRole={userRole}
                distance={distance}
                includeMontaj={includeMontaj}
              />
            )}
            <ActionsPanel
              price={winProductType ? 1 : null}
              onRequestPDF={() => handleExportPDF()}
              onSendOrder={() => handleSendEmail()}
              onReset={() => handleReset()}
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      {configDropdown}
      
      {/* Add Window Dropdown - Fixed positioned to avoid z-index issues */}
      {showAddWindowMenu && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setShowAddWindowMenu(false)}>
          <div 
            className="absolute bg-white border border-slate-200 rounded-lg shadow-xl min-w-[200px] z-[9999]"
            style={{ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 text-sm font-semibold text-slate-700 border-b border-slate-200">{t("configurator.addNewProduct")}</div>
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">{t("configurator.sections.windows")}</div>
              <button onClick={() => { addWindow("window_1_canat"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.window_1_canat")}</button>
              <button onClick={() => { addWindow("window_2_canate"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.window_2_canate")}</button>
              <button onClick={() => { addWindow("window_3_canate"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.window_3_canate")}</button>
              <button onClick={() => { addWindow("window_fix"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.window_fix")}</button>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase border-t border-slate-100 mt-2">{t("configurator.sections.doors")}</div>
              <button onClick={() => { addWindow("usa_balcon_1"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.usa_balcon_1")}</button>
              <button onClick={() => { addWindow("usa_balcon_2"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.usa_balcon_2")}</button>
              <button onClick={() => { addWindow("usa_intrare_pvc"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.usa_intrare_pvc")}</button>
              <button onClick={() => { addWindow("usa_intrare_aluminiu"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">{t("configurator.productTypes.usa_intrare_aluminiu")}</button>
            </div>
          </div>
        </div>
      )}
      
      {showPanelPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPanelPopup(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {MENU_ICONS[activeMenu]}
                <h2 className="text-lg font-semibold text-slate-800">
                  {MENU_CATEGORIES.find((c) => c.id === activeMenu)?.name || t("configurator.configure")}
                </h2>
              </div>
              <button
                onClick={() => setShowPanelPopup(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              {renderPopupContent()}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowPanelPopup(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => setShowPanelPopup(false)}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print View Overlay */}
      {showPrintView && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center print:hidden">
            <h2 className="text-lg font-semibold">{t("configurator.preview.exportPreview")}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700"
              >
                <FileText className="w-4 h-4" />
                {t("configurator.preview.print")}
              </button>
              <button
                onClick={() => setShowPrintView(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-300"
              >
                <X className="w-4 h-4" />
                {t("common.close")}
              </button>
            </div>
          </div>
          <div className="p-8">
            <PrintLayout
              windows={windows}
              activeWindowIndex={activeWindowIndex}
              profileSeries={profileSeries ?? "premium_82"}
              glassType={glassType}
              interiorColor={interiorColor}
              exteriorColor={exteriorColor}
              hardwareBrand={hardwareBrand}
              hardwareLevel={hardwareLevel}
              accessories={accessories}
              userRole={userRole}
              distance={distance}
              includeMontaj={includeMontaj}
            />
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">{t("configurator.orderModal.title")}</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              Completați datele dumneavoastră pentru a trimite solicitarea de ofertă.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("configurator.orderModal.clientName")}
                </label>
                <input
                  type="text"
                  value={orderForm.clientName}
                  onChange={(e) => setOrderForm({ ...orderForm, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t("configurator.orderModal.clientNamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("configurator.orderModal.email")} *
                </label>
                <input
                  type="email"
                  value={orderForm.clientEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, clientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t("configurator.orderModal.emailPlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("configurator.orderModal.phone")}
                </label>
                <input
                  type="tel"
                  value={orderForm.clientPhone}
                  onChange={(e) => setOrderForm({ ...orderForm, clientPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t("configurator.orderModal.phonePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("configurator.orderModal.notes")}
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder={t("configurator.orderModal.notesPlaceholder")}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={!orderForm.clientEmail}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t("common.send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">{t("configurator.filterModal.title")}</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 capitalize">
                    {category === "produse" ? t("configurator.filterModal.productType") :
                     category === "profil" ? t("configurator.filterModal.profile") :
                     category === "sticla" ? t("configurator.filterModal.glass") : t("configurator.filterModal.hardware")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const isActive = activeFilters[category]?.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleFilter(category, opt.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3 inline mr-1" />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                {t("configurator.filterModal.clearFilters")}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {t("configurator.filterModal.apply")}
              </button>
            </div>
          </div>
        </div>
      )}

      <AppLayout
        onSave={handleSave}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onSendEmail={handleSendEmail}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onToggleFilter={() => setShowFilters(true)}
      >
        <div className="flex h-full">
          {/* Left Sidebar - Configurare Proiect */}
          <div
            className={cn(
              "hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out flex-shrink-0",
              sidebarExpanded ? "w-56" : "w-12"
            )}
          >
            {/* Toggle */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="flex items-center justify-center h-10 border-b border-slate-100 hover:bg-slate-50 transition-colors"
              title={sidebarExpanded ? t("configurator.collapseMenu") : t("configurator.expandMenu")}
            >
              {sidebarExpanded ? (
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Sidebar Header */}
            {sidebarExpanded && (
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t("configurator.title")}
                </span>
              </div>
            )}

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
              {MENU_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveMenu(cat.id);
                    setSelectedComponent(null);
                    setShowPanelPopup(true);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-medium transition-colors",
                    activeMenu === cat.id
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                      : "text-slate-600 hover:bg-slate-50",
                    !sidebarExpanded && "justify-center px-0"
                  )}
                  title={cat.name}
                >
                  <span className="flex-shrink-0">{MENU_ICONS[cat.id]}</span>
                  {sidebarExpanded && <span className="truncate">{cat.name}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Center - Preview & Info */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* 2D Preview - Always visible on mobile */}
          {(showPreview || isMobile) && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Window Tabs */}
                  <div className="flex items-center gap-1 mb-1 overflow-x-auto px-2 pt-1">
                    {windows.map((win, idx) => (
                      <button
                        key={win.id}
                        onClick={() => setActiveWindowIndex(idx)}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap",
                          activeWindowIndex === idx ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <span>{win.name}</span>
                        <span className="text-[9px] opacity-75">{win.width}x{win.height}</span>
                        <span 
                          onClick={(e) => { e.stopPropagation(); duplicateWindow(idx); }}
                          className="ml-0.5 text-[10px] opacity-50 hover:opacity-100 hover:text-blue-400"
                          title={t("common.duplicate")}
                        >
                          ⧉
                        </span>
                        {windows.length > 1 && (
                          <span onClick={(e) => { e.stopPropagation(); removeWindow(idx); }} className="ml-0.5 text-[10px] hover:text-red-500">×</span>
                        )}
                      </button>
                    ))}
                    <div className="relative inline-block ml-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowAddWindowMenu(!showAddWindowMenu);
                        }}
                        className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 whitespace-nowrap"
                      >
                        + {t("configurator.addWindow")}
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {windows.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                      <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Ruler className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">{t("configurator.emptyState.title")}</h3>
                        <p className="text-sm text-slate-500 mb-6">
                          {t("configurator.emptyState.description")}
                        </p>
                        <button
                          onClick={() => setShowAddWindowMenu(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                        >
                          <PlusSquare className="w-5 h-5" />
                          {t("configurator.emptyState.button")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Multiple Windows */
                    <div className="flex-1 flex items-stretch justify-start gap-4 min-w-0 overflow-x-auto px-4">
                      {windows.map((win, idx) => {
                        const draft = draftDimensions[win.id] || { w: String(win.width), h: String(win.height) };
                        const hasInvalidDims = win.width <= 0 || win.height <= 0;

                        return (
                        <div key={win.id} className={cn("flex-shrink-0 flex flex-col items-center w-full max-w-[600px] min-h-0", activeWindowIndex === idx ? "opacity-100" : "opacity-50")}>
                          {/* Per-Window Header */}
                          <div className="flex items-center gap-2 mb-1 px-1 flex-shrink-0 w-full">
                            <button
                              onClick={() => openConfigForWindow(idx)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                              title={t("configurator.tooltips.configureSashes")}
                            >
                              <Settings className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">Configurare Canaturi</span>
                            </button>

                            <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 px-2 py-1">
                              <input
                                type="number"
                                value={draft.w}
                                onChange={(e) => setDraftDimensions(prev => ({ ...prev, [win.id]: { ...prev[win.id], w: e.target.value } }))}
                                onBlur={() => commitDimension(win.id, "width", draft.w)}
                                onKeyDown={(e) => { if (e.key === "Enter") { commitDimension(win.id, "width", draft.w); e.currentTarget.blur(); } }}
                                className="w-16 text-center text-xs font-medium text-slate-700 border-none outline-none"
                              />
                              <span className="text-slate-400">×</span>
                              <input
                                type="number"
                                value={draft.h}
                                onChange={(e) => setDraftDimensions(prev => ({ ...prev, [win.id]: { ...prev[win.id], h: e.target.value } }))}
                                onBlur={() => commitDimension(win.id, "height", draft.h)}
                                onKeyDown={(e) => { if (e.key === "Enter") { commitDimension(win.id, "height", draft.h); e.currentTarget.blur(); } }}
                                className="w-16 text-center text-xs font-medium text-slate-700 border-none outline-none"
                              />
                              <span className="text-[10px] text-slate-400">mm</span>
                            </div>

                            <button
                              onClick={() => setShowInfoPopup(idx)}
                              className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                              title={t("configurator.tooltips.productInfo")}
                            >
                              <Info className="w-4 h-4 text-blue-600" />
                            </button>
                          </div>

                          {/* SVG Container - fills ALL available space, no wasted whitespace */}
                          <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white min-h-0">
                            {hasInvalidDims ? (
                              <div className="flex flex-col items-center justify-center text-center p-6">
                                <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                                <p className="text-sm font-semibold text-slate-700 mb-1">{t("configurator.invalidDimensions.title")}</p>
                                <p className="text-xs text-slate-500 max-w-[200px]">
                                  {t("configurator.invalidDimensions.description")}
                                </p>
                              </div>
                            ) : (
                              <Window2D
                                productType={win.productType}
                                width={win.width}
                                height={win.height}
                                interiorColor={interiorColor ?? "alb_ral9003"}
                                exteriorColor={exteriorColor ?? "antracit_ral7016"}
                                openingSide={win.openingSide}
                                openingDirection={win.openingDirection}
                                sashConfiguration={win.sashConfiguration ?? undefined}
                                sashRoles={win.sashRoles}
                                sashOpeningTypes={win.sashOpeningTypes}
                                handleHeight={win.handleHeight}
                                showThreshold={win.showThreshold}
                                horizontalMuntin={win.horizontalMuntin}
                                showDimensions={true}
                                glassType={glassType?.includes("4-") ? glassType.replace("tripan_", "4/").replace(/_/g, "-") : undefined}
                                hardwareBrand={hardwareBrand ?? undefined}
                                onComponentClick={handleComponentClick}
                              />
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 mt-1 flex-shrink-0">
                            <button 
                              onClick={() => {
                                setWindows(prev => prev.map((w, i) => 
                                  i === idx ? { ...w, quantity: Math.max(1, w.quantity - 1) } : w
                                ));
                              }}
                              className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-xs hover:bg-slate-300 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-medium text-slate-600 w-8 text-center">{win.quantity}</span>
                            <button 
                              onClick={() => {
                                setWindows(prev => prev.map((w, i) => 
                                  i === idx ? { ...w, quantity: w.quantity + 1 } : w
                                ));
                              }}
                              className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-xs hover:bg-slate-300 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bottom Status - Compact */}
                  <div className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{t("configurator.statusBar.product")}:</span>
                      <span className="font-medium text-slate-700">{productType ? productType.replace(/_/g, " ") : "—"}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">{t("configurator.statusBar.profile")}:</span>
                      <span className="font-medium text-slate-700">{profileSeries || "—"}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">{t("configurator.statusBar.glass")}:</span>
                      <span className="font-medium text-slate-700">{glassType || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">Core829 SRL</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400 text-[10px]">+40766668482</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </AppLayout>

    {/* Window Info Popup - Global */}
    {showInfoPopup !== null && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">{t("configurator.infoPopup.title")}</h2>
            <button onClick={() => setShowInfoPopup(null)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.productType")}</span>
              <span className="font-medium text-slate-800">{getProductDisplayName(windows[showInfoPopup]?.productType)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.dimensions")}</span>
              <span className="font-medium text-slate-800">{windows[showInfoPopup]?.width} × {windows[showInfoPopup]?.height} mm</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.area")}</span>
              <span className="font-medium text-slate-800">{((windows[showInfoPopup]?.width * windows[showInfoPopup]?.height) / 1000000).toFixed(3)} m²</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.profile")}</span>
              <span className="font-medium text-slate-800">{profileSeries || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.glass")}</span>
              <span className="font-medium text-slate-800">{glassType || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.interiorColor")}</span>
              <span className="font-medium text-slate-800">{interiorColor || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.exteriorColor")}</span>
              <span className="font-medium text-slate-800">{exteriorColor || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">{t("configurator.infoPopup.hardware")}</span>
              <span className="font-medium text-slate-800">{hardwareBrand || "—"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">{t("configurator.infoPopup.quantity")}</span>
              <span className="font-medium text-slate-800">{windows[showInfoPopup]?.quantity || 1}</span>
            </div>
          </div>

          {/* Price Calculation */}
          {(() => {
            const infoWin = windows[showInfoPopup];
            if (!infoWin || !glassType || !interiorColor || !exteriorColor) return null;
            const price = calculatePrice({
              productType: infoWin.productType,
              width: infoWin.width,
              height: infoWin.height,
              profileSeries: profileSeries || "premium_82",
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
            const unitPrice = price.total;
            const qty = infoWin.quantity || 1;
            const totalPrice = unitPrice * qty;
            return (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">{t("configurator.pricing.unitPrice")}</span>
                  <span className="text-lg font-bold text-slate-800">{formatPrice(unitPrice)}</span>
                </div>
                {qty > 1 && (
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-slate-600">{t("configurator.pricing.total")} ({qty} {t("configurator.pricing.pieces")})</span>
                    <span className="text-xl font-bold text-blue-700">{formatPrice(totalPrice)}</span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowInfoPopup(null)} className="flex-1 py-2 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
