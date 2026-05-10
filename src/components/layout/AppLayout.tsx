"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Save,
  Printer,
  FileText,
  Mail,
  X,
  Minus,
  Maximize2,
  Search,
  Filter,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  onSave?: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onToggleFilter?: () => void;
}

export default function AppLayout({
  children,
  onSave,
  onPrint,
  onExportPDF,
  onSendEmail,
  searchQuery = "",
  onSearchChange,
  onToggleFilter,
}: AppLayoutProps) {
  const [windowFocused, setWindowFocused] = useState(true);
  const { user } = useAuth();

  const getRoleDisplay = () => {
    switch (user?.role) {
      case "supplier":
        return { label: "Furnizor", discount: "0%" };
      case "dealer":
        return { label: "Dealer", discount: "18%" };
      case "client":
        return { label: "Client", discount: "0%" };
      default:
        return { label: "Vizitator", discount: "0%" };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Custom Title Bar */}
      <div
        className={cn(
          "h-10 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-4 select-none",
          "border-b border-slate-700",
          windowFocused ? "bg-gradient-to-r from-slate-900 to-slate-800" : "bg-gradient-to-r from-slate-800 to-slate-700"
        )}
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">C8</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            CORE829 - Calculator Tâmplărie Pro
          </span>
        </div>

        <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            onClick={() => setWindowFocused(false)}
            className="w-10 h-8 flex items-center justify-center hover:bg-slate-700 rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-slate-400" />
          </button>
          <button
            className="w-10 h-8 flex items-center justify-center hover:bg-slate-700 rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setWindowFocused(true)}
            className="w-10 h-8 flex items-center justify-center hover:bg-red-600 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salvează
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Printează
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={onSendEmail}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            Trimite Email
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Caută rapid... (ex: profil, sticlă, culori)"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-72 pl-10 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
          <button 
            onClick={onToggleFilter}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {children}
      </main>

      {/* Status Bar */}
      <div className="h-7 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Conectat
          </span>
          <span>|</span>
          <span>{roleDisplay.label}: Activ</span>
          <span>|</span>
          <span>Discount: {roleDisplay.discount}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Produse: 8</span>
          <span>|</span>
          <span>Culori: 52+</span>
          <span>|</span>
          <span className="text-primary-400 font-medium">v2.0.0</span>
        </div>
      </div>
    </div>
  );
}