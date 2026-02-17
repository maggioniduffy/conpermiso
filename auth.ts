import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import Resend from "next-auth/providers/resend";

const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_SERVER = process.env.EMAIL_SERVER;

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: AUTH_RESEND_KEY,
      from: EMAIL_FROM,
      server: EMAIL_SERVER,
    }),
  ],
  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
      }

      if (user) {
        token.authProviderId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.emailVerified = true;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.authProviderId as string;
      session.token = token; // Include all token data in session for debugging
      return session;
    },
  },

  debug: true,
});
