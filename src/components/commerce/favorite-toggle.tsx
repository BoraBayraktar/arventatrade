"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

const FAVORITES_KEY = "arventa:favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
}

function writeFavorites(next: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("arventa:favorites-updated"));
}

export function FavoriteToggle({ productId, productName }: { productId: string; productName: string }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setFavoriteIds(readFavorites());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener("arventa:favorites-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("arventa:favorites-updated", sync);
    };
  }, []);

  const isFavorite = useMemo(() => favoriteIds.includes(productId), [favoriteIds, productId]);

  function toggleFavorite() {
    if (isFavorite) {
      writeFavorites(favoriteIds.filter((id) => id !== productId));
      return;
    }

    writeFavorites([...favoriteIds, productId]);
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={isFavorite ? `${productName} favorilerden cikar` : `${productName} favorilere ekle`}
      className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-600 shadow-sm backdrop-blur transition hover:border-rose-200 hover:text-rose-600"
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
    </button>
  );
}