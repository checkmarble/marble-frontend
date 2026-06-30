import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type InboxWithCasesCount } from '@app-builder/models/inbox';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useUpdateAutoAssignMutation } from '@app-builder/queries/cases/update-auto-assign';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { InboxCard } from './InboxCard';

interface AutoAssignmentChanges {
  inboxes: Record<string, boolean>;
  users: Record<string, boolean>;
}

interface AutoAssignmentPanelContentProps {
  currentUserId?: string;
  isGlobalAdmin: boolean;
  hasEntitlement: boolean;
}

export const AutoAssignmentPanelContent = ({
  currentUserId,
  isGlobalAdmin,
  hasEntitlement,
}: AutoAssignmentPanelContentProps) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['cases', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const updateAutoAssignMutation = useUpdateAutoAssignMutation();
  const revalidate = useLoaderRevalidator();

  const [changes, setChanges] = useState<AutoAssignmentChanges>({
    inboxes: {},
    users: {},
  });

  const allInboxes = inboxesQuery.data?.inboxes ?? [];

  // Check if user is a member of the inbox (any role)
  const isInboxMember = (inbox: InboxWithCasesCount) => inbox.users.some((u) => u.userId === currentUserId);

  // Check if user is admin of the inbox
  const isInboxAdmin = (inbox: InboxWithCasesCount) =>
    inbox.users.some((u) => u.userId === currentUserId && u.role === 'admin');

  // Can edit inbox if global admin OR inbox admin
  const canEditInbox = (inbox: InboxWithCasesCount) => hasEntitlement && (isGlobalAdmin || isInboxAdmin(inbox));

  // Global admin sees all inboxes, others see only their inboxes (where they are a member)
  const inboxes = isGlobalAdmin ? allInboxes : allInboxes.filter(isInboxMember);

  // Can save if user has entitlement and can edit at least one inbox
  const canSave = hasEntitlement && (isGlobalAdmin || inboxes.some(isInboxAdmin));

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

  const handleSave = () => {
    updateAutoAssignMutation.mutate(
      { inboxes: changes.inboxes, users: changes.users },
      {
        onSuccess: () => {
          toast.success(t('cases:overview.panel.auto_assignment.saved'));
          revalidate();
          panelSharp.actions.close();
        },
        onError: () => {
          toast.error(t('common:errors.unknown'));
        },
      },
    );
  };

  const hasChanges = Object.keys(changes.inboxes).length > 0 || Object.keys(changes.users).length > 0;

  return (
    <Panel.Container size="small">
      <Panel.Content>
        <Panel.Header>{t('cases:overview.panel.auto_assignment.title')}</Panel.Header>
        <div className="grow">
          {match(inboxesQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center py-xl">
                <Spinner className="size-8" />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="text-s text-grey-secondary py-sm">{t('cases:overview.config.error_loading')}</div>
            ))
            .with({ isSuccess: true }, () => (
              <div className="flex flex-col gap-md">
                {inboxes.map((inbox) => (
                  <InboxCard
                    key={inbox.id}
                    inbox={inbox}
                    inboxChecked={changes.inboxes[inbox.id]}
                    userCheckedMap={changes.users}
                    onToggleInbox={handleToggleInbox}
                    onToggleUser={handleToggleUser}
                    disabled={!canEditInbox(inbox)}
                  />
                ))}
              </div>
            ))
            .exhaustive()}
        </div>
        {canSave ? (
          <Panel.Footer>
            <Panel.FooterButton
              onClick={handleSave}
              disabled={!hasChanges}
              isLoading={updateAutoAssignMutation.isPending}
              label={t('cases:overview.validate')}
            />
          </Panel.Footer>
        ) : null}
      </Panel.Content>
    </Panel.Container>
  );
};
