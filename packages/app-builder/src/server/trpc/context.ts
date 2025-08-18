import { initServerServices } from '@app-builder/services/init.server';
import { inferAsyncReturnType } from '@trpc/server';

export async function createContext({ req }: { req: Request }) {
  const services = initServerServices(req);
  const auth = await services.authService.isAuthenticated(req);
  return {
    req,
    ...services,
    auth,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
