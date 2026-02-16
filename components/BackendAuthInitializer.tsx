"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { exchangeToken } from "@/lib/apiAuth";

export default function BackendAuthInitializer() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !localStorage.getItem("accessToken")) {
      exchangeToken().catch(() => {
        console.error("Exchange failed");
      });
    }
  }, [status]);

  return null;
}
