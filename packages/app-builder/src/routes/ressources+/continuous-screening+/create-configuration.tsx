import { createContinuousScreeningConfigSchema } from '@app-builder/components/ContinuousScreening/context/CreationStepper';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';
import { z } from 'zod/v4';

type CreateContinuousScreeningConfigurationResourceActionResult = ServerFnResult<
  Response | { success: boolean; errors: any }
>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createConfigurationAction({
    request,
    context,
  }): CreateContinuousScreeningConfigurationResourceActionResult {
    const { toastSessionService } = context.services;
    const { continuousScreening: continuousScreeningRepository, inbox: inboxRepository } = context.authInfo;

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

      await continuousScreeningRepository.createConfiguration({ ...payload, inboxId });

      return redirect(getRoute('/continuous-screening/configurations'), {
        status: 302,
      });
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
