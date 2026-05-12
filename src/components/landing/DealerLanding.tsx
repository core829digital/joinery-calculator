"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Percent,
  BarChart3,
  FileText,
  Headphones,
  Building2,
  ArrowRight,
  Gift,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DealerLandingProps {
  onLoginClick?: () => void;
}

export default function DealerLanding({ onLoginClick }: DealerLandingProps) {
  const router = useRouter();

  const benefits = [
    {
      icon: <Percent className="w-6 h-6" />,
      title: "Discount 15-25%",
      description: "Prețuri preferentiale pentru dealeri parteneri",
      highlight: true,
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Marjă Personalizată",
      description: "Setează own margin pentru clienții tăi",
      highlight: false,
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Comisioane",
      description: "Vezi și gestionază toate comenzile",
      highlight: false,
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Oferte PDF Branduite",
      description: "Generare rapidă de oferte profesioniste",
      highlight: false,
    },
  ];

  const features = [
    {
      title: "Coduri Client",
      description: "Generează coduri unice pentru fiecare client și track-ui comenzile",
    },
    {
      title: "Comisioane Automate",
      description: "Sistem automat de calcul și urmărire comisioane",
    },
    {
      title: "Suport Prioritar",
      description: "Linie telefonică dedicată pentru dealeri parteneri",
    },
    {
      title: "Training Inclus",
      description: "Sesii de instruire pentru echipa ta de vânzări",
    },
  ];

  const testDealer = {
    email: "dealer@termoplast.ro",
    password: "dealer123",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center overflow-hidden">
              <img src="/images/termoplast-logo.png" alt="TERMOPLAST" className="w-full h-full object-contain p-1" />
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
              Portal Dealer
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
              <Building2 className="w-4 h-4" />
              Program Parteneri
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Devino Dealer
              <span className="text-blue-600"> Autorizat</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Alătură-te rețelei de dealeri TERMOPLAST și beneficiază de prețuri
              preferentiale, comisioane atractive și suport dedicat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onLoginClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                Accesează Portalul
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/configurator?role=client")}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                Vezi Ca Client
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mb-16"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={cn(
                  "rounded-2xl p-6 transition-shadow",
                  benefit.highlight
                    ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white border border-slate-100 shadow-sm hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    benefit.highlight ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                  )}
                >
                  {benefit.icon}
                </div>
                <h3 className={cn("text-lg font-semibold mb-2", benefit.highlight ? "text-white" : "text-slate-900")}>
                  {benefit.title}
                </h3>
                <p className={benefit.highlight ? "text-blue-100" : "text-slate-600"}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Tot Ce Ai Nevoie Ca Dealer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                    <p className="text-slate-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-amber-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Crează-ți Contul de Dealer</h3>
                <p className="text-slate-600 mb-4">
                  Completează formularul de înregistrare și echipa noastră te va contacta
                  în maxim 24 de ore pentru activarea contului.
                </p>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Înregistrare Dealer
                </button>
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
              <Headphones className="w-4 h-4" />
              <span className="text-sm font-medium">Date de Test</span>
            </div>
            <div className="text-sm text-slate-400 grid md:grid-cols-2 gap-2">
              <p>Email: <span className="text-slate-200">{testDealer.email}</span></p>
              <p>Parolă: <span className="text-slate-200">{testDealer.password}</span></p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">
              Ai întrebări? Contactează-ne: <a href="tel:+40745700363" className="text-blue-600 font-medium">+40 745 700 363</a>
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
