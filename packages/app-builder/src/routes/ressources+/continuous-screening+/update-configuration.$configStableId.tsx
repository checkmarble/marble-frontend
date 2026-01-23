import { createContinuousScreeningConfigSchema } from '@app-builder/components/ContinuousScreening/context/CreationStepper';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

type UpdateContinuousScreeningConfigurationResourceActionResult = ServerFnResult<
  Response | { success: boolean; errors: any }
>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function updateConfigurationAction({
    request,
    params,
    context,
  }): UpdateContinuousScreeningConfigurationResourceActionResult {
    const { toastSessionService } = context.services;
    const { continuousScreening: continuousScreeningRepository, inbox: inboxRepository } = context.authInfo;
    const configStableId = params['configStableId'];
    invariant(configStableId, 'Config stable ID is required');

    const toastSession = await toastSessionService.getSession(request);

    const rawData = await request.json();
    const validationResult = createContinuousScreeningConfigSchema.safeParse(rawData);

    if (!validationResult.success) {
      return data({ success: false, errors: z.treeifyError(validationResult.error) });
    }

    try {
      const { inboxName, ...payload } = validationResult.data;

      let inboxId: string;
      if (payload.inboxId === null) {
        if (!inboxName) {
          throw new Error('Inbox name is required when no inbox is selected');
        }

        const newInbox = await inboxRepository.createInbox({ name: inboxName });
        inboxId = newInbox.id;
      } else {
        inboxId = payload.inboxId;
      }

      await continuousScreeningRepository.updateConfiguration(configStableId, { ...payload, inboxId });

      setToastMessage(toastSession, {
        type: 'success',
        messageKey: 'common:success.save',
      });

      return data({ success: true, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
