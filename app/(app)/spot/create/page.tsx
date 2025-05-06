import SpotForm from "@/components/SpotForm";
import React from "react";

const page = () => {
  return (
    <div className="py-15 md:px-10 w-screen h-screen profile-bg">
      <div className="flex place-items-center p-5 w-full justify-center">
        <SpotForm />
      </div>
    </div>
  );
};

export default page;
