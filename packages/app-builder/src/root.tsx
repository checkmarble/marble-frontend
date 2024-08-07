import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type ShouldRevalidateFunctionArgs,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next/react';
import { ClientOnly } from 'remix-utils/client-only';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';
import { ExternalScripts } from 'remix-utils/external-scripts';
import { Tooltip } from 'ui-design-system';
import { iconsSVGSpriteHref, Logo, logosSVGSpriteHref } from 'ui-icons';

import { ErrorComponent } from './components/ErrorComponent';
import { getToastMessage, MarbleToaster } from './components/MarbleToaster';
import { serverServices } from './services/init.server';
import { useSegmentPageTracking } from './services/segment';
import { getSegmentScript } from './services/segment/segment.server';
import { SegmentScript } from './services/segment/SegmentScript';
import tailwindStyles from './tailwind.css?url';
import { getClientEnvVars, getServerEnv } from './utils/environment';
import { getRoute } from './utils/routes';

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

export async function loader({ request }: LoaderFunctionArgs) {
  const { i18nextService, toastSessionService, csrfService, licenseService } =
    serverServices;
  const locale = await i18nextService.getLocale(request);

  const [toastSession, [csrfToken, csrfCookieHeader]] = await Promise.all([
    toastSessionService.getSession(request),
    csrfService.commitToken(request),
    licenseService.getLicenseEntitlements(),
  ]);

  const toastMessage = getToastMessage(toastSession);

  const ENV = getClientEnvVars();

  const headers = new Headers();
  headers.append(
    'set-cookie',
    await toastSessionService.commitSession(toastSession),
  );
  if (csrfCookieHeader) headers.append('set-cookie', csrfCookieHeader);

  const segmentApiKey = getServerEnv('SEGMENT_WRITE_KEY');

  return json(
    {
      ENV,
      locale,
      csrf: csrfToken,
      toastMessage,
      segmentScript: segmentApiKey
        ? getSegmentScript(segmentApiKey)
        : undefined,
    },
    {
      headers,
    },
  );
}

export const handle = {
  i18n: ['common', 'navigation'] satisfies Namespace,
};

export const meta: MetaFunction = () => [
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
        <div className="from-purple-10 to-grey-02 flex size-full flex-col items-center bg-gradient-to-r">
          <div className="flex size-full flex-col items-center bg-no-repeat">
            <div className="flex h-full max-h-80 flex-col justify-center">
              <Link to={getRoute('/sign-in')}>
                <Logo
                  logo="logo-standard"
                  className="h-10 w-auto text-[#080525]"
                  preserveAspectRatio="xMinYMid meet"
                  aria-labelledby="marble"
                />
              </Link>
            </div>
            <div className="bg-grey-00 mb-10 flex shrink-0 rounded-2xl p-10 text-center shadow-md">
              <ErrorComponent error={error} />
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  const { locale, ENV, toastMessage, csrf, segmentScript } =
    useLoaderData<typeof loader>();

  const { i18n } = useTranslation(handle.i18n);

  useChangeLanguage(locale);

  useSegmentPageTracking();

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
        {segmentScript ? <SegmentScript script={segmentScript} /> : null}
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
        <ClientOnly>
          {() => <MarbleToaster toastMessage={toastMessage} />}
        </ClientOnly>
      </body>
    </html>
  );
}

export default withSentry(App);

export function shouldRevalidate({
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  // Revalidate when navigating to the sign-in page to ensure a fresh CSRF token
  if (nextUrl.pathname === getRoute('/sign-in')) {
    return true;
  }

  return defaultShouldRevalidate;
}
