import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

const schema = z.object({
  scenario_id: z.uuid(),
  name: z.string().min(1),
  fallthrough: z.boolean(),
  conditions: z.array(z.any()),
  actions: z.array(z.any()),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: z.treeifyError(result.error).fieldErrors }, { status: 400 });
  }

  const { scenario_id, name, fallthrough } = result.data;

  try {
    const rule = await scenario.createWorkflowRule({
      scenarioId: scenario_id,
      name,
      fallthrough,
    });

    // add a default DISABLED action
    const action = await scenario.createWorkflowAction({
      ruleId: rule.id,
      action: {
        id: 'default-disabled-action',
        action: 'DISABLED',
      },
    });

    return Response.json(action, { status: 201 });
  } catch (error) {
    console.error('Failed to create workflow rule:', error);
    return Response.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}
