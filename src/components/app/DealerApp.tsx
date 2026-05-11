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
import Window2D, { WindowComponent } from "@/components/canvas/Window2D";
import {
  ProductTypePanel,
  DimensionsPanel,
  OpeningPanel,
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
  Grid3X3,
  Warehouse,
  Wrench,
  Send,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
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

interface DealerAppProps {
  userRole?: UserRole;
  clientCode?: string | null;
  dealerId?: string;
}

const SASH_CONFIG_OPTIONS: { key: "stulp" | "montant" | null; label: string; color: string }[] = [
  { key: "stulp", label: "Stulp", color: "purple" },
  { key: "montant", label: "Montant", color: "indigo" },
  { key: null, label: "Niciunul", color: "slate" },
];

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
  
  const defaultWindowConfig: Omit<WindowConfig, "id" | "name"> = {
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
  const [selectedComponent, setSelectedComponent] = useState<WindowComponent | null>(null);
  const [showPreview] = useState(true);
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const configBtnRef = useRef<HTMLButtonElement>(null);
  const [configPopupPos, setConfigPopupPos] = useState<{top: number; right: number} | null>(null);
  
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
  
  // Print/Export state
  const [showPrintView, setShowPrintView] = useState(false);

  // Popup state for configuration panels (desktop)
  const [showPanelPopup, setShowPanelPopup] = useState(false);

  const configDropdownRef = useRef<HTMLDivElement>(null);

  // Left sidebar state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Multi-window state
  const [windows, setWindows] = useState<WindowConfig[]>([
    { id: 1, name: getProductDisplayName(productType) + " #1", ...defaultWindowConfig }
  ]);
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);
  
  const activeWindow = windows[activeWindowIndex];

  // Update window names when productType changes
  useEffect(() => {
    setWindows(prev => prev.map((win, idx) => ({
      ...win,
      name: getProductDisplayName(productType) + ` #${idx + 1}`
    })));
  }, [productType]);
  
  // Helper to update active window property
  const updateActiveWindow = <K extends keyof WindowConfig>(key: K, value: WindowConfig[K]) => {
    setWindows(prev => prev.map((win, idx) => 
      idx === activeWindowIndex ? { ...win, [key]: value } : win
    ));
  };

  const addWindow = () => {
    const newId = windows.length + 1;
    setWindows([...windows, { id: newId, name: getProductDisplayName(productType) + " #" + newId, ...defaultWindowConfig }]);
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
    if (!productType) {
      alert("Selectați un produs înainte de a salva!");
      return;
    }

    const order: Order = {
      id: `order_${Date.now()}`,
      createdAt: new Date(),
      clientId: clientCode || undefined,
      dealerId: dealerId || undefined,
      supplierId: "supplier_1",
      productType,
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
    if (!productType) {
      alert("Selectați un produs înainte de a exporta PDF!");
      return;
    }
    setShowPrintView(true);
  }, [productType]);

  const handlePrint = useCallback(() => {
    if (!productType) {
      alert("Selectați un produs înainte de a printa!");
      return;
    }
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
    }, 500);
  }, [productType]);

  const handleSendEmail = useCallback(() => {
    if (!productType) {
      alert("Selectați un produs înainte de a trimite email!");
      return;
    }
    setShowOrderModal(true);
  }, [productType]);

  const handleConfirmOrder = useCallback(() => {
    if (!productType) return;

    const price = glassType && interiorColor && exteriorColor
      ? calculatePrice({
          productType,
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
      productType,
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
    if (orderForm.clientEmail) {
      const subject = `Solicitare Ofertă - ${productType.replace(/_/g, " ")} - ${activeWindow.width}x${activeWindow.height}mm`;
      const body = `Bună ziua,\n\nAm solicitat o ofertă pentru următoarea configurație:\n\n` +
        `PRODUS: ${productType.replace(/_/g, " ")}\n` +
        `DIMENSIUNI: ${activeWindow.width} × ${activeWindow.height} mm\n` +
        `PROFIL: ${profileSeries || "premium_82"}\n` +
        `CULORI: Interior - ${interiorColor || "alb"}, Exterior - ${exteriorColor || "antracit"}\n` +
        `STICLĂ: ${glassType || "tripan"}\n` +
        `FERONERIE: ${hardwareBrand || "siegenia"}\n` +
        (price ? `PREȚ ESTIMATIV: ${formatPrice(price.total)} (incl. TVA)\n` : "") +
        `\nDATE CLIENT:\nNume: ${orderForm.clientName || "—"}\nEmail: ${orderForm.clientEmail}\nTelefon: ${orderForm.clientPhone || "—"}\n` +
        `\nCu stimă,\nEchipa Winmeeth SRL\nStr. Energiei 470, 605300 Dărmănești\nTel: +40 745 700 363`;
      
      window.location.href = `mailto:contact@core829.ro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    setShowOrderModal(false);
    setOrderForm({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
    alert("Comanda a fost trimisă cu succes! Veți fi contactat în cel mai scurt timp.");
  }, [productType, activeWindow, profileSeries, glassType, interiorColor, exteriorColor, hardwareBrand, hardwareLevel, accessories, userRole, distance, includeMontaj, clientCode, dealerId, orderForm, addOrder]);

  const activeCategory = MENU_CATEGORIES.find((c) => c.id === activeMenu);
  const panelTitle = selectedComponent
    ? `${COMPONENT_LABELS[selectedComponent]} - Configurare`
    : activeCategory?.name || "Configurare";

  const getComponentIcon = () => {
    if (!selectedComponent) return null;
    switch (selectedComponent) {
      case "toc":
      case "canat":
      case "montant":
        return <Frame className="w-5 h-5" />;
      case "sticla":
        return <Square className="w-5 h-5" />;
      case "maner":
      case "balamale":
        return <Settings className="w-5 h-5" />;
      case "glaf":
      case "prag":
        return <Warehouse className="w-5 h-5" />;
      case "baghete":
        return <Grid3X3 className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

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

  const windowControls = (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg px-1.5 py-1">
        <span className="text-[10px] font-medium text-slate-500 mr-1">Deschidere:</span>
        <button onClick={() => updateActiveWindow("openingSide", "left")} className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", activeWindow.openingSide === "left" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-200")} title="Stânga">← St</button>
        <button onClick={() => updateActiveWindow("openingSide", "right")} className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", activeWindow.openingSide === "right" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-200")} title="Dreapta">Dr →</button>
      </div>
      <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg px-1.5 py-1">
        <span className="text-[10px] font-medium text-slate-500 mr-1">Direcție:</span>
        <button onClick={() => updateActiveWindow("openingDirection", "inward")} className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", activeWindow.openingDirection === "inward" ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-slate-200")} title="Interior">Int</button>
        <button onClick={() => updateActiveWindow("openingDirection", "outward")} className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", activeWindow.openingDirection === "outward" ? "bg-orange-600 text-white" : "bg-white text-slate-600 hover:bg-slate-200")} title="Exterior">Ext</button>
      </div>

      {/* Sash role toggles in header */}
      {productType && (productType === "window_2_canate" || productType === "window_3_canate" || productType === "usa_balcon_2") && (
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg px-1.5 py-1">
          <span className="text-[10px] font-medium text-slate-500 mr-1">Canat:</span>
          {["left", "right"].map((sashId) => {
            const role = activeWindow.sashRoles[sashId] || "active";
            const nextMap: Record<string, string> = { active: "inactive", inactive: "fixed", fixed: "active" };
            const roleClass = role === "active" ? "bg-green-600 text-white" : role === "inactive" ? "bg-amber-500 text-white" : "bg-slate-500 text-white";
            const label = sashId === "left" ? "St" : "Dr";
            return (
              <button
                key={sashId}
                onClick={() => {
                  const roles = { left: activeWindow.sashRoles.left || "active", right: activeWindow.sashRoles.right || "inactive" };
                  updateActiveWindow("sashRoles", { ...roles, [sashId]: nextMap[role] });
                }}
                className={cn("h-5 px-1.5 rounded text-[10px] font-medium transition-colors", roleClass)}
                title={role === "active" ? "Canat activ (se deschide)" : role === "inactive" ? "Canat inactiv (nu se deschide)" : "Canat fix"}
              >
                {label}: {role === "active" ? "Activ" : role === "inactive" ? "Inact" : "Fix"}
              </button>
            );
          })}
        </div>
      )}

      <button
        ref={configBtnRef}
        onClick={() => {
          if (!showConfigPopup && configBtnRef.current) {
            const rect = configBtnRef.current.getBoundingClientRect();
            setConfigPopupPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
          }
          setShowConfigPopup(!showConfigPopup);
        }}
        className={cn("px-2 py-1 rounded-lg text-[10px] font-medium border", showConfigPopup ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
      >
        Fereastră
      </button>
    </div>
  );

  // Config dropdown rendered at root level with fixed position
  const configDropdown = showConfigPopup && configPopupPos && (
    <div 
      ref={configDropdownRef}
      className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl p-3 space-y-2 z-[100] w-56 max-h-[80vh] overflow-y-auto"
      style={{ top: configPopupPos.top, right: configPopupPos.right }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
        <span className="text-[11px] font-semibold text-slate-700">Configurare fereastră</span>
        <button onClick={() => setShowConfigPopup(false)} className="text-slate-400 hover:text-slate-600 text-xs leading-none">×</button>
      </div>

      {/* Canaturi - fixed widths prevent layout shift */}
      <div className="text-[10px] font-semibold text-slate-500">Canaturi</div>
      <div className="flex gap-1">
        {SASH_CONFIG_OPTIONS.map((opt) => {
          const isActive = activeWindow.sashConfiguration === opt.key;
          const activeClass = opt.color === "purple" ? "bg-purple-600 text-white" : opt.color === "indigo" ? "bg-indigo-600 text-white" : "bg-slate-600 text-white";
          return (
            <button
              key={opt.label}
              onClick={() => updateActiveWindow("sashConfiguration", opt.key)}
              className={cn("h-6 flex-1 px-1 rounded text-[10px] font-medium transition-colors", isActive ? activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Optiuni - fixed widths */}
      <div className="text-[10px] font-semibold text-slate-500 pt-1">Opțiuni</div>
      <div className="flex gap-1">
        <button onClick={() => updateActiveWindow("showThreshold", !activeWindow.showThreshold)} className={cn("h-6 flex-1 px-1 rounded text-[10px] font-medium transition-colors", activeWindow.showThreshold ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Prag</button>
        <button onClick={() => updateActiveWindow("horizontalMuntin", !activeWindow.horizontalMuntin)} className={cn("h-6 flex-1 px-1 rounded text-[10px] font-medium transition-colors", activeWindow.horizontalMuntin ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Muntin</button>
      </div>

      {/* Handle height slider */}
      <div className="pt-1">
        <div className="text-[10px] font-semibold text-slate-500 mb-1">Înălțime mâner: {activeWindow.handleHeight}mm</div>
        <input type="range" min="30" max="200" value={activeWindow.handleHeight} onChange={(e) => updateActiveWindow("handleHeight", Number(e.target.value))} className="w-full h-1.5 accent-primary-600" />
      </div>

      {/* Roluri Canaturi */}
      {((productType === "window_2_canate" || productType === "window_3_canate" || productType === "usa_balcon_2") && activeWindow.sashConfiguration) && (
        <div className="pt-1">
          <div className="text-[10px] font-semibold text-slate-500 mb-1">Roluri Canaturi</div>
          <div className="flex gap-1">
            {["left", "right"].map((sashId) => {
              const role = activeWindow.sashRoles[sashId] || "active";
              const nextMap: Record<string, string> = { active: "inactive", inactive: "fixed", fixed: "active" };
              const roleClass = role === "active" ? "bg-green-600 text-white" : role === "inactive" ? "bg-amber-500 text-white" : "bg-slate-500 text-white";
              const label = sashId === "left" ? "St" : "Dr";
              return (
                <button
                  key={sashId}
                  onClick={() => {
                    const roles = { left: activeWindow.sashRoles.left || "active", right: activeWindow.sashRoles.right || "inactive" };
                    updateActiveWindow("sashRoles", { ...roles, [sashId]: nextMap[role] });
                  }}
                  className={cn("h-6 flex-1 px-1 rounded text-[10px] font-medium transition-colors", roleClass)}
                  title={role === "active" ? "Canat activ (se deschide)" : role === "inactive" ? "Canat inactiv (nu se deschide)" : "Canat fix"}
                >
                  {label}: {role === "active" ? "Activ" : role === "inactive" ? "Inact" : "Fix"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Close config dropdown on click outside or scroll/resize
  useEffect(() => {
    if (!showConfigPopup) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        configDropdownRef.current &&
        !configDropdownRef.current.contains(e.target as Node) &&
        configBtnRef.current &&
        !configBtnRef.current.contains(e.target as Node)
      ) {
        setShowConfigPopup(false);
      }
    };
    const handleScroll = () => setShowConfigPopup(false);
    const handleResize = () => setShowConfigPopup(false);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [showConfigPopup]);

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
      case "ofertare":
        return (
          <div className="space-y-4">
            {productType && (
              <PricingPanel
                productType={productType}
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
              price={productType ? 1 : null}
              onRequestPDF={() => handleExportPDF()}
              onSendOrder={() => handleSendEmail()}
              onReset={() => handleReset()}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {configDropdown}
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
              productType={productType ?? "window_2_canate"}
              width={activeWindow.width}
              height={activeWindow.height}
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
        windowControls={windowControls}
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
                    <button onClick={addWindow} className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200">
                      + Adaugă
                    </button>
                  </div>

                  {/* Multiple Windows */}
                  <div className="flex-1 flex items-center justify-start gap-4 min-w-0 overflow-x-auto px-4 py-2">
                    {windows.map((win, idx) => (
                      <div key={win.id} className={cn("flex-shrink-0 flex flex-col items-center", activeWindowIndex === idx ? "opacity-100" : "opacity-50")}>
                        <div className="text-[10px] text-center text-slate-500 mb-1">{win.name} <span className="opacity-75">({win.width}x{win.height})</span></div>
                        <Window2D
                          productType={productType ?? "window_2_canate"}
                          width={win.width}
                          height={win.height}
                          interiorColor={interiorColor ?? "alb_ral9003"}
                          exteriorColor={exteriorColor ?? "antracit_ral7016"}
                          openingSide={win.openingSide}
                          openingType={win.openingType === "oscilobatant" ? "oscilobativ" : (win.openingType === "batant_dreapta" || win.openingType === "batant_stanga" || win.openingType === "basculant" || win.openingType === "obluc") ? "normal" : undefined}
                          openingDirection={win.openingDirection}
                          sashConfiguration={win.sashConfiguration ?? undefined}
                          sashRoles={win.sashRoles}
                          sashOpeningTypes={win.sashOpeningTypes}
                          handleHeight={win.handleHeight}
                          showThreshold={win.showThreshold}
                          horizontalMuntin={win.horizontalMuntin}
                          showDimensions={true}
                          scale={isMobile ? 0.3 : 0.4}
                          glassType={glassType?.includes("4-") ? glassType.replace("tripan_", "4/").replace(/_/g, "-") : undefined}
                          onComponentClick={handleComponentClick}
                          onDimensionChange={(newWidth, newHeight) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, width: newWidth, height: newHeight } : w
                            ));
                          }}
                          onSashRoleChange={(sashId, role) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, sashRoles: { ...w.sashRoles, [sashId]: role } } : w
                            ));
                          }}
                          onOpeningTypeChange={(sashId, type) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, sashOpeningTypes: { ...w.sashOpeningTypes, [sashId]: type } } : w
                            ));
                          }}
                          onSashConfigurationChange={(config) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, sashConfiguration: config } : w
                            ));
                          }}
                          onShowThresholdChange={(show) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, showThreshold: show } : w
                            ));
                          }}
                          onHorizontalMuntinChange={(show) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, horizontalMuntin: show } : w
                            ));
                          }}
                          onHandleHeightChange={(height) => {
                            setWindows(prev => prev.map((w, i) => 
                              i === idx ? { ...w, handleHeight: height } : w
                            ));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <span className="text-slate-400 text-[10px]">Winmeeth SRL</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400 text-[10px]">+40 745 700 363</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-400 text-[10px] hidden sm:inline">Dărmănești</span>
            </div>
          </div>
        </div>

        {/* Mobile Configuration Drawer */}
        {isMobile && (
          <div className={cn(
            "fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-600 shadow-2xl z-50 flex flex-col transition-all duration-300",
            mobilePanelOpen ? "h-[70vh]" : "h-16"
          )}>
            {/* Drawer Header - Always visible */}
            <div 
              className="flex-shrink-0 bg-primary-600 text-white px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
            >
              <div className="flex items-center gap-3">
                {getComponentIcon()}
                <span className="font-semibold">{panelTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">{mobilePanelOpen ? "▼" : "▲"}</span>
              </div>
            </div>

            {/* Category Tabs */}
            {mobilePanelOpen && (
              <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-2 py-2 flex gap-1 overflow-x-auto">
                {MENU_CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveMenu(cat.id);
                      setSelectedComponent(null);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                      activeMenu === cat.id
                        ? "bg-primary-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    )}
                  >
                    {MENU_ICONS[cat.id]}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Configuration Content */}
            {mobilePanelOpen && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeMenu === "produse" && (
                  <div className="space-y-3">
                    <ProductTypePanel selected={productType} onSelect={setProductType} />
                    <DimensionsPanel width={activeWindow.width} height={activeWindow.height} onWidthChange={(w) => updateActiveWindow("width", w)} onHeightChange={(h) => updateActiveWindow("height", h)} productType={productType} />
                    <OpeningPanel selected={activeWindow.openingType} onSelect={(v) => updateActiveWindow("openingType", v as OpeningType)} />
                  </div>
                )}
                {activeMenu === "profil" && <ProfilePanel selected={profileSeries} onSelect={setProfileSeries} />}
                {activeMenu === "culori" && <ColorsPanel interiorColor={interiorColor} exteriorColor={exteriorColor} onInteriorChange={setInteriorColor} onExteriorChange={setExteriorColor} />}
                {activeMenu === "sticla" && <GlassPanel selected={glassType} onSelect={setGlassType} />}
                {activeMenu === "feronerie" && <HardwarePanel brand={hardwareBrand} level={hardwareLevel} onBrandChange={(v) => setHardwareBrand(v as HardwareBrand)} onLevelChange={(v) => setHardwareLevel(v as HardwareLevel)} />}
                {activeMenu === "accesorii" && <AccessoriesPanel selected={accessories} onToggle={toggleAccessory} />}
                {activeMenu === "servicii" && <ServicesPanel distance={distance} includeMontaj={includeMontaj} onDistanceChange={setDistance} onMontajChange={setIncludeMontaj} />}
                {activeMenu === "ofertare" && productType && (
                  <PricingPanel productType={productType} width={activeWindow.width} height={activeWindow.height} profileSeries={profileSeries ?? "premium_82"} interiorColor={interiorColor ?? "alb_ral9003"} exteriorColor={exteriorColor ?? "antracit_ral7016"} glassType={glassType ?? "tripan_4_16_4"} hardwareBrand={hardwareBrand ?? "siegenia"} hardwareLevel={hardwareLevel ?? "premium"} accessories={accessories} userRole={userRole} distance={distance} includeMontaj={includeMontaj} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
    </>
  );
}
