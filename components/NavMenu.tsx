import React, { useEffect, useState } from "react";
import DropdownMenu from "./DropdownMenu";
import { sections } from "@/utils/constants";
import ProfileCard from "./ProfileCard";
import Image from "next/image";
import Link from "next/link";

interface Props {
  open: boolean;
  toggle: () => void;
}

const NavMenu = ({ open, toggle }: Props) => {
  const [hash, setHash] = useState("#mi-ubicacion");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash); // includes the '#' symbol
    };

    console.log("hash", hash);

    handleHashChange(); // get it on first load
    window.addEventListener("hashchange", handleHashChange); // listen for changes

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

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
            {sections.map((section, index) => (
              <li className="w-full" key={index}>
                <a
                  key={index}
                  href={`#${section.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`block py-2 text-sm text-gray-700 hover:bg-gray-100 w-full rounded-md font-medium ${
                    hash === `#${section.toLowerCase().replace(/\s+/g, "-")}` &&
                    "font-semibold text-principal"
                  }`}
                >
                  {section}
                </a>
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
