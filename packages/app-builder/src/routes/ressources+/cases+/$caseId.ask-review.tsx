import { CaseReview } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export type CaseReviewResource = {
  review: CaseReview;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');

  const review = await cases.askReviewForCase({ caseId });

  return Response.json({ review } satisfies CaseReviewResource);
};
