import Image from "next/image";

const AuthHeader = () => {
  return (
    <div className="text-center mb-10">
      <Image
        src="/logo-lockup-3x.png"
        width={560}
        height={144}
        className="mx-auto h-14 w-auto hover:scale-105"
        alt="KKapp"
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
