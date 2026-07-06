"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { GridTileImage } from "@/components/grid/tile";
import styles from "@/ui/shop/surface.module.css";

type GalleryProps = {
  images: { src: string; altText: string }[];
};

export function Gallery({ images }: GalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageIndex = searchParams.has("image") ? Number(searchParams.get("image")) : 0;
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [mainSize, setMainSize] = useState({ width: 0, height: 0 });
  const [zoomSize, setZoomSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const zoomPanelRef = useRef<HTMLDivElement>(null);

  function updateImage(index: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", index);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;
  const buttonClassName = "flex h-full items-center justify-center px-6 transition-all ease-in-out hover:scale-110 hover:text-[color:var(--primary)]";
  const zoomEdgePaddingPercent = 5;
  const zoomScale = 3.3;
  const currentImage = images[imageIndex];

  useEffect(() => {
    const mainEl = mainPanelRef.current;
    const zoomEl = zoomPanelRef.current;

    if (!mainEl || !zoomEl || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      setMainSize({ width: mainEl.clientWidth, height: mainEl.clientHeight });
      setZoomSize({ width: zoomEl.clientWidth, height: zoomEl.clientHeight });
    });

    observer.observe(mainEl);
    observer.observe(zoomEl);

    setMainSize({ width: mainEl.clientWidth, height: mainEl.clientHeight });
    setZoomSize({ width: zoomEl.clientWidth, height: zoomEl.clientHeight });

    return () => observer.disconnect();
  }, []);

  function canUseDesktopZoom() {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(min-width: 1280px)").matches;
  }

  const displayedImageRect = useMemo(() => {
    const panelWidth = Math.max(1, mainSize.width);
    const panelHeight = Math.max(1, mainSize.height);
    const imageRatio = imageNaturalSize.width / imageNaturalSize.height;
    const panelRatio = panelWidth / panelHeight;

    if (imageRatio > panelRatio) {
      const height = panelWidth / imageRatio;
      return {
        left: 0,
        top: (panelHeight - height) / 2,
        width: panelWidth,
        height,
      };
    }

    const width = panelHeight * imageRatio;
    return {
      left: (panelWidth - width) / 2,
      top: 0,
      width,
      height: panelHeight,
    };
  }, [imageNaturalSize.height, imageNaturalSize.width, mainSize.height, mainSize.width]);

  const lensSize = useMemo(() => {
    const width = Math.max(44, zoomSize.width / zoomScale);
    const height = Math.max(44, zoomSize.height / zoomScale);

    return { width, height };
  }, [zoomScale, zoomSize.height, zoomSize.width]);

  const lensStyle = useMemo(() => {
    const centerX = displayedImageRect.left + (zoomPosition.x / 100) * displayedImageRect.width;
    const centerY = displayedImageRect.top + (zoomPosition.y / 100) * displayedImageRect.height;

    const left = Math.min(
      displayedImageRect.left + displayedImageRect.width - lensSize.width,
      Math.max(displayedImageRect.left, centerX - lensSize.width / 2),
    );
    const top = Math.min(
      displayedImageRect.top + displayedImageRect.height - lensSize.height,
      Math.max(displayedImageRect.top, centerY - lensSize.height / 2),
    );

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${lensSize.width}px`,
      height: `${lensSize.height}px`,
    };
  }, [displayedImageRect.height, displayedImageRect.left, displayedImageRect.top, displayedImageRect.width, lensSize.height, lensSize.width, zoomPosition.x, zoomPosition.y]);

  function handleZoomMove(event: MouseEvent<HTMLDivElement>) {
    if (!canUseDesktopZoom()) {
      return;
    }

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    const relativeX = (localX - displayedImageRect.left) / displayedImageRect.width;
    const relativeY = (localY - displayedImageRect.top) / displayedImageRect.height;

    const x = relativeX * 100;
    const y = relativeY * 100;

    const clampedX = Math.min(100 - zoomEdgePaddingPercent, Math.max(zoomEdgePaddingPercent, x));
    const clampedY = Math.min(100 - zoomEdgePaddingPercent, Math.max(zoomEdgePaddingPercent, y));

    setZoomPosition({
      x: clampedX,
      y: clampedY,
    });
  }

  return (
    <form>
      <div
        className="relative xl:flex xl:items-start xl:gap-4"
        onMouseEnter={() => setIsZoomActive(canUseDesktopZoom())}
        onMouseLeave={() => setIsZoomActive(false)}
      >
        <div
          ref={mainPanelRef}
          className={`${styles.panel} relative aspect-square h-full max-h-[550px] w-full overflow-hidden xl:flex-1`}
          onMouseMove={handleZoomMove}
        >
          {currentImage ? (
            <Image
              className="h-full w-full object-contain"
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              alt={currentImage.altText}
              src={currentImage.src}
              priority
              unoptimized
              onLoad={(event) => {
                const img = event.currentTarget;
                setImageNaturalSize({
                  width: img.naturalWidth || 1,
                  height: img.naturalHeight || 1,
                });
              }}
            />
          ) : null}

          {isZoomActive && currentImage ? (
            <div
              className="pointer-events-none absolute hidden border border-[color:var(--surface-border)] bg-white/20 backdrop-blur-[1px] xl:block"
              style={lensStyle}
              aria-hidden="true"
            />
          ) : null}

          {images.length > 1 ? (
            <div className="absolute bottom-[15%] flex w-full justify-center">
              <div className={`${styles.panelSoft} mx-auto flex h-11 items-center text-muted-foreground backdrop-blur-sm`}>
                <button formAction={() => updateImage(String(previousImageIndex))} aria-label="Previous product image" className={buttonClassName}>
                  <ChevronLeft className="h-5" />
                </button>
                <div className="mx-1 h-6 w-px bg-border" />
                <button formAction={() => updateImage(String(nextImageIndex))} aria-label="Next product image" className={buttonClassName}>
                  <ChevronRight className="h-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div
          ref={zoomPanelRef}
          className={`${styles.panel} relative hidden aspect-square w-[460px] shrink-0 overflow-hidden xl:block ${isZoomActive && currentImage ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
          style={{
            aspectRatio: `${imageNaturalSize.width} / ${imageNaturalSize.height}`,
          }}
        >
          {currentImage ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${currentImage.src})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${zoomScale * 100}%`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          ) : null}
        </div>
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