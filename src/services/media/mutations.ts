import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { validateUploadFile } from '../../utils/validateUploadFile.ts';
import { apiClient } from '../core/axios.ts';
import { captureMediaRemoval, removeMediaFromCache, restoreMediaToCache, type MediaRemovalSnapshot } from './cache.ts';
import type { MediaCache } from './types.ts';
import { mediaItemSchema } from './types.ts';
import { mediaKeys } from './queries.ts';

export async function uploadFile({
  file,
  signal,
  onProgress,
}: {
  file: File;
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
}) {
  if (signal.aborted) throw new DOMException('The upload was aborted.', 'AbortError');
  const error = validateUploadFile(file);
  if (error) throw new Error(error);

  const body = new FormData();
  body.append('file', file);
  onProgress(0);
  try {
    const { data } = await apiClient.post<unknown>('uploads', body, {
      signal,
      onUploadProgress: ({ loaded, total }) => {
        if (total !== undefined && total > 0) {
          onProgress(Math.min(99, Math.max(0, Math.round((loaded / total) * 100))));
        }
      },
    });
    const media = mediaItemSchema.parse(data);
    onProgress(100);
    return media;
  } catch (error) {
    if (signal.aborted || axios.isCancel(error)) {
      throw new DOMException('The upload was aborted.', 'AbortError');
    }
    throw error;
  }
}

const deleteMutationKey = ['media', 'delete'] as const;

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: deleteMutationKey,
    mutationFn: (id: string) => apiClient.delete(`media/${id}`),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: mediaKeys.all });
      const previous: MediaRemovalSnapshot[] = [];

      for (const [queryKey, cache] of queryClient.getQueriesData<MediaCache>({ queryKey: mediaKeys.all })) {
        if (!cache) continue;
        const snapshot = captureMediaRemoval(queryKey, cache, id);
        if (!snapshot) continue;
        previous.push(snapshot);
        queryClient.setQueryData(queryKey, removeMediaFromCache(cache, id));
      }

      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach((snapshot) => {
        queryClient.setQueryData<MediaCache>(snapshot.queryKey, (cache) =>
          cache ? restoreMediaToCache(cache, snapshot) : cache
        );
      });
    },
    onSettled: async () => {
      if (queryClient.isMutating({ mutationKey: deleteMutationKey }) !== 1) return;
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
