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

  // Multi-window state
  const [windows, setWindows] = useState<WindowConfig[]>([
    { id: 1, name: getProductDisplayName(productType) + " #1", productType: productType || "window_2_canate", quantity: 1, ...defaultWindowConfig }
  ]);
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);
  const [showAddWindowMenu, setShowAddWindowMenu] = useState(false);
  
  const activeWindow = windows[activeWindowIndex];

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
    if (windows.length === 1) return;
    const newWindows = windows.filter((_, i) => i !== index);
    setWindows(newWindows);
    if (activeWindowIndex >= newWindows.length) {
      setActiveWindowIndex(newWindows.length - 1);
    }
  };

  const duplicateWindow = (index: number) => {
    const winToClone = windows[index];
    const newId = Math.max(...windows.map(w => w.id)) + 1;
    const newWindow = { ...winToClone, id: newId, name: getProductDisplayName(productType) + " #" + newId };
    setWindows([...windows, newWindow]);
    setActiveWindowIndex(windows.length);
  };

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
      alert("Selectați un produs înainte de a salva!");
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
    alert("Configurație salvată ca proformă! Puteți continua cu configurarea sau trimite oferta.");
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
      alert("Selectați un produs înainte de a exporta PDF!");
      return;
    }
    setShowPrintView(true);
  }, [activeWindow?.productType]);

  const handlePrint = useCallback(() => {
    const winProductType = activeWindow?.productType;
    if (!winProductType) {
      alert("Selectați un produs înainte de a printa!");
      return;
    }
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
    }, 500);
  }, [activeWindow?.productType]);

  const handleSendEmail = useCallback(() => {
    if (!activeWindow?.productType) {
      alert("Selectați un produs înainte de a trimite email!");
      return;
    }
    setShowOrderModal(true);
  }, [activeWindow?.productType]);

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
      const subject = `Solicitare Ofertă - ${activeWindow.productType.replace(/_/g, " ")} - ${activeWindow.width}x${activeWindow.height}mm`;
      const body = `Bună ziua,\n\nAm solicitat o ofertă pentru următoarea configurație:\n\n` +
        `PRODUS: ${activeWindow.productType.replace(/_/g, " ")}\n` +
        `DIMENSIUNI: ${activeWindow.width} × ${activeWindow.height} mm\n` +
        `PROFIL: ${profileSeries || "premium_82"}\n` +
        `CULORI: Interior - ${interiorColor || "alb"}, Exterior - ${exteriorColor || "antracit"}\n` +
        `STICLĂ: ${glassType || "tripan"}\n` +
        `FERONERIE: ${hardwareBrand || "siegenia"}\n` +
        (price ? `PREȚ ESTIMATIV: ${formatPrice(price.total)} (incl. TVA)\n` : "") +
        `\nDATE CLIENT:\nNume: ${orderForm.clientName || "—"}\nEmail: ${orderForm.clientEmail}\nTelefon: ${orderForm.clientPhone || "—"}\n` +
        `\nCu stimă,\nEchipa Core829 SRL\ncontact.core829@gmail.com\nTel: +40766668482`;
      
      window.location.href = `mailto:contact.core829@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    setShowOrderModal(false);
    setOrderForm({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
    alert("Comanda a fost trimisă cu succes! Veți fi contactat în cel mai scurt timp.");
  }, [activeWindow, profileSeries, glassType, interiorColor, exteriorColor, hardwareBrand, hardwareLevel, accessories, userRole, distance, includeMontaj, clientCode, dealerId, orderForm, addOrder]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeCategory = MENU_CATEGORIES.find((c) => c.id === activeMenu);

  // Filter items for quick filtering
  const filterOptions = {
    produse: [
      { id: "window", label: "Ferestre" },
      { id: "door", label: "Uși" },
      { id: "balcony", label: "Balcon" },
      { id: "harmonic", label: "Harmonic" },
    ],
    profil: [
      { id: "premium_82", label: "Premium 82" },
      { id: "premium_70", label: "Premium 70" },
      { id: "standard_60", label: "Standard 60" },
    ],
    sticla: [
      { id: "tripan", label: "Tripan" },
      { id: "monopane", label: "Monopane" },
    ],
    feronerie: [
      { id: "siegenia", label: "Siegenia" },
      { id: "roto", label: "Roto" },
      { id: "gu", label: "GU" },
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
      ? [{ side: "center" }]
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
          <h3 className="text-lg font-semibold text-slate-800">Configurare Canaturi</h3>
          <button onClick={closeConfigPopup} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Product Type Selector */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <label className="block text-sm font-medium text-slate-700 mb-2">Tip Produs</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: "window_1_canat" as ProductType, label: "1 Canat" },
              { type: "window_2_canate" as ProductType, label: "2 Canate" },
              { type: "window_3_canate" as ProductType, label: "3 Canate" },
              { type: "window_fix" as ProductType, label: "Fix" },
              { type: "usa_balcon_1" as ProductType, label: "Ușă 1C" },
              { type: "usa_balcon_2" as ProductType, label: "Ușă 2C" },
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

        {/* Visual Sash Selection */}
        {configSashes.length > 0 && (
          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">Selectează canatul:</label>
            <div className="flex justify-center gap-2">
              {configSashes.map((sash, idx) => {
                const sashId = sash.side || String(idx);
                const role = configPopupWin.sashRoles[sashId] || "active";
                const label = sash.side === "left" ? "Canat Stânga" : sash.side === "right" ? "Canat Dreapta" : sash.side === "center" ? "Canat Central" : `Canat ${idx + 1}`;
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
                      {role === "active" ? "Activ" : role === "inactive" ? "Inactiv" : "Fix"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Window Options */}
        <div className="p-4 space-y-4 border-b border-slate-100">
          <label className="block text-sm font-medium text-slate-700">Opțiuni Fereastră</label>
          
          {/* Stulp / Montant */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Stulp / Montant</label>
            <div className="flex gap-2">
              <button onClick={() => updateWindowField(configPopupWindowIdx, "sashConfiguration", "stulp")} className={cn("flex-1 p-2 rounded-lg border text-center text-xs transition-all", configPopupWin.sashConfiguration === "stulp" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 hover:border-purple-300")}>Stulp</button>
              <button onClick={() => updateWindowField(configPopupWindowIdx, "sashConfiguration", "montant")} className={cn("flex-1 p-2 rounded-lg border text-center text-xs transition-all", configPopupWin.sashConfiguration === "montant" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300")}>Montant</button>
              <button onClick={() => updateWindowField(configPopupWindowIdx, "sashConfiguration", null)} className={cn("flex-1 p-2 rounded-lg border text-center text-xs transition-all", !configPopupWin.sashConfiguration ? "border-slate-500 bg-slate-100 text-slate-700" : "border-slate-200 hover:border-slate-400")}>Niciunul</button>
            </div>
          </div>

          {/* Prag */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-500">Prag</label>
            <button onClick={() => updateWindowField(configPopupWindowIdx, "showThreshold", !configPopupWin.showThreshold)} className={cn("w-12 h-6 rounded-full transition-colors", configPopupWin.showThreshold ? "bg-primary-600" : "bg-slate-300")}>
              <div className={cn("w-5 h-5 bg-white rounded-full shadow transform transition-transform", configPopupWin.showThreshold ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>

          {/* Montant Orizontal */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-500">Montant Orizontal</label>
            <button onClick={() => updateWindowField(configPopupWindowIdx, "horizontalMuntin", !configPopupWin.horizontalMuntin)} className={cn("w-12 h-6 rounded-full transition-colors", configPopupWin.horizontalMuntin ? "bg-primary-600" : "bg-slate-300")}>
              <div className={cn("w-5 h-5 bg-white rounded-full shadow transform transition-transform", configPopupWin.horizontalMuntin ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>

          {/* Handle Height */}
          <div>
            <div className="text-xs text-slate-500 mb-1">Înălțime mâner: {configPopupWin.handleHeight}mm</div>
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
              const label = sash.side === "left" ? "Canat Stânga" : sash.side === "right" ? "Canat Dreapta" : sash.side === "center" ? "Canat Central" : `Canat ${idx + 1}`;
              const openingOptions = role === "inactive"
                ? [{ id: "normal", label: "Normal", desc: "Deschidere clasică", disabled: false }]
                : [
                    { id: "normal", label: "Normal", desc: "Deschidere clasică", disabled: false },
                    { id: "oscilobatant", label: "Oscilobatant", desc: "Deschidere completă + aerisire", disabled: false },
                    { id: "batant", label: "Batant", desc: "Doar deschidere completă", disabled: false },
                  ];

              return (
                <div key={sashId} className="p-3 bg-slate-50 rounded-xl space-y-3">
                  <div className="text-sm font-semibold text-slate-700">{label}</div>
                  
                  {/* Rol Canat */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Rol Canat</label>
                    <div className="flex gap-2">
                      <button onClick={() => { const r: Record<string, SashRole> = { ...configPopupWin.sashRoles, [sashId]: "active" }; updateWindowField(configPopupWindowIdx, "sashRoles", r); }} className={cn("flex-1 p-2 rounded-lg border text-center text-xs", role === "active" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200")}>Activ</button>
                      <button onClick={() => { const r: Record<string, SashRole> = { ...configPopupWin.sashRoles, [sashId]: "inactive" }; updateWindowField(configPopupWindowIdx, "sashRoles", r); }} className={cn("flex-1 p-2 rounded-lg border text-center text-xs", role === "inactive" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200")}>Inactiv<div className="text-[9px] text-amber-600">Deschidere limitată</div></button>
                      <button onClick={() => { const r: Record<string, SashRole> = { ...configPopupWin.sashRoles, [sashId]: "fixed" }; updateWindowField(configPopupWindowIdx, "sashRoles", r); }} className={cn("flex-1 p-2 rounded-lg border text-center text-xs", role === "fixed" ? "border-slate-500 bg-slate-100 text-slate-700" : "border-slate-200")}>Fix</button>
                    </div>
                  </div>

                  {/* Tip Deschidere */}
                  {role !== "fixed" && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tip Deschidere</label>
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
                      {role === "inactive" && <div className="text-[10px] text-amber-600 mt-1">Canatul inactiv are deschidere limitată</div>}
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
            Închide
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
            <div className="px-4 py-3 text-sm font-semibold text-slate-700 border-b border-slate-200">Adaugă produs nou</div>
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">Ferestre</div>
              <button onClick={() => { addWindow("window_1_canat"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Fereastră 1 canat</button>
              <button onClick={() => { addWindow("window_2_canate"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Fereastră 2 canate</button>
              <button onClick={() => { addWindow("window_3_canate"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Fereastră 3 canate</button>
              <button onClick={() => { addWindow("window_fix"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Fereastră Fix</button>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase border-t border-slate-100 mt-2">Uși</div>
              <button onClick={() => { addWindow("usa_balcon_1"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Ușă balcon 1 canat</button>
              <button onClick={() => { addWindow("usa_balcon_2"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Ușă balcon 2 canate</button>
              <button onClick={() => { addWindow("usa_intrare_pvc"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Ușă intrare PVC</button>
              <button onClick={() => { addWindow("usa_intrare_aluminiu"); setShowAddWindowMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 text-slate-700 rounded">Ușă intrare Aluminiu</button>
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
                  {MENU_CATEGORIES.find((c) => c.id === activeMenu)?.name || "Configurare"}
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
                Renunță
              </button>
              <button
                onClick={() => setShowPanelPopup(false)}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Salvează și închide
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print View Overlay */}
      {showPrintView && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center print:hidden">
            <h2 className="text-lg font-semibold">Previzualizare Export</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700"
              >
                <FileText className="w-4 h-4" />
                Printează
              </button>
              <button
                onClick={() => setShowPrintView(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-300"
              >
                <X className="w-4 h-4" />
                Închide
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
              <h2 className="text-xl font-bold text-slate-800">Trimite Comanda</h2>
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
                  Nume Client
                </label>
                <input
                  type="text"
                  value={orderForm.clientName}
                  onChange={(e) => setOrderForm({ ...orderForm, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Numele tău complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={orderForm.clientEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, clientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="email@exemplu.ro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={orderForm.clientPhone}
                  onChange={(e) => setOrderForm({ ...orderForm, clientPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+40 721 000 000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observații
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Informații suplimentare..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={!orderForm.clientEmail}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Trimite
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
              <h2 className="text-xl font-bold text-slate-800">Filtrează Produse</h2>
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
                    {category === "produse" ? "Tip Produs" : 
                     category === "profil" ? "Profil" :
                     category === "sticla" ? "Sticlă" : "Feronerie"}
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
                Curăță Filtre
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Aplică
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
              title={sidebarExpanded ? "Restrange meniu" : "Extinde meniu"}
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
                  Configurare Proiect
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
            <div className="flex-1 flex flex-col min-h-0 p-2">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Window 2D with Side Controls - centered */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Window Tabs */}
                  <div className="flex items-center gap-1 mb-2 overflow-x-auto">
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
                          title="Duplică"
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
                        + Adaugă
                      </button>
                    </div>
                  </div>

                  {/* Multiple Windows */}
                  <div className="flex-1 flex items-center justify-start gap-4 min-w-0 overflow-x-auto px-4 py-2">
                    {windows.map((win, idx) => {
                      const maxWidth = 450;
                      const maxHeight = 500;
                      const aspectRatio = win.width / win.height;
                      let displayWidth = Math.min(win.width, maxWidth);
                      let displayHeight = displayWidth / aspectRatio;
                      if (displayHeight > maxHeight) {
                        displayHeight = maxHeight;
                        displayWidth = displayHeight * aspectRatio;
                      }
                      const calculatedScale = (displayWidth / win.width) * (isMobile ? 0.35 : 0.5);
                      
                      return (
                      <div key={win.id} className={cn("flex-shrink-0 flex flex-col items-center", activeWindowIndex === idx ? "opacity-100" : "opacity-50")}>
                        {/* Per-Window Header */}
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <button
                            onClick={() => openConfigForWindow(idx)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            title="Configurare canaturi"
                          >
                            <Settings className="w-4 h-4 text-slate-600" />
                          </button>

                          <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 px-2 py-1">
                            <input
                              type="number"
                              value={win.width}
                              onChange={(e) => {
                                const newWidth = Math.max(300, Math.min(3000, parseInt(e.target.value) || win.width));
                                setWindows(prev => prev.map((w, i) => i === idx ? { ...w, width: newWidth } : w));
                              }}
                              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                              className="w-16 text-center text-xs font-medium text-slate-700 border-none outline-none"
                            />
                            <span className="text-slate-400">×</span>
                            <input
                              type="number"
                              value={win.height}
                              onChange={(e) => {
                                const newHeight = Math.max(300, Math.min(3000, parseInt(e.target.value) || win.height));
                                setWindows(prev => prev.map((w, i) => i === idx ? { ...w, height: newHeight } : w));
                              }}
                              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                              className="w-16 text-center text-xs font-medium text-slate-700 border-none outline-none"
                            />
                            <span className="text-[10px] text-slate-400">mm</span>
                          </div>

                          <button
                            onClick={() => setShowInfoPopup(idx)}
                            className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                            title="Informații produs"
                          >
                            <Info className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>

                        <div className="w-full max-w-[450px] h-[500px] flex items-center justify-center">
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
                          scale={calculatedScale}
                          glassType={glassType?.includes("4-") ? glassType.replace("tripan_", "4/").replace(/_/g, "-") : undefined}
                          hardwareBrand={hardwareBrand ?? undefined}
                          onComponentClick={handleComponentClick}
                        />
                        </div>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 mt-1">
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

                  {/* Bottom Status - Compact */}
                  <div className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Produs:</span>
                      <span className="font-medium text-slate-700">{productType ? productType.replace(/_/g, " ") : "—"}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">Profil:</span>
                      <span className="font-medium text-slate-700">{profileSeries || "—"}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">Sticlă:</span>
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
            <h2 className="text-xl font-bold text-slate-800">Informații Produs</h2>
            <button onClick={() => setShowInfoPopup(null)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Tip Produs</span>
              <span className="font-medium text-slate-800">{getProductDisplayName(windows[showInfoPopup]?.productType)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Dimensiuni</span>
              <span className="font-medium text-slate-800">{windows[showInfoPopup]?.width} × {windows[showInfoPopup]?.height} mm</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Suprafață</span>
              <span className="font-medium text-slate-800">{((windows[showInfoPopup]?.width * windows[showInfoPopup]?.height) / 1000000).toFixed(3)} m²</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Profil</span>
              <span className="font-medium text-slate-800">{profileSeries || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Sticlă</span>
              <span className="font-medium text-slate-800">{glassType || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Culoare Interior</span>
              <span className="font-medium text-slate-800">{interiorColor || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Culoare Exterior</span>
              <span className="font-medium text-slate-800">{exteriorColor || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Feronerie</span>
              <span className="font-medium text-slate-800">{hardwareBrand || "—"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Cantitate</span>
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
                  <span className="text-sm font-medium text-slate-600">Preț unitar</span>
                  <span className="text-lg font-bold text-slate-800">{formatPrice(unitPrice)}</span>
                </div>
                {qty > 1 && (
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-slate-600">Total ({qty} buc)</span>
                    <span className="text-xl font-bold text-blue-700">{formatPrice(totalPrice)}</span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowInfoPopup(null)} className="flex-1 py-2 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
              Închide
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
