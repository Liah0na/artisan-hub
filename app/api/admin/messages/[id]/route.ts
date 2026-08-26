import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const read = typeof body?.read === "boolean" ? body.read : true;

  const updated = await prisma.contactMessage.update({ where: { id }, data: { read } }).catch(() => null);
  if (!updated) return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
