import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/core/queryClient.ts';
import { Route as rootRoute } from './routes/__root.tsx';
import { Route as indexRoute } from './routes/index.tsx';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
