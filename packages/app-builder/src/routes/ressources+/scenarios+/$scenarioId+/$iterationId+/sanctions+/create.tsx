import { Nudge } from '@app-builder/components/Nudge';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

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

  return (
    <Link
      to={getRoute('/scenarios/:scenarioId/i/:iterationId/sanction', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
      })}
    >
      <Button
        variant="dropdown"
        size="dropdown"
        disabled={hasAlreadyASanction || isSanctionAvailable === 'restricted'}
        className="w-full"
      >
        <div className="flex items-center gap-4">
          <Icon icon="plus" className="size-5" />
          <div className="flex w-full flex-col items-start">
            <span className="text-s font-normal">
              {t('scenarios:create_sanction.title')}
            </span>
            <span
              className={clsx('text-grey-50 font-normal', {
                'text-grey-80':
                  isSanctionAvailable === 'restricted' || hasAlreadyASanction,
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
    </Link>
  );
}
