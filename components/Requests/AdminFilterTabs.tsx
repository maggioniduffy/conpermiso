import { FILTER_TABS, StatusFilter } from "@/utils/models";

interface Props {
  filter: StatusFilter;
  onChange: (f: StatusFilter) => void;
}

export function AdminFilterTabs({ filter, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
            filter === tab.value
              ? "bg-white text-jet shadow-sm"
              : "text-jet-700 hover:text-jet"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
