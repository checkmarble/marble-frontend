import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { unarchiveScenarioPayloadSchema } from '@app-builder/queries/scenarios/unarchive-scenario';
import { z } from 'zod/v4';

export const action = createServerFn([authMiddleware], async function unarchiveScenarioAction({ request, context }) {
  const { toastSessionService } = context.services;
  const toastSession = await toastSessionService.getSession(request);
  const rawPayload = await request.json();

  const result = unarchiveScenarioPayloadSchema.safeParse(rawPayload);
  if (!result.success) {
    return { success: false, errors: z.treeifyError(result.error) };
  }

  try {
    await context.authInfo.scenario.unarchiveScenario({ scenarioId: result.data.scenarioId });

    setToastMessage(toastSession, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
  } catch (_error) {
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return data({ success: false, errors: [] }, [
      ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
    ]);
  }
});
