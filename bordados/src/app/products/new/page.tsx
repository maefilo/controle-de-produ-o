"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toaster";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", category: "", description: "", price: "", image: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setForm((prev) => ({ ...prev, image: data.url }));
      showToast("Imagem enviada!");
    } else {
      showToast(data.error || "Erro no upload", "error");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: form.price }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      showToast("Produto cadastrado!");
      router.push("/catalog");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/catalog" className="text-blue-600 hover:underline text-sm">← Catálogo</Link>
        <h1 className="text-2xl font-bold text-gray-800">Novo Produto</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <input
          type="text" placeholder="Nome do produto" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text" placeholder="Categoria (ex: Camiseta, Toalha, Boné)" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number" step="0.01" placeholder="Preço (ex: 29.90)" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Descrição do produto"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto do produto</label>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="text-sm text-blue-600 mt-1">Enviando imagem...</p>}
          {form.image && (
            <div className="mt-2">
              <img src={form.image} alt="Preview" className="h-32 w-32 object-cover rounded-lg border" />
            </div>
          )}
        </div>
        <button type="submit" disabled={saving || uploading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Cadastrar Produto"}
        </button>
      </form>
    </div>
  );
}
