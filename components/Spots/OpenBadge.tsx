// components/Spots/OpenBadge.tsx
export default function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${isOpen ? "bg-green-500" : "bg-gray-400"}`}
      />
      {isOpen ? "Abierto" : "Cerrado"}
    </span>
  );
}
