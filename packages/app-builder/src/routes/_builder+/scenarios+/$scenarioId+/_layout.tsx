import { ErrorComponent } from '@app-builder/components';
import { adaptScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import {
  json,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from '@remix-run/node';
import { Outlet, useRouteError, useRouteLoaderData } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenario, testRunRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const scenarioId = fromParams(params, 'scenarioId');

  const [currentScenario, scenarioIterations, scenarioTestRuns] =
    await Promise.all([
      scenario.getScenario({ scenarioId }),
      scenario.listScenarioIterations({
        scenarioId,
      }),
      testRunRepository.listTestRuns({
        scenarioId,
      }),
    ]);

  return json({
    currentScenario,
    scenarioTestRuns,
    scenarioIterations: scenarioIterations.map((dto) =>
      adaptScenarioIterationWithType(dto, currentScenario.liveVersionId),
    ),
  });
}

export function useScenarioIterations() {
  const { scenarioIterations } = useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
  return scenarioIterations;
}

export function useScenarioTestRuns() {
  const { scenarioTestRuns } = useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
  return scenarioTestRuns;
}

export function useCurrentScenario() {
  const { currentScenario } = useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
  return currentScenario;
}

export default function CurrentScenarioLayout() {
  return <Outlet />;
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
