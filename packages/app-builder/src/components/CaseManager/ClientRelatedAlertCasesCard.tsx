import { CaseStatusBadgeV2 } from '@app-builder/components/Cases/CaseStatus';
import { usePivotRelatedCasesQuery } from '@app-builder/queries/pivot-related-cases';
import { useFormatDateTime } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, CtaV2ClassName } from 'ui-design-system';

type ClientRelatedAlertCasesCardProps = {
  caseId: string;
  pivotValue: string;
};

export function ClientRelatedAlertCasesCard({ caseId, pivotValue }: ClientRelatedAlertCasesCardProps) {
  const { t } = useTranslation(['common', 'cases']);
  const casesQuery = usePivotRelatedCasesQuery(pivotValue);
  const formatDateTime = useFormatDateTime();

  return (
    <Card>
      {match(casesQuery)
        .with({ isError: true }, () => {
          return (
            <div className="border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border">
              {t('common:global_error')}
            </div>
          );
        })
        .with({ isPending: true }, () => {
          return <>{t('common:loading')}</>;
        })
        .otherwise((query) => {
          const cases = query.data.cases.filter((caseObj) => caseObj.id !== caseId);
          if (cases.length === 0) {
            return <>{t('cases:manager.related_cases.no_cases')}</>;
          }

          return (
            <div className="grid w-full grid-cols-[minmax(8rem,_auto)_1fr_auto] gap-sm">
              {cases.map((caseObj, idx) => {
                return (
                  <div className="grid grid-cols-subgrid col-span-full items-center" key={caseObj.id}>
                    <span className="text-grey-secondary">
                      {formatDateTime(caseObj.createdAt, { dateStyle: 'short' })}
                    </span>
                    <div className="flex items-center gap-xs">
                      <span>{caseObj.name}</span>
                      <CaseStatusBadgeV2 status={caseObj.status} variant="icon-only" />
                    </div>
                    <Link
                      to="/cases/s/$caseId"
                      params={{ caseId: fromUUIDtoSUUID(caseObj.id) }}
                      className={CtaV2ClassName({ variant: 'primary', appearance: 'stroked' })}
                    >
                      {t('common:open')}
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        })}
    </Card>
  );
}
