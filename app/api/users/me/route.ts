import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${process.env.BACKEND_URL}/users/me`, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_SECRET!,
    },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
