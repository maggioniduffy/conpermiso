import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminRequestsPool from "@/components/Requests/AdminRequestsPool";

export default async function AdminRequestsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "admin") redirect("/");
  return <AdminRequestsPool />;
}
