import { getScenarioIteration } from '@marble-front/api/marble';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { fromParams } from '@marble-front/builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Outlet, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const incrementId = fromParams(params, 'incrementId');

  const scenarioIteration = await getScenarioIteration(incrementId);

  return json(scenarioIteration);
}

export const useCurrentScenarioIteration = () =>
  useRouteLoaderData('routes/__builder/scenarios/$scenarioId/i/$incrementId');

export default function CurrentScenarioIterationProvider() {
  return <Outlet />;
}
