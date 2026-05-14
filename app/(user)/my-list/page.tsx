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
      <div className="flex flex-1 flex-col min-h-0 w-full md:w-3xl mx-auto px-4 py-3 gap-3">
        <div className="flex flex-col min-h-0 flex-1">
          <h3 className="font-semibold text-xl drop-shadow-xl pb-2">
            Mis Guardados
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ErrorBoundary>
              <FavoritesList />
            </ErrorBoundary>
          </div>
        </div>

        {user && (
          <div className="flex flex-col min-h-0 flex-1">
            <h3 className="font-semibold text-xl drop-shadow-xl pb-2">
              Agregados por mi
            </h3>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ErrorBoundary>
                <MyOwnList />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
