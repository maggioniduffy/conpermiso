import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="sticky top-0 w-full bg-transparent flex justify-start items-center h-16">
      {" "}
      <div className="rounded-xl md:rounded-none mx-4 md:mx-0 w-full shadow-md md:shadow-lg bg-mywhite flex justify-between items-center px-2">
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
          width={25}
          height={25}
        />
      </div>
    </nav>
  );
};

export default Navbar;
