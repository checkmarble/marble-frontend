import {
  PanelContainer,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelOverlay,
  usePanel,
} from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useEditInboxUserAutoAssignMutation } from '@app-builder/queries/settings/inboxes/edit-inbox-user-auto-assign';
import { useUpdateInboxMutation } from '@app-builder/queries/settings/inboxes/update-inbox';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { InboxCard } from './InboxCard';

interface AutoAssignmentChanges {
  inboxes: Record<string, boolean>;
  users: Record<string, boolean>;
}

export const AutoAssignmentPanelContent = () => {
  const inboxesQuery = useGetInboxesQuery();
  const { closePanel } = usePanel();
  const queryClient = useQueryClient();
  const updateInboxMutation = useUpdateInboxMutation();
  const editUserMutation = useEditInboxUserAutoAssignMutation();

  const [changes, setChanges] = useState<AutoAssignmentChanges>({
    inboxes: {},
    users: {},
  });
  const [isSaving, setIsSaving] = useState(false);

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  const handleToggleInbox = (inboxId: string, checked: boolean) => {
    const inbox = inboxes.find((i) => i.id === inboxId);
    const originalValue = inbox?.autoAssignEnabled ?? false;

    setChanges((prev) => {
      const newInboxes = { ...prev.inboxes };
      if (checked === originalValue) {
        delete newInboxes[inboxId];
      } else {
        newInboxes[inboxId] = checked;
      }
      return { ...prev, inboxes: newInboxes };
    });
  };

  const handleToggleUser = (userId: string, checked: boolean) => {
    const user = inboxes.flatMap((i) => i.users).find((u) => u.id === userId);
    const originalValue = user?.autoAssignable ?? false;

    setChanges((prev) => {
      const newUsers = { ...prev.users };
      if (checked === originalValue) {
        delete newUsers[userId];
      } else {
        newUsers[userId] = checked;
      }
      return { ...prev, users: newUsers };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update inboxes
      const inboxPromises = Object.entries(changes.inboxes).map(([inboxId, autoAssignEnabled]) => {
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
      const userPromises = Object.entries(changes.users).map(([userId, autoAssignable]) => {
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

  const hasChanges = Object.keys(changes.inboxes).length > 0 || Object.keys(changes.users).length > 0;

  return (
    <PanelOverlay>
      <PanelContainer size="xxl">
        <PanelHeader>
          <div className="flex items-center gap-v2-sm">
            <Icon icon="left-panel-open" className="size-4" />
            <span>Auto-assignment activation by inbox</span>
          </div>
        </PanelHeader>
        <PanelContent>
          {match(inboxesQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ))
            .with({ isError: true }, () => <div className="text-s text-grey-50 py-4">Error loading inboxes</div>)
            .with({ isSuccess: true }, () => (
              <div className="flex flex-col gap-v2-md">
                {inboxes.map((inbox) => (
                  <InboxCard
                    key={inbox.id}
                    inbox={inbox}
                    inboxChecked={changes.inboxes[inbox.id]}
                    userCheckedMap={changes.users}
                    onToggleInbox={handleToggleInbox}
                    onToggleUser={handleToggleUser}
                  />
                ))}
              </div>
            ))
            .exhaustive()}
        </PanelContent>
        <PanelFooter>
          <ButtonV2
            size="default"
            className="w-full justify-center"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? <Icon icon="spinner" className="size-4 animate-spin" /> : 'Valider'}
          </ButtonV2>
        </PanelFooter>
      </PanelContainer>
    </PanelOverlay>
  );
};
