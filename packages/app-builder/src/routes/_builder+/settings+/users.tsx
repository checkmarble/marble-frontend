import { CollapsiblePaper, Page } from '@app-builder/components';
import { isAdmin, type User } from '@app-builder/models';
import { CreateUser } from '@app-builder/routes/ressources+/settings+/users+/create';
import { DeleteUser } from '@app-builder/routes/ressources+/settings+/users+/delete';
import { UpdateUser } from '@app-builder/routes/ressources+/settings+/users+/update';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type InboxUserDto } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Table, useTable } from 'ui-design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient, organization, user } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: '/login',
    },
  );
  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const { inbox_users } = await apiClient.listAllInboxUsers();
  const org = await organization.getCurrentOrganization();

  return json({ inboxUsers: inbox_users, org, user });
}

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const { t } = useTranslation(['settings', 'cases']);
  const { inboxUsers, org, user } = useLoaderData<typeof loader>();
  const { orgUsers } = useOrganizationUsers();

  const inboxUsersByUserId = useMemo(
    () =>
      R.pipe(
        inboxUsers as InboxUserDto[],
        R.groupBy((user) => user.user_id),
        R.mapValues((value) =>
          R.pipe(
            value,
            R.groupBy((v) => v.role),
          ),
        ),
      ),
    [inboxUsers],
  );

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'name',
        header: t('settings:users.name'),
        size: 100,
      }),
      columnHelper.accessor((row) => row.email, {
        id: 'email',
        header: t('settings:users.email'),
        size: 100,
        cell: ({ getValue }) => (
          <div className="overflow-hidden text-ellipsis">{getValue()}</div>
        ),
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:users.role'),
        size: 100,
        cell: ({ getValue }) => t(tKeyForUserRole(getValue<User['role']>())),
      }),
      columnHelper.accessor((row) => row.userId, {
        id: 'inbox_user_role',
        header: t('settings:users.inbox_user_role'),
        size: 200,
        cell: ({ getValue }) => {
          const inboxUsers = inboxUsersByUserId[getValue<User['userId']>()];
          if (!inboxUsers) return null;
          return Object.keys(inboxUsers)
            .map((role) => {
              const count = inboxUsers[role].length;
              return t(tKeyForInboxUserRole(role), { count });
            })
            .join(', ');
        },
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        cell: ({ cell }) => {
          return (
            <div className="text-grey-00 group-hover:text-grey-100 flex gap-2">
              <UpdateUser user={cell.row.original} />
              <DeleteUser
                userId={cell.row.original.userId}
                currentUserId={user.actorIdentity.userId}
              />
            </div>
          );
        },
      }),
    ];
    return columns;
  }, [inboxUsersByUserId, t, user.actorIdentity.userId]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: orgUsers,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Content>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:users')}</span>
            <CreateUser orgId={org.id} />
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...getContainerProps()}>
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return (
                    <Table.Row
                      key={row.id}
                      tabIndex={0}
                      className={clsx('hover:bg-grey-02 cursor-pointer')}
                      row={row}
                    />
                  );
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}

const tKeyForUserRole = (role: User['role']) => {
  switch (role) {
    case 'ADMIN':
      return 'settings:users.role.admin';
    case 'PUBLISHER':
      return 'settings:users.role.publisher';
    case 'BUILDER':
      return 'settings:users.role.builder';
    case 'VIEWER':
      return 'settings:users.role.viewer';
    default:
      return 'settings:users.role.unknown';
  }
};

const tKeyForInboxUserRole = (role: string) => {
  switch (role) {
    case 'admin':
      return 'settings:users.inbox_user_role.admin_count';
    case 'member':
      return 'settings:users.inbox_user_role.member_count';
    default:
      return 'settings:users.inbox_user_role.unknown';
  }
};
