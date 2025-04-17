import { casesI18n } from '@app-builder/components';
import { CaseTags } from '@app-builder/components/Cases/CaseTags';
import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CaseTagsUpdatedEvent } from '@app-builder/models/cases';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const TagsUpdatedDetail = ({ event }: { event: CaseTagsUpdatedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const { orgTags } = useOrganizationTags();

  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  //TODO: Remove when proper event is implemented
  const finalTags = useMemo(() => event.tagIds.filter((id) => id !== ''), [event.tagIds]);

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey={
            finalTags.length === 0
              ? 'cases:case_detail.history.event_detail.tags_removed'
              : 'cases:case_detail.history.event_detail.tags_updated'
          }
          components={{
            Actor: <span className="font-bold capitalize" />,
            Tags: <CaseTags caseTagIds={finalTags} orgTags={orgTags} />,
          }}
          values={{
            actor: user ? getFullName(user) : 'Workflow',
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
