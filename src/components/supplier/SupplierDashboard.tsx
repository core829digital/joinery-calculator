"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSupplierData } from "@/hooks/useDataIsolation";
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<SupplierTab>("dealers");

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{t("supplier.unauthorized.title")}</h2>
          <p className="text-slate-400">{t("supplier.unauthorized.desc")}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dealers" as SupplierTab, label: t("supplier.tabs.dealers"), icon: Users, count: allDealers.length },
    { id: "clients" as SupplierTab, label: t("supplier.tabs.clients"), icon: Package, count: allClients.length },
    { id: "orders" as SupplierTab, label: t("supplier.tabs.orders"), icon: BarChart3, count: allOrders.length },
    { id: "commissions" as SupplierTab, label: t("supplier.tabs.commissions"), icon: DollarSign, count: allCommissions.length },
    { id: "pricing" as SupplierTab, label: t("supplier.tabs.pricing"), icon: Settings },
    { id: "settings" as SupplierTab, label: t("supplier.tabs.settings"), icon: TrendingUp },
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                {t("supplier.admin.title")}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm truncate">
                SC Core829 SRL • Building Tomorrow's Software Today
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/20 rounded-full">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <span className="text-xs sm:text-sm text-green-400">{t("supplier.admin.badge")}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-slate-800/50 border-b border-slate-700 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap text-xs sm:text-sm",
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px]",
                  activeTab === tab.id ? "bg-white/20" : "bg-slate-700"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Desktop Sidebar */}
          <nav className="hidden lg:block w-56 xl:w-60 flex-shrink-0">
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
              <h3 className="text-sm font-medium text-blue-400 mb-3">{t("supplier.access.title")}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{t("supplier.access.seeDealers")}</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{t("supplier.access.managePrices")}</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{t("supplier.access.approvedCommissions")}</span>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            {activeTab === "dealers" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-3 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-xl font-semibold text-white">{t("supplier.dealers.title")}</h2>
                  <button className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg whitespace-nowrap">
                    + {t("supplier.dealers.addDealer")}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-3 font-medium">{t("supplier.dealers.name")}</th>
                        <th className="pb-3 font-medium">{t("common.email")}</th>
                        <th className="pb-3 font-medium">{t("supplier.dealers.accessCode")}</th>
                        <th className="pb-3 font-medium">{t("supplier.dealers.margin")}</th>
                        <th className="pb-3 font-medium">{t("supplier.dealers.status")}</th>
                        <th className="pb-3 font-medium">{t("supplier.dealers.actions")}</th>
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
                                <CheckCircle className="w-4 h-4" /> {t("supplier.dealers.active")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400 text-sm">
                                <XCircle className="w-4 h-4" /> {t("supplier.dealers.inactive")}
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title={t("supplier.dealers.viewDetails")}>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title={t("common.edit")}>
                                <Edit className="w-4 h-4 text-slate-400" />
                              </button>
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title={t("supplier.dealers.sendEmail")}>
                                <Mail className="w-4 h-4 text-slate-400" />
                              </button>
                              {dealer.isActive ? (
                                <button
                                  onClick={() => deactivateDealer(dealer.id)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title={t("supplier.dealers.deactivate")}
                                >
                                  <XCircle className="w-4 h-4 text-red-400" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => activateDealer(dealer.id)}
                                  className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title={t("supplier.dealers.activate")}
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
                className="bg-slate-800/50 rounded-xl p-3 sm:p-6"
              >
                <h2 className="text-base sm:text-xl font-semibold text-white mb-4 sm:mb-6">{t("supplier.clients.title")}</h2>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-3 font-medium">{t("supplier.clients.name")}</th>
                        <th className="pb-3 font-medium">{t("common.email")}</th>
                        <th className="pb-3 font-medium">{t("common.phone")}</th>
                        <th className="pb-3 font-medium">{t("supplier.clients.dealer")}</th>
                        <th className="pb-3 font-medium">{t("supplier.clients.code")}</th>
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
                                <span className="text-slate-500">{t("supplier.clients.direct")}</span>
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
                className="bg-slate-800/50 rounded-xl p-3 sm:p-6"
              >
                <h2 className="text-base sm:text-xl font-semibold text-white mb-4 sm:mb-6">{t("supplier.orders.title")}</h2>

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
                className="bg-slate-800/50 rounded-xl p-3 sm:p-6"
              >
                <h2 className="text-base sm:text-xl font-semibold text-white mb-4 sm:mb-6">{t("supplier.commissions.title")}</h2>

                <div className="space-y-3">
                  {allCommissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">{commission.dealerName}</p>
                        <p className="text-sm text-slate-400">{t("supplier.commissions.order")}: {commission.orderId.slice(0, 8)}...</p>
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
                className="bg-slate-800/50 rounded-xl p-3 sm:p-6"
              >
                <h2 className="text-base sm:text-xl font-semibold text-white mb-4 sm:mb-6">{t("supplier.pricing.title")}</h2>

                <div className="grid gap-4">
                  {[
                    { name: t("supplier.pricing.window1"), basePrice: 120 },
                    { name: t("supplier.pricing.window2"), basePrice: 180 },
                    { name: t("supplier.pricing.balconyDoor"), basePrice: 250 },
                    { name: t("supplier.pricing.entryPvc"), basePrice: 320 },
                    { name: t("supplier.pricing.entryAlu"), basePrice: 450 },
                  ].map((product) => (
                    <div key={product.name} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-slate-400">{t("supplier.pricing.profile")}: Ecoline 70</p>
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
                      <p className="font-medium text-blue-400">{t("supplier.pricing.controlTitle")}</p>
                      <p className="text-sm text-slate-400">
                        {t("supplier.pricing.controlDesc")}
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
                className="bg-slate-800/50 rounded-xl p-3 sm:p-6"
              >
                <h2 className="text-base sm:text-xl font-semibold text-white mb-4 sm:mb-6">{t("supplier.settings.title")}</h2>

                <div className="grid gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{t("supplier.settings.profileSeries")}</p>
                        <p className="text-sm text-slate-400">{t("supplier.settings.profileSeriesDesc")}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        {t("supplier.settings.configure")}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{t("supplier.settings.glassTypes")}</p>
                        <p className="text-sm text-slate-400">{t("supplier.settings.glassTypesDesc")}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        {t("supplier.settings.configure")}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{t("supplier.settings.colorPalette")}</p>
                        <p className="text-sm text-slate-400">{t("supplier.settings.colorPaletteDesc")}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        {t("supplier.settings.configure")}
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