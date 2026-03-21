// app/(user)/requests/edit/[id]/page.tsx
import EditRequestPage from "@/components/Requests/EditRequestPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditRequestPage requestId={id} />;
}
