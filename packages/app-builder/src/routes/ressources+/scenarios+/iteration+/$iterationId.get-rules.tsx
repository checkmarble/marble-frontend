import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { ActionFunctionArgs } from '@remix-run/server-runtime';

export async function loader({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  return Response.json({
    rules: await scenarioIterationRuleRepository.listRules({ scenarioIterationId: iterationId }),
  });
}
