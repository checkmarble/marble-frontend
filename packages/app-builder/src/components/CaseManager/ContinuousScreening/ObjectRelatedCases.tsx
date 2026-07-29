import { CaseStatusBadgeV2 } from '@app-builder/components/Cases';
import { Spinner } from '@app-builder/components/Spinner';
import { Case } from '@app-builder/models/cases';
import { useRelatedCasesByObjectQuery } from '@app-builder/queries/cases/related-cases-by-object';
import { useFormatDateTime } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { CtaV2ClassName, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function ObjectRelatedCases({
  currentCase,
  objectType,
  objectId,
  className,
}: {
  currentCase: Case;
  objectType: string;
  objectId: string;
  className?: string;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const casesQuery = useRelatedCasesByObjectQuery(objectType, objectId);
  const formatDateTime = useFormatDateTime();

  return match(casesQuery)
    .with({ isError: true }, () => {
      return (
        <div className="border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border p-sm">
          {t('common:global_error')}
        </div>
      );
    })
    .with({ isPending: true }, () => {
      return <Spinner className="size-6" />;
    })
    .otherwise((query) => {
      const cases = query.data?.cases.filter((caseObj) => caseObj.id !== currentCase.id) ?? [];
      if (cases.length === 0) {
        return null;
      }

      return (
        <div className={cn('p-md rounded-md', className)}>
          <div className="flex flex-col gap-md">
            <div className="font-medium">{t('cases:case_detail.pivot_panel.case_history')}</div>
            <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-md">
              {cases.map((caseObj) => {
                return (
                  <Fragment key={caseObj.id}>
                    <div>{formatDateTime(caseObj.createdAt, { dateStyle: 'short' })}</div>
                    <div className="flex gap-sm items-center">
                      <span>{caseObj.name}</span>
                      <CaseStatusBadgeV2 status={caseObj.status} variant="icon-only" outcome={caseObj.outcome} />
                    </div>
                    <div>
                      <Link
                        to="/cases/$caseId"
                        params={{ caseId: fromUUIDtoSUUID(caseObj.id) }}
                        className={CtaV2ClassName({ variant: 'secondary', appearance: 'link', mode: 'icon' })}
                      >
                        <Icon icon="external-link" className="size-4" />
                      </Link>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      );
    });
}
