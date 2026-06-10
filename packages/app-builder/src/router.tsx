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

export function getRouter() {
  const rqContext = TanstackQuery.getContext();
  const i18n = i18next.createInstance();

  i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: string, namespace: Namespace) => import(`./locales/${language}/${namespace}.json`)),
    )
    .init({
      lng: 'en',
      fallbackLng: 'en',
      ns: ALL_NAMESPACES,
    });

  const router = createRouter({
    routeTree,
    context: { ...rqContext, i18n },
    scrollRestoration: true,
    ssr: { nonce: getNonce() },
    Wrap: (props: { children: ReactNode }) => {
      return (
        <I18nextProvider i18n={i18n}>
          <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>
        </I18nextProvider>
      );
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

  return router;
}

// Register the router type globally for type-safe link/navigate usage
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
