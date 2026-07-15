import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    const token = generateToken(user);
    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Erro no servidor", details: e?.message }, { status: 500 });
  }
}
