import { initServerServices } from '@app-builder/services/init.server';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { z } from 'zod';

const caseReviewReactionSchema = z.enum(['ok', 'ko']);

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reviewId = params['reviewId'];
  invariant(reviewId, 'reviewId is required');

  const { reaction } = await request.json();
  const { success, data } = caseReviewReactionSchema.safeParse(reaction);

  if (success) {
    await cases.addCaseReviewFeedback({ caseId, reviewId, reaction: data });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response(JSON.stringify({ success: false, error: 'Invalid reaction' }), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
