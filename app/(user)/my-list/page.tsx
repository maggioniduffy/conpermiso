// app/(user)/my-list/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileScreen from "@/components/User/ProfileScreen";

const page = async () => {
  const session = await auth();
  if (!session?.user) return redirect("/auth");

  return <ProfileScreen user={session.user} />;
};

export default page;
