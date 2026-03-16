"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { exchangeToken } from "@/lib/apiAuth";
import { useSession } from "next-auth/react";

export interface BackendUser {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// use-backend-user.ts
export function useBackendUser() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { status } = useSession(); // 👈 agregás esto

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      // Esperás a que el token esté en localStorage
      let token = localStorage.getItem("accessToken");

      if (token && isTokenExpired(token)) {
        localStorage.removeItem("accessToken");
        token = null;
      }

      if (!token) {
        // Exchange si no existe
        try {
          token = await exchangeToken();
        } catch {
          setLoading(false);
          return;
        }
      }

      try {
        const res = await apiFetch("/users/me");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [status]); // 👈 depende del status, no corre hasta que sea "authenticated"

  return { user, loading };
}

/*

USAGE EXAMPLE:

const { user, loading } = useBackendUser();
if (loading) return <p>Loading...</p>;
return <p>Welcome {user.email}</p>;

*/
