"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toaster";

type ProductionEntry = {
  id: number;
  date: string;
  client: string;
  model: string;
  quantity: number;
  color: string;
  price: number;
  notes: string;
  createdAt: string;
  user: { name: string };
};

export default function ProductionPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    client: "",
    model: "",
    quantity: "",
    color: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [filterMonth, setFilterMonth] = useState(currentMonth);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    loadEntries();
  }, [token, filterMonth]);

  function loadEntries() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("month", filterMonth);
    fetch(`/api/production?${params}`, { headers: { authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setEntries(data.entries); setTotalQuantity(data.totalQuantity); })
      .catch(() => showToast("Erro ao carregar produção", "error"))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      showToast("Produção registrada!");
      setShowForm(false);
      setForm({ date: new Date().toISOString().split("T")[0], client: "", model: "", quantity: "", color: "", notes: "" });
      loadEntries();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este registro?")) return;
    await fetch(`/api/production?id=${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    showToast("Registro excluído!");
    loadEntries();
  }

  const entriesByDay = entries.reduce((acc, entry) => {
    const day = new Date(entry.date).toLocaleDateString("pt-BR");
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, ProductionEntry[]>);

  const totalRevenue = entries.reduce((sum, e) => sum + (e.price * e.quantity), 0);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Minha Produção</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          {showForm ? "Cancelar" : "+ Registrar Produção"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input type="text" placeholder="Nome do cliente" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input type="text" placeholder="Modelo do bordado" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input type="number" placeholder="Peças produzidas" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required min="1" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input type="text" placeholder="Cor (opcional)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <input type="text" placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
            {saving ? "Salvando..." : "Registrar"}
          </button>
        </form>
      )}

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-gray-600">Mês:</label>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <p className="text-sm text-blue-600">Total de Peças</p>
          <p className="text-3xl font-bold text-blue-700">{totalQuantity}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <p className="text-sm text-green-600">Receita Total</p>
          <p className="text-3xl font-bold text-green-700">R$ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
          <p className="text-sm text-purple-600">Registros</p>
          <p className="text-3xl font-bold text-purple-700">{entries.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <p className="text-sm text-yellow-600">Média/Dia</p>
          <p className="text-3xl font-bold text-yellow-700">
            {entries.length > 0 ? Math.round(totalQuantity / Object.keys(entriesByDay).length) : 0}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-600">Dias</p>
          <p className="text-3xl font-bold text-gray-700">{Object.keys(entriesByDay).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          Nenhum registro de produção este mês.
        </div>
      ) : (
        <div className="space-y-6">
              {Object.entries(entriesByDay).map(([day, dayEntries]) => {
            const dayTotal = dayEntries.reduce((sum, e) => sum + e.quantity, 0);
            const dayRevenue = dayEntries.reduce((sum, e) => sum + (e.price * e.quantity), 0);
            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b">
                  <h3 className="font-semibold text-gray-700">{day}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-blue-600 font-medium">{dayTotal} peças</span>
                    {dayRevenue > 0 && <span className="text-sm text-green-600 font-medium">R$ {dayRevenue.toFixed(2)}</span>}
                  </div>
                </div>
                <div className="divide-y">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{entry.client}</span>
                          <span className="text-sm text-gray-500">{entry.model}</span>
                          {entry.color && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{entry.color}</span>}
                        </div>
                        {entry.notes && <p className="text-xs text-gray-400 mt-1">{entry.notes}</p>}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-lg font-bold text-blue-600">{entry.quantity}</span>
                          {entry.price > 0 && <p className="text-xs text-gray-500">R$ {(entry.price * entry.quantity).toFixed(2)}</p>}
                        </div>
                        <button onClick={() => handleDelete(entry.id)} className="text-gray-400 hover:text-red-600 text-sm">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
