import { infiniteQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../core/axios';
import type { MediaFilter, MediaPage } from './types';

export const mediaKeys = {
  all: ['media'] as const,
  list: (type: MediaFilter) => [...mediaKeys.all, type] as const,
};

export const infiniteMediaOptions = (type: MediaFilter) => {
  return infiniteQueryOptions({
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
};
