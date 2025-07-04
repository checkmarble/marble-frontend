import { OutcomeBadge } from '@app-builder/components/Decisions';
import { type DecisionReviewedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import { EventTime } from './Time';

export const DecisionReviewedDetail = ({ event }: { event: DecisionReviewedEvent }) => {
  const { t } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );
  const i18nKey = event.comment
    ? 'cases:case_detail.history.event_detail.decision_reviewed_with_comment'
    : 'cases:case_detail.history.event_detail.decision_reviewed';

  return (
    <div className="flex flex-col gap-2">
      <div key={event.id} className="flex w-full items-center gap-2">
        <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
          <Icon icon="manage-search" className="text-grey-00 size-3" />
        </div>
        <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
          <Trans
            t={t}
            i18nKey={i18nKey}
            components={{
              Actor: <span className="font-bold capitalize" />,
              Status: <OutcomeBadge outcome={event.status} />,
            }}
            values={{ actor: user ? getFullName(user) : 'Workflow' }}
          />
        </span>
        <EventTime time={event.createdAt} />
      </div>
      {event.comment && (
        <div className="flex items-start gap-2 ps-8">
          <Icon icon="comment" className="text-grey-00 size-3 shrink-0 mt-1" />
          <div className="text-grey-00 text-xs italic">{event.comment}</div>
        </div>
      )}
    </div>
  );
};
