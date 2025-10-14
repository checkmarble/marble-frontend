import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/server-runtime';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const { scenarioId, astNode } = await request.json();

  try {
    const { description, isRuleValid } = await scenarioIterationRuleRepository.getRuleDescription({
      scenarioId,
      astNode,
    });
    return Response.json({ success: true, data: { description, isRuleValid } });
  } catch (error) {
    return Response.json({ success: false, error: error });
  }
}
