import { delay, http, HttpResponse } from 'msw';
// @ts-ignore
import seed from './media.json' with { type: 'json' };

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateUploadFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (file.size > MAX_FILE_SIZE) return 'Image exceeds the 10 MB limit.';
  return null;
}


type MediaItem = {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  createdAt: string;
  thumbnailUrl: string;
  sourceUrl: string;
  mimeType: string;
  sizeIsSimulated: boolean;
};

let records: MediaItem[] = seed.map((item) => {
  if (item.type !== 'image' && item.type !== 'video') throw new Error('Invalid fixture type');
  return { ...item, type: item.type };
});
const uploads = new Map<string, File>();
const latency = () => delay(500 + Math.floor(Math.random() * 501));
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

export const handlers = [
  http.options('*', () => new HttpResponse(null, { status: 204, headers })),

  http.get('*/api/media', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const type = url.searchParams.get('type');
    if (!Number.isSafeInteger(page) || page < 1 || (type !== null && type !== 'image' && type !== 'video')) {
      return HttpResponse.json({ message: 'Invalid page or media type' }, { status: 400, headers });
    }
    await latency();
    if (Math.random() < 0.15) {
      return HttpResponse.json({ message: 'Failed to fetch media' }, { status: 503, headers });
    }
    const filtered = records.filter((item) => type === null || item.type === type);
    const start = (page - 1) * 12;
    return HttpResponse.json(
      {
        items: filtered.slice(start, start + 12),
        nextPage: start + 12 < filtered.length ? page + 1 : null,
        total: filtered.length,
      },
      { headers }
    );
  }),

  http.post('*/api/uploads', async ({ request }) => {
    let file: FormDataEntryValue | null;
    try {
      file = (await request.formData()).get('file');
    } catch {
      return HttpResponse.json({ message: 'Expected multipart form data' }, { status: 400, headers });
    }
    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'A file is required' }, { status: 400, headers });
    }
    const validationError = validateUploadFile(file);
    if (validationError) {
      return HttpResponse.json({ message: validationError }, { status: 400, headers });
    }
    await latency();
    if (Math.random() < 0.2) {
      return HttpResponse.json({ message: 'Failed to upload file' }, { status: 500, headers });
    }
    const id = `upload-${crypto.randomUUID()}`;
    const assetUrl = new URL(`/uploads/${id}`, request.url).href;
    uploads.set(id, file);
    const media: MediaItem = {
      id,
      name: file.name,
      type: 'image',
      size: file.size,
      createdAt: new Date().toISOString(),
      thumbnailUrl: assetUrl,
      sourceUrl: assetUrl,
      mimeType: file.type || 'application/octet-stream',
      sizeIsSimulated: false,
    };
    records.unshift(media);
    return HttpResponse.json(media, { status: 201, headers });
  }),

  http.delete<{ id: string }>('*/api/media/:id?', async ({ params }) => {
    const { id } = params;
    if (!id) {
      return HttpResponse.json({ message: 'A media ID is required' }, { status: 400, headers });
    }
    await latency();
    if (Math.random() < 0.15) {
      return HttpResponse.json({ message: 'Failed to delete media' }, { status: 503, headers });
    }
    records = records.filter((item) => item.id !== id);
    uploads.delete(id);
    return new HttpResponse(null, { status: 204, headers });
  }),

  http.get<{ id: string }>('*/uploads/:id', async ({ params }) => {
    const file = uploads.get(params.id);
    if (!file) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404, headers });
    }
    return new HttpResponse(await file.arrayBuffer(), {
      headers: {
        ...headers,
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': String(file.size),
      },
    });
  }),

  http.all('*', () => HttpResponse.json({ message: 'Not found' }, { status: 404, headers })),
];
