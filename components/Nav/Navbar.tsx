"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useBackendUser } from "@/hooks";
import { signOut } from "next-auth/react";
import DropdownMenu from "./DropdownMenu";
import NavMenu from "./NavMenu";
import { apiFetch } from "@/lib/apiFetch";
import { useEffect } from "react";

interface Props {
  additionalClass?: string;
}

const Navbar = ({ additionalClass }: Props) => {
  const { user, loading } = useBackendUser();
  const [open, setOpen] = useState<boolean>(false);
  const [authOptions, setAuthOptions] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchPending = () => {
      apiFetch("/bath-requests?status=PENDING&page=1&limit=1")
        .then((r) => r.json())
        .then((data) => setPendingCount(data?.total ?? 0))
        .catch(() => setPendingCount(0));
    };

    fetchPending();
    const interval = setInterval(fetchPending, 60_000);
    return () => clearInterval(interval);
  }, [user?.role]);

  const toggle = () => setOpen((prev) => !prev);
  const toggleAuth = () => setAuthOptions((prev) => !prev);
  const navigate = (href: string) => {
    toggleAuth();
    redirect(href);
  };

  return (
    <nav
      className={`w-full z-[1001] bg-transparent flex justify-start items-center h-fit ${additionalClass}`}
    >
      <div className="w-full shadow-md md:shadow bg-mywhite flex justify-between items-center px-2">
        {/* botón hamburguesa con globito */}
        <div className="relative">
          <DropdownMenu open={open} toggle={toggle} />
          {!open && user?.role === "admin" && pendingCount > 0 && (
            <span className="absolute top-1 right-1 size-2.5 rounded-full bg-red-500 ring-2 ring-mywhite pointer-events-none" />
          )}
        </div>

        <Link href={"/"}>
          <Image
            src={"/longlogo_white.png"}
            alt="Logo"
            width={200}
            height={150}
          />
        </Link>

        {authOptions && (
          <ul className="h-fit shadow min-w-20 z-99 absolute right-0 top-10 bg-mywhite rounded">
            <li className="text-jet text-sm p-2 text-center">
              {!user ? (
                <button
                  onClick={() => navigate("/auth")}
                  className="hover:text-principal hover:font-semibold cursor-pointer"
                >
                  Entra a tu cuenta o Registrate
                </button>
              ) : (
                <button
                  className="hover:text-principal hover:font-semibold cursor-pointer"
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Cerrar sesion
                </button>
              )}
            </li>
          </ul>
        )}

        <div className="relative cursor-pointer" onClick={toggleAuth}>
          <Image
            src={"/icons/cool_avatar.png"}
            alt="Account"
            width={35}
            height={25}
          />
          {user?.role === "admin" && (
            <span className="absolute -bottom-1 -right-1 bg-principal text-white text-[8px] font-bold px-1 py-px rounded-full leading-none ring-2 ring-mywhite">
              ADMIN
            </span>
          )}
        </div>
      </div>

      {open && <NavMenu open={open} toggle={toggle} />}
    </nav>
  );
};

export default Navbar;
