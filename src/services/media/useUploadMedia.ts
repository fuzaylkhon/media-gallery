import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../core/axios.ts';

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const results = await Promise.allSettled(files.map((file) => apiClient.postForm('uploads', { file })));
      return files.filter((_, i) => results[i]?.status === 'rejected');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}
