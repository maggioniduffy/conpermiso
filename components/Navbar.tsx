"use client";

import Image from "next/image";
import DropdownMenu from "./DropdownMenu";
import { use, useState } from "react";
import NavMenu from "./NavMenu";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
  additionalClass?: string;
}

const Navbar = ({ additionalClass }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [authOptions, setAuthOptions] = useState(false);

  const toggle = () => {
    setOpen((prevState) => !prevState);
  };

  const toggleAuth = () => {
    setAuthOptions((prevState) => !prevState);
  };

  const navigate = (href: string) => {
    toggleAuth();
    redirect(href);
  };

  return (
    <nav
      className={`w-full bg-transparent flex justify-start items-center h-fit ${additionalClass}`}
    >
      {" "}
      <div className="w-full shadow-md md:shadow bg-mywhite flex justify-between items-center px-2">
        <DropdownMenu open={open} toggle={toggle} />

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
            <li className="text-jet text-sm p-2 text-center  ">
              <button
                onClick={() => navigate("/auth")}
                className="hover:text-principal hover:font-semibold"
              >
                {" "}
                Sign In or Create Account
              </button>
            </li>
          </ul>
        )}
        <Image
          src={"/icons/cool_avatar.png"}
          alt="Account"
          width={35}
          height={25}
          onClick={toggleAuth}
        />
      </div>
      {open && <NavMenu open={open} toggle={toggle} />}
    </nav>
  );
};

export default Navbar;
