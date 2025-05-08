"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import Image from "next/image";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body className="w-screen h-screen bg-mywhite flex flex-col justify-center place-items-center">
        <h2 className="text-3xl text-principal font-semibold">
          {" "}
          Ocurrio un error inesperado!{" "}
        </h2>
        <Image src={"/error.jpg"} width={300} height={300} alt="error" />
        <Link
          href={"/"}
          className="underline text-principal font-semibold hover:scale-105"
        >
          Volver a inicio{" "}
        </Link>
      </body>
    </html>
  );
}
