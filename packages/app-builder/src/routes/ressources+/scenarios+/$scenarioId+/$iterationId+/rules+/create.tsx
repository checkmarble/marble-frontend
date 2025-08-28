import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, i18nextService } = initServerServices(request);
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const t = await i18nextService.getFixedT(request, ['scenarios']);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const rule = await scenarioIterationRuleRepository.createRule({
      scenarioIterationId: iterationId,
      displayOrder: 1,
      formula: null,
      name: t('scenarios:create_rule.default_name'),
      description: '',
      ruleGroup: '',
      scoreModifier: 0,
    });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId/rules/:ruleId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
        ruleId: fromUUIDtoSUUID(rule.id),
      }),
    });
  } catch (error) {
    return Response.json({ success: false, error: error });
  }
}
