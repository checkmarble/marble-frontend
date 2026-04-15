import * as TanstackQuery from '@app-builder/integrations/tanstack-query/root-provider';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { routeTree } from './routeTree.gen';
import { ALL_NAMESPACES, Namespace } from './services/i18n/all-namespaces';

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
