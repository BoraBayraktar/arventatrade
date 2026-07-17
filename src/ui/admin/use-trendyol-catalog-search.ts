"use client";

import { useEffect, useState } from "react";

type UseTrendyolCatalogSearchArgs = {
  endpoint: string;
  enabled?: boolean;
  minLength?: number;
  debounceMs?: number;
};

export function useTrendyolCatalogSearch<TItem>({
  endpoint,
  enabled = true,
  minLength = 2,
  debounceMs = 350,
}: UseTrendyolCatalogSearchArgs) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TItem[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const queryValue = query.trim();

    if (!enabled || queryValue.length < minLength) {
      setItems([]);
      setBusy(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setBusy(true);

      try {
        const response = await fetch(`${endpoint}?query=${encodeURIComponent(queryValue)}`);

        if (!response.ok) {
          setItems([]);
          return;
        }

        const payload = await response.json() as { items: TItem[] };
        if (!cancelled) {
          setItems(payload.items);
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [debounceMs, enabled, endpoint, minLength, query]);

  function clear() {
    setQuery("");
    setItems([]);
    setBusy(false);
  }

  return {
    query,
    setQuery,
    items,
    setItems,
    busy,
    clear,
  };
}
