import { APP_STORE_URL } from "@/lib/store";

type StoreBadgesProps = {
  variant?: "dark" | "light";
  className?: string;
};

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M16.37 12.63c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.84 0-2.14-.95-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.09 1.35 10.74.9 1.3 1.97 2.75 3.37 2.7 1.35-.05 1.86-.87 3.5-.87 1.63 0 2.09.87 3.52.84 1.45-.03 2.37-1.32 3.26-2.63 1.03-1.5 1.45-2.96 1.48-3.03-.03-.01-2.84-1.09-2.87-4.3zM13.7 4.67c.74-.9 1.24-2.15 1.1-3.4-1.07.04-2.36.71-3.13 1.61-.69.79-1.29 2.07-1.13 3.29 1.19.09 2.4-.6 3.16-1.5z" />
    </svg>
  );
}

function PlayLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M4.2 2.4c-.2.2-.3.6-.3 1v17.2c0 .4.1.8.3 1l9.6-9.6L4.2 2.4z" />
      <path d="M17.1 8.7 14.8 11l-1 1 1 1 2.3 2.3 3-1.7c.9-.5.9-1.4 0-1.9l-3-1.7v-.1z" opacity=".75" />
      <path d="m4.8 21.8 9.4-9.4-1.2-1.2-8.2 10.6z" opacity=".6" />
      <path d="M4.8 2.2 13 12.8l1.2-1.2L4.8 2.2z" opacity=".85" />
    </svg>
  );
}

export default function StoreBadges({
  variant = "dark",
  className = "",
}: StoreBadgesProps) {
  const light = variant === "light";
  const appStoreStyle = light
    ? "bg-white text-jet hover:bg-mywhite"
    : "bg-black text-white hover:bg-jet";
  const playStyle = light
    ? "bg-white/20 text-white/70 border border-white/30"
    : "bg-gray-100 text-jet-600 border border-gray-200";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 ${className}`}
    >
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Descargar KKapp en el App Store"
        className={`h-12 px-4 rounded-xl inline-flex items-center gap-2.5 transition-colors ${appStoreStyle}`}
      >
        <AppleLogo className="size-7" />
        <span className="flex flex-col items-start leading-none text-left">
          <span className="text-[10px]">Descargalo en el</span>
          <span className="text-lg font-semibold -mt-0.5">App Store</span>
        </span>
      </a>
      <div
        aria-disabled="true"
        className={`h-12 px-4 rounded-xl inline-flex items-center gap-2.5 opacity-70 cursor-not-allowed select-none ${playStyle}`}
      >
        <PlayLogo className="size-6 opacity-70" />
        <span className="flex flex-col items-start leading-none text-left">
          <span className="text-[10px]">Próximamente en</span>
          <span className="text-lg font-semibold -mt-0.5">Google Play</span>
        </span>
      </div>
    </div>
  );
}
