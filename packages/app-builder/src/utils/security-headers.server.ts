import { AsyncLocalStorage } from 'node:async_hooks';

// Request-scoped storage for the per-request CSP nonce and the built CSP string.
//
// Why an AsyncLocalStorage and not the H3 event / response headers:
//   - The CSP is built in the root loader (`server-fns/root.ts`) — the only place
//     with both `appConfig` and the render nonce. But the loader runs as a
//     `createServerFn`, which TanStack Start executes in its OWN H3 event scope, so
//     headers it sets via `setResponseHeaders` never reach the streamed document.
//   - The nonce must also be handed to `router.options.ssr.nonce` (see router.tsx)
//     so TanStack Start stamps it onto the hydration scripts it injects via
//     `<Scripts>` — otherwise an enforced CSP blocks them and hydration dies. This
//     regressed in the Remix → TanStack migration (Remix's `<Scripts nonce>` did it).
//
// The request middleware (`middlewares/security-headers.ts`) opens this store around
// `next()`. Everything rendered for the request — `getRouter()`, the root loader, the
// response-header pass — runs inside that scope and shares one nonce. It is a separate
// ALS instance from TanStack's, so the server-fn event scoping does not disturb it.
const storage = new AsyncLocalStorage<{ nonce: string; csp?: string }>();

export function runWithSecurityHeadersStore<T>(nonce: string, fn: () => T): T {
  return storage.run({ nonce }, fn);
}

export function getRequestNonce(): string | undefined {
  return storage.getStore()?.nonce;
}

export function setContentSecurityPolicy(csp: string): void {
  const store = storage.getStore();
  if (store) store.csp = csp;
}

export function getContentSecurityPolicy(): string | undefined {
  return storage.getStore()?.csp;
}
