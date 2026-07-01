import * as TanstackQuery from '@app-builder/integrations/tanstack-query/root-provider';
import { getRequestNonce } from '@app-builder/utils/security-headers.server';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createIsomorphicFn } from '@tanstack/react-start';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { routeTree } from './routeTree.gen';
import { ALL_NAMESPACES, Namespace } from './services/i18n/all-namespaces';

// Reads the per-request CSP nonce on the server (from the request-scoped store opened
// by `securityHeadersMiddleware`) so TanStack Start stamps it onto the hydration
// scripts rendered by `<Scripts>`. `createIsomorphicFn` strips the server branch — and
// its `node:async_hooks` import — from the client bundle.
const getNonce = createIsomorphicFn()
  .server(() => getRequestNonce())
  .client(() => undefined);

// Shared i18next instance for the router, created once at module level.
// This is only the bootstrap instance — the real locale-specific instance is set up
// by RootShell (via ssrInstanceCache on the server, or makeI18nInstance on the client),
// whose I18nextProvider overrides this one during rendering. Creating a new instance
// per request was leaking memory because i18next maintains internal references that
// were never cleaned up.
const routerI18n = i18next.createInstance();
routerI18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: Namespace) => import(`./locales/${language}/${namespace}.json`)),
  )
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ALL_NAMESPACES,
  });

export function getRouter() {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext, i18n: routerI18n },
    scrollRestoration: true,
    // Start route loaders on hover/focus so data is usually ready by click time,
    // hiding loader RPC latency behind the intent-to-click gap.
    defaultPreload: 'intent',
    ssr: { nonce: getNonce() },
    Wrap: (props: { children: ReactNode }) => {
      return (
        <I18nextProvider i18n={routerI18n}>
          <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>
        </I18nextProvider>
      );
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

  // On the server, clean up the per-request QueryClient when SSR finishes.
  // Without this, each request's QueryClient lingers in memory with active GC timers
  // (default gcTime: 5 minutes) until they fire. Under load, hundreds of orphaned
  // QueryClient instances accumulate.
  router.serverSsr?.onCleanup(() => {
    rqContext.queryClient.clear();
  });

  return router;
}

// Register the router type globally for type-safe link/navigate usage
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
