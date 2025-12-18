import { isAuthenticatedFn } from '@bo/server-fns/auth';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_public')({
  beforeLoad: async () => {
    const isAuthenticated = await isAuthenticatedFn();
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
});
