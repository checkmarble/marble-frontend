import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getCaseNameLoader({ context, params }) {
    const { cases: caseRepository } = context.authInfo;
    const caseId = params['caseId'];

    invariant(caseId, 'caseId is required');

    const caseName = await caseRepository.getCase({ caseId });

    return { name: caseName.name };
  },
);
