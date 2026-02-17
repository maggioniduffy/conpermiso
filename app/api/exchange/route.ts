import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true, // Get the raw JWT token
  });

  console.log("Token:", token);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch("http://localhost:5000/auth/exchange", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // REAL JWT
    },
  });

  console.log("Response from backend:", res);

  return new Response(await res.text(), {
    status: res.status,
  });
}
