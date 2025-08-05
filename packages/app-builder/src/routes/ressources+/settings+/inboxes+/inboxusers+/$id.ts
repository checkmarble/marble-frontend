import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import * as Sentry from '@sentry/remix';
import { type Namespace } from 'i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const schema = z.object({
  autoAssignable: z.boolean(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'PUT') {
    return new Response('Method not allowed', { status: 405 });
  }
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, rawData, { inbox }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { id } = params;

  if (!id) {
    return Response.json(
      { status: 'error', errors: ['Invalid ID'] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }

  const {
    data: { autoAssignable } = { autoAssignable: false },
    success,
    error,
  } = schema.safeParse(rawData.params);

  if (!success) {
    return Response.json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await inbox.updateInboxUser(id, { autoAssignable });

    return Response.json(
      { status: 'success' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);

    return Response.json(
      {
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
