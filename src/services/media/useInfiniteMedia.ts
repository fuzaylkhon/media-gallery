import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../core/axios.ts';
import type { MediaFilter, MediaPage } from './types.ts';

export function useInfiniteMedia(type: MediaFilter) {
  return useInfiniteQuery({
    queryKey: ['media', type],
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await apiClient.get<MediaPage>('media', {
        params: { page: pageParam, type: type === 'all' ? undefined : type },
        signal,
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
