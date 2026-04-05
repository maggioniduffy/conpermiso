import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import Resend from "next-auth/providers/resend";
import { Resend as ResendClient } from "resend";

const resendClient = new ResendClient(process.env.AUTH_RESEND_KEY);

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await resendClient.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: "Tu link para ingresar a KKapp",
          html: `
            <div style="font-family: Montserrat, sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; background: #f7f9fc; border-radius: 16px;">

              <!-- logo / marca -->
              <div style="text-align: center; margin-bottom: 28px;">
                <span style="font-size: 24px; font-weight: 800; color: #333333; letter-spacing: -0.5px;">
                  KK<span style="color: #4a90e2;">app</span>
                </span>
                <p style="margin: 4px 0 0; font-size: 12px; color: #858585;">Encontrá baños cerca tuyo</p>
              </div>

              <!-- card -->
              <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 28px 24px; text-align: center;">
                <p style="font-size: 28px; margin: 0 0 8px;">🚽</p>
                <h2 style="font-size: 18px; font-weight: 700; color: #333333; margin: 0 0 8px;">
                  ¡Hola! Tu link de acceso está listo
                </h2>
                <p style="font-size: 14px; color: #858585; margin: 0 0 24px; line-height: 1.6;">
                  Hacé clic en el botón para ingresar a tu cuenta.<br/>
                  El link expira en <strong style="color: #333333;">24 horas</strong>.
                </p>

                <a href="${url}" style="
                  display: inline-block;
                  background: #4a90e2;
                  color: #ffffff;
                  font-weight: 700;
                  font-size: 15px;
                  text-decoration: none;
                  padding: 14px 32px;
                  border-radius: 12px;
                  letter-spacing: 0.2px;
                ">
                  Ingresar a KKapp
                </a>

                <p style="margin: 20px 0 0; font-size: 12px; color: #adadad;">
                  Si no pediste este link, podés ignorar este mensaje.
                </p>
              </div>

              <!-- fallback url -->
              <div style="margin-top: 20px; padding: 12px 16px; background: #f0f4fb; border-radius: 10px; border: 1px solid #dbe9f9;">
                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #6fa7e8; text-transform: uppercase; letter-spacing: 0.5px;">
                  O copiá este link en tu navegador
                </p>
                <p style="margin: 0; font-size: 11px; color: #858585; word-break: break-all; line-height: 1.5;">
                  ${url}
                </p>
              </div>

              <p style="text-align: center; margin-top: 24px; font-size: 11px; color: #adadad;">
                KKapp · Encontrá baños cerca tuyo
              </p>
            </div>
          `,
        });
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
