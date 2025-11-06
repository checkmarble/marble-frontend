import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CommentAddedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { useMemo } from 'react';
import { Avatar, Markdown } from 'ui-design-system';

export const CommentAddedDetail = ({ event }: { event: CommentAddedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const user = useMemo(() => (event.userId ? getOrgUserById(event.userId) : undefined), [event.userId, getOrgUserById]);

  return (
    <div key={event.id} className="flex items-start gap-2">
      <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xxs" color="grey" />
      <span className="text-grey-00 whitespace-pre-wrap text-xs">
        <Markdown>{event.comment}</Markdown>
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
