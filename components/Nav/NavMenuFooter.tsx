// NavMenuFooter.tsx
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";
import { useBackendUser } from "@/hooks";
import { LogOut, LogIn } from "lucide-react";

const NavMenuFooter = ({ session }: { session: Session | null }) => {
  const { user, loading } = useBackendUser();

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-1">
        <div className="size-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
          <div className="h-2.5 bg-gray-100 rounded animate-pulse w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-principal text-white text-sm font-medium hover:bg-principal-400 transition-all hover:scale-[1.02] w-full justify-center"
      >
        <LogIn className="size-4" />
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* avatar + info */}
      <Link
        href="/my-list"
        className="flex items-center gap-3 flex-1 min-w-0 group"
      >
        <Image
          src={user.image || "/icons/cool_avatar.png"}
          width={40}
          height={40}
          alt="Avatar"
          className="rounded-full shrink-0 ring-2 ring-principal/20 group-hover:ring-principal/50 transition-all"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-jet truncate group-hover:text-principal transition-colors">
            {user.name}
          </span>
          <span className="text-xs text-jet-800 truncate">{user.email}</span>
        </div>
      </Link>

      {/* logout */}
      <button
        onClick={() => {
          localStorage.removeItem("accessToken"); // ← limpiar token del backend
          signOut({ callbackUrl: "/" });
        }}
        className="p-2 rounded-xl text-jet-700 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
        title="Cerrar sesión"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
};

export default NavMenuFooter;
