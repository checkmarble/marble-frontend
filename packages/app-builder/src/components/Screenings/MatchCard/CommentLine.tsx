import { type ContinuousScreeningMatchComment, tentativeReviewDecisionKeys } from '@app-builder/models/screening';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Avatar, Tag } from 'ui-design-system';

/**
 * Renders a decision or continuous screening comment; only the latter can carry a tentative review.
 * A comment's tentative review is a replaced one unless the caller marks it as the match's active review.
 */
export const CommentLine = ({
  comment,
  isActiveTentativeReview = false,
}: {
  comment: ContinuousScreeningMatchComment;
  isActiveTentativeReview?: boolean;
}) => {
  const { t } = useTranslation(['cases']);
  const formatDateTime = useFormatDateTime();
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(comment.authorId);
  const fullName = getFullName(user) || t('cases:case_detail.unknown_user');

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
          <Tag size="xs" color={isActiveTentativeReview ? 'yellow' : 'grey'}>
            {isActiveTentativeReview
              ? t('cases:tentative_review.marker')
              : t('cases:tentative_review.marker_superseded', {
                  status: t(tentativeReviewDecisionKeys[comment.tentativeReview.status]),
                })}
          </Tag>
        ) : null}
      </div>
      <p>{comment.comment}</p>
    </div>
  );
};
