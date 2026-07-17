import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword(password),
        resetToken: null,
        resetExpires: null,
      },
    });

    return NextResponse.json({ message: "Senha redefinida com sucesso!" });
  } catch (e: any) {
    console.error("Reset password error:", e);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
