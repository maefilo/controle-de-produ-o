import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return verifyToken(auth.replace("Bearer ", ""));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { text } = await req.json();
  const message = await prisma.message.create({
    data: { text, orderId: Number(id), userId: user.id },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(message);
}
