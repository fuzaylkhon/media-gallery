import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../core/axios.ts';

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`media/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}
