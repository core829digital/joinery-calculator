"use client";

import { useState, useCallback, useEffect } from "react";
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
  Calculator,
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
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1400);
  const [profileSeries, setProfileSeries] = useState<ProfileSeries | null>(null);
  const [openingType, setOpeningType] = useState<OpeningType | null>(null);
  const [openingSide, setOpeningSide] = useState<"left" | "right">("right");
  const [openingDirection, setOpeningDirection] = useState<"inward" | "outward">("inward");
  const [sashConfiguration, setSashConfiguration] = useState<"stulp" | "montant" | null>(null);
  const [sashRoles, setSashRoles] = useState<Record<string, "active" | "inactive" | "fixed">>({});
  const [showThreshold, setShowThreshold] = useState(false);
  const [horizontalMuntin, setHorizontalMuntin] = useState(false);
  const [handleHeight, setHandleHeight] = useState(100);
  const [interiorColor, setInteriorColor] = useState<Color | null>(null);
  const [exteriorColor, setExteriorColor] = useState<Color | null>(null);
  const [glassType, setGlassType] = useState<GlassType | null>(null);
  const [hardwareBrand, setHardwareBrand] = useState<HardwareBrand | null>(null);
  const [hardwareLevel, setHardwareLevel] = useState<HardwareLevel | null>(null);
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [distance, setDistance] = useState(30);
  const [includeMontaj, setIncludeMontaj] = useState(false);

  const [activeMenu, setActiveMenu] = useState("produse");
  const [selectedComponent, setSelectedComponent] = useState<WindowComponent | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  
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
    setWidth(1200);
    setHeight(1400);
    setProfileSeries(null);
    setOpeningType(null);
    setOpeningSide("right");
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
      width,
      height,
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
          width,
          height,
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
      width,
      height,
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
      const subject = `Solicitare Ofertă - ${productType.replace(/_/g, " ")} - ${width}x${height}mm`;
      const body = `Bună ziua,\n\nAm solicitat o ofertă pentru următoarea configurație:\n\n` +
        `PRODUS: ${productType.replace(/_/g, " ")}\n` +
        `DIMENSIUNI: ${width} × ${height} mm\n` +
        `PROFIL: ${profileSeries || "premium_82"}\n` +
        `CULORI: Interior - ${interiorColor || "alb"}, Exterior - ${exteriorColor || "antracit"}\n` +
        `STICLĂ: ${glassType || "tripan"}\n` +
        `FERONERIE: ${hardwareBrand || "siegenia"}\n` +
        (price ? `PREȚ ESTIMATIV: ${formatPrice(price.total)} (incl. TVA)\n` : "") +
        `\nDATE CLIENT:\nNume: ${orderForm.clientName || "—"}\nEmail: ${orderForm.clientEmail}\nTelefon: ${orderForm.clientPhone || "—"}\n` +
        `\nCu stimă,\nEchipa CORE829`;
      
      window.location.href = `mailto:contact@core829.ro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    setShowOrderModal(false);
    setOrderForm({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
    alert("Comanda a fost trimisă cu succes! Veți fi contactat în cel mai scurt timp.");
  }, [productType, width, height, profileSeries, glassType, interiorColor, exteriorColor, hardwareBrand, hardwareLevel, accessories, userRole, distance, includeMontaj, clientCode, dealerId, orderForm, addOrder]);

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

  return (
    <>
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
              width={width}
              height={height}
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
        <div className="flex flex-col md:flex-row h-full">
        {/* Left Panel - Configuration - Full width on mobile, 80 on desktop */}
        <div className={cn(
          "border-r border-slate-200 overflow-y-auto p-3 space-y-3 bg-white",
          "w-full md:w-80",
          mobilePanelOpen ? "absolute inset-0 z-50" : "hidden md:block"
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
                width={width}
                height={height}
                onWidthChange={setWidth}
                onHeightChange={setHeight}
                productType={productType}
              />
              <OpeningPanel
                selected={openingType}
                onSelect={(v) => setOpeningType(v as OpeningType)}
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
                width={width}
                height={height}
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
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden",
          isMobile && mobileViewMode === "panel" && mobilePanelOpen ? "hidden" : "block"
        )}>
          {/* 2D Preview */}
          {showPreview && (
            <div className={cn(
              "flex-1 overflow-auto",
              isMobile ? "p-2" : "p-4"
            )}>
              <div className={cn(
                "mx-auto",
                isMobile ? "max-w-full" : "max-w-2xl"
              )}>
                {/* Window 2D with Side Controls - Stack on mobile */}
                <div className={cn(
                  "flex items-stretch gap-2",
                  isMobile ? "flex-col" : ""
                )}>
                  {/* Left Side Controls - Hidden on mobile, use toggle */}
                  <div className={cn(
                    "flex flex-col gap-1 text-[10px]",
                    isMobile ? "flex-row flex-wrap justify-center" : "w-20"
                  )}>
                    <div className="text-center font-semibold text-slate-600 py-1">Deschidere</div>
                    <button onClick={() => setOpeningSide("left")} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", openingSide === "left" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>← Stânga</button>
                    <button onClick={() => setOpeningSide("right")} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", openingSide === "right" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>Dreapta →</button>
                    <button onClick={() => setOpeningDirection("inward")} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", openingDirection === "inward" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600")}>Interior</button>
                    <button onClick={() => setOpeningDirection("outward")} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", openingDirection === "outward" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600")}>Exterior</button>
                  </div>

                  {/* Window 2D Canvas */}
                  <div className="flex-1">
                    <Window2D
                      productType={productType ?? "window_2_canate"}
                      width={width}
                      height={height}
                      interiorColor={interiorColor ?? "alb_ral9003"}
                      exteriorColor={exteriorColor ?? "antracit_ral7016"}
                      openingSide={openingSide}
                      openingType={openingType === "oscilobatant" ? "oscilobativ" : (openingType === "batant_dreapta" || openingType === "batant_stanga" || openingType === "basculant" || openingType === "obluc") ? "normal" : undefined}
                      openingDirection={openingDirection}
                      sashConfiguration={sashConfiguration ?? undefined}
                      sashRoles={sashRoles}
                      handleHeight={handleHeight}
                      showThreshold={showThreshold}
                      horizontalMuntin={horizontalMuntin}
                      showDimensions={true}
                      scale={0.4}
                      onComponentClick={handleComponentClick}
                    />
                  </div>

                  {/* Right Side Controls */}
                  <div className="w-20 flex flex-col gap-1 text-[10px]">
                    <div className="text-center font-semibold text-slate-600 py-1">Config</div>
                    <button onClick={() => setSashConfiguration("stulp")} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", sashConfiguration === "stulp" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600")}>Stulp</button>
                    <button onClick={() => setSashConfiguration("montant")} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", sashConfiguration === "montant" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>Montant</button>
                    <button onClick={() => setShowThreshold(!showThreshold)} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", showThreshold ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600")}>Prag</button>
                    <button onClick={() => setHorizontalMuntin(!horizontalMuntin)} className={cn("px-1 py-2 rounded text-[10px] font-medium transition-all", horizontalMuntin ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600")}>Muntin</button>
                    {/* Handle Height Slider */}
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <div className="text-[9px] text-center text-slate-500 mb-1">Înălțime maner</div>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={handleHeight}
                        onChange={(e) => setHandleHeight(Number(e.target.value))}
                        className="w-full h-1.5 accent-primary-600"
                      />
                      <div className="text-[9px] text-center text-slate-600 mt-0.5">{handleHeight}mm</div>
                    </div>
                  </div>
                </div>

                {/* Sash Roles - Below Window */}
                {((productType === "window_2_canate" || productType === "window_3_canate" || productType === "usa_balcon_2") && sashConfiguration) && (
                  <div className="mt-2">
                    <div className="text-[10px] text-center text-slate-500 mb-1">Canaturi</div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => {
                          const roles = { left: sashRoles.left || "active", right: sashRoles.right || "inactive" };
                          const nextRole = { active: "inactive", inactive: "fixed", fixed: "active" } as const;
                          setSashRoles({ ...roles, left: nextRole[roles.left as keyof typeof nextRole] });
                        }}
                        className={cn("px-2 py-1 rounded text-[10px] font-medium transition-all", sashRoles.left === "active" ? "bg-green-600 text-white" : sashRoles.left === "inactive" ? "bg-amber-600 text-white" : sashRoles.left === "fixed" ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-600")}
                      >
                        St: {sashRoles.left === "active" ? "Activ" : sashRoles.left === "inactive" ? "Inact" : "Fix"}
                      </button>
                      <button
                        onClick={() => {
                          const roles = { left: sashRoles.left || "active", right: sashRoles.right || "inactive" };
                          const nextRole = { active: "inactive", inactive: "fixed", fixed: "active" } as const;
                          setSashRoles({ ...roles, right: nextRole[roles.right as keyof typeof nextRole] });
                        }}
                        className={cn("px-2 py-1 rounded text-[10px] font-medium transition-all", sashRoles.right === "active" ? "bg-green-600 text-white" : sashRoles.right === "inactive" ? "bg-amber-600 text-white" : sashRoles.right === "fixed" ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-600")}
                      >
                        Dr: {sashRoles.right === "active" ? "Activ" : sashRoles.right === "inactive" ? "Inact" : "Fix"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Status */}
          <div className="h-16 border-t border-slate-200 bg-white flex items-center justify-between px-6">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">Produs:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {productType ? productType.replace(/_/g, " ") : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Profil:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {profileSeries || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Sticlă:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {glassType || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Dealer Mode</span>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  -18%
                </span>
              </div>
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
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors",
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
                  {openingSide === "left" ? "Stânga" : "Dreapta"}
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

        {/* Mobile Floating Action Button */}
        {isMobile && !mobilePanelOpen && (
          <button
            onClick={() => setMobilePanelOpen(true)}
            className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-primary-700 transition-colors"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </AppLayout>
    </>
  );
}
