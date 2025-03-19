import { ErrorComponent } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { adaptScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useRouteError, useRouteLoaderData } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const currentScenario = useCurrentScenario();

      return (
        <div className="flex flex-row items-center gap-4">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/scenarios/:scenarioId', {
              scenarioId: fromUUID(currentScenario.id),
            })}
          >
            {currentScenario.name}
          </BreadCrumbLink>
          <TriggerObjectTag>{currentScenario.triggerObjectType}</TriggerObjectTag>
        </div>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
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

  return {
    currentScenario,
    scenarioIterations: scenarioIterations.map((dto) =>
      adaptScenarioIterationWithType(dto, currentScenario.liveVersionId),
    ),
  };
}

export function useScenarioIterations() {
  const { scenarioIterations } = useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
  return scenarioIterations;
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
