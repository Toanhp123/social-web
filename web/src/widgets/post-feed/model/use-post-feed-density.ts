"use client";

import { useEffect, useState } from "react";

export type FeedDensity = "compact" | "comfortable";

export function usePostFeedDensity(): FeedDensity {
  const [density, setDensity] = useState<FeedDensity>("comfortable");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateDensity = () =>
      setDensity(mediaQuery.matches ? "compact" : "comfortable");

    updateDensity();
    mediaQuery.addEventListener("change", updateDensity);

    return () => mediaQuery.removeEventListener("change", updateDensity);
  }, []);

  return density;
}
