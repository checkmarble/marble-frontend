import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { updateWorkflowRule } from './update-rule.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const ruleId = params['ruleId'];
  invariant(ruleId, 'ruleId is required');

  if (request.method === 'PUT') {
    try {
      await updateWorkflowRule(scenario, await request.json());
    } catch (error) {
      console.error('Failed to update workflow rule:', error);

      // Handle validation errors specifically
      if (error instanceof Error && error.name === 'ZodError') {
        return Response.json(
          {
            error: 'Invalid request data',
            details: error.message,
          },
          { status: 400 },
        );
      }

      return Response.json({ error: 'Failed to update rule' }, { status: 500 });
    }

    return Response.json({ success: true });
  }

  if (request.method === 'DELETE') {
    try {
      await scenario.deleteWorkflowRule({ ruleId });
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('Failed to delete workflow rule:', error);
      return Response.json({ error: 'Failed to delete rule' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const ruleId = params['ruleId'];
  invariant(ruleId, 'ruleId is required');

  const rule = await scenario.getWorkflowRule({ ruleId });
  console.log('rule fetched', rule);
  return Response.json(rule);
}
