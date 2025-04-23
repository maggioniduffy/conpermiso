import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="sticky top-0 w-full bg-transparent flex justify-start items-center h-16">
      {" "}
      <div className="rounded-xl mx-4 w-full shadow-md bg-mywhite flex justify-between items-center px-2">
        <Image src={"/icons/menu.svg"} alt="Menu" width={20} height={20} />
        <Image
          src={"/longlogo_white.png"}
          alt="Logo"
          width={200}
          height={150}
        />
        <Image
          src={"/icons/cool_avatar.png"}
          alt="Account"
          width={20}
          height={20}
        />
      </div>
    </nav>
  );
};

export default Navbar;
