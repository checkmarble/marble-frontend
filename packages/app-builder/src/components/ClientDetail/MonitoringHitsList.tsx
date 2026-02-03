import { useRelatedCasesByObjectQuery } from '@app-builder/queries/cases/related-cases-by-object';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';

type MonitoringHitsListProps = {
  objectType: string;
  objectId: string;
};

export const MonitoringHitsList = ({ objectType, objectId }: MonitoringHitsListProps) => {
  const { t } = useTranslation(['common']);
  const relatedCasesQuery = useRelatedCasesByObjectQuery(objectType, objectId);

  return (
    <div>
      {match(relatedCasesQuery)
        .with({ isError: true }, () => {
          return (
            <div className="flex flex-col gap-v2-sm items-center justify-center h-full">
              <span className="text-s text-grey-60 text-center">{t('common:generic_fetch_data_error')}</span>
              <ButtonV2 variant="secondary" onClick={() => relatedCasesQuery.refetch()}>
                {t('common:retry')}
              </ButtonV2>
            </div>
          );
        })
        .with({ isPending: true }, () => {
          return <div>Loading...</div>;
        })
        .with({ isSuccess: true }, ({ data: { cases } = { cases: [] } }) => {
          if (cases.length === 0) {
            return (
              <div className="flex flex-col gap-v2-sm text-small">
                <span className="text-grey-secondary">{t('common:no_data_found')}</span>
              </div>
            );
          }

          return <div>Data</div>;
        })
        .exhaustive()}
    </div>
  );
};
