import { Nudge } from '@app-builder/components/Nudge';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import clsx from 'clsx';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, i18nextService } = serverServices;
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );
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
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
        ruleId: fromUUID(rule.id),
      }),
    );
  } catch (error) {
    return {
      success: false as const,
      error: error,
    };
  }
}

export function CreateSanction({
  scenarioId,
  iterationId,
  isSanctionAvailable,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessDto;
}) {
  const { t } = useTranslation(['scenarios']);
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form
      method="POST"
      action={getRoute(
        '/ressources/scenarios/:scenarioId/:iterationId/sanctions/create',
        {
          scenarioId: fromUUID(scenarioId),
          iterationId: fromUUID(iterationId),
        },
      )}
    >
      <Button
        type="submit"
        variant="dropdown"
        size="dropdown"
        disabled={
          fetcher.state === 'submitting' || isSanctionAvailable === 'restricted'
        }
        className="w-full gap-2"
      >
        <Icon icon="plus" className="size-5" />
        <div className="flex w-full flex-col items-start">
          <span className="text-s font-normal">
            {t('scenarios:create_sanction.title')}
          </span>
          <span
            className={clsx('text-grey-50 font-normal', {
              'text-grey-80': isSanctionAvailable === 'restricted',
            })}
          >
            {t('scenarios:create_sanction.description')}
          </span>
        </div>
        {isSanctionAvailable !== 'allowed' ? (
          <Nudge
            kind={isSanctionAvailable}
            content={t('scenarios:sanction.nudge')}
            className="p-1"
          />
        ) : null}
      </Button>
    </fetcher.Form>
  );
}
