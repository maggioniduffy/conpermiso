import Image from "next/image";
import { BathImage } from "@/utils/models";

interface Props {
  images: BathImage[];
}

const ImagesSlider = ({ images }: Props) => {
  return (
    <div className="relative w-full h-72 md:h-96 overflow-hidden">
      {images && images.length > 0 ? (
        <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory">
          {images.map((img, i) => (
            <div key={i} className="relative min-w-full h-full snap-center">
              <Image
                src={img.url}
                alt={img.alt || "image"}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-principal-200 to-principal-400" />
      )}
    </div>
  );
};

export default ImagesSlider;
