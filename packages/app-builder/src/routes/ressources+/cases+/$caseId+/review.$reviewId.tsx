import { type CaseReview } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { type LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export type CaseReviewResource = {
  review: CaseReview;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reviewId = params['reviewId'];
  invariant(reviewId, 'reviewId is required');

  const review = await cases.getCaseReviewById({ caseId, reviewId });
  return Response.json({ review } satisfies CaseReviewResource);
}
