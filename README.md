# Media Gallery

A React and TypeScript single-page gallery for browsing, filtering, uploading, previewing, and deleting photos.

## Run locally

Requirements: Node.js 22.18 or newer and pnpm 10.

```sh
pnpm install
pnpm dev
```

## Mock API

The mock is a small Node HTTP server using MSW handlers in `mock-server/`. List and delete requests take 500–1000 ms and fail about 15% of the time; uploads fail about 20% of the time.

Uploads accept JPEG, PNG, and WebP files up to 10 MB. Successful uploads are stored in memory and exposed from `/uploads`; the mock returns the created media item with its server ID and URL fields.

The standalone HTTP mock is intentionally simple to replace with a real API: the React code calls the media service layer, and mock transport details stay under `mock-server/`.

## Libraries and why they are used

| Library                                                                                     | Purpose here                                                                        | Why use it; what would be lost without it                                                                                                                                     |
|---------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MSW and @mswjs/http-middleware                                                              | HTTP-level local mock API                                                           | The app exercises real request/response behavior without a backend. Without it, mock behavior would have to be coupled to UI code or a separate custom server implementation. |
| TanStack Router                                                                             | Route and URL search state for the media filter                                     | The selected filter is shareable and survives refresh. Without it, URL parsing, validation, and history synchronization would be custom code.                                 |
| TanStack Query                                                                              | Server cache, infinite pages, request cancellation, mutations                       | It manages pagination, cache identity, and optimistic updates. Without it, caching, race handling, and rollback would be bespoke.                                             |
| Axios                                                                                       | HTTP requests and upload byte progress                                              | Its progress events support per-file upload progress. Without it, request handling and progress tracking would use lower-level browser APIs.                                  |
| Zod                                                                                         | Runtime validation of external data and URL search values                           | It checks data at untyped boundaries. Without it, TypeScript annotations alone would not validate JSON at runtime.                                                            |
| Tailwind CSS and its Vite plugin                                                            | Utility styling                                                                     | They keep component styling close to markup. Without them, styles would be written in plain CSS or CSS modules.                                                               |
| TanStack Query and Router devtools + plugin                                                 | Inspect query cache and route state during development                              | They help diagnose paging and URL state. Without them, those states would be inspected manually.                                                                              |
| concurrently                                                                                | Start mock API and Vite from one command                                            | It keeps local startup simple. Without it, developers would open two terminals.                                                                                               |
| ESLint, typescript-eslint, React Hooks/Refresh plugins, globals, and eslint-config-prettier | Lint TypeScript and React code with browser globals and consistent formatting rules | They catch common mistakes and keep lint output useful. Without them, checks would be manual.                                                                                 |
| Prettier                                                                                    | Format source and configuration                                                     | It keeps formatting consistent. Without it, formatting would be manual.                                                                                                       |
| Type declaration packages (@types/react, @types/react-dom, @types/node, @types/babel__core) | TypeScript declarations for runtime and build-tool APIs                             | They let TypeScript understand those JavaScript packages. Without them, application and config types would be missing or weaker.                                              |

## Architecture and trade-offs

The URL is the source for the selected filter. TanStack Query keys include the filter, so changing it selects a separate cache entry;

Upload selection, local preview, progress, cancellation, and retry state are client state. Canvas thumbnail generation uses `createImageBitmap` and `toBlob` asynchronously. Object URLs are revoked when entries are removed or their owning UI is cleaned up.

The mock uses random failures to exercise UI states.

With more time, I would add keyboard and screen-reader checks, add sorting by date and size and video upload support.

## Demo video

Loom link: https://www.loom.com/share/736c68c773f249c2adb900a103c2c35c
