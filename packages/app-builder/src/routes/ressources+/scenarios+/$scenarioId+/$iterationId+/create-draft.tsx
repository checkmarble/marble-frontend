import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const draftIteration = await apiClient.createDraftFromScenarioIteration(iterationId);

    return {
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(draftIteration.id),
      }),
    };
  } catch (error) {
    return Response.json({ success: false, error: error });
  }
}
