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
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { name: true } },
      messages: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      statusHistory: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const current = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!current) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (current.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Você não tem permissão para editar este pedido" }, { status: 403 });
  }

  const body = await req.json();

  if (body.status) {
    if (current.status !== body.status) {
      await prisma.statusHistory.create({
        data: { from: current.status, to: body.status, orderId: Number(id), userId: user.id },
      });

      if (body.status === "finished") {
        await prisma.productionEntry.create({
          data: {
            date: new Date(),
            client: current.client,
            model: current.model,
            quantity: current.quantity,
            color: current.color,
            price: current.price,
            notes: `Pedido #${current.id} finalizado`,
            userId: user.id,
          },
        });
      }
    }
  }

  const order = await prisma.order.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json(order);
}
