import { type DecisionOutcomesPerDayQuery } from '@app-builder/models/analytics';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import { useParams } from '@remix-run/react';

export async function action({ request }: ActionFunctionArgs) {
  const { queryName } = useParams();
  const { authService } = initServerServices(request);
  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const { analytics } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const query = await analytics.getDecisionOutcomesPerDay(
    queryName as unknown as DecisionOutcomesPerDayQuery,
  );
  return Response.json(query);
}
