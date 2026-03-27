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
    <div className="w-full pt-20 flex gap-5 min-w-screen bg-mywhite h-screen">
      <div className="flex flex-1 flex-col w-full gap-5 place-items-center">
        <div className="flex flex-col w-full md:w-3xl p-8 gap-5">
          <h3 className="font-semibold text-2xl drop-shadow-xl">
            Mis Guardados
          </h3>
          <ErrorBoundary>
            <FavoritesList />
          </ErrorBoundary>
        </div>

        {user && (
          <div className="flex flex-col w-full md:w-3xl p-8 gap-5">
            <h3 className="font-semibold text-2xl drop-shadow-xl">
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
