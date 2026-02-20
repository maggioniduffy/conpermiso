"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

export interface BackendUser {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
}

export function useBackendUser() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/users/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

/*

USAGE EXAMPLE:

const { user, loading } = useBackendUser();
if (loading) return <p>Loading...</p>;
return <p>Welcome {user.email}</p>;

*/
