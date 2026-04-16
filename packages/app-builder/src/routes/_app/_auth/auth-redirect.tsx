import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

const authRedirectLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function authRedirectLoader({ context }) {
    const request = getRequest();
    if (context.appConfig.auth.provider !== 'firebase') {
      throw redirect({ to: '/sign-in' });
    }

    const authDomain = context.appConfig.auth.firebase.authDomain;
    if (!authDomain) {
      throw redirect({ to: '/sign-in' });
    }

    const url = new URL(request.url);

    throw redirect({ href: `https://${authDomain}/__/auth/action${url.search}` });
  });

export const Route = createFileRoute('/_app/_auth/auth-redirect')({
  loader: () => authRedirectLoader(),
});
