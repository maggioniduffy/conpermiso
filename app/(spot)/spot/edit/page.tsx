import { auth } from "@/auth";

import SpotForm from "@/components/SpotForm";
import { redirect } from "next/navigation";

const page = async () => {
  // const session = await auth();

  // if (!session?.user) {
  //   redirect("/");
  // }

  return (
    <div className="py-15 w-full min-h-screen bg-mywhite">
      <div className="flex place-items-center p-5 w-full justify-center">
        <SpotForm title="Editar Spot" />
      </div>
    </div>
  );
};

export default page;
