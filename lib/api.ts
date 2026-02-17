import { getSession } from "next-auth/react";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");

  return fetch(`http://localhost:5000/${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
  });
}
