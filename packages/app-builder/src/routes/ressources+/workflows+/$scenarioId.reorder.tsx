import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'PUT') {
    throw new Response('Method not allowed', { status: 405 });
  }

  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = params['scenarioId'];
  invariant(scenarioId, 'scenarioId is required');

  const { ruleIds } = await request.json();
  invariant(Array.isArray(ruleIds), 'ruleIds must be an array');

  await scenario.reorderWorkflows({
    scenarioId,
    workflowIds: ruleIds,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
