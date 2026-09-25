import { validateUploadFile } from '../utils/validateUploadFile.ts';

export type Thumbnail = {
  id: string;
  file: File;
} & ({ kind: 'generating' } | { kind: 'ready'; url: string } | { kind: 'error'; message: string });

export type ReadyThumbnail = Extract<Thumbnail, { kind: 'ready' }>;

const thumbnails = new Map<string, Thumbnail>();

export async function createThumbnail(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, 200 / bitmap.width, 200 / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not generate thumbnail.'));
      }, 'image/png');
    });
  } finally {
    bitmap.close();
  }
}

export function addThumbnail(file: File): Thumbnail {
  const error = validateUploadFile(file);
  const id = crypto.randomUUID();
  const item: Thumbnail = error ? { id, file, kind: 'error', message: error } : { id, file, kind: 'generating' };

  thumbnails.set(id, item);
  return item;
}

export async function generateThumbnail(item: Thumbnail, onUpdate: (updated: Thumbnail) => void): Promise<void> {
  if (item.kind !== 'generating' || thumbnails.get(item.id) !== item) return;

  let updated: Thumbnail;
  try {
    const blob = await createThumbnail(item.file);
    if (thumbnails.get(item.id) !== item) return;

    updated = { id: item.id, file: item.file, kind: 'ready', url: URL.createObjectURL(blob) };
  } catch (error) {
    if (thumbnails.get(item.id) !== item) return;

    updated = {
      id: item.id,
      file: item.file,
      kind: 'error',
      message: error instanceof Error ? error.message : 'Could not generate thumbnail.',
    };
  }

  thumbnails.set(item.id, updated);
  onUpdate(updated);
}

export function removeThumbnail(id: string): void {
  const item = thumbnails.get(id);
  thumbnails.delete(id);
  if (item?.kind === 'ready') URL.revokeObjectURL(item.url);
}
