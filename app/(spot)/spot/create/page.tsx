// app/(spot)/spot/create/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SpotForm from "@/components/Spots/SpotForm";

export default async function CreateSpotPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const role = (session.user as any).role;

  return <SpotForm mode={role === "admin" ? "admin-create" : "request"} />;
}
