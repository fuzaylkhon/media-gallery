import { useEffect, useReducer, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cacheUploadedMedia } from '../../services/media/cache.ts';
import { uploadFile } from '../../services/media/mutations';
import { mediaKeys } from '../../services/media/queries.ts';
import { type ReadyThumbnail, removeThumbnail } from '../../features/thumbnail';

type UploadStatus = { kind: 'uploading'; progress: number } | { kind: 'error'; message: string } | { kind: 'canceled' };

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  status: UploadStatus;
};

type Action =
  | { kind: 'add'; items: UploadItem[] }
  | { kind: 'status'; id: string; status: UploadStatus }
  | { kind: 'remove'; id: string };

function reducer(items: UploadItem[], action: Action): UploadItem[] {
  switch (action.kind) {
    case 'add':
      return [...action.items, ...items];
    case 'status':
      return items.map((item) => (item.id === action.id ? { ...item, status: action.status } : item));
    case 'remove':
      return items.filter((item) => item.id !== action.id);
    default: {
      return action;
    }
  }
}

type Attempt = { id: string; file: File; controller: AbortController };

export function useUploads() {
  const [items, dispatch] = useReducer(reducer, []);
  const [uploadedIds, setUploadedIds] = useState<ReadonlySet<string>>(() => new Set());
  const active = useRef(new Map<string, AbortController>());
  const files = useRef(new Map<string, File>());
  const previews = useRef(new Map<string, string>());
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ id, file, controller }: Attempt) =>
      uploadFile({
        file,
        signal: controller.signal,
        onProgress: (progress) => {
          if (active.current.get(id) !== controller) return;
          dispatch({ kind: 'status', id, status: { kind: 'uploading', progress } });
        },
      }),
    onSuccess: async (media, { id, controller }) => {
      if (active.current.get(id) !== controller) return;
      active.current.delete(id);
      files.current.delete(id);
      removeThumbnail(id);
      previews.current.delete(id);

      await queryClient.cancelQueries({ queryKey: mediaKeys.all });
      cacheUploadedMedia(queryClient, media);
      setUploadedIds((ids) => new Set(ids).add(media.id));
      dispatch({ kind: 'remove', id });
    },
    onError: (error, { id, controller }) => {
      if (active.current.get(id) !== controller) return;
      active.current.delete(id);
      dispatch({ kind: 'status', id, status: { kind: 'error', message: error.message } });
    },
    onSettled: (): void => {
      uploadMutation.reset();
    },
    gcTime: 0,
  });

  useEffect(() => {
    if (import.meta.hot) return;
    const controllers = active.current;
    const retainedFiles = files.current;
    const urls = previews.current;
    return () => {
      const pending = [...controllers.values()];
      controllers.clear();
      for (const controller of pending) controller.abort();
      for (const id of urls.keys()) removeThumbnail(id);
      urls.clear();
      retainedFiles.clear();
    };
  }, []);

  function start(id: string) {
    const file = files.current.get(id);
    if (!file || active.current.has(id)) return;
    const controller = new AbortController();
    active.current.set(id, controller);
    dispatch({ kind: 'status', id, status: { kind: 'uploading', progress: 0 } });
    uploadMutation.mutate({ id, file, controller });
  }

  function addFiles(selected: ReadyThumbnail[]) {
    const added: UploadItem[] = selected.map(({ id, file, url: previewUrl }) => {
      files.current.set(id, file);
      previews.current.set(id, previewUrl);
      return { id, name: file.name, size: file.size, previewUrl, status: { kind: 'uploading', progress: 0 } };
    });
    dispatch({ kind: 'add', items: added });
    for (const item of added) start(item.id);
  }

  function cancel(id: string) {
    const controller = active.current.get(id);
    if (!controller) return;
    active.current.delete(id);
    controller.abort();
    dispatch({ kind: 'status', id, status: { kind: 'canceled' } });
  }

  function retry(id: string) {
    start(id);
  }

  function remove(id: string) {
    cancel(id);
    removeThumbnail(id);
    previews.current.delete(id);
    files.current.delete(id);
    dispatch({ kind: 'remove', id });
  }

  return { items, uploadedIds, addFiles, cancel, retry, remove };
}
