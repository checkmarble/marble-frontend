import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { updateScoringRulesetPayloadSchema } from '@app-builder/queries/scoring/update-ruleset';
import { z } from 'zod/v4';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function updateScoringRulesetAction({
    request,
    context,
  }): ServerFnResult<{ success: boolean; errors?: unknown }> {
    const { toastSessionService } = context.services;
    const [toastSession, rawData] = await Promise.all([toastSessionService.getSession(request), request.json()]);

    const payload = updateScoringRulesetPayloadSchema.safeParse(rawData);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    const { recordType, ...rulesetPayload } = payload.data;

    try {
      rulesetPayload.name = `Scores ${recordType}`;
      await context.authInfo.userScoring.updateScoringRuleset(recordType, rulesetPayload);

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
