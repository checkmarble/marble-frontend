import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/react';
import { z } from 'zod/v4';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function commitScoringRulesetAction({
    request,
    context,
  }): ServerFnResult<Response | { success: boolean; errors?: unknown }> {
    const { toastSessionService } = context.services;
    const [toastSession, rawData] = await Promise.all([toastSessionService.getSession(request), request.json()]);

    const payload = z.object({ recordType: z.string() }).safeParse(rawData);
    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      const { recordType } = payload.data;
      const ruleset = await context.authInfo.userScoring.commitScoringRuleset(recordType);

      if (!ruleset) {
        return { success: false };
      }

      return redirect(
        getRoute('/user-scoring/:recordType/:version', {
          recordType,
          version: ruleset.version.toString(),
        }),
      );
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
