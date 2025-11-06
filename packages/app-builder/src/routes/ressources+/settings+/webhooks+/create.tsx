import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createWebhookPayloadSchema } from '@app-builder/queries/settings/webhooks/create-webhook';
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

  const [t, session, rawData, { webhookRepository }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const payload = createWebhookPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    const webhook = await webhookRepository.createWebhook({
      webhookCreateBody: payload.data,
    });

    return Response.json({
      redirectTo: getRoute('/settings/webhooks/:webhookId', {
        webhookId: webhook.id,
      }),
    });
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json({ success: false, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
