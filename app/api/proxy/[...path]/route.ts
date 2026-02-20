import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  console.log(`Proxying request to: ${BACKEND_URL}/${path.join("/")}`);

  const token = req.headers.get("authorization");

  console.log(`Request method: ${req.method}`);
  console.log(
    token ? `Authorization token: ${token}` : "No authorization token provided",
  );
  const url = `${BACKEND_URL}/${path.join("/")}`;

  const body = req.method !== "GET" ? await req.text() : undefined;

  console.log("Internal Secret:", process.env.INTERNAL_SECRET);

  console.log("Headers sent to backend:", {
    authorization: token,
    internal: process.env.INTERNAL_SECRET,
  });

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      "x-internal-secret": process.env.INTERNAL_SECRET!,
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
