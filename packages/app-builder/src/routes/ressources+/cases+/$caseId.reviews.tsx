import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { type AiCaseReviewListItem } from '@app-builder/models/cases';
import invariant from 'tiny-invariant';

export type CaseReviewsResource = {
  reviews: AiCaseReviewListItem[];
};

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function listCaseReviewsLoader({ context, params }) {
    const { cases } = context.authInfo;

    const caseId = params['caseId'];
    invariant(caseId, 'caseId is required');

    const reviews = await cases.listCaseReviews({ caseId });
    return { reviews } satisfies CaseReviewsResource;
  },
);
