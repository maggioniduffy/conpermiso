"use client";

import Image from "next/image";
import DeleteAccountButton from "./DeleteAccountButton";

interface UserProfileCardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Image
          src={user.image || "/icons/cool_avatar.png"}
          alt={user.name || "Avatar"}
          width={56}
          height={56}
          className="rounded-full ring-2 ring-principal/20 shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-jet truncate">
              {user.name || "Usuario"}
            </h2>
            {user.role === "admin" && (
              <span className="text-[10px] font-bold bg-principal/10 text-principal px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-jet-700 truncate">{user.email}</p>
        </div>
      </div>

      <div className="sm:w-auto w-full">
        <DeleteAccountButton />
      </div>
    </div>
  );
}
