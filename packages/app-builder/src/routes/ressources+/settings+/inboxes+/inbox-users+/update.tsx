import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { updateInboxUserPayloadSchema } from '@app-builder/queries/settings/inboxes/update-inbox-user';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { pick } from 'radash';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { inbox }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const payload = updateInboxUserPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json(
      { success: false, errors: z.treeifyError(payload.error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await inbox.updateInboxUser(payload.data.id, pick(payload.data, ['role', 'autoAssignable']));

    return Response.json({
      redirectTo: getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUIDtoSUUID(payload.data.inboxId),
      }),
    });
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
