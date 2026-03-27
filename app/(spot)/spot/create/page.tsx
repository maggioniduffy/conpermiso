// app/(spot)/spot/create/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SpotForm from "@/components/Spots/SpotForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function CreateSpotPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const role = (session.user as any).role;

  return (
    <div className="min-h-screen bg-mywhite">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <SpotForm mode={role === "admin" ? "admin-create" : "request"} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
