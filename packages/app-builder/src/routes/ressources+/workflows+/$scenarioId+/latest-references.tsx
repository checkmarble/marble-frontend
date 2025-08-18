import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = params['scenarioId'];
  invariant(scenarioId, 'scenarioId is required');

  const references = await scenario.getLatestRulesReferences(scenarioId);
  return Response.json(
    references.sort((a, b) => Number(b.latestVersion) - Number(a.latestVersion)),
  );
}
