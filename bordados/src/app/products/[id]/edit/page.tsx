"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toaster";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", category: "", description: "", price: "", image: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({ name: data.name, category: data.category, description: data.description, price: String(data.price), image: data.image });
        setLoading(false);
      })
      .catch(() => { showToast("Erro ao carregar produto", "error"); router.push("/catalog"); });
  }, [params.id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) { setForm((prev) => ({ ...prev, image: data.url })); showToast("Imagem enviada!"); }
    else showToast(data.error || "Erro no upload", "error");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      showToast("Produto atualizado!");
      router.push("/catalog");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    await fetch(`/api/products/${params.id}`, { method: "DELETE" });
    showToast("Produto excluído!");
    router.push("/catalog");
  }

  if (loading) return <div className="p-6 text-center py-20"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/catalog" className="text-blue-600 hover:underline text-sm">← Catálogo</Link>
        <h1 className="text-2xl font-bold text-gray-800">Editar Produto</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <input type="text" placeholder="Nome do produto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="text" placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="number" step="0.01" placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto do produto</label>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {uploading && <p className="text-sm text-blue-600 mt-1">Enviando imagem...</p>}
          {form.image && <div className="mt-2"><img src={form.image} alt="Preview" className="h-32 w-32 object-cover rounded-lg border" /></div>}
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Salvando..." : "Salvar Alterações"}</button>
          <button type="button" onClick={() => setShowDelete(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">Excluir</button>
        </div>
      </form>

      {showDelete && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mt-4 border-l-4 border-l-red-400">
          <p className="text-sm text-gray-700 mb-3">Tem certeza que deseja excluir este produto?</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Sim, excluir</button>
            <button onClick={() => setShowDelete(false)} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
