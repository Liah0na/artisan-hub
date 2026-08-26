import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateMessage(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (!name || name.length > 120) return null;
  if (!EMAIL_RE.test(email)) return null;
  if (!message || message.length > 2000) return null;

  return { name, email, message };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const data = body ? validateMessage(body) : null;

  if (!data) {
    return NextResponse.json(
      { error: "Preencha nome, um e-mail válido e a mensagem (até 2000 caracteres)." },
      { status: 400 }
    );
  }

  await prisma.contactMessage.create({ data });

  return NextResponse.json({ ok: true });
}
