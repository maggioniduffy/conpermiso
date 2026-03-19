// NavMenu.tsx
"use client";

import React from "react";
import DropdownMenu from "./DropdownMenu";
import { useRouter } from "next/navigation";
import NavMenuFooter from "./NavMenuFooter";
import { useSession } from "next-auth/react";
import { MapPin, Bookmark } from "lucide-react";

const pages = [
  { name: "Mi Ubicación", href: "/", icon: <MapPin className="size-4" /> },
  {
    name: "Mis Guardados",
    href: "/my-list",
    icon: <Bookmark className="size-4" />,
  },
];

interface Props {
  open: boolean;
  toggle: () => void;
}

const NavMenu = ({ open, toggle }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();

  const navigate = (href: string) => {
    toggle();
    router.push(href);
  };

  return (
    <div className="flex z-[1001]">
      {/* overlay */}
      <span
        className={`fixed top-0 left-0 w-full h-full bg-black z-89 transition-opacity duration-500 ease-in-out ${
          open ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggle}
      />

      {/* drawer */}
      <div
        className={`fixed top-0 left-0 h-screen z-90 transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } w-72 bg-white shadow-2xl flex flex-col border-r border-gray-100`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-jet font-bold text-lg tracking-tight">
            Menú
          </span>
          <DropdownMenu open={open} toggle={toggle} />
        </div>

        {/* nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {pages.map((page, i) => {
            if (i === 1 && !session?.user) return null;
            return (
              <button
                key={page.href}
                onClick={() => navigate(page.href)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-jet-500 hover:bg-principal/5 hover:text-principal transition-all text-sm font-medium text-left w-full group"
              >
                <span className="text-principal/60 group-hover:text-principal transition-colors">
                  {page.icon}
                </span>
                {page.name}
              </button>
            );
          })}
        </nav>

        {/* footer */}
        <div className="border-t border-gray-100 px-4 py-4">
          <NavMenuFooter session={session} />
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
