import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { copyScenarioPayloadSchema } from '@app-builder/queries/scenarios/copy-scenario';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';
import { z } from 'zod/v4';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function copyScenarioAction({
    request,
    context,
  }): ServerFnResult<Response | { success: boolean; errors: any }> {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);
    const rawPayload = await request.json();

    const result = copyScenarioPayloadSchema.safeParse(rawPayload);
    if (!result.success) {
      return { success: false, errors: z.treeifyError(result.error) };
    }

    try {
      await context.authInfo.scenario.copyScenario({
        scenarioId: result.data.scenarioId,
        name: result.data.name || undefined,
      });

      return redirect(getRoute('/detection/scenarios'));
    } catch (_error) {
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
