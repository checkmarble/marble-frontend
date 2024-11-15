import { ErrorComponent } from '@app-builder/components';
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
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const [currentScenario, scenarioIterations] = await Promise.all([
    scenario.getScenario({ scenarioId }),
    scenario.listScenarioIterations({
      scenarioId,
    }),
  ]);

  return json({
    currentScenario,
    scenarioIterations: scenarioIterations.map((si) => ({
      ...si,
      type: si.version
        ? si.id === currentScenario.liveVersionId
          ? ('live version' as const)
          : ('version' as const)
        : ('draft' as const),
    })),
  });
}

export function useScenarioIterations() {
  const { scenarioIterations } = useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
  return scenarioIterations;
}

export type SortedScenarioIteration = ReturnType<typeof useScenarioIterations>;

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
