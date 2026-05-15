// app/(user)/my-list/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FavoritesList from "@/components/User/FavoritesList";
import MyOwnList from "@/components/User/MyOwnList";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const page = async () => {
  const session = await auth();
  if (!session?.user) return redirect("/");

  const user = session.user;

  return (
    <div className="w-full flex flex-col bg-mywhite overflow-hidden h-[calc(100dvh-3.5rem)]">
      <div className="flex-1 min-h-0 overflow-y-auto w-full md:w-3xl mx-auto px-4 py-3 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-xl drop-shadow-xl pb-2">
            Mis Guardados
          </h3>
          <ErrorBoundary>
            <FavoritesList />
          </ErrorBoundary>
        </div>

        {user && (
          <div>
            <h3 className="font-semibold text-xl drop-shadow-xl pb-2">
              Agregados por mi
            </h3>
            <ErrorBoundary>
              <MyOwnList />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
