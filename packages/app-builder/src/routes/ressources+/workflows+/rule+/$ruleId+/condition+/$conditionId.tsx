import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'DELETE') {
    throw new Response('Method not allowed', { status: 405 });
  }

  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const ruleId = params['ruleId'];
  const conditionId = params['conditionId'];
  invariant(ruleId, 'ruleId is required');
  invariant(conditionId, 'conditionId is required');

  const { scenarioId } = await request.json();
  invariant(scenarioId, 'scenarioId is required');

  await scenario.deleteWorkflowCondition({
    ruleId,
    conditionId,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
