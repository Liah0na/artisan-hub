import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Endpoint de uso único (idempotente) para crear el super usuário en producción,
// sin tener que editar o MongoDB manualmente. Protegido por SUPERADMIN_BOOTSTRAP_SECRET.
//
// Uso (uma vez, após o deploy):
//   curl -X POST https://seu-dominio.com/api/bootstrap/superadmin \
//     -H "x-bootstrap-secret: SEU_SEGREDO"
//
// Requer as seguintes variáveis de ambiente configuradas no servidor:
//   SUPERADMIN_BOOTSTRAP_SECRET  (segredo para autorizar a chamada)
//   SUPERADMIN_EMAIL
//   SUPERADMIN_PASSWORD
//   SUPERADMIN_NAME              (opcional, padrão "Super Admin")

export async function POST(request: Request) {
  const expectedSecret = process.env.SUPERADMIN_BOOTSTRAP_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "SUPERADMIN_BOOTSTRAP_SECRET não está configurado no servidor." },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-bootstrap-secret");
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.user.findFirst({ where: { role: "superadmin" } });
  if (existing) {
    return NextResponse.json({ message: "O super usuário já existe.", alreadyExists: true });
  }

  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Configure SUPERADMIN_EMAIL e SUPERADMIN_PASSWORD no servidor." },
      { status: 500 }
    );
  }

  const emailTaken = await prisma.user.findUnique({ where: { email } });
  if (emailTaken) {
    return NextResponse.json(
      { error: "Já existe uma conta com o e-mail definido em SUPERADMIN_EMAIL." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "superadmin" },
  });

  return NextResponse.json({ message: "Super usuário criado com sucesso.", alreadyExists: false });
}
