import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useState } from 'react';
import { match } from 'ts-pattern';
import { ButtonV2, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { InboxUserRow } from '../InboxUserRow';
import { AutoAssignmentPanelContent } from '../Panel/AutoAssignmentPanelContent';

const MAX_DISPLAYED_INBOXES = 3;

export const AutoAssignmentSection = () => {
  const inboxesQuery = useGetInboxesQuery();
  const { openPanel } = usePanel();
  const [expandedInboxIds, setExpandedInboxIds] = useState<string[]>([]);

  const handleOpenPanel = () => {
    openPanel(<AutoAssignmentPanelContent />);
  };

  const toggleInbox = (inboxId: string) => {
    setExpandedInboxIds((prev) => (prev.includes(inboxId) ? prev.filter((id) => id !== inboxId) : [...prev, inboxId]));
  };

  return (
    <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
      <div className="flex items-center gap-v2-md">
        <span className="flex-1 font-medium text-s">Auto-assignment activation by inbox</span>
        <Icon
          icon="edit"
          className="size-5 cursor-pointer text-purple-65 hover:text-purple-50"
          onClick={handleOpenPanel}
        />
      </div>
      <div className="flex flex-col gap-v2-sm">
        {match(inboxesQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center py-4">
              <Spinner className="size-6" />
            </div>
          ))
          .with({ isError: true }, () => <div className="text-s text-grey-50">Error loading inboxes</div>)
          .with({ isSuccess: true }, ({ data }) => {
            const inboxes = data?.inboxes ?? [];
            const displayedInboxes = inboxes.slice(0, MAX_DISPLAYED_INBOXES);
            const hasMore = inboxes.length > MAX_DISPLAYED_INBOXES;

            return (
              <>
                {displayedInboxes.map((inbox) => {
                  const isExpanded = expandedInboxIds.includes(inbox.id);
                  const hasUsers = inbox.users?.length > 0;

                  return (
                    <div key={inbox.id} className="flex flex-col gap-v2-sm">
                      <div className="flex items-center gap-v2-sm h-6">
                        <Icon
                          icon="arrow-down"
                          className={cn('size-5 text-purple-65', {
                            '-rotate-90': !isExpanded,
                            'cursor-pointer': hasUsers,
                            invisible: !hasUsers,
                          })}
                          onClick={hasUsers ? () => toggleInbox(inbox.id) : undefined}
                        />
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
                  <ButtonV2 variant="secondary" appearance="link" onClick={handleOpenPanel}>
                    Voir +
                  </ButtonV2>
                )}
              </>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
