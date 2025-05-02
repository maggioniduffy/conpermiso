import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export default function NotFound() {
  return (
    <div className="bg-mywhite flex p-4 gap-5 flex-col place-items-center justify-center h-screen w-screen">
      <h1 className="text-3xl font-semibold text-center">
        {" "}
        <b className="text-principal"> 404 </b> | Página no encontrada
      </h1>
      <h2 className="font-medium text-sm md:text-xl w-4/6 md:w-2/6 text-center">
        {" "}
        No pudimos encontrar esa pagina o no existe, lo sentimos.
      </h2>
      <Image src="/404.svg" alt="404" width={400} height={400} />

      <Link
        href={"/"}
        className="font-bold text-jet-200 underline text-[14px] md:text-sm"
      >
        {" "}
        Volver a inicio{" "}
      </Link>
    </div>
  );
}
