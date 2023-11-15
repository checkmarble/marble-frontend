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

  return (
    <Collapsible.Container>
      <Collapsible.Title>
        {t('decisions:decision_detail.title')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-[minmax(min-content,_1fr)_4fr] grid-rows-4 items-center gap-x-8 gap-y-4">
          <DetailLabel>{t('decisions:created_at')}</DetailLabel>
          <div>{formatDateTime(decision.created_at, { language })}</div>
          <DetailLabel>{t('decisions:scenario.name')}</DetailLabel>
          <Link
            to={getRoute('/scenarios/:scenarioId', {
              scenarioId: fromUUID(decision.scenario.id),
            })}
          >
            <div className="font-semibold capitalize text-purple-100">
              {decision.scenario.name}
            </div>
          </Link>
          <DetailLabel>{t('decisions:object_type')}</DetailLabel>
          <div className="capitalize">{decision.trigger_object_type}</div>
          {/* <DetailLabel>{t('decisions:case')}</DetailLabel>
        <div>-</div> */}
          <DetailLabel>{t('decisions:score')}</DetailLabel>
          <Score score={decision.score} />
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const DetailLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold capitalize">{children}</div>
);
