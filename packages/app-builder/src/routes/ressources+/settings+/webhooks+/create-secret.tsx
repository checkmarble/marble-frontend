import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createWebhookSecretPayloadSchema } from '@app-builder/queries/settings/webhooks/create-webhook-secret';
import { z } from 'zod/v4';

export const action = createServerFn(
  [authMiddleware],
  async function createWebhookSecretAction({ request, context }): ServerFnResult<{ success: boolean; errors?: any }> {
    const { toastSessionService, i18nextService } = context.services;
    const [t, toastSession, rawData] = await Promise.all([
      i18nextService.getFixedT(request, ['common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const payload = createWebhookSecretPayloadSchema.safeParse(rawData);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      await context.authInfo.webhookRepository.createWebhookSecret({
        webhookId: payload.data.webhookId,
        createSecretBody: {
          expireExistingInDays: payload.data.expireExistingInDays,
        },
      });

      return { success: true };
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
