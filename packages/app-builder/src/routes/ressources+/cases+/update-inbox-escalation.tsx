import { updateInboxEscalationPayloadSchema } from '@app-builder/queries/cases/update-inbox-escalation';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { inbox: inboxApi }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = updateInboxEscalationPayloadSchema.safeParse(raw);

  if (!success) return Response.json({ success: false, errors: z.treeifyError(error) });

  // First get the inbox to preserve the name field (required by the API)
  const inbox = await inboxApi.getInbox(data.inboxId);

  await inboxApi.updateInbox(data.inboxId, {
    name: inbox.name,
    escalationInboxId: data.escalationInboxId,
  });

  return Response.json({ success: true });
}
