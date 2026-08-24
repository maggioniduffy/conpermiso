import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim();
        const code = (credentials?.code as string)?.trim();
        if (!email || !code) return null;

        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        try {
          const res = await fetch(`${backendUrl}/auth/otp/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          if (data?.user) {
            return {
              id: data.user.id || data.user._id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              accessToken: data.accessToken,
            };
          }
          return null;
        } catch (error) {
          console.error("Error verifying OTP in NextAuth authorize:", error);
          return null;
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    error: "/api/auth/error",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account) token.provider = account.provider;
      if (user) {
        token.authProviderId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.emailVerified = true;
        token.role = (user as any).role ?? null;
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.authProviderId as string;
      (session.user as any).role = token.role ?? null;
      session.token = token;
      return session;
    },
  },

  debug: false,
});

