import { deleteWebhookPayloadSchema } from '@app-builder/queries/settings/webhooks/delete-webhook';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { webhookRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const rawData = await request.json();
  const payload = deleteWebhookPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await webhookRepository.deleteWebhook({ webhookId: payload.data.webhookId });
    return Response.json({ redirectTo: getRoute('/settings/webhooks') });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
