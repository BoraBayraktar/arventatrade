"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { GridTileImage } from "@/components/grid/tile";

type GalleryProps = {
  images: { src: string; altText: string }[];
};

export function Gallery({ images }: GalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageIndex = searchParams.has("image") ? Number(searchParams.get("image")) : 0;

  function updateImage(index: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", index);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;
  const buttonClassName = "flex h-full items-center justify-center px-6 transition-all ease-in-out hover:scale-110 hover:text-black";

  return (
    <form>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {images[imageIndex] ? (
          <Image
            className="h-full w-full object-contain"
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={images[imageIndex].altText}
            src={images[imageIndex].src}
            priority
            unoptimized
          />
        ) : null}

        {images.length > 1 ? (
          <div className="absolute bottom-[15%] flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-neutral-50/80 text-neutral-500 backdrop-blur-sm">
              <button formAction={() => updateImage(String(previousImageIndex))} aria-label="Previous product image" className={buttonClassName}>
                <ChevronLeft className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-neutral-500" />
              <button formAction={() => updateImage(String(nextImageIndex))} aria-label="Next product image" className={buttonClassName}>
                <ChevronRight className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="my-12 flex flex-wrap items-center justify-center gap-2 overflow-auto py-1 lg:mb-0">
          {images.map((image, index) => {
            const isActive = index === imageIndex;

            return (
              <li key={`${image.src}-${index}`} className="h-20 w-20">
                <button formAction={() => updateImage(String(index))} aria-label="Select product image" className="h-full w-full">
                  <GridTileImage alt={image.altText} src={image.src} width={80} height={80} active={isActive} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
}