import { Image as ImageIcon, XIcon } from "lucide-react";
import Uploader from "./Uploader";
import { BathImage } from "@/utils/models";
import { SectionCard } from "./SectionCard";

interface Props {
  isEdit: boolean;
  remainingImages: BathImage[];
  onRemoveImage: (url: string) => void;
  onFilesChange: (files: File[]) => void;
}

export function SpotFormImagesSection({
  isEdit,
  remainingImages,
  onRemoveImage,
  onFilesChange,
}: Props) {
  return (
    <SectionCard icon={<ImageIcon className="size-4" />} label="Imágenes">
      {isEdit && remainingImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {remainingImages.map((img) => (
            <div key={img.url} className="relative aspect-square rounded-xl overflow-hidden">
              <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(img.url)}
                className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Uploader onChange={onFilesChange} maxFiles={5} />
    </SectionCard>
  );
}
