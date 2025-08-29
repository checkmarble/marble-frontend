import { deleteRulePayloadSchema } from '@app-builder/queries/scenarios/delete-rule';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { type Namespace } from 'i18next';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const iterationId = fromParams(params, 'iterationId');
  const scenarioId = fromParams(params, 'scenarioId');
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const raw = await request.json();
  const payload = deleteRulePayloadSchema.safeParse(raw);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await scenarioIterationRuleRepository.deleteRule({ ruleId: payload.data.ruleId });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      }),
    });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
