import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';
import { Button } from '@ui-design-system';
import { Plus } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function action({ request, params }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const { rule } = await apiClient.createScenarioIterationRule({
      scenarioIterationId: iterationId,
      displayOrder: 1,
      formula_ast_expression: null,
      name: '',
      description: '',
      scoreModifier: 0,
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/edit/rules/:ruleId', {
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
    <Form
      onSubmit={() => {
        fetcher.submit(null, {
          method: 'POST',
          action: `/ressources/scenarios/${fromUUID(scenarioId)}/${fromUUID(
            iterationId
          )}/rules/create`,
        });
      }}
    >
      <Button type="submit">
        <Plus width={'24px'} height={'24px'} />
        {t('scenarios:create_rule.title')}
      </Button>
    </Form>
  );
}
