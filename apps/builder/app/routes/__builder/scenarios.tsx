import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getScenarios } from '@marble-front/builder/services/marble-api/scenarios';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  /** TODO(data): get list from API */
  const scenarios = await getScenarios();

  return json(scenarios);
}

export default function ScenariosPage() {
  return <Outlet />;
}
