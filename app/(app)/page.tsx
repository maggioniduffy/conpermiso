import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PlusIcon, Terminal } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { auth } from "@/auth";
import SpotModal from "@/components/SpotModal";

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  return (
    <SessionProvider>
      <div className="w-full h-full grid place-items-center relative">
        {user && (
          <div className="group fixed bottom-10 right-5  bg-principal rounded-full  ">
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
        <SpotModal />
      </div>
      ;
    </SessionProvider>
  );
}
