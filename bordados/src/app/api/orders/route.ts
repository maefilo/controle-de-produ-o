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

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true } },
      messages: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { client, model, quantity, color, deadline, notes, price } = await req.json();
  const order = await prisma.order.create({
    data: {
      client,
      model,
      quantity: Number(quantity),
      color,
      deadline,
      notes: notes || "",
      price: Number(price) || 0,
      userId: user.id,
    },
  });
  return NextResponse.json(order);
}
