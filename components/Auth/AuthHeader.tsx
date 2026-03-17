import Image from "next/image";

const AuthHeader = () => {
  return (
    <div className="text-center mb-10">
      <Image
        src="/longlogo_white.png"
        width={450}
        height={250}
        className="mx-auto hover:scale-105"
        alt="logo"
      />
      <div className="mt-5 space-y-2">
        <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
          Entra a tu cuenta
        </h3>
      </div>
    </div>
  );
};

export default AuthHeader;
