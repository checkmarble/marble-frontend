import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/server-runtime';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const { astNode } = await request.json();

  const description = await scenarioIterationRuleRepository.getRuleDescription({ astNode });

  return Response.json({ success: true, data: description });
}
