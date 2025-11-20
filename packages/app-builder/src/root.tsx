import { type LinksFunction, type MetaFunction } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type ShouldRevalidateFunctionArgs,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useRouteError,
  useRouteLoaderData,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next/react';
import { ClientOnly } from 'remix-utils/client-only';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';
import { ExternalScripts } from 'remix-utils/external-scripts';
import { Tooltip } from 'ui-design-system';
import { iconsSVGSpriteHref, Logo, logosSVGSpriteHref } from 'ui-icons';
import { ErrorComponent } from './components/ErrorComponent';
import { getToastMessage, MarbleToaster } from './components/MarbleToaster';
import { AgnosticNavigationContext } from './contexts/AgnosticNavigationContext';
import { AppConfigContext } from './contexts/AppConfigContext';
import { LoaderRevalidatorContext } from './contexts/LoaderRevalidatorContext';
import { HeaderEntry } from './core/middleware-types';
import { createServerFn, data } from './core/requests';
import { useSegmentPageTracking } from './services/segment';
import { SegmentScript } from './services/segment/SegmentScript';
import { getSegmentScript } from './services/segment/segment.server';
import tailwindStyles from './tailwind.css?url';
import { getClientEnvVars, getServerEnv } from './utils/environment';
import { useNonce } from './utils/nonce';
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

export const loader = createServerFn([], async function loader({ request, context }) {
  const { i18nextService, toastSessionService, csrfService, appConfigRepository } = context.services;

  const [locale, toastSession, [csrfToken, csrfCookieHeader]] = await Promise.all([
    i18nextService.getLocale(request),
    toastSessionService.getSession(request),
    csrfService.commitToken(request),
  ]);

  const toastMessage = getToastMessage(toastSession);

  const ENV = getClientEnvVars();

  const headers: HeaderEntry[] = [['set-cookie', await toastSessionService.commitSession(toastSession)]];
  if (csrfCookieHeader) {
    headers.push(['set-cookie', csrfCookieHeader]);
  }

  const segmentApiKey = getServerEnv('SEGMENT_WRITE_KEY');
  const disableSegment = getServerEnv('DISABLE_SEGMENT') ?? false;
  const appConfig = await appConfigRepository.getAppConfig();

  const segmentScript = !disableSegment && segmentApiKey ? getSegmentScript(segmentApiKey) : undefined;

  return data({ ENV, locale, csrf: csrfToken, toastMessage, segmentScript, appConfig }, headers);
});

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

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>('root');

  const { i18n } = useTranslation();
  const nonce = useNonce();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  useSegmentPageTracking();

  return (
    <html lang={loaderData?.locale ?? 'en'} dir={i18n.dir()}>
      <head>
        <Meta />
        {/* <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" /> */}
        <Links />
        {loaderData?.segmentScript ? <SegmentScript nonce={nonce} script={loaderData.segmentScript} /> : null}
        <ExternalScripts />
      </head>
      <body className="selection:text-grey-100 selection:bg-purple-65 h-screen w-full overflow-hidden antialiased">
        <LoaderRevalidatorContext.Provider value={revalidator.revalidate}>
          <AgnosticNavigationContext.Provider value={navigate}>
            <AuthenticityTokenProvider token={loaderData?.['csrf'] ?? ''}>
              <Tooltip.Provider>{children}</Tooltip.Provider>
            </AuthenticityTokenProvider>
            <script
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `window.ENV = ${JSON.stringify(loaderData?.ENV ?? {})}`,
              }}
            />
            <ScrollRestoration nonce={nonce} />
            <Scripts nonce={nonce} />
            <ClientOnly>{() => <MarbleToaster toastMessage={loaderData?.toastMessage} />}</ClientOnly>
          </AgnosticNavigationContext.Provider>
        </LoaderRevalidatorContext.Provider>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return (
    <div className="from-purple-96 to-grey-98 flex size-full flex-col items-center bg-linear-to-r">
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
        <div className="bg-grey-100 mb-10 flex shrink-0 rounded-2xl p-10 text-center shadow-md">
          <ErrorComponent error={error} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const { locale, appConfig } = useLoaderData<typeof loader>();

  useChangeLanguage(locale);

  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigContext.Provider value={appConfig}>
        <Outlet />
      </AppConfigContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default withSentry(App);

export function shouldRevalidate({ defaultShouldRevalidate, nextUrl }: ShouldRevalidateFunctionArgs) {
  // Revalidate when navigating to the sign-in page to ensure a fresh CSRF token
  if (nextUrl.pathname === getRoute('/sign-in')) {
    return true;
  }

  return defaultShouldRevalidate;
}
