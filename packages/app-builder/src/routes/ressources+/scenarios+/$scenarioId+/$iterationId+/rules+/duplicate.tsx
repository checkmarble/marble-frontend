import { duplicateRulePayloadSchema } from '@app-builder/queries/scenarios/duplicate-rule';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, i18nextService } = initServerServices(request);
  const iterationId = fromParams(params, 'iterationId');
  const scenarioId = fromParams(params, 'scenarioId');

  const [raw, t, { scenarioIterationRuleRepository }] = await Promise.all([
    request.json(),
    i18nextService.getFixedT(request, ['scenarios']),
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const payload = duplicateRulePayloadSchema.safeParse(raw);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    const {
      createdAt: _,
      name,
      ...rest
    } = await scenarioIterationRuleRepository.getRule({ ruleId: payload.data.ruleId });

    await scenarioIterationRuleRepository.createRule({
      name: t('scenarios:clone_rule.default_name', { name }),
      ...rest,
    });

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
