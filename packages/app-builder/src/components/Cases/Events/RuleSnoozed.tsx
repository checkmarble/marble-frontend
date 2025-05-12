import type { RuleSnoozeCreatedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import { EventTime } from './Time';

export const RuleSnoozeCreatedDetail = ({ event }: { event: RuleSnoozeCreatedEvent }) => {
  const { t } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="snooze" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.rule_snooze_created"
          components={{
            Actor: <span className="font-bold capitalize" />,
          }}
          values={{ actor: user ? getFullName(user) : 'Workflow' }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
