import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { resources } from '@app-builder/services/i18n/resources/resources';
import { createFileRoute } from '@tanstack/react-router';
import { cacheHeader } from 'pretty-cache-header';
import { z } from 'zod/v4';

export const Route = createFileRoute('/ressources/locales')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        const lng = z.enum(supportedLngs).parse(url.searchParams.get('lng'));

        const namespaces = resources[lng];

        const ns = z
          .string()
          .refine((key): key is keyof typeof namespaces => Object.keys(namespaces).includes(String(key)))
          .parse(url.searchParams.get('ns'));

        const headers = new Headers();

        if (process.env.NODE_ENV === 'production') {
          headers.set(
            'Cache-Control',
            cacheHeader({
              maxAge: '1d',
              staleWhileRevalidate: '7d',
              staleIfError: '7d',
            }),
          );
        }

        return Response.json(namespaces[ns as keyof typeof namespaces], { headers });
      },
    },
  },
});
