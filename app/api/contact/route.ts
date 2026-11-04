import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Item #10: contact form is public and unauthenticated, so it's the
// easiest target for spam/abuse — rate limit by IP and use a honeypot
// field (mirrors the signup form's pattern in lib/validations/auth.ts).
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 5 messages per IP per hour

function validateMessage(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  // Honeypot: real users never see/fill this (hidden via CSS in the form).
  const website = typeof data.website === "string" ? data.website.trim() : "";

  if (website) return null;
  if (!name || name.length > 120) return null;
  if (!EMAIL_RE.test(email)) return null;
  if (!message || message.length > 2000) return null;

  return { name, email, message };
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const ip = getClientIp(request);
  const { success } = rateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!success) {
    return NextResponse.json(
      { error: "Muitas mensagens enviadas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

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
