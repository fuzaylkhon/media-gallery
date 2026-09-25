import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useInfiniteMedia } from '../../services/media/useInfiniteMedia.ts';
import type { MediaFilter, MediaItem } from '../../services/media/types.ts';
import { Button } from '../../components/Button.tsx';
import { Grid, GridItem } from '../../components/Grid.tsx';
import { MediaCard } from './MediaCard.tsx';
import { MediaPreview } from './MediaPreview.tsx';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.ts';

const SKELETON_COUNT = 12;

const errorMessage = (error: Error) =>
  (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || error.message;

export function MediaGallery({ type }: { type: MediaFilter }) {
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
  } = useInfiniteMedia(type);
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  const intersectionElRef = useInfiniteScroll({ onLoadMore: fetchNextPage, enabled: canLoadMore });

  if (isPending) {
    return (
      <>
        <Grid>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <GridItem key={index}>
              <div className='aspect-square rounded-xl bg-slate-100' />
            </GridItem>
          ))}
        </Grid>
        <p className='sr-only' role='status'>
          Loading media
        </p>
      </>
    );
  }

  if (isError && !data) {
    return (
      <div className='flex min-h-16 items-center justify-center gap-3 text-slate-600' role='alert'>
        <span>{errorMessage(error)}</span>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className='flex min-h-16 items-center justify-center gap-3 text-slate-600'>No media found</p>;
  }

  return (
    <>
      <Grid>
        {items.map((item) => (
          <GridItem key={item.id}>
            <MediaCard item={item} onPreview={() => setPreview(item)} />
          </GridItem>
        ))}
      </Grid>
      {preview && <MediaPreview item={preview} onClose={() => setPreview(null)} />}

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
      {!hasNextPage && (
        <p className='flex min-h-16 items-center justify-center gap-3 text-slate-600'>You've reached the end</p>
      )}
    </>
  );
}
