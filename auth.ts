import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import Resend from "next-auth/providers/resend";

const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY;

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      // If your environment variable is named differently than default
      apiKey: AUTH_RESEND_KEY,
      from: "no-reply@company.com",
    }),
  ],
  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  debug: true,
});
