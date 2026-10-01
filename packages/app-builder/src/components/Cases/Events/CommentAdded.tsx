import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CommentAddedEvent } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { useMemo } from 'react';
import { Trans } from 'react-i18next';
import { Avatar, Markdown } from 'ui-design-system';

export const CommentAddedDetail = ({
  event,
  currentInboxId,
  inboxes,
}: {
  event: CommentAddedEvent;
  currentInboxId: string;
  inboxes: Inbox[];
}) => {
  const { getOrgUserById } = useOrganizationUsers();
  const user = useMemo(() => (event.userId ? getOrgUserById(event.userId) : undefined), [event.userId, getOrgUserById]);
  const inboxName = event.inboxId === currentInboxId ? undefined : inboxes.find(({ id }) => id === event.inboxId)?.name;

  return (
    <div key={event.id} className="flex items-start gap-sm">
      <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xxs" color="grey" />
      <span className="text-grey-primary whitespace-pre-wrap text-xs">
        <Markdown>{event.comment}</Markdown>
      </span>
      <EventTime time={event.createdAt}>
        {inboxName ? (
          <Trans
            i18nKey="cases:case_detail.history.event_detail.comment_inbox"
            components={{ Inbox: <bdi dir="auto" className="text-grey-primary font-medium" /> }}
            values={{ inbox: inboxName }}
          />
        ) : null}
      </EventTime>
    </div>
  );
};
