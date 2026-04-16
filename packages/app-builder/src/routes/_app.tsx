import { DevLanguageShortcut } from '@app-builder/components/DevLanguageShortcut';
import { ErrorComponent } from '@app-builder/components/ErrorComponent';
import { MarbleToaster } from '@app-builder/components/MarbleToaster';
import { TimezoneDetector } from '@app-builder/components/TimezoneDetector';
import { AgnosticNavigationContext } from '@app-builder/contexts/AgnosticNavigationContext';
import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import { ThemeProvider } from '@app-builder/contexts/ThemeContext';
import { getRootLoaderDataFn } from '@app-builder/server-fns/root';
import { getSSRInstance } from '@app-builder/services/i18n/i18n-instance-store';
import { makeI18nInstance } from '@app-builder/services/i18n/make-i18n-instance';
import { useSegmentPageTracking } from '@app-builder/services/segment';
import { SegmentScript } from '@app-builder/services/segment/SegmentScript';
import { CsrfContext } from '@app-builder/utils/csrf-client';
import { NonceProvider, useNonce } from '@app-builder/utils/nonce';
import * as Sentry from '@sentry/react';
import {
  ClientOnly,
  createFileRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import clsx from 'clsx';
import QueryString from 'qs';
import { useCallback, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { Logo } from 'ui-icons';

export const Route = createFileRoute('/_app')({
  loader: () => getRootLoaderDataFn(),
  component: App,
  errorComponent: AppErrorBoundary,
});

function App() {
  const { nonce, appConfig, locale } = Route.useLoaderData();

  // Use the SSR-registered instance (server) or create one from bundled resources (client).
  // Both paths are synchronous so the language is correct on the very first render,
  // avoiding hydration mismatches.
  const [i18n] = useState(() => getSSRInstance(locale) ?? makeI18nInstance(locale));

  // Keep the instance in sync when locale changes (e.g. SPA navigation after language switch)
  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <NonceProvider value={nonce}>
        <AppConfigContext.Provider value={appConfig}>
          <RootProviders>
            <RootDocumentInner>
              <DevLanguageShortcut />
              <Outlet />
            </RootDocumentInner>
          </RootProviders>
        </AppConfigContext.Provider>
      </NonceProvider>
    </I18nextProvider>
  );
}

function RootProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tsNavigate = useNavigate();
  const loaderData = Route.useLoaderData();

  // Adapt TanStack Router's navigate to the AgnosticNavigationContext interface.
  // The context expects (to: string | LocationDescriptor, options?) | (delta: number).
  const navigate = useCallback(
    (
      toOrDelta: string | number | { pathname?: string; search?: string; hash?: string },
      options?: { replace?: boolean },
    ) => {
      if (typeof toOrDelta === 'number') {
        window.history.go(toOrDelta);
        return;
      }
      const to = typeof toOrDelta === 'string' ? toOrDelta : (toOrDelta.pathname ?? '/');
      const search =
        typeof toOrDelta !== 'string' && toOrDelta.search
          ? QueryString.parse(toOrDelta.search, { ignoreQueryPrefix: true })
          : undefined;

      tsNavigate({ to, replace: options?.replace, search });
    },
    [tsNavigate],
  );

  // router.invalidate() is the TanStack Router equivalent of Remix's revalidator.revalidate()
  const invalidate = useCallback(() => {
    router.invalidate();
  }, [router]);

  return (
    <LoaderRevalidatorContext.Provider value={invalidate}>
      <AgnosticNavigationContext.Provider value={navigate}>
        <CsrfContext.Provider value={loaderData?.csrf ?? ''}>
          <FormatContext.Provider
            value={{
              locale: loaderData?.locale ?? 'en-GB',
              timezone: loaderData?.timezone ?? 'UTC',
            }}
          >
            <ThemeProvider defaultTheme={loaderData?.theme}>
              <Tooltip.Provider>{children}</Tooltip.Provider>
            </ThemeProvider>
          </FormatContext.Provider>
        </CsrfContext.Provider>
      </AgnosticNavigationContext.Provider>
    </LoaderRevalidatorContext.Provider>
  );
}

function RootDocumentInner({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const nonce = useNonce();
  const loaderData = Route.useLoaderData();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  useSegmentPageTracking();

  return (
    <html lang={loaderData?.locale ?? 'en'} dir={i18n.dir()} className={clsx(loaderData?.theme === 'dark' && 'dark')}>
      <head>
        <HeadContent />
        {loaderData?.segmentScript ? <SegmentScript nonce={nonce} script={loaderData.segmentScript} /> : null}
      </head>
      <body
        data-hydrated={hydrated || undefined}
        className="bg-surface-page selection:text-grey-white selection:bg-purple-primary h-screen w-full overflow-hidden antialiased text-grey-primary"
      >
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData?.ENV ?? {})}`,
          }}
        />
        <Scripts />
        <ClientOnly>
          <TimezoneDetector />
          <MarbleToaster toastMessage={loaderData?.toastMessage} />
        </ClientOnly>
      </body>
    </html>
  );
}

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------
function AppErrorBoundary({ error }: { error: unknown }) {
  Sentry.captureException(error);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="bg-surface-page flex size-full flex-col items-center bg-linear-to-r">
          <div className="flex size-full flex-col items-center bg-no-repeat">
            <div className="flex h-full max-h-80 flex-col justify-center">
              <Link to="/sign-in">
                <Logo
                  logo="logo-standard"
                  className="h-10 w-auto text-[#080525] dark:text-grey-white"
                  preserveAspectRatio="xMinYMid meet"
                  aria-labelledby="marble"
                />
              </Link>
            </div>
            <div className="bg-surface-card mb-10 flex shrink-0 rounded-2xl p-10 text-center shadow-md">
              <ErrorComponent error={error} />
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
