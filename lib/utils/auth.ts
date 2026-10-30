import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { clearLoginAttempts, consumeLoginAttempt } from "@/lib/services/login-attempts";

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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const ip = getClientIp({ headers: new Headers(req?.headers) });

        if (!(await consumeLoginAttempt(email, ip))) {
          throw new Error("TooManyAttempts");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return null;

        const validPassword = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!validPassword) return null;

        await clearLoginAttempts(email, ip);

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
        return token;
      }

      // The JWT outlives any change made to the account, so re-check the
      // database on every session read: a removed user loses access and a
      // demoted user loses the old role right away. NextAuth turns this throw
      // into a null session and clears the cookie where it can write one.
      const currentUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { role: true },
      });

      if (!currentUser) throw new Error("SessionUserNotFound");

      token.role = currentUser.role;
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
