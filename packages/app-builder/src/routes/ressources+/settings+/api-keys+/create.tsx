import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createApiKeyPayloadSchema } from '@app-builder/queries/settings/api-keys/create-api-key';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
    authSessionService: { getSession: getAuthSession, commitSession: commitAuthSession },
    i18nextService: { getFixedT },
  } = initServerServices(request);

  const [data, { apiKey }, session, authSession, t] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
    getSession(request),
    getAuthSession(request),
    getFixedT(request, ['common']),
  ]);

  const result = createApiKeyPayloadSchema.safeParse(data);

  if (!result.success) {
    return Response.json(
      { success: false, errors: z.treeifyError(result.error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    authSession.flash('createdApiKey', await apiKey.createApiKey(data));

    return Response.json(
      { redirectTo: getRoute('/settings/api-keys') },
      {
        headers: {
          'Set-Cookie': await commitAuthSession(authSession),
        },
      },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
