import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { validateProduct, PRODUCT_VALIDATION_ERROR } from "@/lib/validations/product";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

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
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const product = body ? validateProduct(body, session.user.id) : null;
  if (!product) {
    return NextResponse.json({ error: PRODUCT_VALIDATION_ERROR }, { status: 400 });
  }

  const createdProduct = await prisma.product.create({
    data: { ...product, artisanId: session.user.id },
  });

  return NextResponse.json({ product: createdProduct }, { status: 201 });
}
