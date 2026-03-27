// app/(user)/requests/edit/[id]/page.tsx
import EditRequestPage from "@/components/Requests/EditRequestPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ErrorBoundary>
      <EditRequestPage requestId={id} />
    </ErrorBoundary>
  );
}
