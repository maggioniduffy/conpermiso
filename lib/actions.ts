"use server";

import { auth, signIn, signOut } from "@/auth";

export async function logout() {
  console.log("log out");
  await signOut();
}

export async function login(method: string, params: any) {
  await signIn(method, ...params);
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await auth();

  return session?.user != undefined;
}
