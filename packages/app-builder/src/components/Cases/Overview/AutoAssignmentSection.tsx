import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useState } from 'react';
import { match } from 'ts-pattern';
import { cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { InboxUserRow } from './InboxUserRow';
import { AutoAssignmentPanelContent } from './Panel/AutoAssignmentPanelContent';

export const AutoAssignmentSection = () => {
  const inboxesQuery = useGetInboxesQuery();
  const { openPanel } = usePanel();
  const [expandedInboxIds, setExpandedInboxIds] = useState<Set<string>>(new Set());

  const toggleInbox = (inboxId: string) => {
    setExpandedInboxIds((prev) => {
      const next = new Set(prev);
      if (next.has(inboxId)) {
        next.delete(inboxId);
      } else {
        next.add(inboxId);
      }
      return next;
    });
  };

  return (
    <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
      <div className="flex items-center gap-4">
        <span className="flex-1 font-medium text-s">Auto-assignment activation by inbox</span>
        <button
          type="button"
          className="size-6 flex items-center justify-center text-purple-65 hover:text-purple-50"
          onClick={() => openPanel(<AutoAssignmentPanelContent />)}
        >
          <Icon icon="edit" className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-v2-sm">
        {match(inboxesQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center py-4">
              <Spinner className="size-6" />
            </div>
          ))
          .with({ isError: true }, () => <div className="text-s text-grey-50">Error loading inboxes</div>)
          .with({ isSuccess: true }, (query) => {
            const inboxes = query.data?.inboxes ?? [];
            const displayedInboxes = inboxes.slice(0, 3);
            const hasMore = inboxes.length > 3;

            return (
              <>
                {displayedInboxes.map((inbox) => {
                  const isExpanded = expandedInboxIds.has(inbox.id);
                  const hasUsers = inbox.users && inbox.users.length > 0;

                  return (
                    <div key={inbox.id} className="flex flex-col gap-v2-sm">
                      <div className="flex items-center gap-2 h-6">
                        {hasUsers ? (
                          <button
                            type="button"
                            className="size-6 flex items-center justify-center text-purple-65"
                            onClick={() => toggleInbox(inbox.id)}
                          >
                            <Icon icon="arrow-down" className={cn('size-4', { 'rotate-180': isExpanded })} />
                          </button>
                        ) : (
                          <div className="size-6" />
                        )}
                        <div className="flex-1 flex items-center gap-v2-xs">
                          <span className="text-s">{inbox.name}</span>
                          <Tag color="purple" size="small" border="rounded-sm">
                            {inbox.casesCount} cases
                          </Tag>
                        </div>
                        <Tag color={inbox.autoAssignEnabled ? 'green' : 'grey'} size="small" border="rounded-sm">
                          {inbox.autoAssignEnabled ? 'Active' : 'Disabled'}
                        </Tag>
                      </div>
                      {isExpanded && hasUsers && (
                        <div className="flex flex-col gap-v2-sm">
                          {inbox.users.map((user) => (
                            <InboxUserRow key={user.id} user={user} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {hasMore && (
                  <button
                    type="button"
                    className="text-s text-grey-50 font-medium self-start hover:text-grey-00"
                    onClick={() => openPanel(<AutoAssignmentPanelContent />)}
                  >
                    Voir +
                  </button>
                )}
              </>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
