"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Users, DollarSign, 
  Package, TrendingUp, Code, Copy, Check, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientConfig } from "@/types";

type TabType = "configurator" | "clients" | "orders" | "commissions" | "prices";

export default function DealerDashboard() {
  const router = useRouter();
  const { user, logout, dealers, clients, orders, commissions, addClient } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("configurator");
  const [showClientCode, setShowClientCode] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  const currentDealer = dealers.find(d => d.id === user?.dealerId);

  const tabs = [
    { id: "configurator", name: "Configurator", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "clients", name: "Clienții Mei", icon: <Users className="w-5 h-5" />, badge: clients.filter(c => c.dealerId === user?.dealerId).length },
    { id: "orders", name: "Comenzi", icon: <Package className="w-5 h-5" />, badge: orders.filter(o => o.dealerId === user?.dealerId).length },
    { id: "commissions", name: "Comisioane", icon: <DollarSign className="w-5 h-5" /> },
    { id: "prices", name: "Prețuri", icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setShowClientCode(code);
    setTimeout(() => setShowClientCode(null), 2000);
  };

  const renderConfigurator = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Configurator Termopane</h2>
        <p className="text-white/80 mb-4">Creează oferte profesionale pentru clienții tăi</p>
        <button
          onClick={() => router.push("/configurator")}
          className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
        >
          <Package className="w-5 h-5" />
          Deschide Configurator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Preț Bază</p>
              <p className="text-2xl font-bold text-slate-800">850 Lei/m²</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Discount Client</p>
              <p className="text-2xl font-bold text-green-600">{currentDealer?.customMargin || 18}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Comision Tău</p>
              <p className="text-2xl font-bold text-amber-600">{currentDealer?.commissionPercent || 15}%</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-primary-600" />
          Codul Tău de Dealer
        </h3>
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <code className="text-2xl font-mono font-bold text-slate-800">{currentDealer?.accessCode || "N/A"}</code>
          <button
            onClick={() => copyToClipboard(currentDealer?.accessCode || "")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-700"
          >
            {showClientCode === currentDealer?.accessCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {showClientCode === currentDealer?.accessCode ? "Copiat!" : "Copiază"}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2">Trimite acest cod clienților tăi pentru a-i lega de contul tău.</p>
      </div>
    </div>
  );

  const renderClients = () => {
    const myClients = clients.filter(c => c.dealerId === user?.dealerId);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Clienții Tăi</h3>
          <button
            onClick={() => setShowAddClient(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adaugă Client
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nume</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telefon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Cod Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {myClients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{client.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{client.clientCode}</code>
                      <button
                        onClick={() => copyToClipboard(client.clientCode || "")}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        {showClientCode === client.clientCode ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-primary-600 hover:underline text-sm font-medium">
                      Trimite Cod
                    </button>
                  </td>
                </tr>
              ))}
              {myClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Nu ai clienți adăugați. Adaugă primul client!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const myOrders = orders.filter(o => o.dealerId === user?.dealerId);
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Produs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dimensiuni</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Preț Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">#{order.id.slice(-6)}</td>
                  <td className="px-4 py-3 text-sm text-slate-800 capitalize">{order.productType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{order.width} x {order.height} mm</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{order.price.total.toLocaleString("ro-RO")} Lei</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      order.status === "completed" && "bg-green-100 text-green-700",
                      order.status === "production" && "bg-blue-100 text-blue-700",
                      order.status === "quoted" && "bg-amber-100 text-amber-700",
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString("ro-RO")}</td>
                </tr>
              ))}
              {myOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Nu ai comenzi încă
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCommissions = () => {
    const myCommissions = commissions.filter(c => c.dealerId === user?.dealerId);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">Total câștigat</p>
            <p className="text-2xl font-bold text-green-600">{myCommissions.filter(c => c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0).toLocaleString("ro-RO")} Lei</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">Comisioane pendinte</p>
            <p className="text-2xl font-bold text-amber-600">{myCommissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commissionAmount, 0).toLocaleString("ro-RO")} Lei</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">Procent comision</p>
            <p className="text-2xl font-bold text-blue-600">{currentDealer?.commissionPercent || 15}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Comandă</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Valoare</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Comision %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Suma</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {myCommissions.map((com) => (
                <tr key={com.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">#{com.orderId.slice(-6)}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{com.orderTotal.toLocaleString("ro-RO")} Lei</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{com.commissionPercent}%</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{com.commissionAmount.toLocaleString("ro-RO")} Lei</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      com.status === "paid" && "bg-green-100 text-green-700",
                      com.status === "pending" && "bg-amber-100 text-amber-700",
                    )}>
                      {com.status}
                    </span>
                  </td>
                </tr>
              ))}
              {myCommissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Nu ai comisioane încă
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPrices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Prețuri și Marje</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-3">Preț de Bază (Furnizor)</h4>
            <div className="text-3xl font-bold text-slate-800">850 Lei/m²</div>
            <p className="text-sm text-slate-500 mt-1">Prețul standard fără discount</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-700 mb-3">Prețul Tău ca Dealer</h4>
            <div className="text-3xl font-bold text-green-700">{Math.round(850 * 0.82)} Lei/m²</div>
            <p className="text-sm text-green-600 mt-1">Discount: 18%</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-2">Calcul Preț Client</h4>
          <div className="text-sm text-blue-600 space-y-1">
            <p>Preț bază: <strong>850 Lei/m²</strong></p>
            <p>Marjă dealer (câștig): <strong>+{(currentDealer?.customMargin || 18) - 18}%</strong></p>
            <p>Preț client final: <strong className="text-lg">{Math.round(850 * (1 + ((currentDealer?.customMargin || 18) - 18) / 100))} Lei/m²</strong></p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "configurator": return renderConfigurator();
      case "clients": return renderClients();
      case "orders": return renderOrders();
      case "commissions": return renderCommissions();
      case "prices": return renderPrices();
      default: return renderConfigurator();
    }
  };

  if (!user || user.role !== "dealer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-slate-600">Acces neautorizat. Trebuie să fiți autentificat ca dealer.</p>
          <a href="/login" className="text-primary-600 hover:underline mt-2 block">Mergeți la login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center">
              <span className="text-white font-bold">C8</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">CORE829</p>
              <p className="text-xs text-slate-500">Dealer Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab.icon}
              <span className="flex-1">{tab.name}</span>
              {tab.badge !== undefined && (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
            ↪ Deconectare
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-800">{tabs.find(t => t.id === activeTab)?.name}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.companyName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>

      {showAddClient && (
        <AddClientModal onClose={() => setShowAddClient(false)} onSave={addClient} dealerId={user.dealerId!} />
      )}
    </div>
  );
}

function AddClientModal({ onClose, onSave, dealerId }: { onClose: () => void; onSave: (client: ClientConfig) => void; dealerId: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: `client_${Date.now()}`, ...form, dealerId, isActive: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Adaugă Client Nou</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nume</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Telefon</label>
            <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Adresă</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg">Anulează</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg">Salvează</button>
          </div>
        </form>
      </div>
    </div>
  );
}