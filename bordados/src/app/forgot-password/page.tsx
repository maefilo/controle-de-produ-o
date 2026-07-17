"use client";

import { useState } from "react";
import Link from "next/link";
import { showToast } from "@/components/Toaster";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      }
      showToast(data.message || data.error);
      setStep("reset");
    } catch {
      showToast("Erro ao solicitar redefinição", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Esqueci minha senha</h1>

        {step === "email" ? (
          <form onSubmit={handleRequestCode}>
            <p className="text-sm text-gray-600 mb-4">
              Informe seu email para receber o código de redefinição.
            </p>
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <ResetForm token={token} email={email} />
        )}

        <p className="text-center mt-4 text-sm text-gray-600">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function ResetForm({ token: initialToken, email }: { token: string; email: string }) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("As senhas não conferem", "error");
      return;
    }
    if (password.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error, "error");
        return;
      }
      showToast("Senha redefinida com sucesso!");
      setSuccess(true);
    } catch {
      showToast("Erro ao redefinir senha", "error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-green-600 font-medium mb-4">Senha redefinida com sucesso!</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
          Fazer login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset}>
      <p className="text-sm text-gray-600 mb-4">
        Um código foi gerado. Digite-o abaixo e crie sua nova senha.
      </p>
      {initialToken && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-700 font-medium">Seu código de redefinição:</p>
          <p className="text-lg font-mono font-bold text-yellow-800 tracking-wider">{initialToken}</p>
        </div>
      )}
      <input
        type="text"
        placeholder="Código de redefinição"
        value={token}
        onChange={(e) => setToken(e.target.value.toUpperCase())}
        required
        className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg tracking-wider"
      />
      <input
        type="password"
        placeholder="Nova senha (mín. 6 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={6}
        className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Redefinindo..." : "Redefinir senha"}
      </button>
    </form>
  );
}
