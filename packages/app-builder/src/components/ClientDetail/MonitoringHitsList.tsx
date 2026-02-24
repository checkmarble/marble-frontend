import { Case } from '@app-builder/models/cases';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, CtaV2ClassName } from 'ui-design-system';

const MAX_ROWS = 3;

type MonitoringHitsListProps = {
  monitoringHitsQuery: UseQueryResult<{ cases: Case[] } | undefined>;
  showAll?: boolean;
};

export const MonitoringHitsList = ({ monitoringHitsQuery, showAll = false }: MonitoringHitsListProps) => {
  const { t } = useTranslation(['common']);
  const formatDateTime = useFormatDateTime();

  return (
    <div>
      {match(monitoringHitsQuery)
        .with({ isError: true }, () => {
          return (
            <div className="flex flex-col gap-v2-sm items-center justify-center h-full">
              <span className="text-s text-grey-60 text-center">{t('common:generic_fetch_data_error')}</span>
              <Button variant="secondary" onClick={() => monitoringHitsQuery.refetch()}>
                {t('common:retry')}
              </Button>
            </div>
          );
        })
        .with({ isPending: true }, () => {
          return <div>{t('common:loading')}</div>;
        })
        .with({ isSuccess: true }, ({ data: { cases } = { cases: [] } }) => {
          if (cases.length === 0) {
            return (
              <div className="flex flex-col gap-v2-sm text-small">
                <span className="text-grey-secondary">{t('common:no_data_to_display')}</span>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-v2-md">
              {(showAll ? cases : cases.slice(0, MAX_ROWS)).map((caseItem) => (
                <div key={caseItem.id} className="grid grid-cols-[auto_1fr_auto] gap-v2-sm items-center">
                  <span className="text-grey-secondary pr-4">{formatDateTime(caseItem.createdAt)}</span>
                  <span>{caseItem.name}</span>
                  <span>
                    <Link
                      to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseItem.id) })}
                      className={CtaV2ClassName({ variant: 'primary', appearance: 'stroked' })}
                    >
                      {t('common:open')}
                    </Link>
                  </span>
                </div>
              ))}
            </div>
          );
        })
        .exhaustive()}
    </div>
  );
};
