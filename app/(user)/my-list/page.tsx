import SpotCard from "@/components/SpotCard";
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import EditSpotCard from "@/components/EditSpotCard";
import { useBackendUser } from "@/hooks/use-backend-user";
import ProfileCard from "@/components/ProfileCard";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/");

  const user = session.user;
  return (
    <div className="w-full pt-10 flex gap-5 min-w-screen bg-mywhite">
      <ProfileCard />
      <div className="flex flex-1 flex-col w-full gap-5 place-items-center">
        <div className="flex flex-col w-full md:w-3xl p-8 gap-5">
          <h3 className="font-semibold text-2xl drop-shadow-xl">
            {" "}
            Mis Guardados{" "}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-wrap justify-center md:justify-start">
            <SpotCard />
            <SpotCard />
            <SpotCard />
            <SpotCard />
            <SpotCard />
          </div>
        </div>

        {user && ( //filter by owner
          <div className="flex flex-col w-full md:w-3xl p-8 gap-5">
            <h3 className="font-semibold text-2xl drop-shadow-xl">
              {" "}
              Agregados por mi{" "}
            </h3>
            <div className="flex gap-6 flex-wrap justify-center md:justify-start">
              <EditSpotCard />
              <EditSpotCard />
              <EditSpotCard />
              <EditSpotCard />
              <EditSpotCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
