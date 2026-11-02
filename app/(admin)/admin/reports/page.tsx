// app/(admin)/admin/reports/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminReportsList from "@/components/Admin/AdminReportsList";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function AdminReportsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") redirect("/");

  return (
    <ErrorBoundary>
      <AdminReportsList />
    </ErrorBoundary>
  );
}
