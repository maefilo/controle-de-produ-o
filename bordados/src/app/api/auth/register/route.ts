import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: { name, email, password: hashPassword(password) },
    });
    const token = generateToken(user);
    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Erro no servidor", details: e?.message }, { status: 500 });
  }
}
