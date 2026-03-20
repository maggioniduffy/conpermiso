"use client";

import { X } from "lucide-react";

export default function SearchFormReset({ onReset }: { onReset: () => void }) {
  return (
    <button onClick={onReset} className="shrink-0">
      <X className="size-4 text-jet-700 hover:text-jet transition-colors" />
    </button>
  );
}
