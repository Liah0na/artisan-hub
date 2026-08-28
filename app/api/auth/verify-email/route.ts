import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/signin?verify=missing`);
  }

  const tokenHash = hashToken(token);

  const user = await prisma.user.findFirst({
    where: { verificationToken: tokenHash },
  });

  if (!user || !user.verificationTokenExpires) {
    return NextResponse.redirect(`${origin}/signin?verify=invalid`);
  }

  if (user.verificationTokenExpires < new Date()) {
    return NextResponse.redirect(`${origin}/signin?verify=expired`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return NextResponse.redirect(`${origin}/signin?verify=success`);
}
