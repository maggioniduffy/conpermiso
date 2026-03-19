import { HoverCard } from "@/components/ui/hover-card";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertTitle } from "../ui/alert";
import { Bath, GeoLocation, Shift } from "@/utils/models";
import { Image as ImageType } from "@/utils/models";

interface Props {
  name: string;
  images: ImageType[];
  id: string;
  description: string;
  location: GeoLocation;
  shifts: Shift[];
}
export default function EditSpotCard({
  name,
  images,
  id,
  shifts,
  description,
  location,
}: Props) {
  return (
    <HoverCard>
      <div className="flex items-center justify-between ap-3 w-full border-b-2 border-gray-200 shadow">
        <div className="flex items-center gap-3">
          {images[0] && (
            <Image
              className="shrink-0 rounded-full drop-shadow-lg"
              src={images[0].url}
              width={40}
              height={40}
              alt={images[0].alt!!}
            />
          )}
          <div className="space-y-0.5">
            <p>
              <Link
                className="text-sm font-medium hover:underline"
                href={`/spot/${id}`}
              >
                {name}
              </Link>
            </p>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/spot/edit/${id}`}>
            <Edit className="text-gray-500 hover:text-principal transition-colors cursor-pointer" />
          </Link>
          <Link href={"/spot/edit"} className="group relative">
            <Alert className="hidden text-sm group-hover:flex place-items-center w-fit absolute right-2 bottom-5 bg-mywhite">
              <AlertTitle>Borrar</AlertTitle>
            </Alert>

            <Trash2 className="text-gray-500 hover:text-gray-700 cursor-pointer" />
          </Link>
        </div>
      </div>
    </HoverCard>
  );
}
