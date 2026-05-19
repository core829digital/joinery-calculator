"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Settings,
  Users,
  BarChart3,
  DollarSign,
  Package,
  Bell,
  Shield,
  ArrowRight,
  Eye,
  Edit3,
  TrendingUp,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import Logo from "@/components/Logo";

interface SupplierLandingProps {
  onLoginClick?: () => void;
}

export default function SupplierLanding({ onLoginClick }: SupplierLandingProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const adminFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: t("supplierLanding.manageDealers"),
      description: t("supplierLanding.manageDealersDesc"),
      color: "blue",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: t("supplierLanding.commissions"),
      description: t("supplierLanding.commissionsDesc"),
      color: "green",
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: t("supplierLanding.productsPrices"),
      description: t("supplierLanding.productsPricesDesc"),
      color: "blue",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t("supplierLanding.reports"),
      description: t("supplierLanding.reportsDesc"),
      color: "orange",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: t("supplierLanding.notifications"),
      description: t("supplierLanding.notificationsDesc"),
      color: "red",
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: t("supplierLanding.dataBackup"),
      description: t("supplierLanding.dataBackupDesc"),
      color: "teal",
    },
  ];

  const accessLevels = [
    {
      role: t("supplierLanding.adminMain"),
      description: t("supplierLanding.adminMainDesc"),
      color: "from-blue-600 to-indigo-700",
    },
    {
      role: t("supplierLanding.salesManager"),
      description: t("supplierLanding.salesManager"),
      color: "from-blue-600 to-cyan-700",
    },
    {
      role: t("supplierLanding.techSupport"),
      description: t("supplierLanding.techSupport"),
      color: "from-teal-600 to-emerald-700",
    },
  ];

  const testAdmin = {
    email: "contact.core829@gmail.com",
    password: "admin123",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="rounded-xl" />
            <span className="font-semibold text-slate-900 text-lg">Core829 SRL</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t("supplierLanding.home")}
            </button>
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {t("supplierLanding.adminPanel")}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Settings className="w-4 h-4" />
              {t("supplierLanding.controlPanel")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              {t("supplierLanding.adminTitle")}
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("supplierLanding.adminDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onLoginClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                {t("supplierLanding.accessAdmin")}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/dashboard/dealer")}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                {t("supplierLanding.seeAsDealer")}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {adminFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                    feature.color === "blue" && "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                    feature.color === "green" && "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white",
                    feature.color === "blue" && "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                    feature.color === "orange" && "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
                    feature.color === "red" && "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white",
                    feature.color === "teal" && "bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white"
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {t("supplierLanding.accessLevels")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {accessLevels.map((level) => (
                <div
                  key={level.role}
                  className={cn(
                    "rounded-xl p-6 bg-gradient-to-br text-white",
                    level.color
                  )}
                >
                  <h3 className="font-semibold text-lg mb-2">{level.role}</h3>
                  <p className="text-white/80 text-sm">{level.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 grid md:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">{t("supplierLanding.liveView")}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                {t("supplierLanding.liveViewDesc")}
              </p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {t("supplierLanding.realtimeUpdates")}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Edit3 className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">{t("supplierLanding.totalControl")}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                {t("supplierLanding.totalControlDesc")}
              </p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <Shield className="w-4 h-4" />
                {t("supplierLanding.maxSecurity")}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-16 p-6 bg-slate-800 rounded-xl"
          >
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{t("supplierLanding.testDataAdmin")}</span>
            </div>
            <div className="text-sm text-slate-400 grid md:grid-cols-2 gap-2">
              <p>{t("dealerLanding.emailLabel")}: <span className="text-slate-200">{testAdmin.email}</span></p>
              <p>{t("dealerLanding.passwordLabel")}: <span className="text-slate-200">{testAdmin.password}</span></p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">
              {t("supplierLanding.techSupportContact")} <a href="tel:+40745700363" className="text-blue-600 font-medium">+40 745 700 363</a>
            </p>
            <p className="text-slate-400 text-sm">
              Core829 SRL • contact.core829@gmail.com • +40766668482
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
