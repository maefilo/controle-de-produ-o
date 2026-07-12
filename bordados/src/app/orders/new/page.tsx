"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toaster";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
};

export default function NewOrderPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    client: "",
    model: "",
    quantity: "",
    color: "",
    deadline: "",
    notes: "",
    price: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
  }, []);

  function handleModelChange(modelName: string) {
    const product = products.find((p) => p.name === modelName);
    setForm({ ...form, model: modelName, price: product ? product.price : 0 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Pedido criado com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-800">Novo Pedido</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <input
          type="text"
          placeholder="Cliente"
          value={form.client}
          onChange={(e) => setForm({ ...form, client: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={form.model}
          onChange={(e) => handleModelChange(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          <option value="">Selecione o modelo</option>
          {products.map((p) => (
            <option key={p.id} value={p.name}>{p.name} — R$ {p.price.toFixed(2)}</option>
          ))}
        </select>
        {form.price > 0 && (
          <p className="text-sm text-blue-600">Preço unitário: <strong>R$ {form.price.toFixed(2)}</strong></p>
        )}
        <input
          type="number"
          placeholder="Quantidade"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Cor"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Prazo (ex: 15/07)"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Observações (opcional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar Pedido"}
        </button>
      </form>
    </div>
  );
}
