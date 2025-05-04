import React from "react";
import DropdownMenu from "./DropdownMenu";
import { pages } from "@/utils/constants";
import ProfileCard from "./ProfileCard";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
  open: boolean;
  toggle: () => void;
}

const NavMenu = ({ open, toggle }: Props) => {
  const navigate = (href: string) => {
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
            {pages.map(({ name, href }, index) => (
              <li className="w-full" key={index}>
                <button
                  key={index}
                  onClick={() => navigate(href)}
                  className={`block py-2 text-sm text-left text-gray-700 hover:bg-gray-100 w-full rounded-md font-medium`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
          <DropdownMenu open={open} toggle={toggle} />
        </div>

        <div className="flex flex-row justify-between gap-4 place-items-center">
          <ProfileCard />
          <Link href="/logout">
            <Image
              src={"/icons/logout.png"}
              alt="log out"
              width={30}
              height={30}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
