import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryAssets } from "@/lib/utils/cloudinary.server";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

// Item #5/#16: self-service account deletion.
//
// Policy (see docs/data-retention-and-deletion.md): deleting an account is
// a hard delete, not an anonymization — the account, all of its products,
// and every Cloudinary asset they reference (avatar + product images) are
// permanently removed. There's no order/review history in this app that
// would require keeping a record around, so there's nothing to anonymize
// instead of deleting.
//
// ContactMessage rows are never touched here: they aren't linked to user
// accounts (a guest contacting the site isn't required to have one), so
// they have their own, separate retention policy (item #14).
//
// Superadmin cannot self-delete through this endpoint — doing so could
// leave the platform with no superadmin at all. That has to be handled
// manually (directly in the database, or by promoting someone else first).
export async function DELETE(request: Request) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "superadmin") {
    return NextResponse.json(
      { error: "A conta de super administrador não pode ser removida por aqui." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json(
      { error: "Confirme sua senha atual para excluir a conta." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, avatar: true },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { artisanId: user.id },
    select: { images: true },
  });

  // Delete the database records first (products, then the user). Only once
  // that has actually committed do we clean up Cloudinary — a Cloudinary
  // failure at that point is logged (see deleteCloudinaryAssets) but never
  // blocks the account from being gone.
  await prisma.product.deleteMany({ where: { artisanId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  const productImagePublicIds = products.flatMap((product) => product.images.map((image) => image.publicId));
  const avatarPublicId = user.avatar?.publicId;
  await deleteCloudinaryAssets(avatarPublicId ? [avatarPublicId, ...productImagePublicIds] : productImagePublicIds);

  return NextResponse.json({ ok: true });
}
