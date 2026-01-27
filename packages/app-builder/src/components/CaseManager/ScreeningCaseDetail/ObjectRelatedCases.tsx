import { CaseStatusBadge } from '@app-builder/components/Cases';
import { Spinner } from '@app-builder/components/Spinner';
import { Case } from '@app-builder/models/cases';
import { useRelatedCasesByObjectQuery } from '@app-builder/queries/cases/related-cases-by-object';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { CtaV2ClassName, cn } from 'ui-design-system';

const cellVariants = cva('border-grey-border border-t p-2', {
  variants: {
    isLast: {
      true: 'border-b',
      false: null,
    },
  },
  defaultVariants: {
    isLast: false,
  },
});

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
        <div className="border-red-disabled bg-red-background text-red-primary mt-3 rounded-sm border p-2">
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
        <div className={cn('p-v2-md rounded-v2-md', className)}>
          <div className="flex flex-col gap-v2-md">
            <div className="font-medium">{t('cases:case_detail.pivot_panel.case_history')}</div>
            <div className="grid w-full grid-cols-[auto_1fr_auto_auto]">
              {cases.map((caseObj, idx) => {
                const isLast = idx === cases.length - 1;

                return (
                  <Fragment key={caseObj.id}>
                    <div
                      className={cellVariants({
                        isLast,
                        className: 'shrink border-r leading-[28px]',
                      })}
                    >
                      {formatDateTime(caseObj.createdAt, { dateStyle: 'short' })}
                    </div>
                    <div
                      className={cellVariants({
                        isLast,
                        className: 'shrink truncate leading-[28px]',
                      })}
                    >
                      {caseObj.name}
                    </div>
                    <div className={cellVariants({ isLast, className: 'shrink-0' })}>
                      <Link
                        to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseObj.id) })}
                        className={CtaV2ClassName({ variant: 'secondary' })}
                      >
                        {t('common:open')}
                      </Link>
                    </div>
                    <div className={cellVariants({ isLast, className: 'flex items-center border-l' })}>
                      <CaseStatusBadge
                        status={caseObj.status}
                        showText={false}
                        showBackground={false}
                        outcome={caseObj.outcome}
                      />
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
