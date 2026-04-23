"use server";

import { signIn } from "@/auth";

export async function handleEmailSignIn(formData: FormData) {
  const email = formData.get("email")?.toString();
  await signIn("resend", {
    email: email || "",
    redirect: true,
    callbackUrl: "/link-sent",
    redirectTo: "/",
  });
}
