import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalOrders = await prisma.order.count();
  const pending = await prisma.order.count({ where: { status: "pending" } });
  const embroidering = await prisma.order.count({ where: { status: "embroidering" } });
  const finished = await prisma.order.count({ where: { status: "finished" } });
  const totalProducts = await prisma.product.count({ where: { status: "active" } });
  const totalUsers = await prisma.user.count();

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const overdueOrders = await prisma.order.findMany({
    where: { status: { not: "finished" } },
    orderBy: { deadline: "asc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    stats: { totalOrders, pending, embroidering, finished, totalProducts, totalUsers },
    recentOrders,
    overdueOrders,
  });
}
