// app/spot/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { Bath, Allowed } from "@/utils/models";

async function getBath(id: string): Promise<Bath | null> {
  const res = await fetch(`${process.env.BACKEND_URL}/baths/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bath = await getBath(id);

  if (!bath) return notFound();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-6">
      {/* imagen */}
      {bath.images?.[0] && (
        <div className="w-full h-64 relative rounded-xl overflow-hidden">
          <Image
            src={bath.images[0].url}
            alt={bath.images[0].alt || bath.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* header */}
      <div>
        <h1 className="text-3xl font-bold text-jet">{bath.name}</h1>
        <p className="text-gray-500 mt-1">{bath.address}</p>
      </div>

      {/* descripcion */}
      <p className="text-gray-700">{bath.description}</p>

      {/* costo */}
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-jet">Costo:</span>
        <span className="bg-principal/10 text-principal px-3 py-1 rounded-full text-sm">
          {bath.cost ?? "Sin cargo"}
        </span>
      </div>

      {/* permitido */}
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-jet">Baños:</span>
        <span className="bg-principal/10 text-principal px-3 py-1 rounded-full text-sm">
          {bath.allowed === Allowed.BOTH ? "Mixto" : "Separados"}
        </span>
      </div>

      {/* horarios */}
      {bath.shifts && bath.shifts.length > 0 && (
        <div>
          <h2 className="font-semibold text-jet mb-2">Horarios</h2>
          <div className="flex flex-col gap-2">
            {bath.shifts.map((shift, i) => (
              <div
                key={i}
                className="bg-white border border-principal/30 rounded-lg px-4 py-2 text-sm text-gray-700"
              >
                <span className="font-medium">{shift.days.join(", ")}</span>
                {shift.allDay ? (
                  <span className="ml-2 text-principal">— Abierto 24hs</span>
                ) : (
                  <span className="ml-2">
                    — {shift.from?.hour}:{shift.from?.minute ?? "00"} a{" "}
                    {shift.to?.hour}:{shift.to?.minute ?? "00"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
