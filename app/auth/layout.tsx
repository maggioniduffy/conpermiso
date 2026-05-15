import React from "react";
import Image from "next/image";

export const metadata = {
  title: "Auth | KKapp",
};

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="flex">
      <div className="px-4 hidden md:flex w-1/2 bg-principal h-screen border-r-5 border-principal-300 shadow flex place-items-center justify-center">
        <Image
          src="/logo-pin-3x.png"
          alt="KKapp"
          width={512}
          height={512}
          className="w-48 h-auto transition-all hover:rotate-2"
        />
      </div>
      {children}
    </main>
  );
};

export default layout;
