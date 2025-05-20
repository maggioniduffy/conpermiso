import { HoverCard } from "@/components/ui/hover-card";
import { Delete, DeleteIcon, Edit, Trash, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  name?: string;
  email?: string;
  image?: string;
}

export default function ProfileCard({
  name = "Faustino Maggioni",
  email = "fausmaggioni5@gmail.com",
  image = "/icons/cool_avatar.png",
}: Props) {
  return (
    <HoverCard>
      <div className="flex items-center justify-between ap-3 w-full border-b-2 border-gray-200 shadow">
        <div className="flex items-center gap-3">
          <Image
            className="shrink-0 rounded-full drop-shadow-lg"
            src={image}
            width={40}
            height={40}
            alt="Avatar"
          />
          <div className="space-y-0.5">
            <p>
              <Link
                className="text-sm font-medium hover:underline"
                href="/profile"
              >
                Lo de Pepe
              </Link>
            </p>
            <p className="text-muted-foreground text-xs">Descripcion</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Edit className="text-gray-500 hover:text-gray-700 cursor-pointer" />
          <Trash2 className="text-gray-500 hover:text-gray-700 cursor-pointer" />
        </div>
      </div>
    </HoverCard>
  );
}
