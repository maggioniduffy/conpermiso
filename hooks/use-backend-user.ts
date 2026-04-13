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
  role: string;
}

const USER_CACHE_KEY = "kkapp:user";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getCachedUser(): BackendUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: BackendUser) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {}
}

function clearCachedUser() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

export default function useBackendUser() {
  const [user, setUser] = useState<BackendUser | null>(() => getCachedUser());
  const [loading, setLoading] = useState(true);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      clearCachedUser();
      setUser(null);
      setLoading(false);
      return;
    }

    if (status !== "authenticated") {
      // "loading" — sesión todavía no resuelta, no hay nada que hacer
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      let token = localStorage.getItem("accessToken");

      if (token && isTokenExpired(token)) {
        localStorage.removeItem("accessToken");
        token = null;
      }

      if (!token) {
        try {
          token = await exchangeToken();
        } catch {
          const cached = getCachedUser();
          setUser(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await apiFetch("/users/me");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
        setCachedUser(data);
      } catch {
        const cached = getCachedUser();
        setUser(cached);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [status]);

  return { user, loading };
}
