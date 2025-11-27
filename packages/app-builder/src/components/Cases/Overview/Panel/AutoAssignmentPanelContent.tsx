import { PanelContainer, PanelContent, PanelFooter, PanelOverlay, usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useEditInboxUserAutoAssignMutation } from '@app-builder/queries/settings/inboxes/edit-inbox-user-auto-assign';
import { useUpdateInboxMutation } from '@app-builder/queries/settings/inboxes/update-inbox';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { InboxCard } from './InboxCard';

interface AutoAssignmentChanges {
  inboxes: Map<string, boolean>;
  users: Map<string, boolean>;
}

export const AutoAssignmentPanelContent = () => {
  const inboxesQuery = useGetInboxesQuery();
  const { closePanel } = usePanel();
  const queryClient = useQueryClient();
  const updateInboxMutation = useUpdateInboxMutation();
  const editUserMutation = useEditInboxUserAutoAssignMutation();

  const [changes, setChanges] = useState<AutoAssignmentChanges>({
    inboxes: new Map(),
    users: new Map(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  const handleToggleInbox = useCallback(
    (inboxId: string, checked: boolean) => {
      const inbox = inboxes.find((i) => i.id === inboxId);
      const originalValue = inbox?.autoAssignEnabled ?? false;

      setChanges((prev) => {
        const newInboxes = new Map(prev.inboxes);
        if (checked === originalValue) {
          newInboxes.delete(inboxId);
        } else {
          newInboxes.set(inboxId, checked);
        }
        return { ...prev, inboxes: newInboxes };
      });
    },
    [inboxes],
  );

  const handleToggleUser = useCallback(
    (userId: string, checked: boolean) => {
      const user = inboxes.flatMap((i) => i.users).find((u) => u.id === userId);
      const originalValue = user?.autoAssignable ?? false;

      setChanges((prev) => {
        const newUsers = new Map(prev.users);
        if (checked === originalValue) {
          newUsers.delete(userId);
        } else {
          newUsers.set(userId, checked);
        }
        return { ...prev, users: newUsers };
      });
    },
    [inboxes],
  );

  const handleSave = async () => {
    const inboxes = inboxesQuery.data?.inboxes ?? [];
    setIsSaving(true);

    try {
      // Update inboxes
      const inboxPromises = Array.from(changes.inboxes.entries()).map(([inboxId, autoAssignEnabled]) => {
        const inbox = inboxes.find((i) => i.id === inboxId);
        if (!inbox) return Promise.resolve();

        return updateInboxMutation.mutateAsync({
          id: inboxId,
          name: inbox.name,
          escalationInboxId: inbox.escalationInboxId ?? null,
          autoAssignEnabled,
          redirectRoute: '/cases/overview',
        });
      });

      // Update users
      const userPromises = Array.from(changes.users.entries()).map(([userId, autoAssignable]) => {
        return editUserMutation.mutateAsync({
          id: userId,
          autoAssignable,
        });
      });

      await Promise.all([...inboxPromises, ...userPromises]);

      await queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });

      toast.success('Auto-assignment settings saved');
      closePanel();
    } catch {
      toast.error('Failed to save auto-assignment settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = changes.inboxes.size > 0 || changes.users.size > 0;

  return (
    <PanelOverlay>
      <PanelContainer size="xxl">
        <div className="flex items-center gap-v2-sm pb-4">
          <Icon icon="left-panel-open" className="size-4" />
          <h2 className="text-l font-semibold">Auto-assignment activation by inbox</h2>
        </div>
        <PanelContent>
          {match(inboxesQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ))
            .with({ isError: true }, () => <div className="text-s text-grey-50 py-4">Error loading inboxes</div>)
            .with({ isSuccess: true }, (query) => {
              const inboxes = query.data?.inboxes ?? [];

              return (
                <div className="flex flex-col gap-v2-md">
                  {inboxes.map((inbox) => (
                    <InboxCard
                      key={inbox.id}
                      inbox={inbox}
                      inboxChecked={changes.inboxes.get(inbox.id)}
                      userCheckedMap={changes.users}
                      onToggleInbox={handleToggleInbox}
                      onToggleUser={handleToggleUser}
                    />
                  ))}
                </div>
              );
            })
            .exhaustive()}
        </PanelContent>
        <PanelFooter>
          <Button className="w-full" onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? <Spinner className="size-4" /> : 'Valider'}
          </Button>
        </PanelFooter>
      </PanelContainer>
    </PanelOverlay>
  );
};
