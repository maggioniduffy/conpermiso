// components/ui/SectionCard.tsx
export function SectionCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string | React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-principal/20 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="bg-principal/10 p-1.5 rounded-lg text-principal">
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-jet-700">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
