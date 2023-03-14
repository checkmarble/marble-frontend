import { useEffect } from 'react';
import { Tooltip } from '@marble-front/ui/design-system';
import {
  json,
  type MetaFunction,
  type LinksFunction,
  type LoaderArgs,
} from '@remix-run/node';
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
import { getToastMessage, MarbleToaster } from './components/MarbleToaster';
import { commitSession, getSession } from './services/auth/session.server';

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

  const session = await getSession(request.headers.get('cookie'));
  const toastMessage = getToastMessage(session);

  return json(
    {
      /**
       * Browser env vars :
       * - define browser env vars here
       * - access it using window.ENV.MY_ENV_VAR
       * https://remix.run/docs/en/v1/guides/envvars#browser-environment-variables
       */
      ENV: {},
      locale,
      toastMessage,
    },
    {
      headers: { 'Set-Cookie': await commitSession(session) },
    }
  );
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
  const { locale, ENV, toastMessage } = useLoaderData<typeof loader>();

  const { i18n } = useTranslation(handle.i18n);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="selection:text-grey-00 h-screen w-full overflow-hidden antialiased selection:bg-purple-100">
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
        <MarbleToaster toastMessage={toastMessage} />
      </body>
    </html>
  );
}
