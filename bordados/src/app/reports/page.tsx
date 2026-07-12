"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  id: number;
  client: string;
  model: string;
  quantity: number;
  color: string;
  deadline: string;
  status: string;
  createdAt: string;
  user: { name: string };
};

export default function ReportsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    fetch("/api/orders", { headers: { authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-6 text-center py-20"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const finished = orders.filter((o) => o.status === "finished");
  const pending = orders.filter((o) => o.status === "pending");
  const embroidering = orders.filter((o) => o.status === "embroidering");

  const totalFinishedQty = finished.reduce((sum, o) => sum + o.quantity, 0);
  const totalPendingQty = pending.reduce((sum, o) => sum + o.quantity, 0);
  const totalEmbroideringQty = embroidering.reduce((sum, o) => sum + o.quantity, 0);

  const byClient = orders.reduce((acc, o) => {
    acc[o.client] = (acc[o.client] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topClients = Object.entries(byClient).sort(([, a], [, b]) => b - a).slice(0, 5);

  const byUser = orders.reduce((acc, o) => {
    acc[o.user.name] = (acc[o.user.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusLabels: Record<string, string> = { pending: "Pendente", embroidering: "Bordando", finished: "Finalizado" };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Painel</Link>
        <h1 className="text-2xl font-bold text-gray-800">Relatórios de Produção</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Finalizados</h3>
          <p className="text-3xl font-bold text-green-700">{finished.length}</p>
          <p className="text-sm text-gray-400">{totalFinishedQty} peças</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Em Produção</h3>
          <p className="text-3xl font-bold text-blue-700">{embroidering.length}</p>
          <p className="text-sm text-gray-400">{totalEmbroideringQty} peças</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-700">{pending.length}</p>
          <p className="text-sm text-gray-400">{totalPendingQty} peças</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pedidos por Cliente</h2>
          {topClients.length === 0 ? (
            <p className="text-gray-400 text-sm">Sem dados.</p>
          ) : (
            <div className="space-y-3">
              {topClients.map(([client, count]) => (
                <div key={client} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{client}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(count / orders.length) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pedidos por Usuário</h2>
          {Object.entries(byUser).length === 0 ? (
            <p className="text-gray-400 text-sm">Sem dados.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byUser).sort(([, a], [, b]) => b - a).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{name}</span>
                  <span className="text-sm font-medium text-gray-600">{count} pedidos</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {finished.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pedidos Finalizados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Modelo</th>
                  <th className="pb-2 font-medium">Qtd</th>
                  <th className="pb-2 font-medium">Cor</th>
                  <th className="pb-2 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {finished.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2">{o.client}</td>
                    <td className="py-2">{o.model}</td>
                    <td className="py-2">{o.quantity}</td>
                    <td className="py-2">{o.color}</td>
                    <td className="py-2">{o.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
