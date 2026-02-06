import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  // Redirect to the first scenario's analytics
  const scenarios = await scenario.listScenarios();
  const firstScenario = scenarios[0];

  if (firstScenario) {
    return redirect(
      getRoute('/detection/analytics/:scenarioId', {
        scenarioId: fromUUIDtoSUUID(firstScenario.id),
      }),
    );
  }

  // If no scenarios, redirect to scenarios page
  return redirect(getRoute('/detection/scenarios'));
}

export default function AnalyticsIndex() {
  return null;
}
