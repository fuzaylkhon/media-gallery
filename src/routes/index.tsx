import { useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import type { MediaFilter } from '../services/media/types.ts';
import { Route as rootRoute } from './__root.tsx';
import { MediaGallery } from './-components/MediaGallery.tsx';
import { MediaForm } from './-components/MediaForm.tsx';
import { Modal } from '../components/Modal.tsx';
import { useUploads } from './-hooks/useUploads.ts';

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
];

const searchSchema = z.object({
  type: z.enum(['all', 'image', 'video']).default('all').catch('all'),
});

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: searchSchema,
  component: MediaGalleryPage,
});

function MediaGalleryPage() {
  const { type } = Route.useSearch();
  const [uploadOpen, setUploadOpen] = useState(false);
  const uploads = useUploads();

  return (
    <div className='w-full h-full px-4 mt-5 sm:px-8 lg:px-20'>
      <header className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h1>Media gallery</h1>
        <div className='flex min-w-0 flex-wrap items-center gap-3'>
          <nav className='flex gap-1 rounded-full bg-slate-100 p-1' aria-label='Media type'>
            {FILTERS.map((filter) => (
              <Link
                key={filter.value}
                to='/'
                search={{ type: filter.value }}
                className='rounded-full px-3.5 py-1.5 text-slate-700 no-underline '
                aria-current={filter.value === type ? 'page' : undefined}
                style={{
                  background: filter.value === type ? 'white' : undefined,
                }}
              >
                {filter.label}
              </Link>
            ))}
          </nav>
          <button
            type='button'
            className='cursor-pointer rounded-full bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-700'
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </button>
        </div>
      </header>
      <MediaGallery type={type} uploads={uploads} />
      <Modal
        open={uploadOpen}
        labelledBy='upload-dialog-title'
        className='w-[min(32rem,calc(100vw_-_2rem))]'
        onClose={() => setUploadOpen(false)}
      >
        <MediaForm onUpload={uploads.addFiles} onClose={() => setUploadOpen(false)} />
      </Modal>
    </div>
  );
}
