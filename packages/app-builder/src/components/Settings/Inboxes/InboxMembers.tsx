import { CreateInboxUserContent } from '@app-builder/components/Settings/Inboxes/CreateInboxUser';
import { DeleteInboxUserContent } from '@app-builder/components/Settings/Inboxes/DeleteInboxUser';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Inbox, type InboxUser, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { useEditInboxUserAutoAssignMutation } from '@app-builder/queries/settings/inboxes/edit-inbox-user-auto-assign';
import { useUpdateInboxUserMutation } from '@app-builder/queries/settings/inboxes/update-inbox-user';
import { type getInboxUserRoles, isAccessible } from '@app-builder/services/feature-access';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { createColumnHelper } from '@tanstack/react-table';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, type MarbleTableFeatures, MenuCommand, Modal, Switch, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

const columnHelper = createColumnHelper<MarbleTableFeatures, InboxUser>();

export function InboxMembers({
  inbox,
  inboxUserRoles,
  userRolesAccess,
  isAutoAssignmentAvailable,
}: {
  inbox: Inbox;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  userRolesAccess: FeatureAccessLevelDto;
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);
  const { getOrgUserById } = useOrganizationUsers();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.userId, {
        id: 'member',
        header: t('settings:inboxes.inbox_details.members'),
        size: 200,
        cell: ({ getValue }) => {
          const user = getOrgUserById(getValue());
          return (
            <div className="flex items-center gap-sm">
              <Avatar size="s" color="grey" firstName={user?.firstName} lastName={user?.lastName} />
              <span className="truncate">{getFullName(user)}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:inboxes.inbox_details.role'),
        size: 150,
        cell: ({ row }) =>
          isAccessible(userRolesAccess) ? (
            <InboxUserRoleSelect inboxUser={row.original} inboxUserRoles={inboxUserRoles} />
          ) : (
            t(tKeyForInboxUserRole(row.original.role))
          ),
      }),
      ...(isAutoAssignmentAvailable
        ? [
            columnHelper.accessor((row) => row.autoAssignable, {
              id: 'autoAssignable',
              header: t('settings:inboxes.inbox_details.auto_assign_enabled.label'),
              size: 150,
              cell: ({ row }) => <InboxUserAutoAssignSwitch inboxUser={row.original} />,
            }),
          ]
        : []),
      columnHelper.display({
        id: 'actions',
        size: 50,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DeleteInboxUserButton inboxUser={row.original} />
          </div>
        ),
      }),
    ];
  }, [getOrgUserById, inboxUserRoles, isAutoAssignmentAvailable, t, userRolesAccess]);

  const table = useTable({
    data: inbox.users,
    columns,
    columnResizeMode: 'onChange',
    enableSorting: false,
  });

  return (
    <SettingCard
      table={table}
      addButton={
        <AddInboxUserButton
          inbox={inbox}
          inboxUserRoles={inboxUserRoles}
          userRolesAccess={userRolesAccess}
          isAutoAssignmentAvailable={isAutoAssignmentAvailable}
        />
      }
    />
  );
}

function AddInboxUserButton({
  inbox,
  inboxUserRoles,
  userRolesAccess,
  isAutoAssignmentAvailable,
}: {
  inbox: Inbox;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  userRolesAccess: FeatureAccessLevelDto;
  isAutoAssignmentAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);
  const { orgUsers } = useOrganizationUsers();
  const [open, setOpen] = useState(false);
  const nonInboxUsers = orgUsers.filter((user) => !inbox.users.some((u) => u.userId === user.userId));

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="primary" appearance="stroked" className="whitespace-nowrap">
          <Icon icon="plus" className="size-4" />
          {t('settings:inboxes.inbox_details.add_member.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content aria-describedby={undefined}>
        <CreateInboxUserContent
          currentInboxId={inbox.id}
          users={nonInboxUsers}
          inboxUserRoles={inboxUserRoles}
          access={userRolesAccess}
          isAutoAssignmentAvailable={isAutoAssignmentAvailable}
          onSuccess={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function InboxUserRoleSelect({
  inboxUser,
  inboxUserRoles,
}: {
  inboxUser: InboxUser;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(inboxUser.role);
  const updateInboxUserMutation = useUpdateInboxUserMutation();
  const revalidate = useLoaderRevalidator();

  const handleSelect = (newRole: ReturnType<typeof getInboxUserRoles>[number]) => {
    setOpen(false);
    if (newRole === role) return;

    setRole(newRole);
    updateInboxUserMutation
      .mutateAsync({
        id: inboxUser.id,
        role: newRole,
        autoAssignable: inboxUser.autoAssignable,
      })
      .then(() => revalidate())
      .catch(() => {
        setRole(inboxUser.role);
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <div className="w-full max-w-40 [&_svg]:opacity-0 group-hover/row:[&_svg]:opacity-100 focus-within:[&_svg]:opacity-100">
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton
            size="medium"
            className="w-full border-transparent bg-transparent group-hover/row:border-grey-border group-hover/row:bg-surface-card focus-visible:border-grey-border"
          >
            {t(tKeyForInboxUserRole(role))}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content align="start" sameWidth sideOffset={4}>
          <MenuCommand.List>
            {inboxUserRoles.map((inboxUserRole) => (
              <MenuCommand.Item key={inboxUserRole} value={inboxUserRole} onSelect={() => handleSelect(inboxUserRole)}>
                {t(tKeyForInboxUserRole(inboxUserRole))}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}

function InboxUserAutoAssignSwitch({ inboxUser }: { inboxUser: InboxUser }) {
  const { t } = useTranslation(['common']);
  const [checked, setChecked] = useState(inboxUser.autoAssignable);
  const editAutoAssignMutation = useEditInboxUserAutoAssignMutation();
  const revalidate = useLoaderRevalidator();

  const handleChange = (value: boolean) => {
    setChecked(value);
    editAutoAssignMutation
      .mutateAsync({ id: inboxUser.id, autoAssignable: value })
      .then(() => revalidate())
      .catch(() => {
        setChecked(!value);
        toast.error(t('common:errors.unknown'));
      });
  };

  return <Switch checked={checked} onCheckedChange={handleChange} />;
}

function DeleteInboxUserButton({ inboxUser }: { inboxUser: InboxUser }) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          variant="secondary"
          appearance="stroked"
          mode="icon"
          aria-label={t('settings:inboxes.inbox_user.delete')}
          className="opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
        >
          <Icon icon="delete" className="size-4" />
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeleteInboxUserContent inboxUser={inboxUser} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}
