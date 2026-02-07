import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").trim().toLowerCase();
        const password = credentials?.password || "";

        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email }).lean();

        if (!user) return null;
        if (!user.isActive) return null;
        if (!user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Seed admin safety: if email matches ADMIN_EMAIL, force ADMIN role.
        const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
        const role = email === adminEmail ? "ADMIN" : user.role;

        return {
          id: String(user._id),
          name: user.name || "",
          email: user.email,
          role,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // on login
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
