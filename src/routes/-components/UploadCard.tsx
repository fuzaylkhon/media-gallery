import type { UploadItem } from '../-hooks/useUploads.ts';
import { formatBytes } from '../../utils/formatBytes.ts';
import { Button } from '../../components/Button.tsx';

export function UploadCard({
  item,
  onCancel,
  onRetry,
  onRemove,
}: {
  item: UploadItem;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const { status } = item;
  return (
    <article className='relative overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <img className='aspect-square w-full object-cover bg-slate-100' src={item.previewUrl} alt={item.name} />
      <button
        type='button'
        aria-label={`Remove ${item.name}`}
        className='absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-slate-900'
        onClick={onRemove}
      >
        ✕
      </button>
      <div className='p-3'>
        <p className='mb-1.5 truncate' title={item.name}>
          {item.name}
        </p>
        <p className='text-sm text-slate-600'>Image · {formatBytes(item.size)}</p>
        {status.kind === 'uploading' && (
          <>
            <p className='text-sm text-slate-600' role='status'>
              Uploading · {status.progress}%
            </p>
            <Button onClick={onCancel} aria-label={`Cancel upload of ${item.name}`}>
              Cancel
            </Button>
          </>
        )}
        {status.kind === 'error' && (
          <p className='text-sm text-red-700' role='alert'>
            {status.message}
          </p>
        )}
        {status.kind === 'canceled' && (
          <p className='text-sm text-slate-600' role='status'>
            Canceled
          </p>
        )}
        {(status.kind === 'error' || status.kind === 'canceled') && (
          <Button onClick={onRetry} aria-label={`Retry upload of ${item.name}`}>
            Retry
          </Button>
        )}
      </div>
    </article>
  );
}
