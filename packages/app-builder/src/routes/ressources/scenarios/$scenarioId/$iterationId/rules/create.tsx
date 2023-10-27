import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Plus } from 'ui-icons';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function action({ request, params }: ActionArgs) {
  const { authService, i18nextService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const t = await i18nextService.getFixedT(request, 'scenarios');
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const { rule } = await apiClient.createScenarioIterationRule({
      scenarioIterationId: iterationId,
      displayOrder: 1,
      formula_ast_expression: null,
      name: t('create_rule.default_name'),
      description: '',
      scoreModifier: 0,
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/rules/:ruleId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
        ruleId: fromUUID(rule.id),
      })
    );
  } catch (error) {
    return json({
      success: false as const,
      error: error,
    });
  }
}

export function CreateRule({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form
      method="POST"
      action={`/ressources/scenarios/${fromUUID(scenarioId)}/${fromUUID(
        iterationId
      )}/rules/create`}
    >
      <Button type="submit" disabled={fetcher.state === 'submitting'}>
        <Plus width={'24px'} height={'24px'} />
        {t('scenarios:create_rule.title')}
      </Button>
    </fetcher.Form>
  );
}
