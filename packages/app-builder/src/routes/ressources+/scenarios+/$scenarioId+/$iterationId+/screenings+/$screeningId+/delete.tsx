import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const iterationId = fromParams(params, 'iterationId');
  const scenarioId = fromParams(params, 'scenarioId');
  const screeningId = fromParams(params, 'screeningId');
  const { scenarioIterationScreeningRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    await scenarioIterationScreeningRepository.deleteScreeningConfig({
      iterationId,
      screeningId,
    });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      }),
    });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
