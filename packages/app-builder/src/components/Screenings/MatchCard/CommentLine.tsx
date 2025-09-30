import { ScreeningMatch } from '@app-builder/models/screening';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { Avatar } from 'ui-design-system';

export const CommentLine = ({ comment }: { comment: ScreeningMatch['comments'][number] }) => {
  const language = useFormatLanguage();
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
            {formatDateTimeWithoutPresets(comment.createdAt, {
              language,
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </time>
        </span>
      </div>
      <p>{comment.comment}</p>
    </div>
  );
};
