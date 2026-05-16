"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { UserRole, DealerConfig, ClientConfig, Order, Commission, SupplierConfig } from "@/types";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  dealerId?: string;
  supplierId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  verifyDealerCode: (code: string) => boolean;
  verifyClientCode: (code: string, dealerId?: string) => boolean;
  generateDealerCode: (dealerId: string) => string;
  generateClientCode: (dealerId: string) => string;
  orders: Order[];
  commissions: Commission[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  suppliers: SupplierConfig[];
  dealers: DealerConfig[];
  clients: ClientConfig[];
  addDealer: (dealer: DealerConfig) => void;
  addClient: (client: ClientConfig) => void;
  updateDealerStatus: (dealerId: string, isActive: boolean) => void;
  updateDealerMargin: (dealerId: string, margin: number) => void;
  getDealerPrice: (basePrice: number, dealerId: string) => number;
  getClientPrice: (basePrice: number, dealerId?: string) => number;
  // Data isolation methods
  getAccessibleDealers: () => DealerConfig[];
  getAccessibleClients: () => ClientConfig[];
  getAccessibleOrders: () => Order[];
  getAccessibleCommissions: () => Commission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateUniqueCode = (prefix: string, length: number = 8): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const STORAGE_KEY = "core829_auth";

const defaultDealer: DealerConfig = {
  id: "dealer_demo",
  name: "Dealer Test",
  companyName: "SC TermoServ SRL",
  email: "dealer@core829.ro",
  phone: "+40766668482",
  address: "",
  supplierId: "supplier_1",
  accessCode: "DLRDEMO01",
  commissionPercent: 15,
  customMargin: 18,
  isActive: true,
};

const defaultSupplier: SupplierConfig = {
  id: "supplier_1",
  name: "Admin Principal",
  companyName: "SC Core829 SRL",
  email: "contact.core829@gmail.com",
  phone: "+40766668482",
  address: "",
  commissionPercent: 15,
  defaultDiscount: 0,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dealers, setDealers] = useState<DealerConfig[]>([defaultDealer]);
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierConfig[]>([defaultSupplier]);

  useEffect(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUser(data.user);
        const loadedDealers = data.dealers || [];
        const hasDefaultDealer = loadedDealers.some((d: DealerConfig) => d.id === "dealer_demo");
        setDealers(hasDefaultDealer ? loadedDealers : [defaultDealer, ...loadedDealers]);
        setClients(data.clients || []);
        setOrders(data.orders || []);
        setCommissions(data.commissions || []);
        setSuppliers(data.suppliers || [defaultSupplier]);
      } catch {
        console.error("Failed to load auth data");
      }
    }
  }
}, []);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, dealers, clients, orders, commissions, suppliers })
      );
    }
  }, [user, dealers, clients, orders, commissions, suppliers]);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    if (role === "supplier") {
      const isValid = (email === "contact.core829@gmail.com" && password === "admin123") ||
        (email === "admin@core829.ro" && password === "admin123");
      if (isValid) {
        setUser({
          id: "supplier_1",
          name: "Admin Furnizor",
          email,
          role: "supplier",
          companyName: "SC Core829 SRL",
          supplierId: "supplier_1",
        });
        return true;
      }
    } else if (role === "dealer") {
      const dealer = dealers.find((d) => d.email === email && d.isActive);
      if (dealer) {
        setUser({
          id: dealer.id,
          name: dealer.name,
          email,
          role: "dealer",
          companyName: dealer.companyName,
          dealerId: dealer.id,
        });
        return true;
      }
    } else if (role === "client") {
      setUser({
        id: `client_${Date.now()}`,
        name: "Client Final",
        email,
        role: "client",
      });
      return true;
    }
    return false;
  }, [dealers]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const verifyDealerCode = useCallback((code: string): boolean => {
    return dealers.some((d) => d.accessCode === code && d.isActive);
  }, [dealers]);

  const verifyClientCode = useCallback((code: string, dealerId?: string): boolean => {
    const client = clients.find((c) => c.clientCode === code && c.isActive);
    if (client) {
      return dealerId ? client.dealerId === dealerId : true;
    }
    return false;
  }, [clients]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateDealerCode = useCallback((_dealerId: string): string => {
    return generateUniqueCode("DLR", 8);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateClientCode = useCallback((_dealerId: string): string => {
    return generateUniqueCode("CLI", 6);
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [...prev, order]);
    
    if (order.dealerId) {
      const dealer = dealers.find((d) => d.id === order.dealerId);
      if (dealer) {
        const commission: Commission = {
          id: `com_${Date.now()}`,
          dealerId: order.dealerId,
          dealerName: dealer.companyName || dealer.name,
          orderId: order.id,
          orderTotal: order.price.total,
          commissionPercent: dealer.commissionPercent || 15,
          commissionAmount: Math.round(order.price.total * (dealer.commissionPercent || 15) / 100),
          status: "pending",
          createdAt: new Date(),
        };
        setCommissions((prev) => [...prev, commission]);
      }
    }
  }, [dealers]);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []);

  const addDealer = useCallback((dealer: DealerConfig) => {
    const newDealer = {
      ...dealer,
      accessCode: generateDealerCode(dealer.id),
    };
    setDealers((prev) => [...prev, newDealer]);
  }, [generateDealerCode]);

  const addClient = useCallback((client: ClientConfig) => {
    const dealerId = client.dealerId || "";
    const newClient = {
      ...client,
      clientCode: generateClientCode(dealerId),
    };
    setClients((prev) => [...prev, newClient]);
  }, [generateClientCode]);

  const updateDealerStatus = useCallback((dealerId: string, isActive: boolean) => {
    setDealers((prev) =>
      prev.map((d) => (d.id === dealerId ? { ...d, isActive } : d))
    );
  }, []);

  const updateDealerMargin = useCallback((dealerId: string, margin: number) => {
    setDealers((prev) =>
      prev.map((d) => (d.id === dealerId ? { ...d, customMargin: margin } : d))
    );
  }, []);

  const getDealerPrice = useCallback((basePrice: number, dealerId: string): number => {
    const dealer = dealers.find((d) => d.id === dealerId);
    if (dealer) {
      const margin = dealer.customMargin || 0;
      return Math.round(basePrice * (1 + margin / 100));
    }
    return basePrice;
  }, [dealers]);

  const getClientPrice = useCallback((basePrice: number, dealerId?: string): number => {
    if (dealerId) {
      const dealer = dealers.find((d) => d.id === dealerId);
      if (dealer) {
        const discount = dealer.customMargin || 18;
        return Math.round(basePrice * (1 - discount / 100));
      }
    }
    return basePrice;
  }, [dealers]);

  const getAccessibleDealers = useCallback((): DealerConfig[] => {
    if (!user) return [];
    if (user.role === "supplier") {
      return dealers;
    }
    return [];
  }, [user, dealers]);

  const getAccessibleClients = useCallback((): ClientConfig[] => {
    if (!user) return [];
    if (user.role === "supplier") {
      return clients;
    }
    if (user.role === "dealer" && user.dealerId) {
      return clients.filter((c) => c.dealerId === user.dealerId);
    }
    return [];
  }, [user, clients]);

  const getAccessibleOrders = useCallback((): Order[] => {
    if (!user) return [];
    if (user.role === "supplier") {
      return orders;
    }
    if (user.role === "dealer" && user.dealerId) {
      return orders.filter((o) => o.dealerId === user.dealerId);
    }
    if (user.role === "client" && user.id) {
      return orders.filter((o) => o.clientId === user.id || o.clientEmail === user.email);
    }
    return [];
  }, [user, orders]);

  const getAccessibleCommissions = useCallback((): Commission[] => {
    if (!user) return [];
    if (user.role === "supplier") {
      return commissions;
    }
    if (user.role === "dealer" && user.dealerId) {
      return commissions.filter((c) => c.dealerId === user.dealerId);
    }
    return [];
  }, [user, commissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        verifyDealerCode,
        verifyClientCode,
        generateDealerCode,
        generateClientCode,
        orders,
        commissions,
        addOrder,
        updateOrderStatus,
        suppliers,
        dealers,
        clients,
        addDealer,
        addClient,
        updateDealerStatus,
        updateDealerMargin,
        getDealerPrice,
        getClientPrice,
        getAccessibleDealers,
        getAccessibleClients,
        getAccessibleOrders,
        getAccessibleCommissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}