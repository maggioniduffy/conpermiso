import SpotCard from "@/components/SpotCard";
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import EditSpotCard from "@/components/EditSpotCard";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/");

  const user = session.user;
  return (
    <div className="w-full pt-10 flex gap-5 min-w-screen bg-mywhite">
      <div className="hidden lg:flex w-1/4 p-3 profile-bg shadow-xl border-r-3 border-principal p-8 flex-col gap-4">
        <h3 className="text-3xl font-semibold bg-mywhite">
          {" "}
          Faustino Maggioni Duffy
        </h3>
        <Image
          className="rounded-full drop-shadow-lg"
          src={"/icons/cool_avatar.png"}
          width={50}
          height={50}
          alt="Avatar"
          quality={100}
        />
        <p className="text-gray-500 bg-mywhite"> fausmaggioni5@gmail.com </p>
        <p className="bg-mywhite"> Neuquen </p>
      </div>
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
