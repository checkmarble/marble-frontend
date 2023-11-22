import { decisionsI18n } from '@app-builder/components';
import { Score } from '@app-builder/components/Decisions/Score';
import { formatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { type Decision } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

export const DecisionDetail = ({ decision }: { decision: Decision }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(decisionsI18n);
  const {
    case: caseDetail,
    created_at,
    scenario,
    trigger_object_type,
    score,
  } = decision;

  return (
    <Collapsible.Container>
      <Collapsible.Title>
        {t('decisions:decision_detail.title')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-[max-content_1fr] grid-rows-5 items-center gap-x-10 gap-y-2">
          <DetailLabel>{t('decisions:created_at')}</DetailLabel>
          <div>{formatDateTime(created_at, { language })}</div>
          <DetailLabel>{t('decisions:scenario.name')}</DetailLabel>
          <Link
            to={getRoute('/scenarios/:scenarioId', {
              scenarioId: fromUUID(scenario.id),
            })}
            className="font-semibold capitalize text-purple-100"
          >
            {scenario.name}
          </Link>
          <DetailLabel>{t('decisions:object_type')}</DetailLabel>
          <div className="capitalize">{trigger_object_type}</div>
          <DetailLabel>{t('decisions:case')}</DetailLabel>
          {caseDetail ? (
            <Link
              to={getRoute('/cases/:caseId', {
                caseId: fromUUID(caseDetail.id),
              })}
              className="font-semibold capitalize text-purple-100"
            >
              {caseDetail.name}
            </Link>
          ) : (
            <div>-</div>
          )}
          <DetailLabel>{t('decisions:score')}</DetailLabel>
          <Score score={score} />
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const DetailLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold capitalize">{children}</div>
);
