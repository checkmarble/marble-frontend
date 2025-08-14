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

      // Forward API error details to the client when available
      const anyError = error as any;
      const status: number | undefined = anyError?.status;
      const apiMessage: string | undefined = anyError?.data?.message ?? anyError?.message;
      const apiCode: string | undefined = anyError?.data?.error_code;

      if (typeof status === 'number') {
        return Response.json(
          {
            error: apiMessage ?? 'Failed to update rule',
            errorCode: apiCode ?? null,
          },
          { status },
        );
      }

      return Response.json(
        { error: apiMessage ?? 'Failed to update rule', errorCode: apiCode ?? null },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  }

  if (request.method === 'DELETE') {
    try {
      await scenario.deleteWorkflowRule({ ruleId });
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('Failed to delete workflow rule:', error);
      const anyError = error as any;
      const status: number | undefined = anyError?.status;
      const apiMessage: string | undefined = anyError?.data?.message ?? anyError?.message;
      const apiCode: string | undefined = anyError?.data?.error_code;
      if (typeof status === 'number') {
        return Response.json(
          { error: apiMessage ?? 'Failed to delete rule', errorCode: apiCode ?? null },
          { status },
        );
      }
      return Response.json(
        { error: apiMessage ?? 'Failed to delete rule', errorCode: apiCode ?? null },
        { status: 500 },
      );
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
