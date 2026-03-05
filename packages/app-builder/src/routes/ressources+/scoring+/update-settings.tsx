import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { updateScoringSettingsPayloadSchema } from '@app-builder/queries/scoring/update-settings';
import { z } from 'zod/v4';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function updateScoringSettingsAction({
    request,
    context,
  }): ServerFnResult<{ success: boolean; errors?: unknown }> {
    const { toastSessionService } = context.services;
    const [toastSession, rawData] = await Promise.all([
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const payload = updateScoringSettingsPayloadSchema.safeParse(rawData);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      await context.authInfo.userScoring.updateScoringSettings(payload.data);

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
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
