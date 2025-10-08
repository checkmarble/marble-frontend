import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
});

const queryParamsSchema = z.object({
  start: z.iso.datetime(),
  end: z.iso.datetime(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { analytics } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const urlParams = urlParamsSchema.parse(params);
  const queryParams = queryParamsSchema.parse(await request.json());

  const query = await analytics.getAvailableFilters({
    scenarioId: urlParams.scenarioId,
    start: queryParams.start,
    end: queryParams.end,
  });
  return Response.json(query);
}
