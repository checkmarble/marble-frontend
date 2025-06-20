import { Nudge } from '@app-builder/components/Nudge';
import { isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioIterationSanctionRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const config = await scenarioIterationSanctionRepository.createSanctionCheckConfig({
      iterationId,
      changes: {
        name: 'Screening',
        ruleGroup: 'Screening',
        forcedOutcome: 'block_and_review',
      },
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
        sanctionId: fromUUIDtoSUUID(config.id as string),
      }),
    );
  } catch (error) {
    return json({
      success: false as const,
      error: error,
    });
  }
}

export function CreateSanction({
  scenarioId,
  iterationId,
  isSanctionAvailable,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['scenarios']);
  const fetcher = useFetcher<typeof action>();
  const disabled = useMemo(() => !isAccessible(isSanctionAvailable), [isSanctionAvailable]);

  return (
    <fetcher.Form
      method="POST"
      action={getRoute('/ressources/scenarios/:scenarioId/:iterationId/sanctions/create', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      })}
    >
      <Button
        type="submit"
        variant="dropdown"
        size="dropdown"
        disabled={disabled}
        className="w-full"
      >
        <div className="flex items-center gap-4">
          <Icon icon="plus" className="size-5" />
          <div className="flex w-full flex-col items-start">
            <span className="text-s font-normal">{t('scenarios:create_sanction.title')}</span>
            <span
              className={clsx('text-grey-50 font-normal', {
                'text-grey-80': disabled,
              })}
            >
              {t('scenarios:create_sanction.description')}
            </span>
          </div>
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
