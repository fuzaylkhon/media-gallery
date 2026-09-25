import { useState } from 'react';
import { isAxiosError } from 'axios';
import { infiniteMediaOptions } from '../../services/media/queries.ts';
import type { MediaFilter, MediaItem } from '../../services/media/types.ts';
import { Button } from '../../components/Button.tsx';
import { Grid, GridItem } from '../../components/Grid.tsx';
import { MediaCard } from './MediaCard.tsx';
import { MediaPreview } from './MediaPreview.tsx';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.ts';
import type { useUploads } from '../-hooks/useUploads.ts';
import { UploadCard } from './UploadCard.tsx';
import { useInfiniteQuery } from '@tanstack/react-query';

const SKELETON_COUNT = 12;

const errorMessage = (error: Error) =>
  (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || error.message;

export function MediaGallery({ type, uploads }: { type: MediaFilter; uploads: ReturnType<typeof useUploads> }) {
  const {
    data,
    error,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery(infiniteMediaOptions(type));
  const localItems = type === 'video' ? [] : uploads.items;
  const uploadedIds = new Set(
    localItems
      .map((item) => item.status)
      .filter((status) => status.kind === 'done')
      .map((status) => status.media.id)
  );
  const serverItems = new Map<string, MediaItem>(
    data?.pages.flatMap((page) => page.items.map<[string, MediaItem]>((item) => [item.id, item]))
  );
  const items = [...serverItems.values()].filter((item) => !uploadedIds.has(item.id));
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  const intersectionElRef = useInfiniteScroll({ onLoadMore: fetchNextPage, enabled: canLoadMore });

  return (
    <>
      <Grid>
        {localItems.map((item) => (
          <GridItem key={item.id}>
            {item.status.kind === 'done' ? (
              <MediaCard
                item={item.status.media}
                uploaded
                onPreview={() => {
                  if (item.status.kind === 'done') setPreview(item.status.media);
                }}
                onDeleted={() => uploads.remove(item.id)}
              />
            ) : (
              <UploadCard
                item={item}
                onCancel={() => uploads.cancel(item.id)}
                onRetry={() => uploads.retry(item.id)}
                onRemove={() => uploads.remove(item.id)}
              />
            )}
          </GridItem>
        ))}
        {items.map((item) => (
          <GridItem key={item.id}>
            <MediaCard item={item} onPreview={() => setPreview(item)} />
          </GridItem>
        ))}
        {isPending &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <GridItem key={`skeleton-${index}`}>
              <div className='aspect-square rounded-xl bg-slate-100' />
            </GridItem>
          ))}
      </Grid>

      {isPending && (
        <p className='sr-only' role='status'>
          Loading media
        </p>
      )}
      {isError && !data && (
        <div className='flex min-h-16 items-center justify-center gap-3 text-slate-600' role='alert'>
          <span>{errorMessage(error)}</span>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      )}
      {!isPending && !isError && items.length === 0 && localItems.length === 0 && (
        <p className='flex min-h-16 items-center justify-center gap-3 text-slate-600'>No media found</p>
      )}

      <MediaPreview item={preview} onClose={() => setPreview(null)} />

      <div ref={intersectionElRef} />
      {isFetchingNextPage && (
        <div className='flex min-h-16 items-center justify-center gap-3 text-slate-600' role='status'>
          <span
            className='aspect-square w-4 animate-[spin_700ms_linear_infinite] rounded-full border-2 border-slate-300 border-t-slate-700 motion-reduce:animate-none'
            aria-hidden='true'
          />
          Loading more media
        </div>
      )}
      {isFetchNextPageError && (
        <div className='flex min-h-16 items-center justify-center gap-3 text-slate-600' role='alert'>
          <span>{errorMessage(error)}</span>
          <Button onClick={() => fetchNextPage()}>Retry</Button>
        </div>
      )}
      {data && items.length + localItems.length > 0 && !hasNextPage && (
        <p className='flex min-h-16 items-center justify-center gap-3 text-slate-600'>You've reached the end</p>
      )}
    </>
  );
}
