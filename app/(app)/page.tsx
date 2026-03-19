// app/(app)/page.tsx
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import MyMapContainer from "@/components/Maps/MapContainer";
import SearchForm from "@/components/SearchForm";
import GeolocationBanner from "@/components/Maps/GeolocationBanner";

interface Params {
  searchParams: Promise<{ query?: string }>;
}

export default async function Home({ searchParams }: Params) {
  const query = (await searchParams).query;
  const session = await auth();
  const user = session?.user;

  return (
    <div className="w-full h-full relative">
      <MyMapContainer />
      <GeolocationBanner />

      {/* bottom bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg z-[1000]">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2">
          <SearchForm query={query} />

          {user && (
            <Link
              href="/spot/create"
              title="Agregar spot"
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-principal text-white hover:bg-principal-400 hover:scale-110 transition-all shadow-sm"
            >
              <PlusIcon className="size-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
