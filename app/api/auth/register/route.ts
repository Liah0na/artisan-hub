import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

const SIGNUP_LIMIT = 5;
const SIGNUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour per IP

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = rateLimit(`signup:${ip}`, SIGNUP_LIMIT, SIGNUP_WINDOW_MS);

    if (!success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = signupSchema.parse(body);

    // Honeypot tripped: pretend everything is fine (don't tip off the bot)
    // but skip account creation and email sending entirely.
    if (parsed.website) {
      return NextResponse.json(
        { message: "Conta criada com sucesso." },
        { status: 201 }
      );
    }

    const { name, email, password } = parsed;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { token, tokenHash, expiresAt } = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "artisan",
        emailVerified: false,
        verificationToken: tokenHash,
        verificationTokenExpires: expiresAt,
      },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        message: "Conta criada com sucesso. Verifique seu e-mail para ativar sua conta.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the account." },
      { status: 500 }
    );
  }
}
