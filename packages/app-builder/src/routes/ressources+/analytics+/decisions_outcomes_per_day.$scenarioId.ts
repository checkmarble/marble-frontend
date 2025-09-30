import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';

const urlParamsSchema = z.object({
  scenarioId: z.uuidv4(),
});

const queryParamsSchema = z.object({
  dateRange: z.object({
    start: z.iso.datetime(),
    end: z.iso.datetime(),
  }),
  compareDateRange: z
    .object({
      start: z.iso.datetime(),
      end: z.iso.datetime(),
    })
    .optional(),
  scenarioVersion: z.number().optional(),
  trigger: z
    .array(
      z.object({
        field: z.uuidv4(),
        op: z.enum(['=', '!=', '>', '>=', '<', '<=']),
        values: z.array(z.string()),
      }),
    )
    .optional()
    .default([]),
});

export async function action({ params, request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const { analytics } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const urlParams = urlParamsSchema.parse(params);

  const body = await request.json();
  const queryParams = queryParamsSchema.parse(body);

  const query = await analytics.getDecisionOutcomesPerDay({
    ...queryParams,
    scenarioId: urlParams.scenarioId,
  });
  //   console.log('query', JSON.stringify(query, null,  ));
  return Response.json(query);
}
