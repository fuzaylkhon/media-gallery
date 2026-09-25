import { type FormEvent, useState } from 'react';
import { DndUpload } from '../../components/DndUpload.tsx';
import { formatBytes } from '../-utils/formatBytes.ts';
import { useUploadMedia } from '../../services/media/useUploadMedia.ts';

const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

export function MediaForm({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const upload = useUploadMedia();

  const addFiles = (added: File[]) =>
    setFiles((prev) => {
      const keys = new Set(prev.map(fileKey));
      return [...prev, ...added.filter((file) => !keys.has(fileKey(file)))];
    });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    upload.mutate(files, {
      onSuccess: (failed) => {
        if (failed.length === 0) return onClose();
        // Keep failed files plus any added while uploading.
        setFiles((prev) => prev.filter((file) => failed.includes(file) || !files.includes(file)));
      },
    });
  };

  return (
    <form className='flex flex-col gap-4 p-6' onSubmit={handleSubmit}>
      <h2 className='m-0 text-xl'>Upload media</h2>

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
        <span className='text-sm text-slate-600'>Images and videos</span>
      </DndUpload>

      {files.length > 0 && (
        <ul className='m-0 flex max-h-60 list-none flex-col gap-2 overflow-y-auto p-0'>
          {files.map((file) => (
            <li
              key={fileKey(file)}
              className='flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm'
            >
              <span className='min-w-0 flex-1 truncate' title={file.name}>
                {file.name}
              </span>
              <span className='shrink-0 text-slate-600'>{formatBytes(file.size)}</span>
              <button
                type='button'
                className='grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                onClick={() => setFiles((prev) => prev.filter((f) => f !== file))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {(upload.data?.length ?? 0) > 0 && (
        <p className='m-0 text-sm text-red-700' role='alert'>
          {upload.data?.length} file(s) failed to upload. Try again.
        </p>
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
          disabled={files.length === 0 || upload.isPending}
          className='cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50'
        >
          {upload.isPending ? 'Uploading…' : `Upload${files.length > 0 ? ` (${files.length})` : ''}`}
        </button>
      </div>
    </form>
  );
}
