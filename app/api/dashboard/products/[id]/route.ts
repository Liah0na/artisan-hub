import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { validateProduct, PRODUCT_VALIDATION_ERROR } from "@/lib/validations/product";
import { deleteCloudinaryAssets } from "@/lib/utils/cloudinary.server";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

async function getOwnedProduct(id: string, artisanId: string) {
  return prisma.product.findFirst({ where: { id, artisanId } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProduct(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const product = body ? validateProduct(body, session.user.id) : null;
  if (!product) return NextResponse.json({ error: PRODUCT_VALIDATION_ERROR }, { status: 400 });

  const updatedProduct = await prisma.product.update({ where: { id }, data: product });

  // Item #4/#6: any image that was on the product before but isn't in the
  // saved version anymore (removed, or replaced by a re-upload) is no
  // longer referenced by anything — delete it from Cloudinary too, not
  // just from Mongo.
  const keptPublicIds = new Set(product.images.map((image) => image.publicId));
  const removedPublicIds = existing.images
    .map((image) => image.publicId)
    .filter((publicId) => !keptPublicIds.has(publicId));
  if (removedPublicIds.length) await deleteCloudinaryAssets(removedPublicIds);

  return NextResponse.json({ product: updatedProduct });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProduct(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.product.delete({ where: { id } });

  // Item #4: clean up every image Cloudinary asset that belonged only to
  // this product. Done after the DB delete succeeds so a Cloudinary hiccup
  // never blocks the product from actually being removed.
  await deleteCloudinaryAssets(existing.images.map((image) => image.publicId));

  return new NextResponse(null, { status: 204 });
}
