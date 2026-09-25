import { useState } from 'react';

type MediaLoadState = 'loading' | 'ready' | 'failed';

export function useMediaLoadState() {
  const [status, setStatus] = useState<MediaLoadState>('loading');

  return {
    status,
    onReady: () => setStatus('ready'),
    onError: () => setStatus('failed'),
  };
}
