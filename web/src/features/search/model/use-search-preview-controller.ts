"use client";

import { useDebouncedValue } from "./use-debounced-value";
import { useSearchPreviewQuery } from "./use-search-preview-query";

export function useSearchPreviewController(query: string) {
  const debouncedQuery = useDebouncedValue(query, 250);
  const normalizedQuery = query.trim();
  const previewQuery = useSearchPreviewQuery(debouncedQuery);

  return {
    normalizedQuery,
    canSearch: normalizedQuery.length >= 2,
    previewQuery,
    users: previewQuery.data?.users ?? [],
    posts: previewQuery.data?.posts ?? [],
  };
}
