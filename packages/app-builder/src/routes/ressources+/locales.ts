import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { resources } from '@app-builder/services/i18n/resources/resources.server';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { cacheHeader } from 'pretty-cache-header';
import { z } from 'zod';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const lng = z.enum(supportedLngs).parse(url.searchParams.get('lng'));

  const namespaces = resources[lng];

  const ns = z
    .string()
    .refine((ns): ns is keyof typeof namespaces => {
      return Object.keys(resources[lng]).includes(ns);
    })
    .parse(url.searchParams.get('ns'));

  const headers = new Headers();

  // On production, we want to add cache headerlocals to the response
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Cache-Control',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      cacheHeader({
        maxAge: '1d',
        staleWhileRevalidate: '7d',
        staleIfError: '7d',
      }),
    );
  }

  return json(namespaces[ns], { headers });
}
