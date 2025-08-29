import { deleteInboxPayloadSchema } from '@app-builder/queries/settings/inboxes/delete-inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const payload = deleteInboxPayloadSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await inbox.deleteInbox(payload.data.inboxId);
    return Response.json({ redirectTo: getRoute('/settings/inboxes') });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
