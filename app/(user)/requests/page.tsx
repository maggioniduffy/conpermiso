// app/(user)/requests/page.tsx
import { auth } from "@/auth";
import MyRequestsList from "@/components/Requests/MyRequestsList";
import { redirect } from "next/navigation";

export default async function MyRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  return <MyRequestsList />;
}
