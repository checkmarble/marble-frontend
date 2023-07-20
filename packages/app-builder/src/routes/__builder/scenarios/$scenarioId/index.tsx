import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';
import * as R from 'remeda';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const {
    authService,
    sessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterations = await apiClient.listScenarioIterations({
    scenarioId,
  });

  //TODO(CatchBoundary): replace this with according CatchBoundary
  if (scenarioIterations.length === 0) {
    const session = await getSession(request);
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:empty_scenario_iteration_list',
    });

    return redirect(getRoute('/scenarios'), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }

  const lastScenarioIteration = R.sortBy(scenarioIterations, [
    ({ createdAt }) => createdAt,
    'desc',
  ])[0];

  return redirect(
    getRoute('/scenarios/:scenarioId/i/:iterationId', {
      scenarioId: fromUUID(lastScenarioIteration.scenarioId),
      iterationId: fromUUID(lastScenarioIteration.id),
    })
  );
}
