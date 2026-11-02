"use client";

import { useTranslation } from "react-i18next";
import { KindFilter } from "@/utils/models";

// El label sale de `requests.kinds.<valor>`.
const KIND_TABS: KindFilter[] = ["all", "create", "edit"];

interface Props {
  kind: KindFilter;
  onChange: (k: KindFilter) => void;
}

export function AdminKindTabs({ kind, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="tablist"
      aria-label="kind"
      className="flex gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {KIND_TABS.map((tab) => {
        const active = kind === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            data-testid={`kind-tab-${tab}`}
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={`shrink-0 cursor-pointer rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-jet bg-jet text-white"
                : "border-gray-200 bg-white text-jet-700 hover:border-jet/40"
            }`}
          >
            {t(`requests.kinds.${tab}`)}
          </button>
        );
      })}
    </div>
  );
}
