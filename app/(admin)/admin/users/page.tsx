// app/(admin)/admin/users/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminUsersList from "@/components/User/AdminUsersList";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "admin") redirect("/");

  return (
    <ErrorBoundary>
      <AdminUsersList />
    </ErrorBoundary>
  );
}
