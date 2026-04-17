// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const user = token;
  const role = token?.role as string | undefined;

  // rutas solo admin
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/auth", req.url));
    if (role !== "admin") return NextResponse.redirect(new URL("/", req.url));
  }

  // rutas solo autenticados
  const userRoutes = ["/my-list", "/requests"];
  if (userRoutes.some((r) => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL("/auth", req.url));
  }

  // create y edit — cualquier usuario autenticado
  if (
    pathname.startsWith("/spot/create") ||
    pathname.startsWith("/spot/edit")
  ) {
    if (!user) return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|icons|.*\\.png$).*)"],
};
