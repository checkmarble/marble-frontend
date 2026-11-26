import type { ScreeningMatchComment } from '@app-builder/models/screening';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Avatar, Tag } from 'ui-design-system';

export const CommentLine = ({ comment }: { comment: ScreeningMatchComment }) => {
  const { t } = useTranslation(['cases']);
  const formatDateTime = useFormatDateTime();
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(comment.authorId);
  const fullName = getFullName(user);

  return (
    <div key={comment.id} className="flex flex-col text-s gap-sm font-normal">
      <div className="flex items-center gap-xs">
        <Avatar size="xs" firstName={user?.firstName} lastName={user?.lastName} />
        <span className="flex items-baseline gap-xs">
          {fullName}
          <time className="text-grey-secondary text-xs" dateTime={comment.createdAt}>
            {formatDateTime(comment.createdAt, { dateStyle: 'short', timeStyle: 'short', fullYear: true })}
          </time>
        </span>
        {comment.tentativeReview ? (
          <Tag size="xs" color={comment.tentativeReview.supersededAt ? 'grey' : 'yellow'}>
            {comment.tentativeReview.supersededAt
              ? t('cases:tentative_review.marker_superseded', {
                  status: t(`cases:screening_review.decision.${comment.tentativeReview.status}`),
                })
              : t('cases:tentative_review.marker')}
          </Tag>
        ) : null}
      </div>
      <p>{comment.comment}</p>
    </div>
  );
};
