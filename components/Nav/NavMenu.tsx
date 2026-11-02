"use client";

import DropdownMenu from "./DropdownMenu";
import { useRouter } from "next/navigation";
import NavMenuFooter from "./NavMenuFooter";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Bookmark,
  ClipboardList,
  Shield,
  Users,
  HelpCircle,
  Flag,
  Globe,
} from "lucide-react";
import { useBackendUser } from "@/hooks";
import LanguageToggle from "@/components/LanguageToggle";
import { requestRecenter } from "@/components/Maps/recenter";

interface Props {
  open: boolean;
  toggle: () => void;
  pendingCount?: number;
}

const NavMenu = ({ open, toggle, pendingCount = 0 }: Props) => {
  const { t } = useTranslation();
  const { user } = useBackendUser();
  const role = user?.role;
  const router = useRouter();

  const navigate = (href: string) => {
    toggle();
    router.push(href);
  };

  // Vuelve al mapa y le pide que recentre en la ubicación del usuario.
  const goToMyLocation = () => {
    toggle();
    router.push("/");
    requestRecenter();
  };

  const linkClass =
    "flex items-center gap-3 px-3 py-3 rounded-xl text-jet-500 hover:bg-principal/5 hover:text-principal transition-all text-sm font-medium text-left w-full group";
  const iconClass =
    "text-principal group-hover:text-principal transition-colors";

  const badge = pendingCount > 0 && (
    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
      {pendingCount > 99 ? "99+" : pendingCount}
    </span>
  );

  return (
    <div className="flex z-[1001]">
      {/* overlay */}
      <span
        className={`fixed inset-0 bg-black z-89 transition-opacity duration-500 ease-in-out ${
          open ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggle}
      />

      {/* drawer */}
      <div
        className={`fixed top-0 left-0 z-90 transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } w-72 bg-white shadow-2xl flex flex-col border-r border-gray-100`}
        style={{ height: "100dvh" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-jet font-bold text-lg tracking-tight">
            {t("nav.menu")}
          </span>
          <DropdownMenu open={open} toggle={toggle} />
        </div>

        {/* nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <button onClick={goToMyLocation} className={linkClass}>
            <span className={iconClass}>
              <MapPin className="size-[18px]" />
            </span>
            {t("nav.myLocation")}
          </button>

          {user && (
            <button onClick={() => navigate("/my-list")} className={linkClass}>
              <span className={iconClass}>
                <Bookmark className="size-[18px]" />
              </span>
              {t("nav.saved")}
            </button>
          )}

          {role === "user" && (
            <button onClick={() => navigate("/requests")} className={linkClass}>
              <span className={iconClass}>
                <ClipboardList className="size-[18px]" />
              </span>
              {t("nav.myRequests")}
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("/admin/requests")}
              className={linkClass}
            >
              <span className={iconClass}>
                <Shield className="size-[18px]" />
              </span>
              <span className="flex-1">{t("nav.pendingRequests")}</span>
              {badge}
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("/admin/reports")}
              className={linkClass}
            >
              <span className={iconClass}>
                <Flag className="size-[18px]" />
              </span>
              <span className="flex-1">{t("nav.reports")}</span>
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("/admin/users")}
              className={linkClass}
            >
              <span className={iconClass}>
                <Users className="size-[18px]" />
              </span>
              <span className="flex-1">{t("nav.users")}</span>
            </button>
          )}
        </nav>

        {/* Idioma + ¿Cómo funciona? — para todos, logueados o no */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-jet-500">
            <span className={iconClass}>
              <Globe className="size-[18px]" />
            </span>
            <span className="flex-1">{t("language.label")}</span>
            <LanguageToggle />
          </div>
          <button onClick={() => navigate("/welcome")} className={linkClass}>
            <span className={iconClass}>
              <HelpCircle className="size-[18px]" />
            </span>
            {t("nav.howItWorks")}
          </button>
        </div>

        {/* footer */}
        <div className="border-t border-gray-100 px-4 py-4">
          <NavMenuFooter onNavigate={navigate} />
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
