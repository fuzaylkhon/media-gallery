import { infiniteQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../core/axios';
import { mediaPageSchema, type MediaFilter } from './types';

export const mediaKeys = {
  all: ['media'] as const,
  list: (type: MediaFilter) => [...mediaKeys.all, type] as const,
};

export const infiniteMediaOptions = (type: MediaFilter) => {
  return infiniteQueryOptions({
    queryKey: mediaKeys.list(type),
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await apiClient.get<unknown>('media', {
        params: { page: pageParam, type: type === 'all' ? undefined : type },
        signal,
      });
      return mediaPageSchema.parse(data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
