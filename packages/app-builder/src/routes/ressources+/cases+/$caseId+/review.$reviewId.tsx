import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { type CaseReview } from '@app-builder/models/cases';
import invariant from 'tiny-invariant';

export type CaseReviewResource = {
  review: CaseReview;
};

export const loader = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ params, context }) => {
  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reviewId = params['reviewId'];
  invariant(reviewId, 'reviewId is required');

  const review = await context.authInfo.cases.getCaseReviewById({ caseId, reviewId });
  return Response.json({ review } satisfies CaseReviewResource);
});
