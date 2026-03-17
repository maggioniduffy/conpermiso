import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EditSpotCard from "@/components/Spots/EditSpotCard";
import ProfileCard from "@/components/User/ProfileCard";
import FavoritesList from "@/components/User/FavoritesList";
import MyOwnList from "@/components/User/MyOwnList";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/");

  const user = session.user;
  return (
    <div className="w-full pt-20 flex gap-5 min-w-screen bg-mywhite h-screen">
      {/* <ProfileCard /> */}
      <div className="flex flex-1 flex-col w-full gap-5 place-items-center">
        <div className="flex flex-col w-full md:w-3xl p-8 gap-5">
          <h3 className="font-semibold text-2xl drop-shadow-xl">
            {" "}
            Mis Guardados{" "}
          </h3>
          <FavoritesList />
        </div>

        {user && ( //filter by owner
          <div className="flex flex-col w-full md:w-3xl p-8 gap-5">
            <h3 className="font-semibold text-2xl drop-shadow-xl">
              {" "}
              Agregados por mi{" "}
            </h3>
            <MyOwnList />
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
