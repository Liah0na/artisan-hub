import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function validateProfile(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) return null;

  const optional = (value: unknown) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    name,
    bio: optional(data.bio),
    phone: optional(data.phone),
    instagram: optional(data.instagram),
    location: optional(data.location),
    avatar: optional(data.avatar),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      phone: true,
      instagram: true,
      location: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const profile = body ? validateProfile(body) : null;

  if (!profile) {
    return NextResponse.json({ error: "Informe ao menos o nome completo." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: profile,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      phone: true,
      instagram: true,
      location: true,
    },
  });

  return NextResponse.json(updated);
}
