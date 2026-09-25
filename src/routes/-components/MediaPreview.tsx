import type { MediaItem } from '../../services/media/types.ts';
import { Modal } from '../../components/Modal.tsx';

export function MediaPreview({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <Modal onClose={onClose} className='w-[min(100%-2rem,60rem)] h-[min(100%-2rem,60rem)]'>
      <div className='flex items-center justify-between gap-4 px-4 py-3'>
        <h2 className='m-0 truncate text-lg'>{item.name}</h2>
        <form method='dialog'>
          <button
            className='grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          >
            ✕
          </button>
        </form>
      </div>
      {item.type === 'video' ? (
        <video
          className='max-h-[80svh] w-full bg-black'
          src={item.sourceUrl}
          poster={item.thumbnailUrl}
          controls
          autoPlay
        />
      ) : (
        <img className='max-h-[80svh] w-full bg-slate-100 object-contain' src={item.sourceUrl} alt={item.name} />
      )}
    </Modal>
  );
}
