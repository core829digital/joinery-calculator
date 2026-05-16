import { useAuth } from "@/context/AuthContext";

export interface DealerPriceConfig {
  basePriceMultiplier: number;
  clientDiscount: number;
  customMargin: number;
}

export interface DealerClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  clientCode: string;
  createdAt: Date;
  totalOrders: number;
  totalRevenue: number;
}

export interface DealerOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  productType: string;
  width: number;
  height: number;
  profileSeries: string;
  price: number;
  status: string;
  createdAt: Date;
}

export interface DealerStats {
  totalClients: number;
  activeClients: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  commissions: number;
}

export function useDealerData() {
  const { user, clients, orders, dealers, commissions, getClientPrice, getDealerPrice, updateDealerMargin } = useAuth();

  if (user?.role !== "dealer" || !user.dealerId) {
    return {
      isAuthorized: false,
      dealer: null,
      clients: [],
      orders: [],
      stats: null,
      updateMargin: () => {},
      getClientPrice: (basePrice: number) => basePrice,
      getDealerBasePrice: (basePrice: number) => basePrice,
    };
  }

  const dealer = dealers.find((d) => d.id === user.dealerId);

  const myClients = clients.filter((c) => c.dealerId === user.dealerId);

  const myOrders = orders.filter((o) => o.dealerId === user.dealerId);

  const myCommissions = commissions.filter((c) => c.dealerId === user.dealerId);

  const stats: DealerStats = {
    totalClients: myClients.length,
    activeClients: myClients.filter((c) => c.isActive).length,
    totalOrders: myOrders.length,
    pendingOrders: myOrders.filter((o) => o.status === "quoted").length,
    totalRevenue: myOrders.reduce((sum, o) => sum + (o.price.total || 0), 0),
    commissions: myCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
  };

  const updateMargin = (margin: number) => {
    if (user.dealerId) {
      updateDealerMargin(user.dealerId, margin);
    }
  };

  const getDealerBasePrice = (basePrice: number): number => {
    if (dealer) {
      return Math.round(basePrice * (1 + (dealer.customMargin || 0) / 100));
    }
    return basePrice;
  };

  return {
    isAuthorized: true,
    dealer,
    clients: myClients,
    orders: myOrders,
    stats,
    updateMargin,
    getClientPrice: (basePrice: number) => getClientPrice(basePrice, user.dealerId),
    getDealerBasePrice,
  };
}

export function useSupplierData() {
  const { user, dealers, clients, orders, commissions, suppliers, updateDealerMargin: updateMarginContext, updateDealerStatus } = useAuth();

  if (user?.role !== "supplier") {
    return {
      isAuthorized: false,
      allDealers: [],
      allClients: [],
      allOrders: [],
      allCommissions: [],
      stats: null,
      activateDealer: () => {},
      deactivateDealer: () => {},
      updateDealerMargin: () => {},
      getSupplierPrice: (basePrice: number) => basePrice,
    };
  }

  const allDealers = dealers;

  const allClients = clients;

  const allOrders = orders;

  const allCommissions = commissions;

  const stats = {
    totalDealers: allDealers.length,
    activeDealers: allDealers.filter((d) => d.isActive).length,
    totalClients: allClients.length,
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((sum, o) => sum + (o.price.total || 0), 0),
    pendingCommissions: allCommissions.filter((c) => c.status === "pending").length,
    totalCommissions: allCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
  };

  const activateDealer = (dealerId: string) => {
    updateDealerStatus(dealerId, true);
  };

  const deactivateDealer = (dealerId: string) => {
    updateDealerStatus(dealerId, false);
  };

  const updateDealerMargin = (dealerId: string, margin: number) => {
    updateMarginContext(dealerId, margin);
  };

  const getSupplierPrice = (basePrice: number): number => {
    return basePrice;
  };

  return {
    isAuthorized: true,
    allDealers,
    allClients,
    allOrders,
    allCommissions,
    stats,
    activateDealer,
    deactivateDealer,
    updateDealerMargin,
    getSupplierPrice,
  };
}

export function useClientData() {
  const { user, orders } = useAuth();

  if (user?.role !== "client") {
    return {
      isAuthorized: false,
      myOrders: [],
      getMyPrice: (basePrice: number) => basePrice,
    };
  }

  const myOrders = orders.filter(
    (o) => o.clientId === user.id || o.clientEmail === user.email
  );

  const getMyPrice = (basePrice: number): number => {
    return basePrice;
  };

  return {
    isAuthorized: true,
    myOrders,
    getMyPrice,
  };
}

export function useDataIsolation() {
  const { user } = useAuth();

  const dealerData = useDealerData();
  const supplierData = useSupplierData();
  const clientData = useClientData();

  switch (user?.role) {
    case "dealer":
      return {
        role: "dealer" as const,
        ...dealerData,
        visibleData: {
          clients: dealerData.clients,
          orders: dealerData.orders,
          stats: dealerData.stats,
        },
        hiddenData: {
          otherDealers: true,
          supplierPrices: true,
          otherClients: true,
          commissions: true,
        },
      };
    case "supplier":
      return {
        role: "supplier" as const,
        ...supplierData,
        visibleData: {
          dealers: supplierData.allDealers,
          clients: supplierData.allClients,
          orders: supplierData.allOrders,
          commissions: supplierData.allCommissions,
          stats: supplierData.stats,
        },
        hiddenData: {
          internalPricing: false,
          dealerMargins: false,
        },
      };
    case "client":
      return {
        role: "client" as const,
        ...clientData,
        visibleData: {
          orders: clientData.myOrders,
        },
        hiddenData: {
          dealerInfo: true,
          supplierInfo: true,
          otherClients: true,
          pricingModel: true,
          discounts: true,
        },
      };
    default:
      return {
        role: "guest" as const,
        isAuthorized: false,
        visibleData: {},
        hiddenData: {
          everything: true,
        },
      };
  }
}