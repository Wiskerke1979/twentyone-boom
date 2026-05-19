import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Bump last-login (fire and forget)
        prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const role = (session?.user as any)?.role;
      const path = nextUrl.pathname;

      const isPublic =
        path === "/login" ||
        path === "/register" ||
        path === "/forgot-password" ||
        path.startsWith("/reset-password") ||
        path === "/";
      if (isPublic) return true;

      if (!isLoggedIn) return false;

      // ADMIN can access everything
      if (role === "ADMIN") return true;

      // Role-based redirects
      if (path.startsWith("/admin")) {
        // Block teachers + students from admin
        if (role === "TEACHER") return Response.redirect(new URL("/teacher/dashboard", nextUrl));
        return Response.redirect(new URL("/student/dashboard", nextUrl));
      }
      if (path.startsWith("/student") && role !== "STUDENT") {
        return Response.redirect(new URL("/teacher/dashboard", nextUrl));
      }
      if (path.startsWith("/teacher") && role !== "TEACHER") {
        return Response.redirect(new URL("/student/dashboard", nextUrl));
      }
      return true;
    },
  },
});
