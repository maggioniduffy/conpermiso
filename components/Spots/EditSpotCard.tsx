import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GeoLocation, Shift } from "@/utils/models";
import { Image as ImageType } from "@/utils/models";

interface Props {
  name: string;
  images: ImageType[];
  id: string;
  description: string;
  location: GeoLocation;
  shifts: Shift[];
  onDelete?: (id: string) => void;
}

export default function EditSpotCard({
  name,
  images,
  id,
  description,
  onDelete,
}: Props) {
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
          <div className="w-full h-full bg-gradient-to-br from-principal-200 to-principal-400" />
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/spot/${id}`}
          className="text-sm font-semibold text-jet hover:text-principal transition-colors truncate block"
        >
          {name}
        </Link>
        <p className="text-xs text-jet-700 truncate mt-0.5">{description}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/spot/edit/${id}`}
          className="p-2 rounded-xl hover:bg-principal/10 text-jet-700 hover:text-principal transition-all"
          title="Editar"
        >
          <Edit className="size-4" />
        </Link>
        <button
          onClick={() => onDelete?.(id)}
          className="p-2 rounded-xl hover:bg-red-50 text-jet-700 hover:text-red-500 transition-all"
          title="Eliminar"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
