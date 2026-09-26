import { z } from 'zod';
import type { InfiniteData } from '@tanstack/react-query';

export const mediaItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['image', 'video']),
  size: z.number().nonnegative(),
  createdAt: z.iso.datetime(),
  thumbnailUrl: z.url(),
  sourceUrl: z.url().optional(),
  mimeType: z.string().optional(),
  sizeIsSimulated: z.boolean().optional(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;
export type MediaType = MediaItem['type'];
export type MediaFilter = MediaType | 'all';

export const mediaPageSchema = z.object({
  items: z.array(mediaItemSchema),
  nextPage: z.number().int().positive().nullable(),
  total: z.number().int().nonnegative(),
});

export type MediaPage = z.infer<typeof mediaPageSchema>;

export type MediaCache = InfiniteData<MediaPage, number>;
