import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { servicesMiddleware } from '../middlewares/services-middleware';

const catchAllLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function catchAllLoader({ context }) {
    const request = getRequest();
    if (request.headers.get('x-referer-app') === 'marble-frontend') {
      throw new Response('Detected marble app self call', { status: 500 });
    }

    try {
      await context.services.authService.isAuthenticated(request, {
        successRedirect: '/app-router',
        failureRedirect: '/sign-in',
      });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw redirect({ href: error.headers.get('Location')!, statusCode: error.status });
      }
      throw error;
    }
  });

export const Route = createFileRoute('/$')({
  loader: () => catchAllLoader(),
});
