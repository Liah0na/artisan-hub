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

  if (!name || !description || images.length === 0 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return null;
  return { name, description, images, price, stock };
}

async function getOwnedProduct(id: string, artisanId: string) {
  return prisma.product.findFirst({ where: { id, artisanId } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await getOwnedProduct(id, session.user.id))) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const product = validateProduct(await request.json());
  if (!product) return NextResponse.json({ error: "Informe nome, descrição, ao menos uma imagem, preço válido e estoque inteiro não negativo." }, { status: 400 });

  const updatedProduct = await prisma.product.update({ where: { id }, data: product });
  return NextResponse.json({ product: updatedProduct });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await getOwnedProduct(id, session.user.id))) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
