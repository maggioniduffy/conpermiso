"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

interface UserProfileCardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

// Avatar + nombre/email. OTP puede dejar el nombre vacío: en ese caso el
// email pasa a ser la línea principal y no se repite abajo.
export default function UserProfileCard({ user }: UserProfileCardProps) {
  const { t } = useTranslation();
  const displayName = user.name?.trim();

  return (
    <div className="flex items-center gap-3">
      <Image
        src={user.image || "/icons/cool_avatar.png"}
        alt={displayName || t("common.user")}
        width={56}
        height={56}
        className="size-14 rounded-full shrink-0 object-cover"
      />
      <div className="flex flex-col min-w-0 gap-0.5">
        <p className="text-base font-semibold text-jet truncate">
          {displayName || user.email}
        </p>
        {displayName && (
          <p className="text-xs text-jet-700 truncate">{user.email}</p>
        )}
      </div>
    </div>
  );
}
