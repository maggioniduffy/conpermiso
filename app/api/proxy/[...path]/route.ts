import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  console.log("PATH: ", path);
  const token = req.headers.get("authorization");
  const contentType = req.headers.get("content-type") ?? "";

  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${path.join("/")}${searchParams ? `?${searchParams}` : ""}`;

  let body: BodyInit | undefined;
  if (req.method !== "GET") {
    if (contentType.includes("multipart/form-data")) {
      body = await req.arrayBuffer(); // 👈 lee como buffer, no como stream
    } else {
      body = await req.text();
    }
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: token } : {}),
    "x-internal-secret": process.env.INTERNAL_SECRET!,
    ...(!contentType.includes("multipart/form-data")
      ? { "Content-Type": contentType || "application/json" }
      : { "Content-Type": contentType }), // 👈 preserva el boundary
  };

  console.log(body);
  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const data = await res.text();
  console.log("BACKEND RESPONSE:", req.method, res.status, data);

  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
