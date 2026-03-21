// app/(spot)/spot/create/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SpotForm from "@/components/Spots/SpotForm";

export default async function CreateSpotPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const role = (session.user as any).role;

  return (
    <div className="min-h-screen bg-mywhite">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SpotForm mode={role === "admin" ? "admin-create" : "request"} />
      </div>
    </div>
  );
}
