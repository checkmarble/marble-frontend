import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { ActionFunctionArgs } from '@remix-run/server-runtime';

export async function loader({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioIterationRuleRepository, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  const [rules, scenarioIteration] = await Promise.all([
    scenarioIterationRuleRepository.listRules({ scenarioIterationId: iterationId }),
    scenario.getScenarioIterationWithoutRules({ iterationId }),
  ]);

  return Response.json({
    rules,
    archived: scenarioIteration.archived,
  });
}
