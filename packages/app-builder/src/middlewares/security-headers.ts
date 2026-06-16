import { getContentSecurityPolicy, runWithSecurityHeadersStore } from '@app-builder/utils/security-headers.server';
import { createMiddleware } from '@tanstack/react-start';

// Generates the per-request CSP nonce and applies security headers to every
// document response.
//
// The nonce is opened into the request-scoped store here (before `next()`) so the
// router (`router.tsx` → `ssr.nonce`) and the root loader (which builds the CSP)
// all share the same value. After the render, we read the CSP the loader published
// into the store and set it on the real document `Response` — TanStack Start does
// not merge server-fn `setResponseHeaders` into successful document responses.
// See `utils/security-headers.server.ts` for the full rationale.
export const securityHeadersMiddleware = createMiddleware().server(({ next }) => {
  const nonce = crypto.randomUUID().replace(/-/g, '');

  return runWithSecurityHeadersStore(nonce, async () => {
    const result = await next();

    const csp = getContentSecurityPolicy();
    if (csp && !result.response.headers.has('content-security-policy')) {
      result.response.headers.set('Content-Security-Policy', csp);
    }
    // Redundant with the CSP `frame-ancestors 'none'`, kept for older clients/scanners.
    if (!result.response.headers.has('x-frame-options')) {
      result.response.headers.set('X-Frame-Options', 'DENY');
    }

    return result;
  });
});
