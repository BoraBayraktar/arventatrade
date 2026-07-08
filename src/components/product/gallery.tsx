"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { GridTileImage } from "@/components/grid/tile";
import styles from "@/ui/shop/surface.module.css";

type GalleryProps = {
  images: { src: string; altText: string }[];
  zoomTargetId?: string;
};

export function Gallery({ images, zoomTargetId }: GalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawImageIndex = searchParams.has("image") ? Number(searchParams.get("image")) : 0;
  const imageIndex = Number.isInteger(rawImageIndex)
    ? Math.min(Math.max(rawImageIndex, 0), Math.max(images.length - 1, 0))
    : 0;
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 42 });
  const [fadeImageSrc, setFadeImageSrc] = useState<string | null>(null);
  const [isFadeOut, setIsFadeOut] = useState(false);
  const [imageTransitionDurationClass, setImageTransitionDurationClass] = useState("duration-500");
  const [mainSize, setMainSize] = useState({ width: 0, height: 0 });
  const [zoomSize, setZoomSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const zoomPanelRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const zoomBackgroundRef = useRef<HTMLDivElement>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const hoverPreviewTimerRef = useRef<number | null>(null);

  function updateImage(index: string) {
    const nextIndex = Number(index);

    clearHoverPreviewTimer();

    if (Number.isInteger(nextIndex)) {
      startImageTransition(Math.min(Math.max(nextIndex, 0), Math.max(images.length - 1, 0)), "click");
    }

    setHoveredImageIndex(null);
    setZoomPosition({ x: 50, y: 42 });
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", index);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function previewImage(index: number) {
    clearHoverPreviewTimer();

    if (typeof window === "undefined") {
      return;
    }

    hoverPreviewTimerRef.current = window.setTimeout(() => {
      startImageTransition(index, "hover");
      setHoveredImageIndex(index);
      setZoomPosition({ x: 50, y: 42 });
      hoverPreviewTimerRef.current = null;
    }, 100);
  }

  function clearPreviewImage() {
    clearHoverPreviewTimer();
    startImageTransition(imageIndex, "hover");
    setHoveredImageIndex(null);
    setZoomPosition({ x: 50, y: 42 });
  }

  const displayedIndex = hoveredImageIndex ?? imageIndex;
  const nextImageIndex = displayedIndex + 1 < images.length ? displayedIndex + 1 : 0;
  const previousImageIndex = displayedIndex === 0 ? images.length - 1 : displayedIndex - 1;
  const navButtonClassName = "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/25 text-neutral-800 shadow-sm backdrop-blur-[2px] transition-colors duration-200 hover:bg-white/50 hover:text-[color:var(--primary)]";
  const imageTransitionClassName = `transition-opacity ${imageTransitionDurationClass} ease-out`;
  const zoomEdgePaddingPercent = 5;
  const zoomScale = 3.3;
  const currentImage = images[displayedIndex];

  function clearFadeTimer() {
    if (fadeTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }

  function clearHoverPreviewTimer() {
    if (hoverPreviewTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(hoverPreviewTimerRef.current);
      hoverPreviewTimerRef.current = null;
    }
  }

  function startImageTransition(nextIndex: number, mode: "hover" | "click" = "hover") {
    const nextImage = images[nextIndex];
    const transitionDurationMs = mode === "hover" ? 1100 : 320;
    const transitionDurationClass = mode === "hover" ? "duration-1000" : "duration-300";

    if (!currentImage || !nextImage || currentImage.src === nextImage.src || typeof window === "undefined") {
      return;
    }

    clearFadeTimer();
    setImageTransitionDurationClass(transitionDurationClass);
    setFadeImageSrc(currentImage.src);
    setIsFadeOut(false);

    window.requestAnimationFrame(() => {
      setIsFadeOut(true);
    });

    fadeTimerRef.current = window.setTimeout(() => {
      setFadeImageSrc(null);
      setIsFadeOut(false);
      fadeTimerRef.current = null;
    }, transitionDurationMs + 40);
  }

  useEffect(() => {
    return () => {
      clearFadeTimer();
      clearHoverPreviewTimer();
    };
  }, []);

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
      left,
      top,
      width: lensSize.width,
      height: lensSize.height,
    };
  }, [displayedImageRect.height, displayedImageRect.left, displayedImageRect.top, displayedImageRect.width, lensSize.height, lensSize.width, zoomPosition.x, zoomPosition.y]);

  useEffect(() => {
    const lensEl = lensRef.current;
    if (!lensEl) {
      return;
    }

    lensEl.style.left = `${lensStyle.left}px`;
    lensEl.style.top = `${lensStyle.top}px`;
    lensEl.style.width = `${lensStyle.width}px`;
    lensEl.style.height = `${lensStyle.height}px`;
  }, [lensStyle.height, lensStyle.left, lensStyle.top, lensStyle.width]);

  useEffect(() => {
    const zoomEl = zoomPanelRef.current;
    const mainEl = mainPanelRef.current;
    if (!zoomEl) {
      return;
    }

    zoomEl.style.aspectRatio = "auto";
    zoomEl.style.height = `${Math.max(1, mainSize.height)}px`;
    zoomEl.style.maxHeight = `${Math.max(1, mainSize.height)}px`;

    if (!mainEl || !canUseDesktopZoom()) {
      return;
    }

    const rect = mainEl.getBoundingClientRect();
    const zoomTarget = zoomTargetId ? document.getElementById(zoomTargetId) : null;
    const targetRect = zoomTarget?.getBoundingClientRect();
    const viewportPadding = 16;
    const fallbackPadding = 16;
    const gap = 32;
    const targetLeft = targetRect?.left ?? rect.right + gap;
    const targetRight = targetRect?.right ?? window.innerWidth - fallbackPadding;
    const targetWidth = Math.max(0, targetRight - targetLeft);
    const panelWidth = Math.max(220, targetWidth);
    const left = targetLeft;
    const top = Math.max(viewportPadding, rect.top);

    zoomEl.style.width = `${panelWidth}px`;
    zoomEl.style.left = `${left}px`;
    zoomEl.style.top = `${top}px`;
  }, [imageNaturalSize.height, imageNaturalSize.width, mainSize.height, mainSize.width, zoomTargetId]);

  useEffect(() => {
    const backgroundEl = zoomBackgroundRef.current;
    if (!backgroundEl || !currentImage) {
      return;
    }

    backgroundEl.style.backgroundImage = `url(${currentImage.src})`;
    backgroundEl.style.backgroundRepeat = "no-repeat";
    backgroundEl.style.backgroundSize = `${zoomScale * 100}%`;
    backgroundEl.style.backgroundPosition = `${zoomPosition.x}% ${zoomPosition.y}%`;
  }, [currentImage, zoomPosition.x, zoomPosition.y]);

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
        className="relative"
        onMouseEnter={() => setIsZoomActive(canUseDesktopZoom())}
        onMouseLeave={() => {
          setIsZoomActive(false);
          setZoomPosition({ x: 50, y: 42 });
        }}
      >
        <div
          ref={mainPanelRef}
          className={`${styles.panel} relative aspect-square h-full max-h-[550px] w-full overflow-hidden`}
          onMouseMove={handleZoomMove}
        >
          {currentImage ? (
            <Image
              className={`h-full w-full object-contain ${imageTransitionClassName}`}
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

          {fadeImageSrc ? (
            <Image
              className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${imageTransitionClassName} ${isFadeOut ? "opacity-0" : "opacity-100"}`}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              alt=""
              src={fadeImageSrc}
              unoptimized
              aria-hidden="true"
            />
          ) : null}

          {isZoomActive && currentImage ? (
            <div
              ref={lensRef}
              className="pointer-events-none absolute hidden border border-[color:var(--surface-border)] bg-white/20 backdrop-blur-[1px] xl:block"
              aria-hidden="true"
            />
          ) : null}

          {images.length > 1 ? (
            <>
              <button
                formAction={() => updateImage(String(previousImageIndex))}
                aria-label="Previous product image"
                className={`${navButtonClassName} left-3`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                formAction={() => updateImage(String(nextImageIndex))}
                aria-label="Next product image"
                className={`${navButtonClassName} right-3`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        <div
          ref={zoomPanelRef}
          className={`${styles.panel} pointer-events-none fixed left-0 top-0 z-10 hidden overflow-hidden shadow-2xl transition-opacity xl:block ${isZoomActive && currentImage ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        >
          {currentImage ? (
            <div
              ref={zoomBackgroundRef}
              className="absolute inset-0"
            />
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <ul
          className="my-12 flex flex-wrap items-center justify-center gap-2 overflow-auto py-1 lg:mb-0"
          onMouseLeave={clearPreviewImage}
          onBlurCapture={(event) => {
            const nextFocused = event.relatedTarget as Node | null;

            if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
              clearPreviewImage();
            }
          }}
        >
          {images.map((image, index) => {
            const isActive = index === displayedIndex;

            return (
              <li key={`${image.src}-${index}`} className="h-20 w-20">
                <button
                  formAction={() => updateImage(String(index))}
                  aria-label="Select product image"
                  className="h-full w-full"
                  onMouseEnter={() => previewImage(index)}
                  onFocus={() => previewImage(index)}
                >
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