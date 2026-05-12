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

interface SupplierLandingProps {
  onLoginClick?: () => void;
}

export default function SupplierLanding({ onLoginClick }: SupplierLandingProps) {
  const router = useRouter();

  const adminFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestionare Dealers",
      description: "Adaugă, editează și dezactivează conturi de dealeri",
      color: "blue",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Comisioane",
      description: "Monitorizează și aprobă comisioanele dealerilor",
      color: "green",
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Produse & Prețuri",
      description: "Actualizează catalogul și prețurile de bază",
      color: "blue",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Rapoarte",
      description: "Vizualizează statistici și tendințe de vânzări",
      color: "orange",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notificări",
      description: "Alerte pentru comenzi noi și acțiuni importante",
      color: "red",
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Backup Date",
      description: "Export și backup automat al datelor",
      color: "teal",
    },
  ];

  const accessLevels = [
    {
      role: "Admin Principal",
      description: "Acces complet la toate funcțiile sistemului",
      color: "from-blue-600 to-indigo-700",
    },
    {
      role: "Manager Vânzări",
      description: "Gestionează dealers și rapoarte de vânzări",
      color: "from-blue-600 to-cyan-700",
    },
    {
      role: "Suport Tehnic",
      description: "Asistență și configurări pentru clienți",
      color: "from-teal-600 to-emerald-700",
    },
  ];

  const testAdmin = {
    email: "admin@termoplast.ro",
    password: "admin123",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="TERMOPLAST" className="w-full h-full object-contain p-1" />
            </div>
            <span className="font-semibold text-slate-900 text-lg">TERMOPLAST</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Acasă
            </button>
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Panou Administrator
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
              Panou de Control
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Administrator
              <span className="text-blue-600"> System</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Gestionează dealerii, monitorizează vânzările și controlează
              întreaga rețea de distribuție din un singur loc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onLoginClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                Accesează Admin
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/dashboard/dealer")}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                Vezi Ca Dealer
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
              Nivele de Acces
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
                <h3 className="font-semibold text-slate-900">Vizualizare Live</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                Monitorizează în timp real activitatea dealerilor, comenzile și
                performanța vânzărilor.
              </p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Actualizări în timp real
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Edit3 className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Control Total</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                Modifică prețuri, activează/dezactivează dealeri și ajustează
                comisioane instant.
              </p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <Shield className="w-4 h-4" />
                Securitate maximă
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
              <span className="text-sm font-medium">Date de Test Admin</span>
            </div>
            <div className="text-sm text-slate-400 grid md:grid-cols-2 gap-2">
              <p>Email: <span className="text-slate-200">{testAdmin.email}</span></p>
              <p>Parolă: <span className="text-slate-200">{testAdmin.password}</span></p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">
              Suport tehnic: <a href="tel:+40745700363" className="text-blue-600 font-medium">+40 745 700 363</a>
            </p>
            <p className="text-slate-400 text-sm">
              TERMOPLAST • termoplast.ro • +40 745 700 363
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
