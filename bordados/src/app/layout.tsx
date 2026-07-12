import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/Toaster";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Controle de Produção - Bordados",
  description: "Sistema de controle de produção de bordados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
