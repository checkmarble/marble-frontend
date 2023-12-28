import {
  json,
  type LinksFunction,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AuthenticityTokenProvider,
  ClientOnly,
  createAuthenticityToken,
  ExternalScripts,
} from 'remix-utils';
import { Tooltip } from 'ui-design-system';
import { iconsSVGSpriteHref, Logo, logosSVGSpriteHref } from 'ui-icons';

import { ErrorComponent } from './components/ErrorComponent';
import { getToastMessage, MarbleToaster } from './components/MarbleToaster';
import { serverServices } from './services/init.server';
import { useSegmentPageTracking } from './services/segment';
import { getSegmentScript } from './services/segment/segment.server';
import { SegmentScript } from './services/segment/SegmentScript';
import tailwindStyles from './tailwind.css';
import { getClientEnvVars } from './utils/environment.server';

export const links: LinksFunction = () => [
  { rel: 'preload', href: logosSVGSpriteHref, as: 'image' },
  { rel: 'preload', href: iconsSVGSpriteHref, as: 'image' },
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
  const { i18nextService, toastSessionService, csrfSessionService } =
    serverServices;
  const locale = await i18nextService.getLocale(request);

  const toastSession = await toastSessionService.getSession(request);
  const csrfSession = await csrfSessionService.getSession(request);

  const toastMessage = getToastMessage(toastSession);
  const csrf = createAuthenticityToken(csrfSession);

  const ENV = getClientEnvVars();

  return json(
    {
      ENV,
      locale,
      csrf,
      toastMessage,
      segmentScript: getSegmentScript(),
    },
    {
      headers: [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
        ['Set-Cookie', await csrfSessionService.commitSession(csrfSession)],
      ],
    },
  );
};

export const handle = {
  i18n: ['common', 'navigation'] satisfies Namespace,
};

export const meta: V2_MetaFunction = () => [
  {
    charset: 'utf-8',
  },
  {
    title: 'Marble',
  },
  {
    name: 'viewport',
    content: 'width=device-width,initial-scale=1',
  },
];

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="selection:text-grey-00 h-screen w-full overflow-hidden antialiased selection:bg-purple-100">
        <div className="from-purple-10 to-grey-02 flex h-full w-full flex-col items-center bg-gradient-to-r">
          <div className="flex h-full w-full flex-col items-center bg-[url('/img/login_background.svg')] bg-no-repeat">
            <div className="flex h-full max-h-80 flex-col justify-center">
              <a href="/login">
                <Logo
                  logo="logo-standard"
                  className="h-10 w-auto"
                  preserveAspectRatio="xMinYMid meet"
                  aria-labelledby="marble"
                />
              </a>
            </div>
            <div className="bg-grey-00 mb-10 flex shrink-0 rounded-2xl p-10 text-center shadow-md">
              <ErrorComponent error={error} />
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  const { locale, ENV, toastMessage, csrf, segmentScript } =
    useLoaderData<typeof loader>();

  const { i18n } = useTranslation(handle.i18n);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useSegmentPageTracking();

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
        <SegmentScript script={segmentScript} />
        <ExternalScripts />
      </head>
      <body className="selection:text-grey-00 h-screen w-full overflow-hidden antialiased selection:bg-purple-100">
        <AuthenticityTokenProvider token={csrf}>
          <Tooltip.Provider>
            <Outlet />
          </Tooltip.Provider>
        </AuthenticityTokenProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <ClientOnly>
          {() => <MarbleToaster toastMessage={toastMessage} />}
        </ClientOnly>
      </body>
    </html>
  );
}

export default withSentry(App);
