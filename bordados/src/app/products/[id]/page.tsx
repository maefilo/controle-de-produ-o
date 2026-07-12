"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  createdAt: string;
};

export default function ProductDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-6 text-center py-20"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="p-6 text-gray-500">Produto não encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/catalog" className="text-blue-600 hover:underline text-sm mb-6 inline-block">← Catálogo</Link>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full max-h-96 object-contain" />
            ) : (
              <span className="text-gray-300 text-6xl">📷</span>
            )}
          </div>
          <div className="p-8 md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            {product.category && <p className="text-sm text-blue-600 font-medium mb-4">{product.category}</p>}
            <p className="text-4xl font-bold text-blue-600 mb-6">R$ {product.price.toFixed(2)}</p>
            {product.description && <div className="text-gray-600 leading-relaxed mb-6">{product.description}</div>}
            <p className="text-xs text-gray-400">Cadastrado em {new Date(product.createdAt).toLocaleDateString()}</p>
            {user && (
              <Link href={`/products/${product.id}/edit`} className="inline-block mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">Editar Produto</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
