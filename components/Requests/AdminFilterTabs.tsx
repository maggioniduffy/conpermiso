"use client";

import { useTranslation } from "react-i18next";
import { StatusFilter } from "@/utils/models";

// El label sale de `requests.filters.<valor>`.
const TABS: StatusFilter[] = ["PENDING", "APPROVED", "REJECTED", "ALL"];

interface Props {
  filter: StatusFilter;
  onChange: (f: StatusFilter) => void;
}

export function AdminFilterTabs({ filter, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="tablist"
      className="flex gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const active = filter === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={`shrink-0 cursor-pointer rounded-full border-[1.5px] px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-principal bg-principal text-white"
                : "border-gray-200 bg-white text-jet-700 hover:border-principal/40"
            }`}
          >
            {t(`requests.filters.${tab}`)}
          </button>
        );
      })}
    </div>
  );
}
