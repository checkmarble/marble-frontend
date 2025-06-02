import { casesI18n } from '@app-builder/components';
import { EventTime } from '@app-builder/components/Cases/Events/Time';
import type { FileAddedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const FileAddedDetail = ({ event }: { event: FileAddedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.file_added"
          components={{
            Actor: <span className="font-bold capitalize" />,
            File: (
              <span className="border-grey-90 flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium" />
            ),
          }}
          values={{
            actor: user ? getFullName(user) : 'Marble',
            file: event.fileName,
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
