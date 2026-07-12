import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Controle de Produção</h1>
        <p className="text-gray-500 mb-8">Sistema de gerenciamento de bordados</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Entrar</Link>
          <Link href="/register" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300">Cadastrar</Link>
          <Link href="/catalog" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">Catálogo</Link>
        </div>
      </div>
    </div>
  );
}
