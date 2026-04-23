"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useBackendUser } from "@/hooks";
import { signOut, useSession } from "next-auth/react";
import DropdownMenu from "./DropdownMenu";
import NavMenu from "./NavMenu";
import { apiFetch } from "@/lib/apiFetch";
import { LogOut, User } from "lucide-react";
import AuthModal from "@/components/Auth/AuthModal";

interface Props {
  additionalClass?: string;
}

const Navbar = ({ additionalClass }: Props) => {
  const { user, loading } = useBackendUser();
  const { data: session } = useSession();
  const [open, setOpen] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [userMenuOpen]);

  const toggle = () => setOpen((prev) => !prev);

  const handleAvatarClick = () => {
    if (user) {
      setUserMenuOpen((prev) => !prev);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <nav
        className={`w-full z-[1001] bg-transparent flex justify-start items-center h-fit ${additionalClass}`}
      >
        <div className="w-full shadow bg-mywhite border-b border-gray-200 flex items-center px-2 relative h-14">
          {/* left: hamburger + ¿Cómo funciona? */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <DropdownMenu open={open} toggle={toggle} />
              {!open && user?.role === "admin" && pendingCount > 0 && (
                <span className="absolute top-1 right-1 size-2.5 rounded-full bg-red-500 ring-2 ring-mywhite pointer-events-none" />
              )}
            </div>
            <Link
              href="/welcome"
              className="text-xs text-jet-600 hover:text-principal transition-colors font-medium hidden sm:block"
            >
              ¿Cómo funciona?
            </Link>
          </div>

          {/* logo — absolutely centered */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/longlogo_white.png"
              alt="Logo"
              width={150}
              height={120}
            />
          </Link>

          {/* right: avatar + user popover */}
          <div ref={userMenuRef} className="ml-auto relative mr-2">
            <button
              onClick={handleAvatarClick}
              className="relative cursor-pointer rounded-full hover:ring-2 hover:ring-principal/30 transition-all p-0.5"
              aria-label="Cuenta"
            >
              <Image
                src="/icons/cool_avatar.png"
                alt="Account"
                width={35}
                height={25}
              />
              {user?.role === "admin" && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-principal text-white text-[8px] font-bold px-1 py-px rounded-full leading-none ring-2 ring-mywhite">
                  ADMIN
                </span>
              )}
            </button>

            {/* Logged-in user popover */}
            <div
              className={`absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-[1002] transition-all duration-150 origin-top-right ${
                user && userMenuOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="size-8 rounded-full bg-principal/10 flex items-center justify-center shrink-0">
                  <User className="size-4 text-principal" />
                </div>
                <a className="min-w-0" href="/my-list">
                  {session?.user?.name && (
                    <p className="text-jet text-sm font-semibold truncate">
                      {session.user.name}
                    </p>
                  )}
                  {session?.user?.email && (
                    <p className="text-jet-700 text-xs truncate">
                      {session.user.email}
                    </p>
                  )}
                </a>
              </div>
              <div className="h-px bg-gray-100 mx-2 mb-2" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  localStorage.removeItem("accessToken");
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-jet-600 hover:bg-red-50 hover:text-red-500 transition-colors font-medium"
              >
                <LogOut className="size-4 shrink-0" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {open && (
          <NavMenu open={open} toggle={toggle} pendingCount={pendingCount} />
        )}
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;
