import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

const RESEND_LIMIT = 3;
const RESEND_WINDOW_MS = 60 * 60 * 1000; // 3 requests per IP per hour

const GENERIC_RESPONSE = {
  message: "Se existir uma conta com este e-mail e ela ainda não tiver sido confirmada, enviamos um novo link.",
};

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const ip = getClientIp(request);
  const { success } = rateLimit(`resend-verification:${ip}`, RESEND_LIMIT, RESEND_WINDOW_MS);
  if (!success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  // Always respond the same way whether or not the account exists, and
  // whether or not it's already verified — otherwise this endpoint could
  // be used to enumerate registered emails.
  if (!email) return NextResponse.json(GENERIC_RESPONSE);

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.role === "artisan" && !user.emailVerified) {
    const { token, tokenHash, expiresAt } = generateVerificationToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: tokenHash, verificationTokenExpires: expiresAt },
    });
    await sendVerificationEmail(user.email, token);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
