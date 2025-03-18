import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioId, iterationId } = params;
  if (!scenarioId || !iterationId) {
    return {
      redirect: getRoute('/scenarios'),
    };
  }

  return authService.isAuthenticated(request, {
    successRedirect: getRoute('/scenarios/:scenarioId/i/:iterationId/trigger', {
      scenarioId,
      iterationId,
    }),
    failureRedirect: getRoute('/sign-in'),
  });
}
