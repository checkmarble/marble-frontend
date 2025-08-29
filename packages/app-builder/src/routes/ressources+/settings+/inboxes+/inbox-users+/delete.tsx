import { deleteInboxUserPayloadSchema } from '@app-builder/queries/settings/inboxes/delete-inbox-user';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { type Namespace } from 'i18next';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const rawData = await request.json();
  const payload = deleteInboxUserPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await inbox.deleteInboxUser(payload.data.inboxUserId);

    return Response.json({
      redirectTo: getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUIDtoSUUID(payload.data.inboxId),
      }),
    });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
