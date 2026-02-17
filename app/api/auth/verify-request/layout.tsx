import React from "react";
import Image from "next/image";

export const metadata = {
  title: "Auth | MyApp",
};

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="flex">
      <div className="px-4 hidden md:flex w-1/2 bg-principal h-screen border-r-5 border-principal-300 shadow flex place-items-center justify-center">
        <Image
          src={"/biglogo_blue.png"}
          alt="files"
          height={400}
          width={400}
          className="transition-all hover:rotate-2 hover:shadow-xl hover:rounded-xl"
        />
      </div>
      {children}
    </main>
  );
};

export default layout;
