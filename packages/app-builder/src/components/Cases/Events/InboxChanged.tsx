import { casesI18n } from '@app-builder/components';
import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { Spinner } from '@app-builder/components/Spinner';
import { type InboxChangedEvent } from '@app-builder/models/cases';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Icon } from 'ui-icons';

export const InboxChangedDetail = ({ event }: { event: InboxChangedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(() => (event.userId ? getOrgUserById(event.userId) : undefined), [event.userId, getOrgUserById]);
  const inboxesQuery = useGetInboxesQuery();

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-primary size-3" />
      </div>
      <span className="text-grey-primary inline-flex h-full items-center whitespace-pre text-xs">
        {match(inboxesQuery)
          .with({ isPending: true }, () => <Spinner className="size-4" />)
          .with({ isError: true }, () => <div>{t('common:generic_fetch_data_error')}</div>)
          .with({ isSuccess: true }, ({ data }) => {
            const inboxName = data.inboxes.find((i) => i.id === event.newInboxId)?.name ?? 'Unknown';

            return (
              <Trans
                t={t}
                i18nKey="cases:case_detail.history.event_detail.inbox_changed"
                components={{
                  Style: <span className="font-bold capitalize" />,
                }}
                values={{
                  actor: user ? getFullName(user) : 'Marble',
                  inbox: inboxName,
                }}
              />
            );
          })
          .exhaustive()}
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
