"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  status: string;
};

export default function CatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filtered = category ? products.filter((p) => p.category === category && p.status === "active") : products.filter((p) => p.status === "active");

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Catálogo de Produtos</h1>
        <div className="flex gap-3">
          {user && <Link href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Novo Produto</Link>}
          <Link href={user ? "/dashboard" : "/login"} className="text-blue-600 hover:underline text-sm">← {user ? "Painel" : "Início"}</Link>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setCategory("")} className={`px-3 py-1 rounded-full text-sm transition ${!category ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Todos
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1 rounded-full text-sm transition ${category === cat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {category ? `Nenhum produto na categoria "${category}"` : "Nenhum produto cadastrado ainda."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition group">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <span className="text-gray-300 text-4xl">📷</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                {product.category && <p className="text-xs text-gray-400 mt-1">{product.category}</p>}
                <p className="text-lg font-bold text-blue-600 mt-2">R$ {product.price.toFixed(2)}</p>
                {user && <p className="text-xs text-gray-400 mt-1 hover:text-blue-600">Editar →</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
