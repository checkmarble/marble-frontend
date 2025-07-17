import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CaseCreatedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { TranslationObject } from '@app-builder/types/i18n';
import { useMemo } from 'react';
import { Trans } from 'react-i18next';
import { Icon } from 'ui-icons';

export const CaseCreatedDetail = ({
  event,
  translationObject,
}: {
  event: CaseCreatedEvent;
  translationObject: TranslationObject<['cases']>;
}) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { tCases } = translationObject;
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="case-manager" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={tCases}
          i18nKey="case_detail.history.event_detail.created_by"
          components={{ Actor: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Workflow' }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
