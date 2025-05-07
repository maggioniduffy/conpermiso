"use server";

import { auth, signIn, signOut } from "@/auth";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

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

export async function uploadFile(formData: FormData) {
  try {
    let file: File;
    if (!formData.get("file") != null) {
      throw new Error("Missing file");
    } else {
      const fileEntry = formData.get("file");
      if (!(fileEntry instanceof File)) {
        throw new Error("Invalid file type");
      }
      file = fileEntry;
    }

    if (!file) {
      throw new Error("No file uploaded");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name}`;
    const fileDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(fileDir, { recursive: true });
    await fs.writeFile(path.join(fileDir, filename), buffer);
    revalidatePath("/"); // Revalidate the root path to update the UI if needed
    return { message: "File uploaded successfully", filename };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { message: "Error uploading file" };
  }
}
