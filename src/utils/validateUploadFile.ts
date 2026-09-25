export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateUploadFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (file.size > MAX_FILE_SIZE) return 'Image exceeds the 10 MB limit.';
  return null;
}
