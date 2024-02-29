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

  const currentScenario = await scenario.getScenario({ scenarioId });

  return json(currentScenario);
}

export const useCurrentScenario = () =>
  useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;

export default function CurrentScenarioProvider() {
  return <Outlet />;
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
