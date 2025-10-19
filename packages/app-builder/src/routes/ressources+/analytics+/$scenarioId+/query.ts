import { analyticsQuery } from '@app-builder/models/analytics';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
});

export async function action({ params, request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { analytics } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    const urlParams = urlParamsSchema.parse(params);

    const body = await request.json();

    const queryParams = analyticsQuery.parse({
      ...body,
      scenarioId: urlParams.scenarioId,
    });

    const [decisionOutcomesPerDay, ruleHitTable] = await Promise.all([
      await analytics.getDecisionOutcomesPerDay({
        ...queryParams,
        scenarioId: urlParams.scenarioId,
      }),
      await analytics.getRuleHitTable({
        ...queryParams,
        scenarioId: urlParams.scenarioId,
      }),
    ]);

    return Response.json({
      decisionOutcomesPerDay,
      ruleHitTable,
    });
  } catch (error) {
    console.error('error in analytics query', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
