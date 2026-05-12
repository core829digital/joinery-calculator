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
  windowControls?: React.ReactNode;
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
  windowControls,
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
      {/* Custom Title Bar - Hidden on mobile */}
      <div
        className={cn(
          "h-10 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-4 select-none hidden md:flex",
          "border-b border-slate-700",
          windowFocused ? "bg-gradient-to-r from-slate-900 to-slate-800" : "bg-gradient-to-r from-slate-800 to-slate-700"
        )}
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/images/termoplast-logo.png" alt="TERMOPLAST" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            TERMOPLAST - Calculator Tâmplărie
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

      {/* Mobile Header */}
      <div className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
            <img src="/images/termoplast-logo.png" alt="TERMOPLAST" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-semibold text-base">TERMOPLAST</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="p-2 bg-white/20 rounded-lg">
            <Save className="w-5 h-5 text-white" />
          </button>
          <button onClick={onExportPDF} className="p-2 bg-white/20 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Toolbar - Responsive */}
      <div className="bg-white border-b border-slate-200 flex items-center justify-between px-2 py-2 shadow-sm gap-2 overflow-x-auto">
        {/* Action Buttons - Scrollable on mobile */}
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salvează</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={onSendEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email</span>
          </button>
        </div>

        {/* Window Controls */}
        {windowControls && (
          <div className="hidden md:flex items-center">
            {windowControls}
          </div>
        )}

        {/* Search - Hidden on small mobile */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Caută..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-40 lg:w-72 pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button 
          onClick={onToggleFilter}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {children}
      </main>

      {/* Status Bar - Simplified on mobile */}
      <div className="h-6 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="hidden sm:inline">Conectat</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">{roleDisplay.label}</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">Str. Energiei 470, Dărmănești</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">+40 745 700 363</span>
        </div>
        <div className="text-blue-400 font-medium">TERMOPLAST</div>
      </div>
    </div>
  );
}