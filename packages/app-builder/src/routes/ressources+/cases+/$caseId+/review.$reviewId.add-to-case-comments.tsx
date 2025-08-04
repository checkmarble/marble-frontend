import { initServerServices } from '@app-builder/services/init.server';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reviewId = params['reviewId'];
  invariant(reviewId, 'reviewId is required');

  const caseReviews = await cases.getMostRecentCaseReview({ caseId });
  const caseReview = caseReviews.find((review) => review.id === reviewId);

  if (!caseReview) {
    return new Response(JSON.stringify({ success: false, error: 'Review not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  await cases.addComment({ caseId, body: { comment: caseReview.output } });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
