import { z } from 'zod';
import type { InfiniteData } from '@tanstack/react-query';

export const mediaItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['image', 'video']),
  size: z.number().nonnegative(),
  createdAt: z.iso.datetime(),
  thumbnailUrl: z.url(),
  sourceUrl: z.url(),
  mimeType: z.string(),
  sizeIsSimulated: z.boolean(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;
export type MediaType = MediaItem['type'];
export type MediaFilter = MediaType | 'all';

export interface MediaPage {
  items: MediaItem[];
  nextPage: number | null;
  total: number;
}

export type MediaCache = InfiniteData<MediaPage, number>;