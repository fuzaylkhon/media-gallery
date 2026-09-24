import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/')({
  component: MediaGalleryPage,
});

function MediaGalleryPage() {
  return <div style={{ width: '100%' }}>Main Gallery Page</div>;
}
