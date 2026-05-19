"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Building2, Users, ShoppingCart, Lock, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import Logo from "@/components/Logo";

type LoginRole = "supplier" | "dealer" | "client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password, selectedRole!);
      if (success) {
        if (selectedRole === "supplier") {
          router.push("/dashboard/supplier");
        } else if (selectedRole === "dealer") {
          router.push("/dashboard/dealer");
        } else {
          router.push("/configurator");
        }
      } else {
        setError(t("login.invalidCredentials"));
      }
} catch {
        setError(t("login.error"));
      } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "supplier" as LoginRole,
      name: t("login.roles.supplier"),
      description: t("login.roles.supplierDesc"),
      icon: <Building2 className="w-8 h-8" />,
      color: "from-purple-600 to-indigo-700",
      hoverColor: "hover:from-purple-500 hover:to-indigo-600",
      borderColor: "group-hover:border-purple-400",
      features: [
        t("login.rolesFeatures.supplier.0"),
        t("login.rolesFeatures.supplier.1"),
        t("login.rolesFeatures.supplier.2"),
        t("login.rolesFeatures.supplier.3"),
      ],
    },
    {
      id: "dealer" as LoginRole,
      name: t("login.roles.dealer"),
      description: t("login.roles.dealerDesc"),
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-600 to-cyan-700",
      hoverColor: "hover:from-blue-500 hover:to-cyan-600",
      borderColor: "group-hover:border-blue-400",
      features: [
        t("login.rolesFeatures.dealer.0"),
        t("login.rolesFeatures.dealer.1"),
        t("login.rolesFeatures.dealer.2"),
        t("login.rolesFeatures.dealer.3"),
      ],
    },
    {
      id: "client" as LoginRole,
      name: t("login.roles.client"),
      description: t("login.roles.clientDesc"),
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "from-emerald-600 to-teal-700",
      hoverColor: "hover:from-emerald-500 hover:to-teal-600",
      borderColor: "group-hover:border-emerald-400",
      features: [
        t("login.rolesFeatures.client.0"),
        t("login.rolesFeatures.client.1"),
        t("login.rolesFeatures.client.2"),
        t("login.rolesFeatures.client.3"),
      ],
    },
  ];

  const testCredentials = {
    supplier: { email: "contact.core829@gmail.com", password: "admin123" },
    dealer: { email: "dealer@core829.ro", password: "dealer123" },
    client: { email: "client@core829.ro", password: "client123" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30 overflow-hidden border border-white/20">
            <Logo size={64} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Core829 SRL</h1>
          <p className="text-slate-400">Building Tomorrow's Software Today</p>
        </motion.div>

        {!selectedRole ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">{t("login.selectRole")}</h2>
              <p className="text-slate-400 text-sm mt-1">{t("login.selectRoleDesc")}</p>
            </div>

            <div className="grid gap-4">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(role.id)}
                  className={`group relative p-5 rounded-xl bg-gradient-to-r ${role.color} ${role.hoverColor} border-2 border-transparent ${role.borderColor} transition-all shadow-lg hover:shadow-xl text-left`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{role.name}</h3>
                      <p className="text-white/80 text-sm">{role.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 text-xs bg-white/10 rounded-full text-white/70"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            <button
              onClick={() => {
                setSelectedRole(null);
                setError("");
              }}
              className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              {t("login.backToSelect")}
            </button>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                  selectedRole === "supplier" && "bg-gradient-to-br from-purple-600 to-indigo-700",
                  selectedRole === "dealer" && "bg-gradient-to-br from-blue-600 to-cyan-700",
                  selectedRole === "client" && "bg-gradient-to-br from-emerald-600 to-teal-700",
                )}>
                  {roles.find((r) => r.id === selectedRole)?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {t("login.authTitle")} {roles.find((r) => r.id === selectedRole)?.name}
                  </h2>
                  <p className="text-slate-400 text-sm">{t("login.authSubtitle")}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {t("login.emailLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="email@exemplu.ro"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {t("login.passwordLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("login.submitButton")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("login.testCredentials")}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>{t("login.emailLabel")}: <span className="text-slate-300">{testCredentials[selectedRole].email}</span></p>
                  <p>{t("login.passwordLabel")}: <span className="text-slate-300">{testCredentials[selectedRole].password}</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-center text-slate-500 text-sm mt-8">
          Core829 SRL • contact.core829@gmail.com • +40766668482
        </p>
      </div>
    </div>
  );
}