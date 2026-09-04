import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "superadmin") return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Só é possível editar por aqui usuários que já sejam admin comum —
  // nunca o super usuário nem artesãos, mesmo manipulando o id.
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "admin") {
    return NextResponse.json({ error: "Este usuário não pode ser editado por aqui." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email) {
    return NextResponse.json({ error: "Informe nome e e-mail." }, { status: 400 });
  }
  if (password && password.length < 8) {
    return NextResponse.json({ error: "A nova senha deve ter ao menos 8 caracteres." }, { status: 400 });
  }

  if (email !== target.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return NextResponse.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });
    }
  }

  const data: { name: string; email: string; passwordHash?: string } = { name, email };
  if (password) data.passwordHash = await bcrypt.hash(password, 12);

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Nunca permitir apagar por aqui nada que não seja um admin comum:
  // protege o próprio super usuário (e qualquer artesão) mesmo que
  // alguém manipule o id na requisição.
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "admin") {
    return NextResponse.json({ error: "Este usuário não pode ser removido por aqui." }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
