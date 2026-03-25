import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // mostrar máximo 5 páginas con ellipsis
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const withEllipsis: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of visible) {
    if (prev !== null && p - prev > 1) withEllipsis.push("…");
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg text-jet-700 hover:bg-principal/10 hover:text-principal disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="size-4" />
      </button>

      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-jet-700">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`size-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-principal text-white"
                : "text-jet-700 hover:bg-principal/10 hover:text-principal"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg text-jet-700 hover:bg-principal/10 hover:text-principal disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
