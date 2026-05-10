"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  userRole: "guest" | "authenticated";
}

export default function LandingPage(_props: LandingPageProps) {
  void _props;
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C8</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">
              CORE829
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/sign-in")}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Autentificare
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Calculator Tâmplărie
              <span className="text-primary-600"> Profesional</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Configurator intuitiv pentru ferestre și uși din PVC. Oferte
              instant, direct din fabrică.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            <button
              onClick={() => router.push("/configurator?role=client")}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all duration-300 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10",
                "hover:-translate-y-1"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center mb-6 transition-colors">
                  <Users className="w-7 h-7 text-slate-600 group-hover:text-primary-600 transition-colors" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Sunt Client
                </h3>
                <p className="text-slate-600 mb-4">
                  Prețuri standard pentru clienți. Configurare rapidă și ofertă
                  instantanee.
                </p>
                <span className="text-primary-600 font-medium text-sm flex items-center gap-2">
                  Acces rapid
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/configurator?role=dealer")}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all duration-300 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10",
                "hover:-translate-y-1"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center mb-6 transition-colors">
                  <Building2 className="w-7 h-7 text-slate-600 group-hover:text-primary-600 transition-colors" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Sunt Partener / Dealer
                </h3>
                <p className="text-slate-600 mb-4">
                  Prețuri cu discount și funcții exclusive. Necesită
                  autentificare.
                </p>
                <span className="text-primary-600 font-medium text-sm flex items-center gap-2">
                  Autentificare necesară
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex items-center justify-center gap-8 text-slate-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Oferte instant
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Prețuri transparen
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Export PDF
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}