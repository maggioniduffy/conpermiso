import { signOut } from "next-auth/react";
import ProfileCard from "./ProfileCard";
import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";

const NavMenuFooter = ({ session }: { session: Session | null }) => {
  return (
    <div className="flex flex-row justify-between gap-4 place-items-center">
      {session?.user ? (
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
