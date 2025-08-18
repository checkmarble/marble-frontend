import { createContext } from '@app-builder/server/trpc/context';
import { appRouter } from '@app-builder/server/trpc/root';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export async function loader({ request }: LoaderFunctionArgs) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () => createContext({ req: request }),
  });
}

export const action = loader;
