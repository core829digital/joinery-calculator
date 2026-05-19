"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import ClientLanding from "./ClientLanding";
import DealerLanding from "./DealerLanding";
import SupplierLanding from "./SupplierLanding";
import Logo from "@/components/Logo";

type LandingView = "main" | "client" | "dealer" | "supplier";

export default function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [view, setView] = useState<LandingView>("main");

  if (view !== "main") {
    switch (view) {
      case "client":
        return <ClientLanding onLoginClick={() => router.push("/login")} />;
      case "dealer":
        return <DealerLanding onLoginClick={() => router.push("/login")} />;
      case "supplier":
        return <SupplierLanding onLoginClick={() => router.push("/login")} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="rounded-xl" />
            <span className="font-semibold text-slate-900 text-lg">
              Core829 SRL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/sign-in")}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t("landing.authButton")}
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
              {t("landing.h1Part1")}
              <span className="text-primary-600"> {t("landing.h1Part2")}</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t("landing.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView("client")}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10",
                "hover:-translate-y-1"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center mb-4 transition-colors">
                  <Users className="w-6 h-6 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t("landing.clientTitle")}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {t("landing.clientDesc")}
                </p>
                <span className="text-emerald-600 font-medium text-sm flex items-center gap-2">
                  {t("landing.seeMore")}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView("dealer")}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10",
                "hover:-translate-y-1"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                  <Building2 className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t("landing.dealerTitle")}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {t("landing.dealerDesc")}
                </p>
                <span className="text-blue-600 font-medium text-sm flex items-center gap-2">
                  {t("landing.seeMore")}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView("supplier")}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10",
                "hover:-translate-y-1"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t("landing.adminTitle")}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {t("landing.adminDesc")}
                </p>
                <span className="text-purple-600 font-medium text-sm flex items-center gap-2">
                  {t("landing.seeMore")}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </motion.button>
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
              {t("landing.featureInstant")}
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
              {t("landing.featureTransparent")}
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
              {t("landing.featurePdf")}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}