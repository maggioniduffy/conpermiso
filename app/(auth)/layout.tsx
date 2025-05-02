import React from "react";
import Image from "next/image";
const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="flex">
      <div className="hidden md:flex w-1/2 bg-principal h-screen border-r-5 border-principal-300 shadow flex place-items-center">
        <Image
          src={"/biglogo_blue.png"}
          alt="files"
          height={200}
          width={200}
          className="transition-all hover:rotate-2 hover:scale-105"
        />
      </div>
      {children}
    </main>
  );
};

export default layout;
