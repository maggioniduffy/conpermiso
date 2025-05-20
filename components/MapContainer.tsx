"use client";

import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MyMapContainer() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <Loader className="animate-spin m-auto h-full" />,
        ssr: false,
      }),
    []
  );

  return (
    <div className="bg-mywhite h-screen w-screen z-80">
      <Map />
    </div>
  );
}
