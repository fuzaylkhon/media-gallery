# React + TypeScript + Vite

## Mock API

`src/mock-server/handlers.ts` defines MSW HTTP handlers for:

- `GET /api/media?page=1&type=image`: lists 12 items per page, optionally filtered by image or video.
- `POST /api/uploads`: accepts multipart form data with a `file` field and returns its URL.
- `DELETE /api/media/:id`: removes a media item and its uploaded file.
- `GET /uploads/:id`: returns the uploaded file bytes.

The handlers match any origin. Listing and deletion have a 15% simulated failure rate; uploads have a
20% failure rate. These operations retain the 500–1000 ms delay. Changes live in memory until the
process exits. OPTIONS requests return 204, and every other unmatched request returns JSON with 404.

Start the mock API and Vite together:

```sh
pnpm dev
```

`src/mock-server/server.ts` uses `@mswjs/http-middleware` to serve the handlers at
`http://127.0.0.1:3001`. Vite proxies `/api` and `/uploads` to that server, so React can use relative
URLs with Axios or fetch:

```ts
const { data } = await axios.get('/api/media', { params: { page: 1 } })
```

No browser service worker is used. The mock server's catch-all 404 handler only applies to requests
sent to the mock API, leaving Vite assets and external images unaffected.

Use `pnpm dev:api` or `pnpm dev:web` to run either process separately. The mock API uses Node's native
TypeScript support and watch mode. Stopping `pnpm dev` stops both processes; restarting the API resets
its in-memory records and uploads.

See the [`@mswjs/http-middleware` documentation](https://github.com/mswjs/http-middleware).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
