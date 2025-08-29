import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createUserPayloadSchema } from '@app-builder/queries/settings/users/create-user';
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

  const payload = createUserPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await apiClient.createUser({
      first_name: payload.data.firstName,
      last_name: payload.data.lastName,
      email: payload.data.email,
      role: payload.data.role,
      organization_id: payload.data.organizationId,
    });

    return Response.json({ success: true });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: isStatusConflictHttpError(error)
        ? t('common:errors.list.duplicate_email')
        : t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
