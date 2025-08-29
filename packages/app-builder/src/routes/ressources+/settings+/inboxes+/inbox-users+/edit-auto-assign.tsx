import { editInboxUserAutoAssignPayloadSchema } from '@app-builder/queries/settings/inboxes/edit-inbox-user-auto-assign';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [rawData, { inbox }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const payload = editInboxUserAutoAssignPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    console.log('PAYLOAD', payload);
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await inbox.updateInboxUser(payload.data.id, { autoAssignable: payload.data.autoAssignable });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    });
  }
}
