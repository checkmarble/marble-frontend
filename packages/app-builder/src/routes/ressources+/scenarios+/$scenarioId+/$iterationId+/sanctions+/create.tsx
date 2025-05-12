import { Nudge } from '@app-builder/components/Nudge';
import { isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import clsx from 'clsx';
import type { Namespace } from 'i18next';
import type { FeatureAccessDto } from 'marble-api/generated/license-api';
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
    await scenarioIterationSanctionRepository.upsertSanctionCheckConfig({
      iterationId,
      changes: {
        name: 'Sanction Check',
        ruleGroup: 'Sanction Check',
        forcedOutcome: 'block_and_review',
      },
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/sanction', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
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
  hasAlreadyASanction,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessDto;
  hasAlreadyASanction: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  const fetcher = useFetcher<typeof action>();

  const disabled = useMemo(
    () => hasAlreadyASanction || !isAccessible(isSanctionAvailable),
    [hasAlreadyASanction, isSanctionAvailable],
  );

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
              {hasAlreadyASanction
                ? t('scenarios:already_one_sanction')
                : t('scenarios:create_sanction.description')}
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
