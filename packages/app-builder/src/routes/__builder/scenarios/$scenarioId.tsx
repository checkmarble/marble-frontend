import { ErrorComponent } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useRouteError, useRouteLoaderData } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenario = await apiClient.getScenario(scenarioId);

  return json(scenario);
}

export const useCurrentScenario = () =>
  useRouteLoaderData('routes/__builder/scenarios/$scenarioId') as SerializeFrom<
    typeof loader
  >;

export default function CurrentScenarioProvider() {
  return <Outlet />;
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
