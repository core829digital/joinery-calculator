"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDealerData } from "@/hooks/useDataIsolation";
import {
  Calculator,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Save,
  Clock,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type DealerTab = "configurator" | "clients" | "orders" | "pricing" | "stats";

export default function DealerDashboard() {
  const { isAuthorized, dealer, clients, orders, stats, getDealerBasePrice, getClientPrice, updateMargin } = useDealerData();
  const { addClient: addClientToContext, user } = useAuth();
  const [activeTab, setActiveTab] = useState<DealerTab>("configurator");
  const [editingMargin, setEditingMargin] = useState<number>(dealer?.customMargin || 0);
  const [marginSaved, setMarginSaved] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Acces Neautorizat</h2>
          <p className="text-slate-400">Nu ai permisiunea să accesezi acest dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "configurator" as DealerTab, label: "Configurator", icon: Calculator },
    { id: "clients" as DealerTab, label: "Clienți", icon: Users, count: clients.length },
    { id: "orders" as DealerTab, label: "Comenzi", icon: Package, count: orders.length },
    { id: "pricing" as DealerTab, label: "Prețuri", icon: DollarSign },
    { id: "stats" as DealerTab, label: "Statistici", icon: TrendingUp },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ro-RO");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="bg-slate-900/50 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Dashboard Dealer
              </h1>
              <p className="text-slate-400 text-sm">
                {dealer?.companyName || dealer?.name} • Cod: {dealer?.accessCode}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-slate-400">Marjă curentă</p>
                <p className="text-lg font-semibold text-blue-400">{editingMargin}%</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <nav className="w-56 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-xl p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="flex-1">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      activeTab === tab.id ? "bg-white/20" : "bg-slate-700"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Info Izolare</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Datele tale sunt izolate</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Nu vezi alți dealeri</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Nu vezi prețurile furnizorului</span>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1">
            {activeTab === "configurator" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Configurator Produse</h2>
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Configurează ferestre și uși pentru clienții tăi</p>
                  <button
                    onClick={() => window.location.href = "/configurator?role=dealer"}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Deschide Configurator
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "clients" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Clienții Mei</h2>
                  <button 
                    onClick={() => setShowAddClient(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                  >
                    + Adaugă Client
                  </button>
                </div>

                {clients.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nu ai clienți încă.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">{client.name}</p>
                          <p className="text-sm text-slate-400">{client.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Cod: {client.clientCode}</p>
                          <p className="text-xs text-slate-500">{client.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Comenzile Mele</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nu ai comenzi încă.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            order.status === "completed" ? "bg-green-500" :
                            order.status === "production" ? "bg-blue-500" :
                            order.status === "quoted" ? "bg-yellow-500" :
                            "bg-slate-500"
                          )} />
                          <div>
                            <p className="font-medium text-white">{order.productType}</p>
                            <p className="text-sm text-slate-400">
                              {order.width}x{order.height}mm • {order.profileSeries}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatPrice(order.price.total)}</p>
                          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "pricing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Configurare Prețuri</h2>

                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-300">Marjă Personalizată</span>
                      <p className="text-xs text-slate-400 mt-1">
                        Această marjă se aplică la prețul de bază pentru a calcula prețul tău de vânzare.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editingMargin}
                        onChange={(e) => {
                          setEditingMargin(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)));
                          setMarginSaved(false);
                        }}
                        className="w-20 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-white font-semibold">%</span>
                      <button
                        onClick={() => {
                          updateMargin(editingMargin);
                          setMarginSaved(true);
                          setTimeout(() => setMarginSaved(false), 2000);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1",
                          marginSaved
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                      >
                        {marginSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {marginSaved ? "Salvat!" : "Salvează"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Preț Bază (Furnizor)</p>
                      <p className="text-sm text-slate-400">Prețul standard fără marjă</p>
                    </div>
                    <p className="text-lg font-semibold text-green-400">100 EUR/m²</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Prețul Tău (Dealer)</p>
                      <p className="text-sm text-slate-400">Cu marja ta de {editingMargin}%</p>
                    </div>
                    <p className="text-lg font-semibold text-blue-400">{formatPrice(getDealerBasePrice(100))}/m²</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Preț Client</p>
                      <p className="text-sm text-slate-400">Cu discount client</p>
                    </div>
                    <p className="text-lg font-semibold text-white">{formatPrice(getClientPrice(100))}/m²</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-400">Informație Izolată</p>
                      <p className="text-sm text-slate-400">
                        Prețurile furnizorului sunt ascunse. Vezi doar prețul tău de achiziție.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Statistici</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-slate-400">Total Clienți</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.totalClients || 0}</p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-slate-400">Total Comenzi</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-slate-400">Venituri</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatPrice(stats?.totalRevenue || 0)}</p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-slate-400">Comenzi În Așteptare</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.pendingOrders || 0}</p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-slate-400">Comisioane</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatPrice(stats?.commissions || 0)}</p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-slate-400">Clienți Activi</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.activeClients || 0}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Adaugă Client Nou</h2>
              <button onClick={() => setShowAddClient(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nume Client</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Numele clientului"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="email@exemplu.ro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="+40 721 000 000"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddClient(false)}
                className="flex-1 py-2 px-4 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  if (newClient.name && newClient.email) {
                    addClientToContext({
                      id: `client_${Date.now()}`,
                      name: newClient.name,
                      email: newClient.email,
                      phone: newClient.phone,
                      address: "",
                      dealerId: user?.dealerId,
                      isActive: true,
                    });
                    setShowAddClient(false);
                    setNewClient({ name: "", email: "", phone: "" });
                  }
                }}
                disabled={!newClient.name || !newClient.email}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}