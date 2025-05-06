import SpotCard from "@/components/SpotCard";
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/");

  return (
    <div className="w-full h-screen flex gap-5 pt-10 -z-1">
      <div className="hidden lg:flex w-1/4 p-3 profile-bg shadow-xl h-full border-r-3 border-principal p-8 flex-col gap-4">
        <h3 className="text-3xl font-semibold bg-mywhite">
          {" "}
          Faustino Maggioni Duffy
        </h3>
        <Image
          className="rounded-full drop-shadow-lg -z-8"
          src={"/icons/cool_avatar.png"}
          width={50}
          height={50}
          alt="Avatar"
          quality={100}
        />
        <p className="text-gray-500 bg-mywhite"> fausmaggioni5@gmail.com </p>
        <p className="bg-mywhite"> Neuquen </p>
      </div>
      <div className="flex flex-col w-full md:w-3xl p-8 gap-5 -z-10">
        <h3 className="font-semibold text-2xl drop-shadow-xl -z-9">
          {" "}
          Mis Guardados{" "}
        </h3>
        <div className="flex gap-6 flex-wrap justify-center md:justify-start">
          <SpotCard />
          <SpotCard />
          <SpotCard />
          <SpotCard />
          <SpotCard />
        </div>
      </div>
    </div>
  );
};

export default page;
