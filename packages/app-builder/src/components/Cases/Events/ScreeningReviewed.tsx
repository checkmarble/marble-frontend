import { type ScreeningMatchReviewedEvent, type ScreeningReviewedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { Trans, useTranslation } from 'react-i18next';
import { Tag, type TagProps } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import { EventTime } from './Time';

const STATUS_COLORS: Record<ScreeningMatchReviewedEvent['status'], TagProps['color']> = {
  pending: 'grey',
  confirmed_hit: 'red',
  no_hit: 'green',
  skipped: 'grey',
};

function ScreeningReviewEvent({
  event,
  i18nKey,
}: {
  event: ScreeningMatchReviewedEvent | ScreeningReviewedEvent;
  i18nKey: string;
}) {
  const { t } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = event.userId ? getOrgUserById(event.userId) : undefined;
  return (
    <div key={event.id} className="flex w-full items-center gap-sm">
      <div className="bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="manage-search" className="text-grey-primary size-3" />
      </div>
      <span className="text-grey-primary inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey={i18nKey}
          components={{
            Actor: <span className="font-bold capitalize" />,
            Status: (
              <Tag size="xs" color={STATUS_COLORS[event.status]}>
                {t(`screenings:match.status.${event.status}`)}
              </Tag>
            ),
          }}
          values={{ actor: user ? getFullName(user) : 'Marble' }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
}

export function ScreeningMatchReviewedDetail({ event }: { event: ScreeningMatchReviewedEvent }) {
  return (
    <ScreeningReviewEvent event={event} i18nKey="cases:case_detail.history.event_detail.screening_match_reviewed" />
  );
}

export function ScreeningReviewedDetail({ event }: { event: ScreeningReviewedEvent }) {
  return <ScreeningReviewEvent event={event} i18nKey="cases:case_detail.history.event_detail.screening_reviewed" />;
}
