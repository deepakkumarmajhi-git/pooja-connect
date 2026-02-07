import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "PRIEST" | "ADMIN";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
