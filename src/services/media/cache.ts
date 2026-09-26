import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { mediaKeys } from './queries.ts';
import type { MediaCache, MediaItem } from './types.ts';

export type MediaRemovalSnapshot = {
  queryKey: QueryKey;
  total: number;
  entries: { pageIndex: number; itemIndex: number; item: MediaItem }[];
};

export function removeMediaFromCache(cache: MediaCache, id: string): MediaCache {
  const exists = cache.pages.some((page) => page.items.some((item) => item.id === id));
  if (!exists) return cache;

  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      total: Math.max(0, page.total - 1),
      items: page.items.filter((item) => item.id !== id),
    })),
  };
}

export function captureMediaRemoval(
  queryKey: QueryKey,
  cache: MediaCache,
  id: string
): MediaRemovalSnapshot | undefined {
  const entries = cache.pages.flatMap((page, pageIndex) =>
    page.items.flatMap((item, itemIndex) => (item.id === id ? [{ pageIndex, itemIndex, item }] : []))
  );
  if (entries.length === 0) return undefined;

  return { queryKey, total: cache.pages[0]?.total ?? 0, entries };
}

export function restoreMediaToCache(cache: MediaCache, snapshot: MediaRemovalSnapshot): MediaCache {
  if (cache.pages.some((page) => page.items.some((item) => item.id === snapshot.entries[0]?.item.id))) return cache;

  const first = snapshot.entries[0];
  if (!first || cache.pages.length === 0) return cache;
  const pageIndex = Math.min(first.pageIndex, cache.pages.length - 1);

  return {
    ...cache,
    pages: cache.pages.map((page, index) => ({
      ...page,
      total: page.total + 1,
      items:
        index === pageIndex
          ? [
              ...page.items.slice(0, Math.min(first.itemIndex, page.items.length)),
              first.item,
              ...page.items.slice(Math.min(first.itemIndex, page.items.length)),
            ]
          : page.items,
    })),
  };
}

export function insertUploadedMedia(cache: MediaCache, item: MediaItem): MediaCache {
  if (cache.pages.length === 0 || cache.pages.some((page) => page.items.some(({ id }) => id === item.id))) return cache;

  return {
    ...cache,
    pages: cache.pages.map((page, index) => ({
      ...page,
      total: page.total + 1,
      items: index === 0 ? [item, ...page.items] : page.items,
    })),
  };
}

export function cacheUploadedMedia(queryClient: QueryClient, item: MediaItem): void {
  for (const [queryKey] of queryClient.getQueriesData<MediaCache>({ queryKey: mediaKeys.all })) {
    const filter = queryKey[1];
    if (filter === 'video' || (filter !== 'all' && filter !== item.type)) continue;
    queryClient.setQueryData<MediaCache>(queryKey, (cache) =>
      cache
        ? insertUploadedMedia(cache, item)
        : { pages: [{ items: [item], nextPage: 2, total: 1 }], pageParams: [1] }
    );
  }
}
