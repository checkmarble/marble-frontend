import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';
import * as R from 'remeda';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const currentScenario = await scenario.getScenario({ scenarioId });

  if (currentScenario.liveVersionId) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(currentScenario.liveVersionId),
      }),
    );
  }

  const scenarioIterations = await scenario.listScenarioIterations({
    scenarioId,
  });

  const lastScenarioIteration = R.pipe(
    scenarioIterations,
    R.firstBy([({ createdAt }) => createdAt, 'desc']),
  );

  if (!lastScenarioIteration) {
    const session = await getSession(request);
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:empty_scenario_iteration_list',
    });

    return redirect(getRoute('/scenarios/'), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }

  return redirect(
    getRoute('/scenarios/:scenarioId/i/:iterationId', {
      scenarioId: fromUUID(scenarioId),
      iterationId: fromUUID(lastScenarioIteration.id),
    }),
  );
}
