import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PlusIcon, Terminal } from "lucide-react";
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
  const params = {
    search: query || null,
  };

  const session = await auth();
  const user = session?.user;

  return (
    <div className="w-full h-full grid place-items-center relative overflow-hidden">
      <div className="fixed bottom-10 w-10/12 bg-mywhite h-12 rounded-lg shadow z-88 px-1 flex justify-between place-items-center">
        <SearchForm query={query} />
        {user && (
          <div className="group w-fit z-90 bg-principal rounded-md">
            <Link
              href={"/spot/create"}
              className="h-fit shadow-2xl hover:scale-105"
            >
              <PlusIcon width={40} height={40} />
            </Link>

            <Alert className="hidden group-hover:flex place-items-center w-fit fixed bottom-22 right-5">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Agregar Spot!</AlertTitle>
            </Alert>
          </div>
        )}
      </div>

      <MyMapContainer />
      <GeolocationBanner />
    </div>
  );
}
