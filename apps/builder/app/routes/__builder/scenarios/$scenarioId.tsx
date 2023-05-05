import { getScenario } from '@marble-front/api/marble';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { fromParams } from '@marble-front/builder/utils/short-uuid';
import { json, type LoaderArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenario = await getScenario(scenarioId);

  return json(scenario);
}

export const useCurrentScenario = () =>
  useRouteLoaderData('routes/__builder/scenarios/$scenarioId') as SerializeFrom<
    typeof loader
  >;

export default function CurrentScenarioProvider() {
  return <Outlet />;
}
