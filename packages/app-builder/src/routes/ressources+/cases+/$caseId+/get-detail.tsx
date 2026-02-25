import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getCaseDetailLoader({ context, params }) {
    const caseId = params['caseId'];

    invariant(caseId, 'caseId is required');

    const caseDetail = await context.authInfo.cases.getCase({ caseId });

    return { caseDetail };
  },
);
