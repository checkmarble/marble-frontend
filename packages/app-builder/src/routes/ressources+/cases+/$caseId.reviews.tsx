import { type AiCaseReviewListItem } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export type CaseReviewsResource = {
  reviews: AiCaseReviewListItem[];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');

  const reviews = await cases.listCaseReviews({ caseId });
  return Response.json({ reviews } satisfies CaseReviewsResource);
}
