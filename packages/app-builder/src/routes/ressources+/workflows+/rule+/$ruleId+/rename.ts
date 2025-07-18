import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const ruleId = params['ruleId'];
  invariant(ruleId, 'ruleId is required');

  if (request.method === 'PUT') {
    const { name, fallthrough } = (await request.json()) as {
      name: string;
      fallthrough: boolean;
    };

    try {
      await apiClient.updateWorkflowRule(ruleId, {
        name,
        fallthrough,
      });

      return Response.json({ success: true });
    } catch (error) {
      console.error('Failed to rename workflow rule:', error);
      return Response.json({ error: 'Failed to rename rule' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
