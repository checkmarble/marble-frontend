import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const iterationId = fromParams(params, 'iterationId');

  try {
    const { ruleSnoozes } = await scenario.getScenarioIterationActiveSnoozes(iterationId);

    return Response.json({ success: true, ruleSnoozes });
  } catch (_error) {
    return Response.json({ success: false });
  }
}
