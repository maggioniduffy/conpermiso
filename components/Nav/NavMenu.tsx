"use client";

import React, { useEffect, useState } from "react";
import DropdownMenu from "./DropdownMenu";
import { useRouter } from "next/navigation";
import NavMenuFooter from "./NavMenuFooter";
import { useSession } from "next-auth/react";
import { MapPin, Bookmark, ClipboardList, Shield } from "lucide-react";
import { useBackendUser } from "@/hooks";
import { apiFetch } from "@/lib/apiFetch";

interface Props {
  open: boolean;
  toggle: () => void;
}

const NavMenu = ({ open, toggle }: Props) => {
  const { data: session } = useSession();
  const { user } = useBackendUser();
  const role = user?.role;
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (role !== "admin") return;
    apiFetch("/bath-requests")
      .then((r) => r.json())
      .then((data) => {
        const count = data.filter((r: any) => r.status === "PENDING").length;
        setPendingCount(count);
      })
      .catch(() => setPendingCount(0));
  }, [role]);

  const navigate = (href: string) => {
    toggle();
    router.push(href);
  };

  const linkClass =
    "flex items-center gap-3 px-3 py-3 rounded-xl text-jet-500 hover:bg-principal/5 hover:text-principal transition-all text-sm font-medium text-left w-full group";
  const iconClass =
    "text-principal/60 group-hover:text-principal transition-colors";

  return (
    <div className="flex z-[1001]">
      {/* overlay */}
      <span
        className={`fixed top-0 left-0 w-full h-full bg-black z-89 transition-opacity duration-500 ease-in-out ${
          open ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggle}
      />

      {/* drawer */}
      <div
        className={`fixed top-0 left-0 h-screen z-90 transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } w-72 bg-white shadow-2xl flex flex-col border-r border-gray-100`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-jet font-bold text-lg tracking-tight">
            Menú
          </span>
          <DropdownMenu open={open} toggle={toggle} />
        </div>

        {/* nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {/* siempre visible */}
          <button onClick={() => navigate("/")} className={linkClass}>
            <span className={iconClass}>
              <MapPin className="size-4" />
            </span>
            Mi Ubicación
          </button>

          {/* usuarios autenticados */}
          {session?.user && (
            <button onClick={() => navigate("/my-list")} className={linkClass}>
              <span className={iconClass}>
                <Bookmark className="size-4" />
              </span>
              Mis Guardados
            </button>
          )}

          {/* solo user */}
          {role === "user" && (
            <button onClick={() => navigate("/requests")} className={linkClass}>
              <span className={iconClass}>
                <ClipboardList className="size-4" />
              </span>
              Mis Solicitudes
            </button>
          )}

          {/* solo admin */}
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin/requests")}
              className={linkClass}
            >
              <span className={iconClass}>
                <Shield className="size-4" />
              </span>
              <span className="flex-1">Solicitudes pendientes</span>
              {pendingCount > 0 && (
                <span className="ml-auto flex items-center justify-center size-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* footer */}
        <div className="border-t border-gray-100 px-4 py-4">
          <NavMenuFooter session={session} />
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
