import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, i18nextService } = initServerServices(request);
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const t = await i18nextService.getFixedT(request, 'scenarios');
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const rule = await scenarioIterationRuleRepository.createRule({
      scenarioIterationId: iterationId,
      displayOrder: 1,
      formula: null,
      name: t('create_rule.default_name'),
      description: '',
      ruleGroup: '',
      scoreModifier: 0,
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/rules/:ruleId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
        ruleId: fromUUIDtoSUUID(rule.id),
      }),
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
      action={getRoute('/ressources/scenarios/:scenarioId/:iterationId/rules/create', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      })}
    >
      <Button
        type="submit"
        variant="tertiary"
        size="dropdown"
        disabled={fetcher.state === 'submitting'}
        className="w-full gap-2"
      >
        <Icon icon="plus" className="text-grey-00 size-5" />
        <div className="flex w-full flex-col items-start">
          <span className="text-grey-00 text-s font-normal">
            {t('scenarios:create_rule.title')}
          </span>
          <span className="text-grey-50 font-normal">{t('scenarios:create_rule.description')}</span>
        </div>
      </Button>
    </fetcher.Form>
  );
}
