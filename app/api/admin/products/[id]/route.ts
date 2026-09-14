import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

const VALID_STATUSES = new Set(["pending", "approved", "rejected"]);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : "";
  const rejectionReason = typeof body?.rejectionReason === "string" ? body.rejectionReason.trim() : "";

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }
  if (status === "rejected" && !rejectionReason) {
    return NextResponse.json({ error: "Informe o motivo da rejeição." }, { status: 400 });
  }

  const updated = await prisma.product
    .update({
      where: { id },
      data: { status, rejectionReason: status === "rejected" ? rejectionReason : null },
    })
    .catch(() => null);

  if (!updated) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });

  return NextResponse.json(updated);
}
