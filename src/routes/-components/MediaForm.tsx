import { type SubmitEvent, useEffect, useRef, useState } from 'react';
import { DndUpload } from '../../components/DndUpload.tsx';
import { formatBytes } from '../../utils/formatBytes.ts';
import {
  addThumbnail,
  generateThumbnail,
  removeThumbnail,
  type ReadyThumbnail,
  type Thumbnail,
} from '../../features/thumbnail.ts';

const fileKey = (file: File) => `${file.name}:${file.size}`;

export function MediaForm({ onUpload, onClose }: { onUpload: (files: ReadyThumbnail[]) => void; onClose: () => void }) {
  const [items, setItems] = useState<Thumbnail[]>([]);
  const ownedIds = useRef(new Set<string>());
  const readyItems = items.flatMap((item) => (item.kind === 'ready' ? [item] : []));
  const isGenerating = items.some((item) => item.kind === 'generating');

  useEffect(() => {
    const ids = ownedIds.current;
    return () => {
      for (const id of ids) removeThumbnail(id);
      ids.clear();
    };
  }, []);

  function addFiles(files: File[]) {
    const keys = new Set(items.map((item) => fileKey(item.file)));
    const added = files
      .filter((file) => {
        const key = fileKey(file);
        if (keys.has(key)) return false;
        keys.add(key);
        return true;
      })
      .map(addThumbnail);

    for (const item of added) ownedIds.current.add(item.id);
    setItems((current) => [...current, ...added]);

    for (const item of added) {
      void generateThumbnail(item, (updated) => {
        setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      });
    }
  }

  function remove(id: string) {
    removeThumbnail(id);
    ownedIds.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const selected = readyItems.filter((item) => ownedIds.current.has(item.id));
    if (isGenerating || selected.length === 0) return;
    onUpload(selected);
    for (const item of selected) ownedIds.current.delete(item.id);
    onClose();
  };

  return (
    <form className='flex flex-col gap-4 p-6' onSubmit={handleSubmit}>
      <h2 id='upload-dialog-title' className='m-0 text-xl'>
        Upload media
      </h2>

      <DndUpload
        onFiles={addFiles}
        accept='image/jpeg,image/png,image/webp'
        className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center transition-colors outline-offset-2 hover:border-slate-400 has-focus-visible:outline-2 has-focus-visible:outline-slate-900 data-dragging:border-sky-500 data-dragging:bg-sky-50 motion-reduce:transition-none'
      >
        <svg
          aria-hidden='true'
          className='size-8 text-sky-600'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M7 18a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5' />
          <path d='M12 12v8m-3-5 3-3 3 3' />
        </svg>
        <span>
          Drag and drop files here or <span className='text-sky-700 underline underline-offset-2'>browse</span>
        </span>
        <span className='text-sm text-slate-600'>JPEG, PNG or WebP images, up to 10 MB each</span>
      </DndUpload>

      {items.length > 0 && (
        <ul className='m-0 flex max-h-60 list-none flex-col gap-2 overflow-y-auto p-0'>
          {items.map((item) => (
            <li key={item.id} className='flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm'>
              <div className='grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100'>
                {item.kind === 'ready' ? (
                  <img className='size-full object-contain' src={item.url} alt={`Thumbnail of ${item.file.name}`} />
                ) : (
                  <span className='px-1 text-center text-xs text-slate-500' aria-hidden='true'>
                    {item.kind === 'generating' ? 'Preparing…' : 'No preview'}
                  </span>
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='m-0 truncate' title={item.file.name}>
                  {item.file.name}
                </p>
                {item.kind === 'generating' && (
                  <p className='m-0 text-slate-600' role='status'>
                    Generating thumbnail…
                  </p>
                )}
                {item.kind === 'error' && (
                  <p className='m-0 text-red-700' role='alert'>
                    {item.message}
                  </p>
                )}
              </div>
              <span className='shrink-0 text-slate-600'>{formatBytes(item.file.size)}</span>
              <button
                type='button'
                aria-label={`Remove ${item.file.name} from selection`}
                className='grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                onClick={() => remove(item.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className='flex justify-end gap-2'>
        <button
          type='button'
          className='cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50'
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={readyItems.length === 0 || isGenerating}
          className='cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50'
        >
          {isGenerating ? 'Preparing previews…' : `Upload (${readyItems.length})`}
        </button>
      </div>
    </form>
  );
}
