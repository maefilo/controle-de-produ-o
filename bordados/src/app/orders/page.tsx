"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  client: string;
  model: string;
  quantity: number;
  color: string;
  deadline: string;
  status: string;
  notes: string;
  createdAt: string;
  user: { name: string };
  messages: { id: number }[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  embroidering: "bg-blue-100 text-blue-800",
  finished: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  embroidering: "Bordando",
  finished: "Finalizado",
};

const ITEMS_PER_PAGE = 8;

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    fetch("/api/orders", { headers: { authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.client.toLowerCase().includes(search.toLowerCase()) || o.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Painel</Link>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
        </div>
        <Link href="/orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Novo Pedido</Link>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por cliente ou modelo..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="embroidering">Bordando</option>
          <option value="finished">Finalizado</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {search || statusFilter ? "Nenhum pedido encontrado com esses filtros." : "Nenhum pedido ainda."}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paged.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-800">{order.client}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{order.model} — {order.quantity} uni. — {order.color} — Prazo: {order.deadline}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{order.user.name}</span>
                  <span>{order.messages.length} msg</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-40">← Anterior</button>
              <span className="px-3 py-1 text-sm text-gray-600">Página {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border text-sm disabled:opacity-40">Próxima →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
