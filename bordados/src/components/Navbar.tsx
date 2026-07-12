"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700">🧵 Bordados</Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/catalog" className={`hover:text-blue-600 ${isActive("/catalog") ? "text-blue-600 font-medium" : "text-gray-600"}`}>Catálogo</Link>
          {user ? (
            <>
              <Link href="/dashboard" className={`hover:text-blue-600 ${isActive("/dashboard") ? "text-blue-600 font-medium" : "text-gray-600"}`}>Painel</Link>
              <Link href="/orders" className={`hover:text-blue-600 ${pathname.startsWith("/orders") ? "text-blue-600 font-medium" : "text-gray-600"}`}>Pedidos</Link>
              <Link href="/production" className={`hover:text-blue-600 ${isActive("/production") ? "text-blue-600 font-medium" : "text-gray-600"}`}>Minha Produção</Link>
              <Link href="/reports" className={`hover:text-blue-600 ${isActive("/reports") ? "text-blue-600 font-medium" : "text-gray-600"}`}>Relatórios</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{user.name}</span>
              <button onClick={logout} className="text-gray-500 hover:text-red-600">Sair</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">Entrar</Link>
              <Link href="/register" className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
