import { authenticator } from '@app-builder/services/auth/auth.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
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
