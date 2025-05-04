import React from "react";
import DropdownMenu from "./DropdownMenu";
import { redirect } from "next/navigation";
import NavMenuFooter from "./NavMenuFooter";

import { useSession } from "next-auth/react";

const pages = [
  {
    name: "Mi Ubicacion",
    href: "/",
  },
  {
    name: "Mis Guardados",
    href: "/profile/mis-guardados",
  },
];

interface Props {
  open: boolean;
  toggle: () => void;
}

const NavMenu = ({ open, toggle }: Props) => {
  const { data: session } = useSession();

  const navigate = async (href: string) => {
    toggle();
    redirect(href);
  };

  return (
    <div className="flex">
      <span
        className={`absolute top-0 left-0 w-full h-full bg-black z-40 transition-opacity duration-700 ease-in-out ${
          open ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggle}
      />

      <div
        className={`absolute top-0 left-0 h-screen z-50 transition-transform duration-700 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } w-5/6 md:w-fit bg-white shadow-lg rounded-r-md flex flex-col justify-between pl-5 py-5 pr-2 border-r-3 border-principal`}
      >
        <div className="flex justify-between w-full h-full">
          <ul className="w-full">
            <li className="w-full" key={pages[0].href}>
              <button
                key={pages[0].href}
                onClick={() => navigate(pages[0].href)}
                className={`block py-2 text-sm text-left text-gray-700 hover:bg-gray-100 w-full rounded-md font-medium`}
              >
                {pages[0].name}
              </button>
            </li>
            {session?.user && (
              <li className="w-full" key={pages[1].href}>
                <button
                  key={pages[1].href}
                  onClick={() => navigate(pages[1].href)}
                  className={`block py-2 text-sm text-left text-gray-700 hover:bg-gray-100 w-full rounded-md font-medium`}
                >
                  {pages[1].name}
                </button>
              </li>
            )}
          </ul>
          <DropdownMenu open={open} toggle={toggle} />
        </div>

        <NavMenuFooter session={session} />
      </div>
    </div>
  );
};

export default NavMenu;
