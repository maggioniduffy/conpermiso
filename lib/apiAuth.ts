import { getSession } from "next-auth/react";

export async function exchangeToken() {
  const session = await getSession();

  if (!session) throw new Error("Not authenticated");

  const res = await fetch("http://localhost:5000/auth/exchange", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`, // NextAuth JWT
    },
  });

  if (!res.ok) throw new Error("Exchange failed");

  const { accessToken } = await res.json();

  localStorage.setItem("accessToken", accessToken);

  return accessToken;
}
