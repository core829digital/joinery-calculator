"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DealerApp from "@/components/app/DealerApp";
import { Lock, ArrowRight } from "lucide-react";

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Se încarcă aplicația...</p>
      </div>
    </div>
  );
}

function ClientCodeEntry({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSubmit(code);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-white font-bold text-2xl">C8</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Calculator Termopane</h1>
          <p className="text-emerald-300">Introduceți codul de client (opțional)</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-1.5">
                Cod Client (opțional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: CLI123456"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continua
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/login" className="text-emerald-300 hover:text-white text-sm">
              Sau autentifică-te aici
            </a>
          </div>
        </div>

        <p className="text-center text-emerald-400/60 text-sm mt-8">
          Dacă ai un cod de la dealer, introdu-l pentru a beneficia de prețuri speciale
        </p>
      </div>
    </div>
  );
}

export default function ConfiguratorPage() {
  const { user, verifyClientCode } = useAuth();
  const [clientCode, setClientCode] = useState<string | null>(null);
  const [showClientEntry, setShowClientEntry] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowClientEntry(true);
    }
  }, [user]);

  const handleClientCodeSubmit = (code: string) => {
    if (code) {
      const isValid = verifyClientCode(code);
      if (isValid) {
        setClientCode(code);
        setShowClientEntry(false);
      } else {
        alert("Cod de client invalid. Continuați fără cod.");
        setShowClientEntry(false);
      }
    } else {
      setShowClientEntry(false);
    }
  };

  if (showClientEntry) {
    return <ClientCodeEntry onSubmit={handleClientCodeSubmit} />;
  }

  if (!user) {
    return <ClientCodeEntry onSubmit={handleClientCodeSubmit} />;
  }

  const userRole = user.role === "supplier" || user.role === "admin" ? "dealer" : user.role;

  return (
    <Suspense fallback={<Loading />}>
      <DealerApp 
        userRole={userRole} 
        clientCode={clientCode}
        dealerId={user.dealerId}
      />
    </Suspense>
  );
}