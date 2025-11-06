import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { updateTagPayloadSchema } from '@app-builder/queries/settings/tags/update-tag';
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

  const payload = updateTagPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await apiClient.updateTag(payload.data.id, payload.data);

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json({ success: true }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json({ success: false, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
