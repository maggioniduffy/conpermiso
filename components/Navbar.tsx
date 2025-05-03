"use client";

import Image from "next/image";
import DropdownMenu from "./DropdownMenu";
import { useState } from "react";
import NavMenu from "./NavMenu";

const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);

  const toggle = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <nav className="w-full bg-transparent flex justify-start items-center h-fit">
      {" "}
      <div className="sticky top-0 rounded-xl md:rounded-none mx-4 md:mx-0 w-full shadow-md md:shadow-lg bg-mywhite flex justify-between items-center px-2">
        <DropdownMenu open={open} toggle={toggle} />
        <Image
          src={"/longlogo_white.png"}
          alt="Logo"
          width={200}
          height={150}
        />
        <Image
          src={"/icons/cool_avatar.png"}
          alt="Account"
          width={25}
          height={25}
        />
      </div>
      {open && <NavMenu open={open} toggle={toggle} />}
    </nav>
  );
};

export default Navbar;
