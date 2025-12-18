import { AppConfigContext } from '@bo/contexts/AppConfig';
import { StickyRootsProvider } from '@bo/contexts/StickyRoots';
import { getAppConfigFn } from '@bo/server-fns/core';
import { createFileRoute, ErrorComponentProps, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,

  loader: async () => {
    return {
      appConfig: await getAppConfigFn(),
    };
  },

  errorComponent: ErrorComponent,
});

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="h-screen w-screen grid place-content-center">
      <div className="bg-surface-card max-w-[80vw] p-v2-lg rounded-v2-xl flex flex-col gap-v2-md items-center">
        <h1 className="text-3xl">An error occured</h1>
        {import.meta.env.DEV ? <div>{error.stack}</div> : null}
      </div>
    </div>
  );
}

function RouteComponent() {
  const { appConfig } = Route.useLoaderData();

  return (
    <AppConfigContext.Provider value={appConfig}>
      <StickyRootsProvider>
        <Outlet />
      </StickyRootsProvider>
    </AppConfigContext.Provider>
  );
}
