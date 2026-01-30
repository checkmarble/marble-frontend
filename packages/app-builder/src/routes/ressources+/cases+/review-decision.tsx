import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { reviewDecisionPayloadSchema } from '@app-builder/queries/decisions/review-decision';
import { z } from 'zod/v4';

type ReviewDecisionResourceActionResult = ServerFnResult<Response | { success: boolean; errors: any }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function reviewDecisionAction({ request, context }): ReviewDecisionResourceActionResult {
    const {
      i18nextService: { getFixedT },
      toastSessionService: { getSession, commitSession },
    } = context.services;
    const { cases: casesRepository } = context.authInfo;

    const [t, session, rawData] = await Promise.all([
      getFixedT(request, ['common']),
      getSession(request),
      request.json(),
    ]);

    const parsedResult = reviewDecisionPayloadSchema.safeParse(rawData);

    if (!parsedResult.success) {
      return data({ success: false, errors: z.treeifyError(parsedResult.error) }, [
        ['Set-Cookie', await commitSession(session)],
      ]);
    }

    try {
      await casesRepository.reviewDecision(parsedResult.data);

      setToastMessage(session, {
        type: 'success',
        message: t('common:success.save'),
      });

      return data({ success: true, errors: [] }, [['Set-Cookie', await commitSession(session)]]);
    } catch (_error) {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false, errors: [] }, [['Set-Cookie', await commitSession(session)]]);
    }
  },
);
