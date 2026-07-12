"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toaster";

type Stats = {
  totalOrders: number;
  pending: number;
  embroidering: number;
  finished: number;
  totalProducts: number;
  totalUsers: number;
};

type Order = {
  id: number;
  client: string;
  model: string;
  quantity: number;
  status: string;
  deadline: string;
  user: { name: string };
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  embroidering: "bg-blue-100 text-blue-800 border-blue-300",
  finished: "bg-green-100 text-green-800 border-green-300",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  embroidering: "Bordando",
  finished: "Finalizado",
};

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/stats", { headers: { authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .catch(() => showToast("Erro ao carregar dados", "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel de Controle</h1>
          <p className="text-gray-500 text-sm">Bem-vindo, {user.name}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/catalog" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">Catálogo</Link>
          <Link href="/orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Novo Pedido</Link>
          <Link href="/products/new" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">+ Produto</Link>
          <button onClick={logout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">Sair</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-2">Carregando...</p>
        </div>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <p className="text-sm text-gray-500">Total de Pedidos</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-5">
                <p className="text-sm text-yellow-600">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-5">
                <p className="text-sm text-blue-600">Bordando</p>
                <p className="text-3xl font-bold text-blue-700">{stats.embroidering}</p>
              </div>
              <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-5">
                <p className="text-sm text-green-600">Finalizados</p>
                <p className="text-3xl font-bold text-green-700">{stats.finished}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pedidos Recentes</h2>
              {recentOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum pedido ainda.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border">
                      <div>
                        <p className="font-medium text-gray-800">{order.client}</p>
                        <p className="text-xs text-gray-500">{order.model} — {order.quantity} uni.</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/orders" className="block text-center text-blue-600 text-sm mt-4 hover:underline">Ver todos os pedidos →</Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo</h2>
              {stats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Produtos cadastrados</span>
                    <span className="font-bold text-gray-800">{stats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Usuários</span>
                    <span className="font-bold text-gray-800">{stats.totalUsers}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Taxa de conclusão</span>
                    <span className="font-bold text-green-700">
                      {stats.totalOrders > 0 ? Math.round((stats.finished / stats.totalOrders) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
              <Link href="/reports" className="block text-center text-blue-600 text-sm mt-4 hover:underline">Ver relatórios →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
