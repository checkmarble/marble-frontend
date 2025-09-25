import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { decision: decisionRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const decisionId = fromParams(params, 'decisionId');

  const decision = await decisionRepository.getDecisionById(decisionId);

  return Response.json({ decision });
}
