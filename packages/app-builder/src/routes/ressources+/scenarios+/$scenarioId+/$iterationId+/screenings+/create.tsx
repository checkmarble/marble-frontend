import { Nudge } from '@app-builder/components/Nudge';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateScreeningRuleMutation } from '@app-builder/queries/scenarios/create-screening-rule';
import { isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
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
  const { authService, i18nextService } = initServerServices(request);
  const { scenarioIterationScreeningRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const t = await i18nextService.getFixedT(request, ['scenarios']);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  try {
    const config = await scenarioIterationScreeningRepository.createScreeningConfig({
      iterationId,
      changes: {
        name: t('scenarios:create_sanction.default_name'),
        ruleGroup: 'Screening',
        forcedOutcome: 'block_and_review',
      },
    });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId/screenings/:screeningId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
        screeningId: fromUUIDtoSUUID(config.id as string),
      }),
    });
  } catch (error) {
    return Response.json({ success: false, error: error });
  }
}

export function CreateScreening({
  scenarioId,
  iterationId,
  isSanctionAvailable,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['scenarios']);
  const createScreeningRuleMutation = useCreateScreeningRuleMutation(scenarioId, iterationId);
  const disabled = useMemo(() => !isAccessible(isSanctionAvailable), [isSanctionAvailable]);
  const revalidate = useLoaderRevalidator();

  const handleCreateScreeningRule = () => {
    createScreeningRuleMutation.mutateAsync().then(() => {
      revalidate();
    });
  };

  return (
    <Button
      type="submit"
      variant="dropdown"
      size="dropdown"
      disabled={disabled}
      className="w-full"
      onClick={handleCreateScreeningRule}
    >
      <div className="flex items-center gap-4">
        <Icon icon="plus" className="size-5" />
        <div className="flex w-full flex-col items-start">
          <span className="font-normal">{t('scenarios:create_sanction.title')}</span>
          <span
            className={clsx('text-s text-grey-50 font-normal', {
              'text-grey-80': disabled,
            })}
          >
            {t('scenarios:create_sanction.description')}
          </span>
        </div>
      </div>
      {isSanctionAvailable !== 'allowed' ? (
        <Nudge kind={isSanctionAvailable} content={t('scenarios:sanction.nudge')} className="p-1" />
      ) : null}
    </Button>
  );
}
