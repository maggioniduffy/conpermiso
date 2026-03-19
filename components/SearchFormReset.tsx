// components/SearchFormReset.tsx
"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchFormReset = () => {
  const router = useRouter();

  const reset = () => {
    const form = document.querySelector("#search-form") as HTMLFormElement;
    if (form) form.reset();
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={reset}
      className="text-jet-800 hover:text-jet transition-colors shrink-0"
    >
      <X className="size-4" />
    </button>
  );
};

export default SearchFormReset;
