import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Endpoint de uso único (idempotente) para crear o super usuário em produção,
// sem precisar editar o MongoDB manualmente.
//
// Uso (uma vez, após o deploy):
//   curl -X POST https://seu-dominio.com/api/bootstrap/superadmin \
//     -H "x-bootstrap-secret: SEU_SEGREDO"
//
// Requer as seguintes variáveis de ambiente configuradas no servidor:
//   SUPERADMIN_BOOTSTRAP_ENABLED  ("true" — precisa ser setada explicitamente)
//   SUPERADMIN_BOOTSTRAP_SECRET   (segredo para autorizar a chamada)
//   SUPERADMIN_EMAIL
//   SUPERADMIN_PASSWORD
//   SUPERADMIN_NAME               (opcional, padrão "Super Admin")
//
// Hardening (item #8):
//   - Requer um segundo interruptor (SUPERADMIN_BOOTSTRAP_ENABLED) além do
//     segredo, para que o endpoint possa ser completamente desativado em
//     produção — depois do primeiro uso — apenas removendo essa variável,
//     sem precisar girar o segredo.
//   - Comparação do segredo em tempo constante (timing-safe), para não
//     vazar informação por diferença de tempo de resposta.
//   - Continua idempotente: se já existir um super usuário, não cria outro
//     nem sobrescreve nada, mesmo com o segredo correto.
function isValidSecret(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  // timingSafeEqual throws if buffers have different lengths, so compare
  // lengths first (this leaks length, not content — an acceptable tradeoff).
  if (providedBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(providedBuf, expectedBuf);
}

export async function POST(request: Request) {
  if (process.env.SUPERADMIN_BOOTSTRAP_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Este endpoint está desativado. Defina SUPERADMIN_BOOTSTRAP_ENABLED=true para habilitá-lo temporariamente." },
      { status: 404 }
    );
  }

  const expectedSecret = process.env.SUPERADMIN_BOOTSTRAP_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "SUPERADMIN_BOOTSTRAP_SECRET não está configurado no servidor." },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-bootstrap-secret");
  if (!isValidSecret(providedSecret, expectedSecret)) {
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
    // emailVerified: true — the superadmin is created directly from trusted
    // server-side env vars, never through the self-signup email flow (item #7).
    data: { name, email, passwordHash, role: "superadmin", emailVerified: true },
  });

  return NextResponse.json({ message: "Super usuário criado com sucesso.", alreadyExists: false });
}
