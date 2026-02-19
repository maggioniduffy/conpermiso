import { auth } from "@/auth";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch("http://localhost:5000/auth/exchange", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_SECRET!, // optional protection
    },
    body: JSON.stringify({
      authProviderId: session.user.id, // or providerAccountId
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      //emailVerified: session.user.emailVerified,
    }),
  });

  return Response.json(await res.json());
}
