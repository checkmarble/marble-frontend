import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reviewId = params['reviewId'];
  invariant(reviewId, 'reviewId is required');

  const [t, session, caseReviews] = await Promise.all([
    getFixedT(request, ['common', 'cases']),
    getSession(request),
    cases.getMostRecentCaseReview({ caseId }),
  ]);

  const caseReview = caseReviews.find((review) => review.id === reviewId);

  if (!caseReview) {
    return Response.json(
      { success: false, error: 'Review not found' },
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    await cases.addComment({ caseId, body: { comment: caseReview.review.output } });

    setToastMessage(session, {
      type: 'success',
      message: t('cases:case_detail.ai_review.actions.add_to_comment.success'),
    });

    return Response.json({ success: true }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json({ success: false }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
