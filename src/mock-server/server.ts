import { createServer } from '@mswjs/http-middleware';
import { handlers } from './handlers.ts';

export const server = createServer(...handlers);

server.listen(3001, '127.0.0.1', () => {
  console.info('Mock API listening on http://127.0.0.1:3001');
});
