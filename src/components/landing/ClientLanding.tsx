"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Palette,
  FileText,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import Logo from "@/components/Logo";

interface ClientLandingProps {
  onLoginClick?: () => void;
}

export default function ClientLanding({ onLoginClick }: ClientLandingProps) {
  const router = useRouter();

  const features = [
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "Calculator Instant",
      description: "Configurează și calculează prețul în timp real",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "50+ Culori RAL",
      description: "Toate nuanțele disponibile pentru exterior și interior",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Ofertă PDF",
      description: "Descarcă oferta completă în câteva secunde",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Transport Incluit",
      description: "Livrare gratuită în zona acoperită",
    },
  ];

  const benefits = [
    "Prețuri directe de fabrică",
    "Garanție 10 ani",
    "Montaj profesional",
    "Suport tehnic dedicat",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="rounded-xl" />
            <span className="font-semibold text-slate-900 text-lg">TERMOPLAST</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Autentificare
            </button>
            <button
              onClick={() => router.push("/configurator?role=client")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Începe Acum
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
              <Zap className="w-4 h-4" />
              Prețuri Direct de Fabrică
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Ferestre & Uși PVC
              <span className="text-blue-600"> Premium</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Configurează exact ce ai nevoie și primești o ofertă instant.
              Calitate germană, preț românesc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/configurator?role=client")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                Calculează Prețul
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLoginClick}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                Am Cod de Partener
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
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
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">De Ce Să Alegi TERMOPLAST?</h2>
                <p className="text-slate-300 mb-6">
                  Cu peste 15 ani de experiență în producția de tâmplărie PVC, oferim
                  produse de calitate superioară la prețuri directe de fabrică.
                </p>
                <div className="space-y-3">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3 text-slate-200">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Shield className="w-10 h-10 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold">Garanție Extinsă</div>
                      <div className="text-slate-400 text-sm">10 ani pe profil și geam</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Clock className="w-10 h-10 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold">Livrare Rapidă</div>
                      <div className="text-slate-400 text-sm">7-14 zile lucrătoare</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">
              Ai nevoie de ajutor? Sună-ne: <a href="tel:+40745700363" className="text-blue-600 font-medium">+40 745 700 363</a>
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
