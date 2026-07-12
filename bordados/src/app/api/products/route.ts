import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const { name, category, description, price, image } = await request.json();
    const product = await prisma.product.create({
      data: { name, category: category || "", description: description || "", price: Number(price), image: image || "" },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
