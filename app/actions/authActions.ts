"use server";

import { signIn } from "@/auth";

export async function handleOtpVerify(email: string, code: string) {
  return await signIn("credentials", {
    email,
    code,
    redirectTo: "/",
  });
}
