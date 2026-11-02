"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselItem = { src: string; alt: string; caption: string };

const GAP = 24; // gap-6

export default function ScreenshotCarousel({
  items,
}: {
  items: CarouselItem[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scrollByFrame = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const frame = el.querySelector("figure")?.getBoundingClientRect().width ?? 0;
    el.scrollBy({ left: dir * (frame + GAP), behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByFrame(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByFrame(-1);
    }
  };

  const btn =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 size-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-jet hover:bg-mywhite disabled:opacity-0 disabled:pointer-events-none transition-opacity";

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Capturas de KKapp"
        tabIndex={0}
        onScroll={update}
        onKeyDown={onKeyDown}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-principal rounded-xl"
      >
        {items.map((shot) => (
          <figure
            key={shot.src}
            className="snap-center shrink-0 w-[180px] md:w-[220px] flex flex-col items-center gap-3"
          >
            <div className="w-full aspect-[739/1600] rounded-[2.5rem] border-8 border-jet overflow-hidden shadow-lg bg-white">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={739}
                height={1600}
                sizes="220px"
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="text-sm text-jet-600 text-center">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      {canPrev && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-mywhite to-transparent"
        />
      )}
      {canNext && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-mywhite to-transparent"
        />
      )}
      <button
        type="button"
        aria-label="Anterior"
        disabled={!canPrev}
        onClick={() => scrollByFrame(-1)}
        className={`${btn} left-2`}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        disabled={!canNext}
        onClick={() => scrollByFrame(1)}
        className={`${btn} right-2`}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
