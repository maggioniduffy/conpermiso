"use client";

import { Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BathAccess, GeoLocation, Shift } from "@/utils/models";
import { BathImage } from "@/utils/models";
import ConfirmDialog from "../ConfirmDialog";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  images: BathImage[];
  id: string;
  description: string;
  location: GeoLocation;
  shifts: Shift[];
  address?: string;
  access?: BathAccess;
  onDelete?: (id: string) => void;
}

export default function EditSpotCard({
  name,
  images,
  id,
  description,
  address,
  access,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
      {/* imagen */}
      <div className="shrink-0 size-12 rounded-xl overflow-hidden bg-principal/10">
        {images?.[0] ? (
          <Image
            src={images[0].url}
            width={48}
            height={48}
            alt={images[0].alt ?? name}
            className="object-cover w-full h-full"
          />
        ) : (
          <Image
            src="/logo-badge-lg@2x.png"
            width={48}
            height={48}
            alt=""
            className="object-contain w-full h-full p-1.5"
          />
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link
            href={`/spot/${id}`}
            className="text-sm font-semibold text-jet hover:text-principal transition-colors truncate block min-w-0"
          >
            {name}
          </Link>
          {access === BathAccess.PUBLIC && (
            <span className="shrink-0 rounded-full bg-principal-900 px-1.5 py-0.5 text-[9px] font-bold text-principal">
              {t("spot.publicBadge")}
            </span>
          )}
        </div>
        {address ? (
          <p className="text-xs text-jet-700 truncate mt-0.5">{address}</p>
        ) : null}
        <p className="text-xs text-jet-700 truncate mt-0.5">{description}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/spot/edit/${id}`}
          className="p-2 rounded-xl hover:bg-principal/10 text-jet-700 hover:text-principal transition-all"
          title={t("spot.edit")}
        >
          <Edit className="size-4" />
        </Link>
        {onDelete && (
          <ConfirmDialog
            trigger={
              <button className="p-2 rounded-xl hover:bg-red-50 text-jet-700 hover:text-red-500 transition-all">
                <Trash2 className="size-4" />
              </button>
            }
            title={t("spot.deleteTitle")}
            description={t("spot.deleteBody", { name })}
            confirmLabel={t("common.delete")}
            onConfirm={() => onDelete(id)}
          />
        )}
      </div>
    </div>
  );
}
