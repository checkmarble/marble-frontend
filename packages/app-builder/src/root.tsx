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
  useLocation,
  useMatches,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AuthenticityTokenProvider,
  createAuthenticityToken,
  useHydrated,
} from 'remix-utils';
import { Tooltip } from 'ui-design-system';
import { LogoStandard } from 'ui-icons';

import { ErrorComponent } from './components/ErrorComponent';
import { getToastMessage, MarbleToaster } from './components/MarbleToaster';
import { serverServices } from './services/init.server';
import tailwindStyles from './tailwind.css';
import { getClientEnvVars } from './utils/environment.server';
import getPageViewNameAndProps from './utils/getPageviewNameAndProps';

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
    },
    {
      headers: [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
        ['Set-Cookie', await csrfSessionService.commitSession(csrfSession)],
      ],
    }
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
                <LogoStandard
                  className="w-auto"
                  width={undefined}
                  height="40px"
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
  const { locale, ENV, toastMessage, csrf } = useLoaderData<typeof loader>();

  const { i18n } = useTranslation(handle.i18n);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  const location = useLocation();
  const isHydrated = useHydrated();
  const matches = useMatches();
  const thisPage = matches[matches.length - 1];
  useEffect(() => {
    if (isHydrated) {
      const { name, properties } = getPageViewNameAndProps(thisPage);
      window.analytics.page(name, properties);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, thisPage.id, isHydrated]);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
        !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){if(window.analytics.initialized)return window.analytics[e].apply(window.analytics,arguments);var i=Array.prototype.slice.call(arguments);i.unshift(e);analytics.push(i);return analytics}};for(var i=0;i<analytics.methods.length;i++){var key=analytics.methods[i];analytics[key]=analytics.factory(key)}analytics.load=function(key,i){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=i};analytics._writeKey="${ENV.SEGMENT_WRITE_KEY}";;analytics.SNIPPET_VERSION="4.16.1";
        analytics.load("${ENV.SEGMENT_WRITE_KEY}");
        }}();`,
          }}
        />
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
        <MarbleToaster toastMessage={toastMessage} />
      </body>
    </html>
  );
}

export default withSentry(App);
