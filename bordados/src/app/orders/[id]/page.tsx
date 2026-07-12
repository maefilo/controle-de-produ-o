"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toaster";

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
  messages: { id: number; text: string; createdAt: string; user: { name: string } }[];
  statusHistory: { id: number; from: string; to: string; createdAt: string; user: { name: string } }[];
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

const statusIcons: Record<string, string> = {
  pending: "⏳",
  embroidering: "🧵",
  finished: "✅",
};

export default function OrderDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState("");
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/orders/${params.id}`, { headers: { authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setOrder)
      .catch(() => showToast("Erro ao carregar pedido", "error"))
      .finally(() => setLoading(false));
  }, [token, params.id]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim()) return;
    const res = await fetch(`/api/orders/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: msgText }),
    });
    const msg = await res.json();
    setOrder((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
    setMsgText("");
    showToast("Mensagem enviada!");
  }

  async function updateStatus(status: string) {
    setShowConfirm(null);
    await fetch(`/api/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    const res = await fetch(`/api/orders/${params.id}`, { headers: { authorization: `Bearer ${token}` } });
    const updated = await res.json();
    setOrder(updated);
    showToast("Status atualizado!");
  }

  if (loading) return <div className="p-6 text-center py-20"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!order) return <div className="p-6 text-gray-500">Pedido não encontrado</div>;

  const allStatuses = [
    { key: "pending", label: "Pendente", color: "bg-yellow-600 hover:bg-yellow-700" },
    { key: "embroidering", label: "Iniciar Bordado", color: "bg-blue-600 hover:bg-blue-700" },
    { key: "finished", label: "Finalizar", color: "bg-green-600 hover:bg-green-700" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/orders" className="text-blue-600 hover:underline text-sm">← Pedidos</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{order.client}</h1>
            <p className="text-gray-500">{order.model} — {order.quantity} unidades</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
            {statusIcons[order.status]} {statusLabels[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div><span className="font-medium">Cor:</span> {order.color}</div>
          <div><span className="font-medium">Prazo:</span> {order.deadline}</div>
          <div><span className="font-medium">Criado por:</span> {order.user.name}</div>
          <div><span className="font-medium">Data:</span> {new Date(order.createdAt).toLocaleDateString()}</div>
        </div>

        {order.notes && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
            <span className="font-medium">Observações:</span> {order.notes}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {allStatuses.filter((s) => s.key !== order.status).map((s) => (
            <button key={s.key} onClick={() => setShowConfirm(s.key)} className={`px-4 py-2 text-sm text-white rounded-lg ${s.color}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {showConfirm && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 border-l-4 border-l-yellow-400">
          <p className="text-sm text-gray-700 mb-3">Confirmar alteração de status para <strong>{statusLabels[showConfirm]}</strong>?</p>
          <div className="flex gap-2">
            <button onClick={() => updateStatus(showConfirm)} className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Sim, confirmar</button>
            <button onClick={() => setShowConfirm(null)} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      {order.statusHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Status</h2>
          <div className="space-y-3">
            {order.statusHistory.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-32">{new Date(h.createdAt).toLocaleString()}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[h.from]}`}>{statusLabels[h.from]}</span>
                <span className="text-gray-400">→</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[h.to]}`}>{statusLabels[h.to]}</span>
                <span className="text-gray-500">por {h.user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Comunicação</h2>

        <form onSubmit={sendMessage} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Enviar</button>
        </form>

        <div className="space-y-3">
          {order.messages.length === 0 && <p className="text-gray-400 text-sm">Nenhuma mensagem ainda.</p>}
          {order.messages.map((msg) => (
            <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-700">{msg.user.name}</span>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
