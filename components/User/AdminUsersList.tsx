"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Shield, User, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import { useBackendUser } from "@/hooks";

interface AppUser {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  createdAt: string;
}

interface Paginated {
  data: AppUser[];
  total: number;
  page: number;
  totalPages: number;
}

interface PendingRoleChange {
  user: AppUser;
  newRole: "user" | "admin";
}

const PAGE_SIZE = 10;

export default function AdminUsersList() {
  const { user: currentAdmin } = useBackendUser();
  const [result, setResult] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(
    null,
  );
  const [processing, setProcessing] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback((p: number, q: string) => {
    setLoading(true);
    const searchParam = q ? `&search=${encodeURIComponent(q)}` : "";
    apiFetch(`/users/list?page=${p}&limit=${PAGE_SIZE}${searchParam}`)
      .then((r) => r.json())
      .then((data: Paginated) => {
        setResult(data);
        setPage(p);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPage(1, debouncedSearch);
  }, [debouncedSearch, fetchPage]);

  async function handleRoleChange() {
    if (!pendingChange) return;
    const { user, newRole } = pendingChange;
    setPendingChange(null);
    setProcessing(user._id);

    try {
      await apiFetch(`/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      fetchPage(page, debouncedSearch);
      toast.success(
        newRole === "admin"
          ? `${user.name ?? user.email} ahora es admin`
          : `${user.name ?? user.email} volvió a ser usuario`,
      );
    } catch {
      toast.error("No se pudo actualizar el rol.");
    } finally {
      setProcessing(null);
    }
  }

  const users = result?.data ?? [];

  return (
    <>
      <AlertDialog
        open={!!pendingChange}
        onOpenChange={(o) => !o && setPendingChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingChange?.newRole === "admin"
                ? "¿Hacer admin a este usuario?"
                : "¿Quitar rol de admin?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.newRole === "admin"
                ? `${pendingChange?.user.name ?? pendingChange?.user.email} tendrá acceso completo al panel de administración.`
                : `${pendingChange?.user.name ?? pendingChange?.user.email} perderá el acceso al panel de administración.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              className={
                pendingChange?.newRole === "admin"
                  ? "bg-principal hover:bg-principal-400 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }
            >
              {pendingChange?.newRole === "admin"
                ? "Sí, hacer admin"
                : "Sí, quitar admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-jet">
            Usuarios
            {result && (
              <span className="ml-2 text-sm font-normal text-jet-700">
                ({result.total})
              </span>
            )}
          </h1>
        </div>

        {/* buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jet-700" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-principal/30 bg-white"
          />
        </div>

        {!loading && users.length === 0 && (
          <p className="text-sm text-jet-700 text-center py-8">
            No se encontraron usuarios.
          </p>
        )}

        {users.map((u) => {
          const isCurrentAdmin = u._id === currentAdmin?._id;
          const isAdmin = u.role === "admin";

          return (
            <div
              key={u._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-4"
            >
              {/* avatar */}
              <div className="relative shrink-0">
                {u.image ? (
                  <Image
                    src={u.image}
                    alt={u.name ?? u.email}
                    width={40}
                    height={40}
                    className="rounded-full object-cover size-10"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-principal/10 flex items-center justify-center">
                    <User className="size-5 text-principal" />
                  </div>
                )}
                {isAdmin && (
                  <span className="absolute -bottom-1 -right-1 bg-principal rounded-full p-0.5">
                    <Shield className="size-2.5 text-white" />
                  </span>
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-jet truncate">
                  {u.name ?? "Sin nombre"}
                  {isCurrentAdmin && (
                    <span className="ml-2 text-[10px] text-jet-700 font-normal">
                      (vos)
                    </span>
                  )}
                </p>
                <p className="text-xs text-jet-700 truncate">{u.email}</p>
              </div>

              {/* rol badge + selector */}
              {isCurrentAdmin ? (
                <span className="text-xs text-jet-700 shrink-0">Tu cuenta</span>
              ) : (
                <div className="relative shrink-0">
                  <select
                    value={u.role}
                    disabled={processing === u._id}
                    onChange={(e) =>
                      setPendingChange({
                        user: u,
                        newRole: e.target.value as "user" | "admin",
                      })
                    }
                    className={`appearance-none text-xs font-semibold pl-2.5 pr-6 py-1.5 rounded-full border cursor-pointer transition-colors ${
                      isAdmin
                        ? "bg-principal/10 text-principal border-principal/30"
                        : "bg-gray-50 text-jet-700 border-gray-200"
                    }`}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-jet-700 pointer-events-none" />
                </div>
              )}
            </div>
          );
        })}

        {result && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={(p) => fetchPage(p, debouncedSearch)}
          />
        )}
      </div>
    </>
  );
}
