import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const token = req.headers.get("authorization");

  const url = `${BACKEND_URL}/${params.path.join("/")}`;

  const body = req.method !== "GET" ? await req.text() : undefined;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      "x-internal-secret": process.env.INTERNAL_SECRET!, // ✅ automatically added
    },
    body,
  });

  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
