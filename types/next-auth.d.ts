import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];

    token: JWT; // 👈 Add this
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
