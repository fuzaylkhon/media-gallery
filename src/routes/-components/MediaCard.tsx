import type { MediaItem } from '../../services/media/types.ts';
import { useDeleteMedia } from '../../services/media/useDeleteMedia.ts';
import { formatBytes } from '../-utils/formatBytes.ts';
import { useMediaLoadState } from '../-hooks/useMediaLoadState.ts';

export function MediaCard({ item, onPreview }: { item: MediaItem; onPreview: () => void }) {
  const deleteMedia = useDeleteMedia();

  return (
    <article className='relative overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <button
        type='button'
        className='relative block aspect-square w-full cursor-pointer overflow-hidden bg-slate-100'
        onClick={onPreview}
      >
        <MediaThumbnail key={item.thumbnailUrl} src={item.thumbnailUrl} />
      </button>
      <button
        type='button'
        disabled={deleteMedia.isPending}
        className='absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-slate-900 disabled:opacity-50'
        onClick={() => deleteMedia.mutate(item.id)}
      >
        ✕
      </button>
      <div className='p-3'>
        <p className='mb-1.5 truncate' title={item.name}>
          {item.name}
        </p>
        <div className='flex gap-2 text-sm text-slate-600'>
          <span>{item.type === 'image' ? 'Image' : 'Video'}</span>
          <span>{formatBytes(item.size)}</span>
        </div>
        {deleteMedia.isError && (
          <p className='mt-1.5 mb-0 text-sm text-red-700' role='alert'>
            Failed to delete. Try again.
          </p>
        )}
      </div>
    </article>
  );
}

function MediaThumbnail({ src }: { src: string }) {
  const { status, onReady, onError } = useMediaLoadState();

  if (status === 'failed') {
    return <span className='absolute inset-0 grid place-items-center text-sm text-slate-600'>Preview unavailable</span>;
  }

  return (
    <>
      <img
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-160 motion-reduce:transition-none ${
          status === 'loading' ? 'opacity-0' : 'opacity-100'
        }`}
        src={src}
        alt=''
        loading='lazy'
        decoding='async'
        onLoad={onReady}
        onError={onError}
      />
      {status === 'loading' && (
        <span
          aria-hidden='true'
          className='absolute inset-0 animate-shimmer bg-linear-100 from-transparent from-20% via-white/50 via-50% to-transparent to-80% motion-reduce:hidden'
        />
      )}
    </>
  );
}
