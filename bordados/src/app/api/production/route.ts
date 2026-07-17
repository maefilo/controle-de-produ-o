import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return verifyToken(auth.replace("Bearer ", ""));
}

export async function GET(req: Request) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const userId = searchParams.get("userId");

  const where: any = {};
  if (userId) where.userId = Number(userId);
  if (month) {
    const start = new Date(month + "-01");
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    where.date = { gte: start, lt: end };
  }

  const entries = await prisma.productionEntry.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0);

  return NextResponse.json({ entries, totalQuantity });
}

export async function POST(req: Request) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { date, client, model, quantity, color, notes } = await req.json();
    const entry = await prisma.productionEntry.create({
      data: {
        date: new Date(date),
        client,
        model,
        quantity: Number(quantity),
        color: color || "",
        notes: notes || "",
        userId: user.id,
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Erro ao registrar produção" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const entry = await prisma.productionEntry.findUnique({ where: { id: Number(id) } });
  if (!entry) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
  if (entry.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Você não tem permissão para excluir este registro" }, { status: 403 });
  }

  await prisma.productionEntry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
