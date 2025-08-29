import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { updateUserPayloadSchema } from '@app-builder/queries/settings/users/update-user';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { apiClient }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = updateUserPayloadSchema.safeParse(rawData);

  if (!success) {
    return Response.json({ success: false, errors: z.treeifyError(error) });
  }

  try {
    await apiClient.updateUser(data.userId, {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
      organization_id: data.organizationId,
    });

    return Response.json({ success: true });
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
