import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "Se o email estiver cadastrado, você receberá um código de redefinição." });
    }

    const token = crypto.randomBytes(4).toString("hex").toUpperCase();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpires: expires },
    });

    return NextResponse.json({
      message: "Código de redefinição gerado",
      token,
      _dev: "Em produção, este código seria enviado por email. Por enquanto, anote: " + token,
    });
  } catch (e: any) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
