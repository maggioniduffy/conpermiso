// components/Requests/EditRequestPage.tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Bath } from "@/utils/models";
import SpotForm from "@/components/Spots/SpotForm";
import { Loader } from "lucide-react";

export default function EditRequestPage({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<Bath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/bath-requests/me")
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((r: any) => r._id === requestId);
        setRequest(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-principal" />
      </div>
    );

  if (!request)
    return <p className="text-center py-8">Solicitud no encontrada</p>;

  return (
    <div className="min-h-screen bg-mywhite">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SpotForm
          mode="request"
          title="Editar solicitud"
          initialData={request}
          requestId={requestId}
        />
      </div>
    </div>
  );
}
