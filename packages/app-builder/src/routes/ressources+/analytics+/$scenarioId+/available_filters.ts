import { dateRangeFilterSchema } from '@app-builder/models/analytics';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
});

const queryParamsSchema = z.object({
  ranges: z.array(dateRangeFilterSchema).min(1),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { analytics } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    const urlParams = urlParamsSchema.parse(params);
    const queryParams = queryParamsSchema.parse(await request.json());
    const query = await analytics.getAvailableFilters({
      scenarioId: urlParams.scenarioId,
      ranges: queryParams.ranges,
    });
    return Response.json({ success: true, data: query });
  } catch (error) {
    console.error('error in available_filters', error);
    return Response.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
