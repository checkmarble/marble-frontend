import { CloseCase } from '@app-builder/components/Cases/CloseCase';
import { EditCaseAssignee } from '@app-builder/components/Cases/EditAssignee';
import { EditCaseInbox } from '@app-builder/components/Cases/EditCaseInbox';
import { EditCaseName } from '@app-builder/components/Cases/EditCaseName';
import { EditCaseTags } from '@app-builder/components/Cases/EditTags';
import { EscalateCase } from '@app-builder/components/Cases/EscalateCase';
import { OpenCase } from '@app-builder/components/Cases/OpenCase';
import { type CaseDetail } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  ContinuousScreeningBase,
  isDirectContinuousScreening,
  isIndirectContinuousScreening,
} from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { getHigherCategory } from '@app-builder/models/screening';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { Tag, TagProps } from 'ui-design-system';

type CaseDetailInfoProps = {
  caseDetail: CaseDetail;
  caseInbox: Inbox;
  isUserAdmin: boolean;
};

export const CaseDetailInfo = ({ caseDetail, caseInbox, isUserAdmin }: CaseDetailInfoProps) => {
  const { t } = useTranslation(['cases']);
  const formatDateTime = useFormatDateTime();
  const { currentUser } = useOrganizationDetails();
  const screening = caseDetail.continuousScreenings[0];
  const hasRemainingMatchesToExamine = screening?.matches.some((match) => match.status === 'pending');

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="grid grid-cols-[1fr_auto] gap-v2-lg items-start">
        <div className="flex flex-col">
          <div className="flex gap-v2-xs items-center">
            {screening ? <ReviewStatusBadge status={screening.status} /> : null}
            <EditCaseName name={caseDetail.name} id={caseDetail.id} />
          </div>
          {screening ? <ScreeningCaseSubtitle screening={screening} /> : null}
        </div>
        <div className="flex gap-v2-sm">
          <EscalateCase id={caseDetail.id} inboxId={caseInbox.id} isAdminUser={isUserAdmin} />
          {caseDetail.status !== 'closed' ? (
            <CloseCase withoutOutcome id={caseDetail.id} disabled={hasRemainingMatchesToExamine} />
          ) : (
            <OpenCase id={caseDetail.id} />
          )}
        </div>
      </div>
      <div className="text-small grid grid-cols-[repeat(2,_minmax(auto,_calc(var(--spacing)_*_35))_1fr)] gap-v2-sm p-v2-md rounded-lg border border-grey-border bg-surface-card">
        <div className="grid grid-cols-subgrid col-span-full h-8 items-center">
          <div className="text-grey-secondary">{t('cases:case.date')}</div>
          <div>{formatDateTime(caseDetail.createdAt, { dateStyle: 'short' })}</div>
          <div className="text-grey-secondary">{t('cases:case.tags')}</div>
          <div className="flex gap-v2-xs">
            <EditCaseTags id={caseDetail.id} tagIds={caseDetail.tags.map(({ tagId }) => tagId)} />
          </div>
        </div>
        <div className="grid grid-cols-subgrid col-span-full h-8 items-center">
          <div className="text-grey-secondary">{t('cases:case.inbox')}</div>
          <div>
            <EditCaseInbox id={caseDetail.id} inboxId={caseDetail.inboxId} />
          </div>
          <div className="text-grey-secondary">{t('cases:assigned_to')}</div>
          <div className="flex gap-v2-xs">
            <EditCaseAssignee
              currentUser={currentUser}
              assigneeId={caseDetail.assignedTo}
              id={caseDetail.id}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CONTINUOUS_SCREENING_STATUS_COLOR_MAP: Record<ContinuousScreeningBase['status'], TagProps['color']> = {
  in_review: 'orange',
  confirmed_hit: 'red',
  no_hit: 'green',
};

function ReviewStatusBadge({ status }: { status: ContinuousScreeningBase['status'] }) {
  const { t } = useTranslation(['screenings']);
  return <Tag color={CONTINUOUS_SCREENING_STATUS_COLOR_MAP[status]}>{t(`screenings:status.${status}`)}</Tag>;
}

function ScreeningCaseSubtitle({ screening }: { screening: ContinuousScreening }) {
  const { t } = useTranslation(['continuousScreening', 'screeningTopics']);
  return (
    <h2 className="text-h2 text-grey-secondary">
      {match(screening)
        .when(isIndirectContinuousScreening, (indirectScreening) => {
          const queries = R.entries(indirectScreening.request.searchInput.queries).map(([key, value]) => value);
          if (!queries[0]) return null;

          const queryTopics = queries[0].properties['topics'];
          if (!queryTopics) return null;

          const category = getHigherCategory(queryTopics);
          if (!category) return null;

          return t(`continuousScreening:review.indirect_subtitle`, {
            category: t(`screeningTopics:${category}`),
          });
        })
        .when(isDirectContinuousScreening, (directScreening) => {
          let entityName = '';

          const queries = R.entries(directScreening.request.searchInput.queries).map(([key, value]) => value);
          if (queries[0]) {
            entityName = queries[0].properties['name']?.[0] ?? '';
          }

          return t(`continuousScreening:review.direct_subtitle.${screening.triggerType}`, {
            entityType: directScreening.objectType,
            name: entityName,
          });
        })
        .exhaustive()}
    </h2>
  );
}
