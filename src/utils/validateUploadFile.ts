export const MAX_FILE_SIZE = 10_000_000;
export const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateUploadFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return 'Choose a JPEG, PNG, or WebP image.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image exceeds the 10 MB limit.';
  }
  return null;
}
