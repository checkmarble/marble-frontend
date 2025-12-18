import { Toaster } from '@bo/components/common/Toaster';
import { env } from '@bo/env';
import type { TRPCRouter } from '@bo/integrations/trpc/router';
import { getUserPreferencesFn } from '@bo/server-fns/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ClientOnly, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cn } from 'ui-design-system';
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

  beforeLoad: async () => {
    return {
      userPreferences: await getUserPreferencesFn(),
    };
  },

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const {
    userPreferences: { theme = 'light' },
  } = Route.useRouteContext();

  return (
    <html lang="en" className={cn('overscroll-y-none', theme)}>
      <head>
        <HeadContent />
      </head>
      <body className="text-grey-primary bg-surface-page scrollbar-stable text-default min-h-screen">
        {children}
        <ClientOnly>
          <Toaster />
        </ClientOnly>
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
