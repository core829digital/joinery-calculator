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
import { MENU_CATEGORIES, ACCESSORIES } from "@/data/joinery";
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
  ChevronRight,
  Eye,
  Grid3X3,
  Paintbrush,
  Warehouse,
  Wrench,
  Send,
  X,
  Check,
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
    showThreshold: false,
    horizontalMuntin: false,
    handleHeight: 100,
  };
  
  const [activeMenu, setActiveMenu] = useState("produse");
  const [selectedComponent, setSelectedComponent] = useState<WindowComponent | null>(null);
  const [showPreview, setShowPreview] = useState(true);
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

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<"canvas" | "panel">("panel");

  // Multi-window state
  const [windows, setWindows] = useState<WindowConfig[]>([
    { id: 1, name: "Fereastra #1", ...defaultWindowConfig }
  ]);
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);
  
  const activeWindow = windows[activeWindowIndex];
  
  // Helper to update active window property
  const updateActiveWindow = <K extends keyof WindowConfig>(key: K, value: WindowConfig[K]) => {
    setWindows(prev => prev.map((win, idx) => 
      idx === activeWindowIndex ? { ...win, [key]: value } : win
    ));
  };

  const addWindow = () => {
    const newId = windows.length + 1;
    setWindows([...windows, { id: newId, name: `Fereastra #${newId}`, ...defaultWindowConfig }]);
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
    const newWindow = { ...winToClone, id: newId, name: `Fereastra #${newId}` };
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
  }, []);

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

  const displayMenuItems = searchQuery.length >= 2
    ? MENU_CATEGORIES.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MENU_CATEGORIES;

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
        Config
      </button>
    </div>
  );

  // Config dropdown rendered at root level with fixed position
  const configDropdown = showConfigPopup && configPopupPos && (
    <div 
      className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl p-3 space-y-2 z-[100] w-60"
      style={{ top: configPopupPos.top, right: configPopupPos.right }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
        <span className="text-[11px] font-semibold text-slate-700">Configurare fereastră</span>
        <button onClick={() => setShowConfigPopup(false)} className="text-slate-400 hover:text-slate-600 text-xs">×</button>
      </div>
      <div className="text-[10px] font-semibold text-slate-500 mb-1">Canaturi</div>
      <div className="flex gap-1">
        <button onClick={() => updateActiveWindow("sashConfiguration", "stulp")} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", activeWindow.sashConfiguration === "stulp" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600")}>Stulp</button>
        <button onClick={() => updateActiveWindow("sashConfiguration", "montant")} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", activeWindow.sashConfiguration === "montant" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>Montant</button>
        <button onClick={() => updateActiveWindow("sashConfiguration", null)} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", !activeWindow.sashConfiguration ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-600")}>Niciunul</button>
      </div>
      <div className="text-[10px] font-semibold text-slate-500 mb-1">Opțiuni</div>
      <div className="flex gap-1">
        <button onClick={() => updateActiveWindow("showThreshold", !activeWindow.showThreshold)} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", activeWindow.showThreshold ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600")}>Prag</button>
        <button onClick={() => updateActiveWindow("horizontalMuntin", !activeWindow.horizontalMuntin)} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", activeWindow.horizontalMuntin ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600")}>Muntin</button>
      </div>
      <div>
        <div className="text-[10px] font-semibold text-slate-500 mb-1">Înălțime mâner: {activeWindow.handleHeight}mm</div>
        <input type="range" min="30" max="200" value={activeWindow.handleHeight} onChange={(e) => updateActiveWindow("handleHeight", Number(e.target.value))} className="w-full h-1.5 accent-primary-600" />
      </div>
      {((productType === "window_2_canate" || productType === "window_3_canate" || productType === "usa_balcon_2") && activeWindow.sashConfiguration) && (
        <div>
          <div className="text-[10px] font-semibold text-slate-500 mb-1">Roluri Canaturi</div>
          <div className="flex gap-1">
            <button onClick={() => { const roles = { left: activeWindow.sashRoles.left || "active", right: activeWindow.sashRoles.right || "inactive" }; const nextRole = { active: "inactive", inactive: "fixed", fixed: "active" } as const; updateActiveWindow("sashRoles", { ...roles, left: nextRole[roles.left as keyof typeof nextRole] }); }} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", activeWindow.sashRoles.left === "active" ? "bg-green-600 text-white" : activeWindow.sashRoles.left === "inactive" ? "bg-amber-600 text-white" : activeWindow.sashRoles.left === "fixed" ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-600")}>St: {activeWindow.sashRoles.left === "active" ? "Activ" : activeWindow.sashRoles.left === "inactive" ? "Inact" : "Fix"}</button>
            <button onClick={() => { const roles = { left: activeWindow.sashRoles.left || "active", right: activeWindow.sashRoles.right || "inactive" }; const nextRole = { active: "inactive", inactive: "fixed", fixed: "active" } as const; updateActiveWindow("sashRoles", { ...roles, right: nextRole[roles.right as keyof typeof nextRole] }); }} className={cn("flex-1 px-2 py-1 rounded text-[10px] font-medium", activeWindow.sashRoles.right === "active" ? "bg-green-600 text-white" : activeWindow.sashRoles.right === "inactive" ? "bg-amber-600 text-white" : activeWindow.sashRoles.right === "fixed" ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-600")}>Dr: {activeWindow.sashRoles.right === "active" ? "Activ" : activeWindow.sashRoles.right === "inactive" ? "Inact" : "Fix"}</button>
          </div>
        </div>
      )}
    </div>
  );

  // Close config dropdown on click outside or scroll/resize
  useEffect(() => {
    if (!showConfigPopup) return;
    const handleClose = () => setShowConfigPopup(false);
    const handleScroll = () => setShowConfigPopup(false);
    document.addEventListener("mousedown", handleClose);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [showConfigPopup]);

  return (
    <>
      {configDropdown}
      
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
        <div className="flex flex-col md:flex-row h-full">
        {/* Left Panel - Configuration - Desktop only */}
        <div className={cn(
          "hidden md:block border-r border-slate-200 overflow-y-auto p-3 space-y-3 bg-white md:w-80"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {selectedComponent ? (
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  title="Înapoi la meniu"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 rotate-180" />
                </button>
              ) : isMobile ? (
                <button
                  onClick={() => setMobilePanelOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              ) : null}
              <div className="flex items-center gap-2">
                {getComponentIcon()}
                <h2 className="text-base font-semibold text-slate-800">
                  {panelTitle}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isMobile && (
                <button
                  onClick={() => setMobileViewMode(mobileViewMode === "panel" ? "canvas" : "panel")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    mobileViewMode === "canvas"
                      ? "bg-primary-100 text-primary-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "p-2 rounded-lg transition-colors hidden md:flex",
                  showPreview
                    ? "bg-primary-100 text-primary-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                title={showPreview ? "Ascunde preview" : "Arată preview"}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Products Sub-menu */}
          {activeMenu === "produse" && (
            <div className="space-y-4">
              <ProductTypePanel
                selected={productType}
                onSelect={setProductType}
              />
              <DimensionsPanel
                width={activeWindow.width}
                height={activeWindow.height}
                onWidthChange={(w) => updateActiveWindow("width", w)}
                onHeightChange={(h) => updateActiveWindow("height", h)}
                productType={productType}
              />
              <OpeningPanel
                selected={activeWindow.openingType}
                onSelect={(v) => updateActiveWindow("openingType", v as OpeningType)}
              />
            </div>
          )}

          {/* Profile */}
          {activeMenu === "profil" && (
            <div>
              <ProfilePanel
                selected={profileSeries}
                onSelect={setProfileSeries}
              />
            </div>
          )}

          {/* Colors */}
          {activeMenu === "culori" && (
            <div>
              <ColorsPanel
                interiorColor={interiorColor}
                exteriorColor={exteriorColor}
                onInteriorChange={setInteriorColor}
                onExteriorChange={setExteriorColor}
              />
            </div>
          )}

          {/* Glass */}
          {activeMenu === "sticla" && (
            <div>
              <GlassPanel selected={glassType} onSelect={setGlassType} />
            </div>
          )}

          {/* Hardware */}
          {activeMenu === "feronerie" && (
            <div>
              <HardwarePanel
                brand={hardwareBrand}
                level={hardwareLevel}
                onBrandChange={(v) => setHardwareBrand(v as HardwareBrand)}
                onLevelChange={(v) => setHardwareLevel(v as HardwareLevel)}
              />
            </div>
          )}

          {/* Accessories */}
          {activeMenu === "accesorii" && (
            <div>
              <AccessoriesPanel
                selected={accessories}
                onToggle={toggleAccessory}
              />
            </div>
          )}

          {/* Services */}
          {activeMenu === "servicii" && (
            <div>
              <ServicesPanel
                distance={distance}
                includeMontaj={includeMontaj}
                onDistanceChange={setDistance}
                onMontajChange={setIncludeMontaj}
              />
            </div>
          )}

          {/* Pricing Summary */}
          {activeMenu === "ofertare" && (
            <div className="space-y-4">
              <PricingPanel
                productType={productType ?? "window_2_canate"}
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
              <ActionsPanel
                price={productType ? 1 : null}
                onRequestPDF={handleExportPDF}
                onSendOrder={handleSendEmail}
                onReset={handleReset}
              />
            </div>
          )}
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

        {/* Right Panel - Quick Actions */}
        <div className="w-72 border-l border-slate-200 overflow-y-auto p-4 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Meniu Rapid
          </h3>

          <div className="space-y-1">
            {displayMenuItems.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveMenu(cat.id);
                  setSelectedComponent(null);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-colors min-h-[48px]",
                  activeMenu === cat.id
                    ? "bg-primary-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {MENU_ICONS[cat.id]}
                <span>{cat.name}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </button>
            ))}
          </div>

          {/* Component Selection Info */}
          {selectedComponent && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Paintbrush className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Componenta selectată
                </span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Faceți clic pe orice componentă a ferestrei 2D pentru a accesa meniul de configurare.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-blue-900">
                  {COMPONENT_LABELS[selectedComponent]}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 p-3 bg-white rounded-lg border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Statistici
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Produse:</span>
                <span className="font-medium">{productType ? "1" : "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Culori:</span>
                <span className="font-medium">
                  {interiorColor && exteriorColor ? "2" : interiorColor || exteriorColor ? "1" : "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accesorii:</span>
                <span className="font-medium">{accessories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deschidere:</span>
                <span className="font-medium">
                  {activeWindow.openingSide === "left" ? "Stânga" : "Dreapta"}
                </span>
              </div>
            </div>
          </div>

          {/* Accessories Summary */}
          {accessories.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Accesorii Selectate
              </h4>
              <div className="space-y-1">
                {accessories.map((accId) => {
                  const acc = ACCESSORIES.find((a) => a.id === accId);
                  return acc ? (
                    <div key={accId} className="flex justify-between text-sm">
                      <span className="text-slate-600">{acc.name}</span>
                      <span className="font-medium text-slate-900">
                        {acc.price} lei
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
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
