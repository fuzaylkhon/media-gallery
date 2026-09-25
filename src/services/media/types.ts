export type MediaType = 'image' | 'video';
export type MediaFilter = MediaType | 'all';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  size: number;
  createdAt: string;
  thumbnailUrl: string;
  sourceUrl: string;
  mimeType: string;
  sizeIsSimulated: boolean;
}

export interface MediaPage {
  items: MediaItem[];
  nextPage: number | null;
  total: number;
}
