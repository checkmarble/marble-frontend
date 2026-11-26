import { isAuthenticated } from '@app-builder/server/auth';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

const catchAllLoader = createServerFn().handler(async function catchAllLoader() {
  const request = getRequest();
  if (request.headers.get('x-referer-app') === 'marble-frontend') {
    throw new Response('Detected marble app self call', { status: 500 });
  }

  throw redirect({ to: (await isAuthenticated(request)) ? '/app-router' : '/sign-in' });
});

export const Route = createFileRoute('/$')({
  loader: () => catchAllLoader(),
});
