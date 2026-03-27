import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminRequestsPool from "@/components/Requests/AdminRequestsPool";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function AdminRequestsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "admin") redirect("/");
  return (
    <ErrorBoundary>
      <AdminRequestsPool />
    </ErrorBoundary>
  );
}
