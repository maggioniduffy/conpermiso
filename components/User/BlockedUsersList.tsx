"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/apiFetch";
import { UserCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface BlockedUserItem {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
}

export default function BlockedUsersList() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  async function fetchBlockedUsers() {
    setLoading(true);
    try {
      const res = await apiFetch("/users/blocked");
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data || []);
      }
    } catch {
      setBlockedUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnblock(userId: string) {
    setUnblockingId(userId);
    try {
      const res = await apiFetch("/users/unblock", {
        method: "POST",
        body: JSON.stringify({ blockedUserId: userId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al desbloquear usuario.");
      }

      setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("Usuario desbloqueado correctamente.");
    } catch (error: any) {
      toast.error(error.message || "No se pudo desbloquear al usuario.");
    } finally {
      setUnblockingId(null);
    }
  }

  if (loading) {
    return null; // Ocultar mientras carga si no hay nada
  }

  if (blockedUsers.length === 0) {
    return null; // Si no hay usuarios bloqueados, no mostrar la sección
  }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <h3 className="font-semibold text-xl drop-shadow-xl pb-1 text-jet flex items-center gap-2">
        <ShieldAlert className="size-5 text-amber-500" />
        Usuarios Bloqueados
        <span className="text-sm font-normal text-jet-700">
          ({blockedUsers.length})
        </span>
      </h3>

      <div className="flex flex-col gap-2">
        {blockedUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src={user.image || "/icons/cool_avatar.png"}
                alt={user.name || "Avatar"}
                width={40}
                height={40}
                className="rounded-full ring-2 ring-gray-100 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-jet truncate">
                  {user.name || "Usuario"}
                </span>
                {user.email && (
                  <span className="text-xs text-jet-700 truncate">
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            <button
              disabled={unblockingId === user._id}
              onClick={() => handleUnblock(user._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-jet-800 bg-gray-100 hover:bg-gray-200 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="size-3.5 text-emerald-600" />
              Desbloquear
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
