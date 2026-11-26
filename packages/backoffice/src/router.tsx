import * as Sentry from '@sentry/tanstackstart-react';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import * as TanstackQuery from './integrations/tanstack-query/root-provider';

import { routeTree } from './routeTree.gen';

export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: false,
  });

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

  if (!router.isServer) {
    Sentry.init({
      dsn: import.meta.env['VITE_SENTRY_DSN'],
      integrations: [],
      tracesSampleRate: 1.0,
    });
  }

  return router;
};
