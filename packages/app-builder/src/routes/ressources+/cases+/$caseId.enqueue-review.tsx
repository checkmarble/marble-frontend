import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function enqueueReviewAction({ params, context }) {
    const { cases } = context.authInfo;

    const caseId = params['caseId'];
    invariant(caseId, 'caseId is required');

    await cases.enqueueReviewForCase({ caseId });
    return null;
  },
);
