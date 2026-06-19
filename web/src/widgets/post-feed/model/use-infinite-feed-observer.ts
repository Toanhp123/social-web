"use client";

import { useEffect, type RefObject } from "react";

type UseInfiniteFeedObserverInput = {
  targetRef: RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
};

export function useInfiniteFeedObserver({
  targetRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseInfiniteFeedObserverInput) {
  useEffect(() => {
    const target = targetRef.current;

    if (!target || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, targetRef]);
}
