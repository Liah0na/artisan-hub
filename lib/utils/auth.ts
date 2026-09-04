import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return null;

        const validPassword = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!validPassword) return null;

        // Only artisans go through self-signup + email verification. Admins
        // and the superadmin are created directly by a trusted operator
        // (via the admin panel or the bootstrap endpoint) and always have
        // emailVerified set to true at creation time — this check exists
        // only as defense-in-depth in case that ever isn't the case.
        if (user.role === "artisan" && !user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
