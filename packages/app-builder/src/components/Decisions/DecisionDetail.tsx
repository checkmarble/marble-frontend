import { CaseStatus, decisionsI18n } from '@app-builder/components';
import { type DecisionDetail } from '@app-builder/models/decision';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

export function DecisionDetail({ decision }: { decision: DecisionDetail }) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  const { case: caseDetail, createdAt, scenario, triggerObjectType } = decision;

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('decisions:decision_detail.title')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-[max-content_1fr] grid-rows-4 items-center gap-x-10 gap-y-2">
          <DetailLabel>{t('decisions:created_at')}</DetailLabel>
          <time dateTime={createdAt}>
            {formatDateTime(createdAt, { language })}
          </time>
          <DetailLabel>{t('decisions:scenario.name')}</DetailLabel>
          <Link
            to={getRoute('/scenarios/:scenarioId', {
              scenarioId: fromUUID(scenario.id),
            })}
            className="hover:text-purple-120 focus:text-purple-120 font-semibold capitalize text-purple-100 hover:underline focus:underline"
          >
            {scenario.name}
          </Link>
          <DetailLabel>{t('decisions:object_type')}</DetailLabel>
          <div className="capitalize">{triggerObjectType}</div>
          <DetailLabel>{t('decisions:case')}</DetailLabel>
          {caseDetail ? (
            <div className="flex w-fit flex-row items-center justify-center gap-1">
              <CaseStatus status={caseDetail.status} />
              <Link
                to={getRoute('/cases/:caseId', {
                  caseId: fromUUID(caseDetail.id),
                })}
                className="hover:text-purple-120 focus:text-purple-120 font-semibold capitalize text-purple-100 hover:underline focus:underline"
              >
                {caseDetail.name}
              </Link>
            </div>
          ) : (
            <div>-</div>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

const DetailLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold capitalize">{children}</div>
);
