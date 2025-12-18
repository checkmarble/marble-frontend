import { AppConfigContext } from '@bo/contexts/AppConfig';
import { StickyRootsProvider } from '@bo/contexts/StickyRoots';
import { env } from '@bo/env';
import type { TRPCRouter } from '@bo/integrations/trpc/router';
import { getAppConfigFn } from '@bo/server-fns/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;

  trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: env.VITE_APP_TITLE,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  loader: async () => {
    return {
      appConfig: await getAppConfigFn(),
    };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { appConfig } = Route.useLoaderData();

  return (
    <html lang="en" className="overscroll-none dark">
      <head>
        <HeadContent />
      </head>
      <body className="text-grey-primary bg-surface-page scrollbar-stable text-default">
        <AppConfigContext.Provider value={appConfig}>
          <StickyRootsProvider>{children}</StickyRootsProvider>
        </AppConfigContext.Provider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
            triggerHidden: true,
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
