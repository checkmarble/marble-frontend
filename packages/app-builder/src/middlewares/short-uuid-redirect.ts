import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

const LONG_FORM_UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// `/client-detail` objectId is a raw ingested id, not short-uuid encoded; the rest are fetch/RPC endpoints.
const SKIP_PREFIXES = ['/client-detail/', '/ressources/', '/oidc/', '/api/'];

// Redirect long-form UUIDs in the URL path to their canonical short form.
export const shortUUIDRedirectMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();

  if (request.method === 'GET') {
    const url = new URL(request.url);

    if (!SKIP_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      let changed = false;
      const rewritten = url.pathname
        .split('/')
        .map((segment) => {
          if (!LONG_FORM_UUID.test(segment)) return segment;
          try {
            const short = fromUUIDtoSUUID(segment);
            changed = true;
            return short;
          } catch {
            return segment;
          }
        })
        .join('/');

      if (changed) {
        return new Response(null, {
          status: 302,
          headers: { Location: rewritten + url.search + url.hash },
        });
      }
    }
  }

  return next();
});
