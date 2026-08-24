import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function validateProduct(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const images = Array.isArray(data.images)
    ? data.images.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
    : [];
  const price = Number(data.price);
  const stock = Number(data.stock);

  if (!name || !description || images.length === 0 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    return null;
  }

  return { name, description, images, price, stock };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { artisanId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = validateProduct(await request.json());
  if (!product) {
    return NextResponse.json({ error: "Informe nome, descrição, ao menos uma imagem, preço válido e estoque inteiro não negativo." }, { status: 400 });
  }

  const createdProduct = await prisma.product.create({
    data: { ...product, artisanId: session.user.id },
  });

  return NextResponse.json({ product: createdProduct }, { status: 201 });
}
