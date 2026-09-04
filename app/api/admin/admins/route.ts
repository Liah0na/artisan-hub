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

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Informe nome, e-mail válido e senha com ao menos 8 caracteres." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { name, email, passwordHash, role: "admin", emailVerified: true },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}
