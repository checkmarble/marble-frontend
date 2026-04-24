import { ErrorComponent } from '@app-builder/components/ErrorComponent';
import { MarbleToaster } from '@app-builder/components/MarbleToaster';
import { TimezoneDetector } from '@app-builder/components/TimezoneDetector';
import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { ThemeProvider } from '@app-builder/contexts/ThemeContext';
import { getRootLoaderDataFn } from '@app-builder/server-fns/root';
import { getSSRInstance } from '@app-builder/services/i18n/i18n-instance-store';
import { makeI18nInstance } from '@app-builder/services/i18n/make-i18n-instance';
import { SegmentScript } from '@app-builder/services/segment/SegmentScript';
import tailwindStyles from '@app-builder/tailwind.css?url';
import { CsrfContext } from '@app-builder/utils/csrf-client';
import { NonceProvider } from '@app-builder/utils/nonce';
import * as Sentry from '@sentry/react';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { ClientOnly, createRootRouteWithContext, HeadContent, Scripts, useMatch } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import clsx from 'clsx';
import { type i18n } from 'i18next';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { iconsSVGSpriteHref, logosSVGSpriteHref } from 'ui-icons';

interface RouterContext {
  i18n: i18n;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
      { title: 'Marble' },
    ],
    links: [
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
    ],
  }),
  loader: () => getRootLoaderDataFn(),
  shellComponent: RootShell,
  errorComponent: RootErrorBoundary,
});

function useRootLoaderData() {
  // `shouldThrow: false` keeps the shell renderable when the root loader errored —
  // in that case the errorComponent renders inside the shell with safe defaults.
  const match = useMatch({ from: '__root__', shouldThrow: false });
  return match?.loaderData;
}

function RootShell({ children }: { children: ReactNode }) {
  const loaderData = useRootLoaderData();

  const locale = loaderData?.locale ?? 'en';
  const theme = loaderData?.theme ?? 'light';
  const timezone = loaderData?.timezone ?? 'UTC';
  const nonce = loaderData?.nonce ?? '';
  const csrf = loaderData?.csrf ?? '';
  const appConfig = loaderData?.appConfig;
  const toastMessage = loaderData?.toastMessage;
  const segmentScript = loaderData?.segmentScript;
  const env = loaderData?.ENV ?? {};

  const [i18n] = useState(() => getSSRInstance(locale) ?? makeI18nInstance(locale));

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <html lang={locale} dir={i18n.dir()} className={clsx(theme === 'dark' && 'dark')}>
      <head>
        <HeadContent />
        {segmentScript ? <SegmentScript nonce={nonce} script={segmentScript} /> : null}
      </head>
      <body
        data-hydrated={hydrated || undefined}
        className="bg-surface-page selection:text-grey-white selection:bg-purple-primary h-screen w-full overflow-hidden antialiased text-grey-primary"
      >
        <I18nextProvider i18n={i18n}>
          <NonceProvider value={nonce}>
            <FormatContext.Provider value={{ locale, timezone }}>
              <CsrfContext.Provider value={csrf}>
                <ThemeProvider defaultTheme={theme}>
                  {appConfig ? (
                    <AppConfigContext.Provider value={appConfig}>{children}</AppConfigContext.Provider>
                  ) : (
                    children
                  )}
                </ThemeProvider>
              </CsrfContext.Provider>
            </FormatContext.Provider>
          </NonceProvider>
        </I18nextProvider>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <Scripts />
        <ClientOnly>
          <TimezoneDetector />
          <MarbleToaster toastMessage={toastMessage} />
          <TanStackDevtools
            plugins={[
              { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
              { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
              formDevtoolsPlugin(),
            ]}
          />
        </ClientOnly>
      </body>
    </html>
  );
}

function RootErrorBoundary({ error }: { error: unknown }) {
  Sentry.captureException(error);
  // Intentionally render body content only — the shellComponent wraps this output
  // in <html>/<head>/<body>, so rendering our own would produce duplicate document elements.
  return <RootErrorBoundaryBody error={error} />;
}

function RootErrorBoundaryBody({ error }: { error: unknown }) {
  // useTranslation here ensures the error UI picks up the i18n provider from the shell.
  useTranslation();
  return (
    <div className="bg-surface-page flex size-full flex-col items-center">
      <div className="bg-surface-card mt-20 flex shrink-0 rounded-2xl p-10 text-center shadow-md">
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
