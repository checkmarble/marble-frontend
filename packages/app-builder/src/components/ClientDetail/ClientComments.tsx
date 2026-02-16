import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { GroupedAnnotations } from 'marble-api';
import { debounce } from 'radash';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Avatar, Button, cn, Markdown } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ClientCommentForm } from '../Annotations/ClientCommentForm';
import { EventTime } from '../Cases/Events/Time';
import { Spinner } from '../Spinner';

const MAX_EVENTS_BEFORE_DEBOUNCE = 60;
const EVENT_DELAY = 100;

type ClientCommentsProps = {
  objectType: string;
  objectId: string;
  annotationsQuery: UseQueryResult<{ annotations: GroupedAnnotations }, Error>;
  root: RefObject<HTMLElement>;
};

export const ClientComments = ({ objectType, objectId, annotationsQuery, root }: ClientCommentsProps) => {
  const { t } = useTranslation(['common']);
  const queryClient = useQueryClient();

  return (
    <div className="border-grey-border bg-surface-card flex flex-col rounded-v2-lg border overflow-hidden">
      <div className="p-4">
        {match(annotationsQuery)
          .with({ isPending: true }, () => (
            <div className="h-20 flex items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="h-20 flex items-center justify-center">
              <span className="text-center">{t('common:generic_fetch_data_error')}</span>
            </div>
          ))
          .with({ isSuccess: true }, ({ data }) => <Comments comments={data.annotations.comments} root={root} />)
          .exhaustive()}
      </div>
      <div className="border-t border-grey-border">
        <ClientCommentForm
          tableName={objectType}
          objectId={objectId}
          onAnnotateSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['annotations', objectType, objectId] });
          }}
          className="rounded-t-none"
        />
      </div>
    </div>
  );
};

type CommentsProps = {
  comments: GroupedAnnotations['comments'];
  root: RefObject<HTMLElement>;
};

const Comments = ({ comments: _comments, root }: CommentsProps) => {
  const comments = useMemo(() => _comments.toReversed(), [_comments]);
  const { t } = useTranslation(['common']);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [olderCommentCount, setOlderCommentCount] = useState(0);
  const [newerCommentCount, setNewerCommentCount] = useState(0);
  const { getOrgUserById } = useOrganizationUsers();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const items = Array.from(container.children);

    let callback = () => {
      // Reset counts
      let itemsBeforeVisible = 0;
      let itemsAfterVisible = 0;

      // Check each item's position relative to container
      // TODO: Improve this to use intersection observer
      for (const item of items) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom + (root.current?.scrollTop ?? 0) < containerRect.top) {
          itemsBeforeVisible++;
        } else if (itemRect.top + (root.current?.scrollTop ?? 0) > containerRect.bottom) {
          itemsAfterVisible++;
        }
      }

      setNewerCommentCount(itemsBeforeVisible);
      setOlderCommentCount(itemsAfterVisible);
    };

    if (comments.length > MAX_EVENTS_BEFORE_DEBOUNCE) {
      callback = debounce({ delay: EVENT_DELAY }, callback);
    }

    callback();

    container.addEventListener('scroll', callback);

    return () => container.removeEventListener('scroll', callback);
  }, [comments]);

  return (
    <div className="relative z-0 flex w-full flex-col gap-3">
      {comments.length > 0 ? (
        <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
          <div className="bg-grey-border -z-10 h-full w-px" />
        </div>
      ) : null}
      <div className="bg-surface-card sticky left-0 top-0 z-[-15] flex w-full items-center justify-between pl-6">
        <span className="text-grey-secondary text-small">
          {t('cases:investigation.more_recent', { number: newerCommentCount })}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
            <Icon icon={showAll ? 'eye-slash' : 'eye'} className="size-3.5" />
            {showAll ? t('common:collapse') : t('common:expand')}
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-3 overflow-x-hidden', {
          'max-h-[400px] overflow-y-scroll': !showAll,
        })}
      >
        {comments.map((comment) => {
          const user = getOrgUserById(comment.annotated_by);
          return (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xxs" color="grey" />
              <span className="text-grey-primary whitespace-pre-wrap text-xs">
                <Markdown>{comment.payload.text}</Markdown>
              </span>
              <EventTime time={comment.created_at} />
            </div>
          );
        })}
      </div>
      {showAll ? null : (
        <span
          className={cn('bg-surface-card text-grey-secondary sticky left-0 top-0 z-[-15] pl-6 text-xs', {
            'text-grey-white': showAll,
          })}
        >
          {comments.length === 0 || olderCommentCount === 0
            ? t('cases:investigation.no_older')
            : t('cases:investigation.older', { number: olderCommentCount })}
        </span>
      )}
    </div>
  );
};
