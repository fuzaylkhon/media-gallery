import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import type { MediaFilter } from '../services/media/types.ts';
import { MediaGallery } from './-components/MediaGallery.tsx';

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
];

const searchSchema = z.object({
  type: z.enum(['all', 'image', 'video']).default('all').catch('all'),
});

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: MediaGalleryPage,
});

function MediaGalleryPage() {
  const { type } = Route.useSearch();

  return (
    <div className='w-full h-full px-20'>
      <header className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h1>Media gallery</h1>
        <div className='flex gap-4 items-center'>
          <nav className='flex gap-1 rounded-full bg-slate-100 p-1' aria-label='Media type'>
            {FILTERS.map((filter) => (
              <Link
                key={filter.value}
                to='/'
                search={{ type: filter.value }}
                className='rounded-full px-3.5 py-1.5 text-slate-700 no-underline '
                style={{
                  background: filter.value === type ? 'white' : undefined,
                }}
              >
                {filter.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <MediaGallery type={type} />
    </div>
  );
}
