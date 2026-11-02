// app/(spot)/spot/edit/[id]/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SpotForm from "@/components/Spots/SpotForm";
import { Bath } from "@/utils/models";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SuggestEditForm from "./SuggestEditForm";

async function getBath(id: string): Promise<Bath | null> {
  const res = await fetch(`${process.env.BACKEND_URL}/baths/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// Con `?suggest=1` es el formulario de "Sugerir edición" de cualquier usuario
// logueado; sin él, la edición directa (admin / dueño).
export default async function EditSpotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ suggest?: string }>;
}) {
  const { id } = await params;
  const { suggest } = await searchParams;
  const isSuggestion = suggest === "1";

  const session = await auth();
  if (!session?.user) redirect(isSuggestion ? "/auth" : "/");

  const bath = await getBath(id);
  if (!bath) redirect(isSuggestion ? "/" : "/my-list");

  return (
    <div className="py-15 w-full bg-mywhite">
      <div className="flex place-items-center p-5 w-full justify-center">
        <ErrorBoundary>
          {isSuggestion ? (
            <SuggestEditForm bath={bath} />
          ) : (
            <SpotForm initialData={bath} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
