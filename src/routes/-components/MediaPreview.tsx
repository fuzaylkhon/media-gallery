import type { MediaItem } from '../../services/media/types.ts';
import { Modal } from '../../components/Modal.tsx';
import { useMediaLoadState } from '../-hooks/useMediaLoadState.ts';

export function MediaPreview({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      labelledBy='media-preview-dialog-title'
      className='h-[min(60rem,calc(100dvh-2rem))] w-[min(60rem,calc(100vw-2rem))]'
    >
      <div className='flex items-center justify-between gap-4 px-4 py-3'>
        <h2 id='media-preview-dialog-title' className='m-0 truncate text-lg'>
          {item?.name ?? 'Media preview'}
        </h2>
        <form method='dialog'>
          <button
            type='submit'
            aria-label='Close media preview'
            className='grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          >
            ✕
          </button>
        </form>
      </div>
      {item && <MediaPreviewContent key={item.id} item={item} />}
    </Modal>
  );
}

function MediaPreviewContent({ item }: { item: MediaItem }) {
  const { status, onReady, onError } = useMediaLoadState();
  const sourceUrl = item.sourceUrl ?? item.thumbnailUrl;
  const videoSourceMissing = item.type === 'video' && !item.sourceUrl;
  const canPlayVideo = item.type === 'video' && !videoSourceMissing;

  return (
    <div className='relative grid min-h-64 place-items-center bg-slate-100'>
      {status === 'failed' ? (
        <p className='p-4 text-sm text-slate-600' role='alert'>
          Failed to load {item.type}.
        </p>
      ) : canPlayVideo ? (
        <video
          className='max-h-[80svh] w-full bg-black'
          src={sourceUrl}
          poster={item.thumbnailUrl}
          controls
          autoPlay
          onCanPlay={onReady}
          onError={onError}
        />
      ) : (
        <img
          className={`max-h-[80svh] w-full object-contain ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
          src={sourceUrl}
          alt={item.name}
          onLoad={onReady}
          onError={onError}
        />
      )}
      {status === 'loading' && (
        <p
          className='pointer-events-none absolute rounded-lg bg-white/90 px-4 py-2 text-sm text-slate-600'
          role='status'
        >
          Loading {videoSourceMissing ? 'video thumbnail' : item.type}…
        </p>
      )}
      {status === 'ready' && videoSourceMissing && (
        <p className='absolute right-2 bottom-2 rounded bg-white/90 px-2 py-1 text-xs text-slate-700' role='status'>
          Video playback unavailable; showing thumbnail.
        </p>
      )}
    </div>
  );
}
