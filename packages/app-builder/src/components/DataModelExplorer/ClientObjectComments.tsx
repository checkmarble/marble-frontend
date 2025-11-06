import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { type GroupedAnnotations } from 'marble-api';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, cn } from 'ui-design-system';

import { EventTime } from '../Cases/Events/Time';

type ClientObjectCommentsProps = {
  comments: GroupedAnnotations['comments'];
  className?: string;
};

function CommentItem({ comment }: { comment: GroupedAnnotations['comments'][number] }) {
  const { getOrgUserById } = useOrganizationUsers();
  const user = useMemo(
    () => (comment.annotated_by ? getOrgUserById(comment.annotated_by) : undefined),
    [comment.annotated_by, getOrgUserById],
  );

  return (
    <>
      <div>
        <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xs" color="grey" />
      </div>
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="text-xs">{comment.payload.text}</div>
        <span className="text-2xs text-grey-50 text-right">
          <EventTime time={comment.created_at} />
        </span>
      </div>
    </>
  );
}

export function ClientObjectComments({ comments, className }: ClientObjectCommentsProps) {
  const { t } = useTranslation(['cases', 'common']);
  const [expanded, setExpanded] = useState(false);
  const firstComment = comments[0];
  const lastComment = comments[comments.length - 1];

  return (
    <div className={cn('relative z-0 flex flex-col text-xs', className)}>
      <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
        <div className="bg-grey-90 -z-10 h-full w-px" />
      </div>
      <div className="grid grid-cols-[24px_1fr] gap-2">
        {comments.length > 2 && !expanded ? (
          <>
            {firstComment ? <CommentItem comment={firstComment} /> : null}
            <>
              <span></span>
              <button onClick={() => setExpanded(true)} className="text-left font-semibold underline">
                {t('cases:annotations.comments.see_others', { count: comments.length - 2 })}
              </button>
            </>
            {lastComment ? <CommentItem comment={lastComment} /> : null}
          </>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  );
}
