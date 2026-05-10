"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Users, ShoppingCart, DollarSign, Settings, 
  Package, TrendingUp, BarChart3, FileText, Upload, Save,
  CheckCircle, AlertCircle, Plus, Search, Filter, MoreHorizontal, Printer, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DealerConfig, DatabaseConfig } from "@/types";

type TabType = "dashboard" | "dealers" | "clients" | "orders" | "commissions" | "prices" | "settings";

export default function SupplierDashboard() {
  const { user, logout, dealers, clients, orders, commissions, addDealer, suppliers } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showAddDealer, setShowAddDealer] = useState(false);
  const [showImportDB, setShowImportDB] = useState(false);
  const [dbConfig, setDbConfig] = useState<DatabaseConfig | null>(null);

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "dealers", name: "Dealeri", icon: <Users className="w-5 h-5" />, badge: dealers.length },
    { id: "clients", name: "Clienți", icon: <ShoppingCart className="w-5 h-5" />, badge: clients.length },
    { id: "orders", name: "Comenzi", icon: <Package className="w-5 h-5" />, badge: orders.length },
    { id: "commissions", name: "Comisioane", icon: <DollarSign className="w-5 h-5" />, badge: commissions.length },
    { id: "prices", name: "Prețuri", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "settings", name: "Setări", icon: <Settings className="w-5 h-5" /> },
  ];

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.price.total, 0);
    const pendingCommissions = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commissionAmount, 0);
    const paidCommissions = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.commissionAmount, 0);
    const activeDealers = dealers.filter(d => d.isActive).length;
    const totalClients = clients.length;
    
    return {
      totalRevenue,
      pendingCommissions,
      paidCommissions,
      activeDealers,
      totalClients,
      ordersThisMonth: orders.filter(o => {
        const now = new Date();
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [orders, commissions, dealers, clients]);

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setDbConfig(data);
          alert("Baza de date încărcată cu succes! Date pregătite pentru aplicare.");
        } catch {
          alert("Eroare la citirea fișierului. Asigurați-vă că este un JSON valid.");
        }
      };
      reader.readAsText(file);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Venituri Totale", value: stats.totalRevenue.toLocaleString("ro-RO") + " Lei", icon: <DollarSign className="w-6 h-6" />, color: "from-green-600 to-emerald-600" },
          { label: "Comenzi Luna Aceasta", value: stats.ordersThisMonth, icon: <Package className="w-6 h-6" />, color: "from-blue-600 to-cyan-600" },
          { label: "Dealeri Activi", value: stats.activeDealers, icon: <Users className="w-6 h-6" />, color: "from-purple-600 to-indigo-600" },
          { label: "Clienți Totali", value: stats.totalClients, icon: <ShoppingCart className="w-6 h-6" />, color: "from-amber-600 to-orange-600" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "bg-gradient-to-br p-5 rounded-xl text-white shadow-lg",
              stat.color
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Comisioane
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Comisioane Pendinte</span>
              <span className="font-semibold text-amber-600">{stats.pendingCommissions.toLocaleString("ro-RO")} Lei</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Comisioane Plătite</span>
              <span className="font-semibold text-green-600">{stats.paidCommissions.toLocaleString("ro-RO")} Lei</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Ultimele Comenzi
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.slice(-5).reverse().map((order) => (
              <div key={order.id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{order.productType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("ro-RO")}</p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  order.status === "completed" && "bg-green-100 text-green-700",
                  order.status === "production" && "bg-blue-100 text-blue-700",
                  order.status === "quoted" && "bg-amber-100 text-amber-700",
                )}>
                  {order.status}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">Nu există comenzi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDealers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Caută dealer..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtrează
          </button>
        </div>
        <button
          onClick={() => setShowAddDealer(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adaugă Dealer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nume</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telefon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Cod Acces</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Comision %</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer) => (
              <tr key={dealer.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-800">{dealer.name}</p>
                    <p className="text-xs text-slate-500">{dealer.companyName}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{dealer.email}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{dealer.phone}</td>
                <td className="px-4 py-3">
                  <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{dealer.accessCode}</code>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{dealer.commissionPercent}%</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    dealer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {dealer.isActive ? "Activ" : "Inactiv"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {dealers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nu există dealeri adăugați
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Caută client..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nume</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telefon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Cod Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dealer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const dealer = dealers.find(d => d.id === client.dealerId);
              return (
                <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{client.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.phone}</td>
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{client.clientCode}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{dealer?.companyName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      client.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {client.isActive ? "Activ" : "Inactiv"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nu există clienți adăugați
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["toate", "draft", "quoted", "confirmed", "production", "completed"].map((status) => (
          <button
            key={status}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 capitalize"
          >
            {status === "toate" ? "Toate" : status}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Produs</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dimensiuni</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Preț</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-mono text-slate-600">#{order.id.slice(-6)}</td>
                <td className="px-4 py-3 text-sm text-slate-800 capitalize">{order.productType.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{order.width} x {order.height} mm</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{order.price.total.toLocaleString("ro-RO")} Lei</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    order.status === "completed" && "bg-green-100 text-green-700",
                    order.status === "production" && "bg-blue-100 text-blue-700",
                    order.status === "confirmed" && "bg-cyan-100 text-cyan-700",
                    order.status === "quoted" && "bg-amber-100 text-amber-700",
                    order.status === "draft" && "bg-slate-100 text-slate-700",
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString("ro-RO")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-100 rounded" title="Print">
                      <Printer className="w-4 h-4 text-slate-500" />
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded" title="Email">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nu există comenzi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Total Comisioane</p>
          <p className="text-2xl font-bold text-slate-800">{commissions.reduce((s, c) => s + c.commissionAmount, 0).toLocaleString("ro-RO")} Lei</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Comisioane Pendinte</p>
          <p className="text-2xl font-bold text-amber-600">{commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commissionAmount, 0).toLocaleString("ro-RO")} Lei</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Comisioane Plătite</p>
          <p className="text-2xl font-bold text-green-600">{commissions.filter(c => c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0).toLocaleString("ro-RO")} Lei</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dealer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Comandă</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Valoare</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Comision %</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Suma</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((com) => (
              <tr key={com.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-800">{com.dealerName}</td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">#{com.orderId.slice(-6)}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{com.orderTotal.toLocaleString("ro-RO")} Lei</td>
                <td className="px-4 py-3 text-sm text-slate-600">{com.commissionPercent}%</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{com.commissionAmount.toLocaleString("ro-RO")} Lei</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    com.status === "paid" && "bg-green-100 text-green-700",
                    com.status === "pending" && "bg-amber-100 text-amber-700",
                    com.status === "approved" && "bg-blue-100 text-blue-700",
                  )}>
                    {com.status}
                  </span>
                </td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nu există comisioane
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Configurare Prețuri</h3>
          <button
            onClick={() => setShowImportDB(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importă Baza de Date
          </button>
        </div>

        {showImportDB && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-sm text-slate-600 mb-2">Încărcați un fișier JSON cu configurația prețurilor:</p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportDatabase}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-slate-500 mt-2">Fișierul trebuie să conțină: produse, profile, culori, sticlă, feronerie, accesorii</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Preț de Bază</h4>
            <div className="text-2xl font-bold text-primary-600">850 Lei/m²</div>
            <p className="text-xs text-slate-500 mt-1">Preț standard fără discount</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Discount Dealer</h4>
            <div className="text-2xl font-bold text-green-600">18%</div>
            <p className="text-xs text-slate-500 mt-1">Discount pentru dealeri parteneri</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Comision Dealer</h4>
            <div className="text-2xl font-bold text-amber-600">15%</div>
            <p className="text-xs text-slate-500 mt-1">Comision din valoarea comenzii</p>
          </div>
        </div>

        {dbConfig && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Baza de date încărcată cu succes!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Configurația este pregătită pentru aplicare pe platformă.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Informații Furnizor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nume</label>
            <input type="text" defaultValue={suppliers[0]?.name} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input type="email" defaultValue={suppliers[0]?.email} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Telefon</label>
            <input type="tel" defaultValue={suppliers[0]?.phone} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Adresă</label>
            <input type="text" defaultValue={suppliers[0]?.address} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2">
          <Save className="w-4 h-4" />
          Salvează
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Parametri Comision</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Procent Comision Dealer</label>
            <input type="number" defaultValue={suppliers[0]?.commissionPercent} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Discount Implicit</label>
            <input type="number" defaultValue={suppliers[0]?.defaultDiscount} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2">
          <Save className="w-4 h-4" />
          Salvează
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "dealers": return renderDealers();
      case "clients": return renderClients();
      case "orders": return renderOrders();
      case "commissions": return renderCommissions();
      case "prices": return renderPrices();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  if (!user || user.role !== "supplier") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Acces neautorizat. Trebuie să fiți autentificat ca furnizor.</p>
          <a href="/login" className="text-primary-600 hover:underline mt-2 block">Mergeți la login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold">C8</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">CORE829</p>
              <p className="text-xs text-slate-500">Furnizor Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab.icon}
              <span className="flex-1">{tab.name}</span>
              {tab.badge !== undefined && (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
          >
            <span className="w-5 h-5">↪</span>
            Deconectare
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-800">{tabs.find(t => t.id === activeTab)?.name}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.companyName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>

      {showAddDealer && (
        <AddDealerModal onClose={() => setShowAddDealer(false)} onSave={addDealer} />
      )}
    </div>
  );
}

function AddDealerModal({ onClose, onSave }: { onClose: () => void; onSave: (dealer: DealerConfig) => void }) {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    commissionPercent: 15,
    customMargin: 18,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: `dealer_${Date.now()}`,
      ...form,
      supplierId: "supplier_1",
      accessCode: `DLR${Date.now().toString(36).toUpperCase()}`,
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Adaugă Dealer Nou</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nume</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nume Firmă</label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Telefon</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Comision %</label>
              <input
                type="number"
                value={form.commissionPercent}
                onChange={e => setForm({ ...form, commissionPercent: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Marjă %</label>
              <input
                type="number"
                value={form.customMargin}
                onChange={e => setForm({ ...form, customMargin: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg">Anulează</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg">Salvează</button>
          </div>
        </form>
      </div>
    </div>
  );
}