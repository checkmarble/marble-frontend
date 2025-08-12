import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { resources } from '@app-builder/services/i18n/resources/resources.server';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { cacheHeader } from 'pretty-cache-header';
import { z } from 'zod/v4';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const lng = z.enum(supportedLngs).parse(url.searchParams.get('lng'));

  const namespaces = resources[lng];

  const ns = z
    .string()
    .refine((key): key is keyof typeof namespaces => Object.keys(namespaces).includes(String(key)))
    .parse(url.searchParams.get('ns'));

  const headers = new Headers();

  // On production, we want to add cache headerlocals to the response

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

  return json(namespaces[ns as keyof typeof namespaces], { headers });
}
