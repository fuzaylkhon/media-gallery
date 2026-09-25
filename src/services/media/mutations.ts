import { apiClient } from '../core/axios.ts';
import type { MediaCache } from './types.ts';
import { mediaItemSchema } from './types.ts';
import { validateUploadFile } from '../../utils/validateUploadFile.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const error = validateUploadFile(file);
  if (error) throw new Error(error);

  const body = new FormData();
  body.append('file', file);
  const { data } = await apiClient.post<unknown>('uploads', body, {
    signal,
    onUploadProgress: ({ loaded, total }) => {
      if (total !== undefined && total > 0) {
        onProgress(Math.min(100, Math.max(0, Math.round((loaded / total) * 100))));
      }
    },
  });
  return mediaItemSchema.parse(data);
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`media/${id}`),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: mediaKeys.all });
      const previous = queryClient.getQueriesData<MediaCache>({ queryKey: mediaKeys.all });

      queryClient.setQueriesData<MediaCache>({ queryKey: mediaKeys.all }, (old) => {
        if (!old?.pages) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((e) => e.id !== id),
          })),
        };
      });

      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}
