import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createInboxPayloadSchema } from '@app-builder/queries/settings/inboxes/create-inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [{ inbox }, rawData, session, t] = await Promise.all([
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
    request.json(),
    getSession(request),
    getFixedT(request, ['common']),
  ]);

  const payload = createInboxPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    const createdInbox = await inbox.createInbox(payload.data);

    if (rawData.redirectRoute) {
      return Response.json({
        redirectTo: getRoute(rawData.redirectRoute, {
          inboxId: fromUUIDtoSUUID(createdInbox.id),
        }),
      });
    }

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json({ success: true, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json({ success: false, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
