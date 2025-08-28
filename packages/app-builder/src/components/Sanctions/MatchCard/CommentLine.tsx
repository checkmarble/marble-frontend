import { SanctionCheckMatch } from '@app-builder/models/sanction-check';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTimeString } from '@app-builder/utils/format';
import { Avatar } from 'ui-design-system';

export const CommentLine = ({ comment }: { comment: SanctionCheckMatch['comments'][number] }) => {
  const formatDateTime = useFormatDateTimeString();
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(comment.authorId);
  const fullName = getFullName(user);

  return (
    <div key={comment.id} className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Avatar size="xs" firstName={user?.firstName} lastName={user?.lastName} />
        <span className="flex items-baseline gap-1">
          {fullName}
          <time className="text-grey-50 text-xs" dateTime={comment.createdAt}>
            {formatDateTime(comment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
          </time>
        </span>
      </div>
      <p>{comment.comment}</p>
    </div>
  );
};
