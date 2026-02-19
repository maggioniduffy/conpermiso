"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

export function useBackendUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me") //CHANGE THIS TO THE CORRECT ENDPOINT
      .then((res) => res.json())
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
