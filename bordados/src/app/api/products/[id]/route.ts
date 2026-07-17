import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return verifyToken(auth.replace("Bearer ", ""));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem editar produtos" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const product = await prisma.product.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(_req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem excluir produtos" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
