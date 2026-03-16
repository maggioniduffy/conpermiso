import { signOut } from "next-auth/react";
import ProfileCard from "./ProfileCard";
import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";
import { useBackendUser } from "@/hooks/use-backend-user";

const NavMenuFooter = ({ session }: { session: Session | null }) => {
  const { user, loading } = useBackendUser();

  return (
    <div className="flex flex-row justify-between gap-4 place-items-center">
      {user ? (
        <>
          <ProfileCard />
          <button onClick={() => signOut()}>
            <Image
              src={"/icons/logout.png"}
              alt="log out"
              width={30}
              height={30}
            />
          </button>
        </>
      ) : (
        <Link className="text-sm font-medium hover:underline" href="/auth">
          Inicia sesion
        </Link>
      )}
    </div>
  );
};

export default NavMenuFooter;
