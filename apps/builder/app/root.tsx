import { Tooltip } from '@marble-front/ui/design-system';
import type { MetaFunction, LinksFunction, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { remixI18next } from './config/i18n/i18next.server';

import tailwindStyles from './tailwind.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'stylesheet', href: '/fonts/Inter/inter.css' },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/favicons/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicons/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicons/favicon-16x16.png',
  },
  { rel: 'manifest', href: '/site.webmanifest' },
  { rel: 'icon', href: '/favicon.ico' },
];

export const loader = async ({ request }: LoaderArgs) => {
  const locale = await remixI18next.getLocale(request);

  return json({
    /**
     * Browser env vars :
     * - define browser env vars here
     * - access it using window.ENV.MY_ENV_VAR
     * https://remix.run/docs/en/v1/guides/envvars#browser-environment-variables
     */
    ENV: {},
    locale,
  });
};

export const handle = {
  i18n: ['common', 'navigation'] as const,
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Marble',
  viewport: 'width=device-width,initial-scale=1',
});

export default function App() {
  const { locale, ENV } = useLoaderData<typeof loader>();

  const { i18n } = useTranslation(handle.i18n);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-screen w-full overflow-hidden antialiased">
        <Tooltip.Provider>
          <Outlet />
        </Tooltip.Provider>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
