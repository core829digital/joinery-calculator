"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSupplierData } from "@/hooks/useDataIsolation";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Settings,
  Shield,
  BarChart3,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SupplierTab = "dealers" | "clients" | "orders" | "commissions" | "pricing" | "settings";

export default function SupplierDashboard() {
  const {
    isAuthorized,
    allDealers,
    allClients,
    allOrders,
    allCommissions,
    activateDealer,
    deactivateDealer,
    updateDealerMargin,
  } = useSupplierData();
  
  const [activeTab, setActiveTab] = useState<SupplierTab>("dealers");

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Acces Neautorizat</h2>
          <p className="text-slate-400">Nu ai permisiunea să accesezi acest panou de admin.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dealers" as SupplierTab, label: "Dealer Parteneri", icon: Users, count: allDealers.length },
    { id: "clients" as SupplierTab, label: "Clienți", icon: Package, count: allClients.length },
    { id: "orders" as SupplierTab, label: "Toate Comenzile", icon: BarChart3, count: allOrders.length },
    { id: "commissions" as SupplierTab, label: "Comisioane", icon: DollarSign, count: allCommissions.length },
    { id: "pricing" as SupplierTab, label: "Prețuri Bază", icon: Settings },
    { id: "settings" as SupplierTab, label: "Setări", icon: TrendingUp },
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
                Panou Administrator
              </h1>
              <p className="text-slate-400 text-sm">
                SC Core829 SRL • Building Tomorrow's Software Today
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Acces Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <nav className="w-60 flex-shrink-0">
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

            <div className="mt-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-400 mb-3">Acces Total</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Vezi toți dealerii</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Gestionează prețuri</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Comisioane aprobate</span>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1">
            {activeTab === "dealers" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Gestionare Dealeri</h2>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                    + Adaugă Dealer
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-3 font-medium">Nume</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Cod Acces</th>
                        <th className="pb-3 font-medium">Marjă</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {allDealers.map((dealer) => (
                        <tr key={dealer.id} className="group">
                          <td className="py-4">
                            <p className="font-medium text-white">{dealer.companyName || dealer.name}</p>
                            <p className="text-sm text-slate-400">{dealer.phone}</p>
                          </td>
                          <td className="py-4 text-slate-300">{dealer.email}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300 font-mono">
                              {dealer.accessCode}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={dealer.customMargin}
                                onChange={(e) => updateDealerMargin(dealer.id, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-center text-white text-sm"
                              />
                              <span className="text-slate-400">%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            {dealer.isActive ? (
                              <span className="flex items-center gap-1 text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4" /> Activ
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400 text-sm">
                                <XCircle className="w-4 h-4" /> Inactiv
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Vezi Detalii">
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Editează">
                                <Edit className="w-4 h-4 text-slate-400" />
                              </button>
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Trimite Email">
                                <Mail className="w-4 h-4 text-slate-400" />
                              </button>
                              {dealer.isActive ? (
                                <button
                                  onClick={() => deactivateDealer(dealer.id)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Dezactivează"
                                >
                                  <XCircle className="w-4 h-4 text-red-400" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => activateDealer(dealer.id)}
                                  className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title="Activează"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "clients" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Toți Clienții</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-3 font-medium">Nume</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Telefon</th>
                        <th className="pb-3 font-medium">Dealer</th>
                        <th className="pb-3 font-medium">Cod</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {allClients.map((client) => {
                        const dealer = allDealers.find((d) => d.id === client.dealerId);
                        return (
                          <tr key={client.id} className="group">
                            <td className="py-4 font-medium text-white">{client.name}</td>
                            <td className="py-4 text-slate-300">{client.email}</td>
                            <td className="py-4 text-slate-300">{client.phone}</td>
                            <td className="py-4">
                              {dealer ? (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                                  {dealer.companyName || dealer.name}
                                </span>
                              ) : (
                                <span className="text-slate-500">Direct</span>
                              )}
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300 font-mono">
                                {client.clientCode}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Toate Comenzile</h2>

                <div className="space-y-3">
                  {allOrders.map((order) => {
                    const dealer = allDealers.find((d) => d.id === order.dealerId);
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            order.status === "completed" ? "bg-green-500" :
                            order.status === "production" ? "bg-blue-500" :
                            order.status === "confirmed" ? "bg-purple-500" :
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
                        <div className="flex items-center gap-6">
                          {dealer && (
                            <span className="text-sm text-blue-400">{dealer.companyName}</span>
                          )}
                          <div className="text-right">
                            <p className="font-semibold text-white">{formatPrice(order.price.total)}</p>
                            <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "commissions" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Gestionare Comisioane</h2>

                <div className="space-y-3">
                  {allCommissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">{commission.dealerName}</p>
                        <p className="text-sm text-slate-400">Comandă: {commission.orderId.slice(0, 8)}...</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatPrice(commission.commissionAmount)}</p>
                          <p className="text-xs text-slate-400">{commission.commissionPercent}% din {formatPrice(commission.orderTotal)}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          commission.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          commission.status === "approved" ? "bg-blue-500/20 text-blue-400" :
                          commission.status === "paid" ? "bg-green-500/20 text-green-400" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {commission.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "pricing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Prețuri Bază (Furnizor)</h2>

                <div className="grid gap-4">
                  {[
                    { name: "Fereastră 1 Canat", basePrice: 120 },
                    { name: "Fereastră 2 Canate", basePrice: 180 },
                    { name: "Ușă Balcon", basePrice: 250 },
                    { name: "Ușă Intrare PVC", basePrice: 320 },
                    { name: "Ușă Intrare Aluminiu", basePrice: 450 },
                  ].map((product) => (
                    <div key={product.name} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-slate-400">Profil: Ecoline 70</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-400">{formatPrice(product.basePrice)}/m²</p>
                        </div>
                        <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-400">Control Total</p>
                      <p className="text-sm text-slate-400">
                        Ca furnizor, ai acces la toate prețurile. Dealerii văd doar prețurile lor personalizate.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Setări Sistem</h2>

                <div className="grid gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Profiluri Serii</p>
                        <p className="text-sm text-slate-400">Gestionare categorii profil</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        Configurează
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Sticlă Tipuri</p>
                        <p className="text-sm text-slate-400">Configurare tipuri geamuri</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        Configurează
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Culori Paletă</p>
                        <p className="text-sm text-slate-400">Gestionare culori RAL</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        Configurează
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}