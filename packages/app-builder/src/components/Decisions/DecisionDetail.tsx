import { CaseStatusBadge, decisionsI18n } from '@app-builder/components';
import { type DecisionDetails } from '@app-builder/models/decision';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

export function DecisionDetail({ decision }: { decision: DecisionDetails }) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  const { case: caseDetail, createdAt, scenario, triggerObjectType } = decision;

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>{t('decisions:decision_detail.title')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-2">
          <DetailLabel>{t('decisions:created_at')}</DetailLabel>
          <time dateTime={createdAt}>
            {formatDateTimeWithoutPresets(createdAt, {
              language,
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </time>

          <DetailLabel>{t('decisions:scenario.name')}</DetailLabel>
          <Link
            to={getRoute('/scenarios/:scenarioId', {
              scenarioId: fromUUIDtoSUUID(scenario.id),
            })}
            className="hover:text-purple-60 focus:text-purple-60 text-purple-65 font-semibold hover:underline focus:underline"
          >
            {scenario.name}
          </Link>

          <DetailLabel>{t('decisions:scenario.version')}</DetailLabel>
          <Link
            to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
              scenarioId: fromUUIDtoSUUID(scenario.id),
              iterationId: fromUUIDtoSUUID(scenario.scenarioIterationId),
            })}
            className="hover:text-purple-60 focus:text-purple-60 text-purple-65 font-semibold hover:underline focus:underline"
          >
            {`V${scenario.version}`}
          </Link>

          <DetailLabel>{t('decisions:object_type')}</DetailLabel>
          <div>{triggerObjectType}</div>

          <DetailLabel>{t('decisions:case')}</DetailLabel>
          {caseDetail ? (
            <div className="flex w-fit flex-row items-center justify-center gap-1 align-baseline">
              <CaseStatusBadge status={caseDetail.status} />
              <Link
                to={getRoute('/cases/:caseId', {
                  caseId: fromUUIDtoSUUID(caseDetail.id),
                })}
                className="hover:text-purple-60 focus:text-purple-60 text-purple-65 font-semibold hover:underline focus:underline"
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
  <div className="font-semibold first-letter:capitalize">{children}</div>
);
