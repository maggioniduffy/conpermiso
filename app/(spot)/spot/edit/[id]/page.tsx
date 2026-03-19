import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SpotForm from "@/components/Spots/SpotForm";
import { Bath } from "@/utils/models";

async function getBath(id: string): Promise<Bath | null> {
  const res = await fetch(`${process.env.BACKEND_URL}/baths/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditSpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { id } = await params;
  const bath = await getBath(id);
  if (!bath) redirect("/my-list");

  return (
    <div className="py-15 w-full bg-mywhite">
      <div className="flex place-items-center p-5 w-full justify-center">
        <SpotForm title="Editar Spot" initialData={bath} />
      </div>
    </div>
  );
}
