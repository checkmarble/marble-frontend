import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { match } from 'ts-pattern';
import { Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const AutoAssignmentSection = () => {
  const inboxesQuery = useGetInboxesQuery();

  return (
    <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
      <div className="flex items-center gap-4">
        <span className="flex-1 font-medium text-s">Auto-assignment activation by inbox</span>
        <button type="button" className="size-6 flex items-center justify-center text-purple-65" disabled>
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
                {displayedInboxes.map((inbox) => (
                  <div key={inbox.id} className="flex items-center gap-2 h-6">
                    <button type="button" className="size-6 flex items-center justify-center text-purple-65" disabled>
                      <Icon icon="arrow-down" className="size-4" />
                    </button>
                    <div className="flex-1 flex items-center gap-v2-xs">
                      <span className="text-s font-medium">{inbox.name}</span>
                      <Tag color="purple" size="small" border="rounded-sm">
                        {inbox.casesCount} cases
                      </Tag>
                    </div>
                    <div className="opacity-50">
                      <Switch checked={inbox.autoAssignEnabled} disabled />
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <button type="button" className="text-s text-purple-65 font-medium self-start" disabled>
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
